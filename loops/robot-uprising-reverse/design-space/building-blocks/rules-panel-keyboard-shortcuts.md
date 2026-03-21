# 3.07d — Rules Panel Keyboard Shortcuts: The Mouseless Speedrun

## Overview

The rules panel is the heart of agent configuration. Every condition-to-action pair, every priority reorder, every enable/disable toggle passes through it. For players who configure 4-rule Scouts, the mouse is fine. For players building 16-rule Command units across multiple blueprints in a competitive session, the mouse becomes a bottleneck — a 400ms round-trip of hover, click, drag, release for every atomic operation that should take 80ms.

This analysis maps the complete keyboard shortcut system for the rules panel: how a player goes from empty blueprint to fully configured agent without touching the mouse. The design must satisfy three constraints simultaneously: (1) zero interference with mouse/drag-and-drop workflows, (2) progressive discoverability so new players stumble into shortcuts naturally, (3) enough depth that expert players achieve genuine flow state — the feeling of thinking in rules rather than thinking about the UI.

The locked spec establishes rules as ordered condition-to-action Sentence Strips (3.07 Paradigm A) with drag-to-reorder priority, displayed in "The Cartographer's Rack" numbered slots (3.07a). The Rule Graveyard (3.07e) adds the power toggle. This analysis adds a parallel input layer on top of the existing visual system.

---

## The Complete Shortcut Map

### Navigation Layer — "The Cursor"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Up / Down Arrow** | Move focus between rule strips | 2px cyan left-edge highlight slides between strips with 80ms ease-out |
| **Home** | Jump to rule 1 (highest priority) | Focus snaps to top; minimap indicator flashes |
| **End** | Jump to last rule | Focus snaps to bottom |
| **Tab** | Move focus forward through fields within a rule (condition slot 1 → condition slot 2 → action slot → action parameter) | Active field gains 2px cyan underline; previous field dims |
| **Shift+Tab** | Move focus backward through fields within a rule | Reverse of Tab |
| **Escape** | Exit current field / cancel current operation / exit keyboard mode entirely (three-level escape ladder) | Field deselects → rule deselects → panel loses focus border |

### Creation Layer — "The Forge"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Ctrl+N** | Create new rule below current focus position | Empty strip slides in from the right (200ms), all strips below shift down; new strip's first condition slot auto-focuses with blinking cursor |
| **Ctrl+Shift+N** | Create new rule at position 1 (top priority) | Same animation but inserts at top; all existing strips shift down |
| **Ctrl+D** | Duplicate focused rule, insert copy directly below | Clone strip fades in at 60% opacity then firms to 100% over 150ms; clone inherits all field values; first field auto-focuses for modification |
| **Enter** | When a dropdown field is focused: open the dropdown; when dropdown is open: confirm selection and advance to next field | Dropdown opens with 100ms slide-down; selection highlights in cyan |
| **Space** | Toggle the power state (active/disabled) of focused rule — the Rule Graveyard (3.07e) toggle | Power icon (12x12 circle) animates: filled cyan → hollow gray (disable) or gray → cyan (enable); strip opacity transitions to 35% or 100% |

### Manipulation Layer — "The Reorder"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Ctrl+Up** | Move focused rule up one priority position | Strip lifts 4px (z-elevation shadow appears), slides up past its neighbor in 120ms, settles into new position; priority numbers on both affected strips re-render |
| **Ctrl+Down** | Move focused rule down one priority position | Mirror of Ctrl+Up |
| **Ctrl+Shift+Up** | Move focused rule to position 1 (maximum priority) | Strip lifts, accelerates upward past all intermediate strips (40ms per strip crossed), lands at top with a subtle bounce |
| **Ctrl+Shift+Down** | Move focused rule to last position (minimum priority) | Mirror of Ctrl+Shift+Up |
| **Ctrl+Backspace** | Delete focused rule | Strip compresses horizontally to zero width over 200ms (the "crumple"), then strips below slide up to fill the gap; a 3-second undo toast appears bottom-left: "Rule deleted. Ctrl+Z to undo" |
| **Ctrl+Z** | Undo last action (create, delete, reorder, edit, toggle) | Reversed animation of whatever the last action was; undo stack depth of 20 |
| **Ctrl+Shift+Z** | Redo | Forward animation |

### Field Editing Layer — "The Scribe"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Enter** (on focused field) | Open dropdown picker for that field | Dropdown slides down from field; items filterable by typing |
| **Type any letter** (dropdown open) | Filter dropdown options; "en" filters to "enemy_spotted," "enemy_adjacent," etc. | Non-matching options fade to 20% opacity; matching options remain full brightness; first match auto-highlights |
| **Up/Down** (dropdown open) | Navigate filtered options | Cyan highlight bar moves between options |
| **Enter** (dropdown open, option highlighted) | Confirm selection, close dropdown, advance Tab focus to next field | Selected value snaps into the token slot with a 60ms scale-up pulse; focus moves right |
| **Escape** (dropdown open) | Cancel without selecting, restore previous value | Dropdown retracts upward; field reverts |
| **Ctrl+E** | Expand/collapse focused rule's detail view (shows full condition text, parameter sliders, notes field) | Rule strip height animates from 48px (collapsed) to 96-128px (expanded); neighboring strips shift to accommodate |

### Mode Layer — "The Stance"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **/** (slash) | Enter command palette mode — type a command name to execute (vim-style) | A 280px wide command input appears at the bottom of the rules panel, dark background, monospace font, blinking cursor after "/" |
| **/new** | Alias for Ctrl+N | |
| **/dup** | Alias for Ctrl+D | |
| **/del** | Alias for Ctrl+Backspace | |
| **/top** | Move focused rule to position 1 | |
| **/bot** | Move focused rule to last position | |
| **/swap [n]** | Swap focused rule with rule at position n | Both strips lift, cross paths mid-air (150ms), land in each other's positions |
| **?** | Open shortcut cheat sheet overlay | Semi-transparent dark overlay with all shortcuts in a two-column grid; fades in 200ms; any keypress dismisses |

---

## The Keyboard Focus State: Visual Language

When the player presses any navigation key while the rules panel is visible, the panel enters **keyboard mode**. This is indicated by:

1. **The Focus Rail** — A 2px cyan vertical line appears on the left edge of the entire rules panel, running its full height. This signals "this panel is listening for keyboard input."

2. **The Focus Strip** — The currently focused rule gains a 2px cyan left-edge highlight and a subtle 1px cyan glow around its entire border (box-shadow: 0 0 4px rgba(0, 200, 255, 0.3)). The strip's background brightens by 5% relative to its siblings.

3. **The Focus Field** — Within the focused strip, the active field (condition slot, action slot, parameter) gains a 2px cyan underline and the field text brightens to full white (from the default 85% white of unfocused fields).

4. **The Priority Pulse** — When a rule is reordered via keyboard, its priority number badge (the white circle with black number on the left edge) pulses cyan once (scale from 1.0 to 1.3 and back over 200ms) to confirm the new position registered.

5. **Mouse Exit** — Keyboard mode persists until the player clicks anywhere with the mouse, at which point the Focus Rail fades out over 150ms and the panel returns to mouse-primary mode. The two modes never conflict because keyboard mode adds visual indicators but never removes mouse targets. Drag handles remain visible and functional. The player can grab a drag handle mid-keyboard-session and the panel seamlessly transitions.

---

## The Full Mouseless Workflow: Empty Blueprint to Configured Agent

Starting from an empty blueprint on a Scout unit (4 rule slots in The Cartographer's Rack):

1. **Tab** into the rules panel (focus rail appears).
2. **Ctrl+N** — first empty rule appears at position 1, first condition field focused.
3. Type "en" — dropdown filters to enemy conditions. **Down, Down, Enter** — select "enemy_in_range." Tab to range parameter. Type "3." **Enter.** Tab to action field. Type "ev" — filters to "evade." **Enter.** Rule 1 complete.
4. **Ctrl+N** — second rule at position 2. Type "buf" — "buffer_fill." Tab. Type ">6." Tab. Type "com" — "compress." **Enter.** Rule 2 complete.
5. **Ctrl+N** — third rule. Build it. Realize it should be higher priority than rule 2.
6. **Ctrl+Up** — rule 3 becomes rule 2, old rule 2 becomes rule 3. Priority numbers re-render. Both strips slide past each other with that satisfying 120ms animation.
7. **Ctrl+N** — fourth rule. Build it.
8. Review: **Home** to jump to rule 1. **Down, Down, Down** to scan each rule's content. Satisfied.
9. **Escape** out of keyboard mode. Hit EXECUTE.

Total time for an expert: 15-25 seconds for 4 rules. Compare to mouse workflow: 45-60 seconds (click [+ Add Rule], click condition dropdown, scroll, click, click parameter field, type, click action dropdown, scroll, click, repeat; then drag-to-reorder with the scroll-while-dragging problem for any position changes).

For a 16-rule Command unit, the savings compound. The expert keyboard player builds at ~4 seconds per rule (type-filter-enter cadence) plus ~1 second per reorder. A 16-rule config takes ~75 seconds by keyboard versus ~4-5 minutes by mouse. This is the speedrun.

---

## Player Journeys

#### Journey: Anika, 14, Minecraft Redstone Builder (Jakarta)

**Context:** Mission 4. Anika has built four blueprints so far, all by mouse. She is configuring a relay with 3 rules. She has never been told about keyboard shortcuts.

**Minute 0:00 — The Accidental Discovery**
Anika is dragging her third rule into position 2. The drag wobbles — her touchpad is imprecise. She overshoots and drops the rule at position 1 instead of position 2. She sighs. She reaches for the drag handle again. Her left hand is resting on the keyboard. She accidentally hits the down arrow. The cyan focus highlight appears on the rule she just misplaced. She pauses.

**Minute 0:15 — The Curiosity Beat**
The focus strip is new — she hasn't seen this cyan glow before. She presses Down again. The focus moves to rule 2. Up — back to rule 1. Her eyebrows lift. She's navigating rules with the keyboard. She tries Tab. Focus jumps into the condition field of rule 1. She sees the cyan underline. She presses Escape — focus backs out to the strip level.

**Minute 0:30 — The Reorder Moment**
She wants to move rule 1 back to position 2. On instinct, she tries Ctrl+Down (she uses this in file managers). The strip lifts, slides down, settles into position 2. The priority numbers swap: 1 becomes 2, 2 becomes 1. She gasps. That was one keypress instead of a drag operation. She tries Ctrl+Up — it moves back. Ctrl+Down — back to position 2.

**Minute 0:50 — The Question Mark**
She wonders what else works. She presses "?" — the cheat sheet overlay appears. Two columns of shortcuts. She scans: Ctrl+N for new rule, Ctrl+D to duplicate, Ctrl+Backspace to delete. She dismisses the overlay with Escape. She tries Ctrl+N — a new empty rule appears below her focused position. The condition field is already blinking.

**Minute 1:10 — The First Keyboard Rule**
She types "al" into the condition field. The dropdown filters to "ally_in_range." She presses Enter. Tabs to the range field. Types "2." Tabs to the action. Types "am" — "amplify" highlights. Enter. She just built an entire rule without touching the touchpad. The rule exists, fully formed, in about 8 seconds.

**Minute 1:30 — The Hybrid**
For the rest of Mission 4, she uses keyboard for rule creation and reordering, mouse for the skills panel and context config (she doesn't know those panels have shortcuts yet). She settles into a natural hybrid: left hand on keyboard for rules, right hand on touchpad for everything else.

> **UI annotations:**
> - 0:15 — Focus Rail (2px cyan vertical line) appears on rules panel left edge; Focus Strip (cyan glow) on rule 1
> - 0:30 — Ctrl+Down: strip lifts with 4px elevation shadow, slides past neighbor (120ms), priority badges pulse cyan
> - 0:50 — "?" cheat sheet: semi-transparent dark overlay, two-column shortcut grid, 200ms fade-in
> - 1:10 — Type-to-filter: non-matching dropdown items fade to 20% opacity; "amplify" at full brightness with cyan highlight bar

---

#### Journey: Datu, 32, DevOps Engineer and Competitive Player (Cebu)

**Context:** Mission 9 tournament qualifier. Datu has 400 hours in Robot Uprising. He is building a 14-rule Command unit blueprint from scratch. His opponent is doing the same. The qualifier has a 5-minute preparation phase before battle. Datu's hands have not touched his mouse in three missions.

**Minute 0:00 — The Opening Sequence**
Tab into rules panel. Ctrl+N. The empty strip slides in. His fingers are already typing: "s-u-b" — "subordinate_count." Enter. Tab. "<3." Tab. "r-e-a" — "reassign." Enter. Ctrl+N. Next rule. The cadence is rhythmic: create-type-enter-tab-type-tab-type-enter. Each rule takes 3-4 seconds. He does not look at the dropdown — he knows every condition and action name by heart. The type-to-filter is a direct channel from his vocabulary to the rule system.

**Minute 0:20 — Six Rules Down**
He has built six rules in twenty seconds. His hands move in a pattern that looks like touch-typing a document — because it functionally is. He is typing sentences: "WHEN subordinate_count less than 3, DO reassign. WHEN buffer_fill greater than 8, DO compress. WHEN enemy_tagged AND distance less than 2, DO engage nearest." The keyboard shortcut system has collapsed the UI into a text interface wearing a graphical skin.

**Minute 0:45 — The Reorder Block**
Rules 1-6 are drafted. Now the priority architecture. He knows from experience that defensive rules must outrank offensive rules for this Command doctrine. He focuses rule 5 (a defensive "evade if flanked" rule). Ctrl+Shift+Up — it rockets to position 1. The strip lifts, accelerates upward past four neighbors (40ms each = 160ms total), bounces into slot 1. Four priority badges below it re-render in sequence like a falling domino cascade. He focuses the new rule 4 (was rule 6). Ctrl+Up, Ctrl+Up — moves it to position 2. The reorder block takes 4 seconds for what would have been four separate drag operations.

**Minute 1:10 — The Duplicate Sprint**
Rules 7-10 are variations on rules 1-4 with different thresholds (higher aggression for the late-game phase). Ctrl+D on rule 1 — exact clone appears at position 2. Tab to the threshold field. Type "5" (was "3"). Enter. Ctrl+Down, Ctrl+Down, Ctrl+Down — move the clone to position 8. Each duplicate-and-modify takes ~5 seconds. Four clones done in 20 seconds.

**Minute 1:50 — The Architecture Review**
Fourteen rules configured. Home to jump to rule 1. Down-arrow slowly through all 14, reading each strip. He catches a mistake: rule 9's action should be "reroute" not "reassign." Focus on rule 9. Tab, Tab to action field. Enter — dropdown opens. Type "rer" — "reroute" highlights. Enter. Fixed in 2 seconds.

**Minute 2:15 — The Disable Hedge**
He's not sure rules 12-14 (aggressive late-game overrides) are correct for this opponent. Rather than delete, he focuses rule 12. Space — the power toggle flips. The strip fades to 35% opacity, the power icon hollows to gray. Space on rule 13. Space on rule 14. Three rules disabled in under 2 seconds. The Rule Graveyard (3.07e) is his hedge — he can re-enable them mid-tournament between rounds with three Space presses.

**Minute 2:30 — Done**
Fourteen rules, priority-ordered, three conditionally disabled. Two minutes and thirty seconds. His opponent, using mouse, is on rule 8 of 12 and still drag-reordering. Datu opens the skills panel to review while he waits.

> **UI annotations:**
> - 0:00-0:20 — The Speedrun Cadence: Ctrl+N → type → Enter → Tab → type → Tab → type → Enter rhythm at ~250ms per keystroke
> - 0:45 — Ctrl+Shift+Up: strip lifts with elevation shadow, accelerates upward past 4 strips (40ms/strip), bounce at top, domino priority re-render
> - 1:10 — Ctrl+D: clone fades in at 60% opacity, firms to 100% over 150ms; all field values inherited
> - 1:50 — Architecture review: Home snaps to position 1; Down-arrow scanning at ~400ms per rule (read cadence); focus strip slides smoothly
> - 2:15 — Space toggle: power icon animation (cyan filled → gray hollow), strip opacity 100% → 35% over 150ms; three toggles in rapid succession create a visual "dimming wave" down the panel

---

#### Journey: Marcus, 42, Sys Admin and Casual Player (Melbourne)

**Context:** Mission 7, third attempt. Marcus has lost this mission twice. His Scout squad keeps dying to enemy flanking maneuvers. He knows the problem is in his rules — his scouts engage when they should evade — but he has been unable to fix the priority ordering through drag-and-drop because the reorder changes keep creating new problems. He is frustrated. He learned the keyboard shortcuts two missions ago but has only used Ctrl+N and arrow navigation.

**Minute 0:00 — The Losing Streak Analysis**
Marcus opens the Inspector from his last failed attempt. The Change Lens (3.07c) shows his rules diff: he moved rule 3 (engage) above rule 2 (evade) between attempts, which is why his scouts charged instead of fled. He groans. He opens the workbench. Three scouts, each with 6 rules. He needs to fix the priority architecture across all three.

**Minute 0:20 — The Iteration Begins**
Scout Alpha's blueprint. He focuses rule 3 ("IF enemy_adjacent DO engage") and presses Space — disabled. The strip dims to 35%. Now he can see what the other 5 rules do without engage stealing every encounter. He hits EXECUTE for a quick mental simulation. Realizes his evade rule (rule 2) has the wrong range threshold — it triggers at distance 1, but flankers hit from distance 2.

**Minute 0:45 — The Rapid Edit**
Focus on rule 2. Tab to the range parameter. The cyan underline appears on "1." He presses Enter to open the field, types "2," presses Enter. The value updates instantly. He doesn't need to click the tiny parameter field, position his cursor precisely, select the text, type the new value, click away — the keyboard path is four keystrokes where the mouse path is six operations with sub-pixel targeting.

**Minute 1:00 — The Experimental Duplicate**
He wants to test a new theory: what if scouts evade at range 3 AND compress their observations before fleeing? Ctrl+D on rule 2 — a clone appears below it. Tab to the range parameter on the clone. Enter, type "3." Tab to the action. Enter, type "com" — "compress." Enter. He now has two evade-adjacent rules: the original "evade at range 2" at priority 2, and a new "compress at range 3" at priority 3. The scout will compress observations of distant threats before evading close ones. This is a new idea. It took 6 seconds to prototype.

**Minute 1:20 — The Toggle Test**
Space on the original evade rule (rule 2) — disabled. Now only the new compress-at-range-3 rule is active. EXECUTE. He watches the sealed watch. The scout compresses enemy observations and broadcasts them before the flanker closes — but then gets killed because there's no evade rule active. Right. Space on rule 2 — re-enabled. Now both are active. EXECUTE again. This time the scout compresses at range 3, then evades at range 2. The observations reach the relay before the scout retreats. This works.

**Minute 1:50 — The Cross-Blueprint Propagation**
Marcus needs this same fix on Scout Beta and Scout Gamma. He doesn't know about Rules Copy-Paste (3.07b) yet — he manually rebuilds the rule on each blueprint. But with keyboard shortcuts, "manually rebuild" means Ctrl+N, type conditions, Tab through fields, Enter to confirm. Two blueprints, two new rules each, done in 40 seconds. Without shortcuts, this would have been 2+ minutes of clicking and dropdown navigation.

**Minute 2:40 — The Third Attempt**
EXECUTE on Mission 7, take 3. The scouts compress, broadcast, and evade in sequence. The relay amplifies the compressed data. The command unit sees the flanking maneuver three ticks early and reassigns the striker to intercept. Mission success. Marcus leans back. The two-minute keyboard iteration loop just solved a problem that two full 8-minute mouse-driven attempts couldn't.

> **UI annotations:**
> - 0:20 — Space disable: strip dims to 35%, power icon hollows; this is "hypothesis isolation" — disable one rule to see the system without it
> - 0:45 — Tab to parameter, Enter to open: field editing is 4 keystrokes vs. 6 mouse operations; cyan underline shows active field
> - 1:00 — Ctrl+D clone: clone appears at 60% opacity, firms to 100%; Tab-Enter-type-Enter cadence through fields
> - 1:20 — Rapid Space toggle + EXECUTE cycle: enable/disable takes <0.5s, enabling "A/B testing" of individual rules between executions
> - 2:40 — The payoff: keyboard shortcuts enabled a 3-iteration experimental loop in under 3 minutes; mouse workflow would have taken 10+

---

## Strengths

**"The Vim Mode" — Expert Velocity Ceiling.** The keyboard system creates a genuine speed tier. At 400 hours, a player's rule-building speed is limited only by their typing speed and their knowledge of condition/action vocabulary. The type-to-filter dropdowns are effectively a command language. Players who internalize the vocabulary can configure agents at the speed of thought — the UI disappears and they are thinking directly in rules.

**"The Iteration Accelerator" — Tighter Feedback Loops.** The real power is not in building faster but in iterating faster. Space to toggle, Ctrl+D to clone, Tab-Enter to edit a single parameter — these three shortcuts reduce the cost of "what if I change this one thing?" from 15 seconds (mouse) to 2 seconds (keyboard). When iteration costs drop below a threshold, players shift from deliberative planning to experimental play. They try things. They learn faster.

**"The Muscle Memory Moat" — Retention through Embodiment.** Keyboard shortcuts create physical habits that are harder to forget than click-target memories. A player who takes a two-week break remembers Ctrl+N for new rule because the muscle pattern is stored in motor cortex, not declarative memory. This is the same reason vim users can type commands after years away — the fingers remember.

**Zero Interference Coexistence.** The shortcut system adds to the mouse workflow without subtracting from it. Drag handles still work. Click targets still work. A player can use keyboard for rule creation and mouse for reordering, or vice versa, or any mixture. The Focus Rail visual indicator makes the current input mode obvious without forcing a mode switch.

**Progressive Discovery.** The "?" cheat sheet and the accidental-arrow-key discovery path mean shortcuts are findable without tutorials. The system teaches itself through affordance: the cyan focus highlight is visible and curiosity-inducing, and once a player sees it, they experiment with nearby keys.

---

## Weaknesses

**"The Invisible Ceiling" — Discoverability Gap.** Despite the "?" overlay, most players will never discover the full shortcut set. Keyboard shortcuts are inherently invisible — there is no visual element on the rules panel that says "press Ctrl+N." The cheat sheet helps, but only if the player thinks to press "?". Tooltips on UI elements (e.g., the [+ Add Rule] button could show "or press Ctrl+N") partially address this but risk visual clutter. The power curve between shortcut-users and mouse-users is steep, which could feel unfair in competitive modes.

**"The Wrong-Key Catastrophe" — Destructive Shortcuts.** Ctrl+Backspace deletes a rule. In a fast-paced configuration session, a slip from Ctrl+D (duplicate) to Ctrl+Backspace (delete) destroys a carefully built rule. The 3-second undo toast and Ctrl+Z mitigate this, but the emotional spike of accidentally deleting rule 7 in a 16-rule Command config during a tournament timer is significant. The undo stack depth of 20 helps, but multi-step undos (undo a reorder, then undo a delete, then undo another reorder) can be disorienting.

**"The Accessibility Tax" — Motor Requirements.** Ctrl+Shift+Up requires three simultaneous keys. Players with motor disabilities, repetitive strain injuries, or non-standard keyboard layouts may find multi-modifier shortcuts inaccessible. The system needs rebindable shortcuts (adding implementation complexity) and alternative single-key sequences (the "/" command palette partially addresses this).

**"The Split Brain" — Keyboard Mode Confusion.** When keyboard mode is active on the rules panel but the player's mental attention shifts to the skills panel, keystrokes intended for skills may be captured by the rules panel. The Focus Rail indicates which panel is active, but in fast configuration sessions, players may not check. Misrouted keystrokes — pressing Ctrl+N to add a skill but creating a new rule instead — would be confusing.

**Platform Fragmentation.** Ctrl+N conflicts with "new window" in most browsers. If Robot Uprising ships as a web app, browser shortcut interception is a constant battle. This requires either preventDefault() for all game shortcuts (breaking expected browser behavior) or a focus-gating system where shortcuts only activate when the game canvas has explicit focus.

---

## Interaction Effects

**Rules Panel at Scale (3.07a) — The Cartographer's Rack.** Keyboard navigation transforms the Rack from a visual display into a traversable data structure. Up/Down arrows walk the priority list. Home/End jump to extremes. The minimap sidebar (3.07a Strategy C) gains a secondary role: showing the keyboard focus position as a cyan dot on the compressed view, so the player knows where they are in a 16-rule stack even when the detail view shows only the focused rule.

**Rule Graveyard (3.07e) — Space as A/B Toggle.** The Space shortcut for enable/disable is the keyboard system's most powerful interaction effect. It transforms the Rule Graveyard from a storage mechanism into a live experimentation tool. Toggle-EXECUTE-observe-toggle-EXECUTE-observe becomes a rapid cycle. The spacebar's physical size (the largest key on the keyboard) makes it a natural target for the most frequent experimental action.

**Rules Copy-Paste (3.07b) — Cross-Blueprint Keyboard Workflow.** When combined with blueprint switching (if the player can Tab between blueprint tabs), the keyboard workflow extends across blueprints. Ctrl+C on a rule → switch blueprint tab → Ctrl+V pastes it. The keyboard user never enters the drag-between-panels interaction that mouse users struggle with.

**Rules Diff View (3.07c) — Keyboard-Driven Inspection.** After an EXECUTE, the Inspector's Change Lens overlay shows which rules changed. If the Inspector supports the same keyboard navigation, the player can arrow-key through changed rules in the diff view, then Tab back to the workbench, and keyboard-edit the rule that the diff highlighted — a seamless investigate-then-fix loop.

**Skills Panel and Context Config.** The shortcut system's principles (arrow navigation, type-to-filter, Enter to confirm, Escape to cancel) should be consistent across all workbench panels. A player who learns Ctrl+N in the rules panel expects a similar "create new" shortcut in the skills panel (Ctrl+N to add a skill) and context config (Ctrl+N to add a channel). Consistency across panels means learning one panel's shortcuts teaches all panels. Inconsistency means the player must learn three separate systems.

**Hook Wiring (3.08-3.10).** Hook configuration involves connecting signal sources to listeners. Keyboard shortcuts for hooks might use a different paradigm — arrow keys to navigate the signal graph rather than a linear list. The rules panel's linear Up/Down navigation doesn't translate directly to hook topology. The player may need to mentally switch between "list navigation" (rules) and "graph navigation" (hooks), which is a cognitive mode shift.

**Production Queue.** If the production queue panel also supports keyboard shortcuts, a full keyboard workflow emerges: configure blueprint (rules panel shortcuts) → queue production (Ctrl+Q to add to queue, number keys to set count) → EXECUTE → inspect results (Inspector shortcuts). The entire plan-build-test loop becomes mouseless.

**Controller/Gamepad Adaptation.** The shortcut map translates to gamepad with deliberate mapping: D-pad Up/Down for rule navigation, A button for Enter/confirm, B button for Escape/cancel, bumpers for Tab/Shift+Tab, triggers for Ctrl-modified actions (left trigger + D-pad Up = Ctrl+Up reorder). The "/" command palette becomes accessible via a dedicated "menu" button. The Focus Rail and Focus Strip visual indicators are large enough to read on a TV screen at 3m distance. The type-to-filter dropdowns would need an on-screen keyboard or a radial menu alternative on gamepad — this is the weakest translation point.

**Accessibility.** Beyond rebindable keys, the system needs: (1) screen reader announcements for every state change ("Rule 3 moved to position 2," "New rule created at position 5," "Rule 7 disabled"), (2) high-contrast Focus Strip option (4px border instead of glow for players who can't see subtle shadows), (3) sticky modifier keys (press and release Ctrl, then press N, instead of holding both) for motor accessibility, (4) adjustable animation speeds (some players need the 120ms reorder animation slowed to 300ms to track the movement; others want 0ms instant snap).

---

## Comparable Games and Tools

**Vim.** The spiritual ancestor. Vim's modal editing (normal mode for navigation, insert mode for typing, command mode for operations) maps directly to the rules panel's keyboard layers: arrow navigation is normal mode, Tab-into-field is insert mode, "/" is command mode. The key lesson from Vim: the learning curve is brutal but the productivity ceiling is unmatched. Robot Uprising should be gentler than Vim (no separate mode switching, shortcuts work alongside mouse) but can aspire to Vim's expert velocity. Vim's "." command (repeat last action) is worth stealing: a "repeat last shortcut" key would let the player Ctrl+N, configure a rule, then "." to create another rule with the same template.

**Factorio Blueprint Hotkeys.** Factorio's blueprint system uses Q (clear cursor), Ctrl+C (copy area), Ctrl+V (paste area), R (rotate), and extensive keyboard shortcuts for entity configuration. The lesson: Factorio players who learn the hotkeys play a fundamentally different game than mouse-only players. The Factorio community explicitly celebrates "the keyboard player" as a playstyle. Robot Uprising can expect the same culture.

**StarCraft Control Groups.** Ctrl+1 through Ctrl+0 to assign units to control groups. 1 through 0 to select them. The physical speed of control group switching (single keypress) enabled the APM (actions per minute) that defined competitive StarCraft. Robot Uprising's rules panel shortcuts create a similar "APM for configuration" — the speed of blueprint iteration becomes a competitive differentiator.

**FL Studio Piano Roll.** FL Studio's piano roll uses Ctrl+Up/Down to transpose notes, Ctrl+Left/Right to shift timing, and extensive keyboard shortcuts for note creation, deletion, and modification. The lesson: when the keyboard interface mirrors the spatial metaphor (up = higher pitch, up = higher priority), shortcuts feel natural rather than arbitrary. Robot Uprising's Ctrl+Up = higher priority follows this principle exactly.

**Excel.** Ctrl+D (fill down) duplicates cell content. Tab moves between cells. Enter confirms and moves down. Ctrl+Z undoes. Excel's shortcut vocabulary is the most widely known keyboard interface in the world. Robot Uprising borrows directly: Ctrl+D for duplicate, Tab for field navigation, Enter for confirm, Ctrl+Z for undo. Any player who has used a spreadsheet will find half the shortcuts already in muscle memory.

**VS Code.** Ctrl+Shift+P for the command palette is the direct ancestor of Robot Uprising's "/" command palette. VS Code proved that a type-to-filter command system can replace hundreds of menu items. The lesson: the command palette is the universal fallback — if a player forgets the specific shortcut, "/" gets them to the same action through typing.

---

## Sensory Description: The Feel of Mouseless Configuration

### The Tactile Rhythm

There is a cadence to expert keyboard configuration that feels like playing a musical instrument. The left hand holds Ctrl as a drone note — thumb on Ctrl, fingers free for N, D, Up, Down, Backspace. The right hand dances between the arrow keys (navigation), the letter keys (type-to-filter), Enter (confirm), and Escape (cancel). The two hands form a complementary pair: left hand commands, right hand specifies.

The rhythm of creating a rule: **thunk** (Ctrl+N — a firm press with intent) — **tap tap tap** (type the condition filter, light fingertip touches) — **thud** (Enter — heavier, a commitment) — **slide** (Tab — a lateral finger sweep to the next field) — **tap tap** (type the action) — **thud** (Enter — another commitment). The rhythm is iambic: light-heavy, light-heavy. Create, specify, confirm. Create, specify, confirm. After five rules, the rhythm is automatic. The player is not pressing keys — they are speaking rules aloud in a keyboard language.

### The Visual Pulse

The screen breathes with keyboard activity. Cyan highlights slide between strips like a cursor in a text editor. Strips lift and settle during reorders with the gentleness of a card being placed on a table — not snapped, not slammed, placed. The 120ms animation duration is calibrated to feel deliberate but not sluggish. Priority number badges pulse once per reorder: a heartbeat confirming "yes, I moved."

When the player enters flow state — rule after rule, reorder after reorder, the cyan focus strip dancing up and down the panel — the visual effect is hypnotic. The rules panel becomes a living document being written in real time. The Cartographer's Rack minimap sidebar, with its cyan focus dot tracking the player's position, looks like a seismograph needle recording thought.

### The Audio Landscape

Each shortcut triggers a distinct sound, tuned to convey the action's nature without demanding attention:

- **Ctrl+N (create):** A soft rising chime — two notes, C to E, 80ms total. The sound of something appearing.
- **Ctrl+Up/Down (reorder):** A subtle wooden slide — a 60ms scrape sound, pitched up for Ctrl+Up and down for Ctrl+Down. The sound of a physical object being repositioned.
- **Ctrl+D (duplicate):** A doubled chime — the create sound played twice in rapid succession at 40ms spacing. The sound of echo.
- **Ctrl+Backspace (delete):** A soft descending tone — E to C, 80ms, slightly lower volume than create. Not a punishment sound. A closing sound.
- **Space (toggle):** A click. Literally. A 20ms mechanical click, like a light switch. On: click with a bright 2kHz overtone. Off: click without the overtone, slightly muffled. The most satisfying sound in the shortcut set because Space is the most physically satisfying key to press.
- **Enter (confirm):** A single affirmative ping — 40ms, 800Hz, clean sine wave. The "yes."
- **Escape (cancel):** Silence. Escape produces no sound. Canceling is not an event — it's the absence of an event.

At expert speed, these sounds blend into a composition. The player building a 14-rule Command config produces: *chime-tap-tap-ping-slide-tap-tap-ping* (rule 1), *chime-tap-ping-slide-tap-ping* (rule 2, faster — fewer filter characters needed), *scrape-scrape* (two reorders), *echo-tap-ping* (duplicate and modify) — a unique audio fingerprint for every configuration session. Streamers' audiences learn to "hear" the blueprint being built.

### The Flow State

At its peak, the keyboard workflow produces what psychologist Mihaly Csikszentmihalyi called "flow" — the state where challenge matches skill and self-consciousness dissolves. The rules panel keyboard system is designed to enable flow through: (1) immediate feedback (every keypress produces a visible and audible response within 80ms), (2) clear goals (the rule strip's empty fields are obvious "fill me" targets), (3) balanced challenge (the type-to-filter system rewards vocabulary knowledge without punishing imperfect recall), (4) sense of control (the Focus Rail and Focus Strip constantly confirm "you are here, and the system is listening").

The flow state in mouseless mode feels different from mouse flow. Mouse flow is spatial — the hand sweeps across the desk, the cursor arcs across the screen, the world is a landscape to traverse. Keyboard flow is linguistic — the fingers articulate words, the rules appear as sentences, the world is a document to write. Both are valid. Both produce satisfaction. But keyboard flow scales better, because language is faster than pointing.

---

## Named Patterns

| Pattern Name | Description |
|--------------|-------------|
| **The Vim Mode** | The full mouseless workflow; navigation + editing + commands through keyboard only |
| **The Speedrun Cadence** | The rhythmic Ctrl+N → type → Enter → Tab → type → Enter pattern for rapid rule creation |
| **The Toggle Test** | Space to disable, EXECUTE, observe, Space to re-enable — rapid A/B testing of individual rules |
| **The Duplicate Sprint** | Ctrl+D a base rule, Tab to the one field that differs, change it, repeat — building rule variations from templates |
| **The Architecture Review** | Home, then Down-arrow through every rule, reading the complete decision chain — the "code review" of a blueprint |
| **The Reorder Block** | Ctrl+Shift+Up/Down to move rules to extremes, then Ctrl+Up/Down to fine-tune — priority restructuring in seconds |
| **The Invisible Ceiling** | The discoverability gap where most players never find the shortcut system — the weakness the "?" overlay and button tooltips attempt to address |
| **The Keyboard Culture** | The community phenomenon where expert players share speedrun videos of blueprint configuration, normalizing keyboard-first play |
