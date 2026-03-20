# 4.15 — The Probe Hook as First-Class Debugging Primitive

## The Locked Context

Hooks are one of four primitives: reactive triggers wired to named channels. When a condition fires, the hook sends a payload on its channel. Hooks are fire-and-forget. Each unit has limited hook slots (Scout: 2, Striker: 2, Relay: 4, Specialist: 2, Command: 6). The game vocabulary maps 1:1 to real agentic AI engineering — hooks correspond to pub/sub events, probes correspond to observability instrumentation. The Inspector provides post-match analysis: timeline scrubber, click-to-inspect, decision traces, event logs. The two-act debrief (sealed watch → Inspector) is locked.

The design space question: **How does the game give players a debugging instrument that is explicitly about OBSERVABILITY — adding instrumentation to your architecture to capture state that would otherwise be invisible — without making it feel like a cheat or an afterthought?** The probe hook is the game's equivalent of `console.log`, `printf` debugging, OpenTelemetry spans, or Datadog custom metrics. It must teach that observability is a first-class engineering skill, not a debugging hack.

---

## What Is a Probe Hook?

A probe hook is a hook that sends data on a channel that NO unit listens to. Its purpose is not to communicate between agents — it's to record state for the player's post-match analysis. The probe hook fires during the match, emitting signals onto a "dead" channel. These signals are captured by the Inspector and displayed in the debrief. The probe hook is a one-way mirror: the architecture sees nothing, the player sees everything.

The key insight: **a probe hook occupies a real hook slot.** This is the cost. A scout with 2 hook slots can have: 2 operational hooks (maximum signal wiring), 1 operational + 1 probe (wiring + observability), or 2 probes (pure instrumentation, no operational value). The player must decide how much of their architecture's capacity to spend on understanding vs. acting. This mirrors real engineering: observability costs resources (CPU, memory, bandwidth). Good engineers instrument strategically. The game teaches this.

---

## Probe Hook Creation

### In the Plan Screen Workbench

The blueprint editor's hook section shows the unit's hook slots — rectangular panels, one per slot, most containing existing hooks or empty with dashed outlines. To create a probe hook, the player:

1. **Selects an empty hook slot** (or replaces an existing hook). The slot expands to the hook configuration panel.

2. **Sets the trigger condition.** Same as any hook: a condition that evaluates against the unit's context window each tick. Examples: "when context fill > 80%," "when threat detected in range 3," "when signal received on channel X," "every tick" (unconditional — fires every tick, capturing full state).

3. **Sets the channel name.** Here's where the probe diverges from an operational hook. The player types a channel name prefixed with `probe:` — for example, `probe:relay-c-state`. The `probe:` prefix is a naming convention, not a hard rule. But the workbench recognizes it: when a channel name starts with `probe:`, the hook slot's border changes from the standard teal to a distinctive amber-orange (#E8A838), and a small magnifying glass icon (🔍, 12x12px) appears in the slot corner. The slot is visually marked as "this is instrumentation, not communication."

4. **Sets the payload.** What data the probe captures when it fires. Options:
   - **Context snapshot**: captures the full contents of all context window slots at the moment of firing. The most expensive payload (all slots serialized).
   - **Decision snapshot**: captures the rule evaluation trace for this tick — which rules matched, which didn't, what data they read.
   - **Signal log**: captures all signals received and sent this tick.
   - **Custom expression**: a simple expression language for capturing specific slots or values. Example: `slot[0].age` captures just the age of the first context slot. Advanced, unlocked in Mission 7.

5. **Confirms the probe.** The hook slot now shows the amber border, the 🔍 icon, and a summary: "probe:relay-c-state — every tick — context snapshot." The production queue preview updates: units built from this blueprint will spend 1 of their hook slots on the probe.

### The Cost Conversation

When a player creates a probe hook on a unit that already has all hook slots filled with operational hooks, they must REMOVE an operational hook to make room. The workbench presents this trade-off explicitly:

A confirmation dialog appears: "This unit has 2 hook slots. Replacing [HOOK: alert → threat-channel] with a probe will remove the unit's ability to send threat alerts. Proceed?" The dialog has two buttons: "Keep operational hook" and "Replace with probe." No default selection — the player must actively choose.

This dialog is the game's most explicit teaching moment about observability cost. It doesn't say "probes are less important" — it says "you have limited capacity, and choosing to observe means choosing not to act." The player learns that in real engineering, adding a Datadog span to a hot path costs CPU cycles that could serve requests.

### The Probe-Dedicated Slot (Late-Game Unlock)

In Mission 9, the player unlocks a **probe expansion module** — an additional hook slot on any unit, usable ONLY for probes. This doesn't increase operational capacity (the unit can't use it for communication), but it eliminates the observability/action trade-off for one slot. The unlock teaches: "mature engineering organizations invest in dedicated observability infrastructure, separate from production capacity." The probe expansion module appears as a slightly smaller slot beneath the regular hook slots, with an amber border by default and a "PROBE ONLY" label.

---

## How Debrief Surfaces Probe Output

### The Probe Panel in the Inspector

When a match completes and the player enters the Inspector, a new section appears in Zone C (global tools): the **Probe Panel**. This panel is only present if the player's architecture included at least one probe hook. If no probes exist, the panel space is given to other tools.

The Probe Panel is a vertical list of all probe channels, sorted by fire count (most active first). Each entry shows:

```
🔍 probe:relay-c-state
   Source: RELAY-C (Blueprint: RELAY-CENTRAL)
   Trigger: every tick
   Fires: 87 times (87 of 87 ticks)
   Payload: context snapshot
   [▶ Expand timeline]
```

Clicking "Expand timeline" opens a horizontal strip — one cell per tick, similar to the hook activation timeline but showing probe data. Each cell is a small colored square:
- **Teal** if the probe fired and the payload showed normal state
- **Amber** if the probe fired and the payload showed elevated context (>75%)
- **Red** if the probe fired and the payload showed critical context (>90%) or overload
- **Dark** if the probe didn't fire (condition wasn't met)

The strip provides an at-a-glance state history. "My relay's probe shows teal-teal-teal-amber-amber-red-red-red..." — the player sees the escalation pattern in a 1-second scan.

### Clicking a Probe Cell

Clicking any cell on the probe timeline does two things simultaneously:
1. **Scrubs the main timeline** to that tick — the board updates to show the full state at that moment.
2. **Opens the probe payload** in a floating panel. For a context snapshot, this shows the full context window contents at the moment the probe fired — each slot with content, source, age, and priority. For a decision snapshot, this shows the rule evaluation tree. For a signal log, this shows sent/received signals.

The probe payload panel is distinct from the unit Inspector panel (Zone B). It appears as a floating card (320px wide, variable height) next to the probe timeline strip, anchored to the clicked cell. It has a thin amber border (matching the probe color scheme) and a header: "🔍 probe:relay-c-state @ Tick 34." The payload is rendered identically to the corresponding section of the unit Inspector — context snapshot looks just like the context window view in Zone B, decision snapshot looks just like the decision trace.

The floating panel allows the player to keep the unit Inspector (Zone B) open on a DIFFERENT unit while reading the probe data. This is essential for correlation: "at tick 34, my probe shows RELAY-C's context was full. Let me check what STRIKER-A was doing at tick 34 in the Inspector." The probe panel and the Inspector panel show two different units at the same tick — parallel diagnostic windows.

### Probe Comparison Mode

If the player has multiple probes, a "Compare" button appears at the top of the Probe Panel. Clicking it enters comparison mode: the probe timeline strips stack vertically, aligned on the tick axis, so the player can see multiple probes' state at the same tick. Each strip is labeled with its probe channel name. Vertical alignment makes correlation visual: "all three relays hit amber at tick 30" is visible as three amber cells in the same column.

---

## The Auto-Strip Question: Probes in Gauntlet Deploy

### The Problem

Probe hooks occupy real hook slots. In competitive Gauntlet, every hook slot matters. A player who deploys with a probe active is sacrificing operational capacity for observability — which makes sense during development but is wasteful in competition.

### Three Design Options

**Option A: Auto-Strip (Recommended)**
When a player deploys a config to the Gauntlet, all probe hooks are automatically stripped. The deploy confirmation dialog shows: "2 probe hooks will be auto-stripped for Gauntlet deployment. Operational hooks are unaffected." The stripped probes are preserved in the workbench — they're still there when the player returns to the Plan screen. They're just not included in the deployed version.

This option teaches: "observability is for development, not production." In real engineering, you don't deploy debug logging to production. The auto-strip reinforces this boundary.

**Option B: Manual Strip with Warning**
The deploy dialog warns: "Your config includes 2 probe hooks occupying operational slots. Deploy with probes (reduced operational capacity) or strip probes (full capacity)?" Two buttons: "Deploy with probes" and "Strip and deploy." This option gives the player the choice, teaching that sometimes you DO want observability in production (canary deploys, production debugging).

**Option C: Probe-Dedicated Slots Don't Strip**
Probes in regular hook slots are auto-stripped. Probes in the probe expansion module (dedicated probe slot) are retained — they don't consume operational capacity, so there's no reason to strip them. This option teaches: "dedicated observability infrastructure survives the dev/prod boundary."

### Recommended: Option A + C
Auto-strip operational-slot probes. Retain probe-expansion-module probes. The Gauntlet match's debrief still shows probe data from the dedicated slots, giving the player observability even in competitive matches — but only from infrastructure they explicitly invested in.

---

## Player Journeys

### Journey 1: Zara, 20, CS Student — First Probe Experience

**Context:** Mission 6, Zara has been struggling with her relay architecture. RELAY-CENTRAL keeps overloading, but she can't figure out when or why — the Inspector's click-to-inspect only shows state at the tick she happens to click. She wants a continuous record.

**Minute 0:00 — The Discovery**
Zara opens the workbench and clicks RELAY-CENTRAL's blueprint. The hook section shows 3 of 4 slots filled with operational hooks (forward, compress-trigger, alert-relay). One slot is empty with a dashed outline. She clicks the empty slot.

The hook configuration panel opens. She sees the standard fields: Trigger Condition, Channel Name, Payload. She starts typing a channel name: "relay-state-log." The workbench doesn't react — it's just a channel name. Then she remembers a tooltip from the boot log: "Prefix a channel with 'probe:' to create an instrumentation hook. Probe data is captured for debrief analysis."

She clears the field and types: "probe:relay-state". The moment she types the `probe:` prefix, the hook slot's border transitions from teal to amber (200ms color shift). A small 🔍 icon fades in at the slot corner. The panel header changes from "Hook Configuration" to "Probe Configuration." The payload section expands, now showing the four payload options (context snapshot, decision snapshot, signal log, custom expression) as a dropdown.

**Minute 0:45 — Configuration**
Zara selects trigger: "every tick" (she wants continuous monitoring). Payload: "context snapshot" (she wants to see what's in the relay's brain at every tick). She confirms. The hook slot now shows: amber border, 🔍 icon, summary text "probe:relay-state — every tick — context snapshot."

The production queue preview updates. The RELAY-CENTRAL icon now has a tiny amber dot in its corner — marking that this blueprint includes a probe. A subtle tooltip on hover: "This blueprint uses 1 of 4 hook slots for a probe. 3 operational hooks active."

**Minute 1:30 — The Match**
Zara hits Execute. The sealed watch plays. She watches RELAY-CENTRAL's context bar fill, hit amber, hit red, overload at tick 28. The standard sealed watch. Nothing about probes is visible during the sealed watch — probes are silent observers.

**Minute 2:30 — The Probe Panel**
The Inspector opens. In Zone C (global tools), a new panel is present: the Probe Panel. It shows:

```
🔍 probe:relay-state
   Source: RELAY-C (Blueprint: RELAY-CENTRAL)
   Trigger: every tick
   Fires: 65 times (65 of 65 ticks)
   Payload: context snapshot
   [▶ Expand timeline]
```

Zara clicks "Expand timeline." A horizontal strip of 65 tiny squares appears. Left to right, the strip reads: teal-teal-teal-teal-teal-teal-teal-teal-teal-teal-teal-teal-amber-amber-amber-amber-amber-amber-red-red-red-red-red-red-red-RED FLASH-amber-amber-teal-teal...

The pattern is instantly legible. Twelve ticks of healthy operation. Six ticks of amber stress. Seven ticks of red critical. Then the overload (indicated by a brighter red with a tiny lightning bolt overlay on the cell). Then recovery — amber, then back to teal.

But the strip continues after tick 28. More amber appears at tick 40-45. Then red again at tick 50. Then another overload at tick 53. The relay overloaded TWICE. Zara only noticed the first overload during the sealed watch — the second one happened while she was watching a striker engagement at the other end of the board. The probe caught what her eyes missed.

**Minute 3:30 — The Deep Dive**
Zara clicks the first red cell (tick 19 — when the relay entered critical). The main timeline scrubs to tick 19. A floating probe payload card appears next to the cell: RELAY-C's full context window at tick 19. Twelve slots:
- Slot 1: SCOUT-A threat@B3, age 7t (dim gray — not used, stale)
- Slot 2: SCOUT-A terrain@C4, age 6t (dim gray)
- Slot 3: SCOUT-B threat@E5, age 4t (bright teal — used in forward decision)
- ...
- Slot 11: SCOUT-A threat@B3, age 1t (bright teal — duplicate of slot 1, but fresher)
- Slot 12: incoming signal PENDING (amber — about to arrive)

Zara sees it: slot 1 and slot 11 are the SAME threat report from the SAME scout, just at different ages. The relay is storing duplicates. Seven-tick-old and one-tick-old versions of the same data. She clicks the cell at tick 15 for comparison — the floating card updates. At tick 15, only one copy existed. By tick 19, the scout re-sent the report (its hook fires every time it detects the same threat) and the relay stored both copies without deduplication.

The probe gave her the continuous record she needed: not a snapshot at one tick, but the full evolution of the context window over time, with the ability to compare any two ticks. She now knows the fix: add a filter rule that drops signals matching existing context entries with the same source and target.

**UI Annotations:**
- **probe: prefix recognition**: amber border + 🔍 icon appear instantly on typing "probe:", 200ms color transition
- **Probe timeline strip**: 65 cells, each 6x12px, color-coded by state, lightning overlay on overload ticks
- **Floating payload card**: 320px wide, amber border, appears anchored to clicked cell, shows full context snapshot
- **Compare-by-click**: clicking different cells updates the same floating card, enabling rapid A/B comparison across ticks

---

### Journey 2: Marcus, 42, VP Engineering — Surgical Probe Placement

**Context:** Mission 9, Marcus has a complex 10-unit architecture. He suspects his COMMAND agent's reroute decisions are causing downstream disruptions, but the command agent has 6 hook slots all occupied by essential operational hooks. He can't afford to replace any with a probe.

**Minute 0:00 — The Expansion Module**
Marcus opens the COMMAND blueprint. Below the 6 hook slots, a seventh slot appears — smaller, amber-bordered, labeled "PROBE ONLY." This is the probe expansion module, unlocked in Mission 9. Marcus clicks it.

The probe configuration panel opens. He sets the trigger: "when rule 4 matches" (rule 4 is the reroute rule — the one he suspects). Payload: "decision snapshot" (he wants to see exactly what data the command agent read when it decided to reroute). He doesn't need "every tick" — he only wants data at the moments the reroute fires.

**Minute 0:30 — The Targeted Capture**
The match runs. In the Inspector, the Probe Panel shows:

```
🔍 probe:command-reroute
   Source: COMMAND-A (Blueprint: COMMAND-CENTRAL)
   Trigger: when rule 4 matches
   Fires: 4 times (ticks 22, 38, 51, 67)
   Payload: decision snapshot
   [▶ Expand timeline]
```

Only 4 fires in 87 ticks. Each fire is a reroute decision. Marcus expands the timeline — 87 cells, 83 dark (no fire), 4 amber (probe fired). The amber cells are spaced irregularly across the timeline: tick 22, 38, 51, 67.

**Minute 1:00 — The Decision Autopsy**
Marcus clicks the amber cell at tick 22 (first reroute). The floating payload card shows:

```
DECISION SNAPSHOT @ Tick 22
Rule 4: "if scout reports enemy advance → reroute nearest striker"
├─ CONDITION: scout reports enemy advance
│  └─ SLOT 7: "RELAY-A fwd: SCOUT-B threat@D4, age 3t" → TRUE
├─ ACTION: reroute nearest striker
│  └─ STRIKER-A@E6 → rerouted to D5
│  └─ Distance: 2 tiles
│  └─ Striker was: engaging enemy at F6
│  └─ Striker action interrupted: YES
```

The reroute pulled STRIKER-A away from an active engagement to respond to a 3-tick-old threat report that arrived via relay. Marcus clicks the cell at tick 38 — same pattern. A relay-forwarded threat report, 4 ticks old, causing a reroute that interrupted a striker's current action.

**Minute 2:00 — The Pattern**
All four reroutes share the same pattern: the command agent acts on relay-forwarded intelligence that is 3-4 ticks old. By the time the reroute reaches the striker, the threat has often moved. The command agent is over-reacting to stale data because it doesn't check signal age before issuing reroutes.

Marcus modifies rule 4: "if scout reports enemy advance AND signal age < 2 ticks → reroute nearest striker." The probe told him exactly what to fix and why.

**Minute 3:00 — Gauntlet Deployment**
Marcus deploys to the Gauntlet. The deploy confirmation shows: "1 probe hook (in probe expansion module) will be retained for Gauntlet deployment. No operational hooks affected." The probe stays because it's in the dedicated slot. Marcus will get probe data even from competitive matches, without sacrificing any operational capacity. Next Gauntlet debrief: he can verify whether the age check on rule 4 prevented the bad reroutes.

**UI Annotations:**
- **Probe expansion module**: seventh slot, smaller height (32px vs. 48px for regular slots), "PROBE ONLY" label, amber border by default
- **Conditional firing**: only 4 cells lit in 87-tick timeline — surgical precision, not brute-force capture
- **Decision payload**: full rule evaluation tree, showing interrupted actions — reveals not just WHAT happened but WHAT IT COST
- **Gauntlet retention**: dedicated-slot probes survive auto-strip, confirmed in deploy dialog

---

### Journey 3: Tala, 19, CS Student — Discovering the Probe Through Failure

**Context:** Mission 7, Tala's architecture collapsed and she can't figure out why from the Inspector alone. She's clicking through units tick by tick, but the relevant event happened during a 3-tick window she keeps missing.

**Minute 0:00 — The Frustration**
Tala clicks RELAY-B at tick 30. Context window normal. Clicks tick 31. Normal. Tick 32. Normal. Tick 33 — overloaded. What happened between 32 and 33? The context snapshot at tick 32 shows 9/12 slots filled. At tick 33, 12/12 and overload. Three signals arrived simultaneously. But which signals? The event log shows "T33: 3 signals received on channel 'recon-net'" — but what were they? The Inspector's event log is summary-level, not payload-level.

Tala mutters: "I wish I could see exactly what was in the buffer at every single tick..." She remembers the boot log mention of probe hooks. She exits to the Plan screen.

**Minute 1:00 — The Probe Setup**
She opens RELAY-B's blueprint. The hook section shows 4/4 slots occupied. She pauses. Creating a probe means removing an operational hook. She reads the four hooks:
1. Forward → attack-channel (sends threats to strikers)
2. Forward → recon-net (sends observations to command)
3. Compress-trigger → compress-channel (triggers compression when buffer >75%)
4. Alert → emergency-channel (sends overload warning to command)

Hook 4 is the least critical — it only fires on overload, which she's trying to PREVENT. She replaces hook 4 with a probe: trigger "every tick," payload "context snapshot," channel "probe:relay-b-state."

The confirmation dialog appears: "Replacing [HOOK: alert → emergency-channel] with a probe will remove RELAY-B's ability to send overload alerts. Proceed?" Tala accepts — she needs the diagnostic data more than the alert.

**Minute 2:00 — The Second Match**
She runs the mission again. In the Inspector, the Probe Panel shows the full context timeline. She expands it and immediately sees the pattern: at tick 30, three cells go from teal to amber simultaneously. Three relays, all stressed at the same time. But she only has a probe on RELAY-B. She can see RELAY-B's tick-by-tick evolution but has to infer the others from the standard Inspector tools.

She clicks tick 32 on the probe timeline (one tick before overload). The payload card shows:

```
RELAY-B Context @ Tick 32 (9/12 occupied)
Slot 1: SCOUT-A terrain@A1, age 12t [stale]
Slot 2: SCOUT-A threat@C3, age 8t [stale]
Slot 3: SCOUT-B terrain@D4, age 6t [stale]
Slot 4: SCOUT-B threat@E5, age 3t [fresh]
Slot 5: SCOUT-A threat@C3, age 2t [duplicate of slot 2]
Slot 6: SCOUT-C terrain@G7, age 1t [fresh]
Slot 7: COMMAND reroute@F4, age 1t [fresh]
Slot 8: SCOUT-A threat@C3, age 0t [duplicate x3]
Slot 9: SCOUT-B terrain@D4, age 0t [duplicate of slot 3]
Slots 10-12: empty
```

THREE copies of the same threat report about C3. And at tick 33, three MORE signals arrive — all from scouts reporting the same threat wave. The relay is drowning in duplicate intelligence. The fix: a deduplication filter in the relay's context config that drops signals matching existing entries with the same source type and grid target.

**Minute 3:30 — The Aha About Probes**
Tala realizes: without the probe, she would have spent 15+ minutes clicking through individual ticks in the Inspector trying to catch the duplication pattern. The probe gave her a continuous, color-coded view of the relay's health over the entire match, AND the ability to open the exact payload at any tick. It's like the difference between checking server health by manually SSH-ing in every 5 minutes versus having a Grafana dashboard.

She decides: every relay in her architecture gets a probe from now on. She'll use the probe expansion module when she unlocks it. For now, she accepts the trade-off: 1 hook slot per relay dedicated to observability.

**UI Annotations:**
- **Hook replacement dialog**: explicit trade-off communication, no default button, requires active choice
- **Stale/duplicate annotations**: probe payload card tags entries as [stale] or [duplicate] based on age and content matching — automated annotations the standard Inspector doesn't provide
- **Continuous monitoring value**: the probe timeline strip makes patterns visible that tick-by-tick Inspector clicking would miss — the "Grafana vs. SSH" difference

---

## Information Hierarchy

### Prominent (Always Visible When Probes Exist)
- Probe Panel in Zone C with fire count and "Expand" button
- Probe timeline strip — color-coded cells showing state evolution
- Blueprint amber indicator showing which units have probes

### Secondary (Visible on Click/Hover)
- Probe payload cards (floating, opened by clicking timeline cells)
- Probe channel names and trigger conditions
- Deploy auto-strip summary

### Hidden (Requires Configuration or Advanced Unlocks)
- Custom expression payloads (Mission 7+)
- Probe expansion module (Mission 9+)
- Probe comparison mode (requires 2+ probes)
- Gauntlet probe retention policy

---

## Animations and Transitions

| Trigger | Animation | Duration | Purpose |
|---------|-----------|----------|---------|
| Type "probe:" in channel name | Slot border transitions teal → amber, 🔍 icon fades in | 200ms | Instant feedback that probe mode activated |
| Expand probe timeline | Strip draws left-to-right, cells appearing in sequence | 400ms (6ms per cell) | Reveals temporal data progressively |
| Click probe cell | Main timeline scrubs (instant) + floating card slides in from cell position | 200ms slide | Connects spatial click to temporal scrub |
| Probe fires during sealed watch | Nothing visible | N/A | Probes are invisible during sealed watch — pure observation |
| Open Probe Panel first time | Panel slides in with a brief amber pulse on the border | 300ms slide + 200ms pulse | Discovery moment — "oh, probe data is here" |
| Remove probe (replace with hook) | Amber border fades to teal, 🔍 icon dissolves | 200ms | Clean transition back to operational mode |

---

## Accessibility Considerations

- **Color-independent probe cells**: Teal (healthy), amber (stressed), red (critical), dark (no fire) are differentiated by brightness and icon overlay. Healthy cells have no icon. Stressed cells have a single dot overlay. Critical cells have a double dot. Overload cells have the lightning bolt. Dark cells are visually recessed (1px inset shadow).
- **Screen reader for probe timeline**: Reads as "Probe relay-b-state: tick 1 healthy, tick 2 healthy, ... tick 19 stressed, tick 20 stressed, ..." with option to skip to state changes only: "Healthy ticks 1 through 12. Stressed ticks 13 through 18. Critical ticks 19 through 25. Overload at tick 26. Healthy ticks 27 through 65."
- **Keyboard navigation**: Tab reaches the Probe Panel. Enter expands the timeline. Left/right arrows navigate cells. Enter on a cell opens the payload card and scrubs the main timeline. Escape closes the payload card.
- **Reduced motion**: Timeline strip appears instantly (no left-to-right draw). Payload cards appear without slide (instant visibility). The only animation in reduced-motion mode is the main timeline scrub, which is essential for functionality.
- **High contrast**: Amber probe indicators shift to bright orange (#FF8800) for maximum visibility against dark backgrounds. The 🔍 icon renders as a solid white magnifying glass with a black outline.

---

## Comparable Games

**Factorio's Debug Overlay**: Factorio has a debug mode that shows belt item counts, inserter working rates, and power grid status. These are observability layers that don't affect gameplay. Robot Uprising's probes are more targeted — the player chooses WHAT to observe, WHERE, and WHEN — but serve the same diagnostic purpose.

**Screeps' Console.log**: In Screeps, players add `console.log` statements to their JavaScript code to debug behavior. The output appears in a real-time console. Robot Uprising's probe hooks are the visual-programming equivalent of `console.log` — the player instruments specific points in their architecture and reads output in the debrief. The difference: probes are first-class UI elements with structured output, not raw text in a console.

**TIS-100's Watch Window**: TIS-100 allows watching individual register values as the program executes. The probe hook extends this from "watch one value" to "capture full state snapshots at triggered moments" — a jump from watch expressions to trace-level observability.

**Datadog/Grafana Custom Dashboards**: Real observability platforms let engineers define custom metrics, set alert thresholds, and review historical data. Robot Uprising's probe system is a simplified version of this workflow: define what to capture (probe config), set trigger conditions, review historical data (probe timeline), and drill into specific moments (payload cards). The parallel is deliberate — the game teaches observability as a transferable engineering skill.

**Opus Magnum's Solution Replay**: After solving an Opus Magnum puzzle, players can watch their machine run at any speed, pausing and rewinding. Robot Uprising's Inspector provides similar temporal navigation, but probes ADD data to this replay that wouldn't otherwise be visible — the probe is new information, not a different view of existing information.

---

## Sensory Description

The Plan screen workbench. RELAY-CENTRAL's blueprint is open. Four hook slots arranged vertically — three filled with operational hooks (teal borders, active icons), one empty (dashed outline, dark). Tala clicks the empty slot.

The hook configuration panel expands — a clean dark rectangle with input fields. She types in the channel name field: "p-r-o-b-e-:-r-e-l-a-y-s-t-a-t-e." The moment the colon after "probe" registers, the slot's border transforms. Not a snap — a smooth 200ms wash, like ink bleeding through paper. Teal dissolves into amber. A magnifying glass icon materializes in the slot corner, fading from transparent to solid amber. The panel header text shifts: "Hook Configuration" cross-fades to "Probe Configuration" in the same amber tone. The entire slot now feels like a different category of tool — not a communication wire, but an instrument.

She selects "every tick" from the trigger dropdown. The option list has a subtle distinction: operational triggers are listed in teal text, the "every tick" option (most commonly used for probes) is in amber. She selects "context snapshot" as the payload. A small preview appears in the slot: a miniature representation of 12 context window cells, arranged in a row, with a tiny camera icon pointing at them. The preview says: "this probe will photograph the context window every tick."

The match runs. The sealed watch is unchanged — no probe indicators, no amber glows, no magnifying glasses. The probes are invisible during battle. They observe without disturbing.

The Inspector opens. In Zone C, between the Context Fill Chart and the Hook Activation Timeline, a new panel appears: amber-bordered, distinct from the surrounding teal-themed tools. The header reads "🔍 Probes" in warm amber text. Below: a single entry, "probe:relay-state," with a fire count of 65. Tala clicks "Expand timeline."

The timeline strip draws itself. Left to right, cells appear in sequence — 6ms per cell, a rapid cascade. Teal, teal, teal — a steady stream of healthy green-blue squares. Then a shift: amber cells appear around tick 13, a warm interruption in the cool stream. The amber deepens. At tick 19, red appears — small, angry squares in the strip. The red persists: 19, 20, 21, 22, 23, 24, 25. Seven red cells in a row. At tick 26, a special cell — red with a tiny white lightning bolt, impossibly small but legible against the red: the overload tick. Then the strip cools: amber, amber, teal, teal, teal. Recovery.

The strip is 65 cells wide, spanning the full panel width. It reads like an EKG — a rhythm of health and distress, compressed into a single horizontal line. The healthy stretches are calm blue-green. The distressed stretches pulse with warning color. The overload tick flashes like a heartbeat spike. The entire match, reduced to a color strip, tells its story in two seconds of scanning.

Tala clicks the first red cell. The board scrubs to tick 19. A floating card appears, anchored to the cell by a thin amber line — a data tag dangling from the timeline like a price tag on a garment. Inside: twelve context window slots, neatly arranged, each with its contents displayed in clean monospace text. Seven stale entries. Three duplicates. Two fresh signals. The relay's brain, photographed at the moment it began to struggle. The probe captured what the sealed watch couldn't show and what manual Inspector clicking would have missed: the exact contents of memory at the exact moment things went wrong.
