# 6.07 — Mobile/Touch Adaptation: How Robot Uprising Works on a Phone

## Overview

Robot Uprising is locked to React + Pixi.js + Vite — a web stack. This is simultaneously the greatest gift and the hardest constraint for mobile adaptation. There's no native app binary to optimize. The game runs in a mobile browser or a PWA wrapper. Every interaction designed for mouse and keyboard must translate to thumbs on glass, on screens ranging from 5.5" phones to 12.9" tablets.

The core challenge isn't "can it run?" — it's "can you configure a Command agent's 6 hook slots, 14-buffer context config, and ordered rule list on a 375×812 viewport using only your thumbs, without wanting to throw your phone into the ocean?"

This document explores every major surface of the game through the lens of touch adaptation: the Plan screen workbench, the Sealed Watch battlefield, the Inspector debrief, and the campaign flow. For each, we examine what breaks, what translates cleanly, and what needs full redesign.

---

## The Five Brutal Constraints of Phone Screens

### 1. The Fat Finger Problem
A fingertip covers approximately 45×45 CSS pixels — an area roughly the size of an entire tile on an 8x8 grid rendered on a phone screen in portrait mode. On a 375px-wide viewport, the board is ~340px across after padding. Each tile is ~42px. Your finger literally covers the tile you're trying to tap. You can't see what you're selecting.

**Into the Breach's solution:** The Netflix mobile port uses a "tap to select, tap destination to confirm" two-step pattern. No drag. The selected tile highlights, and valid destinations glow. Your finger lifts before you commit. Robot Uprising must adopt this pattern for all grid interactions.

### 2. The Split-View Impossibility
The Plan screen's locked layout is "board left, workbench right." On a 1920×1080 desktop, this is generous. On a 375px-wide phone, a side-by-side split gives each panel ~180px — too narrow for either the board or the blueprint editor to function. The split-view layout **cannot work on phones.** It must become a stacked or tabbed layout.

### 3. Finger Occlusion
When you touch the bottom half of a phone screen, your hand blocks 30-40% of the display. Rule lists, production queues, and any bottom-anchored UI must account for the fact that interacting with them makes them invisible. The "thumb zone" ergonomics research (Steven Hoober, 2013) shows that comfortable one-handed reach on modern phones is an arc from the bottom-right corner — everything outside that arc requires a stretch or a second hand.

### 4. No Hover State
Desktop UI relies heavily on hover for progressive disclosure: hover a channel name to highlight wiring on the board, hover a rule to preview its effect, hover a unit to see its perception radius. Touch has no hover. Every hover-dependent interaction needs a replacement — typically tap-to-preview with a dismiss gesture, or long-press.

### 5. Text Entry Friction
Channel names are created by typing. On desktop, typing "alarm" into a hook's channel field is instant. On mobile, the soft keyboard slides up, covers half the screen, and requires mode-switching for symbols. If channels use naming conventions (e.g., "scout_alarm_north"), mobile text entry becomes a friction multiplier. Autocomplete and preset channel names become mandatory, not optional.

---

## Plan Screen — The Core Redesign Challenge

The Plan screen is where the player spends 60-70% of their time. It's the workbench. On desktop, it's a split view: board left, blueprint editor right. On mobile, this requires a fundamentally different layout.

### Option A: "The Drawer" (Bottom Sheet Pattern)

**How it works:** The board fills the full screen. The workbench lives in a bottom sheet — a panel that the player swipes up from the bottom edge. The sheet has three snap points: **peek** (shows production queue as a horizontal strip at the bottom, ~80px tall), **half** (shows the blueprint editor's top-level: unit type selector, skill toggles, rule count badge), and **full** (shows the complete blueprint editor, pushing the board up and off-screen or scaling it down into a mini-map thumbnail).

**The interaction flow:**
1. Board is visible. Ghost units show on the grid. Player taps a ghost unit to select it.
2. Bottom sheet auto-rises to half-height, showing that unit's blueprint summary.
3. Player swipes sheet to full to edit rules, hooks, context config.
4. While editing, the board shrinks to a 120px thumbnail in the top-left corner, still showing channel wiring as colored threads.
5. Player swipes sheet down to return to board view.
6. EXECUTE button floats as a persistent FAB (floating action button) in the bottom-right, above the sheet.

**Sensory description:** The bottom sheet has a subtle frosted-glass blur over the board beneath it. A thin handle bar (40px wide, 4px tall, rounded, medium grey) sits centered at the top of the sheet. When swiped up, the sheet rises with a physics-based spring animation — slight overshoot, settle. The board behind it dims to 60% opacity and scales down smoothly. The transition takes 250ms. Haptic feedback: a light tap when the sheet locks into each snap point.

**Strengths:**
- Familiar pattern (Google Maps, Apple Maps, Uber, every modern app with a bottom sheet).
- Board remains partially visible even during editing — channel wiring context isn't lost.
- Works in portrait orientation, which is how 85% of mobile users hold their phone.
- No mode-switch confusion — the sheet is always there, just at different heights.

**Weaknesses:**
- Full blueprint editing requires the sheet at full height, which covers the board. The player loses spatial context exactly when they need it most (configuring perception radii, placing waypoints).
- The bottom sheet pattern implies casual browsing, not deep configuration. There's a mismatch between the weight of the interaction (building a complex agent) and the lightness of the UI metaphor.
- Swipe-up conflicts with OS gesture navigation on modern Android (swipe up from bottom = home).

### Option B: "The Flip" (Two-Face Pattern)

**How it works:** The Plan screen has two full-screen modes, toggled by a persistent tab bar at the top (two tabs: 🗺️ Board | 🔧 Config). The Board tab shows the full 8x8 grid with ghost units, channel wiring overlay, and a horizontal production queue strip at the bottom. The Config tab shows the full blueprint editor — skill toggles, rule list, hook config, context sliders — as a scrollable full-screen panel. Tapping a unit on the Board tab switches to Config with that unit's blueprint loaded. Tapping "Show on Board" in Config switches back with that unit highlighted.

**The interaction flow:**
1. Player sees the full board. Ghost units are placed. Channel wiring lines pulse gently.
2. Player taps a ghost Scout. Tab bar indicator slides to "Config." Screen flips (card-flip animation, 300ms) to show Scout blueprint.
3. Player edits rules: drags "IF buffer contains threat_detected" above "IF idle." Drag handles are oversized (56px tall per rule row).
4. Player taps "Show on Board." Screen flips back. The Scout's perception radius glows on the board — immediate spatial feedback from the config change.
5. Player taps EXECUTE (FAB, bottom-right, both tabs).

**Sensory description:** The tab bar is 48px tall, anchored at the top below the status bar. Active tab has a 3px bottom border in electric cyan. The flip transition is a horizontal card rotation — the board appears to physically flip over, revealing the config panel on the "back." A soft whoosh sound (150ms, low frequency) accompanies the flip. During the flip, the board's pixel art briefly shows on the rotating edge, reinforcing the "two sides of one object" metaphor.

**Strengths:**
- Each mode gets the full screen. No cramming.
- The flip metaphor is memorable and learnable. "Flip to configure, flip to deploy."
- Blueprint editor can use generous touch targets because it has 375px of width to itself.
- Works for both portrait and landscape orientation.

**Weaknesses:**
- Loses simultaneous board + config context. On desktop, you see your rule change AND its spatial effect instantly. Here, you must flip back to check.
- Frequent flipping becomes tedious for iterative tuning. A player tweaking a rule, checking the board, tweaking again, checking again — each check is a 300ms animation + cognitive context switch.
- The production queue must be duplicated or summarized on both tabs.

### Option C: "The Tray" (Slide-In Side Panel)

**How it works:** In landscape orientation, the board fills the left 60% of the screen. The workbench slides in from the right edge as a 40% side panel. This is essentially the desktop layout adapted for landscape phones and tablets. The panel has a grab edge (thin vertical strip, 20px wide) that the player swipes left to open or right to dismiss.

**The interaction flow:**
1. Player rotates phone to landscape. Board fills the view.
2. Player swipes left from the right edge. Config panel slides in, pushing the board to ~225px.
3. Board remains interactive (tap to select units). Config panel shows blueprint for selected unit.
4. Player can dismiss the panel to see the full board at any time.

**Sensory description:** The side panel has a subtle shadow on its left edge — a vertical gradient from transparent to 20% black, 8px wide. The panel slides in with a spring animation (200ms, slight bounce). The board compresses horizontally with a smooth scale transform. Board tiles get narrower but remain tappable (minimum 36px in compressed state). Channel wiring lines adjust their endpoints in real time during the panel animation.

**Strengths:**
- Closest to the desktop experience. Minimal redesign needed.
- Simultaneous board + config view maintained.
- Tablets (10"+) handle this layout beautifully — essentially identical to desktop.

**Weaknesses:**
- Requires landscape orientation. Most mobile players prefer portrait. Forcing landscape for Plan but allowing portrait for Sealed Watch creates inconsistency.
- On phones (< 6.5"), the compressed board tiles drop below minimum touch target size. The board becomes view-only (look but don't touch) while the panel is open — which defeats the purpose of simultaneous view.
- The right-edge swipe conflicts with iOS's swipe-right-from-left-edge to go back.

### Recommendation for Mobile Plan Screen

**Tablets (10"+):** Option C (Side Panel). It's the desktop layout and works beautifully at tablet widths.

**Phones in landscape (> 6"):** Option C with the constraint that the board is view-only (no tap interactions) while the config panel is open. Tap the board area to dismiss the panel.

**Phones in portrait:** Option B (The Flip) with one critical enhancement — a **mini-map preview strip**. When in Config tab, a 64px-tall horizontal strip at the top shows a tiny rendering of the board with the selected unit's perception radius and channel wiring. The strip is non-interactive but provides the spatial context that pure flipping loses. Tapping the strip expands it briefly (200ms) to 50% height, then shrinks back — a "peek" gesture.

---

## Blueprint Editor — Touch-Native Redesign

The blueprint editor is the densest, most interaction-heavy screen in the game. On desktop, it's a config panel with:
- Skill toggles (checkboxes)
- Rules (ordered condition→action pairs, drag to reorder)
- Hooks (channel name + trigger event + hook slot assignment)
- Context config (buffer size display, listen/ignore toggles, eviction priority selector)

### Rules: Drag-to-Reorder on Touch

Rules are ordered. Priority matters. On desktop, you drag a rule row up or down. On touch, drag-to-reorder requires special care.

**Pattern: "Press-Hold-Drag with Haptic Feedback"**
- Player long-presses a rule row (300ms hold threshold).
- Haptic buzz confirms the grab. The row lifts visually — 4px shadow appears beneath, row scales to 105%, other rows spread apart to create a gap.
- Player drags vertically. The row follows the finger with 0px offset (finger position = row center, so the finger is ON the row, but the row is lifted above via shadow, reducing occlusion).
- Release drops the row. Other rows close the gap with a spring animation.
- The number badges (priority indicators) on each row re-sort in real time during the drag.

**Touch target size:** Each rule row is 64px tall (minimum). On a 812px viewport (iPhone 14), this allows ~10 visible rules before scrolling. The Command unit with complex configs might have 8-12 rules — manageable.

**Alternative: "Nudge Buttons"**
For players who find drag finicky, each rule row has ▲ and ▼ buttons on the right edge (32×32 each). Tap ▲ to move the rule up one position. Less fluid but zero ambiguity. This is how Gladiabots's mobile behavior tree handles reordering — small arrow buttons beside each node.

### Hooks: Channel Name Input

The locked design says channels emerge from typing a name into a hook's channel field. On mobile, this means keyboard invocation.

**Touch adaptation:**
- First hook config: a standard text input. Soft keyboard appears. Player types "alarm."
- All subsequent hooks: the text input shows an autocomplete dropdown listing all existing channel names. Tapping a name fills the field without opening the keyboard. The dropdown is scrollable, with channels sorted by most-recently-used.
- **Quick-assign gesture:** If the player has previously created channels, a horizontal chip row (scrollable, 44px tall pills labeled "alarm", "intel", "cover_me") appears above the text input. Tap a chip to assign. No keyboard needed for common channels.

**Sensory:** The autocomplete dropdown has a thin 1px border in the channel's assigned color. Each channel chip pill is color-coded (first channel = cyan, second = amber, third = magenta, etc.) matching the channel wiring colors on the board. The connection between "the amber chip I tapped" and "the amber wire on the board" is instant and non-verbal.

### Context Config: Sliders and Toggles

Buffer size is fixed per unit type (not player-configurable). Listen/ignore toggles are binary switches. Eviction priority is a selector.

**Touch adaptation:** This is the easiest panel to adapt. Toggle switches at 56px wide (iOS-standard). Eviction priority as a segmented control (3-4 options, each 80px wide, horizontal scroll if overflow). No special redesign needed.

---

## Sealed Watch — The Easy Screen

The Sealed Watch is the most touch-friendly screen in the game by design. It's a view-only experience. No controls, no tools, no pause, no skip. The player just watches.

**What needs adaptation:**
- **Speed controls (0.5x / 1x / 2x):** Three-segment toggle at the top of the screen. 48px tall, 120px wide total. Tap to switch. No issues.
- **Buffer bars on units:** Tiny colored pips at the bottom of each tile. On a phone, these are ~4px tall per pip. Barely visible. **Enhancement:** On tap-and-hold of a unit during Sealed Watch, a loupe (magnifying circle, 120px diameter) appears above the finger showing the unit zoomed 3x with buffer bars clearly visible. Release to dismiss. This adds an interaction to the supposedly interaction-free screen — but it's read-only, purely optical. It doesn't change the sealed rule.
- **Tick clock:** Horizontal pips at the top. Works unchanged.

**Sensory adaptation:** The 1-second-per-tick rhythm is felt through subtle haptic taps — a barely-perceptible buzz on each tick resolution. The player's phone becomes a metronome. When a combat flash (red cell) fires, a stronger haptic pulse accompanies it. When a signal delivery (green flash) happens, a medium pulse. The haptics create a physical layer of information that compensates for the small visual scale. You FEEL the battle even when you can't see every pip.

**The TikTok clip for mobile:** Someone holding their phone, watching the 8x8 grid. Tiny units snap around. Suddenly — three tiles flash red simultaneously. The phone buzzes in their hand. Their eyes go wide. They whisper "no no no—" and then a fourth red flash takes out their base. They groan. The sealed watch's emotional punch works BETTER on mobile because the phone is in their hand, vibrating with each kill. It's intimate. Desktop is observing. Mobile is holding.

---

## Inspector — The Redesign-Heavy Screen

The Inspector is the most complex screen: timeline scrubber, click-to-inspect, queue depth chart, buffer state detail, channel metrics. On desktop, this is a sidebar-heavy analytical dashboard. On mobile, it requires a completely different information architecture.

### Timeline Scrubber

Desktop: a horizontal bar replacing the tick clock. Arrow keys step through ticks.

**Touch adaptation:** The scrubber becomes a swipeable horizontal strip at the bottom of the screen (80px tall). Tick markers are evenly spaced. The player drags left/right to scrub. The current tick is centered and enlarged. Tapping the strip's left/right edges steps one tick forward/back. Pinch-to-zoom on the scrubber changes the tick density — zoomed in shows individual ticks with more space between them, zoomed out shows the whole match as a compressed timeline.

**Sensory:** Each tick the player scrubs past produces a tiny haptic click — like scrolling a physical dial. The board above updates in lockstep. The click-click-click of scrubbing through a battle, watching units snap between positions, creates a tactile filmstrip experience. Fast swipes produce a rapid flutter of clicks.

### Click-to-Inspect

Desktop: click a unit, sidebar shows buffer state at current tick.

**Touch adaptation:** Tap a unit on the board. A full-screen overlay slides up (bottom sheet pattern) showing that unit's buffer contents at the current tick. Each buffer slot is a card (48px tall, full width) showing the entry type, source, and age. Filled slots are bright. Empty slots are dim outlines. Dropped signals appear as faded ghost entries with a red strikethrough.

The overlay has the timeline scrubber duplicated at the bottom — the player can scrub time while inspecting, watching the buffer fill and evict in real time. This is the mobile killer feature: hold the phone, scrub with your thumb, watch the buffer cards animate in and out, feel the haptic clicks as you move through time.

### Queue Depth Chart

Desktop: bar chart of buffer fill over time.

**Touch adaptation:** The chart becomes a sparkline embedded in the unit inspection overlay — a thin (32px tall) horizontal graph showing fill percentage over time. The current tick is marked with a vertical line. The player can tap the sparkline to jump to any tick. Color coding: green region (0-50% fill), amber region (50-75%), red region (75-100%). The sparkline is not interactive beyond tap-to-jump — the full chart is available on tap-to-expand.

---

## Production Queue — The Conveyor Belt on Touch

The locked design describes the production queue as a "horizontal strip of blueprint icons, drag to reorder." On desktop, this is a ribbon at the bottom of the workbench.

**Touch adaptation:**
- The conveyor belt is a horizontally scrollable strip, 72px tall, showing blueprint thumbnails (56×56 each).
- Tap a blueprint to select it (opens its config in the blueprint editor).
- Long-press to grab, drag horizontally to reorder. Other icons slide apart.
- Swipe a blueprint upward off the strip to remove it from the queue (with a "poof" particle animation and haptic confirmation).
- Tap a "+" icon at the end of the strip to add a new blueprint from a template picker (full-screen modal with unit type cards).
- Cost preview: each blueprint thumbnail shows a tiny mineral/energy cost badge in its bottom-right corner. Total cost is displayed as a running sum at the right edge of the strip.

**Sensory:** The conveyor belt has a subtle horizontal scroll momentum — flicking it makes the icons slide with physics-based deceleration. The "+" button gently bobs up and down on a 4-second cycle (breathing animation) when the queue is empty, drawing attention. When a blueprint is swiped away, it rises, shrinks, and dissolves into pixels over 200ms.

---

## Player Journeys

### Journey: Mika, 16, High School Student, iPhone 14

**Context:** Mission 3. She's on the bus home. She's played two missions on her laptop and wants to try on her phone. She's already configured scouts and knows about buffers.

**Minute 0:00 — Opening the Game**
She opens the PWA (saved to home screen as "Robot Uprising" with the cyan robot icon). A splash screen loads (Pixi.js canvas initialization takes 1.8 seconds on mobile — she sees the boot log text scrolling while assets load). The campaign screen appears. Mission 3 is highlighted with a pulsing "NEW" badge. She taps it.

**Minute 0:15 — The Plan Screen (Portrait)**
The 8x8 board fills her screen. Two ghost scouts and one ghost relay are pre-placed. Channel wiring (thin amber lines from scouts to relay) pulses gently. The bottom peek strip shows the production queue: [Scout] [Scout] [Relay]. She notices the Config tab in the top tab bar. She taps the relay ghost on the board.

**Minute 0:25 — Flipping to Config**
The screen flips (card-flip animation). The Relay blueprint fills the screen. She sees the mini-map strip at the top — a tiny board showing the relay's position with its hook range indicator. Below: Skill toggles (compress ✓, filter ☐, amplify ☐). Rules section showing two rules. Hook config with two filled slots: Hook 1 → "scout_data" channel, Hook 2 → empty. The context config section at the bottom: buffer size 12, listen channels listed as chips ("scout_data" in cyan).

**Minute 0:45 — Editing a Hook**
She taps Hook 2's empty channel field. The autocomplete dropdown appears showing existing channels: "scout_data" (cyan chip). Below, a text input with "Type new channel name..." placeholder. She wants a new channel. She taps the text input. Soft keyboard slides up. She types "relay_out." The keyboard auto-suggests "relay_output" based on common patterns. She taps "relay_out" and hits done. The keyboard dismisses. A new amber chip appears: "relay_out." On the mini-map strip, a new amber wiring line appears from the relay — she can see the channel is connected even from this tiny preview.

**Minute 1:20 — Reordering Rules**
She wants rule 2 to have higher priority than rule 1. She long-presses rule 2 (the row highlighting with "IF incoming signal → compress and forward to relay_out"). A haptic buzz confirms the grab. She drags it above rule 1. The rows swap with a spring animation. Priority numbers update: what was #2 is now #1. She releases. Haptic tap.

**Minute 1:40 — Flipping Back to Board**
She taps the Board tab. The screen flips back. The relay's channel wiring now shows two lines (cyan incoming, amber outgoing). She nods. She taps EXECUTE (the FAB in the bottom-right — electric cyan circle with a ▶ icon, 56px diameter).

**Minute 1:50 — Sealed Watch**
The board fills the screen. Tick clock at the top: [1][2][3]... Scouts begin patrolling. She holds her phone, watching. Tick 4: a scout spots an enemy. Green flash on the relay tile (signal received). Tick 5: amber flash on the relay (signal forwarded). Her phone buzzes gently with each flash. Tick 8: a striker (not yet available in her mission) appears on the enemy side. Her scout evades — red afterimage, phone buzzes harder. She whispers "oh no." Tick 12: mission complete. Her scout network mapped the enemy positions successfully. "MISSION PASSED" appears in white text on a dark overlay, with her run stats below.

**Minute 2:30 — Inspector**
The inspector overlay appears. Timeline scrubber at the bottom. She taps her relay on the board. The inspection sheet slides up showing 12 buffer slots. She drags the scrubber left — click, click, click — watching the buffer fill over time. At tick 4, slot 1 fills with "enemy_scout detected at E3" (cyan). At tick 5, the compress skill fires and two slots merge into one compressed entry. She sees the queue depth sparkline: gentle rise, then a dip at the compress tick. She gets it. Compression saves buffer space.

**Minute 3:30 — Back on the Bus**
She closes the game. Total session: 3.5 minutes. She configured an agent, watched a battle, and understood compression — all with her thumbs on a bus.

**UI Annotations:**
- Tab bar: 48px tall, top of screen, two tabs with icons + labels, active tab cyan underline
- FAB (EXECUTE): 56px diameter, bottom-right, 16px margin from edges, electric cyan, persistent on both tabs
- Mini-map strip (Config tab): 64px tall, top of config view, non-interactive, shows wiring
- Rule rows: 64px tall, with priority number badge (24px circle, left), condition→action text (center), drag handle (right, ≡ icon, 24px)
- Channel chips: 44px tall pills, color-coded, horizontally scrollable
- Timeline scrubber: 80px tall, bottom of Inspector view, tick marks at 16px intervals, haptic per tick

---

### Journey: David, 42, Backend Engineer, Samsung Galaxy S24 Ultra (6.8" screen)

**Context:** Mission 7. He's been playing on his desktop PC but wants to tune his configs during lunch break at work. He's building a command agent for the first time. Cross-device sync via cloud save.

**Minute 0:00 — Loading Saved State**
He opens the PWA. The game detects his cloud save and loads Mission 7. The Plan screen appears with his existing army: 3 scouts, 2 strikers, 2 relays, 1 command agent (new). The board is dense — 8 ghost units with overlapping perception radii and 5 channel wiring lines creating a web of connections.

**Minute 0:20 — Landscape Mode**
The board is too cluttered in portrait. He rotates his phone to landscape. The board shifts to the left 60% of the screen. A thin grab edge appears on the right. He swipes it left — the config panel slides in, compressing the board. On his 6.8" screen, the compressed board tiles are 38px each — tight but usable for viewing. The config panel is 280px wide — enough for the blueprint editor.

**Minute 0:40 — Configuring the Command Agent**
He taps the command unit on the compressed board. Its blueprint loads in the config panel. He sees: 14 buffer slots (displayed as a mini progress bar), 6 hook slots (3 filled, 3 empty), and the command's unique skills: reassign, reroute, prioritize. The skills have info buttons (ℹ️ circles, 32px). He taps "reassign" — a tooltip expands below: "Change a subordinate unit's active skill for N ticks."

**Minute 1:10 — Hook Wiring Challenge**
He needs to wire hook slot 4 to a new channel called "command_override." The channel field shows the autocomplete dropdown with existing channels: "scout_data", "relay_out", "alarm", "intel", "cover_me." Five channels already. He scrolls the dropdown. "command_override" doesn't exist. He taps the text input. The keyboard appears — on landscape Samsung, it takes the bottom 45% of the screen. The config panel content scrolls up to keep the input visible. He types "command_override" quickly (he's a fast typist even on mobile). Done. Keyboard dismisses.

The board now shows a new wiring line from the command unit — thick, magenta, pulsing slightly to indicate it's a command-level channel. Even compressed, the wiring hierarchy is visible: cyan for scout data, amber for relay, magenta for command.

**Minute 2:00 — Rule Complexity**
The command agent has 8 rules. He needs to reorder them. He tries long-press drag — it works, but on the 280px-wide config panel, his finger occludes the rule text. He can't read what he's moving. He switches to nudge buttons (▲ ▼) on the right edge of each rule. Tap ▲ ▲ to move rule 6 up to position 4. Each tap produces a haptic click and the rules animate into their new positions.

He adds a new rule: "IF subordinate_buffer > 80% THEN prioritize(oldest_first)." The condition picker is a scrollable list of conditions (each 56px tall, plain language). The action picker is a grid of skill icons. He taps "prioritize" → a sub-picker shows eviction policies: "oldest_first", "lowest_fidelity", "duplicate_first." Each option is a 48px tall row with a description. He selects "oldest_first."

**Minute 3:30 — Testing Before EXECUTE**
He swipes the config panel closed. The board expands back to full landscape width. He studies the wiring: cyan scout→relay, amber relay→striker, magenta command→all. The command unit's perception radius is "None" (stationary) but its 6 hook connections spread across the board like a nerve center. He's satisfied. He taps EXECUTE.

**Minute 3:45 — Sealed Watch (Landscape)**
The board fills the landscape screen. Wider aspect ratio means more horizontal space — the tick clock and buffer bars are clearer than portrait. The battle plays out. Tick 14: the command agent's reassign fires — a striker's skill switches from "engage" to "evade" (a violet flash on the unit, indicating a command-level change). David's eyes light up. The meta-level works. He's not controlling units. He's controlling the controller.

**Minute 5:00 — Quick Debrief**
He taps into the Inspector. Timeline scrubber, landscape layout. He taps the command unit. Its 14-slot buffer inspection card fills the right panel. He scrubs to tick 14 — the reassign decision. Buffer contents at that tick: slot 1-3 are subordinate status reports, slot 4 is a "buffer_critical" alert from striker-2, slot 5 is the compressed scout data. The command agent acted on the alert. David sees the causal chain. He screenshots it for his engineering Slack channel: "same concept as our service mesh circuit breaker, but in a game."

**UI Annotations:**
- Landscape board: 60% screen width, tiles ~50px on 6.8" phone
- Config panel: 40% width, slide-in from right, spring animation
- Grab edge: 20px wide vertical strip, subtle shadow
- Hook slots: displayed as 6 small circles in a 3×2 grid, filled = colored, empty = dashed outline
- Nudge buttons: 32×32 ▲/▼, right-aligned per rule row, visible only in touch mode
- Command wiring: magenta color, thicker line weight (3px vs. 2px for normal channels)

---

### Journey: Aiko, 68, Retired Teacher, iPad Air (10.9")

**Context:** Mission 5, first time using the factory. She's been playing entirely on the iPad. She has arthritis in her right hand and uses an Apple Pencil sometimes for precision. She's never played a strategy game before.

**Minute 0:00 — Mission Briefing**
The boot log scrolls on her iPad screen. New text appears: "> PRODUCTION SUBSYSTEM: ONLINE. Blueprint queue initialized. Your base can now manufacture units." She reads carefully. A "Continue" button (large, centered, 200px wide) appears. She taps it with the Pencil.

**Minute 0:20 — Plan Screen (Tablet)**
The iPad's 10.9" screen shows the full desktop-style layout: board left, workbench right. The side-by-side split works beautifully at tablet resolution — each panel gets ~500px. Tiles on the board are 56px each. Comfortable touch targets even for her arthritic fingers. She doesn't need the mobile adaptations (no flip, no bottom sheet). The production queue conveyor belt sits at the bottom of the workbench panel.

**Minute 0:40 — Learning the Factory**
The conveyor belt is empty. A pulsing "+" button invites her to add a blueprint. She taps it with the Pencil. A modal appears: five unit type cards (Scout, Striker, Relay, Specialist, Command — the latter two grayed out as "LOCKED"). Each card is 120px wide with the unit icon, name, cost badge, and a one-line description. She taps "Scout." A new Scout blueprint thumbnail appears on the conveyor belt. The ghost unit preview appears on the board at the factory's output position.

**Minute 1:10 — Drag-to-Place with Apple Pencil**
She wants to set the scout's patrol path. She taps the ghost scout on the board. Waypoint mode activates — the board shows a grid overlay with valid positions highlighted in soft blue. She taps tiles with her Pencil: D2, D5, G5, G2 — a rectangular patrol. Each tap creates a numbered waypoint dot (cyan circle with "1", "2", "3", "4"). A dotted line connects them in order. She accidentally taps E3 — she wants to remove it. She long-presses E3 — a "Remove waypoint" tooltip appears. She taps it. E3 disappears and the path renumbers.

The Apple Pencil makes precision tapping effortless. Her arthritis doesn't matter — the Pencil's tip is precise, the tiles are generous, and there's no need for rapid or forceful input.

**Minute 2:00 — Building the Queue**
She adds three more blueprints: another Scout, a Striker, a Relay. The conveyor belt now shows: [Scout] [Scout] [Striker] [Relay]. She wants the Relay built second (to receive scout data early). She long-presses the Relay thumbnail on the belt — haptic buzz, the icon lifts. She drags it left, past the Striker and second Scout. The other thumbnails slide apart. She drops it in position 2: [Scout] [Relay] [Scout] [Striker]. The cost preview updates: "Next unit: Relay (5m, 2e/tick). Time to build: 3 ticks."

**Minute 2:45 — EXECUTE**
She taps EXECUTE (the button is larger on iPad — 64px diameter FAB). The Sealed Watch begins. She watches her factory produce a Scout on tick 1. It begins patrolling. On tick 4, the Relay spawns and immediately begins receiving scout data. Green flashes on the relay tile. By tick 10, she has a functional two-scout, one-relay, one-striker network. The striker, guided by relayed scout data, moves toward the enemy. Tick 15: engage. Red flash. Enemy eliminated. She smiles. "That's rather clever," she says.

**Minute 4:00 — Inspector with Pencil**
The Inspector opens. She uses the Pencil to tap individual units for inspection. The precision targeting is perfect — no fat finger issues. She scrubs the timeline by dragging the Pencil across the bottom scrubber. The haptic feedback doesn't work through the Pencil, but the visual feedback (board updating per tick) is sufficient. She examines the relay's buffer at tick 8: three scout observations, one compressed entry, two empty slots. She understands the flow.

**UI Annotations:**
- iPad layout: identical to desktop (split view), no mobile adaptations needed
- Apple Pencil: works as precision pointer, hover state supported (Pencil 2 hover)
- Touch targets: 56px tiles on iPad, comfortable for both finger and Pencil
- FAB: 64px on tablet (vs. 56px on phone)
- Waypoint creation: tap-to-place on grid, long-press to remove, numbered dots with connecting path line
- Conveyor belt: 72px tall, full-width below workbench panel, scrollable

---

### Journey: Ravi, 29, UX Designer, Pixel 8 (6.2" screen, portrait only — he doesn't rotate)

**Context:** Mission 9. Hardcore player. He's mapped out his entire architecture on paper and wants to input it quickly. He finds the mobile interface limiting and constantly wishes for a keyboard, but he's on a train.

**Minute 0:00 — Rapid Config Entry**
He opens Mission 9. The board is dense: he needs 4 scouts, 3 strikers, 2 relays, 1 specialist, 1 command agent. He's in portrait mode (The Flip pattern). He immediately taps Config tab and starts building blueprints from templates.

**Minute 0:15 — Template System Demand**
He taps "+" on the conveyor belt. Instead of building from scratch, he long-presses a template icon — a dropdown shows his saved blueprints from previous missions. He selects "Scout Alpha v3" — a scout config he perfected in Mission 6. The blueprint loads with all rules, hooks, and context config intact. He makes two modifications (changes one channel name, adjusts eviction priority) and adds it to the queue. He does this 4 times in 60 seconds.

This is where mobile power users NEED templates. Building a Command agent config from scratch on a phone takes 5-10 minutes. Loading a template and tweaking takes 30 seconds. The template system isn't a convenience on mobile — it's a necessity.

**Minute 1:30 — The Channel Wiring Problem**
He has 7 channels across 11 units. On desktop, the channel wiring overlay makes the topology visible at a glance. On his 6.2" phone in portrait, the mini-map strip (64px tall) is too small to distinguish 7 overlapping colored lines. He taps the mini-map strip to expand it — it grows to 50% of the screen, showing the board at half size. The wiring is now visible but still dense. He pinch-zooms on the expanded mini-map to focus on the relay cluster. The colored lines separate enough to trace.

He realizes he wired "command_override" to the wrong relay. He taps the relay on the mini-map — the screen flips to Config with that relay loaded. He fixes the hook. Flips back. Checks the wiring. Fixed.

This flip-check-flip-check cycle is the core friction of mobile for power users. On desktop, it's instant (the wiring updates in real time next to the config). On mobile, each check is a context switch. Ravi does 12 flips in 3 minutes. Each flip is 300ms — total animation time is 3.6 seconds. Not terrible, but the cognitive cost of context-switching 12 times is real.

**Minute 4:00 — EXECUTE and Speed**
He hits EXECUTE. Immediately taps the 2x speed toggle. He's seen this mission type before. The sealed watch at 2x takes 45 seconds instead of 90. His phone buzzes rapidly with signal deliveries and combat flashes — the haptic pattern at 2x speed becomes a staccato rhythm. Red flash at tick 22. Red flash at tick 23. Two kills in rapid succession. He grins.

**Minute 5:30 — Inspector Deep Dive**
He scrubs to tick 18 — where he thinks his command agent's reroute should have fired but didn't. He taps the command unit. Buffer inspection shows 14 slots, all full. Slot 14 (most recent) is a low-priority status update that evicted the critical "buffer_critical" alert. The eviction policy is "oldest_first" — but the alert arrived before the status update. He realizes the alert was old by the time the command agent processed it (signal latency: scout→relay→command = 4 ticks). By tick 18, the alert was the OLDEST entry. His eviction policy evicted the thing he needed most.

He screenshots the buffer state, switches to his notes app, types "switch command eviction to lowest_fidelity — age-based eviction is wrong for high-latency architectures." He switches back to the game, goes to Config, changes the eviction policy. This cross-app workflow (game → notes → game) is uniquely mobile. On desktop, you'd just adjust in-place. On mobile, the constraint of single-app focus creates a natural reflect-then-act rhythm.

**UI Annotations:**
- Template system: long-press "+" to access saved blueprints, critical for mobile power users
- Mini-map expansion: tap to grow to 50%, pinch-to-zoom within expanded state
- 2x speed haptics: double-frequency vibration pattern, each buzz shorter (50ms vs. 100ms at 1x)
- Cross-app workflow: mobile OS app-switching as natural pause for reflection
- Channel wiring visibility: 7+ channels on 6" phone requires the expanded mini-map; mini-map strip insufficient

---

## Interaction Effects

### With Building Block Paradigms (building-blocks/)
- **Node-graph paradigm** (if explored): EXTREMELY difficult on mobile. Dragging wires between nodes on a small screen with finger occlusion is a nightmare. Gladiabots's mobile version uses a simplified tree view precisely because node-graph doesn't scale down. If Robot Uprising adopts any node-graph elements, they need a completely separate mobile representation.
- **Card/deckbuilding paradigm** (if explored): Cards translate well to mobile. Swipe through a hand, tap to play, drag to reorder. Slay the Spire mobile proves this — despite its issues, the core card interaction works on touch.
- **Priority lists** (the locked rule system): Works well with press-hold-drag + nudge button fallback, as described above.
- **Mixing board/sliders**: Works perfectly on touch. In fact, better than on desktop — sliding a finger along a physical slider is more natural than dragging a mouse.

### With Sealed Watch Design
- Haptics add a dimension that desktop doesn't have. Mobile sealed watch is arguably BETTER than desktop for emotional engagement. The phone-as-metronome effect creates intimacy.
- The "no skip, no tools" rule is even more important on mobile. Mobile players are conditioned to skip, fast-forward, and multitask. The sealed watch's refusal to comply with these habits is a statement. It demands full attention from a device designed for partial attention.

### With Inspector
- The Inspector is the hardest screen on mobile. Deep analytical work with precision scrubbing and multi-panel inspection fights against every mobile constraint.
- Consider: should the Inspector offer a "send to desktop" feature? After a sealed watch on mobile, the player could flag the match for detailed analysis later on their computer. The emotional experience (sealed watch) happens on mobile. The analytical experience (inspector) happens on desktop. The two-act debrief becomes a two-device debrief.

### With Campaign/Onboarding
- Early missions (1-4) work beautifully on mobile. Simple configs, few units, immediate feedback.
- Late missions (8-10) with complex command architectures push mobile to its limits. The factory-vs-factory climax with 10+ units and 7+ channels may be desktop-only in practice.
- The campaign could detect mobile vs. desktop and adjust mission complexity hints: "This mission has complex channel architecture. Consider using a larger screen for the best experience."

### With Accessibility
- Touch targets must be at least 44×44 CSS pixels (WCAG 2.5.5 Level AAA: 44×44, Level AA: 24×24).
- Apple Pencil / Samsung S Pen support is a major accessibility win for players with motor impairments.
- Voice input for channel names (using Web Speech API) could reduce keyboard friction.
- The haptic feedback system must be toggleable for players with sensory sensitivities.

---

## Comparable Games — Mobile Adaptation Lessons

### Into the Breach (Netflix Mobile)
- **What they did:** Tap-to-select, tap-to-confirm two-step pattern. Collapsible UI elements. Information hidden behind taps instead of always visible. The developers spent significant time redesigning the UI for touch and small screens, even though the grid-based gameplay was already well-suited for mobile.
- **What translates:** The two-step selection pattern for grid interactions. The collapsible information hierarchy. The "same game, different presentation" philosophy.
- **What doesn't:** Into the Breach has no construction/configuration phase. Its entire interaction is "select unit, select move, confirm." Robot Uprising's Plan screen is orders of magnitude more complex.

### Gladiabots (Mobile-First)
- **What they did:** Started on Android. The behavior tree editor uses scrollable lists with tap-to-select conditions and actions. Reordering uses small arrow buttons. The tree visualization is vertical (top-to-bottom) and scrollable.
- **What translates:** The arrow-button reorder fallback. The vertical, scrollable config layout. The "mobile-first then desktop" development order.
- **What doesn't:** Gladiabots's behavior trees are deeper (more nesting levels) but narrower (fewer parallel branches) than Robot Uprising's rule system. The config complexity per-unit is lower.

### Slay the Spire (Mobile Port)
- **What they did:** Direct port with enlarged touch targets. "Bigger Text" mode. Card interaction: tap to preview, drag to play.
- **What went wrong:** Accidental card plays from tap/drag ambiguity. Text too small even with Bigger Text mode. Information density that works on a monitor doesn't work on a phone.
- **What translates to Robot Uprising:** The warning — don't just scale down the desktop UI. The distinction between "tap to inspect" and "drag to act" must be unambiguous. The Bigger Text option is table stakes.

### Factorio (No Mobile Port — Instructive Absence)
- **What they didn't do:** Factorio has never shipped a mobile version. The developers have stated the UI complexity makes a good mobile experience nearly impossible. This is a cautionary tale. Robot Uprising's config complexity is comparable to Factorio's belt/inserter/circuit network wiring.
- **What it means:** Some games shouldn't be fully mobile. A "mobile-lite" mode (early campaign only, simplified mission selection) might be more honest than forcing the full experience onto a phone.

---

## Open Questions

1. **PWA vs. Native Wrapper:** The locked tech stack is web-based. A PWA works on mobile browsers but lacks: push notifications, home screen install prompts on some browsers, access to advanced haptics. A Capacitor/Cordova wrapper adds native capabilities but introduces build complexity. Decision needed.

2. **Portrait vs. Landscape Lock:** Should the game force landscape for Plan/Inspector and allow portrait for Sealed Watch? Or should every screen work in both orientations? Into the Breach mobile allows both but recommends landscape.

3. **Offline Play:** Mobile players often lose connectivity (subway, airplane). The game has no backend (locked), so offline play is technically possible. But cloud save sync needs conflict resolution when reconnecting.

4. **Battery and Thermal:** Pixi.js WebGL rendering on mobile browsers is GPU-intensive. The Sealed Watch's per-tick rendering is light, but the Plan screen's real-time channel wiring overlay with ghost unit previews could drain battery. Performance budget analysis needed.

5. **Mobile-Specific Tutorial:** Should mobile players get a separate "how to use touch controls" tutorial before Mission 1? Or should touch interactions be taught inline (ghost hand animations showing tap, drag, pinch gestures on first encounter)?

---

## New Aspects Discovered

- **6.07a — PWA vs. native wrapper decision:** performance, haptics, install flow, push notifications, platform-specific capabilities; Capacitor vs. pure PWA vs. TWA (Trusted Web Activity)
- **6.07b — Portrait-landscape orientation strategy:** per-screen orientation preferences, rotation animation design, forced vs. adaptive orientation, how orientation affects the three-screen loop rhythm
- **6.07c — Mobile-specific onboarding for touch controls:** ghost hand tutorial animations, inline gesture teaching vs. dedicated tutorial, first-touch-on-each-element instruction; comparable to iOS game onboarding patterns
- **6.07d — Battery and thermal performance budget for Pixi.js on mobile:** WebGL rendering cost per screen, 60fps vs. 30fps decision, canvas resolution scaling on low-end devices, requestAnimationFrame throttling during Sealed Watch
- **6.07e — "Send to desktop" cross-device debrief flow:** emotional sealed watch on mobile → analytical inspector on desktop; cloud sync of match replay data; the two-device two-act debrief as a feature, not a limitation
