# 6.08 — Accessibility: A Comprehensive Design Space Exploration

## Overview

Robot Uprising is an **information architecture game**. The player manages what agents know, what they remember, what they forget, who they talk to. This is fundamentally an **abstract structural activity** — closer to spreadsheet design or database schema work than to twitch reflexes or spatial navigation. This makes it **uniquely suited to accessibility** in ways most games aren't. A blind player can absolutely reason about buffer configurations, rule priority ordering, and hook channel wiring. A one-handed player can configure agents at their own pace during the Plan screen. A player with ADHD can thrive on the discrete-tick structure that breaks complexity into readable snapshots.

But the game is ALSO visually dense. The 8×8 board with overlapping perception radii, channel wiring lines, buffer bars, and ghost unit previews creates a rich spatial display that must degrade gracefully across every axis of disability. The Sealed Watch's one-second ticks with simultaneous unit resolution demand temporal processing. The Inspector's timeline scrubber with per-tick buffer state inspection requires sustained analytical focus.

This document explores the complete accessibility design space: visual, auditory, motor, cognitive, and the intersections between them. Not as an afterthought checklist — as a first-class design dimension that shapes the game from the ground up.

---

## The Accessibility Advantage: Why This Game Can Lead

Most strategy games treat accessibility as optional polish. Robot Uprising has structural advantages that make deep accessibility natural:

1. **No twitch mechanics.** The entire game is turn-based. The Sealed Watch runs at 1 tick/second with no player input. The Plan screen has no time pressure whatsoever. The Inspector allows frame-by-frame analysis. There is literally zero time-critical input in the entire game.

2. **Abstract information, not spatial coordination.** The core decisions — which skills to enable, how to order rules, what channels to wire, how to configure the buffer — are structural/logical, not spatial/physical. A player who cannot see the board can still reason about "IF buffer_full THEN evict oldest."

3. **Discrete state, not continuous.** Every game state is a clean grid snapshot. Units are on tiles, not between tiles. Buffers have N slots with M filled. There is no ambiguity, no partial states, no interpolation. This is paradise for screen readers.

4. **Three-screen separation.** The game naturally segments into three cognitive modes: build (Plan), watch (Sealed Watch), analyze (Inspector). Each screen has radically different accessibility needs and can be optimized independently.

5. **Web-based tech stack.** React + Pixi.js means DOM-based UI lives alongside canvas rendering. The workbench panel IS React DOM — intrinsically screen-reader-compatible. Only the board canvas requires a parallel accessible representation.

---

## Axis 1: Visual Accessibility

### 1A. Colorblind Modes

The game uses color as a primary signal carrier: green for signal delivery, red for combat, cyan for perception radii, channel-specific colors for hook wiring. All of these must work without color.

**Option A: "Palette Swap" — Simple Color Remapping**

Three preset palettes replacing the default:
- **Deuteranopia/Protanopia (red-green):** Green → Blue (#4488FF), Red → Orange (#FF8844). Channel wiring adds dash patterns.
- **Tritanopia (blue-yellow):** Green → Cyan (#00DDDD), Red → Magenta (#DD00DD). Channel wiring adds dot spacing.
- **Monochromacy (total):** All color-coded elements get shape overlays. Signal delivery = upward triangle flash. Combat = X-mark flash. Buffer slots use fill patterns: empty (outline only), half (diagonal hash), full (solid). Perception radius uses a stippled boundary instead of a tinted fill.

*Strengths:* Simple to implement. Covers 95% of colorblind players. Low visual noise.
*Weaknesses:* Three presets can't cover all individual variations. Some players fall between categories. The monochromacy mode may feel clinical.

**Option B: "Full Customization" — Per-Element Color Picker**

Every color-coded element has a customizable hue/saturation/brightness in Settings → Visual → Custom Colors. A preview panel shows a board snapshot with the current settings applied.

Default presets:
- Standard
- Deuteranopia-safe
- Tritanopia-safe
- High-contrast (white/black/yellow only)
- Monochrome with shapes

*Strengths:* Covers every individual variation. Players with partial deficiency can fine-tune. Power users love customization.
*Weaknesses:* Overwhelming in Settings for casual players. Risk of players creating unreadable color schemes. Must validate minimum contrast ratios.

**Option C: "Shape-First Design" — Color as Redundant Layer**

Design the visual language so that EVERY color-coded element has a non-color differentiator by default, not just in colorblind mode:
- Signal delivery: green flash + upward-pointing chevron animation
- Combat: red flash + expanding X-mark animation
- Perception radius: color tint + dashed boundary line with directional tick marks
- Buffer slots: color gradient + fill level (empty/partial/full as distinct shapes)
- Channel wiring: color + unique dash pattern per channel (solid, dashed, dotted, dash-dot, double-dash — up to 8 patterns before recycling)
- Unit type: color accent + distinct silhouette (already locked: 👁📡⚔🔧🤖)

*Strengths:* "Inclusive by default" — no settings required for most players. Teaches the visual vocabulary through redundant channels. Easier to maintain (one rendering path, not multiple).
*Weaknesses:* Slightly busier default visuals. Some shape differentiators (dash patterns) are subtle at small scale. Must be tested at all zoom levels.

**RECOMMENDED: Option C as foundation + Option A presets for fine-tuning.** Shape-first design means the game works for most colorblind players out of the box. Preset palettes handle the rest. Full customization (Option B) is a late addition if demand justifies it.

**Sensory description of monochrome mode:**
The board is rendered in white, grey, and black. Units are bright white silhouettes on dark grey tiles. When a signal fires, the sending unit's tile flashes with an upward chevron animation in white. When combat occurs, the target tile flashes with an expanding X-mark in white. Channel wiring lines are white with distinct dash patterns — the "alarm" channel is solid, "recon" is dashed, "command" is dotted. Buffer bars under each unit use fill patterns: empty slots are thin outlines, occupied slots are solid rectangles, and the most recent entry has a gentle pulse. The board looks like a tactical display from a submarine movie — clean, technical, readable.

### 1B. Low Vision / Magnification

Players using OS-level magnification (Windows Magnifier at 200-400%, ZoomText, macOS Zoom) face a specific problem: they can only see a portion of the screen at any time. The Plan screen's split view (board left, workbench right) means they may never see both panels simultaneously.

**Accommodations:**

1. **Global text scaling: 80% to 200%** in 10% increments (extending the existing 150% cap to 200%). The layout reflows: at 150%+ the workbench becomes a scrollable panel. At 200%, the production queue wraps to two rows.

2. **Board zoom: 0.5x to 4x.** At 4x, a single tile fills roughly 360px — large enough to read buffer bar details without OS magnification. The board auto-centers on the selected unit.

3. **High-contrast mode:** Background becomes true black (#000000). All UI text becomes bright white (#FFFFFF). Interactive elements get thick borders (3px instead of 1px). The focus ring thickens to 4px bright yellow (#FFFF00). Grid lines become bright white. This isn't colorblind mode — it's contrast enhancement for low-vision players who need maximum luminance difference.

4. **"Focus follows selection" option:** When a unit is selected in the workbench, the board auto-scrolls to center that unit. When a board tile is clicked, the workbench auto-scrolls to the selected unit's blueprint. For magnified players, this eliminates the need to manually navigate between panels.

5. **Tooltip font scaling independent of UI scaling.** Tooltips can scale from 100% to 250% without affecting the underlying UI. A low-vision player might run the UI at 120% but tooltips at 200%, getting legible information density plus readable detail.

**Sensory description of high-contrast mode:**
The screen is split: black background, the 8×8 grid rendered in bright white lines, thick and precise as graph paper. Units are high-contrast white silhouettes with thick outlines — the Scout's eye is a solid white circle, the Striker's sword is two bold white lines crossing. Selected elements glow with a 4px yellow focus ring that feels like a searchlight. The workbench panel on the right has white text on black, with interactive elements boxed in yellow borders. Hover states flash the border to cyan. It looks like a NASA mission control display from the Apollo era — every element designed to be readable from across the room.

### 1C. Screen Reader Support (Blind / Low Vision Players)

This is the most ambitious accessibility investment and the one that makes Robot Uprising uniquely inclusive among strategy games.

**The Core Architecture: Parallel DOM**

PixiJS 8.x has a built-in accessibility system that creates invisible `<div>` overlays aligned to canvas display objects, supporting tab navigation and `aria-label` announcements. Robot Uprising extends this with a full parallel DOM representation of the game state:

**Board cells:** Each cell is a `<div>` with `role="gridcell"` inside a `role="grid"` container. Labels announce: unit type + buffer state + active hooks + terrain.
- "D5: Scout. Buffer 4 of 6. Hooks: alarm, relay-north. Terrain: jungle."
- "E3: Empty. Terrain: rice terrace. Tagged by player."
- "H7: Enemy striker. Terrain: city."

**Workbench elements:** These are already React DOM, so they're natively accessible. Each element needs proper ARIA labeling:
- Skills: `role="switch"` with `aria-checked`. "Patrol skill: enabled."
- Rules: `role="listitem"` within `role="list"`. "Rule 3 of 5: IF buffer full THEN evict oldest. Priority 3."
- Hooks: `role="group"` with child labels. "Hook slot 1: trigger observe_enemy, channel alarm, payload auto."
- Context config: `role="slider"` with `aria-valuemin/max/now`. "Buffer size: 8 of 14 maximum."

**Production queue:** `role="list"` with drag-and-drop replaced by keyboard reordering (Alt+Up/Down). "Build position 2 of 4: Scout blueprint Alpha. Cost: 3 minerals. Build time: 5 ticks."

**Channel map:** `role="list"` read-only. "Channel alarm: 2 senders (Scout-1, Scout-2), 1 listener (Relay-1). 0 warnings."

**Sealed Watch — The Narration Problem:**

The Sealed Watch is purely visual. No UI interactions. The screen reader encounters silence. Three approaches:

**Option SR-A: "Tick-by-Tick Narration" (Audio Description)**
An optional mode (Settings → Accessibility → Sealed Watch Narration) that announces each tick:
- "Tick 1. Scout-1 moves to B3. Relay-1 stationary at D4."
- "Tick 4. Scout-1 perceives enemy at H7. Hook fires on channel alarm."
- "Tick 5. Relay-1 receives signal on alarm. Buffer: 3 of 12. Relay-1 compresses and sends on relay-north."
- "Tick 12. Striker-1 receives compressed signal. Engages enemy at G7. Enemy eliminated."
- "Tick 20. Battle complete. Victory. 2 units surviving. 0 units lost."

*Strengths:* Complete information. Blind player misses nothing. Can be enabled alongside visual for sighted players who want reinforcement.
*Weaknesses:* Verbose at high tick counts. Can't keep up at 2x speed. Serial narration loses the "everything happens at once" simultaneous feel.

**Option SR-B: "Event-Only Narration"**
Only announces significant events, not every tick:
- "Tick 4: Enemy detected by Scout-1."
- "Tick 5: Signal relayed through Relay-1."
- "Tick 12: Striker-1 eliminates enemy."
- "Victory after 20 ticks."

*Strengths:* Concise. Captures narrative arc. Works at 2x speed.
*Weaknesses:* Misses movement information. Player can't reconstruct the full tactical picture. May feel like reading a summary, not watching a battle.

**Option SR-C: "Hybrid Narration with Detail Toggle"**
Default: event-only narration (SR-B). Press a key (e.g., `Space`) during Sealed Watch to toggle to tick-by-tick for the next 5 ticks, then auto-reverts. Press `D` at any time for a "dashboard" summary: "Tick 12 of 20. 3 player units, 1 enemy. 2 tagged tiles. Scout-1 at B6, Relay-1 at D4, Striker-1 at G7."

*Strengths:* Best of both — concise by default, detail on demand. The dashboard summary is a radar sweep. The detail toggle is like zooming in.
*Weaknesses:* More complex to learn. Breaks the "no tools during Sealed Watch" rule. But the locked spec says no skip/pause/tools for sighted players — narration is a separate accessibility layer, not a gameplay tool.

**RECOMMENDED: Option SR-C.** The Sealed Watch's "no tools" rule exists to create emotional engagement with uncertainty. Narration doesn't break this — it IS the emotional engagement for a blind player. Hearing "Tick 12: Striker-1 eliminates enemy" IS the same emotional beat as watching it.

**Inspector:**
The Inspector is DOM-heavy already (timeline scrubber, buffer state panels, queue depth charts). Key additions:
- Timeline scrubber: `role="slider"` with tick announcements. Arrow keys step ticks. Current tick state announced: "Tick 12. Scout-1 at B6. Buffer: enemy_at_H7 (tick 4, fidelity 0.8), terrain_D4 (tick 6, fidelity 1.0), compressed_alarm (tick 5, fidelity 0.6). 3 of 6 slots occupied."
- Queue depth chart: Announce trend. "Buffer fill over 20 ticks: peaked at 6 of 6 at tick 8. Currently 3 of 6. Overflowed twice."
- Signal genealogy: Linearized as ordered list. "Signal chain for alarm at tick 12: originated Scout-1 tick 4 → compressed Relay-1 tick 5 → received Striker-1 tick 6 → action: engage tick 12. Total latency: 8 ticks."

**Sensory description of screen reader experience:**
There is no visual. The player sits with headphones, NVDA running. The boot log narrates itself: "OK. Perception module online." The voice is flat, synthetic, institutional — the screen reader's voice IS the AI's voice. It's accidentally perfect casting. When they tab through the Plan screen, each element announces itself crisply: "Rule 1 of 3: IF enemy detected THEN send on alarm. Priority 1." They press Enter on EXECUTE. A beat of silence. Then: "Tick 1. Scout-1 moves to B3." The battle unfolds in their mind as a sequence of coordinates and events, like listening to a chess match on the radio. When the Inspector opens: "Seal broken. Inspector loaded. Timeline: 20 ticks. Press left or right arrow to scrub." They step through tick by tick, building a mental map of what happened where. The game plays in their imagination like a radio drama of a tactical operation.

---

## Axis 2: Auditory Accessibility

### 2A. Deaf / Hard of Hearing Players

The game's audio layer — tick pulse, signal delivery chime, combat hit, buffer overflow alert, EM emission hum — carries information. All of it must have visual equivalents.

**Visual replacements for audio cues:**

| Audio Cue | Visual Replacement |
|-----------|-------------------|
| Tick pulse (metronome) | Tick clock pip highlights + gentle screen-edge flash |
| Signal delivery chime | Sending unit's tile flashes green + upward chevron |
| Combat hit | Target tile flashes red + expanding X-mark |
| Buffer overflow alert | Unit's buffer bar turns red + shake animation (2 frames, 4px displacement) |
| EM emission hum | Expanding concentric rings from transmitting unit (already visual) |
| Victory fanfare | Screen border pulses gold three times + "VICTORY" text animation |
| Defeat sound (agung strike) | Screen darkens to 30% + "DEFEATED" text fades in from center |
| Hook trigger click | Transmitting unit's hook slot briefly pulses |
| Eviction pop | Evicted buffer slot flashes bright then fades to empty |
| Channel whisper | Faint particle trail along channel wiring line |

**Subtitle system:** Any narration or boot log voice is subtitled by default. Subtitles use a dark semi-transparent background panel, speaker labels in the locked color per voice (CORE = teal, PERCEPTION = gold, etc.), and the ESA Accessible Games Initiative tag-standard font sizing (minimum 28px at 1080p).

**Vibration mode (controller/mobile):** See motor accessibility section — haptic vocabulary serves as an audio replacement channel.

### 2B. Auditory Processing Disorder

Some players can hear audio but struggle to distinguish overlapping sounds. When 14 units are active with multiple channels firing:

- **Audio simplification mode:** Reduces the sound palette to 5 distinct categories (tick, signal, combat, alert, ambient) with maximum contrast between them. No overlapping concurrent sounds — newest sound interrupts oldest.
- **Sound prioritization slider:** Player sets which category plays when sounds compete. "I always want to hear combat" → combat sounds override all others. "I care about signals" → signal chimes take priority.

---

## Axis 3: Motor Accessibility

### 3A. Keyboard-Only Play (No Mouse)

Already partially designed (see PC/Steam doc). Completing the specification:

**Full keyboard navigation map:**

| Screen | Key | Action |
|--------|-----|--------|
| All | Tab/Shift+Tab | Cycle focus forward/backward through interactive elements |
| All | Enter | Activate/confirm focused element |
| All | Escape | Cancel/close/back |
| Plan | Arrow keys | Navigate grid (board) or list (rules, queue) |
| Plan | 1-5 | Select unit type |
| Plan | Space | Toggle skill on/off, expand hook editor |
| Plan | Alt+Up/Down | Reorder rules / production queue |
| Plan | Delete | Remove rule / dequeue unit |
| Plan | F1-F4 | Focus Skills / Rules / Hooks / Context subpanel |
| Sealed Watch | +/- | Speed 0.5x / 1x / 2x |
| Inspector | Left/Right arrows | Step tick backward/forward |
| Inspector | [ / ] | Jump to previous/next event for selected unit |
| Inspector | Home/End | Jump to first/last tick |
| Inspector | B/G/C/D | Toggle Buffer/Genealogy/Channel/Depth panels |

**Focus order is deterministic and documented.** A focus-order diagram is available in Settings → Accessibility → Keyboard Navigation showing the exact Tab sequence.

### 3B. One-Handed Play

Robot Uprising's lack of time pressure makes one-handed play naturally viable. No action requires simultaneous input from both hands. However, some workflows assume left-hand-on-keyboard, right-hand-on-mouse. One-handed accommodations:

**Option M-A: "Mouse-Only Mode"**

All keyboard shortcuts become accessible through on-screen buttons or right-click context menus:
- Unit type selection: palette buttons (already exist) instead of 1-5 keys
- Rule reordering: drag (already works) or up/down arrow buttons next to each rule
- Tab cycling: on-screen tab bar with clickable panel labels
- Speed controls: on-screen +/- buttons (already exist in Sealed Watch)
- Inspector navigation: on-screen arrow buttons + scrubber drag
- EXECUTE: clickable button (already exists)

*Strengths:* Zero keyboard dependency. Works with any pointing device (mouse, trackball, eye tracker, head pointer). Natural for tablet/touch.
*Weaknesses:* Slightly slower than keyboard shortcuts. More clicks. The production queue reordering via on-screen buttons is tedious for large queues.

**Option M-B: "Keyboard-Only Mode" (Left or Right Hand)**

Remappable keys clustered for one-handed reach. Two presets:
- **Left-hand preset:** WASD navigation, Q/E for Tab cycling, 1-5 for units, Space for activate, Shift for modifier, Z for undo, X for delete, C for execute.
- **Right-hand preset:** Arrow key navigation, Home/End for Tab cycling, Numpad 1-5 for units, Enter for activate, Shift for modifier, Backspace for undo, Delete for delete, Page Down for execute.

Both presets keep every essential action within the reach of one hand resting on a half-keyboard.

*Strengths:* Fast once learned. Full functionality. No mouse required.
*Weaknesses:* Learning curve for the preset. Some hands can't reach the full cluster comfortably.

**Option M-C: "Adaptive Input" — Switch / Eye Tracker / Voice**

Support for external adaptive hardware:
- **Switch access:** Single-switch scanning mode. Auto-scan highlights elements in focus order. Switch press = activate. Scan speed adjustable. Two-switch mode: switch 1 = advance, switch 2 = activate.
- **Eye tracking (Tobii, etc.):** Gaze-to-hover (element highlights on gaze), dwell-to-click (fixed gaze for 800ms = click), or external switch-to-click.
- **Voice control (VoiceAttack, Windows Voice Access, macOS Voice Control):** All interactive elements have speakable names. "Click Scout blueprint." "Move rule 3 up." "Execute." Voice control requires that every button, every list item, every interactive element has a visible text label or a screen-reader-accessible name.

*Strengths:* Covers severe motor impairment. Opens the game to players who can't use standard input devices at all.
*Weaknesses:* Significant engineering investment. Testing matrix explodes. VoiceAttack profiles need community creation and sharing.

**RECOMMENDED: Option M-A as baseline (mouse-only mode is nearly free), Option M-B as addition (keyboard presets are configuration, not engineering), Option M-C as aspirational goal with eye tracking / voice as stretch features.**

**Sensory description of one-handed play (left-hand keyboard preset):**
Mara rests her left hand on the keyboard. Her right arm ended above the elbow six years ago. WASD moves focus around the board — she can feel the grid in her fingertips, each press snapping to the next tile like a typewriter carriage return. She presses 2 to select Striker, Space to place it. Q tabs to the workbench panel. She's in the rules editor. Arrow keys move between rules. Alt+W moves a rule up. She's reordering faster than most mouse users because she doesn't have to target a tiny drag handle — she just presses a key. C opens the channel namer. She types "flank" and presses Enter. The channel exists. She presses X to execute. During the Sealed Watch, she leans back. During the Inspector, arrow keys scrub the timeline. She never reaches for a mouse because she doesn't need one.

### 3C. Controller Accessibility (Cross-Reference with 6.06)

Controller play IS motor accessibility for many players with upper-body impairments. The Xbox Adaptive Controller and PlayStation Access Controller turn any switch, button, or joystick into a gamepad input. Robot Uprising's controller support (see console-controller-adaptation.md) must ensure:

- **Full remapping** of every control, not just presets
- **No simultaneous button requirements** (no "hold LT + press A" as mandatory — these should always have single-button alternatives)
- **Adjustable stick dead zones** for players with limited fine motor control
- **Adjustable hold-vs-tap thresholds** (some players can't hold buttons, some can't tap quickly)

---

## Axis 4: Cognitive Accessibility

### 4A. Information Overload Management

Robot Uprising is an information-dense game BY DESIGN. The game is literally about managing information overload in agents — and the player interface can produce the same sensation. This is a feature, not a bug, BUT it must be controllable.

**Option C-A: "Complexity Layers" — Progressive Disclosure Toggle**

A master toggle in Settings (and accessible from the Plan screen toolbar): Simple / Standard / Full.

- **Simple mode:** Hides: channel map panel, EM emission overlay, buffer eviction priority config, signal fidelity numbers, hook payload config. Shows: skills on/off, ordered rules, hook channel name only, buffer size. The workbench shows ~40% of the full information. Suitable for: first-time players, children, players with cognitive disabilities.
- **Standard mode:** The default. Shows everything in the locked spec. Hides: advanced Inspector tools (signal genealogy, counterfactual simulation). Suitable for: most players through the campaign.
- **Full mode:** Shows everything including all Inspector tools, EM overlay, channel metrics, emission budget calculator. Suitable for: competitive Gauntlet players, systems thinkers.

Players can switch at any time. Campaign missions may suggest a mode ("This mission works best in Standard mode") but never enforce it.

*Strengths:* Directly addresses cognitive overload. Simple mode makes the game accessible to players who would otherwise bounce. The three levels mirror the game's own teaching progression.
*Weaknesses:* Players in Simple mode may miss important information. The transition from Simple to Standard is a cliff. Must be designed so Simple mode isn't a "wrong" way to play.

**Option C-B: "Adaptive Complexity" — Automatic Disclosure**

The game tracks which UI elements the player interacts with and progressively reveals more. If a player never touches the channel map panel in 5 missions, it stays collapsed. If they start using hook payloads, the payload config expands from "auto" to show field selection.

*Strengths:* Zero configuration. Meets players where they are. No cliff transitions.
*Weaknesses:* Unpredictable — players may not know features exist until they stumble into them. Hard to document ("where's the thing I saw in a YouTube video?"). Risk of permanent feature hiding if a player never discovers the trigger.

**RECOMMENDED: Option C-A as explicit setting + Option C-B as soft guidance within each mode.** The player chooses their ceiling (Simple/Standard/Full), and within that ceiling, unused panels auto-collapse but are always accessible via a "show more" chevron.

### 4B. Dyslexia Accommodations

The game has significant text: rule conditions, hook configurations, channel names, boot log narrative, Inspector annotations.

**Accommodations:**
1. **Font choice:** Default is a clean sans-serif (Inter or similar). OpenDyslexic available as an option in Settings → Accessibility → Font. The boot log monospace font has a dyslexia-friendly alternative (e.g., Lexie Readable).
2. **Text spacing:** Adjustable line height (1.2x to 2.0x) and letter spacing (normal to +2px). These are global settings that affect all text.
3. **Icon-first design:** Every rule condition and action has an icon alongside its text label. "IF enemy_detected" is accompanied by a red-bordered eye icon. "THEN evade" is accompanied by a running-figure icon. Players who struggle with text can read the icon language.
4. **Text-to-speech for UI text:** An optional TTS mode that reads aloud any hovered or focused text element. Not a full screen reader — a lightweight read-aloud for players who can see the screen but struggle with reading. Uses the browser's `SpeechSynthesis` API.
5. **Boot log speed control:** The boot log text scroll speed is adjustable from 0.5x to 2x. Slow readers can take their time. Fast readers can accelerate. A "scroll by paragraph" mode replaces continuous scrolling with press-to-advance.

### 4C. ADHD Accommodations

Players with ADHD may struggle with:
- **Long Plan phase sessions** (sustained attention)
- **Complex multi-step configurations** (working memory load)
- **Sealed Watch passivity** (forced waiting without interaction)
- **Inspector analysis** (sustained analytical focus)

**Accommodations:**

1. **"Quick Setup" templates:** Pre-built agent configurations that work reasonably well. Not optimal, but functional. The player selects a template, tweaks 1-2 things, and executes. Reduces the Plan phase from "build from scratch" to "modify a starting point." Available from Mission 5+ when the factory introduces blueprints.

2. **Session length indicator:** A non-intrusive timer in the corner showing "Plan time: 4:23." Not a countdown — just a clock. Players with time-blindness benefit from knowing how long they've been configuring. Optional (Settings → Accessibility → Show Session Timer).

3. **Auto-save on every change.** No save button. No save dialog. Every rule edit, every skill toggle, every hook configuration is instantly persisted. If a player with ADHD gets pulled away mid-configuration and comes back the next day, everything is exactly as they left it.

4. **Sealed Watch engagement:** The 1-second tick pace with visual events (flashes, movements, buffer bar changes) provides regular stimulation. The "no skip" rule actually helps ADHD engagement — there's no decision to make about whether to skip, which eliminates a distraction vector. However, an optional "narration overlay" (see SR-C above) provides additional auditory stimulation during passive watching.

5. **Inspector bookmark system:** "Pin" interesting ticks during Inspector analysis. When attention wanders and the player returns, the pinned ticks serve as breadcrumbs back to their analysis. "I was looking at tick 12 because..." — the pin has a text note field.

### 4D. Autism Spectrum Accommodations

**Sensory control:**
- **Animation intensity:** Off / Reduced / Standard / Enhanced. "Off" eliminates all non-essential animation (perception radius pulses, channel wiring glows, transition effects). "Reduced" keeps only gameplay-critical animations (unit movement, signal flashes, combat). "Standard" is the default. "Enhanced" adds extra visual feedback for players who benefit from richer stimulation.
- **Sound intensity:** Matching four-level scale. "Reduced" eliminates ambient sounds and plays only event-triggered SFX.
- **Screen shake:** Off / Reduced / Standard. Combat and buffer overflow can trigger screen shake. Option to disable completely.
- **Flash reduction:** Eliminates rapid brightness changes. Signal delivery flash becomes a gentle glow. Combat flash becomes a color wash instead of a strobe.

**Predictability:**
- **Preview mode in Plan screen:** Already designed — ghost units show perception radii and channel wiring. This is an accessibility feature disguised as a game feature. Autistic players who need to understand outcomes before committing benefit enormously from spatial preview.
- **Tick clock visibility:** The tick clock (horizontal pips) shows EXACTLY how many ticks have passed and how many remain. There are no surprises about "when does this end."
- **Consistent UI layout:** Panels never move position between screens or sessions. The workbench is always on the right. The board is always on the left. The Inspector scrubber is always at the top.

---

## Axis 5: Difficulty / Assist Options

### 5A. The Celeste Model — "Assist Mode"

Celeste's Assist Mode is the gold standard for difficulty accessibility. It provides granular control without judgment:

**Robot Uprising Assist Mode options:**

| Option | Range | Effect |
|--------|-------|--------|
| Tick speed | 0.25x to 2x | Slows or speeds Sealed Watch ticks |
| Buffer size bonus | +0 to +4 | Extra buffer slots on all player units |
| Perception bonus | +0 to +2 | Extra perception range on all player units |
| Enemy speed | 0.5x to 1x | Slows enemy unit movement |
| Enemy perception | 0.5x to 1x | Reduces enemy detection range |
| Hint frequency | Off / Subtle / Moderate / Aggressive | How often the mentor system suggests improvements |
| Retry penalty | None (default) | Always none — documented to reassure anxious players |

**Critical design rule:** Assist Mode is presented with zero judgment. No "are you sure?" prompts. No achievements disabled. No visual markers that other players can see. No "Easy Mode" label — it's "Assist Mode" or "Accessibility Options." The wording matters.

**The mentor hint system (from failure-recovery.md) serves double duty as cognitive accessibility:** progressive hints reduce the working memory requirement for stuck players, regardless of whether the stuckness comes from difficulty or cognitive processing.

### 5B. "Practice Sandbox" Mode

A free-play mode unlocked after Mission 2 where:
- No objectives, no enemies (unless placed manually)
- All currently-unlocked unit types available
- Unlimited resources
- Full Inspector available immediately (no Sealed Watch gate)
- Can place enemy units manually to test configurations

This is accessibility for players who need more time to internalize mechanics than the campaign provides. It's also an ADHD accommodation — players can experiment without commitment.

---

## Axis 6: Intersectional Accessibility

### 6A. Blind + Motor Impairment

A player using a screen reader AND a single switch needs:
- Switch scanning through the focus order
- ARIA announcements at each scan step
- Dwell or second-switch to activate
- Sealed Watch narration (automatic, since they can't scan during passive viewing)

The focus order must be optimized for BOTH screen reader logic AND scan traversal speed. Long focus chains are bad for switch users — jump shortcuts (F1-F4 for workbench subpanels) must work with switch macros.

### 6B. Deaf + Colorblind

A player who can't hear audio cues AND can't distinguish red/green needs:
- Shape-first visual design (Option C from colorblind section)
- Visual replacements for all audio cues (table from auditory section)
- High-contrast mode to maximize visibility of shape differentiators

These three systems must be tested in combination, not individually.

### 6C. Cognitive + Low Vision

A player with ADHD AND low vision at 200% magnification needs:
- Simple complexity mode (reduced information)
- Focus-follows-selection (auto-scroll to selected unit)
- Large text tooltips
- Session timer
- Quick Setup templates

The combination of magnification + reduced information actually works well — there's less to show, and what's shown is bigger.

---

## Player Journeys

### Journey: Sana, 28, Blind Software Engineer (Screen Reader User)

**Context:** Mission 3. Uses NVDA on Windows. Has played MUDs and text adventures her whole life. Backed Robot Uprising on Kickstarter after reading that it would have screen reader support. Uses a standard keyboard.

**Minute 0:00 — Opening the Plan Screen**
NVDA announces: "Plan screen. Board grid, 8 by 8. Workbench panel on right." Sana presses Tab. "Unit palette. Scout selected. Press Enter to place, arrow keys to position." She presses Enter, then uses arrow keys. NVDA announces each cell: "A1. Empty. Jungle." "A2. Empty. Rice terrace." She positions the Scout at C3 and presses Enter. "Scout placed at C3."

She presses Tab. "Workbench: Scout at C3. Skills subpanel." Tab. "Patrol: enabled. Toggle with Enter." Tab. "Evade: enabled." Tab. "Rules subpanel. 1 rule. Rule 1 of 1: IF enemy detected THEN evade. Priority 1." She understands the structure instantly — it's a list with conditions and actions, like a configuration file she'd edit at work.

**Minute 1:30 — Configuring a Hook**
Tab. "Hooks subpanel. Slot 1: empty. Press Enter to configure." Enter. "Hook editor. Trigger: dropdown, current value: observe enemy. Channel: text field, empty." She types "alert" and presses Tab. "Channel: alert. One sender, zero listeners. Press Enter to save." Enter. "Hook saved. Slot 1: trigger observe enemy, channel alert." She hears the channel wiring announcement: "Channel alert wired from Scout at C3. No listeners."

She grins. She's wiring a distributed system. This is her job, except the units are robots instead of microservices.

**Minute 3:00 — Adding a Relay**
She Tabs back to the unit palette, selects Relay (press 3), navigates to D4, places it. Tabs to the Relay's hooks. Configures: trigger receive_signal on channel alert, send on channel "command". Configures a second hook: listen on channel alert. Tab to channel map. NVDA reads: "Channel alert: 1 sender Scout at C3, 1 listener Relay at D4. Channel command: 1 sender Relay at D4, 0 listeners."

She's building a message bus. The spatial positions don't matter to her — the channel topology is the game.

**Minute 4:30 — Executing**
She presses C (execute shortcut in left-hand preset). "Sealed Watch. Narration mode active." A beat. "Tick 1. Scout at C3 moves to C4. Patrol north." "Tick 2. Scout at C4 scans. Nothing detected." The narration is concise but complete. She listens like she's monitoring a log stream.

"Tick 6. Scout at C6 perceives enemy striker at G6. Hook fires on channel alert." Her pulse quickens. "Tick 7. Relay at D4 receives signal on alert. Buffer: 1 of 12. Compresses. Sends on command." She presses Space for a dashboard: "Tick 7 of 20. 2 player units. 1 enemy. Scout at C6, Relay at D4. Enemy striker at G6."

"Tick 14. Enemy striker reaches E5. Adjacent to Relay at D4. Relay eliminated." She exhales. She didn't build a Striker to protect the Relay. Next time.

"Tick 20. Battle complete. Defeat. 1 unit surviving. 1 unit lost."

**Minute 6:00 — Inspector**
"Seal broken. Inspector. Timeline: 20 ticks." She presses Right arrow repeatedly. At tick 6: "Scout at C6. Buffer: enemy_at_G6 tick 6, fidelity 0.9. 1 of 6 slots." At tick 7: "Relay at D4. Buffer: alert from Scout tick 6, fidelity 0.7 after compression. 1 of 12 slots." At tick 14: "Relay at D4. ELIMINATED. Buffer state at death: 3 signals, all stale."

She presses B for buffer panel on the Relay. "Buffer fill over time: tick 6 empty, tick 7 one slot, tick 10 three slots, tick 14 three slots at elimination." She diagnoses: the Relay survived 8 ticks after first signal but had no protection. She needs a Striker. She presses Escape to return to Plan.

**UI Annotations:**
- NVDA announces every focused element with type, state, and context
- Channel topology announced as sender/listener counts — spatial equivalent for non-visual players
- Sealed Watch narration in event-only mode by default, Space for dashboard summary
- Inspector buffer panel announced as trend description, not raw numbers

---

### Journey: Marcus, 52, History Teacher with Repetitive Strain Injury (One-Handed, Mouse-Only)

**Context:** Mission 6. Right hand only — left wrist has severe RSI from decades of typing. Uses a vertical ergonomic mouse. Has discovered that Robot Uprising is surprisingly comfortable because the Plan screen has zero time pressure.

**Minute 0:00 — Blueprint Configuration**
Marcus clicks the Scout blueprint in his production queue. The workbench panel opens on the right. He clicks the "patrol" skill toggle — it switches off with a satisfying click sound and the ghost Scout's patrol path disappears from the board. He clicks "evade" — it stays on. He right-clicks a rule to open the context menu: "Edit / Move Up / Move Down / Delete / Duplicate." He clicks "Move Up." No keyboard needed.

The hook editor opens when he clicks an empty hook slot. Dropdown menus for trigger type and channel selection — all mouse-clickable. The channel name field has autocomplete from existing channels. He clicks "recon" from the dropdown instead of typing it.

**Minute 2:00 — Rule Reordering**
He has five rules. The kill chain requires rule 3 to execute before rule 2. He right-clicks rule 3 → "Move Up." Done. He could drag, but the right-click menu is more precise and less strain on his wrist. Each rule row has tiny up/down arrow buttons on its left edge — he uses these for fine adjustment, clicking the up arrow twice to move a rule from position 5 to position 3.

**Minute 3:30 — Production Queue**
The conveyor belt strip at the bottom shows 4 blueprint icons. He clicks and drags a Relay icon from position 4 to position 2. The drag target highlights — a wide snap zone so he doesn't need pixel-perfect aim. His vertical mouse makes the horizontal drag comfortable. If dragging were difficult, the right-click context menu on each blueprint offers "Move Left / Move Right / Move to Front / Remove."

**Minute 5:00 — Sealed Watch (Rest)**
He clicks EXECUTE. During the Sealed Watch, he literally does nothing. His hand rests. The battle plays out. This 20-second break every iteration is genuinely therapeutic — the game enforces micro-rests at exactly the moments his hand needs them.

**Minute 6:00 — Inspector (Mouse Scrubbing)**
The timeline scrubber at the top is a wide horizontal bar. He clicks and drags to scrub through ticks. Each tick snaps magnetically — he doesn't need sub-tick precision. The "Previous Event" and "Next Event" buttons ([ and ] on keyboard) have on-screen equivalents: arrow buttons next to the selected unit's panel. He clicks the right arrow to jump from tick 4 to tick 7 (the next event for this Scout).

**UI Annotations:**
- Right-click context menus on every interactive element (rules, hooks, queue items, units)
- Up/down arrow buttons on every reorderable list item
- Wide magnetic snap zones on all drag targets
- On-screen equivalents for every keyboard shortcut
- Natural rest periods during Sealed Watch

---

### Journey: Leo, 14, Has ADHD and Dyslexia, First Strategy Game

**Context:** Mission 1. Downloaded because a TikTok clip of a relay chain looked cool. Has never played a strategy game. Usually plays Fortnite and Minecraft. Takes Adderall but it's afternoon and it's wearing off.

**Minute 0:00 — Boot Log**
The boot log scrolls. Green text on black. He's set the scroll speed to 0.7x in the accessibility options his mom helped him configure. The font is OpenDyslexic — each letter has a weighted bottom that keeps the text from swimming. He reads "Perception module online" and understands "ok it can see now." The boot log is short. He presses Enter.

**Minute 0:30 — Plan Screen with Simple Mode**
Simple mode is active. The workbench shows: patrol ON/OFF, evade ON/OFF, one rule with an eye icon (enemy detected) and a running-figure icon (evade). The icons tell him what the text says before he reads it. The buffer visualization is a simple bar: 4 of 6 slots filled, shown as 4 bright rectangles and 2 dim ones. No fidelity numbers. No eviction priority config. No channel map.

He sees the Scout on the board. He hovers over it — a blue circle appears around it. He gets it immediately: "that's how far it can see." He drags the Scout to a different position. The circle moves. He puts it near the center of the board.

**Minute 1:30 — Execution**
He presses the big pulsing EXECUTE button. He didn't overthink the configuration because Simple mode doesn't give him much to overthink. The Sealed Watch starts. Tick 1 — the Scout moves. Tick 2 — it scans. A ripple animation. Tick 4 — an enemy appears! His Scout sees it — the enemy tile flashes inside the Scout's perception circle. He leans forward. Tick 5 — his Scout evades. He pumps his fist. "YES!"

The one-second tick pace is perfect for his attention — something happens EVERY SECOND. There's no five-minute wait. Each tick is a micro-event: movement, scan, detection, reaction. It's a one-second gameplay loop nested inside a twenty-second match loop.

**Minute 2:30 — Inspector**
"SEAL BROKEN" flashes. The Inspector appears. The timeline scrubber is at the top. He taps the right arrow key. Tick 1. Tick 2. Tick 3. He clicks his Scout. The buffer panel opens — Simple mode shows it as a stack of cards: "Enemy at G6" (with a red eye icon) and "Terrain at D4" (with a green tree icon). No fidelity numbers, no signal age, no metadata. Just what the Scout knows, shown as pictures.

He clicks through each tick. At tick 5 when the Scout evaded: "Enemy at G6 was in buffer → Rule 'IF 👁 THEN 🏃' fired → Scout moved south." The icons tell the story. He reads the rule as images, not text.

**Minute 4:00 — Session Timer and Exit**
The session timer in the corner reads "4:02." He's been playing for four minutes. His attention is starting to drift — he keeps alt-tabbing to check Discord. But the four-minute session length means a complete Plan→Watch→Inspector loop fits inside his focus window. He completes Mission 1, starts Mission 2, completes it in 5 minutes. Two missions in 9 minutes. He quits. Comes back the next day for Mission 3. Auto-save means everything is exactly where he left it.

**UI Annotations:**
- OpenDyslexic font with 1.6x line spacing
- Simple mode: icons accompany every text label; buffer shown as picture cards; no metadata numbers
- Session timer: non-intrusive, top-right corner, white text on dark background
- Auto-save: persistent after every single interaction
- 1-second tick pace: one event per second matches ADHD attention refresh rate

---

### Journey: Dr. Keiko, 67, Retired Computer Scientist, Low Vision + Arthritis

**Context:** Mission 8. Uses Windows Magnifier at 250%. Text scaling at 180%. High-contrast mode enabled. Mouse with oversized trackball (Kensington Expert). Has arthritis in both hands — can use the trackball but not a standard mouse, and typing is slow and painful.

**Minute 0:00 — The Workspace at 250% Magnification**
Her screen shows about 40% of the game window at any time. High-contrast mode makes every element pop: black background, white grid lines, yellow focus rings, bright white unit silhouettes. She's configured "focus follows selection" — when she clicks a unit on the board, the workbench auto-scrolls to its blueprint. When she tabs to a rule in the workbench, the board auto-scrolls to show the affected area.

The text is enormous at 180% scaling. Rule text reads: "IF buffer full THEN evict oldest" in bold white sans-serif on black. She can read it without leaning forward.

**Minute 1:00 — Configuring with Trackball**
She clicks the Command agent on the board. The workbench scrolls to its blueprint. She clicks a hook slot — the hook editor opens as a modal panel with large buttons and dropdown menus. Each dropdown target is 48px tall (enlarged from the default 32px by her text scaling). She clicks the trigger dropdown: "observe_enemy, observe_ally, receive_signal, buffer_full, idle" — each option has a large icon next to the text.

For the channel name, she doesn't type. She clicks the autocomplete dropdown which shows all existing channels: "alarm, recon, command, flank." She clicks "flank." Zero typing.

**Minute 2:30 — Rule Reordering Without Drag**
She can't drag precisely with the trackball — her arthritis makes sustained click-hold painful. She uses the arrow buttons next to each rule: large clickable up/down triangles, 32px each, visible in high-contrast mode as bright white triangles on a dark button. Click, click, click — rule 5 moves to position 2. Three clicks instead of one drag. Each click is short — no sustained pressure.

**Minute 4:00 — Inspector at Magnification**
The Inspector timeline scrubber is a thick horizontal bar. At 250% magnification, each tick indicator is about 15px wide — comfortable to click. She clicks tick 14 directly instead of using arrow keys. The unit's buffer panel shows slot contents at enormous text size. "enemy_at_G6, tick 4, fidelity 0.8" wraps to two lines at this scaling — the layout handles it gracefully.

The queue depth chart is a simple bar graph — at 250% zoom, each bar is thick and clearly colored. Green bars below 50% fill. Amber above 75%. Red when full. In high-contrast mode: white bars with pattern fills (empty, half-hash, full-solid).

**UI Annotations:**
- Focus-follows-selection: board and workbench auto-scroll in sync
- 48px minimum touch/click targets (after text scaling)
- No drag-only interactions — every drag has a click-based alternative
- Channel name autocomplete dropdown eliminates typing
- High-contrast mode: black/white/yellow only, 3px borders, 4px focus ring

---

## Interaction Effects

### With Building Blocks (3.xx)
- **Priority Queue rules** are the most accessible rules language — linear list, clear precedence, no spatial arrangement required. Screen readers read them as an ordered list. One-handed players reorder with arrow buttons. Sentence Builder (3.05 Option D) is also strong for dyslexia (icons on tiles) but harder for screen readers (spatial arrangement).
- **Node graph building blocks** are the LEAST accessible paradigm — they require spatial reasoning, precise mouse targeting, and visual connection tracing. If node graphs are used, they need a fully parallel list-based alternative for accessibility.

### With Sealed Watch (Locked)
- The "no tools" rule during Sealed Watch is an accessibility asset: it means there are NO interactions to make accessible during this phase. The only accessibility work is output (narration for blind players, visual replacements for deaf players).
- The 1-second tick pace is ADHD-friendly — regular, predictable stimulation with zero decisions required.

### With Inspector (Locked)
- The Inspector is the most accessibility-intensive screen: it has the most interactive elements, the most data, and the most complex navigation. But it's also untimed, fully keyboard-navigable, and DOM-heavy (naturally screen-reader-compatible).
- Simple mode's Inspector shows less data — this directly reduces cognitive load for ADHD and learning disability players.

### With Onboarding (5.xx)
- **Simple mode should be the default for Mission 1-2** regardless of player accessibility settings. The game's own teaching progression mirrors accessibility's progressive disclosure. The "turn off Simple mode" moment should coincide with the game introducing the systems that Simple mode hides.
- Boot log speed control is both a narrative pacing feature and a dyslexia accommodation.

### With Mobile / Touch (6.07)
- Touch targets on mobile must meet 44×44px minimum (Apple HIG) / 48×48dp (Material Design). This is BOTH mobile design and motor accessibility.
- Mobile screen readers (VoiceOver, TalkBack) interact differently with canvas than desktop screen readers. PixiJS accessibility system supports both, but testing is required.

### With Audio Design (6.02)
- Every audio-only cue needs a visual equivalent (deaf accessibility).
- Every visual-only cue needs an audio equivalent (blind accessibility).
- This bidirectional requirement means the game has built-in redundancy across all information channels — which benefits ALL players, not just those with disabilities.

### With Competitive PvP (7.01)
- Assist Mode raises a fairness question for ranked play. Options: (1) Assist Mode unavailable in ranked, (2) Assist Mode available but disclosed to opponent, (3) Assist Mode always available because the game's core decisions (agent configuration) aren't affected by tick speed or buffer bonuses. **Option 3 is correct** — the game tests information architecture skill, not reflexes. A buffer size bonus doesn't make a player's DESIGN better. And the ESA AGI standard pushes toward not restricting competitive accessibility.

---

## Comparable Games / Media

| Game | Accessibility Approach | What Robot Uprising Can Learn |
|------|----------------------|------------------------------|
| **Celeste** | Assist Mode with granular options, zero judgment, no locked content | The gold standard for difficulty accessibility. Copy the tone, the granularity, and the "no achievements disabled" principle. |
| **Slay the Spire** | No built-in screen reader support; community mods (Say the Spire, TextTheSpire, InSpire) fill the gap | Robot Uprising must ship with screen reader support, not rely on mods. The mod community proved blind players CAN play card/strategy games — the demand exists. |
| **The Last of Us Part II** | 60+ accessibility options across visual, auditory, motor, cognitive; won multiple accessibility awards | Set the industry ceiling. TLoU2 proved that AAA accessibility is commercially viable — it expanded the audience. |
| **Into the Breach** | Grid-based, perfect information, keyboard-playable; no specific accessibility features but inherently accessible due to discrete clean states | Robot Uprising inherits Into the Breach's structural accessibility advantages (grid, discrete ticks, no fog of war on own units). Add explicit features on top. |
| **Hades** | God Mode (gradually increasing damage resistance on death); no judgment, narratively integrated | God Mode's gradual assistance is elegant but doesn't apply to a non-action game. The "narratively integrated" part does — Assist Mode settings could appear in the boot log as "system parameters adjusted." |
| **Factorio** | High-contrast mode introduced late; extensive keyboard shortcuts; community accessibility mods | Factorio's information density problem is similar to Robot Uprising's. Their community-driven approach is slower than built-in support. |

---

## The TikTok Clip

**Clip: "The Screen Reader Playthrough"**
A 15-second clip of a blind player's screen — black except for a screen reader output panel showing text. The narration voice reads: "Tick 6. Scout perceives enemy. Hook fires on alarm." Then: "Tick 12. Striker eliminates enemy." Then the player pumps their fist. Caption: "This game was designed for screen readers from day one. I'm playing a strategy game. With my ears."

**Why it works:** Accessibility-as-feature is a powerful narrative. It generates goodwill, press coverage, and genuine emotion. The clip demonstrates that a blind player isn't getting a degraded experience — they're playing the SAME game, just through a different sense. The text narration IS the game for them, the way the visual board IS the game for sighted players.

---

## New Aspects Discovered

1. **6.08a — Accessibility testing matrix and QA pipeline:** Defining the combinatorial testing requirements — how many configurations of colorblind × screen reader × magnification × motor × cognitive settings need testing; automated accessibility testing via Playwright + axe-core; screen reader testing across NVDA, JAWS, VoiceOver, TalkBack.

2. **6.08b — Accessibility as game narrative:** The AI protagonist has "senses" (perception module, signal bus, context buffer). Accessibility settings could be framed diegetically as "adjusting your own perception parameters" — the blind player isn't disabling visuals, they're "routing all output through the signal bus." The dyslexia font isn't an accommodation, it's a "text rendering optimization." Whether diegetic framing helps or feels patronizing.

3. **6.08c — Community accessibility profile sharing:** Sharing accessibility configuration presets ("Sana's screen reader profile," "Marcus's one-handed profile") through the Steam Workshop or a dedicated community board. Players with similar disabilities can download and fine-tune instead of configuring from scratch.

4. **6.08d — Accessible Gauntlet: competitive fairness with Assist Mode:** Deep design of how ranked play interacts with every Assist Mode option — which options are neutral (font, color, narration), which affect game state (buffer bonus, enemy speed), and how matchmaking handles the distinction. ELO adjustment? Separate brackets? Universal access?

5. **6.08e — The "accessibility cliff" at Mission 5 (factory introduction):** Mission 5 introduces production queues, blueprints, factory mechanics, and resource management simultaneously. This is the steepest complexity jump in the campaign. For cognitively impaired players, this cliff needs specific accommodation: extended tutorial, simplified factory mode, or an extra bridging mission. The Mission 5 moment is where accessible design and game design converge most critically.
