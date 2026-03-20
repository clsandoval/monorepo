# 4.04a — Debrief as Debugger: Step-Through Replay as the Primary Teaching Mechanic

## The Locked Context

The Inspector is the second act of the two-act debrief: sealed watch (emotional) THEN inspector (analytical). The Inspector features a timeline scrubber replacing the tick clock, click-to-inspect for full context window state at any tick, decision traces showing which rule matched and why, context window charts (sparkline of fill over all ticks), and an event log with timestamped signal events. The board is scrubable — arrow keys step through any tick.

The design space question: **How does the Inspector become a genuine debugger — not a stats screen with pretty graphs, but a tool that teaches players to think like engineers diagnosing a distributed system?** The debrief must feel like opening Chrome DevTools on a running application, not like reading a post-game scoreboard. Every element must serve the act of tracing causation backward from effect to root cause.

---

## The Debugger Mental Model

Real debuggers share a core loop: observe unexpected behavior → set a breakpoint → step through execution → inspect state at each step → trace the data flow backward until you find the divergence between expected and actual. The Inspector must replicate this loop with game-native vocabulary:

1. **Observe**: the player saw something go wrong in the sealed watch. A striker moved left when it should have moved right. A relay went silent. An enemy walked through an unguarded corridor.
2. **Breakpoint**: the player scrubs to the tick where the failure occurred — or, critically, to the tick they *think* was the failure. The debugger rewards precise breakpoint placement.
3. **Step**: arrow keys advance or rewind tick by tick. Each step resolves the full board state — every unit's context window, every signal in flight, every rule evaluation.
4. **Inspect**: clicking a unit opens its full internal state at the current tick. Not a summary. The actual contents of every context window slot, the rule that fired, the hook output, the signal that arrived or didn't.
5. **Trace**: the player follows the causal chain. Why did this striker move left? Because rule 3 matched. Why did rule 3 match? Because slot 4 contained a stale threat report. Why was slot 4 stale? Because the scout that generated it was eliminated on tick 12. Why was the scout eliminated? Because the relay didn't forward a warning. Why didn't the relay forward? Its context window was full — the warning was evicted before a hook could fire on it.

This chain — from surface-level behavior back to root-cause architectural failure — is the teaching mechanic. The game doesn't explain information architecture in a tutorial. It makes you trace failures through information architectures until the concepts become intuitive.

---

## Screen Layout: The Debugger Workstation

### Primary Layout (16:9, 1920x1080)

The screen divides into three zones:

**Zone A — Board (left 55%, full height)**
The 8x8 isometric grid, identical to the sealed watch board but now interactive. Units display at current scrubbed tick. A translucent timeline bar sits at the bottom of the board — a horizontal strip of tick pips (one per tick, up to 120). The current tick is highlighted gold. Ticks before the current are dim teal. Ticks after are dim gray. Left/right arrow keys advance the scrubber. The board snaps to the state at each tick — units appear/disappear, positions change, context bars update. A faint cyan afterimage trails units that moved in the previous tick — "where they were" ghosted at 25% opacity for one tick, giving a sense of motion direction without animation.

**Zone B — Unit Inspector Panel (right 45%, top 65%)**
Empty by default. Shows a centered prompt: "Click any unit to inspect." When a unit is clicked, this panel fills with the debugger view for that unit at the current tick. The panel has four sub-sections stacked vertically:

1. **Identity Bar (top, 48px height):** Unit icon, name (e.g., "RELAY-C"), blueprint name, tick counter ("Tick 34 of 87"). A small portrait thumbnail (32x32) of the unit in its current state (idle, stunned, destroyed). If destroyed, the portrait shows the broken state with a red "ELIMINATED T42" label.

2. **Context Window View (next, ~200px height):** The heart of the debugger. A horizontal row of rectangular slots — one per context window slot (6 for scouts, 12 for relays, 14 for command). Each slot is a rounded rectangle (80px wide, 48px tall). Occupied slots show: content type icon (eye for observation, antenna for signal, crosshair for threat, gear for command), a truncated text label (source unit + data type, e.g., "SCOUT-A: threat@E5"), and an age badge in the bottom-right corner (ticks since entry, e.g., "3t" in small monospace). The slot background color encodes usage: **bright teal** if this slot's content was used in this tick's decision, **dim gray** if present but not consulted, **pulsing amber** if this slot is the one about to be evicted (lowest priority), **empty dark** (#1A2A3A) if unoccupied. Hovering over any slot expands it into a tooltip showing full content: signal payload, source chain, arrival tick, priority weight, and whether it was evaluated by any rule this tick. A tiny "pin" icon in the tooltip corner lets the player pin this slot's state for comparison when they scrub to another tick — the pinned slot floats as a semi-transparent overlay that persists across tick changes, allowing direct comparison of "what was in slot 3 at tick 20 vs. tick 25."

3. **Decision Trace (next, ~180px height):** A vertical chain showing the logic that produced this tick's action. Formatted as an indented trace:
   ```
   ACTION: move → D5
   ├─ RULE 2: "if threat in range → move toward relay"  [MATCHED]
   │  ├─ CONDITION: threat in range?
   │  │  └─ SLOT 4: "SCOUT-A: threat@E5" → range 2 → TRUE
   │  └─ ACTION: move toward nearest relay → RELAY-C@D4 → step D5
   ├─ RULE 1: "if tagged target adjacent → engage"  [NOT MATCHED]
   │  └─ CONDITION: tagged target adjacent? → NO tagged targets in range
   └─ RULE 3: "if idle → patrol"  [SKIPPED — higher rule matched]
   ```
   Each line is clickable. Clicking a rule expands its full definition. Clicking a slot reference scrolls the context window view to highlight that slot. Clicking a unit reference (e.g., "SCOUT-A") switches the inspector to that unit at the same tick — the transition is a quick slide-left animation (200ms) with the new unit's panel sliding in from the right, creating a sense of "following the chain."

4. **Event Log (bottom, remaining space, scrollable):** A reverse-chronological log of events involving this unit: signals sent, signals received, signals evicted, rules evaluated, hooks fired, damage taken, movement. Each entry is timestamped ("T34"), color-coded by type (green for signals received, cyan for signals sent, amber for evictions, red for combat, gray for movement), and clickable — clicking a signal-received event highlights the source unit on the board with a pulsing outline.

**Zone C — Global Tools (right 45%, bottom 35%)**
Persistent analytical tools that apply to the whole match, not a specific unit:

1. **Signal Flow Overlay Toggle:** A button that, when active, draws colored dashed lines on the board between all units with active signal chains at the current tick. Lines are colored by channel (each channel gets a consistent hue). Line thickness indicates signal volume (thicker = more signals this tick). This is the "network traffic visualization" — at a glance, the player sees who is talking to whom.

2. **Context Fill Chart:** A sparkline panel showing context fill percentage for ALL units over all ticks. Each unit gets a thin line, color-coded by unit type (teal for scouts, purple for relays, orange for strikers, green for specialists, gold for command). Hovering over any point snaps the timeline scrubber to that tick and highlights the relevant unit. A vertical "now" line tracks the current scrubber position. The chart makes patterns visible: "All my relays hit 90% at tick 30" jumps out as three purple lines spiking simultaneously.

3. **Hook Activation Timeline:** A horizontal bar per hook channel. Each bar shows when signals were sent on that channel (colored ticks on the bar). Clicking any tick on the bar scrubs to that moment and highlights the sending unit. This reveals hook patterns — "my early-warning channel fired 12 times in 4 ticks and then went silent" is immediately visible.

---

## The Three Debugging Verbs

### Verb 1: Scrub (Navigate Time)

The timeline is the most-touched element. Left arrow = back one tick. Right arrow = forward one tick. Shift+arrow = jump 5 ticks. Home = tick 1. End = final tick. Clicking any pip on the timeline bar jumps directly. The board transitions instantly — no animation between ticks, matching the sealed watch's snap behavior. But the context window view in Zone B animates: slots that changed between the previous and current tick flash briefly (100ms white pulse), making it obvious what data arrived or was evicted. This "diff highlighting" between ticks is essential — without it, the player would need to manually compare 12 slots between ticks.

### Verb 2: Inspect (Read State)

Clicking any unit on the board opens its inspector in Zone B. The click target is generous (the full tile, not just the sprite). Hovering shows a tooltip with unit name and current context fill percentage — enough to choose which unit to inspect without committing. When a unit is destroyed, clicking its last-known position still opens the inspector — its state is frozen at the destruction tick, with a red overlay and "ELIMINATED" banner. Destroyed units remain inspectable because understanding WHY they died is the whole point.

### Verb 3: Trace (Follow Causation)

The decision trace in Zone B is the tracing tool. But tracing often requires jumping between units: "STRIKER-B moved left because RELAY-C sent signal X, but RELAY-C sent signal X because SCOUT-A reported threat Y." The clickable unit references in the decision trace enable this chain-following. Each click is recorded in a **breadcrumb trail** at the top of Zone B — a horizontal list of "STRIKER-B@T34 → RELAY-C@T34 → SCOUT-A@T32" showing the player's diagnostic path. Clicking any breadcrumb jumps back to that point. The breadcrumb trail is the debugging equivalent of browser history — it prevents "where was I?" disorientation when deep in a causal chain.

---

## Player Journeys

### Journey 1: Rina, 24, Data Engineer — First Real Debug Session

**Context:** Mission 5, factory just introduced. Rina's first factory-produced army was wiped in 40 ticks. She watched the sealed watch in stunned silence as her scouts reported enemies but her strikers wandered aimlessly. Now the Inspector has opened.

**Minute 0:00 — The Empty Workstation**
The board shows the final state: her base surrounded by enemies, two destroyed strikers in the center, one relay still alive but useless. The timeline bar glows at tick 40 (final). Zone B shows "Click any unit to inspect." Zone C's context fill chart shows five lines — two (strikers) ending abruptly at ticks 28 and 33, one (relay) plateauing at 90% from tick 15 onward. Rina stares at the chart. She can see the relay saturating. She clicks the relay.

**Minute 0:30 — The Relay's Brain**
RELAY-C's inspector fills Zone B. The context window view shows 10 of 12 slots occupied. Most are dim gray — present but not used. Only 2 are bright teal (used in decision). Rina hovers over a dim slot: "SCOUT-A: threat@B3, age 14t." Fourteen ticks old. This threat report is ancient. The enemy at B3 moved to D5 eight ticks ago. The relay's context window is clogged with stale data that no rule is reading.

**Minute 1:15 — Scrubbing Backward**
Rina presses Left Arrow repeatedly, scrubbing backward. At each tick, she watches the context window slots change — new signals arriving (flash white), old ones persisting (staying gray). At tick 10, only 4 slots are occupied. At tick 15, 8 slots. By tick 20, 11 slots. She can see the accumulation. At tick 22, a slot flashes white — a new threat report arrives. But slot 12 was already occupied. The amber "about to evict" highlight appears on slot 1 (oldest entry). Tick 23: slot 1 is replaced. The evicted data was a route map from SCOUT-B. Rina realizes: the relay was receiving data from both scouts and never evicting anything strategically.

**Minute 2:00 — Following the Chain**
Rina clicks STRIKER-B on the board (now a destroyed wreck at E4). The decision trace for tick 28 (its destruction tick) shows:
```
ACTION: move → E4
├─ RULE 1: "if threat nearby → engage" [NOT MATCHED]
│  └─ CONDITION: threat nearby? → NO threats in context window
└─ RULE 2: "if idle → patrol" [MATCHED]
   └─ ACTION: patrol → random step → E4
```
No threats in context window. But there WAS a threat at E5 — the enemy that killed it. Rina clicks the context window. Six slots, all occupied — but none contain a threat report. They're all old patrol waypoints and stale position data. The striker had no idea the enemy was there because the relay never forwarded the relevant signal. Rina follows the breadcrumb: STRIKER-B@T28 → back to RELAY-C@T28. The relay's context window at tick 28: still full of stale data. The hook that should have forwarded the threat to the striker never fired because the threat report was evicted before the hook evaluated it.

**Minute 3:30 — The Aha Moment**
Rina sees it now. Her relay's eviction policy was FIFO (first in, first out), but threat reports and route maps were treated equally. Fresh threats were being evicted after 2-3 ticks to make room for new patrol observations. She needs to configure eviction priority: threats > routes > observations. She clicks the breadcrumb trail back to SCOUT-A@T20 and sees that the scout's hook DID fire — it sent a threat report on the "alert" channel. The signal reached the relay at tick 21. But by tick 23, it was evicted. Two ticks of life for critical intelligence.

Rina closes the Inspector. She knows exactly what to fix: eviction priority on the relay, and a compress skill to reduce signal size so more threats fit in the window.

**UI Annotations:**
- **Timeline bar**: 40 gold pips, left/right arrow navigation, current tick highlighted, 1px cyan afterimages on moved units
- **Context window slots**: 80x48px rounded rectangles, teal=used/gray=present/amber=evicting/dark=empty, hover expands to full signal payload
- **Decision trace**: indented tree with clickable cross-references, unit clicks trigger panel transition
- **Breadcrumb trail**: horizontal chain of "UNIT@TICK" links, click to jump back
- **Context fill chart**: 5 sparklines, vertical "now" line tracking scrubber, hover-to-snap

---

### Journey 2: Marcus, 42, VP Engineering — Diagnosing a Cascade Failure

**Context:** Mission 8, full factory-vs-factory. Marcus has a sophisticated architecture: scouts feed relays, relays compress and forward to a command agent, command agent reroutes hooks based on threat density. It worked perfectly in missions 6-7. In mission 8, it collapsed at tick 45 — a cascade failure where one overloaded relay brought down the entire signal chain.

**Minute 0:00 — The Network View**
Marcus immediately toggles the Signal Flow Overlay in Zone C. The board lights up with dashed colored lines. At tick 87 (final), almost no lines are visible — the network is dead. He scrubs backward to tick 40 (before the cascade). Lines everywhere: cyan from scouts to relays, purple from relays to command, orange from command back to strikers. A healthy network. He scrubs forward slowly. Tick 44: the lines are still dense. Tick 45: three lines from RELAY-B disappear simultaneously. Tick 46: lines from RELAY-A thin out. Tick 48: the purple line from RELAY-A to COMMAND vanishes. Tick 50: only one scout is still transmitting, to nobody.

**Minute 1:00 — The Overload Epicenter**
Marcus clicks RELAY-B at tick 45. The context window view is entirely pulsing amber — every slot at eviction priority. The decision trace shows:
```
ACTION: STUNNED (context overload)
├─ INCOMING: 4 signals arrived simultaneously
├─ CONTEXT: 12/12 slots occupied
├─ EVICTION: emergency compact — 5 slots evicted
└─ RESULT: 1 tick stun, context reduced to 7/12
```
Four simultaneous signals. Marcus checks the event log: at tick 44, all three scouts detected the same enemy wave and fired independently on the "recon-net" channel. The relay received three redundant threat reports and one terrain update in the same tick. With only one open slot, it overloaded.

**Minute 2:00 — The Cascade Chain**
Marcus traces the downstream effects. He clicks RELAY-A at tick 46. The decision trace shows RELAY-A received a "compress failure" signal from RELAY-B (a hook that fires when compression fails due to overload). RELAY-A tried to absorb RELAY-B's forwarding duties — its rules included a failover condition. But absorbing the extra data filled RELAY-A's context window from 75% to 95% in one tick. By tick 48, RELAY-A overloaded too. Marcus follows the breadcrumb: RELAY-B@T45 → RELAY-A@T46 → COMMAND@T49. The command agent at tick 49 has zero incoming data from either relay. Its context window still holds stale data from tick 43. It issues reroute commands based on 6-tick-old intelligence. The reroutes send strikers to positions the enemies have already vacated.

**Minute 3:30 — The Hook Activation View**
Marcus switches to the Hook Activation Timeline in Zone C. The "recon-net" channel bar shows a cluster of 12 signals in ticks 43-45, then silence. The "command-net" channel shows steady signals until tick 49, then silence. The "failover" channel — Marcus didn't even know this channel was so active — shows signals starting at tick 45 and continuing until tick 52. The failover hooks were firing repeatedly, generating additional load. The failover system was making the cascade worse.

Marcus pins RELAY-B's context window at tick 44 (one tick before overload) and scrubs to tick 40. The pinned overlay floats translucently, showing the "healthy" state side by side with the pre-overload state. At tick 40: 8/12 slots occupied, mix of fresh and stale. At tick 44: 12/12, four new threat reports crammed in. The problem is obvious: no deduplication. Three scouts reported the same threat, and the relay stored all three.

**Minute 5:00 — Root Cause Identified**
Marcus has the diagnosis: (1) scouts need deduplication — a rule that suppresses sending if the threat was already reported within 3 ticks; (2) the failover hook is counterproductive under load — it should only fire once, not repeatedly; (3) RELAY-B needs a filter that drops duplicate threat reports about the same grid position.

**UI Annotations:**
- **Signal Flow Overlay**: colored dashed lines between units, thickness = volume, toggle button in Zone C
- **Hook Activation Timeline**: horizontal bars per channel with signal tick marks, click-to-scrub
- **Pin mechanic**: pin icon in context slot tooltip, pinned state persists as floating overlay during scrub
- **Cascade trace**: following breadcrumbs across 3 units across 5 ticks, each transition a slide animation

---

### Journey 3: Kai, 11, First-Timer — Learning What "Context Window" Means

**Context:** Mission 2, the hooks tutorial. Kai has two pre-placed units: a scout and a striker. The mission objective was for the scout to report enemy positions to the striker via a hook. Kai configured the hook but the striker never engaged. The sealed watch showed the striker standing still while enemies walked past.

**Minute 0:00 — Confusion**
The Inspector opens. Kai sees the board with two units. Zone C's context fill chart shows two lines — the scout's (green) rising steadily, the striker's (orange) flat at zero. Zero. The striker's context window was always empty. Kai's eyebrows furrow. He clicks the striker.

**Minute 0:15 — The Empty Brain**
STRIKER-A's context window is completely empty. Six dark slots. The decision trace at every tick shows the same thing:
```
ACTION: idle (no applicable rules)
├─ RULE 1: "if threat reported → move toward threat" [NOT MATCHED]
│  └─ CONDITION: threat reported? → NO signals in context window
└─ DEFAULT: idle
```
No signals ever arrived. Kai scrubs through every tick — all empty. He clicks the scout.

**Minute 0:45 — The Scout's Side**
SCOUT-A's context window is busy. Six slots, four occupied with enemy observations. The decision trace shows the scout successfully detecting enemies. The event log shows: "T5: HOOK fired → channel: recon → payload: threat@D5." The scout sent the signal. But the striker never received it.

**Minute 1:15 — The Missing Connection**
Kai notices the signal flow overlay is available. He toggles it. At tick 5, a dashed cyan line appears from SCOUT-A — but it goes nowhere. The line points toward the top of the board and fades. There's no receiving unit. Kai looks at the striker's inspector again. In the Context Config section (visible as a read-only reference in the inspector), he sees: "Listen channels: (none)." The striker isn't listening to the "recon" channel. The scout is broadcasting into the void.

**Minute 1:45 — The Fix Clicks**
Kai physically says "OH" out loud. He understands. The scout has a hook that sends on "recon." The striker has a rule that responds to threats. But the striker's context config doesn't include "recon" in its listen list. The signal is being sent, but nobody is tuned in. It's like shouting into a room where everyone has headphones on.

Kai closes the Inspector and goes to the Plan screen. He opens the striker's blueprint, finds the context config section, and adds "recon" to the listen channels. Next run: the striker receives the threat report at tick 6, moves to engage by tick 8, and the mission succeeds.

**UI Annotations:**
- **Empty context window**: six dark slots, visually stark and alarming — "why is this empty?" is an obvious question the design provokes
- **Signal flow overlay**: dashed line pointing to empty space is the visual punchline — the signal had no destination
- **Context config reference**: read-only display in Inspector showing listen/ignore channels, making the missing connection discoverable
- **Decision trace default action**: "idle (no applicable rules)" as a prompt to investigate why no rules matched

---

### Journey 4: Priya, 28, UX Designer — Using Probes for Targeted Debugging

**Context:** Mission 7, command agent mission. Priya has a complex 5-unit architecture. One specific behavior puzzles her: her command agent occasionally issues a "reroute" command that sends STRIKER-A away from the front line at what seems like the worst possible moment. She wants to understand exactly what the command agent "sees" when it makes this decision.

**Minute 0:00 — Targeted Breakpoint**
Priya remembers the bad reroute happened around tick 30-35. She scrubs to tick 30 and clicks COMMAND. The context window is dense: 14 slots, 12 occupied. She scrubs forward tick by tick. At tick 33, the decision trace shows:
```
ACTION: reroute STRIKER-A → A1 (rear position)
├─ RULE 4: "if base threat detected → recall nearest striker" [MATCHED]
│  ├─ CONDITION: base threat detected?
│  │  └─ SLOT 11: "SCOUT-B: threat@B2, age 5t" → distance to base 2 → TRUE
│  └─ ACTION: recall nearest striker → STRIKER-A@C4 → reroute to A1
```
Slot 11 contains a 5-tick-old threat report about position B2. But Priya watched the sealed watch — there was no enemy at B2 by tick 33. She scrubs back to tick 28 (when the report was generated). At tick 28, there WAS an enemy at B2. By tick 30, the enemy moved to D4. The command agent is acting on stale intelligence.

**Minute 1:30 — Tracing the Staleness**
Priya inspects why the slot wasn't updated. She clicks the "SCOUT-B" reference in the decision trace. SCOUT-B@T33 shows: the scout detected the enemy's new position at D4 on tick 30 and fired a signal on "recon-net." The signal reached RELAY-A at tick 31. But RELAY-A's context window was at 90% — the signal was queued for forwarding but the relay's compress skill took 1 tick to process. The compressed version reached COMMAND at tick 33 — the same tick the command agent made the reroute decision. The decision was made with tick-32 data because the tick-33 update arrived simultaneously with the decision evaluation. The update landed in slot 11 AFTER rule 4 had already read slot 11's old value.

**Minute 3:00 — The Evaluation Order Insight**
Priya realizes: the issue is signal latency combined with evaluation order. The command agent evaluates rules at the START of the tick, before new signals are processed into the context window. Signals arriving on the same tick are written AFTER decisions are made. This is by design — it prevents units from acting on information they just received without processing time. But it means a 2-hop signal chain (scout → relay → command) has 2 ticks of inherent latency PLUS 1 tick of compression delay PLUS 1 tick of evaluation-order delay = 4 ticks minimum. Her "base threat" rule was acting on intelligence that was 4-5 ticks old.

The fix: she needs a rule that checks threat AGE before acting. "If base threat detected AND threat age < 3 ticks → recall." This filters out stale intelligence. Alternatively, she could add a second scout closer to the base for fresher reports with fewer hops.

**UI Annotations:**
- **Slot age badge**: the "5t" monospace number in the bottom-right of the context slot, immediately flagging staleness
- **Evaluation order**: the decision trace shows RULE evaluated before SIGNAL ARRIVED, making the timing relationship explicit
- **Cross-unit trace**: COMMAND@T33 → SCOUT-B@T28 → RELAY-A@T31 — the breadcrumb trail shows a 3-unit, 5-tick diagnostic chain

---

## Information Hierarchy

### Prominent (Always Visible)
- The timeline bar and current tick number
- The unit's context window slots (color-coded by usage state)
- The top-level decision trace (action + matched rule)
- The signal flow overlay lines on the board

### Secondary (Visible on Hover or Click)
- Full signal payload in slot tooltips
- Expanded rule definitions in decision trace
- Event log entries (scrollable)
- Hook activation timeline detail

### Hidden (Requires Deliberate Action)
- Pinned slot comparison (pin button in tooltip)
- Cross-unit context fill chart hover-to-snap
- Breadcrumb trail (builds only through navigation)
- Context config reference (read-only, beneath the main inspector sections)

---

## Animations and Transitions

| Trigger | Animation | Duration | Purpose |
|---------|-----------|----------|---------|
| Scrub tick | Context slots flash white if changed | 100ms | Diff highlighting between ticks |
| Click unit | Panel slides in from right, old slides left | 200ms | Continuity when tracing chains |
| Pin slot | Slot lifts and floats with drop shadow | 150ms | Spatial metaphor for "holding" data |
| Toggle signal overlay | Lines draw from source to target (traced) | 300ms | Reveals network topology progressively |
| Open decision trace node | Accordion expand with indent | 150ms | Hierarchical information reveal |
| Breadcrumb added | New crumb slides in from right | 100ms | Trail grows as investigation deepens |
| Stun tick reached | Board tints red, context bar flashes | 200ms | Emotional callback to sealed watch moment |

---

## Accessibility Considerations

- **Color-independent slot states**: Teal (used), gray (present), amber (evicting), dark (empty) are distinguished not just by hue but by brightness, icon presence, and animation (only amber pulses). A colorblind player sees: bright + icon (used), medium + icon (present), medium + pulsing (evicting), dark + no icon (empty).
- **Keyboard-only navigation**: Tab cycles between Zone A (board), Zone B (inspector), Zone C (tools). Within the board, arrow keys move the unit selection cursor (separate from the timeline scrubber, which uses Shift+arrows). Within the inspector, Tab cycles through sub-sections, Enter expands trace nodes, Escape collapses.
- **Screen reader support**: Decision traces are structured as nested lists with ARIA tree roles. Context slots read as "Slot 4: Scout Alpha threat report at E5, age 3 ticks, used in decision" or "Slot 7: empty."
- **Reduced motion mode**: Slot flash replaced by border highlight (static). Panel transitions become instant cuts. Signal overlay draws instantly. Stun tick red tint is a static overlay without flash.

---

## Comparable Games

**TIS-100's Debugger**: TIS-100 lets you step through execution tick by tick and watch values in each node's registers. Robot Uprising's Inspector extends this from individual registers to a full context window (multiple slots, not one value) and adds cross-node signal tracing (the breadcrumb trail). TIS-100 lacks the "follow the chain" mechanic — you have to manually click between nodes. The breadcrumb trail solves this.

**Factorio's Production Statistics**: Factorio's production stats show throughput over time, analogous to the context fill chart. But Factorio doesn't let you scrub time — it shows cumulative data. The Inspector's tick-level scrubbing is more like a video editor's timeline, giving precise temporal control that Factorio lacks.

**Chrome DevTools' Network Tab**: The Hook Activation Timeline is directly inspired by DevTools' network waterfall. Each channel is a row, each signal is a colored bar. The pattern of "cluster of activity followed by silence" is immediately readable, just as a waterfall of API calls in DevTools reveals frontend performance issues.

**Into the Breach's Damage Preview**: Into the Breach shows you exactly what will happen before you commit. The Inspector inverts this: it shows you exactly what DID happen after the fact. But the clarity principle is the same — no hidden information, complete traceability.

---

## Sensory Description

Tick 34. The Inspector is open. The board sits in muted twilight — the isometric tiles in cool blue-gray, units sharp and still. No kulintang plays here. Instead, a low ambient hum — the sound of a data center, fans and electricity and the faint click of hard drives. The Inspector is the machine room behind the battlefield.

RELAY-C's context window fills the right panel. Twelve slots in a row, most occupied. The slots look like memory chips in a motherboard — rectangular, precise, slotted into a dark PCB-colored background. The used slots glow teal from within, like indicator LEDs. The unused slots are dark voids. One slot pulses amber — a slow, unhealthy throb, like a warning light on server hardware. Hovering over it reveals: "SCOUT-B: terrain@A3, age 11t." Eleven ticks old. This data is dead weight.

The decision trace below reads like a stack trace in a terminal — monospace font, indented lines, green checkmarks for matched conditions, red X marks for failures. It scrolls with the crisp precision of a log viewer. Clicking a unit reference produces a satisfying mechanical click — the kind of sound a physical rack-mount server makes when you pull a blade. The panel slides sideways, revealing the next unit's internals.

The breadcrumb trail at the top grows: RELAY-C@T34 → SCOUT-B@T28 → STRIKER-A@T34. Three units, two timepoints. The trail is a thin horizontal strip of rounded pills, each pill containing a tiny unit icon and a tick number. Following the breadcrumbs back to the start requires clicking backward through the chain — each click produces a gentle reverse-click sound, like rewinding tape. The machine room ambiance shifts pitch slightly with each unit change, as if you're physically moving through the data center to a different rack.
