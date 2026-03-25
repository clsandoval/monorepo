# 3.11e — Expert Keyboard Workflow for Hook Wiring: Ctrl+H to Add, Tab to Wire, Enter to Confirm

## Overview

The rules panel already has a full keyboard shortcut system (3.07d): Ctrl+N to create, Tab to traverse fields, Ctrl+Up/Down to reorder, `/` for command palette mode. The hooks UI (3.11) establishes a parallel strip paradigm — WHEN [trigger] -> SEND [payload] ON [channel] — with the same field-by-field editability. But the keyboard story for hooks is currently mouse-first: click the empty slot, click the trigger radial, click the payload radial, type the channel name. A veteran player configuring 6 hooks on a Command unit across 4 blueprints per mission hits the mouse ceiling within their first competitive week.

This analysis designs the complete keyboard-driven workflow for hook wiring — from the moment the player's hands leave the mouse to the moment they can configure an entire unit's hook loadout in under 15 seconds. The "speedrun" fantasy is the design target: what does it look like when a player thinks in hooks and the UI disappears?

The hooks keyboard system must coexist with the rules keyboard system (3.07d) without shortcut collisions, share the same visual language (cyan focus rails, amber warnings, 80ms transitions), and extend naturally to hook copy-paste (3.11c) clipboard operations. The player should never need to consciously switch between "rules keyboard mode" and "hooks keyboard mode" — the focus context determines which shortcuts are active.

---

## The Complete Hook Keyboard Shortcut Map

### Panel Navigation — "Switching Lanes"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Ctrl+1** | Focus Skills section | Section header brightens; cyan focus rail appears on section's left edge |
| **Ctrl+2** | Focus Rules section | Same treatment; if already in rules, no-op |
| **Ctrl+3** | Focus Hooks section | Hooks section header gains cyan underline; first hook slot (or first empty slot) auto-focuses |
| **Ctrl+4** | Focus Context Config section | Same pattern |
| **Up / Down Arrow** | Move focus between hook strips within the hooks section | 2px cyan left-edge highlight slides between strips at 80ms ease-out, identical to rules panel behavior |
| **Home** | Jump to first hook slot | |
| **End** | Jump to last hook slot (including empty slots) | |

The section-switching shortcuts (Ctrl+1/2/3/4) are the bridge between the rules keyboard layer and the hooks keyboard layer. Once focus enters the hooks section via Ctrl+3, all subsequent Up/Down/Tab/Enter behavior operates on hook strips rather than rule strips. The active section is visually indicated by the cyan focus rail — a 2px vertical line on the left edge of the section, exactly as specified in 3.07d. Only one section has a focus rail at a time.

### Hook Creation — "The Spark"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Ctrl+H** | Create a new hook in the first available empty slot. If all slots full, play a "slot full" denial tone (low buzz, 100ms) and flash the slot counter "2/2" in amber | Empty slot transforms to a populated strip; trigger field auto-focuses with radial menu pre-opened; the lightning bolt icon (**zap**) pulses once in amber |
| **Ctrl+Shift+H** | Create a new hook and skip trigger selection — focus lands directly on channel name field. For "I know exactly what channel I need, let me name it first" workflow | Strip appears with trigger field showing "..." placeholder; channel name input focused and blinking |
| **Ctrl+D** | Duplicate focused hook into the next empty slot | Clone strip fades in at 60% opacity, firms to 100% over 150ms; trigger field auto-focuses for modification. Channel name carries over — this is the primary use case ("same channel, different trigger") |
| **Ctrl+Backspace** | Delete focused hook | Strip compresses horizontally to zero over 200ms (matches rules panel "crumple" animation); slot reverts to dashed-outline empty state; 3-second undo toast: "Hook deleted. Ctrl+Z to undo." If this was the last sender on a channel, amber orphan warning appears |

### Field Traversal — "The Wire Run"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Tab** | Advance focus through hook fields in order: Trigger -> Payload -> Channel Name | Active field gains 2px cyan underline; previous field dims to standard brightness. On channel name field: text input cursor appears, ready for typing |
| **Shift+Tab** | Reverse field traversal: Channel Name -> Payload -> Trigger | Same visual treatment, reversed direction |
| **Enter** (on trigger/payload field) | Open the radial menu for that field as a linear dropdown (keyboard-accessible variant). First option pre-highlighted | Dropdown slides down from the field at 100ms; items displayed as a vertical list with 24px row height, each with icon + label. Filter-as-you-type active immediately |
| **Enter** (on channel name field) | Confirm channel name. If name matches existing channel, connection chirp plays and background fills with channel color. If new, creation ping and color assignment. Focus advances to next empty hook slot (or stays if no empty slots) | The "plugged in" or "created" audio and visual feedback from 3.11 Paradigm A |
| **Type any letter** (dropdown open) | Filter options. "en" filters trigger list to "enemy_spotted," "entered_zone" | Non-matching options fade to 20% opacity; first match auto-highlights. Identical behavior to rules panel dropdown filtering (3.07d) |
| **Up/Down** (dropdown open) | Navigate filtered options | Cyan highlight bar moves between options |
| **Escape** | Three-level ladder: (1) close dropdown, restore previous value; (2) deselect field, return to strip-level focus; (3) exit hooks section entirely, focus rail disappears | Matches rules panel escape behavior exactly |

### Reordering — "The Priority Shuffle"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Ctrl+Up** | Move focused hook up one slot position | Strip lifts 4px with shadow, slides past neighbor in 120ms, settles; slot numbers update. Identical animation to rules reorder |
| **Ctrl+Down** | Move focused hook down one slot position | Mirror of Ctrl+Up |
| **Ctrl+Shift+Up** | Move focused hook to slot 1 | Strip accelerates upward past intermediates at 40ms per strip |
| **Ctrl+Shift+Down** | Move focused hook to last occupied slot | Mirror |

Hook reordering matters less than rule reordering (hooks don't have a priority cascade like rules do), but slot position affects visual readability and the player's mental model of their wiring topology. The reorder shortcuts are included for symmetry with the rules panel and because players who internalize Ctrl+Up for rules will reflexively try it on hooks.

### Clipboard — "The Transplant"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **Ctrl+C** | Copy focused hook to clipboard. The clipboard stores the full triple: trigger, payload, channel name | Copied strip flashes with a cyan border pulse (200ms). A small clipboard indicator appears in the hooks section header: a cyan clipboard icon with "1" badge |
| **Ctrl+V** | Paste hook from clipboard into first available empty slot on the currently-viewed blueprint. Triggers the compatibility check from 3.11c — if trigger is incompatible, the "Rewire Bench" pattern activates (channel preserved, trigger zone becomes amber dashed empty slot) | If compatible: full strip materializes with connection chirp. If incompatible: strip materializes with right side (channel) filled, left side (trigger) as amber pulsing dashed rectangle with strikethrough of original trigger. Focus auto-lands on the empty trigger field |
| **Ctrl+Shift+V** | "Paste as template" — paste only the channel name, leave trigger and payload empty. For "I want this unit on the same channel but everything else is different" | Strip appears with channel field filled (correct color), trigger and payload as empty dashed fields. Focus lands on trigger |
| **Ctrl+X** | Cut — copy to clipboard and delete from current slot | Combines Ctrl+C flash with Ctrl+Backspace crumple animation |

### Speed Commands — "The Vim Layer"

| Shortcut | Action | Visual Feedback |
|----------|--------|-----------------|
| **/** | Open command palette at bottom of hooks section. Monospace input, dark background, blinking cursor after "/" | 280px-wide input appears, identical style to rules panel command palette |
| **/hook** or **/h** | Create new hook (alias for Ctrl+H) | |
| **/dup** | Duplicate focused hook (alias for Ctrl+D) | |
| **/del** | Delete focused hook (alias for Ctrl+Backspace) | |
| **/ch [name]** | Set focused hook's channel name to [name]. Autocompletes from existing channels | Channel field updates; if match, background fills with channel color |
| **/tr [trigger]** | Set focused hook's trigger to [trigger]. Fuzzy-matches: "/tr spot" resolves to "enemy_spotted" | Trigger token snaps into place with 60ms scale-up pulse |
| **/paste [n]** | Paste clipboard into slot n specifically | |
| **?** | Open shortcut cheat sheet overlay (shared with rules panel — shows both rule and hook shortcuts in categorized columns) | Semi-transparent overlay, two-column layout, any keypress dismisses |

---

## Auto-Complete for Channel Names

The channel name field is the only free-text input in the hooks UI, and it is where the keyboard workflow either achieves flow state or breaks it. The auto-complete system must be aggressive enough to save keystrokes without being presumptuous enough to wire the wrong channel.

**Behavior specification:**

1. **0 characters typed:** Dropdown shows all existing channels, sorted by most-recently-used. Each entry: color swatch, channel name, subscriber count, last-fired tick. Maximum 8 visible entries; scrollable if more exist.
2. **1 character typed:** Fuzzy filter activates. "r" shows "recon-net," "relay-bus," "raw-data." Matching substring is bolded in the dropdown entry.
3. **2+ characters typed:** Filter narrows. "re" shows "recon-net," "relay-bus." At bottom of filtered list: "Create 'rec...' as new channel" in lighter text with a sparkle icon.
4. **Exact match typed:** Dropdown collapses. Channel field background fills with channel color. Connection chirp plays. No need to press Enter — the match is detected on keystroke. But Enter still works as explicit confirmation.
5. **Tab pressed mid-typing:** Accepts the top autocomplete suggestion. This is the speed technique — type "re" + Tab to get "recon-net" instead of typing the full name. Experienced players learn the minimum unique prefix for each channel in their architecture.

**Channel name muscle memory:** Over time, expert players develop stable channel naming conventions. "tn" always means "threat-net." "ri" always means "raw-intel." The autocomplete learns nothing — it filters purely on substring match — but the player's fingers learn the prefixes. This is the same phenomenon as Unix command-line tab completion: the system is stateless, the expertise is in the user.

---

## Player Journeys

#### Journey: Kenji, 24, Competitive Factorio veteran and hobbyist programmer

**Minute 0:00 — The Discovery**

Kenji has been playing Robot Uprising for two weeks. He has cleared the first three campaign chapters using mouse-only workflow. He is now building his fourth iteration of a Scout-Relay-Striker triangle for a timed challenge mission. He has built this architecture six times already. He knows the hooks by heart: Scout broadcasts enemy positions on `threat-net`, Relay compresses and forwards on `cmd-feed`, Striker listens on `cmd-feed` for engagement orders.

He is configuring the Scout's first hook. Click empty slot. Wait for radial menu. Hover to "enemy_spotted." Click. Tab to payload — wait, Tab doesn't — oh. He clicks the payload field. Selects "position." Clicks the channel name field. Types "threat-net." The autocomplete matches. He presses Enter.

Six clicks and twelve seconds for one hook. He has five more hooks to configure across three blueprints.

He mutters "there has to be a faster way" and presses `?`. The shortcut cheat sheet overlay appears. Two columns: "Rules Shortcuts" and "Hooks Shortcuts." His eyes find "Ctrl+H: Create new hook." He dismisses the overlay and tries it.

**Minute 0:30 — The First Shortcut**

Ctrl+H. An empty hook strip materializes and the trigger dropdown opens automatically — he did not have to click. He sees the list of trigger options. He types "en" and the list filters to "enemy_spotted" and "entered_zone." He presses Enter on "enemy_spotted." Focus jumps to the payload field. The dropdown opens. He types "po" — "position" highlights. Enter. Focus jumps to the channel name field. He types "threat-net." The autocomplete matches, background fills orange. Enter.

Four keypresses and one shortcut. Seven seconds. He did not touch the mouse.

**Minute 1:00 — The Tab Chain**

He presses Down Arrow to move focus to the second empty hook slot. Ctrl+H again. This time he is faster — "ev" + Enter for "evade_triggered," Tab, "st" + Enter for "status," Tab, "threat-net" + Enter. Five seconds. The rhythm is forming: Ctrl+H, type-filter-Enter, Tab, type-filter-Enter, Tab, type-Enter. He says the pattern aloud: "spark, filter, tab, filter, tab, name."

He switches to the Relay blueprint with the mouse (he does not yet know Ctrl+[ and Ctrl+] for blueprint switching). But within the hooks section, his hands stay on the keyboard.

**UI Annotations:**
- Shortcut cheat sheet overlay appears on `?` keypress, two-column layout, 200ms fade-in
- Ctrl+H opens trigger dropdown immediately — no intermediate "empty strip, now click" state
- Type-to-filter dropdown shows matching items at full opacity, non-matches at 20%
- Tab advances focus with 80ms cyan underline transition between fields
- Channel name autocomplete fills background with channel color on exact match

---

#### Journey: Priya, 31, Software engineer, Vim user, plays on lunch breaks

**Minute 0:00 — The Vim Instinct**

Priya discovered the `/` command palette in the rules panel during her first week. She has been using `/new`, `/dup`, and `/del` for rules since day three. When she opens the hooks section for the first time after learning keyboard shortcuts, she instinctively presses `/`. The command palette appears at the bottom of the hooks section — same dark bar, same monospace font, same blinking cursor.

She types `/h` and presses Enter. A hook is created, trigger dropdown open. She does not bother with the dropdown — she types `/tr spot` in the command palette. The command fuzzy-matches "enemy_spotted" and the trigger token snaps into place. She types `/ch threat-net` and the channel name fills. Two command palette invocations, no Tab chain, no dropdown navigation. Nine seconds for a hook, but the cognitive load is near zero — she is typing sentences, not navigating UI.

**Minute 2:00 — The Hybrid Flow**

By her third mission with keyboard shortcuts, Priya has developed a hybrid style. She uses `/h` to create hooks (command palette mode) but Tab-Enter for field editing (direct mode). The command palette is her "I know exactly what I want" tool. Tab-Enter is her "let me browse the options" tool.

She is configuring a Command unit with 6 hook slots. She opens the hooks section (Ctrl+3), creates the first hook (/h), sets trigger and channel via commands (`/tr signal_received`, `/ch cmd-feed`). Then she duplicates it five times (Ctrl+D, Ctrl+D, Ctrl+D, Ctrl+D, Ctrl+D). All six hooks now point to `cmd-feed` with `signal_received` trigger. She navigates to hook 2 (Down Arrow) and changes only the trigger: Enter to open the dropdown, types "buf" to filter to "buffer_threshold," Enter. Down Arrow. Enter, "comp," Enter. She is changing one field per hook, leaving the channel name untouched.

Six hooks configured in 22 seconds. Three via duplication shortcut, three via single-field editing.

**Minute 5:00 — The Cross-Blueprint Transplant**

Priya needs the same `threat-net` hook architecture on three Scout blueprints. She focuses the Scout's first hook (the `enemy_spotted -> position on threat-net` triple), presses Ctrl+C. Cyan border flash. She switches blueprints with the mouse, presses Ctrl+V. The hook pastes cleanly — Scouts share the same trigger vocabulary. She switches again, Ctrl+V. Again, Ctrl+V. Three pastes in four seconds.

On the fourth blueprint — a Relay — she pastes. The trigger `enemy_spotted` is not available on Relays. The Rewire Bench activates: the channel name "threat-net" fills correctly, but the trigger zone is an amber dashed rectangle with strikethrough "~~enemy_spotted~~." Focus auto-lands on the empty trigger field with the dropdown pre-filtered to the Relay's available triggers. She types "sig" — "signal_received" highlights — Enter. The amber dashes dissolve into a solid trigger token. The rewire took three seconds.

**UI Annotations:**
- `/` command palette context-switches between rules and hooks based on which section has the focus rail
- `/tr` and `/ch` commands use fuzzy matching — "spot" resolves to "enemy_spotted," "cmd" resolves to "cmd-feed"
- Ctrl+D duplicates the full hook triple including channel name — the "same channel, new trigger" workflow
- Ctrl+V into an incompatible blueprint triggers 3.11c Rewire Bench: amber dashes on trigger, channel preserved, focus auto-lands on the problem field
- Command palette commands do not require the dropdown to be open — they bypass the UI layer entirely

---

#### Journey: "ZEROCLICK," 19, Speedrun community moderator, streams competitive Robot Uprising

**Minute 0:00 — The Speedrun**

ZEROCLICK is preparing for a community tournament. The meta requires a 5-unit army: 2 Scouts, 1 Relay, 1 Striker, 1 Command. The tournament format gives 90 seconds of configuration time before each round. ZEROCLICK has practiced this loadout offline. His target: full hook configuration across all 5 blueprints in under 40 seconds.

His hands are on the keyboard. The mouse is unplugged. (He plugs it back in for the battle phase, but configuration is keyboard-only.)

**Seconds 0-8: Scout Alpha (2 hooks)**

Ctrl+3 (focus hooks). Ctrl+H (create hook). "en" Enter (enemy_spotted). Tab. "po" Enter (position). Tab. "tn" Enter (threat-net — his prefix for the channel). Down. Ctrl+H. "ev" Enter (evade_triggered). Tab. "st" Enter (status). Tab. "tn" Enter (same channel). Two hooks, eight seconds.

Blueprint switch: Ctrl+] (next blueprint in the plan screen's blueprint tab bar).

**Seconds 8-16: Scout Beta (2 hooks)**

Ctrl+V (paste from clipboard — he copied Scout Alpha's first hook at the end of the previous step using Ctrl+C before switching). Ctrl+V pastes into slot 1. Compatible — same unit type. Down. Ctrl+H. "th" Enter (threat_enter). Tab. "tl" Enter (threat_level). Tab. "tn" Enter. A variation on the same channel with a different trigger. Two hooks, eight seconds.

Blueprint switch: Ctrl+].

**Seconds 16-24: Relay (4 hooks)**

Ctrl+H. "sig" Enter (signal_received). Tab. "ci" Enter (compressed_intel). Tab. "cf" Enter (cmd-feed). Hook 1: receive from threat-net, compress, forward on cmd-feed. But wait — he needs to set the trigger to fire specifically when receiving from threat-net. He presses Shift+Tab back to the trigger field, Enter to open the dropdown, and selects the parameterized variant "signal_received_on:threat-net." The parameterized trigger syntax (from hook taxonomy 3.08) lets him scope the trigger to a specific source channel. Tab Tab, "cf" Enter. Done.

Ctrl+D (duplicate). Down. He edits only the channel output: Shift+Tab to channel field, clears with Ctrl+A then types "ri" Enter (raw-intel). Hook 2 now receives from threat-net and forwards raw on a different channel.

Ctrl+H. "buf" Enter (buffer_threshold). Tab. "st" Enter. Tab. "al" Enter (alert-line). Hook 3: fire when buffer fills, send status on alert-line.

Ctrl+H. "comp" Enter (compress_completed). Tab. "ci" Enter. Tab. "cf" Enter. Hook 4: when compression finishes, forward the result on cmd-feed. Four hooks, eight seconds.

Ctrl+].

**Seconds 24-32: Striker (2 hooks)**

Ctrl+H. "th" Enter. Tab. "en" Enter (engage). Tab. "cf" Enter. Hook 1: when threat enters, send engage order on cmd-feed. Ctrl+H. "el" Enter (eliminate). Tab. "ki" Enter (kill_confirmed). Tab. "tn" Enter. Hook 2: when enemy eliminated, broadcast on threat-net. Two hooks, eight seconds.

Ctrl+].

**Seconds 32-40: Command (6 hooks)**

The Command unit is the most complex. ZEROCLICK uses a different technique here: template paste. He has a "Command template" — a set of 6 hooks he uses in every tournament loadout — saved as a blueprint preset. He presses Ctrl+Shift+L (load preset), selects "tourney-cmd-v3" with arrow keys and Enter, and all 6 hooks populate simultaneously. He scans the hooks with Down Arrow, adjusting one channel name on hook 4 (it referenced a channel name from last tournament's meta that he has since renamed). Tab to channel field, Ctrl+A, "ri" Enter. Done.

Total configuration time: 40 seconds. All 16 hooks across 5 blueprints. Zero mouse clicks.

**UI Annotations:**
- Ctrl+] and Ctrl+[ switch between blueprints in the tab bar without leaving keyboard mode
- Channel name minimum unique prefixes become muscle memory: "tn" for threat-net, "cf" for cmd-feed, "ri" for raw-intel
- Ctrl+D followed by single-field edit is the fastest way to create variations on a hook
- Ctrl+Shift+L loads blueprint presets — the ultimate speed tool, but requires prior setup
- Parameterized triggers ("signal_received_on:threat-net") are typed as colon-separated compound tokens in the trigger dropdown filter
- The "keyboard speedrun" fantasy is achievable: 2.5 seconds per hook at peak speed, dominated by typing channel name prefixes

---

## Strengths and Weaknesses

### Strengths

**Speed ceiling is genuinely high.** At peak performance, a hook takes 2-3 seconds via keyboard versus 8-12 seconds via mouse. Over a full mission configuration of 16 hooks, the keyboard player saves 80-150 seconds — meaningful in timed competitive formats and meaningful for the subjective experience of flow. The player stops thinking about the interface and starts thinking about the architecture.

**Symmetry with rules keyboard shortcuts builds on existing muscle memory.** Tab, Enter, Ctrl+Up/Down, Ctrl+D, Ctrl+Backspace, Ctrl+Z, `/` command palette, and `?` cheat sheet all behave identically in both the rules and hooks sections. The player learns one input vocabulary and applies it to two systems. The only hooks-specific shortcut is Ctrl+H (create hook), which parallels Ctrl+N (create rule) with a different letter to avoid ambiguity about which section receives the new item.

**Accessibility win for keyboard-only users.** Motor-impaired players who use switch access, mouth sticks, or limited dexterity input devices benefit from a UI that is fully navigable without precise cursor targeting. The radial menu (which requires directional mouse precision) is bypassed entirely by the type-to-filter dropdown variant. Every action has a keyboard path.

**Progressive disclosure works.** New players never see shortcuts. The `?` overlay is the only entry point, and it appears only when pressed. The mouse-first UI is not degraded by the existence of keyboard shortcuts — no visible shortcut labels clutter the hook strips. The shortcuts are a hidden expert layer, exactly like Vim's modal commands.

### Weaknesses

**Browser shortcut conflicts.** Ctrl+H is "Find and Replace" in Chrome, Firefox, and Edge. Ctrl+D is "Bookmark this page" in all major browsers. Ctrl+1/2/3/4 switch browser tabs. These are deep muscle-memory bindings for web-native players. The game must intercept these shortcuts when the game canvas has focus, which requires `preventDefault()` on keydown events. Players who Alt+Tab between the game and a browser reference page will experience disorienting shortcut context-switching. Mitigation: the game could use Alt+H, Alt+N instead, but Alt combinations feel slower and less ergonomic. Or: offer a "Vim mode" toggle in settings that activates the full shortcut set, versus a "Standard mode" that uses only non-conflicting shortcuts (arrow keys, Tab, Enter, Escape).

**Discoverability gap.** The `?` cheat sheet is invisible to players who do not press `?`. Unlike Factorio (which shows shortcut labels on toolbar icons) or VS Code (which shows shortcuts in menu items), the hooks UI has no persistent visual hint that shortcuts exist. A player could complete the entire campaign without discovering Ctrl+H. Mitigation: after the player's 10th hook configuration by mouse, show a one-time tooltip: "Tip: Press ? to see keyboard shortcuts." The tooltip appears once and never again.

**The channel name field is a mode break.** Trigger and payload fields use Enter-to-open-dropdown, type-to-filter, Enter-to-confirm — a modal interaction. The channel name field is a free-text input — a modeless interaction. The transition from modal (trigger/payload) to modeless (channel name) within a single Tab chain can cause errors: the player types "threat-net" expecting a filter but is actually typing into the channel name input, which creates a new channel called "threat-net" instead of selecting the existing one. The autocomplete's exact-match detection partially mitigates this, but the mode transition remains a paper cut.

**No visual typing feedback on speed.** When ZEROCLICK configures 16 hooks in 40 seconds, the UI responds correctly but does not celebrate the speed. There is no WPM counter, no combo indicator, no "streak" feedback. The sensory experience of speed is purely internal — the player feels fast, but the game does not acknowledge the performance. This is a missed opportunity for the "speedrun fantasy." A subtle flourish — the hook strip's lightning bolt icon glowing brighter with each consecutive keyboard-created hook, resetting after 3 seconds of inactivity — would reward the rhythm without cluttering the UI.

---

## Interaction Effects

### With Hook Copy-Paste (3.11c)

Ctrl+C/V/X integrate directly with the 3.11c compatibility resolution patterns. The keyboard flow for an incompatible paste is: Ctrl+V -> strip appears with amber trigger zone -> focus auto-lands on trigger field -> type-to-filter the replacement trigger -> Enter -> done. The Rewire Bench pattern (3.11c Pattern 2) is the only paste resolution that works cleanly with keyboard flow. The "Red Wire" hard reject (Pattern 1) would leave the player with no hook and no focus target — a dead end requiring Ctrl+H to start over. The "Adaptive Substitute" (Pattern 3) would auto-fill the trigger, which conflicts with the keyboard player's expectation of explicit control. Recommendation: keyboard paste always uses Rewire Bench resolution.

### With Rule Editing Keyboard Flow (3.07d)

The shared shortcut vocabulary means switching between rules (Ctrl+2) and hooks (Ctrl+3) is a single keystroke. A player configuring a Scout's full loadout can: Ctrl+2 -> build rules with Ctrl+N/Tab/Enter -> Ctrl+3 -> build hooks with Ctrl+H/Tab/Enter -> Ctrl+4 -> configure context. The muscle memory transfers across sections. The only collision risk is Ctrl+D (duplicate), which works identically in both sections, and Ctrl+N vs Ctrl+H, which are intentionally differentiated.

### With Blueprint Switching

Ctrl+] (next blueprint) and Ctrl+[ (previous blueprint) must preserve the player's section focus. If the player is in the hooks section (Ctrl+3) and switches blueprints (Ctrl+]), the new blueprint should open with hooks section focused and the first hook slot highlighted. This prevents the player from needing to re-navigate to hooks after every blueprint switch. The focus state is "sticky" — the section follows the player across blueprints.

### With the Production Queue

The production queue is a separate panel from the blueprint editor. When the player is in keyboard mode within the blueprint editor, production queue shortcuts (if any) should be gated behind a panel-switch shortcut (e.g., Ctrl+P for production queue focus). There should be no shortcut collision between blueprint-editor keyboard mode and production-queue keyboard mode, because only one panel can hold the focus rail at a time.

---

## Comparable Systems

**Vim/Emacs:** The direct ancestor of this design. Modal editing (normal mode vs insert mode) maps to strip-level focus vs field-level editing. The `/` command palette is Vim's command mode. The type-to-filter dropdown is Emacs's `M-x` with completion. The key insight borrowed from Vim: the power is not in any individual shortcut but in the *composability* of shortcuts. Ctrl+D (duplicate) followed by Down + Enter + type-filter + Enter (change one field) is a "composed edit" — two atomic operations that combine into a workflow faster than any single dedicated shortcut could be.

**Excel keyboard navigation:** Tab to advance between cells, Enter to confirm and move down, Ctrl+D to fill down (duplicate), Ctrl+Arrow to jump to the edge of a data range. The hook field traversal (Tab through trigger/payload/channel) is structurally identical to Tab through spreadsheet columns. Expert Excel users report the same flow state that the hooks keyboard workflow targets — the grid disappears and the user thinks in data, not in cells.

**Factorio keyboard shortcuts:** Factorio's copy-paste (Ctrl+C/V on buildings) and blueprint system (save/load configurations) directly inspired the hook copy-paste and blueprint preset features. Factorio proves that keyboard shortcuts in a planning-heavy game do not reduce accessibility — they add a skill ceiling that dedicated players find intrinsically rewarding. Factorio's shortcut discoverability is stronger than this design's, however: toolbar icons show shortcut labels persistently. Worth considering.

**IDE refactoring hotkeys (VS Code, IntelliJ):** Ctrl+Shift+R to rename, Ctrl+D to duplicate line, Alt+Up/Down to move line. The IDE comparison is apt because hook configuration IS a form of programming — the player is writing reactive event handlers. The "rename channel" operation (changing a channel name across all hooks that reference it) would be a natural extension: Ctrl+Shift+R on a channel name field to rename the channel globally, updating all hooks and context configs that reference it. This is not in the current shortcut map but is a strong candidate for a future addition.

**Fighting game input notation:** Street Fighter's quarter-circle-forward + punch is a "composed input" — two directional inputs plus a button, executed in sequence within a timing window. The hook keyboard workflow has a similar rhythmic quality at speed: Ctrl+H, "en" Enter, Tab, "po" Enter, Tab, "tn" Enter is a seven-input sequence executed in 2-3 seconds. Fighting game players describe achieving "flow" when inputs become subconscious — the same target state for the hooks keyboard workflow. The key difference: fighting game inputs must be frame-precise, while hook inputs have no timing constraint. The rhythm is self-imposed, not system-imposed, which makes the flow state more accessible.

---

## Sensory Description: What Keyboard Hook Wiring Looks Like at Speed

Picture the plan screen. Five blueprint tabs across the top, the workbench dominating the lower two-thirds. The hooks section is open on the current blueprint — a Command unit with 6 empty slots, each a dashed-outline strip breathing slowly.

The player's hands settle on the keyboard. Ctrl+3. The hooks section header glows with a cyan underline. The focus rail appears — a sharp 2px cyan line running the full left edge of the hooks panel.

Ctrl+H. The first empty slot snaps into a solid strip. The trigger dropdown cascades open — six options in a vertical list, each with a small icon. The player does not look at the list. Their fingers type "sig" and the list collapses to one entry: "signal_received." Enter. The trigger token snaps into place with a micro-scale pulse — 60ms, barely perceptible, but the rhythm is felt. Tab. The payload dropdown opens. "ci" — "compressed_intel." Enter. Snap. Tab. The cursor blinks in the channel name field. "cf" — the autocomplete matches "cmd-feed" instantly. The field background floods with a deep blue (the channel's assigned color). A soft electronic chirp — the connection tone. Enter.

One hook. Three seconds. The player does not pause.

Ctrl+D. The strip clones — a ghost fading from 60% to full opacity in 150ms, materializing directly below. Down Arrow. The focus slides to the clone. The trigger field is highlighted. Enter. "buf." "buffer_threshold" highlights. Enter. The rest of the hook is identical — same payload, same channel. The player does not need to Tab through the unchanged fields. They press Down Arrow to move to the next empty slot.

Ctrl+H. "comp" Enter. Tab. "ci" Enter. Tab. "al" Enter — "alert-line," a new channel. The field background fills with the new channel's auto-assigned color (warm amber). A higher-pitched creation ping — different from the connection chirp, signaling that something new was just named into existence. The channel map panel in the corner silently updates, a new node appearing in the network graph.

The player has configured three hooks in nine seconds. Their eyes are fixed on the hooks panel. The focus rail pulses steadily. Each Enter keystroke produces a small visual snap — the token scaling up 5% and settling. Each Tab produces the cyan underline sliding rightward. Each Ctrl+H produces the lightning bolt pulse. The rhythm is: spark, type-snap, slide, type-snap, slide, type-chirp. Spark, type-snap, slide, type-snap, slide, type-ping. The sounds alternate between connection chirps (existing channels) and creation pings (new channels), forming an audio texture that tells the player about their architecture without looking at the channel map.

After six hooks, the section header reads "6/6" and the counter glows amber — all slots filled, no room for more. The player presses Ctrl+] to advance to the next blueprint. The workbench morphs — new unit art, new skill toggles, new empty hooks. But the focus rail persists. The hooks section is still active. The player's hands have not moved from the keyboard.

Ctrl+V. A hook from the Command unit pastes into this Striker blueprint. The trigger is compatible. The strip materializes fully formed with a cyan border flash. Ctrl+H for the second slot. The configuration continues. Blueprint after blueprint, the hooks accumulate. The channel map grows — lines connecting nodes, colors coding the information topology. The player is not configuring UI elements. They are wiring a nervous system, and their fingers are the soldering iron.
