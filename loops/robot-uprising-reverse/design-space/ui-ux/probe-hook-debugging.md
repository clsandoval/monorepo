# 4.15 — The Probe Hook as First-Class Debugging Primitive

## The Option

Probe hooks are Robot Uprising's built-in instrumentation system — diagnostic hooks that capture detailed state snapshots without affecting gameplay. They transform debugging from "guess what went wrong" to "capture what will happen" — shifting the diagnostic mindset from reactive to proactive. The probe hook is designed as a first-class game mechanic with real costs, meaningful tradeoffs, and a lifecycle that teaches the engineering practice of observability.

### Anatomy of a Probe Hook

A probe hook is a special hook that occupies one hook slot on a unit's blueprint. When equipped, it fires at every tick during execution and captures a state snapshot of the unit's internals. The probe produces no signals, emits no EM, and doesn't appear in the signal chain visualization during Sealed Watch. It is invisible during gameplay and visible only in the Inspector debrief.

**What a probe captures (per tick):**

- **Context window state**: All slots — content, content type (observation/signal/command), source unit, age (ticks since arrival), and whether the entry was referenced by any rule evaluation this tick
- **Rule evaluation trace**: For every rule in the unit's priority list — did the condition match? Which context entries were consulted? Was the rule preempted by a higher-priority rule? What action would have been taken?
- **Hook trigger log**: Every hook on this unit — did the trigger condition fire? If so, what payload was generated, to which channel, and was delivery successful or dropped?
- **Action taken**: The final action the unit performed this tick, with the complete causal chain from context entry → rule match → action selection
- **EM emission**: The unit's EM contribution this tick (hook transmissions + passive emission)

This is significantly more data than the basic Inspector provides. The Inspector shows context window state and rule evaluation for a selected tick when the player clicks a unit. The probe captures this for EVERY tick automatically, enabling temporal analysis that click-by-click inspection can't provide.

### The Hook Slot Cost: "The Oscilloscope Tax"

Probes cost one hook slot. This is the game's most important diagnostic design decision. Hook slots are scarce (Scout: 2, Striker: 2, Relay: 4, Specialist: 2, Command: 6). Using one for a probe means:

- A Scout with a probe has only 1 hook slot remaining — it can participate in one channel, not two
- A Striker with a probe loses half its communication capability
- A Relay with a probe drops from 4 channels to 3 — still functional but with reduced throughput
- A Command agent with a probe retains 5 slots — the most affordable diagnostic investment

This cost structure mirrors real engineering: instrumenting a lightweight service (microservice with limited connections) is proportionally more expensive than instrumenting a heavyweight orchestrator (monolith with many interfaces). The player learns that **observability has a resource cost** and must be budgeted strategically.

**The deliberate teaching moment**: When a player first places a probe on a Scout and realizes they've lost a hook slot, they experience the same tradeoff that production engineers face: "Do I add this Datadog custom metric, knowing it'll consume CPU/memory?" The game makes the tradeoff visceral — the empty hook slot is visually present on the blueprint (a dashed outline where a channel connection could go), a constant reminder of what was traded for diagnostic capability.

### Probe Lifecycle: Create, Execute, Read, Remove

**1. Create (Plan Screen)**
Each configurable element in the workbench blueprint has a small magnifying glass icon — 12px, rendered at 30% opacity by default, brightening to 60% on hover. Clicking the icon activates the probe: the magnifying glass fills to 100% opacity, gains a teal glow, and a gentle breathing animation (0.8s cycle) begins. A confirmation tooltip appears: "Probe active. Will capture [element] state every tick. Cost: 1 hook slot."

The probe is visually attached to its target element — a thin teal line connects the magnifying glass to the hook slot it's consuming, making the cost relationship explicit. If the player hovers the hook slot, the tooltip reads: "Occupied by probe. Remove probe to use this slot for a channel hook."

**2. Execute (Sealed Watch)**
During Sealed Watch, probes are invisible. The unit behaves identically to an unprobed configuration (minus the lost hook slot). No overlay, no indicator, no visual change. This preserves the sealed watch's emotional purity — the player watches their architecture execute without diagnostic distraction. The probe is silently recording.

**3. Read (Inspector Debrief)**
In Act 2, probed units gain a special "Probe Log" tab in the Inspector sidebar. The Probe Log is a dense diagnostic panel showing the captured data in three views:

**Timeline View** — A horizontal scrollbar spanning all ticks. Each tick is a column showing a compressed summary: context window fill level (colored bar), rule match result (green dot = match, grey dot = no match, red dot = match but overridden), action taken (small icon). The player scrubs through the timeline to find anomalous ticks — a sudden color change, a red dot, a fill-level spike.

**Heatmap View** — A grid where rows are context window slots and columns are ticks. Each cell is colored by content type (green = observation, cyan = signal, amber = command, grey = empty). The heatmap reveals temporal patterns: "slot 3 cycles between observation and empty every 4 ticks" or "slots 5-8 fill simultaneously at tick 12 and stay filled — something flooded the buffer."

**Snapshot View** — Clicking any tick in the timeline or heatmap opens a detailed snapshot: full context window contents (not just fill level but actual data), complete rule evaluation trace (every rule, every condition, every consulted entry), and all hook trigger events. This is the most detailed diagnostic data available anywhere in the game.

**4. Remove (Plan Screen)**
After reading probe data, the player returns to the Plan screen. If the diagnostic question is answered, they click the magnifying glass icon again to deactivate the probe. The icon fades from 100% to 30% opacity, the teal glow extinguishes, and the hook slot becomes available. A brief "click" sound — like unplugging a diagnostic cable — confirms the removal.

The removal step is deliberately manual. The game does NOT auto-remove probes between missions. If the player forgets, the probe persists, consuming the hook slot in subsequent executions. This teaches the real engineering practice of "don't leave debug logging in production" — probes are temporary instruments, not permanent fixtures. The Blueprint Codex entry for probes explicitly states: "Probes are diagnostic tools, not operational equipment. Remove after use to restore full capability."

### Auto-Strip Before Gauntlet Deploy

When a configuration is submitted to the Gauntlet competitive queue, all probes are automatically stripped. The submission dialog shows: "2 probes detected. Probes will be removed before deployment. 2 hook slots will be freed." The freed slots remain empty — the game does NOT auto-fill them, because the player should decide what to do with the recovered capacity.

This auto-strip serves three purposes:
1. **Competitive fairness**: No player should waste hook slots on diagnostics in ranked play
2. **Teaching deployment discipline**: The separation between "debug build" and "release build" is a fundamental software engineering concept
3. **Preventing the "forgot to remove" disaster**: A player who submits their probed configuration would lose Elo because of reduced hook capacity, which would feel unfair rather than educational

The auto-strip animation: each probe's magnifying glass icon dissolves in sequence (left to right across the blueprint, 200ms per probe, with a soft descending chime). The hook slots flash briefly teal as they're freed. The visual communicates "your instruments have been packed away for deployment."

### Probe Suggestions: The Diagnostic Prompt System

The game actively suggests probe placements at three touchpoints:

**1. Inspector "Blind Spot" Prompts**
When the player is examining a unit in the Inspector and encounters a diagnostic dead end — e.g., a context window entry that influenced a decision but the player can't determine where it came from — a subtle tooltip appears: "Want to capture more detail? [Place a probe →]" Clicking the prompt opens the Plan screen with the relevant blueprint focused and the probe icon highlighted.

**2. Pre-Ranking Transparency Panel (4.58)**
When the Fix Explorer identifies a high-volatility or high-pivot-activity element, the transparency panel surfaces a one-click action: "Add probe hook to capture [ELEMENT] state in next match →" This converts a passive analytical finding into an active diagnostic step.

**3. Signal Genealogy Broken-Edge (4.105/4.109)**
When the signal genealogy shows a broken edge (dropped signal due to full context window), the sub-panel offers: "STRIKER-A dropped signal S-08. Add a probe to STRIKER-A to capture its buffer state at next match →" This extends probe suggestions to the most specific diagnostic surface in the game.

These suggestions are contextual, appearing only when the player is already engaged in diagnosis. They never appear unsolicited. The game trusts the player to decide when to instrument — it just makes the option visible at the right moment.

### Probe Budget: The Slot Economy

**Early game (M1-4)**: Probes are unavailable. The Inspector provides sufficient diagnostics for simple architectures.

**Mid game (M5-6)**: Probes unlock. The boot log introduces them: "DIAGNOSTIC SUBSYSTEM: ONLINE. You may now attach observation hooks to your agents' cognitive processes. Each probe occupies one hook slot. Recommendation: instrument the agent you understand least." The player has 2-4 units with a total of 8-12 hook slots; probing one unit consumes 1 slot (8-12% of total capacity).

**Late game (M7-10)**: Larger architectures (5-8 units, 16-28 hook slots). Probing one unit costs 4-6% of total capacity — increasingly affordable. Players may run 2-3 simultaneous probes across different units to capture cross-unit behavior.

**Gauntlet (competitive)**: Auto-stripped on deployment. Players use probes in practice matches against ghost opponents or in the Red Team sandbox, then strip before competitive submission. The practice-to-production diagnostic cycle becomes habitual.

### Cross-Match Probe Comparison

When the same probe configuration persists across 3+ matches (same unit type, same probe target), the Probe Log gains a **Comparison Mode**: three columns side by side, one per match, synchronized by tick number. Differences between columns are highlighted — a context slot that was empty in 2 matches but full in the third gets an amber border. This teaches the engineering concept of "regression analysis" — comparing system behavior across runs to isolate variables.

## Player Journeys

#### Journey: Tomás, 16, Silver III, first encounter with probes in Mission 5

**Context:** Mission 5 has just introduced the factory. Tomás has built his first multi-unit architecture: 2 Scouts, 1 Relay, 1 Striker. His architecture works but he's losing one Scout consistently — it overloads around tick 12 and gets eliminated while stunned.

**Minute 0:00 — The Dead End**
Tomás opens the Inspector after his third failed attempt. He clicks Scout-A at tick 12 — the tick where it overloads. The Inspector shows the context window: 6/6 slots filled. One observation, two incoming signals from the Relay, one broadcast from Scout-B, two terrain observations. The context is full, a new signal arrives, the oldest entry is evicted... but the evicted entry was the enemy position observation that Scout-A needed for its evade rule.

Tomás understands the immediate cause: the Scout's context window is full and the wrong entry got evicted. But he doesn't understand the temporal dynamics — how did 6 slots fill up so fast? The Inspector shows tick 12's state but not the buildup.

**Minute 0:30 — The Prompt**
A tooltip appears next to the context window display: "This unit's context window was full at this tick. Want to see how it filled up? [Place a probe →]"

Tomás clicks the prompt. The Plan screen opens with Scout-A's blueprint focused. The magnifying glass icon next to the context window configuration pulses gently. A tooltip explains: "Probe: captures context window state every tick during execution. Cost: 1 hook slot."

Tomás looks at Scout-A's 2 hook slots. Slot 1 is used for the "alert" channel (broadcasting enemy sightings). Slot 2 is used for "relay-in" (receiving processed data from the Relay). If he places a probe, he must remove one of these hooks.

**Minute 1:00 — The Tradeoff Decision**
"If I remove 'relay-in,' Scout-A won't receive processed intelligence from the Relay — but I'll see what's filling its buffer."

He removes the relay-in hook and places the probe. Scout-A now has: Slot 1 = alert hook (outgoing), Slot 2 = probe (diagnostic). No incoming signals.

He executes. During Sealed Watch, nothing looks different — the probe is invisible. Scout-A behaves differently (no relay data), but the match runs.

**Minute 2:00 — The Revelation**
In the Inspector, Tomás opens Scout-A's new "Probe Log" tab. The heatmap view appears: rows = 6 context slots, columns = 30 ticks. He immediately sees the pattern:

- Ticks 1-4: Slot 1 fills with a terrain observation. Slot 2 fills with a terrain observation. Slots 3-6 empty.
- Tick 5: Slots 3-4 fill with patrol observations (Scout-A sees open tiles while moving).
- Tick 6: Slot 5 fills with an enemy sighting. Slot 6 fills with another enemy sighting (Scout-A sees two enemies at once).
- Tick 7-8: Slots 1-2 get evicted and replaced with new patrol observations. The enemy sightings in slots 5-6 are preserved (they're newer).
- Tick 9-10: More patrol observations fill slots 1-4. The context window is now 6/6 with 4 patrol observations and 2 enemy sightings.
- Tick 11: A new patrol observation arrives. Eviction: slot 5's enemy sighting (oldest) is removed. Replaced with patrol data.
- Tick 12: Another patrol observation. Eviction: slot 6's last enemy sighting removed. Now Scout-A has zero enemy data and 6 patrol observations.

"The PATROL is filling up the buffer!" Tomás exclaims. "The Scout sees an empty tile every tick it moves, and each observation goes into the buffer. The enemy sightings get pushed out by useless patrol data."

**Minute 3:00 — The Fix**
Tomás returns to the Plan screen. He removes the probe (click magnifying glass, "click" sound, icon fades). He restores the relay-in hook to Slot 2. Then he modifies the Scout's context config: set "terrain observation" to LOW eviction priority, set "enemy observation" to HIGH eviction priority. Now terrain observations are evicted first, enemy sightings persist.

He re-executes. Scout-A's context window still fills up by tick 10, but the enemy sightings persist in slots 5-6 while terrain observations cycle through slots 1-4. The evade rule fires at tick 12 because the enemy position data is still in context. Scout-A evades. The mission succeeds.

Tomás didn't just fix the bug — he learned the concept of **observation priority**, which maps directly to log-level prioritization in real engineering systems (INFO-level logs evicted before ERROR-level logs when disk fills up).

**UI Annotations:**
- Probe Log tab: appears in Inspector sidebar only for probed units, teal magnifying glass icon on tab
- Heatmap: 400px wide, 180px tall (6 rows x 30 columns), 1px white grid lines, cells colored by content type
- Eviction event: cell border flashes red for 300ms, replaced content slides in from right
- "Place a probe" tooltip: appears near context window display, teal text on dark background, arrow icon linking to Plan screen

#### Journey: Dr. Amara, 38, ML researcher, Diamond II Gauntlet player

**Context:** Preparing for a Gauntlet match. Amara has a stable architecture she's been iterating on for 3 weeks. She wants to understand why her Relay-B occasionally overloads on the Bohol Chocolate Hills map.

**Minute 0:00 — The Targeted Probe**
Amara opens Relay-B's blueprint. 4 hook slots: channel-1 (scout input), channel-2 (striker output), channel-3 (command link), and channel-4 (emergency broadcast). She can't afford to lose any of these channels for competitive play.

But this is a practice match against a ghost opponent. She temporarily removes channel-4 (emergency broadcast — rarely fires) and places a probe. The blueprint now shows: 3 operational hooks + 1 probe.

She runs 3 practice matches on Bohol Chocolate Hills, keeping the probe active for all three. After each match, she glances at the Probe Log but saves detailed analysis for after the third match.

**Minute 3:00 — The Cross-Match Comparison**
After match 3, Amara opens the Probe Log in Comparison Mode. Three columns appear — one per match — showing the context window heatmap for all 3 matches, synchronized by tick. She scrubs to tick 18-22 (the typical overload window).

- Match 1: Relay-B overloads at tick 20. Heatmap shows all 12 slots filled by tick 18, with 8 slots containing scout observations from channel-1 and 4 slots containing command instructions from channel-3. No free slots for incoming tick-19 scout data.
- Match 2: No overload. Heatmap shows 10/12 slots at tick 18 — similar pattern but 2 slots were freed by successful eviction at tick 17.
- Match 3: Overload at tick 21. Heatmap shows 12/12 at tick 19, but the composition is different — 6 scout observations, 4 command instructions, and 2 stale "terrain" entries that should have been evicted.

The cross-match comparison reveals: the overload happens when stale terrain observations accumulate in slots that should be free. In Match 2 (no overload), the eviction policy cleared terrain observations at tick 17. In Matches 1 and 3, terrain observations had higher age but also higher content priority (they were tagged as "obstacle position" which the relay's eviction config treated as HIGH priority).

"The obstacle data is getting HIGH eviction priority because I never configured terrain subtypes," Amara says. "It's treating 'obstacle at C4' the same as 'enemy at C4' because both are tagged as 'position' data."

**Minute 5:00 — The Architecture Fix**
Amara modifies Relay-B's context config: create a separate eviction tier for terrain/obstacle observations (LOW priority) vs. enemy/signal observations (HIGH priority). She removes the probe, restores channel-4, and runs 3 more practice matches. No overloads in any of them.

She then submits the updated configuration to the Gauntlet queue. The auto-strip dialog confirms: "0 probes detected. Configuration ready for deployment." She smiles — probe already removed manually. Good diagnostic hygiene.

**UI Annotations:**
- Comparison Mode: three 300px columns side by side, scroll-locked together, tick cursor synchronized
- Amber highlight: cells where content differs across matches get a 2px amber border
- Overload tick: row highlighted in red across all columns where it occurs, with "OVERLOAD" label

#### Journey: Kai, 11, first-timer, accidentally discovers probes through curiosity in Mission 5

**Context:** Kai has been clicking every icon in the workbench, exploring the interface. He's on Mission 5 and has just noticed small magnifying glass icons he hasn't clicked before.

**Minute 0:00 — The Accidental Click**
Kai is configuring his Scout blueprint. He notices a tiny grey magnifying glass next to the context window section. He clicks it because he clicks everything. The icon brightens and starts glowing. A tooltip appears: "Probe active. Will capture context window state every tick. Cost: 1 hook slot."

"What's a probe?" Kai asks his mom (Zara, Diamond I). She explains: "It's like attaching a camera to your robot's brain. You'll see everything it thinks during the match. But it uses up one of your connection slots."

Kai looks at his Scout. It has 2 hook slots — one for "danger" (alerts), one unused. The probe goes into the unused slot. "That's fine, I wasn't using it anyway."

**Minute 0:30 — The Execution**
Sealed Watch. Nothing unusual. Kai's Scout patrols, spots enemies, broadcasts on "danger." The Striker responds. Mission succeeds.

**Minute 1:00 — The Discovery**
In the Inspector, Kai clicks his Scout and sees a new tab: "Probe Log." He opens it. The heatmap appears — a colorful grid of green, cyan, and grey cells. He doesn't know what the axes mean at first, but the colors are interesting.

He hovers over cells. Tooltip: "Tick 4, Slot 1: Terrain observation — open ground at B3, age: 2 ticks, referenced by: patrol rule." He hovers over another: "Tick 4, Slot 2: Empty." He starts clicking through ticks.

By tick 8, he notices a pattern: green cells (observations) fill up from left to right, then older ones disappear as new ones arrive. "It's like... a conveyor belt?" he says. "New stuff pushes in and old stuff falls off."

Zara, watching over his shoulder, recognizes the moment: her son just independently discovered FIFO (First In, First Out) buffer behavior by watching a probe heatmap. He's 11. He doesn't know the term. He just sees the pattern.

"That's exactly right," she says. "It's like a conveyor belt with a fixed number of spots. When all spots are taken, the oldest thing gets pushed off to make room for the newest."

Kai nods. He's already thinking about the implication: "So if something important gets pushed off... the robot forgets it?" He has just discovered the concept of cache eviction through play.

**UI Annotations:**
- Probe heatmap: designed to be visually appealing even without understanding axes — the color patterns create recognizable shapes (diagonal bands for cycling, solid blocks for stale data, scatter for chaotic behavior)
- Tooltip on cell hover: plain-language description of content, no jargon, readable by a child ("Terrain observation — open ground at B3")
- "Conveyor belt" animation: optional animation mode where cells slide left as new ticks arrive, making the FIFO pattern kinetic

## Strengths and Weaknesses

**Strengths:**
- The hook slot cost creates a genuine tradeoff that teaches the observability/overhead engineering principle
- The lifecycle (create → execute → read → remove) teaches temporary instrumentation discipline
- Auto-strip before Gauntlet prevents the "forgot to remove debug logging in production" failure while teaching the concept
- Cross-match comparison enables regression analysis — comparing system behavior across runs
- Probe suggestions at diagnostic dead-ends guide players toward the tool without forcing it on them
- The heatmap view makes temporal patterns visible that single-tick inspection cannot reveal

**Weaknesses:**
- The hook slot cost disproportionately affects low-slot units (Scouts, Strikers) — the units most likely to have mysterious behavior are the most expensive to probe
- Players may develop "probe addiction" — always probing instead of building analytical intuition from basic Inspector data
- The Probe Log's dense data presentation (heatmap, timeline, snapshot) may overwhelm players who are new to diagnostic tools
- Cross-match comparison requires 3+ matches with the same probe — a significant time investment before the most powerful diagnostic view becomes available

## Interaction Effects

- **Inspector sidebar (8.09)**: The probe extends the Inspector's diagnostic depth. The Inspector shows state at selected ticks; the probe captures state at ALL ticks.
- **Signal genealogy (4.16)**: The genealogy shows signal flow between units; the probe shows what happens to signals INSIDE a unit's context window after arrival.
- **Diagnostic ring (8.09)**: The ring provides ambient health monitoring; the probe provides targeted deep inspection. They complement rather than overlap.
- **Pre-ranking transparency (4.58)**: The transparency panel suggests probe placements — bridging competitive diagnostic tools and the teaching-layer probe system.
- **Fix Explorer (4.36)**: Probe data enriches Fix Explorer analysis — when the explorer identifies a candidate fix, probe data from the relevant unit shows exactly why that element was problematic.
- **Gauntlet auto-strip**: The auto-strip mechanic creates a clean separation between diagnostic and competitive configurations, teaching deployment discipline.
- **Context overload (locked)**: Probes are the primary tool for understanding overload causes — the heatmap reveals the buffer fill pattern that led to stun.

## Comparable Games

- **Screeps**: `console.log` as the only diagnostic tool. Players build their own monitoring dashboards from raw log output. Robot Uprising's probe hooks provide structured diagnostics that Screeps players build manually.
- **Factorio**: No per-entity instrumentation. The Bottleneck mod (community-built) highlights underperforming entities — a probe-like function the community had to create. Robot Uprising builds it in.
- **Gladiabots**: Community "debugging sub-AI" pattern — a condition-only behavior tree placed at the root to surface sensing state in the log. This is a workaround for the lack of probes. Robot Uprising formalizes this as a first-class mechanic.
- **Shenzhen I/O / TIS-100**: Step-through debugging with per-node state inspection. The closest precedent to probes, but Zachtronics debugging is synchronous (pause, step, inspect) while Robot Uprising probes are asynchronous (capture everything, analyze later). Robot Uprising's approach better matches real production debugging where you can't pause the system.
- **Real-world observability tools**: OpenTelemetry traces, Datadog APM, Jaeger distributed tracing. Probes map directly to custom instrumentation points in production systems. The hook slot cost parallels the CPU/memory overhead of high-fidelity tracing.

## Sensory Description

The probe magnifying glass icon at rest: 12px, teal outline on transparent, 30% opacity, barely visible against the blueprint's dark background — a ghost of diagnostic potential waiting to be activated.

The activation click: the icon fills with solid teal, brightening to 100% opacity in a 200ms ease-out. A thin teal line extends from the icon to the hook slot it now occupies, drawing itself in 300ms like a cable plugging in. A soft "click" sound — the satisfying snap of a diagnostic connector seating into its socket. The breathing animation begins: the icon's glow intensifies and fades over a 0.8-second cycle, a heartbeat of observation.

The Probe Log in the Inspector: dark navy panel, teal header reading "PROBE LOG — SCOUT-A." The heatmap fills in column by column (left to right, one column per 50ms) as if being drawn in real-time — each tick's data rendering as colored cells that fade from transparent to opaque. The effect is of watching a photograph develop, the pattern emerging gradually from darkness.

When the player identifies the critical pattern — the moment they understand WHY the buffer overflowed — there is no fanfare, no congratulations popup, no achievement unlock. Just the quiet satisfaction of colored cells on a dark grid, telling a story that was invisible 30 seconds ago. The diagnostic itself is the reward. The understanding is the trophy.

The probe removal: click the icon, it fades from 100% to 30% over 400ms. The teal cable-line retracts back into the icon in 200ms. A soft descending "click" — the diagnostic connector unplugging. The hook slot it occupied flashes briefly teal (200ms) then settles to its dashed-outline empty state. Ready for a channel hook. Ready for production.
