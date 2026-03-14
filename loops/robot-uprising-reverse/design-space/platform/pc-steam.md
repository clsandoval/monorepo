# 6.05 — PC/Steam: The Native Habitat

## Overview

Robot Uprising is a web game (React + Pixi.js + Vite), but PC via Steam is its primary distribution platform. The keyboard-and-mouse experience IS the reference experience — mobile and console are adaptations of this. Every UI decision, every hotkey, every tooltip, every pixel of information density is designed for a player sitting at a desk with a 1080p+ monitor, a mouse with scroll wheel, and a full keyboard.

This document explores every dimension of the PC/Steam experience: keyboard/mouse interaction design across all three screens, Steam platform features (Workshop, achievements, trading cards, cloud saves, Rich Presence), windowed/fullscreen behavior, multi-monitor considerations, Steam Deck compatibility, and the specific advantages PC offers for an information-dense workbench game.

---

## The PC Advantage: Information Density

Robot Uprising is an information architecture game. The player's job is managing what agents know, when they know it, and how knowledge flows. This is inherently a **dense-information activity** — the kind of thing that benefits enormously from:

- **Large screens:** A 1920×1080 monitor gives the Plan screen's split view (board left, workbench right) approximately 900px per panel. A 2560×1440 monitor gives ~1250px. The workbench panel can show a full blueprint editor with skills toggles, ordered rule list, hook configs with channel autocomplete, AND the context config sliders — all visible simultaneously without scrolling.
- **Hover states:** Mouse hover is the single most powerful progressive-disclosure mechanism in UI design. Hover a channel name → wiring lights up on the board. Hover a rule → affected area highlights on the grid. Hover a unit → perception radius, buffer fill, active hooks all appear. None of this exists on touch. PC gets it for free.
- **Precise pointing:** A mouse cursor is 1px. A fingertip is 45×45px. On an 8×8 grid at 1080p, each tile is ~90px wide. The mouse can target individual buffer slots, individual rule conditions, individual channel connections. The workbench is a precision instrument — the mouse is the right tool.
- **Keyboard shortcuts:** Rapid switching between blueprint editing, production queue reordering, channel inspection, and board placement. No gesture ambiguity. No accidental touches.
- **Text entry:** Channel names are typed. Rule conditions may involve text. The physical keyboard makes this instant. No soft keyboard stealing screen real estate.

The PC is where Robot Uprising is most itself. Every other platform is a compromise.

---

## Keyboard & Mouse Design: The Three Screens

### Plan Screen — The Workbench

The Plan screen is where the player spends 60-70% of their time. It's a split view: 8×8 board on the left, workbench panel on the right, EXECUTE button top-right corner. The keyboard/mouse design must support rapid iteration — configuring agents, adjusting wiring, rearranging the production queue, and previewing spatial effects on the board.

**Mouse Interactions:**

| Surface | Left Click | Right Click | Scroll | Hover | Drag |
|---------|-----------|-------------|--------|-------|------|
| Board tile (empty) | Select tile → placement mode | Context menu (place unit, set waypoint) | Zoom board | Show coordinates, terrain info | — |
| Board tile (ghost unit) | Select unit → opens in workbench | Remove from queue | — | Show blueprint summary tooltip | Reposition unit on board |
| Workbench: skill toggle | Toggle skill on/off | — | — | Skill description + interaction hints | — |
| Workbench: rule row | Select for editing | Delete rule (with confirm) | — | Preview: highlight affected area on board | Drag to reorder priority |
| Workbench: hook slot | Open hook editor | Clear hook | — | Show channel wiring on board | Drag channel wire to board (visual wiring) |
| Workbench: context slider | Adjust value | Reset to default | Fine-tune ±1 | Show current value + explanation | Slide to adjust |
| Production queue | Select blueprint | Remove from queue | Scroll queue | Cost preview, build time | Drag to reorder build priority |
| Channel map panel | — | — | Scroll channels | Highlight channel wiring on board | — |

**Keyboard Shortcuts (Plan Screen):**

| Key | Action | Rationale |
|-----|--------|-----------|
| `1-5` | Select unit type (Scout/Striker/Relay/Specialist/Command) | Factorio-style quick selection — number keys map to the five unit types in the unit palette |
| `Tab` | Cycle focus: board → workbench → production queue → channel map | Into the Breach-style panel cycling; focus ring shows which panel is active |
| `Shift+Tab` | Cycle focus reverse | Standard reverse-tab convention |
| `Enter` | **EXECUTE** — launch the battle | The most important action gets the most satisfying key. Deliberate weight. Into the Breach uses Enter to end turn. |
| `Escape` | Deselect / close subpanel / back | Universal "undo selection" |
| `Space` | Toggle ghost preview on/off for selected blueprint | Quick A/B comparison of placement |
| `Ctrl+Z` | Undo last workbench change | Factorio-style undo — critical for a design tool |
| `Ctrl+Shift+Z` | Redo | Standard redo |
| `Ctrl+C` | Copy selected blueprint | Blueprint clipboard for duplication |
| `Ctrl+V` | Paste blueprint | Paste into new slot |
| `Ctrl+S` | Save blueprint to library | Explicit save — the workbench should also autosave, but explicit save feels good |
| `R` | Rotate selected unit on board | Factorio convention |
| `Q` | Pipette — select the blueprint type of the hovered unit on board | Factorio pipette — hover a scout ghost on the board, press Q, and the scout blueprint opens in the workbench |
| `Delete` | Remove selected ghost unit from board / remove selected rule | Destructive action with appropriate confirmation for rules |
| `A` | Add new rule to selected blueprint | Quick rule creation |
| `H` | Add new hook to selected blueprint | Quick hook creation |
| `F1-F4` | Workbench subpanel focus: Skills / Rules / Hooks / Context | Direct jump to workbench sections |
| `Ctrl+1` through `Ctrl+9` | Select nth blueprint in production queue | Direct queue slot access |
| `` ` `` (backtick) | Toggle channel map panel visibility | Quick toggle for the read-only wiring overview |

**The Pipette Principle:** Factorio's Q key is one of the most beloved shortcuts in PC gaming — hover over anything, press Q, and you're holding a copy of it. Robot Uprising's Plan screen must have an equivalent: hover a ghost unit on the board → Q → that unit's blueprint opens in the workbench editor. Hover a channel wiring line → Q → the hook that created it highlights in the workbench. The pipette bridges the spatial (board) and structural (workbench) views.

**Scroll Behavior:** Mouse wheel zooms the board (2x to 0.5x range). Hold `Ctrl` + scroll to zoom the workbench text size (accessibility). Hold `Shift` + scroll to move through the production queue horizontally if it overflows.

### Sealed Watch — The Theater

The Sealed Watch screen is deliberately stripped down. No tools, no pause, no skip. The keyboard/mouse footprint is minimal by design — this is a viewing experience, not an interaction surface.

**Mouse Interactions:**

| Surface | Left Click | Hover |
|---------|-----------|-------|
| Unit on board | — (no interaction during sealed watch) | Brief unit name tooltip (no stats, no details — sealed) |
| Speed controls | Select 0.5x / 1x / 2x | Highlight |
| Tick clock pips | — | Show tick number |

**Keyboard Shortcuts (Sealed Watch):**

| Key | Action | Rationale |
|-----|--------|-----------|
| `-` / `=` | Speed down / Speed up (0.5x ↔ 1x ↔ 2x) | Keyboard speed control without reaching for buttons. Minus = slower, equals/plus = faster. |
| `Escape` | — (no escape during sealed watch!) | The sealed watch is sacred. No exit until completion. Escape does nothing. A subtle flash of the seal icon appears if pressed — "you chose to watch, now watch." |
| `F11` | Toggle fullscreen | The one concession — fullscreen toggle should always work |

That's it. The sealed watch has almost no keyboard input because **that's the point**. The player committed by pressing EXECUTE. Now they watch. The lack of controls IS the design.

**The "Accidental Space" Problem:** Into the Breach had a notorious issue where pressing spacebar accidentally ended your turn. Robot Uprising's sealed watch has no equivalent risk because there ARE no actions to accidentally trigger. But the transition OUT of sealed watch (into Inspector) should require a deliberate input — not just "it ended." A "SEAL BROKEN" animation plays, then the player must click "Enter Inspector" or press `Enter`. No auto-transition.

### Inspector — The Debugger

The Inspector is the analytical screen. Timeline scrubber, click-to-inspect units, queue depth charts, signal genealogy, channel metrics. This is the most keyboard-intensive screen because it's a diagnostic tool — the player is navigating a data structure.

**Mouse Interactions:**

| Surface | Left Click | Right Click | Scroll | Hover | Drag |
|---------|-----------|-------------|--------|-------|------|
| Board (unit) | Select unit → show buffer state at current tick | Deselect | — | Quick tooltip: unit name, buffer fill %, active hooks | — |
| Timeline scrubber | Jump to tick | — | — | Show tick number + event count | Drag scrubber position |
| Buffer state panel | Select individual slot | — | Scroll through buffer contents | Show slot metadata (source, age, fidelity) | — |
| Queue depth chart | Click to jump to that tick | — | Zoom time axis | Show exact queue depth + threshold at that tick | Select time range for focused analysis |
| Signal genealogy graph | Select signal node | — | Zoom/pan graph | Show signal details (source unit, channel, tick sent, tick received, fidelity) | Pan graph viewport |
| Channel metrics | Select channel | — | Scroll channel list | Show throughput, latency, drop rate at current tick | — |

**Keyboard Shortcuts (Inspector):**

| Key | Action | Rationale |
|-----|--------|-----------|
| `←` / `→` | Step backward / forward one tick | Arrow keys for timeline navigation — Into the Breach uses arrows for unit movement; Inspector repurposes them for time navigation |
| `Shift+←` / `Shift+→` | Jump 5 ticks | Fast scrubbing |
| `Home` / `End` | Jump to first / last tick | Full range navigation |
| `[` / `]` | Previous / next event for selected unit | Event-based stepping — skip empty ticks, land on actions |
| `Tab` | Cycle selected unit (next unit in creation order) | Quick unit switching without mouse |
| `Shift+Tab` | Previous unit | Reverse cycle |
| `1-5` | Select unit by type (first scout, first striker, etc.) | Quick type-based selection |
| `B` | Toggle buffer state panel | Quick access to the core diagnostic |
| `G` | Toggle signal genealogy graph | The genealogy graph is expert-level; toggle keeps it out of beginner's way |
| `C` | Toggle channel metrics panel | Channel-level analysis |
| `D` | Toggle queue depth chart | Depth chart for selected unit |
| `P` | Play/pause timeline auto-advance | Auto-replay at inspector speed with analytical overlays |
| `Escape` | Deselect unit / close panel / return to Plan screen (in sequence) | Progressive back-out |
| `Enter` | Return to Plan screen | Deliberate transition back to planning |
| `Ctrl+E` | Export replay (save file for sharing) | Community sharing — config necropsy artifact |

**The Arrow Key Philosophy:** In the Plan screen, arrow keys could pan the board. In the Inspector, they navigate time. Same keys, different meaning per screen. This is acceptable because the screens are distinct modes — the player knows which screen they're on. Factorio similarly repurposes keys across different tool modes. The visual context (timeline scrubber visible = time navigation mode) makes the mapping obvious.

---

## The Undo/Redo Stack as Workbench Feature

The Plan screen's workbench needs a proper undo/redo system — not just `Ctrl+Z` for the last change, but a visible history panel showing every modification to the current blueprint configuration. This serves two purposes:

1. **Safety net:** Players experiment freely knowing they can revert. Factorio's undo system is cited by players as one of the most important quality-of-life features.
2. **Learning tool:** Seeing your own edit history teaches you what changes had what effects. After a failed battle, returning to the Plan screen and scrolling through the undo history shows "these are the 12 changes I made since the last successful run."

**Sensory design:** The undo history appears as a narrow vertical strip on the far-right edge of the workbench panel, showing tiny icons representing each change type (skill toggle = circle, rule edit = line, hook change = arrow, context adjust = slider icon). Hovering an entry highlights the affected element in the workbench. Clicking an entry reverts to that state. The strip is semi-transparent until hovered, then slides out to show full descriptions. A gentle "clock rewind" sound plays on undo — a soft reverse-tick, like a mechanical counter decrementing.

---

## Steam Platform Features

### Steam Workshop Integration

Robot Uprising has three natural Workshop content types:

**1. Blueprint Libraries**
Players share individual agent blueprints or complete army configurations. Each Workshop item includes:
- The blueprint data (skills, rules, hooks, context config)
- A thumbnail (auto-generated from the board preview with ghost units and channel wiring visible)
- Tags: unit type, playstyle (aggressive/defensive/economy/intel), campaign mission designed for, Gauntlet tier
- Version history (Workshop tracks updates)

**How subscription works:** Click Subscribe on a blueprint → it appears in the player's "Community Blueprints" library tab in the Plan screen, visually distinct from self-created blueprints (a small community icon badge in the corner). The player can deploy it as-is, or "Fork" it to create a personal editable copy.

**2. Custom Missions**
If Robot Uprising ships a mission editor (or even a simple JSON-based mission format), players can create and share custom scenarios:
- Enemy placement and AI behavior
- Terrain layouts
- Win conditions
- Narrative text (boot log entries)
- Difficulty ratings (author-set + community-voted)

The Workshop becomes an infinite content pipeline. Shenzhen I/O's community-created puzzles extended its lifespan enormously. Robot Uprising's mission format is more complex (spatial + behavioral), but the payoff is proportionally larger.

**3. Config Necropsy Artifacts**
Full replay + annotation exports. A player's version-controlled config evolution (v1.0 through v5.2) with annotated replays showing why each version changed. These are the "blog posts" of the Robot Uprising community — the teaching artifacts that transfer knowledge. Workshop provides hosting, versioning, comments, and ratings.

**Interaction effect:** Workshop integration with the Gauntlet creates a meta-game where published configs can be counter-built against. A top-rated Workshop blueprint becomes a known quantity — "everyone's running the RELAY-CHAIN-V3 from the Workshop, here's my counter." This is healthy meta-evolution, similar to how Gladiabots tournaments evolve.

### Steam Achievements

Achievement design must serve two functions: **milestone markers** (you reached a new phase of understanding) and **playstyle validators** (you found a way to do something unusual). Neither function should require grinding.

**Campaign Milestone Achievements:**

| Achievement | Trigger | Icon Concept |
|-------------|---------|--------------|
| "Boot Complete" | Complete Mission 1 | Terminal cursor blinking green |
| "Signal Established" | Complete Mission 4 (end of hand-configured arc) | Four connected dots forming a diamond |
| "Factory Online" | Complete Mission 5 (factory introduction) | Conveyor belt with a unit silhouette |
| "Chain of Command" | Complete Mission 7 (command agent mastery) | Hierarchy tree icon, gold |
| "Factory vs. Factory" | Complete Mission 10 (campaign finale) | Two interlocking gears, one blue one red |
| "Full Reboot" | Complete all 10 missions | Boot log with all lines showing [OK] |

**Playstyle / Discovery Achievements:**

| Achievement | Trigger | Design Intent |
|-------------|---------|---------------|
| "Dead Channel" | Win a mission using zero hooks (no inter-agent communication) | Validates the "lone wolf" playstyle — proves it's possible but hard |
| "Telephone" | Create a signal chain of 4+ hops (Scout→Relay→Relay→Relay→Striker) | Celebrates the deep-architecture aesthetic |
| "Silent Running" | Win with zero EM emissions (no hook transmissions) | The stealth challenge — can you win with only local observation? |
| "Buffer Overflow" | Fill a Command agent's 14-slot buffer completely | Discovery of the overload state |
| "The Architect" | Have a Command agent successfully reassign skills on 3+ subordinates in a single battle | Meta-level mastery — building the factory that builds the factory |
| "Clockwork" | Win a Gauntlet match where every unit acted every tick (zero idle ticks) | Perfect efficiency — the Factorio "no-bottleneck" fantasy |
| "Salvage Expert" | Fork a Workshop blueprint and win a Gauntlet match with it | Community engagement reward |
| "The Diagnostician" | Correctly identify the decisive tick in 5 Inspector debriefs (within ±3 ticks of the gold diamond) | Analytical skill mastery |
| "Speed Run" | Win Mission 5 in under 30 ticks | Optimization challenge |
| "Zero Casualties" | Complete any mission from 5-10 with no units destroyed | Defensive mastery — information so good that no unit is ever caught |

**Achievement philosophy:** No achievement should require playing the game in a way that isn't fun. "Win 100 Gauntlet matches" is a grind — skip it. "Win a Gauntlet match with only Scouts" is a challenge that teaches you something about the game's depth.

**Hidden achievements:** The campaign milestone achievements should be visible (progress markers). The playstyle achievements should be hidden until earned (discovery moments). Seeing "Silent Running" in the achievement list before you know EM emissions exist would be a spoiler.

### Steam Trading Cards

Trading cards work best when they showcase the game's aesthetic identity. Robot Uprising's SE Asian cyberpunk art direction provides rich card material:

**Card set (6 cards, one per badge level):**
1. **Scout** — Bamboo-and-titanium recon mech in Ifugao rice terrace, wide sensor dish catching mountain mist
2. **Relay** — Bioluminescent tower on Siquijor volcanic rock, mangrove roots wrapping signal dishes, night sky
3. **Striker** — Angular combat mech striding through neon-lit Manila alleyway, rain on hull, red warning glow
4. **Command** — Massive stationary data core built into colonial architecture, fiber optic cables cascading like vines
5. **The Board** — Full 8×8 grid with a mid-battle state — channel wiring visible as colored light lines connecting units, isometric pixel art
6. **The Workbench** — The Plan screen in full glory — blueprint editor open, ghost units on board, channel map glowing, production queue loaded

**Badge rewards:** Profile background (the 8×8 grid with subtle animated channel wiring), emoticons (unit icons: 👁📡⚔🔬🤖), chat sticker (the EXECUTE button, pulsing).

**Foil cards:** Holographic/ghost variants of each unit — the translucent preview versions from Plan mode, shimmering with perception radius lines.

### Steam Cloud Saves

Cloud save is mandatory for a game with campaign progression. Implementation concerns:

- **Save data size:** Blueprint libraries can grow large if players are prolific experimenters. Budget 5-10 MB per save slot.
- **Conflict resolution:** If a player edits blueprints on two machines before syncing, which version wins? Timestamp-based (most recent wins) with a "conflict detected" notification showing both versions. The player chooses, or keeps both.
- **What gets saved:** Campaign progress, all blueprints (personal + forked community), undo history (last 100 operations), Inspector bookmarks, achievement state, settings/keybinds, Gauntlet rank and match history.
- **What does NOT get saved to cloud:** Downloaded replay files (too large), cached Workshop thumbnails, local performance settings (resolution, quality — these should be per-machine).

### Steam Rich Presence

Rich Presence shows what you're doing in the Steam friends list. For Robot Uprising:

| State | Rich Presence Text |
|-------|-------------------|
| Plan screen | "Designing blueprints — Mission 5: First Factory" |
| Sealed Watch | "Watching execution — Tick 23/80" |
| Inspector | "Analyzing debrief — Mission 5" |
| Gauntlet queue | "Queuing for Gauntlet — Architect Tier" |
| Gauntlet sealed | "In Gauntlet match — Watching" |
| Workshop browsing | "Browsing Workshop blueprints" |
| Idle in menu | "In menus" |

**Why this matters:** Rich Presence turns every Steam user into a billboard. "Watching execution — Tick 23/80" is intriguing. A friend sees it, asks "what's that?", and the evangelism loop begins.

### Steam Overlay Compatibility

The game runs in a browser engine (Pixi.js via Electron/Tauri wrapper for Steam). Steam Overlay must work correctly:
- `Shift+Tab` for overlay must not conflict with in-game `Shift+Tab` (reverse cycle focus). Solution: in-game `Shift+Tab` only activates when a panel has focus. If no panel is focused, `Shift+Tab` opens Steam Overlay. Alternatively, use a different in-game binding if conflicts arise.
- Screenshot hotkey (`F12`) must capture the Pixi.js canvas correctly. WebGL canvas screenshots require explicit Steam API integration (or the wrapper must handle framebuffer capture).

---

## Window Modes and Multi-Monitor

### Windowed / Borderless / Fullscreen

| Mode | Behavior | Ideal For |
|------|----------|-----------|
| **Borderless Fullscreen** (default) | Game fills primary monitor, no decorations, instant alt-tab, other monitors usable | Most players — seamless desktop integration |
| **Exclusive Fullscreen** | Lower input latency, prevents overlay rendering issues, locks other monitors | Competitive Gauntlet players wanting minimal latency |
| **Windowed** | Resizable window with title bar | Players who actively use other apps alongside (wiki, Discord, notes) |

**Minimum window size:** 1024×768. Below this, the Plan screen's split view cannot render both panels meaningfully. The game should warn but not prevent smaller sizes.

**Aspect ratio handling:** The board is square (8×8). The UI panels are flexible-width. The game should handle 16:9, 16:10, 21:9, and 32:9 ultrawide gracefully:
- **16:9 (1920×1080):** Reference layout. Board ~800px, workbench ~900px, margins.
- **21:9 (2560×1080):** Extra horizontal space goes to the workbench panel — wider rule editor, more visible hook slots. Board stays the same size. The extra width is pure luxury for the editor.
- **32:9 (5120×1440):** Board can center on one "half," workbench fills the other "half." Or: board left, workbench center, channel map/production queue right. Three-column layout.
- **16:10 (1920×1200):** Extra vertical space goes to the production queue strip at the bottom.

### Multi-Monitor Considerations

A significant subset of PC strategy gamers run dual monitors. Robot Uprising could offer a "detached Inspector" mode where the Inspector screen renders on a second monitor while the Plan screen stays on the primary. This is a luxury feature, not a launch priority, but the architecture (React + separate Pixi canvas) makes it technically feasible via a second browser window.

**The "wiki on second monitor" player:** Many PC strategy gamers keep a wiki, guide, or community forum open on a second monitor. Robot Uprising's borderless windowed mode should support instant alt-tab with zero state loss. The game must never pause, crash, or lose focus state on alt-tab.

---

## Steam Deck Compatibility

The Steam Deck runs Linux with a 1280×800 display at 7 inches. Robot Uprising's web stack (React + Pixi.js) runs on Linux via Proton (if wrapped in Electron) or natively (if wrapped in Tauri, which compiles to native). Key concerns:

### Display Scaling

At 1280×800, the Plan screen's split view gives each panel ~580px wide. This is tight but workable — more than double what a phone gets (375px). The board renders at ~500px (each tile ~62px) and the workbench gets ~700px. Text must be at least 14px.

**UI scale slider:** Default to 85% on Steam Deck (auto-detected via SteamOS environment variable). Range: 60% to 120%. The slider lives in Settings → Display.

### Input Adaptation

The Steam Deck has:
- **Two thumbsticks** — left for board cursor, right for panel scrolling
- **D-pad** — tick-by-tick stepping in Inspector (left/right), panel cycling (up/down)
- **Face buttons** — A: confirm/select, B: back/cancel, X: context action (pipette), Y: toggle overlay
- **Bumpers** — L1/R1: cycle between screens (Plan→Watch→Inspector)
- **Triggers** — L2: zoom out, R2: zoom in
- **Trackpads** — Right trackpad as mouse cursor (critical for workbench precision). Left trackpad for scrolling.
- **Back grip buttons** — L4: undo (Ctrl+Z), R4: EXECUTE (Enter)

**The trackpad is essential.** The workbench requires precision pointing that thumbsticks cannot provide. The right trackpad must be configured as a high-sensitivity mouse cursor by default. Without this, the blueprint editor is unusable on Deck.

**On-screen keyboard:** Channel naming triggers the Steam Deck's on-screen keyboard. The game must handle the keyboard overlay gracefully — the workbench panel should scroll up so the input field stays visible above the keyboard.

### Performance Budget

| Screen | Target FPS | GPU Load | Notes |
|--------|-----------|----------|-------|
| Plan screen | 60 fps | Low | Static board + DOM UI. Pixi renders ghost units and channel wiring lines. No heavy shaders. |
| Sealed Watch | 60 fps | Medium | Tick animations, cell flashes, unit movement, buffer bar updates. 1-second tick rate means most frames are idle. |
| Inspector | 30 fps | Medium-High | Signal genealogy graph can be complex with 15+ units. Throttle graph rendering to 30fps. Timeline scrubbing should be responsive even if graph lags. |

**Battery life target:** 3+ hours of gameplay. The Pixi.js renderer should use `requestAnimationFrame` with a 30fps cap when on battery, with 60fps only in Sealed Watch for smooth tick animations.

### Verification Checklist

- [ ] All text readable at 1280×800 with 85% UI scale
- [ ] No elements clipped by 16:10 aspect ratio
- [ ] Trackpad mouse cursor works for workbench editing
- [ ] On-screen keyboard doesn't occlude active input
- [ ] Controller button prompts shown (not keyboard prompts) when gamepad detected
- [ ] Suspend/resume works without state loss
- [ ] 30+ fps sustained on all screens
- [ ] Cloud save syncs correctly between Deck and desktop

---

## Keybinding Customization

Every keyboard shortcut listed above must be rebindable. The settings screen shows a two-column layout: Action | Key(s). Click an action → press the new key → confirm. Conflicts highlighted in amber with "Also bound to: [other action]" warning.

**Preset profiles:**
- **Default** — The layout described in this document
- **Left-handed** — Mirror layout: arrow keys for board navigation, numpad for unit selection
- **Minimal** — Only essential bindings: Tab, Enter, Escape, arrow keys, Ctrl+Z
- **Vim-style** — `h/j/k/l` for navigation, `:` for command mode (opens a mini command palette)

The Vim-style preset is a love letter to the programming-game audience. `:inspect scout-1` jumps to that unit in the Inspector. `:deploy relay-blueprint-3 at D5` places a unit. This is deep-cut power-user functionality, but Robot Uprising's audience (people who think like agentic AI engineers) overlaps heavily with the Vim-user demographic.

---

## Accessibility on PC

### Keyboard-Only Play

The entire game must be playable without a mouse. Tab-cycling through all interactive elements, Enter to confirm, Escape to cancel, arrow keys to navigate grids and lists. This isn't just accessibility — it's essential for screen reader compatibility.

**Focus order (Plan screen):** Unit palette → Board grid (left-to-right, top-to-bottom) → Workbench: Skills → Rules → Hooks → Context → Production queue → Channel map → EXECUTE button.

**Focus ring:** A bright cyan (#00FFFF) 2px outline around the focused element. High contrast against the dark cyberpunk palette. Visible on every interactive element.

### Screen Reader Support

Pixi.js canvas is inherently inaccessible to screen readers. The game must maintain a parallel DOM representation of the board state that ARIA labels can read:
- "Board position D5: Scout, buffer 4 of 6 filled, 2 hooks active on channels alarm and relay-north"
- "Rule 3 of 5: IF buffer full THEN evict oldest, priority 3"
- "Tick 23: Scout at D5 moved to D6, received signal on channel alarm from Relay at C3"

This is a significant engineering investment, but it makes the game playable by blind players — and Robot Uprising's core mechanic (information architecture) is more about structure than visuals. A blind player can absolutely reason about buffer configurations, rule priority ordering, and hook channel wiring.

### Colorblind Modes

The game's signal colors (green for delivery, red for combat) must have alternatives:
- **Deuteranopia/Protanopia:** Green → Blue, Red → Orange. Channel wiring uses pattern fills (dashed, dotted, solid) in addition to color.
- **Tritanopia:** Green → Cyan, Red → Magenta.
- **Full colorblind:** All color-coded elements get shape indicators. Buffer slots use fill patterns (empty, half-filled, full) rather than color gradients.

### Text Size Scaling

Global text scale: 80% to 150% in 10% increments. Affects all UI text. The layout must reflow gracefully — at 150%, the workbench panel may need vertical scrolling for the rule list, but the board remains at fixed pixel size.

---

## Player Journeys

### Journey: Elara, 26, Junior ML Engineer

**Context:** Just bought Robot Uprising on Steam after seeing a clip of someone's relay chain cascade on Twitter. Has played Factorio (200 hours) and Slay the Spire (150 hours). Comfortable with keyboard shortcuts. Dual monitor setup — game on left, Discord on right.

**Minute 0:00 — First Launch**
The game opens in borderless fullscreen on her primary monitor. A boot log fills the screen — green text on black, monospaced font, scrolling upward. Each line initializes a subsystem: `[OK] Perception module online`, `[OK] Signal bus initialized`, `[>>] Context buffer calibration... READY`. She reads every line. It feels like watching a real system boot. The last line: `AWAITING OPERATOR INPUT.` A cursor blinks. She presses Enter.

**Minute 0:30 — Mission 1: Plan Screen**
The split view appears. Board on the left — an 8×8 grid with a soft green checkerboard, corner tick marks, axis labels A-H and 1-8. A single Scout unit sits at B2. On the right, the workbench panel shows the Scout's blueprint: two skill toggles (patrol: ON, evade: ON), one rule ("IF enemy_detected THEN evade"), two empty hook slots, and a context config section showing buffer size: 6, with a row of six dim slot indicators.

She hovers over the Scout on the board. A translucent cyan circle expands around it — the perception radius, five tiles wide. She moves the mouse and the circle follows the cursor, showing exactly what the scout would see from any position. "Oh, that's like Factorio's pollution overlay," she mutters.

**Minute 1:00 — Exploring the Workbench**
She clicks the Scout's hook slot. A small editor pops: "When: [dropdown] → Send: [text field] → Channel: [text field with autocomplete]." The channel field is empty. She types "alarm" — the field autocompletes with a subtle cyan highlight. On the board, a faint dotted line appears emanating from the Scout, color-coded to the "alarm" channel. No destination yet — it's a broadcast to nobody.

She presses `Escape` to close the hook editor. Presses `Tab` — focus jumps to the production queue (empty). Presses `Tab` again — focus jumps to the channel map panel. It shows: "alarm (1 sender, 0 listeners)." She hovers the channel name. On the board, the Scout's hook line pulses brighter. She grins.

**Minute 2:00 — Keyboard Discovery**
She notices the EXECUTE button pulsing gently in the top-right corner. She presses `Enter`. The screen transitions to the Sealed Watch. The board centers, the tick clock appears at the top — a horizontal row of small square pips. Tick 1 fires. The Scout moves one tile north, following its patrol route. A faint ripple animation emanates from the Scout's position — its perception scan. Nothing detected. Tick 2. Tick 3. An enemy unit appears at H7. Tick 4 — the Scout's perception radius reaches the enemy. The enemy tile flashes briefly in the Scout's cyan perception color. Tick 5 — the Scout's evade skill fires, it moves one tile south. The battle continues for 20 ticks. She watches, hands off the keyboard, leaning forward.

**Minute 3:30 — Inspector**
"SEAL BROKEN" flashes across the screen — a horizontal line of light splitting the sealed watch, accompanied by a crisp mechanical sound like a lock disengaging. The Inspector materializes. Timeline scrubber at top. She presses `←` — tick 19 snaps back to tick 18. She clicks the Scout on the board. The buffer state panel opens on the right: six slots, four filled with observation entries ("enemy_at_H7, tick 4, fidelity: 0.8", "terrain_D4, tick 6, fidelity: 1.0", ...). She presses `[` — the timeline jumps to the previous event for this Scout. She nods. "This is a debugger."

**Minute 5:00 — Alt-Tab to Discord**
She alt-tabs to Discord. Seamless — borderless fullscreen releases focus instantly. She types "this game is literally a debugger for autonomous agents, I'm in love." Alt-tabs back. Zero state loss. The Inspector is exactly where she left it.

**Minute 6:00 — Ctrl+Z Moment**
Back in the Plan screen, she changes the Scout's rule from "evade" to "patrol" when enemy detected. Then changes it back. Then experiments with the hook. After four changes, she realizes the third change was the right one. She presses `Ctrl+Z` three times. The undo history strip on the right edge shows her path. She sees the third entry highlighted — "Rule: IF enemy_detected THEN evade (restored)." She nods.

**UI Annotations:**
- Focus ring: 2px cyan outline, visible on every interactive element during Tab cycling
- Hover perception radius: translucent cyan circle, follows cursor position on board, disappears on mouse-out
- Channel wiring line: dotted line from hook source, color-coded per channel, pulses on hover
- Undo strip: narrow vertical panel, right edge, semi-transparent until hovered, soft reverse-tick sound on undo

---

### Journey: Darius, 42, IT Infrastructure Manager

**Context:** Mission 7 — just unlocked the Command agent. Has been playing for three evenings. Runs ultrawide (3440×1440). Uses keyboard shortcuts heavily in everything (Vim user at work). Has already rebound keys to a custom layout.

**Minute 0:00 — Ultrawide Luxury**
His Plan screen is a palace. Board on the far left (~800px), workbench center-left (~1000px), and the extra ultrawide space gives him a permanently visible channel map panel on the far right (~600px) and a production queue strip across the entire bottom. He can see everything at once. No panel switching. No scrolling. The workbench shows the Command agent's blueprint — 14-slot buffer, 6 hook slots (three already wired), ordered rule list with 8 rules, all three command skills active (reassign, reroute, prioritize).

He's bound `:` to open a command palette (Vim preset). He types `:inspect relay-2` and presses Enter. The game highlights Relay-2 on the board and opens its blueprint in a read-only overlay on the workbench, side-by-side with the Command agent's config. He can see both configs simultaneously, checking whether the Command agent's "reroute" rule correctly references Relay-2's channels.

**Minute 1:30 — The Meta-Level Moment**
He adds a new rule to the Command agent: "IF relay-2.buffer > 80% THEN reroute relay-2.hook-3 TO channel: overflow." This is a rule about another agent's configuration — the meta-level. On the board, a dashed gold line appears from the Command agent to Relay-2, representing the management relationship. The channel map panel on the right updates instantly: a new entry "overflow" appears with "(conditional, from Command-1)" annotation.

He hovers the gold management line. A tooltip appears: "Command-1 → Relay-2: will reroute hook-3 to 'overflow' when buffer exceeds 80%." He smiles. This is the feeling — building the system that manages the system.

**Minute 3:00 — Keyboard-Driven Flow**
He presses `F3` (bound to Hooks subpanel). The workbench scrolls to the Command agent's hook section. He presses `H` to add a new hook. The editor opens. He types the trigger, tabs to the channel field, types "cascade-alert." Tab to the action field. The autocomplete suggests actions from the Command agent's skill set: "reassign", "reroute", "prioritize." He selects "prioritize" and presses Enter. Done. Five keystrokes, one new hook. No mouse touch.

He presses `Enter`. EXECUTE. The sealed watch begins. On the ultrawide, the board is massive — each tile nearly 120px. Buffer bars on each unit are clearly visible. He leans back and watches.

**Minute 5:00 — Inspector Deep Dive**
In the Inspector, he presses `G` to open the signal genealogy graph. On his ultrawide, the graph has room to breathe — 15 units, their signal connections rendered as a directed graph with time on the x-axis. He can see the cascade: Scout-1 detected an enemy at tick 12, sent "alarm" to Relay-2, which compressed and forwarded to "tactical" channel, which the Command agent received at tick 14, triggering a "reroute" action on Relay-2's hook-3 at tick 15, which redirected signals to "overflow" at tick 16, which Striker-1 received at tick 17, which engaged the enemy at tick 18. Six hops. The entire cascade visualized in one graph.

He presses `Ctrl+E` to export the replay. A save dialog opens. He names it "cascade-proof-v7.2.rur" and saves. Later, he'll upload it to the Workshop as a config necropsy artifact.

**UI Annotations:**
- Command palette: dark overlay with monospaced input field, autocomplete suggestions below, `:` trigger key
- Ultrawide layout: three-column (board, workbench, channel map) + bottom strip (production queue)
- Gold management line: dashed, connects Command to managed subordinate, tooltip on hover
- Signal genealogy: directed graph, time x-axis, unit y-axis, signal-colored edges, click node for detail

---

### Journey: Mika, 14, First Strategy Game

**Context:** Mission 2. Found the game through a YouTube clip of a relay chain cascade. Has played Minecraft and Roblox, nothing like this. Laptop with trackpad, 1366×768 screen. No external mouse.

**Minute 0:00 — Small Screen Adaptation**
At 1366×768, the Plan screen is tight. The board gets ~600px and the workbench ~650px. Text is smaller but readable (the game auto-detected the resolution and set UI scale to 90%). The production queue strip at the bottom shows three slots before needing horizontal scroll.

Mika doesn't know keyboard shortcuts. She clicks everything with the trackpad. She clicks the Scout on the board — it highlights with the cyan focus ring. The workbench panel scrolls to show the Scout's blueprint. She clicks the skill toggle for "evade" — it turns on. A green checkmark appears. On the board, a tiny shield icon appears on the Scout's tile.

**Minute 0:45 — Accidental Discovery**
She accidentally presses `Tab`. The focus ring jumps from the skill toggle to the first rule row. She doesn't know what happened but she can see the blue outline moved. She presses `Tab` again. It jumps to the hook slot. Again — production queue. She realizes: "Oh, Tab moves between things!" She starts Tab-cycling on purpose, faster than trackpad-clicking.

**Minute 1:30 — The Hover Gap**
She doesn't hover. She doesn't know hover exists. She clicks things. The perception radius doesn't appear (it's hover-triggered). She places a unit without seeing its perception range. This is fine for Mission 2 (the mission is solvable without spatial preview), but by Mission 4, she'll need the hover information.

**Mission 4 — the hover tutorial:** The boot log for Mission 4 includes: `[>>] Advisory: perception data available on cursor proximity. Move pointer over units to reveal sensor range.` This is the game teaching hover without calling it "hover." On first mouse-over of a unit after this message, the perception radius appears with a gentle pulse animation and a soft "sensor ping" sound — a discovery moment even without deliberate hover intent. On trackpads, the cursor moving across units naturally triggers hover states.

**Minute 3:00 — EXECUTE**
She moves the cursor to the EXECUTE button and clicks. The sealed watch starts. She watches, wide-eyed. A signal delivery flash (green cell) makes her gasp. A combat flash (red cell) makes her lean back. After 25 ticks, the battle ends. "SEAL BROKEN" appears. She clicks "Enter Inspector."

In the Inspector, she doesn't know about arrow keys for tick stepping. She clicks the timeline scrubber and drags it. It works — each position snaps to a tick. She clicks a unit. The buffer panel opens. She doesn't understand the buffer contents yet, but she can see the colored bars — she understands "full" and "empty." She goes back to Plan and tries again.

**Minute 5:00 — Keyboard Shortcut Discovery**
On her fifth attempt at Mission 2, she accidentally hits `←` in the Inspector. The timeline steps back one tick. She hits it again. And again. "Oh! I can go backwards!" She starts stepping tick by tick through the battle, watching each unit's buffer fill and drain. The arrow keys turn the Inspector from confusing to navigable.

**UI Annotations:**
- Auto UI scale: 90% at 1366×768, auto-detected
- Tab discovery: accidental keyboard shortcut discovery as natural learning moment
- Hover tutorial: diegetic boot log advisory + first-hover pulse animation + sensor ping sound
- Timeline scrubber: click-and-drag, snap-to-tick, position indicator

---

### Journey: Kofi, 35, Accessibility Tester (Low Vision)

**Context:** Mission 1. Uses Windows magnification at 200%. Screen reader (NVDA) running. No game audio (uses screen reader audio output exclusively). External mouse with scroll wheel.

**Minute 0:00 — First Launch with Screen Reader**
The boot log is text-based — NVDA reads each line as it appears. "OK. Perception module online." "OK. Signal bus initialized." "Awaiting operator input." He presses Enter.

The Plan screen loads. NVDA announces: "Plan screen. Board: 8 by 8 grid. Unit at B2: Scout, buffer 0 of 6, patrol active, evade active, 0 hooks configured." He uses Tab to navigate. Each element announces its state: "Skill: patrol, currently enabled. Toggle with Enter." "Rule 1: if enemy detected then evade, priority 1. Edit with Enter, reorder with arrow keys." "Hook slot 1: empty. Configure with Enter."

**Minute 1:00 — Board Navigation**
He presses Tab until focus reaches the board grid. NVDA announces: "Board grid, 8 columns, 8 rows." He uses arrow keys to move between cells. Each cell announces: "A1, empty terrain, jungle." "B2, Scout unit, buffer 0 of 6, 2 skills active." "C3, empty terrain, beach." The board becomes a navigable data structure, not a visual artifact.

**Minute 2:00 — Rule Editing**
He navigates to the rule editor and presses Enter on the first rule. NVDA announces: "Editing rule 1. Condition: enemy detected. Action: evade. Priority 1 of 1. Use arrow keys to reorder. Press Enter to confirm." He hears the structure. He understands the structure. He adds a second rule. NVDA: "Rule 2 added. Condition: blank. Press Enter to set condition." He navigates the condition dropdown — each option announced: "Buffer full. Enemy adjacent. Signal received on channel. Channel empty for N ticks."

**Minute 3:00 — EXECUTE and Inspector**
He presses Enter to execute. During the sealed watch, NVDA falls silent (no UI changes to announce — the sealed watch is visual). The game provides an alternative: a running audio description mode that announces each tick: "Tick 1. Scout moves to B3. Tick 2. Scout scans. Nothing detected." This is optional (Settings → Accessibility → Sealed Watch Narration).

After the sealed watch, the Inspector loads. NVDA announces the timeline position and selected unit state. Arrow keys step through ticks, and each tick announces the state change: "Tick 12. Scout detected enemy at H7. Signal 'alarm' sent on channel... no listeners. Signal lost."

He understands immediately what happened. He goes back to Plan and adds a Relay with a hook listening on "alarm." He doesn't need to see the board to configure the information architecture.

**UI Annotations:**
- Screen reader: full ARIA labels on every interactive element, board cells announce unit state + terrain
- Sealed watch narration: optional per-tick audio description (Settings → Accessibility)
- Rule editor: keyboard-navigable dropdown, each option announced
- Focus management: Tab-order matches logical flow (palette → board → workbench → queue → EXECUTE)

---

## Interaction Effects

### PC × Building Blocks
The keyboard-and-mouse workbench is where building blocks are most expressive. Whatever paradigm the game uses (priority lists, behavior trees, card composition, mixing boards), PC is where it gets the most screen real estate, the most precise input, and the most keyboard shortcuts. If a building block paradigm is awkward on PC, it's wrong — PC is the reference experience.

### PC × Inspector
The Inspector is a debugger. Debuggers are PC tools. The combination of keyboard stepping (arrow keys), mouse inspection (click unit, hover signal), and screen real estate (simultaneous display of timeline, buffer state, signal genealogy, channel metrics) makes PC the natural home for deep analysis. The Inspector should feel like Chrome DevTools — information-dense, keyboard-navigable, mouse-supplemented.

### PC × Steam Workshop × Gauntlet
Workshop blueprint sharing + Gauntlet competitive play creates a metagame. Published configs become known quantities. Counter-building becomes a skill. The Workshop evolves from "helpful community resource" to "intelligence feed" — checking what's popular on the Workshop tells you what you'll face in the Gauntlet. This is the Gladiabots tournament dynamic, amplified by Steam's infrastructure.

### PC × Multiplayer
If synchronous PvP exists, PC players have inherent advantages: faster plan-phase editing via keyboard shortcuts, more information visible per screen, and the ability to reference notes/tools on a second monitor. If the game supports cross-platform Gauntlet play, this advantage must be acknowledged. Options: separate PC/mobile Gauntlet ladders, or (better) the async Gauntlet design where plan-phase speed doesn't matter because both players edit offline.

### PC × Ultrawide
Ultrawide monitors (21:9+) transform the Plan screen from "adequate" to "luxurious." A three-column layout (board + workbench + channel map) with a bottom production queue shows everything simultaneously — no panel switching, no scrolling, no hidden information. This is a genuine competitive advantage for ultrawide players in the Gauntlet (more information visible = better decisions). Whether this matters depends on whether the Gauntlet is PvE-async (doesn't matter — both players have unlimited time) or PvP-sync (matters — faster information access).

---

## Comparable Games: PC-Specific Features

| Game | Key PC Feature | Lesson for Robot Uprising |
|------|----------------|---------------------------|
| **Factorio** | Q pipette, Ctrl+click fast transfer, shift+click auto-fill, alt-mode overlay, blueprint system | Every entity is one keypress away from "held." Robot Uprising's workbench must have this fluency. |
| **Into the Breach** | Hover for attack preview, undo move, clean grid readability, F12 for screenshots | The hover-to-preview model is the gold standard for grid-based strategy on PC. |
| **Slay the Spire** | Number keys for quick card select (community mod became official) | Listen to what mods players make — if a keyboard shortcut mod gets popular, integrate it. |
| **Opus Magnum** | GIF export of solutions, Steam Workshop for custom puzzles | The GIF export IS the marketing. Robot Uprising replay clips must export as easily. |
| **Shenzhen I/O** | Steam Workshop for community puzzles, leaderboard histograms | Workshop as infinite content pipeline. Histograms as social competition. |
| **Screeps** | External IDE integration (VSCode), API access | Robot Uprising probably shouldn't go this far, but an exportable config format that tools can process is the same instinct. |

---

## Sensory Description: The PC Experience

**The Plan Screen at 2AM:**
A dark room. A wide monitor glows. The split view fills the screen — the isometric 8×8 grid on the left, rendered in muted teals and ambers, the checkerboard tiles catching simulated light from a virtual sun. On the right, the workbench panel — dark charcoal background, bright text, cyan highlights on the focused element. The player's cursor drifts across the board, and perception radii bloom and fade like jellyfish — translucent circles that appear when the cursor approaches a ghost unit, showing exactly what it would see. A hook wiring line stretches from a Scout to a Relay, pulsing gently in a warm orange (the "alarm" channel color). The production queue at the bottom is a horizontal conveyor belt of blueprint thumbnails, left-to-right, the leftmost unit currently assembling with a subtle progress glow.

The room is quiet. The game's Plan screen has no music (the Into the Breach silence principle). Only soft UI sounds: a crisp "tick" when a skill toggles, a soft "woosh" when a rule reorders, a gentle "ping" when a channel is created. The keyboard clicks are louder than the game. The player's fingers move: Tab, Tab, Enter, type "cascade", Tab, Enter. Fast. Precise. The workbench responds instantly — no animation delay, no transition flourish. Direct manipulation. The feeling is flow — the same flow state as coding at midnight, but visual, spatial, immediate.

**The EXECUTE Moment:**
The player hovers the EXECUTE button. It glows brighter — a warm amber pulse, one cycle per second, like a heartbeat. The player presses Enter. The screen dims for half a second. A bass thrum reverberates — felt more than heard. The Plan screen dissolves. The Sealed Watch materializes: the board centers, expands, fills the monitor. The tick clock appears at the top — a row of small pips, the first one bright. The player's hands leave the keyboard. There is nothing to do now. They watch.

**The Inspector at Tick 47:**
The timeline scrubber shows tick 47 of 80. The player has clicked Relay-2. On the right panel, the buffer state is rendered as a vertical stack of 12 slots — 11 filled, 1 empty. Each slot shows a colored pip: green for recent signals, amber for aging ones, a single red slot at the bottom (a signal about to be evicted). The queue depth chart below shows a mountain — buffer fill over time, peaking at tick 38 (all 12 slots full, amber zone), dipping at tick 41 (eviction fired, three signals dropped), climbing again. The signal genealogy graph hovers in the background, its lines tracing the cascade that led to this moment. The player presses `[` — the timeline jumps to the previous event for Relay-2: tick 44, when it received a compressed signal on channel "tactical." The buffer panel updates. The player nods. They found the bottleneck.

---

## The TikTok Clip

**The 15-second PC clip:** A split-screen recording. Left half: the Plan screen, fingers flying across the keyboard, building a five-agent configuration in real time. Hook wiring lines appear on the board like a circuit coming alive. Right half: the Sealed Watch playback of THAT configuration — the cascade firing perfectly, signals bouncing from Scout to Relay to Relay to Striker, the enemy base falling in tick 22. The viewer sees: "this person DESIGNED that. That's not scripted. That's emergent." The keyboard sounds are the ASMR. The cascade is the payoff.

---

## New Aspects Discovered

1. **6.05a — The Vim/command-palette as power-user interface:** Full design of the command palette system — command vocabulary, autocomplete, argument syntax, what actions are available via text vs. requiring mouse; the "VS Code command palette" model adapted for a game workbench
2. **6.05b — Replay GIF/clip export pipeline on PC:** Technical design of capturing Pixi.js canvas frames, encoding to GIF/MP4/WebP, UI for trimming and annotating clips, automatic watermarking, one-click share to clipboard; the Opus Magnum GIF virality model
3. **6.05c — Multi-monitor detached Inspector:** Technical feasibility and UX design of rendering the Inspector on a second monitor while Plan remains on primary; window management, state sync, performance implications
4. **6.05d — Steam Input API integration for custom controller profiles:** Beyond Steam Deck — how to support arbitrary controllers, Steam Controller, fight sticks, accessibility devices via Steam Input; action sets per screen; community controller configs
5. **6.05e — Ultrawide-specific three-column layout design:** Detailed layout spec for 21:9 and 32:9 monitors — what fills the extra horizontal space, when panels become permanently visible vs. toggleable, how the layout degrades gracefully back to 16:9
