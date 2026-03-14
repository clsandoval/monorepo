# 6.06 — Console/Controller Adaptation: Gamepad UI for Robot Uprising

## Overview

Robot Uprising is a mouse-and-keyboard game at heart. The Plan screen workbench — where players wire hooks, order rules, toggle skills, and adjust context config — was designed for a pointer with pixel-level precision. The question isn't "can it work on a gamepad?" — the question is "which of the three screens breaks hardest, and what redesign gives it back?"

This document explores every surface of Robot Uprising through the lens of a player holding an Xbox/PlayStation/Switch controller. For each screen, we examine the **navigation paradigm** (how the player moves between elements), the **action mapping** (what each button does), the **information density problem** (what gets cut or collapsed), and the **interaction patterns** that need full redesign versus those that translate cleanly.

The core tension: the PC version's power comes from **hover states** (progressive disclosure without commitment), **precise pointing** (1px cursor on 90px tiles), and **keyboard shortcuts** (20+ bindings on Plan screen alone). A gamepad has 2 sticks, a D-pad, 4 face buttons, 4 shoulder buttons, and 2 stick clicks. That's approximately 14 inputs versus a keyboard's 104. Every shortcut must either merge, hide behind a radial menu, or disappear.

---

## The Three Navigation Paradigms

Before diving screen-by-screen, we must settle the meta-question: how does the player move through UI elements with a stick?

### Paradigm A: "The Virtual Cursor" (Avoid)

A floating cursor controlled by the right analog stick, mimicking a mouse pointer. This is what Factorio shipped first — and what players immediately complained about. It's slow, imprecise, and creates a constant micro-targeting cognitive tax that fights the strategic thinking the game demands.

**Why it fails for Robot Uprising:** The Plan screen has ~40+ interactive elements visible simultaneously (board tiles, skill toggles, rule rows, hook slots, context sliders, production queue items, channel map entries). A virtual cursor must traverse all of them. Targeting a single hook slot inside a blueprint editor panel while the cursor drifts on an analog stick is infuriating — the exact opposite of the "designing smart autonomous systems" fantasy.

**When it's acceptable:** Board-only navigation during Plan screen placement and Inspector timeline scrubbing. The board is an 8×8 grid — the cursor snaps to tiles (like XCOM's grid-snap behavior), eliminating the precision problem. Outside the grid, avoid the virtual cursor.

### Paradigm B: "The Focus Ring" (Primary)

D-pad and left stick move a visible highlight between discrete UI elements. Press A/X to interact with the highlighted element. This is the conventional approach — how XCOM 2 navigates its menus, how Slay the Spire selects cards, how Into the Breach picks units on its grid.

**Focus groups:** The UI is divided into **focus groups** — clusters of related elements that the D-pad navigates within, with shoulder buttons (LB/RB) switching between groups. On the Plan screen: Board grid = group 1, Skills panel = group 2, Rules list = group 3, Hooks panel = group 4, Context config = group 5, Production queue = group 6. LB/RB cycle groups. D-pad navigates within the current group.

**Strengths:** Predictable, fast, learnable. The player builds muscle memory for "RB twice → D-pad down → A" to reach the second rule in the rules list. No drift, no precision problems.

**Weaknesses:** Deep panels with many elements (a Command agent's 6 hook slots × channel config each) create long D-pad sequences. Navigating 14 buffer slots in the Inspector requires 13 D-pad presses if you start at the wrong end.

### Paradigm C: "The Radial Wheel" (Secondary — Quick Access)

Hold LT to open a radial menu overlaying the current screen. 8 slices, one per stick direction + diagonals. Release to select. This is what Civilization VII shipped on consoles — and players called it "in some instances better than PC."

**When to use it:** Quick-access actions that are currently keyboard shortcuts. On the Plan screen: slice 1 = Scout blueprint, slice 2 = Striker, slice 3 = Relay, slice 4 = Specialist, slice 5 = Command, slice 6 = Channel map toggle, slice 7 = EXECUTE, slice 8 = Undo. The radial replaces the keyboard number keys and function keys.

**Strengths:** Any action is at most two inputs away (hold LT + flick direction). Radial menus exploit the stick's angular precision — it's easier to flick "up-left" than to target a 45px button with a virtual cursor.

**Weaknesses:** Maximum 8 slices per wheel (more creates angular confusion). Nested radials (hold for wheel → select to open sub-wheel) are tolerable one level deep but become maze-like at two levels. All slice labels must be learnable icons, not text — radial menus with words are unreadable at speed.

### Recommendation: Focus Ring + Radial Hybrid

**Primary navigation:** Focus ring with LB/RB group cycling and D-pad/left-stick element navigation within groups.
**Quick access:** LT radial wheel for actions currently mapped to keyboard shortcuts (unit type selection, screen-level toggles, EXECUTE).
**Board-specific:** Right stick controls a grid-snapping cursor on the 8×8 board (like XCOM's tile cursor). The cursor always snaps to the nearest tile center — no free-floating.

This matches the pattern that XCOM 2, Civilization VII, and Into the Breach converged on: D-pad for menus, stick for spatial, radial for shortcuts.

---

## Plan Screen — The Controller's Hardest Test

The Plan screen is where 60-70% of play time happens. On PC, it's a split view: board left, workbench right. The workbench contains skills toggles, an ordered rule list, hook slots with channel config, context sliders, and a production queue. The mouse can reach any element in one click. Hover previews spatial effects on the board.

On controller, this screen needs **the most radical redesign**.

### Layout: The Tabbed Workbench

The split view remains — board on the left half, workbench on the right. But the workbench panel **becomes tabbed**, not scrollable. Four tabs mapped to face buttons when the workbench focus group is active:

| Tab | Button (when workbench focused) | Contents |
|-----|---------------------------------|----------|
| Skills | Y/△ | Skill toggles as a vertical checklist |
| Rules | X/□ | Ordered rule list — D-pad reorders, A edits |
| Hooks | B/○ | Hook slots with channel name and target |
| Context | A/✕ (hold) | Buffer size, listen/ignore, eviction priority |

The tabs replace the PC's simultaneous visibility — on PC, all four sections are visible at once if the monitor is large enough. On controller, the player sees one section at a time but switches instantly with a face button. The tradeoff: loss of at-a-glance overview, gain of larger, more readable panels.

### The Hover Problem — "Preview Mode"

PC's hover states are the biggest loss. On PC, hovering a rule highlights the affected area on the board. Hovering a hook shows channel wiring. Hovering a channel name lights up all connected units.

**Controller replacement: "Preview Mode" (RS click)**

Click the right stick to enter Preview Mode. In this mode, the left stick moves the focus ring through workbench elements, and each focused element **automatically previews its spatial effect on the board**. Focus a rule → affected tiles glow on the board. Focus a hook → channel wiring lines appear. Focus a context slider → perception radius circle renders on the board around the selected unit.

Preview Mode is **always on by default** on controller — because there's no hover, the spatial preview must be permanent, not opt-in. The controller actually improves on mouse here: on PC, the preview disappears the instant the mouse moves away. On controller, it stays until the player moves focus to a different element, giving more time to study the spatial effect.

**Sensory description:** When an element gets focus in Preview Mode, a soft cyan pulse expands from the focused UI element toward the board, like a radar ping. The spatial preview fades in over 200ms with a soft "digital shimmer" sound — a single note from the kulintang gong set, pitch-mapped to the element type (low pitch for rules, mid for hooks, high for context). When focus moves away, the preview dissolves like pixels scattering in the wind.

### Button Mapping — Plan Screen

| Input | Action |
|-------|--------|
| **Left Stick** | Navigate within current focus group (D-pad navigates elements, stick for board cursor) |
| **Right Stick** | Board camera pan (2x zoom range) / Grid-snap tile cursor when board is focused |
| **D-Pad** | Navigate elements within focus group |
| **A / ✕** | Confirm / Select / Enter edit mode for focused element |
| **B / ○** | Back / Cancel / Exit edit mode |
| **X / □** | Context action (delete rule, clear hook, remove from queue) |
| **Y / △** | Secondary action (add rule, add hook, duplicate blueprint) |
| **LB** | Previous focus group |
| **RB** | Next focus group |
| **LT (hold)** | Open radial wheel (unit types, EXECUTE, undo, channel map toggle) |
| **RT** | EXECUTE (the most satisfying button — a trigger pull to launch battle) |
| **RS click** | Toggle preview overlay intensity (subtle → vivid → off) |
| **LS click** | Pipette — when board cursor is on a ghost unit, opens that unit's blueprint in workbench |
| **Start/Menu** | Game menu |
| **Select/View** | Toggle channel map panel |

**The RT-as-EXECUTE design:** On keyboard, Enter launches the battle. On controller, **RT is EXECUTE** — pulling the right trigger to deploy your army has a satisfying physicality that Enter lacks. The trigger's analog travel creates a brief moment of commitment. RT also matches the "fire" convention from shooters, here repurposed as "fire up the army." This is the most important single button assignment.

### Rule Editing — The Trickiest Sub-Surface

Rules are ordered condition→action pairs. On PC, editing a rule involves clicking the condition dropdown, selecting a condition, clicking the action dropdown, selecting an action, and dragging the rule to reorder priority. On controller:

**Step 1 — Select rule:** D-pad up/down through the rule list. Focused rule highlights on the board (preview mode).

**Step 2 — Edit rule:** Press A to enter edit mode. The rule expands into a two-column view: left column = condition (with a scrollable list navigated by D-pad), right column = action (same). LB/RB switch between condition and action columns.

**Step 3 — Condition selection:** The condition list is a vertical scrollable menu. D-pad up/down to browse, A to confirm. Each condition has a one-line description and an icon. As the player scrolls through conditions, the board preview updates in real-time — showing what area or state each condition would affect.

**Step 4 — Reorder:** Press Y on a selected rule to "grab" it. D-pad up/down moves it in the priority list. Press A to drop it in the new position. The rule's priority number updates, and all lower rules shift down with a cascade animation.

**Sensory description of rule editing:** When a rule enters edit mode, the workbench panel smoothly expands, pushing adjacent rules into a compressed, dimmed state. The condition column has a soft blue highlight; the action column has an amber highlight. Scrolling through conditions plays a subtle tick sound per item — like turning a rotary dial. The board preview updates with each tick — perception circles expand and contract, target filters highlight and dim, like tuning a radio and watching the signal strength change.

### Hook Configuration — Channel Autocomplete Without Typing

On PC, the player types a channel name into a text field. On controller, typing is miserable (on-screen keyboard, letter by letter). The controller needs a **completely different channel naming interaction.**

**The Channel Picker:** Instead of a text field, hooks present a **scrollable list of existing channels** (created by other hooks) plus a "[+ New Channel]" option at the bottom. D-pad scrolls the list; A selects. Each channel in the list shows its current subscriber count and a miniature wiring preview.

**New Channel Creation:** Selecting "[+ New Channel]" opens a **name generator** — three columns of word fragments (prefix: "alpha/bravo/delta/echo/...", descriptor: "alert/data/flank/guard/...", suffix: "north/south/east/west/primary/secondary/..."). D-pad navigates columns, A selects a fragment from each. The result: "bravo-flank-east." This eliminates on-screen keyboard use entirely while creating memorable, consistent channel names.

**Advanced: On-screen keyboard fallback.** A "Custom Name" option at the bottom of the channel picker opens the system keyboard for players who want full control. But the name generator should handle 90%+ of cases.

**Sensory description:** The channel picker slides out as an overlay from the right edge of the workbench panel, narrowing the board view. Each channel entry has a colored dot matching the channel's auto-assigned color (from an 8-color palette). Scrolling through channels plays a soft "tuning" sound. When a channel is focused, its wiring lights up on the board in the channel's color — connecting the hook being edited to all other units listening on that channel.

### Production Queue — The Conveyor Belt on a D-Pad

The production queue is a horizontal strip of blueprint icons. On PC, drag-to-reorder. On controller:

- D-pad left/right to navigate the queue
- A to select a blueprint (opens it in workbench)
- Y to "grab" (enter reorder mode) — then D-pad left/right to slide it, A to drop
- X to remove from queue (with confirmation: "Remove Scout-A from queue? A = Yes, B = No")
- LT radial wheel slice for "Add new blueprint" → opens unit type selector

---

## Sealed Watch — The Easiest Screen

The Sealed Watch is already minimal by design: no tools, no pause, no interaction. The player watches the battle unfold. This translates almost perfectly to controller.

### Button Mapping — Sealed Watch

| Input | Action |
|-------|--------|
| **Left Stick** | Pan camera (board center → edge) |
| **Right Stick** | — (unused, by design) |
| **D-Pad Left/Right** | Speed: 0.5× / 1× / 2× |
| **All face buttons** | — (no interaction during sealed watch — deliberate) |
| **LT** | — |
| **RT** | — |
| **Start** | Game menu (but NOT pause — sealed is sealed) |

The Sealed Watch is where the controller **matches or exceeds** the PC experience. On PC, the player's hand rests on the mouse with the urge to click something. On controller, the player leans back, holds the gamepad loosely, and watches. The controller's passivity is a feature here — it reinforces the "you've done your work, now observe" emotional beat. The gamepad becomes a theater seat.

**Sensory description:** The controller vibrates gently on each tick — a soft pulse synchronized to the tick clock pips, like a heartbeat. On combat events (one-shot-one-kill), a sharp haptic jolt in the right trigger. On signal delivery (green cell flash), a subtle buzz in the left grip. On buffer overflow (eviction), a brief rumble. The haptics turn the gamepad into a sensory extension of the battlefield — the player feels the battle's rhythm even when looking away from the screen.

**The haptic vocabulary:**

| Event | Haptic | Intensity | Duration |
|-------|--------|-----------|----------|
| Tick clock advance | Symmetric pulse, both grips | Light | 50ms |
| Signal delivered (green flash) | Left grip buzz | Light | 80ms |
| Unit eliminated (red flash) | Right trigger impulse | Strong | 120ms |
| Buffer overflow (eviction) | Asymmetric rumble, right grip | Medium | 150ms |
| Base damaged | Full controller rumble | Heavy | 300ms |
| Victory | Rising pulse pattern | Medium→Light | 800ms fade |
| Defeat | Descending pulse + silence | Medium→None | 500ms + dead stop |

This haptic vocabulary is **exclusive to controller players** — a genuine advantage over mouse-and-keyboard. The sealed watch on a gamepad is a richer sensory experience than on PC.

---

## Inspector — The Analytical Challenge

The Inspector is the post-battle debrief: scrubable timeline, click-to-inspect units, buffer state visualization, queue depth charts. On PC, this is mouse-heavy — click a unit, scrub the timeline, hover buffer slots to read their contents.

### Timeline Scrubbing

On PC, arrow keys step through ticks. On controller, this maps cleanly:

- **D-pad left/right:** Step one tick backward/forward
- **Left stick left/right:** Scrub continuously (speed proportional to stick deflection — gentle tilt = slow scrub, full tilt = fast)
- **LB/RB:** Jump to previous/next "event" (combat, eviction, signal delivery) — the bracket-key [ ] equivalent from PC

The continuous scrub via analog stick is **better than PC's arrow keys** — analog control of scrub speed is more precise than repeated key taps. The player can slowly ease through a contested moment at 1 tick per second, or slam the stick right to fast-forward through empty ticks.

### Unit Inspection

On PC, click a unit to inspect it. On controller:

- **Right stick:** Grid-snap cursor on the board (like Plan screen)
- **A:** Select unit under cursor → opens buffer state panel
- **B:** Deselect unit → closes panel
- **D-pad up/down (while unit selected):** Scroll through buffer slots
- **X:** Toggle queue depth chart for selected unit
- **Y:** Toggle channel metrics for selected unit

### Buffer State Visualization

Each buffer slot shows its contents at the current tick. On PC, hover a slot to expand its details. On controller, D-pad scrolls through slots, and the currently focused slot auto-expands. This is another case where controller's "persistent focus" actually improves on PC's ephemeral hover — the details stay visible until the player explicitly moves to another slot.

**Sensory description:** The buffer state panel appears on the right side of the screen (where the workbench lives on the Plan screen — same spatial position, different content). Each buffer slot is a horizontal bar. The focused slot expands vertically to show full contents: signal source, age in ticks, fidelity level, and a tiny wiring diagram showing which hook delivered it. Non-focused slots compress to colored pips — bright when occupied, dim when empty, pulsing gently when the slot was just filled (within the last 2 ticks of the current scrub position). The expansion animation takes 150ms with a soft elastic ease. A subtle "data read" sound — a short ascending blip — plays when the focus moves to a new slot.

### Button Mapping — Inspector

| Input | Action |
|-------|--------|
| **Left Stick** | Continuous timeline scrub (analog speed control) |
| **Right Stick** | Grid-snap cursor for unit selection |
| **D-Pad Left/Right** | Step one tick backward/forward |
| **D-Pad Up/Down** | Scroll buffer slots (when unit selected) / Scroll tool list (when no unit selected) |
| **A / ✕** | Select unit / Confirm |
| **B / ○** | Deselect / Back |
| **X / □** | Toggle queue depth chart |
| **Y / △** | Toggle channel metrics |
| **LB** | Jump to previous event |
| **RB** | Jump to next event |
| **LT (hold)** | Radial wheel: emission overlay, signal genealogy, channel filter, export replay |
| **RT** | Return to Plan screen (begin next iteration) |

---

## The Three Hardest Translation Problems

### Problem 1: Ordered Rule Lists

Rules are the heart of agent configuration. They're ordered condition→action pairs where **order determines priority** — the first matching rule fires. On PC, drag-to-reorder is instant and tactile. On controller, "grab and D-pad" reordering works but is slower. A Command agent with 8-10 rules requires significant D-pad travel.

**Mitigation:** "Quick move" shortcuts — while a rule is grabbed, LB jumps it to the top of the list, RB jumps it to the bottom. LT+up/down moves it 3 positions at a time. These power shortcuts reduce worst-case reordering from 9 D-pad presses to 3.

### Problem 2: Simultaneous Board + Workbench Awareness

On PC, the player can glance between the board and the workbench without moving anything — their eyes move, not their hands. On controller, board and workbench are separate focus groups requiring LB/RB to switch. The player loses the "glance" — every context switch is a deliberate action.

**Mitigation:** Preview Mode (described above) compensates by projecting workbench state onto the board. But the deeper fix is **the mini-map thumbnail.** When the workbench is the active focus group, the board shrinks to a 25% size thumbnail in the top-left corner of the screen, overlaying the board's full area. The thumbnail shows unit positions, channel wiring, and the current element's preview effect. This gives peripheral spatial awareness without requiring focus-group switching.

**Sensory description:** The mini-map thumbnail has a subtle vignette border — darker at the edges, fading to transparent at center. Channel wiring lines on the mini-map glow brighter than on the full board to compensate for the reduced size. The currently-previewed effect (perception radius, rule zone) pulses gently on the mini-map. When the player switches focus back to the board (LB), the thumbnail expands smoothly to fill the left half of the screen over 250ms.

### Problem 3: Channel Name Creation Without a Keyboard

Addressed above with the Name Generator pattern. But a deeper problem: **channel name discoverability.** On PC, typing a channel name creates it — the channel namespace is emergent and human-readable ("scout_alarm", "east_flank_data", "emergency_retreat"). On controller, the name generator produces structured names ("bravo-flank-east") that are systematic but lack the personal expressiveness of typed names.

**This is an acceptable tradeoff.** The structured names are actually better for the learning experience — they create a consistent namespace that's easier to remember across a complex multi-agent architecture. Expert players who want custom names can use the on-screen keyboard fallback. The name generator is training wheels that most players won't outgrow.

---

## Platform-Specific Considerations

### Xbox

Xbox's standard controller has **impulse triggers** — haptic motors in each trigger independently. The Sealed Watch haptic vocabulary exploits this: signal delivery buzzes the left trigger, combat jolts the right trigger, creating a left-right spatial mapping that matches the board's information flow (signals come from the left, combat happens on the right... or wherever the action is — the trigger assignment could be dynamic, mapping to the spatial position of the event on the board relative to center).

### PlayStation (DualSense)

The DualSense has **adaptive triggers** — variable resistance on L2/R2. The EXECUTE action (RT) could increase resistance as the player holds the trigger, requiring them to push through a "resistance gate" at ~80% travel before the command fires. This turns EXECUTE into a physical ritual — not an accidental press, but a deliberate pull through resistance. The feeling: "I'm sure. Deploy."

The DualSense also has a **built-in speaker and touchpad.** The speaker could play the tick clock during Sealed Watch — a tiny, personal metronome separate from the TV audio. The touchpad could serve as a precision pointer for fine workbench targeting — a hybrid between stick navigation and cursor control.

### Nintendo Switch

The Joy-Con **HD Rumble** supports extremely nuanced haptics — the Sealed Watch haptic vocabulary could include texture-like sensations (buffer overflow as a grinding buzz, signal delivery as a smooth pulse). In handheld mode, the screen is 6.2" — similar to a phone. The UI considerations from the mobile touch adaptation document (6.07) apply: the Plan screen may need the same tabbed/bottom-sheet treatment as mobile.

**Joy-Con separated play:** Each player holds one Joy-Con in a potential **asymmetric co-op mode** — one player manages the Plan screen workbench (left Joy-Con: D-pad for navigation, L for confirm, ZL for radial), while the other watches the Sealed Watch and handles Inspector debrief (right Joy-Con: stick for scrubbing, R for select, ZR for tools). This creates a unique "architect + analyst" co-op dynamic exclusive to Switch.

### Steam Deck

Already addressed in the PC/Steam document (6.05). The Steam Deck is a gamepad with trackpads — it uses the controller layout described here but with the trackpads available as precision pointers for workbench detail work. The recommended approach: left trackpad = quick radial access (tap zones mapped to the 8 radial slices), right trackpad = cursor mode for fine targeting when D-pad navigation is too coarse.

---

## Comparable Games: What Translates

### Into the Breach → Robot Uprising

Into the Breach's controller port is the closest comparable. Grid-based tactics, small board, discrete turns, information-dense planning phase. Into the Breach's controller solution: D-pad moves between units and grid tiles, face buttons for confirm/cancel/info, shoulder buttons for cycling through units and undoing moves. The grid-snapping cursor works perfectly because the board is small (8×8 for both games).

**What translates directly:** Grid cursor behavior, unit cycling (LB/RB to jump between your units on the board), undo mapping (B/○ as universal undo), and the "clean separation between planning and watching" that reduces the controller surface area per screen.

**What doesn't translate:** Into the Breach's planning phase is simpler — move a unit, choose an attack direction. Robot Uprising's planning phase is a full workbench with 4 sub-panels of configuration. Into the Breach never needs to solve the "edit a hook's channel assignment while previewing spatial effects" problem.

### XCOM 2 → Robot Uprising

XCOM 2's console port solved grid cursor + deep menu navigation. Their approach: analog stick for grid cursor (with snap behavior — the cursor "magnetically" pulls toward cover objects and interactable tiles), D-pad for menus, and a contextual radial menu for abilities.

**What translates:** The contextual radial menu concept — when a unit is selected, RT opens a radial showing that unit's abilities. For Robot Uprising, when a ghost unit is selected on the board, LT could open a radial showing "Edit Blueprint / Remove / Reposition / View Channels."

**What doesn't:** XCOM's unit configuration happens in a separate pre-mission screen (barracks), not on the tactical board. Robot Uprising's Plan screen merges configuration and placement — the controller must handle both simultaneously.

### Civilization VII → Robot Uprising

Civilization VII's radial menu approach — LB opens a wheel for system navigation — is the strongest model for Robot Uprising's shortcut access. The reception was overwhelmingly positive: "radial menus are in some instances better than PC."

**What translates:** The radial as primary shortcut access, the "hold button to open wheel, release to select" interaction, and the concept of radial menus being **faster** than PC shortcuts for common actions (no keyboard hunting).

### Slay the Spire → Robot Uprising

Slay the Spire's controller port proved that a game with 50+ interactive cards on screen at once can work on a gamepad. Their solution: left stick scrolls through cards, cards fan out and highlight when focused, A plays the focused card. Players reported it "plays better on controller than mouse."

**What translates:** The principle that focus-based navigation with rich preview state can be **superior** to cursor navigation for sequential browsing. Robot Uprising's rule list, hook slots, and buffer inspection are all sequential — the focus ring with auto-preview is the right model.

---

## Player Journeys

### Journey: Tomás, 16, First-Time Strategy Gamer (Xbox Series X)

**Context:** Mission 1, first ever session. Tomás bought the game because a TikTok showed a robot army doing something unexpected. He's never played a strategy game but plays Fortnite daily — he knows Xbox controllers intimately.

**Minute 0:00 — The Boot Log**
The game opens with the boot log text — Tomás reads it on his 55" TV from the couch. The text is large (console-optimized font size, 18pt minimum). He skips through with A. The Plan screen appears: board left, workbench right. A ghost Scout unit is pre-placed on the board. The right side shows the Scout's blueprint with the Skills tab active. A pulsing prompt reads "Press A to toggle PATROL."

**Minute 0:30 — Learning the Focus Ring**
Tomás presses A to toggle patrol on. The board immediately shows the Scout's patrol path as a dotted cyan line. He notices "RB → next section" in the bottom-right corner (standard controller prompt). He presses RB — the focus ring jumps from Skills to Rules. The rule list has one pre-placed rule: "IF enemy_detected → alert." The rule highlights amber in the list, and on the board, the Scout's perception radius lights up around the unit.

**Minute 1:00 — Discovery Through Preview**
Tomás D-pads down to the second (empty) rule slot and presses Y (Add Rule). The condition list opens — a vertical scrollable menu. He scrolls through conditions: "enemy_detected", "buffer_full", "signal_received"... Each one changes the board preview. When he scrolls to "enemy_in_range," the perception radius on the board tightens from a wide circle to a narrow cone. "Oh, that's different." He selects it, switches to the action column with RB, selects "evade." His first custom rule.

**Minute 1:30 — The EXECUTE Moment**
He sees the "RT = EXECUTE" prompt. He pulls the right trigger. On his DualSense— wait, he's on Xbox. He pulls RT. A satisfying click in the trigger (standard Xbox digital trigger response). The Sealed Watch begins. His controller starts pulsing gently on each tick. The Scout moves. Tick pulse. Moves again. Tick pulse. An enemy appears. His controller jolts — right trigger impulse. The Scout evades. His controller buzzes softly — left grip. The Scout survives. The tick clock runs out. Victory.

**Minute 2:30 — Inspector**
The timeline appears. Tomás uses the left stick to scrub — slow tilt, slow scrub. He finds the moment the enemy appeared. Right stick selects the Scout. Buffer panel opens on the right. He D-pads through buffer slots. Slot 3 is "enemy_detected: E2, confidence: 0.8, age: 0 ticks." He presses X — queue depth chart appears. The chart is simple — mostly green, one amber spike when the enemy was detected. He gets it: the buffer got busier when there was danger.

**Minute 3:30 — Back to Plan**
He presses RT to return to Plan. He wants to add a hook to alert other units. RB to Hooks tab. One empty hook slot. He presses A — the Channel Picker slides out. No existing channels. "[+ New Channel]" is highlighted. He presses A. The name generator appears: three columns. He picks "alpha" — "alert" — "primary." Channel "alpha-alert-primary" is created. He maps it to "on: enemy_detected → send: alpha-alert-primary." He's wired his first hook without typing a single letter.

**UI Annotations:**
- Controller prompts: always visible in bottom-right corner, context-sensitive (changes per focus group)
- Focus ring: 3px cyan border with soft outer glow, 2px darker than the element's base color
- Preview mode: always on, spatial effects render at 60% opacity to distinguish from actual game state
- Tab indicators: workbench tabs shown as 4 icons in the tab bar, the active tab has a filled icon, inactive tabs have outline icons
- RT EXECUTE: prompt pulses gently when all required configuration is complete

---

### Journey: Priya, 35, ML Engineer (PlayStation 5, DualSense)

**Context:** Mission 7, configuring a Command agent for the first time. She's played through Missions 1-6 on PS5 and is comfortable with the controller layout. She chose PlayStation because she prefers gaming on her couch after a day at her desk.

**Minute 0:00 — The Command Agent Challenge**
The Plan screen shows a complex battlefield. Three units are pre-placed (Scout, Relay, Striker). A new blueprint slot is empty — the mission briefing says to create a Command agent. Priya holds LT — the radial wheel appears. She flicks right to "Command" (slot 5). A ghost Command unit appears on the board with a hexagonal icon.

**Minute 0:20 — Navigating Six Hook Slots**
The Command agent has 6 hook slots — the most of any unit type. She presses RB twice to reach the Hooks tab. D-pad shows all 6 slots in a vertical list. She focuses slot 1 — the board preview shows... nothing. No channel wired yet. She presses A to open the Channel Picker. Three channels already exist from her other units: "alpha-alert-primary" (2 subscribers), "bravo-data-north" (1 subscriber), "charlie-guard-east" (1 subscriber). She selects "alpha-alert-primary" for hook 1 — the board lights up with wiring lines connecting the Command agent to the two units already on that channel.

**Minute 1:00 — The DualSense Advantage**
She configures hook 2 to listen on "bravo-data-north." As she selects it, the DualSense speaker emits a soft ping — the channel's sonic signature. The adaptive trigger on R2 has slight resistance — she's been noticing this subconsciously. Every time she presses R2 in a menu context, there's a tiny "click point" at about 30% travel, confirming her press. It's subtle, but it makes navigation feel precise.

**Minute 1:30 — Rules for a Command Agent**
RB to Rules. The Command agent's rules determine when it uses its meta-skills (reassign, reroute, prioritize). She adds a rule: "IF signal_count > 4 on alpha-alert-primary → reroute: bravo-data-north → alpha-alert-primary." This is the most complex rule she's built — it's a conditional channel merge.

On PC, she'd type the channel names. On PS5, she selects them from the Channel Picker dropdown embedded in the rule editor. D-pad navigates the dropdowns, A confirms. The board preview updates: a new wiring line appears, dotted (conditional — not always active), connecting the bravo and alpha channels through the Command agent.

**Minute 2:30 — The Stress Test**
She pulls R2 to EXECUTE. The DualSense's adaptive trigger resists at 80% travel — the "commitment gate." She pushes through. The haptic feedback shifts to the Sealed Watch vocabulary. She watches the Command agent sit stationary in the center of the board while her other units move. Tick 12: the Scout detects enemies. The controller pulses left (signal delivery). Tick 14: the Command agent's buffer fills — she can't see this, but the haptic shifts to a denser, faster pulse pattern. Tick 15: the Command agent reroutes the bravo channel — the board shows a channel line shifting. The Striker receives the rerouted intelligence. Tick 17: the Striker engages. Right trigger jolt. Enemy eliminated.

**Minute 3:30 — Inspector Debrief**
She selects the Command agent with the right stick. Its buffer panel shows 14 slots — the maximum. She D-pads through them slowly, reading each signal that arrived during the battle. Slot 7: "reroute_trigger: signal_count=5, action=merge(bravo→alpha)." She sees the exact tick where her rule fired. She presses RB to jump to that tick on the timeline. The board shows the state at the moment of reroute. "That's exactly what I configured." She smiles.

**UI Annotations:**
- DualSense adaptive trigger: R2 EXECUTE has 80% resistance gate, menu confirms have 30% click point
- DualSense speaker: soft ping per channel selection (pitch = hash of channel name)
- 14-slot buffer panel: scrollable with D-pad, 4 slots visible at once, scroll indicator (dots) on right edge
- Conditional rule preview: dotted line on board vs. solid for unconditional rules
- Command agent icon: hexagonal to distinguish from other unit types

---

### Journey: Kenji, 42, Factorio Veteran (Nintendo Switch, Handheld Mode)

**Context:** Mission 5, the first factory mission. Kenji has played 200+ hours of Factorio on PC and 50+ on Switch. He bought Robot Uprising on Switch because the "design systems, watch them run" pitch resonated immediately. He plays exclusively in handheld mode on his commute.

**Minute 0:00 — The Small Screen Problem**
The Switch screen is 6.2". The Plan screen's split view gives the board about 450px and the workbench about 350px. Text is small but readable — the game uses a minimum 14pt font on Switch (vs. 12pt on PC). Kenji immediately notices the workbench tabs — he's used to Factorio's single-window-at-a-time approach on Switch and recognizes the pattern.

**Minute 0:20 — Production Queue Management**
This is the first mission with a base and production queue. The conveyor belt strip appears at the bottom of the screen — 5 blueprint icons in a horizontal row. Kenji D-pads to the queue (it's the bottom focus group). He navigates left/right through blueprints. He wants to reorder: Scout first (cheap, fast intelligence), then Relay, then Striker. He highlights the Striker, presses Y to grab, D-pads left twice to move it behind the Relay, presses A to drop. The queue reorders with a satisfying "click-into-place" animation. "Just like Factorio's logistics priority," he thinks.

**Minute 0:45 — The Factory Rhythm**
He pulls ZR (the Switch's RT equivalent) to EXECUTE. The Sealed Watch begins. The base starts producing: a Scout spawns (conveyor animation — the blueprint icon slides left and a unit appears on the board). 8 ticks later, a Relay spawns. Kenji's Joy-Con HD Rumble delivers distinct haptic signatures per production event — a "mechanical assembly" grinding texture for unit spawns, completely different from the combat and signal haptics. He can feel the factory rhythm in his hands.

**Minute 1:30 — Inspector on Small Screen**
The Inspector on Switch handheld faces the same problem as mobile: limited screen real estate. The buffer state panel takes the full right half of the screen. But the timeline scrubber — normally a horizontal bar at the top — moves to the bottom of the screen on Switch handheld, where Kenji's thumbs naturally rest. Left Joy-Con stick scrubs the timeline with the same analog speed control. The reduced font size (14pt vs. 18pt on TV) is compensated by Kenji holding the Switch 14 inches from his face — effective angular size is similar.

**Minute 2:15 — The "Factorio Moment"**
Back in Plan. Kenji is configuring his third Relay — a chain that compresses Scout data, filters noise, and amplifies critical alerts to the Striker. He's wiring hooks between three units. The channel picker shows 5 channels now, each with subscriber counts. He selects channels from the list, watching wiring lines appear on the mini-map thumbnail in the top-left. When the full wiring diagram is visible — Scout→Relay-A (compress)→Relay-B (filter)→Relay-C (amplify)→Striker — he feels the same satisfaction as watching a Factorio belt network click into place. "This IS Factorio. But the belts are information."

**UI Annotations:**
- Switch handheld: 14pt minimum font, timeline scrubber moved to bottom (thumb zone), board slightly smaller than TV mode
- HD Rumble: texture-based haptics (grinding for production, smooth pulse for signals, sharp click for combat)
- Joy-Con gyro: subtle tilt to fine-tune board camera position (optional, off by default)
- Mini-map thumbnail: 20% screen size in top-left, always visible when workbench is focused, shows all wiring

---

## Strengths of the Controller Experience

1. **Haptic vocabulary creates a sensory layer that PC lacks.** The Sealed Watch becomes a multi-sensory experience — visual + audio + tactile. Players on controller feel the battle.
2. **Focus ring with preview mode replaces hover without losing information.** In some cases it's better — the preview persists rather than disappearing on cursor exit.
3. **RT as EXECUTE is more satisfying than Enter.** The physicality of a trigger pull matches the weight of the decision.
4. **Lean-back posture changes the relationship to complexity.** Playing on a couch, the player is more relaxed. The Plan screen becomes contemplative rather than frantic. This matches the "architect" fantasy better than the PC's "operator at a console" posture.
5. **Analog stick timeline scrubbing is superior to arrow keys.** Variable speed scrubbing through inspector debrief is the biggest controller win.

## Weaknesses of the Controller Experience

1. **Plan screen throughput is lower.** Configuring a complex architecture takes longer with D-pad navigation than with mouse clicks. A veteran player who can configure a Command agent in 30 seconds on PC will take 60-90 seconds on controller.
2. **No simultaneous board + workbench visibility** without the mini-map compromise. The PC player's ability to keep eyes on the board while hands are in the workbench is lost.
3. **Channel naming is constrained.** The name generator produces systematic names but lacks the expressiveness of free typing. "east-flank-panic-backup" on PC becomes "echo-alert-east" on controller.
4. **Text-heavy Inspector content is smaller.** Buffer slot details, signal metadata, and channel metrics require more reading on a TV at couch distance than on a monitor at desk distance.
5. **Button overload risk.** 14 inputs across 6 focus groups + radial wheel + preview mode + contextual face buttons. The learning curve for the button mapping is steeper than mouse-and-keyboard's point-and-click simplicity.

## Interaction Effects

- **Building blocks:** The focus ring + tabbed workbench strongly favors the **priority list** and **stances/postures** building block paradigms (sequential navigation is natural). It weakens the **node graph** paradigm (spatial connections need a cursor, not a focus ring) and the **mixing board** paradigm (sliders are awkward with D-pad — left/right increments lack the analog feel of mouse drag).
- **Onboarding:** Controller tutorials need gamepad-specific prompts. The Mission 1 filter puzzle ("drag noise out of the buffer") must show "A to select, X to remove" instead of "click and drag." The tutorial recognizes input method on first interaction and adapts all prompts — no dual display.
- **Mobile:** Switch handheld mode shares many constraints with mobile (small screen, thumb-zone ergonomics). The workbench tab pattern and bottom-anchored timeline scrubber should be shared between mobile touch and Switch handheld.
- **Audio:** The haptic vocabulary must coordinate with the audio design — haptic events shouldn't duplicate audio events but complement them. Signal delivery = audio ping + left grip buzz. Combat = audio crack + right trigger jolt. The combination is more impactful than either alone.
- **Multiplayer/PvP:** Controller input is inherently slower than mouse/keyboard in the Plan phase. Cross-platform PvP with shared timers (Sealed Duel format) would disadvantage controller players. Async PvP (Ghost Ladder, Gauntlet) eliminates this — no shared time pressure.
- **Accessibility:** Controller play is itself an accessibility feature — players with certain motor disabilities find gamepads easier than mouse/keyboard. But the D-pad navigation depth (many presses to reach deep UI elements) creates a separate accessibility concern. Remappable controls + "jump to" shortcuts (hold LT + face button to jump directly to a workbench tab) are mandatory.

## Comparable Games Summary

| Game | Controller Approach | What Robot Uprising Takes |
|------|--------------------|--------------------------|
| Into the Breach | Grid cursor + D-pad menus + shoulder cycling | Grid-snap board cursor, LB/RB unit cycling, clean screen separation |
| XCOM 2 | Grid cursor + contextual radial + snap-to-cover | Magnetic grid snap, contextual radial per selected element |
| Civilization VII | Radial wheel for system navigation | LT radial as primary shortcut access, "better than PC" aspiration |
| Slay the Spire | Focus-based card browsing + rich preview | Focus ring with auto-preview for sequential UI elements |
| Factorio | Virtual cursor (problematic) → grid snap (improved) | Avoid virtual cursor lesson; grid snap only for board |
| Gladiabots | No console port | — (confirms the difficulty of porting visual programming to controller) |

## The TikTok Clip

Split screen. Left: a player hunched over a keyboard, hands flying across shortcuts, eyes darting between board and workbench, configuring an elaborate multi-agent network. Right: a player on a couch, controller in hand, feet up, configuring the **exact same network** — LT radial wheel spins, D-pad clicks through rules, RT deploys. Both players watch the same Sealed Watch battle. The controller player's hands relax. Their controller pulses with the tick clock. Their face shows the same satisfaction. Caption: "Same game. Different vibe." The message: you don't lose depth on a gamepad. You gain comfort.

---

## New Aspects Discovered

- **6.06a — Haptic vocabulary as game design language:** The complete specification of controller vibration patterns as meaningful game signals — distinct patterns per event type, platform-specific exploitation (DualSense adaptive triggers, Joy-Con HD Rumble), haptic tutorialization, and the question of whether haptic information conveys gameplay-relevant data or is purely aesthetic
- **6.06b — DualSense adaptive trigger resistance as commitment ritual:** The EXECUTE resistance gate concept — whether variable trigger resistance creates meaningful decision weight or just fatigue; other adaptive trigger uses (resistance scaling with production queue cost, trigger softening when resources are abundant)
- **6.06c — Joy-Con separated asymmetric co-op:** The "architect + analyst" co-op mode where each player holds one Joy-Con — one manages Plan, one manages Inspector; full design of the role split, handoff moments, and what this means for the two-act debrief structure
- **6.06d — Cross-platform input parity for PvP:** Whether controller players face systematic disadvantage in timed PvP formats; input-speed normalization (longer Plan phase timer for controller players), input-blind matchmaking, or async-only as the equalizer
- **6.06e — Controller-specific onboarding tutorial branch:** Dedicated first-five-minutes experience for controller players with gamepad-appropriate prompts, D-pad navigation teaching, radial wheel introduction, and preview mode discovery — versus a single adaptive tutorial that swaps prompts based on detected input
