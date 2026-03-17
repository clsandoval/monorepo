# 4.01 — Plan Phase Layout: Split-Screen vs. Full-Screen Editor vs. Overlay

The plan screen is where the player spends 60-80% of their time. It's the workbench. The factory floor. The IDE. Every other screen exists to generate information that feeds back into decisions made HERE. The layout of this screen determines whether the game feels like a power tool or a frustrating compromise.

The locked spec says: board left, workbench right, EXECUTE button top-right. But within that constraint, there are fundamentally different philosophies for how much screen real estate goes to the board, how the workbench sections are organized, and how the player navigates between blueprint editing, production queue management, and tactical preview.

This analysis explores six layout paradigms, each with distinct spatial allocation, interaction grammar, and emotional character.

---

## Paradigm A: "The War Room" — Classic Split-Screen (40/60)

**Layout:** Board occupies the left 40% of the screen. Workbench fills the right 60%. A thin 2px cyan divider separates them. The board is always visible, always live, always showing the current tactical preview.

**Board panel (left 40%):**
- Isometric 8x8 grid rendered at reduced scale (~280px wide at 1080p)
- Ghost units at spawn positions with translucent perception radius circles
- Enemy spawner positions pulsing dim red
- Terrain fully visible but subtly desaturated compared to sealed watch
- Channel wiring shown as subway-map lanes along grid edges (from 3.10)
- Hovering any unit on the board highlights its blueprint in the workbench
- Hovering any blueprint in the workbench highlights its ghost units on the board

**Workbench panel (right 60%):**
- Tab bar at top: 📋 Blueprints | ⚙️ Skills | 📏 Rules | 📡 Hooks | 🧠 Context | 📦 Queue
- Active blueprint editor fills the main area
- Production queue conveyor belt anchored at bottom (horizontal strip, ~80px tall)
- Channel map panel as collapsible flyout from left edge of workbench (overlaps board slightly when open)
- EXECUTE button: top-right corner, 48×48px, red-orange gradient, pulses gently every 4 seconds

**Spatial allocation at 1920×1080:**
- Board: 768×1080px
- Workbench: 1152×1080px
- Production queue: 1152×80px (within workbench area)

### Strengths
- **Constant tactical awareness.** You never lose sight of the battlefield. Every edit you make, you can glance left and see where your units will spawn, what terrain they'll navigate, where the enemy is.
- **Hover cross-referencing.** The board-workbench bidirectional highlighting creates a live feedback loop. Edit a scout's perception radius → see it update on the board in real time.
- **Into the Breach heritage.** Players who've played ItB expect the map to be ever-present. This layout honors that expectation.
- **Streaming clarity.** Viewers can see both the strategy AND the build simultaneously. No information is hidden behind tabs or modals.

### Weaknesses
- **Board is cramped.** 280px wide for an 8x8 isometric grid means each tile is ~35px. Unit icons become tiny. Channel wiring becomes spaghetti at this scale.
- **Workbench is also cramped.** 60% of 1920px = 1152px for an editor with 6 tabs, each containing draggable elements, slot-limited loadout racks, and nested UI. This is tight for the hooks patch bay or the rules priority list at 12+ rules.
- **Neither panel is comfortable.** The split tries to serve two masters and satisfies neither fully. The board is too small for genuine tactical planning. The workbench is too narrow for complex configurations.
- **Mobile/tablet catastrophe.** At 768px viewport, this layout is physically unusable. Even at 1366×768 (common laptop resolution), both panels become painfully small.

### Interaction Effects
- **× Rules at scale (3.07a):** The "Cartographer's Rack" minimap sidebar adds a third column inside the already-narrow workbench. At 12+ rules, this layout struggles.
- **× Hook visualization (3.10):** Subway map lanes on a 280px-wide board are barely legible. Signal chains become colored blurs.
- **× Context config (3.12):** The thermometer sidebar competes with the board for left-edge attention.
- **× Sealed watch transition:** The board expanding from 40% to 100% is a dramatic visual transition — the workbench slides away and the battlefield fills the screen. This creates a satisfying "launch" feeling.

### Comparable Games
- **Gladiabots:** AI editor (left 65%) + test panel (right 35%). But the test panel is optional — the editor can go full-screen. The editor IS the game.
- **XCOM 2 tactical:** Map center + ability bar bottom + info panels edges. But XCOM's map is 3D and takes ~80% of the screen — much more generous than this paradigm.
- **Shenzhen I/O:** Board center + specification left + simulation bottom. The board IS the editor — no split needed.
- **Into the Breach loadout:** Mech list left + inventory right. No map at all during loadout.

---

## Paradigm B: "The Architect's Desk" — Workbench-Dominant (15/85)

**Layout:** The workbench is the ENTIRE screen. A small tactical minimap lives in the bottom-left corner — 200×150px, barely larger than a thumbnail. Everything else is blueprint editing space.

**Minimap (bottom-left corner, 200×150px):**
- Simplified top-down (not isometric) 8x8 grid
- Color-coded tiles: green = friendly spawn, red = enemy, grey = terrain
- Ghost unit dots (colored by blueprint) at spawn positions
- No channel wiring, no perception radii — too small
- Click to expand into a full-screen overlay (Paradigm C behavior)

**Workbench (everything else):**
- Horizontal blueprint selector strip at top: blueprint cards laid out like browser tabs, click to switch active blueprint, drag to reorder
- Active blueprint editor fills the vast middle area — plenty of room for:
  - Skills loadout rack (horizontal, 6 slots visible at once)
  - Rules priority list (12+ rules visible without scrolling)
  - Hooks patch bay or plug-and-socket strips with full channel visualization
  - Context config mixing board with generous fader spacing
- Right sidebar: active blueprint's ghost unit preview (150×200px isometric render showing the unit with perception radius, EM emission indicator, buffer fill prediction)
- Production queue conveyor belt at bottom
- Channel map panel as right-edge collapsible — no board to compete with

**Spatial allocation at 1920×1080:**
- Minimap: 200×150px (bottom-left)
- Workbench: ~1920×1080px (full screen minus minimap overlay)
- Active blueprint editor: ~1600×800px of usable editing space

### Strengths
- **Maximum editing comfort.** This is where Robot Uprising's core gameplay happens — designing attention architectures. Giving the workbench 85% of the screen says "this is what matters." Rules at scale? No problem — 800px of vertical space for a priority list. Hooks patch bay? Plenty of room for complex wiring. Context config mixing board? Every fader gets breathing room.
- **Matches the Factorio blueprint editor philosophy.** When you're designing a blueprint in Factorio, you don't want a minimap of your base taking up 40% of the screen. You want ALL the editing space.
- **Clean separation of concerns.** The plan screen is for PLANNING. The sealed watch is for WATCHING. Each screen does one thing well.
- **Mobile-viable.** At 768px, the minimap shrinks to a corner icon and the workbench still has workable space.
- **Streams well for workbench content.** Viewers can read every rule, see every hook wiring, understand the full configuration. The "what is this person building?" question is answered immediately.

### Weaknesses
- **Tactical blindness.** A 200×150px minimap communicates almost nothing about spatial relationships. "Are my scouts spawning near the enemy?" requires squinting at colored dots. Channel paths, terrain hazards, and perception coverage are invisible.
- **The "oh wait, where was the enemy?" problem.** Players will frequently need to expand the minimap to check spatial layout, then collapse it to continue editing. This toggle friction adds up — especially for spatial-reasoning tasks like relay placement.
- **Lost hover cross-reference.** The board-workbench bidirectional highlighting from Paradigm A doesn't work when the board is a postage stamp. You can't see a perception radius update on a 200px grid.
- **The EXECUTE button feels disconnected.** You're pressing "go" without a clear view of WHERE you're going. The emotional beat of "deploy into THAT battlefield" is weaker.

### Interaction Effects
- **× Root network topology (3.19a-ii):** Relay placement optimization is fundamentally spatial. This paradigm makes it nearly impossible to evaluate placement without constant minimap expansion.
- **× Animated tooltips (1.17a):** The "micro-scenario on the board preview" pattern requires a visible board. At 200×150px, these animations would be illegible.
- **× Signal latency legibility (3.10b):** Latency budget thermometers and concentric wavefront overlays need board space.
- **× Sealed watch transition:** The minimap expanding to fill the screen is a DRAMATIC bloom — the tiny corner map explodes outward, tiles snapping into place, the workbench dissolving. Very cinematic.

### Comparable Games
- **Slay the Spire deck view:** Full-screen card grid. No map visible. Pure information design.
- **Factorio blueprint editor lab (modded):** Infinite blank canvas, zero distraction.
- **BattleScribe / Army Forge (Warhammer):** Pure list/form army builder, zero map context. Army building happens entirely in abstract UI.

---

## Paradigm C: "The Lightbox" — Board as Overlay

**Layout:** The workbench is the default full-screen view (like Paradigm B). But pressing a hotkey (Space or Tab) or clicking the minimap brings up a translucent full-screen board overlay ON TOP of the workbench. The workbench dims to 30% opacity beneath. The board fills center-screen at full resolution with all spatial data — ghost units, perception radii, channel wiring, terrain. Releasing Space or clicking "back" dissolves the overlay and returns to the workbench.

**Default state (workbench):**
- Identical to Paradigm B's workbench layout
- Minimap in bottom-left corner, 200×150px
- A subtle "📍 Hold SPACE for tactical view" prompt near the minimap (fades after 3 uses)

**Overlay state (board):**
- Board renders at full 1920×1080 resolution, centered
- Workbench visible beneath at 30% opacity — you can still see your configuration context
- Ghost units with full perception radii, channel subway maps, EM emission heat map
- Hovering a ghost unit shows a tooltip with its blueprint name and key stats
- Click a ghost unit to jump back to workbench with that blueprint selected
- Production queue visible as a floating strip at bottom (above the dimmed workbench queue)
- EXECUTE button visible and clickable in both states

**Transition animation:**
- SPACE press: the minimap magnifies outward from the bottom-left corner, tiles growing and filling the screen over 400ms with a subtle lens-zoom easing. A soft glass-pane sound effect ("tschk") as the overlay settles.
- SPACE release: the board contracts back into the minimap over 300ms with a softer reverse animation. A quiet "thk" as it docks.

### Strengths
- **Best of both worlds.** Full editing space when you're building. Full tactical view when you need spatial awareness. Neither is compromised.
- **The overlay is GORGEOUS.** A translucent isometric battlefield floating over your workbench configuration, with ghost units and colored channel lanes visible over dimmed rules and hooks — this is a screenshot that sells the game. The "two layers of reality" aesthetic perfectly matches the game's theme: you're an AI looking at both the abstract logic AND the physical world simultaneously.
- **The Space-bar peek is addictive.** It becomes a rhythm — edit, peek, edit, peek, edit, peek, EXECUTE. Players develop a kinesthetic feel for when they need the tactical view. It's the same satisfying toggle as Alt-tabbing between code and a running application.
- **Click-to-jump shortcut.** See a unit on the overlay, click it, instantly editing its blueprint. This is faster than any split-screen cross-reference.
- **Streams beautifully.** The overlay toggle creates natural visual punctuation in a stream. "Let me check the board" — DRAMATIC ZOOM — "oh that relay is exposed" — back to editing. Viewers love modal state changes.

### Weaknesses
- **Requires keyboard.** The Space-bar hold requires a keyboard or a persistent on-screen toggle button. Mobile/touch players need a different interaction (long-press the minimap? Two-finger swipe up?).
- **Information is temporally separated.** You can't see the board AND edit at the same time. Every "check the board" costs a mode switch. For spatial-heavy tasks (relay placement, topology planning), this friction compounds.
- **Discovery problem.** New players may not discover the overlay for several minutes. The minimap prompt helps, but some players never read prompts. The first-time experience needs a stronger affordance.
- **The overlay blocks editing.** While previewing the board, you can't adjust rules or hooks. If you notice a problem on the overlay, you must dismiss it, navigate to the right blueprint, make the change, then re-preview. Three steps where Paradigm A needs zero.

### Interaction Effects
- **× Animated tooltips (1.17a):** Tooltips could play their micro-scenarios ON the overlay board — full resolution, full detail. This is actually BETTER than a permanently visible small board.
- **× Root network topology (3.19a-ii):** Relay placement requires sustained spatial view. The overlay must support "sticky" mode (click to lock instead of hold-to-show) for topology planning sessions.
- **× Context config (3.12):** With full workbench space, the mixing board faders have room. And the overlay can show buffer fill predictions on ghost units.
- **× Sealed watch transition:** The overlay board is already full-screen — transitioning to sealed watch just removes the dimmed workbench layer beneath. Minimal visual disruption. Almost anticlimactic compared to Paradigm A's dramatic expansion.

### Comparable Games
- **Into the Breach weapon preview:** Holding a weapon over the map previews its effect as an overlay. Same "hold to see, release to return" pattern.
- **Factorio map view (M key):** Toggles between world view and map view. The map dims the 3D world underneath.
- **VS Code Zen Mode:** Toggle between full-featured editor and distraction-free view. Same "I need to focus on THIS right now" impulse.

---

## Paradigm D: "The Drafting Table" — Unified Canvas

**Layout:** There is no split. The board IS the workbench. Like Shenzhen I/O, the blueprint editor is embedded directly in the tactical map. Click a ghost unit on the board to open its configuration inline — a floating panel attached to the unit with a tether line. Multiple panels can be open simultaneously.

**The canvas:**
- Full-screen isometric 8x8 board at maximum resolution
- Ghost units rendered at full size with perception radii and channel wiring
- Click a ghost unit → a configuration panel slides out from the unit, connected by a gold tether line
- The panel contains: blueprint name, skills loadout, rules list (collapsed to 3 visible, expand on click), hooks (compact strip view), context config (thermometer sidebar)
- Multiple panels can be open, positioned around their units. Overlapping panels stack with z-order (most recently clicked on top).
- Drag panels to reposition them on the canvas
- Production queue: floating horizontal strip at screen bottom
- Channel map: toggle overlay on the board itself
- EXECUTE button: floating top-right, always visible

**The panel (per-unit, ~320×500px floating):**
- Semi-transparent dark background (85% opacity) with cyan border matching the unit's type color
- Title bar: blueprint name + unit type icon + [×] close
- Collapsible sections: Skills (2 rows of slot icons), Rules (scrollable priority list), Hooks (compact strip), Context (mini-thermometer)
- "Edit Full" button at bottom → expands panel to ~600×800px with complete editing suite
- "Clone" button → creates a copy of this blueprint

### Strengths
- **Spatial context is never lost.** You're editing a relay's hooks WHILE looking at its position relative to scouts and strikers. The spatial relationship between the unit you're editing and the units it communicates with is always visible. This is how real network engineers think — topology-first.
- **Multi-unit editing.** Open the scout panel AND the relay panel side by side on the board. See how a hook change in the scout affects the relay's channel. This parallel editing is impossible in tab-based workbenches.
- **The Shenzhen I/O magic.** There's a reason Zachtronics embeds code editors in the circuit board — the spatial layout IS part of the program. In Robot Uprising, unit positions and channel topology ARE the architecture. Embedding editors in the board honors this truth.
- **Visually spectacular.** Multiple floating panels connected by gold tethers to units on an isometric battlefield, with colored channel wiring flowing between them. This is a game that LOOKS like agentic engineering.

### Weaknesses
- **Screen clutter.** With 4-6 units on the board, each with an open panel, the screen becomes a crowded mess. Panels overlap the board, obscuring units they're not attached to. Managing panel positions becomes a mini-game of its own.
- **Small editing surface per panel.** A 320×500px panel is TINY for complex configurations. Rules at scale (12+ rules on a Command unit) requires scrolling in a small box. Hooks patch bay is impossible at this size. Context config mixing board needs more width than 320px provides.
- **Mobile impossibility.** Floating, draggable, overlapping panels with tether lines on a touch screen? This is a UI nightmare on anything smaller than a large tablet.
- **No "full workbench" mode.** Sometimes you want to focus entirely on one blueprint's configuration without spatial context. This paradigm forces spatial awareness at all times — which is sometimes a distraction, not an aid.
- **The "Edit Full" escape hatch.** The expanded panel (600×800px) covers so much of the board that it's effectively Paradigm B — except positioned awkwardly and without the ergonomic benefits of a proper full-screen workbench.

### Interaction Effects
- **× Root network topology (3.19a-ii):** This paradigm is PERFECT for topology planning. Relay placement, coverage optimization, and latency analysis are all naturally expressed as spatial operations on the board.
- **× Rules at scale (3.07a):** Catastrophic. The Cartographer's Rack minimap-sidebar-detail system cannot fit in a 320×500px floating panel.
- **× Hook visualization (3.10):** Channel wiring on the board is fully visible, and hook editing happens next to the wiring it produces. Excellent feedback loop.
- **× Sealed watch transition:** Panels slide closed and tethers dissolve. The board remains exactly as it was — now it's a battlefield, not a workbench. Minimal transition.

### Comparable Games
- **Shenzhen I/O:** Code editors embedded in circuit board. The canonical example.
- **Factorio in-world editing:** Click an inserter, configure it in a panel attached to the inserter's position in the world. Configuration IS spatial.
- **Oxygen Not Included:** Click a building to see its stats in a panel anchored to the building. Multiple panels can be open.
- **Unity/Unreal scene editor:** Select an object in the viewport, edit its properties in an inspector panel. But the inspector is typically docked, not floating.

---

## Paradigm E: "The Control Room" — Multi-Monitor Simulation

**Layout:** The screen is divided into a GRID of panels, each showing a different facet of the plan. No single panel dominates. The aesthetic is a mission control center with multiple displays — each showing different data about the same system.

**Panel layout (2×3 grid at 1920×1080):**

```
┌──────────────────┬──────────────────┬──────────────┐
│  TACTICAL MAP    │  BLUEPRINT       │  CHANNEL     │
│  (640×540)       │  EDITOR          │  MAP         │
│  8x8 board       │  (640×540)       │  (640×540)   │
│  with ghosts     │  active config   │  topology    │
├──────────────────┼──────────────────┤  view        │
│  PRODUCTION      │  UNIT            │              │
│  QUEUE           │  ROSTER          ├──────────────┤
│  (640×540)       │  (640×540)       │  EXECUTE     │
│  conveyor +      │  all blueprints  │  (640×540)   │
│  resources       │  summary cards   │  big button  │
└──────────────────┴──────────────────┴──────────────┘
```

- **Tactical Map (top-left):** Isometric board with ghost units, terrain, enemy spawners. Click units to select their blueprint.
- **Blueprint Editor (top-center):** Active blueprint configuration — whichever blueprint is selected. Skills, rules, hooks, context config as vertically stacked sections.
- **Channel Map (top-right + part of bottom-right):** Network topology diagram showing all channels, their publishers and subscribers, signal flow. Auto-generated from hooks.
- **Production Queue (bottom-left):** Horizontal conveyor belt with resource tracker, build time estimates, cost preview.
- **Unit Roster (bottom-center):** Summary cards for all blueprints — name, type, slot usage, thumbnail. Click to select for editing.
- **Execute Panel (bottom-right):** The EXECUTE button — massive, impossible to miss. Below it: mission objective reminder, total resource cost, estimated army composition summary.

### Strengths
- **Information density for experts.** A veteran player can read all six panels simultaneously and understand the full state of their plan at a glance. No tab-switching, no overlays, no hidden information.
- **The mission control fantasy.** The multi-panel grid looks and feels like an AI's internal monitoring system. "I'm looking at six displays, each showing me a different dimension of my army." This IS the game's fantasy.
- **Channel map as first-class citizen.** In every other paradigm, the channel map is hidden behind a button or flyout. Here it has its own panel, always visible, always updated. For a game about information architecture, this is arguably correct.
- **No mode-switching.** Everything is always visible. No Space-bar peek, no tab switching, no panel opening. Pure spatial navigation via eye movement.

### Weaknesses
- **Everything is too small.** Six 640×540px panels at 1080p. The tactical map is smaller than Paradigm A's. The blueprint editor is smaller than ANY other paradigm. The channel map is informative but not interactive at this size.
- **Choice paralysis.** "Where do I look?" New players facing a 6-panel grid will freeze. There's no clear visual hierarchy. Everything demands attention equally.
- **The blueprint editor is critically undersized.** 640×540px for skills + rules + hooks + context config. At 12+ rules, this requires extensive scrolling. The hooks patch bay is impossible. Complex configurations require scrolling in multiple sub-sections simultaneously.
- **Ultra-widescreen dependency.** This layout desperately wants a 3440×1440 or dual-monitor setup. At 1920×1080, it's cramped. At 1366×768, it's unusable.
- **Streaming confusion.** Viewers can't tell where to look. The streamer's mouse jumps between panels. "Wait, what are they editing?" Without a clear focus point, the stream becomes visually chaotic.

### Interaction Effects
- **× Rules at scale (3.07a):** At 640×540px, even the minimap-sidebar approach is too cramped. Rules at scale is this paradigm's fatal flaw.
- **× Onboarding (5.xx):** New players cannot learn from a 6-panel grid. This paradigm REQUIRES progressive reveal — start with 2 panels (Map + Editor), add panels as complexity increases.
- **× Mobile/tablet:** Completely impossible without radical redesign.

### Comparable Games
- **Screeps:** Multi-panel dashboard with code editor, map, console, memory viewer. But each panel is resizable and dockable.
- **Dwarf Fortress (premium):** Multiple information panels surrounding a central map. Information-dense but overwhelming for newcomers.
- **EVE Online:** The canonical "spreadsheets in space" — multiple windows showing different data about the same system.

---

## Paradigm F: "The Growing Mind" — Progressive Layout

**Layout:** The plan screen layout CHANGES over the campaign. It starts simple and grows in complexity as new systems are introduced. This isn't a single layout — it's a sequence of layouts.

**Mission 1-2 (Tutorial):**
- Full-screen workbench. No board visible.
- Single blueprint editor: skills only, then skills + rules.
- EXECUTE button centered at bottom, oversized (72×72px), pulsing gold.
- Board appears only after EXECUTE as the sealed watch screen.
- The player hasn't seen the board yet. EXECUTE is an act of faith.

**Mission 3-4 (Hooks + Context):**
- Small tactical preview appears in bottom-left corner (Paradigm B's minimap).
- Workbench adds hooks tab and context config tab.
- First ghost unit appears on the minimap when a blueprint is complete.
- The board-workbench relationship is introduced gently.

**Mission 5 (Factory Introduction):**
- Layout shifts to split-screen (Paradigm A: 35/65).
- Board on left shows spawn points and factory.
- Production queue appears at bottom of workbench.
- Channel map flyout introduced.
- The layout change itself is a DIEGETIC EVENT — the boot log says "// TACTICAL OVERLAY INITIALIZED — binding sensor grid to workbench… done." The board slides in from the left.

**Mission 6-7 (Command Agent):**
- Layout matures to 40/60 split.
- Channel map panel gets a dedicated position.
- Board shows fuller data (perception radii, EM emissions).
- The overlay toggle (Space bar) is introduced as an optional "focus mode."

**Mission 8-10 (Full System):**
- Layout unlocks ALL modes. Player can choose:
  - Default: 40/60 split (Paradigm A)
  - Focus mode: Space-bar overlay (Paradigm C)
  - Topology mode: Unified canvas (Paradigm D)
  - Dashboard mode: Multi-panel grid (Paradigm E)
- Layout preference is saved per player. Settings → Layout Style.

**The diegetic progression:**
Each layout change is announced in the boot log:
- M1: "// WORKBENCH ONLINE — single agent configuration mode"
- M3: "// TACTICAL SENSOR UPLINK DETECTED — binding preview grid…"
- M5: "// FACTORY CONTROL INTERFACE ACQUIRED — dual-pane mode activated"
- M7: "// ADVANCED VISUALIZATION SUITE UNLOCKED — overlay mode available"
- M8: "// FULL TACTICAL COMMAND — all layout modes available. Select preferred configuration."

### Strengths
- **Eliminates the new-player overwhelm problem entirely.** The plan screen on Mission 1 has ONE panel showing ONE thing. There is nothing to be confused about. Each subsequent mission adds exactly one new UI element, and the boot log explains it.
- **The layout evolution IS the curriculum.** You don't need a tutorial ABOUT the UI — the UI teaches itself by growing. The player's mental model grows with the screen.
- **Every paradigm has its moment.** Full-screen workbench (M1-4) teaches that the workbench is primary. Split-screen (M5-7) teaches spatial awareness. By M8, the player has experienced enough to choose their preferred layout with informed preferences.
- **The boot log layout announcements are delightful.** An AI upgrading its own interface in real-time. "TACTICAL SENSOR UPLINK DETECTED" — the game is about being an AI, and the AI is literally upgrading its own workstation. This is maximum diegesis.
- **The M8 unlock is a reward.** "You've earned the right to customize your own command center." Layout choice as a progression reward, not a settings screen.

### Weaknesses
- **Implementation cost.** This is 4-5 distinct layout modes that need to be designed, built, tested, and maintained. Each with different responsive breakpoints, different interaction patterns, different edge cases.
- **Returning players face a learning curve.** If you take a break after M4 and return at M5, the layout change is disorienting — it feels like a different game. The boot log helps, but the muscle memory of "where is the rules editor?" has changed.
- **Layout locking per mission.** Missions 1-4 are stuck with full-screen workbench even if the player would benefit from seeing the board. "I KNOW there's a board, let me see it!" — the diegetic fiction (your AI doesn't have tactical sensors yet) can feel patronizing to experienced players who restart or replay.
- **Replay awkwardness.** Replaying Mission 2 after completing Mission 8 means losing your preferred layout for a locked tutorial layout. Solutions: "unlock all layouts for completed missions" or "layout locking only on first playthrough."

### Interaction Effects
- **× Onboarding (5.xx):** This IS the onboarding strategy. No separate tutorial needed for the plan screen UI.
- **× Replay (replayability-*.md):** Replay must unlock all layouts to avoid regression frustration.
- **× Accessibility:** Screen readers need consistent layout. Progressive layout changes require careful announcement of what moved where.
- **× Mobile:** Each layout stage needs its own mobile adaptation. Multiplied testing surface.

### Comparable Games
- **Factorio:** The game doesn't change its UI, but the PLAYER changes their UI usage — early game uses the inventory panel constantly, late game uses the blueprint library and map view. The UI is static but usage is progressive.
- **Slay the Spire:** Card pool grows over the run. The deck view shows more cards. The screen feels different at 15 cards vs. 35 cards even though the layout hasn't changed.
- **XCOM 2:** New UI panels unlock as you build new facilities (Psi Lab adds a new soldier management tab). But it's additive, not transformative.

---

## Recommended Approach: "The Growing War Room" (F + A + C Hybrid)

The strongest design combines Progressive Layout (F) as the frame, Split-Screen (A) as the default mature state, and Overlay (C) as the power-user toggle.

**Why this combination works:**

1. **Missions 1-4** use full-screen workbench. No board. Pure focus on learning the primitives. EXECUTE is an act of faith.

2. **Mission 5** introduces the split-screen (35/65). The boot log announces the tactical overlay. The board slides in from the left. This is a FELT moment — the game has expanded.

3. **Missions 5-10** use the split-screen as default. The overlay (Space bar) is available from M7 for spatial focus sessions (relay placement, topology planning, pre-execute review).

4. **Post-campaign** (Gauntlet, replays), all modes available with player preference saved.

**The split-screen default (A) gets one critical fix from the research:** the board should be RESIZABLE. A thin drag handle on the divider lets players adjust from 20/80 (Paradigm B's minimap feel) to 50/50 (generous board) to the default 35/65. The drag handle is a 4px wide strip with a subtle grip texture (three horizontal lines). Dragging it produces a satisfying "panel resize" animation with both panels re-flowing their contents.

**The overlay (C) replaces the board for deep spatial analysis.** When you need to study relay topology, hold Space — the board zooms to full screen. This is faster and more immersive than resizing the split-screen panel.

**The EXECUTE button lives in both states.** In split-screen, it's top-right of the workbench. In overlay, it floats top-right of the board. Always reachable. Always pulsing.

---

## Player Journeys

### Journey: Mika, 14, first-ever strategy game player

**Context:** Mission 1. Mika has never played a strategy game. She downloads Robot Uprising because a TikTok showed an army of robots doing cool things autonomously.

**Minute 0:00 — First Contact**
The screen shows a single dark panel. The boot log types character by character at the top: "// INITIALIZING WORKBENCH — agent configuration mode." A blueprint card fades in at center: "SCOUT-A" with an icon of a small robot with antenna eyes (👁). Below the blueprint name, two skill slots with dashed outlines. Below that, an empty rules section with the text "No rules configured — your agent has no instructions." At the very bottom, a large circular EXECUTE button glows warm gold, pulsing gently every 3 seconds.

Mika is confused. "Wait, there's only one robot? Where's the battlefield?" She doesn't know there IS a battlefield yet. The screen is the entire workbench. No map. No terrain.

**Minute 0:20 — First Skill**
A tooltip arrow points at the first skill slot: "Equip a skill: what your agent CAN DO." She clicks the slot. A popup shows two skills: **PATROL** (footsteps icon, cyan) and **EVADE** (wind icon, white). She hovers PATROL — a small animation plays in the corner: a tiny robot walking in a zigzag pattern across a 3×3 grid. "Oh, it walks around!" She drags PATROL into the slot. The slot snaps shut with a magnetic click sound. The skill icon glows briefly.

**Minute 0:45 — First Rule**
The rules section now shows: "Your agent can PATROL, but doesn't know WHEN to patrol. Add a rule." A single condition→action strip appears: WHEN [?] → DO [?]. She clicks WHEN and sees: ALWAYS, ENEMY_VISIBLE, ALLY_NEARBY. She picks ALWAYS. She clicks DO and sees: PATROL, EVADE (greyed out — not equipped). She picks PATROL. The rule strip fills in: "WHEN always → DO patrol." The strip turns from grey outline to solid amber.

**Minute 1:10 — The Act of Faith**
The EXECUTE button pulses more insistently. Mika clicks it. The workbench slides upward and dissolves. The sealed watch screen appears — and THIS is the first time she sees the battlefield. An 8×8 isometric grid of rice terrace tiles. Her lone scout appears at the bottom-left, standing on a green square. The tick clock starts. Her scout begins patrolling, walking a zigzag pattern across the terraces. An enemy appears from the top-right spawner. Her scout doesn't notice it (no ENEMY_VISIBLE rule). The enemy striker walks toward her scout and eliminates it on tick 8. A brief red flash. The tick clock stops.

"Oh no!" Mika's hands fly to her mouth. "I need a rule for when it sees an enemy!" The Inspector screen hasn't been introduced yet — the game goes straight back to the workbench. She adds EVADE to slot 2. Adds a new rule: "WHEN enemy_visible → DO evade" and drags it ABOVE the patrol rule.

**Minute 2:30 — Second Execute**
EXECUTE. Sealed watch. The scout patrols… then SEES the enemy at tick 4 (the scout's wide perception). It EVADES, darting two tiles away. The enemy pursues. The scout evades again. It survives until tick 20 — mission complete.

The full-screen workbench never showed Mika the board before she executed. The battlefield was a SURPRISE both times. This is the "act of faith" design — you build in the abstract, then experience the concrete.

**UI Annotations:**
- Workbench: full screen, dark background (#1a1a2e), single blueprint card center-aligned
- EXECUTE button: 72×72px circle, gold (#f5a623) to orange gradient, 4s pulse cycle, 6px glow radius
- Skill popup: 300×200px modal, center-screen, blur background
- Rule strip: 500×40px horizontal bar, amber (#e8a634) when complete, grey dashed when empty
- Boot log text: monospace 14px, typing animation 50ms/char, cyan (#00e5ff) text

---

### Journey: Derek, 31, Factorio veteran, Mission 6

**Context:** Mission 6 (first Command agent mission). Derek has been playing for 2 hours. He's comfortable with the split-screen layout that appeared at Mission 5. He has blueprints for 2 scouts, 1 relay, 2 strikers.

**Minute 0:00 — The Split Screen**
The plan screen shows the 35/65 split. Left: isometric board showing Cebu urban terrain — city blocks with fiber optic cables visible between buildings. Factory at bottom-center, enemy spawner at top-left. Ghost units at spawn positions: two cyan scout dots, one green relay dot, two red striker dots. Right: workbench with the blueprint tab bar showing 5 blueprint cards. The production queue at bottom shows the build order: Scout-A, Scout-B, Relay-C, Striker-D, Striker-E. Below the queue, resource preview: "Total: 27m | 11e/tick."

Derek clicks the board's factory building. The workbench highlights all five blueprints simultaneously with a brief golden flash — "these are what your factory will produce." He clicks ghost-Scout-A on the board. The workbench switches to Scout-A's blueprint. The bidirectional highlighting is instant and satisfying — click on the board, jump to the editor.

**Minute 0:30 — The Command Agent Arrives**
A boot log banner scrolls across the top of the workbench: "// NEW CAPABILITY: COMMAND UNIT — meta-level agent management. 14 buffer slots. 6 hook slots." A new blueprint card appears in the tab bar: "Command-F" with a crown icon (🤖). Derek's eyes widen. "Fourteen buffer slots? Six hook slots? This thing is a beast."

He clicks the Command blueprint. The workbench shows an expanded editor — the skills section has slots for REASSIGN, REROUTE, and PRIORITIZE. The hooks section has SIX empty hook strips. The rules section is empty but shows space for up to 12 rules.

**Minute 1:30 — The Topology Problem**
Derek starts wiring hooks. He creates a hook: "ON_SIGNAL from 'recon-intel' → SEND 'command-decision' with compress." He realizes he needs to see WHERE the Command unit will sit relative to the relays — the signal latency depends on board position.

He looks at the board on the left. The 8x8 grid is showing at ~280px wide. He can see the ghost units but the channel wiring is hard to read — the subway-map lanes overlap in the urban terrain. He squints.

"I need the big view." He presses SPACE. The board zooms from the left panel to fill the entire screen. The workbench dims to 30% beneath. Now the 8x8 grid is massive — each tile is ~100px. Channel wiring is crystal clear. He can see that Command-F's ghost position is 3 hops from the relay, which means 4-tick latency for scout→relay→command signal chain.

He hovers Command-F's ghost on the overlay. A tooltip shows: "Command-F | Buffer: 14 | Hooks: 3/6 configured | Signal path to Relay-C: 3 hops (4 ticks)." He right-clicks the ghost and selects "Edit Blueprint." The overlay dissolves and the workbench returns with Command-F's editor active.

**Minute 3:00 — The Resizable Divider**
After several Space-bar peeks, Derek decides he wants a wider board. He grabs the divider handle between the board and workbench panels. He drags it right — the board expands from 35% to 50%. Now each tile is ~48px — readable. The workbench narrows to 50% but he can still see his rules list without scrolling.

"This feels right." He locks the divider at 50/50 and continues editing.

**Minute 5:00 — Execute**
He clicks EXECUTE. The board panel expands smoothly from 50% to 100%. The workbench slides away to the right. The sealed watch begins. The tick clock starts. His command unit spawns on tick 6 (after the scouts and relay). It sits at the factory, immobile. Signals start flowing through channels. On tick 12, the command unit receives a "recon-intel" signal, processes it through its rules, and sends a "command-decision" signal that reroutes a striker.

Derek watches a flanking maneuver happen autonomously. He didn't program a flanking maneuver. He programmed signal routing and priority rules. The flanking EMERGED. His hands are in the air. "YES."

**UI Annotations:**
- Split-screen divider: 4px wide, grip texture (three horizontal dots), cursor changes to col-resize on hover
- Board panel: checkerboard grid, desaturated 20% vs. sealed watch, ghost units at 60% opacity
- Blueprint tab bar: horizontal, scrollable, 120×36px per tab, active tab has cyan bottom border
- Space-bar overlay: 400ms zoom transition, workbench dims to 30% opacity, glass-pane sound
- Signal path tooltip: appears after 500ms hover, shows hop count and latency in ticks

---

### Journey: Abuela Rosa, 62, retired electrical engineer, Mission 9

**Context:** Rosa is deep into the campaign. She's a meticulous planner. She uses the 50/50 split-screen layout and has never used the overlay toggle — she doesn't like mode-switching.

**Minute 0:00 — The Volcanic Coast**
The plan screen shows Zambales volcanic coast terrain. Jagged obsidian tiles, geothermal vents steaming, rusted machinery half-buried in ash. Rosa has 8 blueprints across 3 tiers of agents. The production queue is carefully ordered with cost annotations visible below each icon. Her channel map flyout is open (she keeps it open permanently), showing a clean hierarchical topology: scouts → "raw-intel" → relay → "filtered-intel" → command → "orders" → strikers.

She's been staring at the board for 90 seconds, not editing. Her eyes move between the board's ghost units and the channel map. She's planning in her head before touching anything.

**Minute 1:30 — The Relay Placement Decision**
Rosa notices the terrain has a natural chokepoint at C4-D4. The enemy spawner sends units through this gap. She drags her relay's ghost to C3 — just behind the chokepoint. On the board, the relay's perception radius (none — it's stationary) disappears, but the signal coverage lines from nearby scouts update. The hop count from Scout-A to Relay-C decreases from 3 to 2.

In the workbench, the context config thermometer for Relay-C updates: the listen channel "raw-intel" now shows an estimated fill rate of "~2 signals/tick" instead of "~1 signal/tick" — the relay is closer to the scouts and will receive more signals.

"Too hot," Rosa murmurs. She adjusts the context config: reduces the listen window from "all raw-intel" to "raw-intel with priority > 3." The thermometer cools from amber to blue-green. She nods.

**Minute 3:00 — The Fault Tolerance Check**
Rosa opens the channel map flyout wider. She traces the path: if Relay-C is eliminated, the "filtered-intel" channel goes silent. The command unit loses eyes. "Single point of failure," she says, echoing 40 years of engineering instinct.

She creates Relay-D — a backup. Same configuration as Relay-C, but positioned at F3 (behind the other flank). She creates a new channel "filtered-intel-backup" and configures the command unit to listen to both channels. The command unit's context config shows two channel inputs now — she adjusts eviction priority so backup signals are evicted first (if both relays are alive, primary takes precedence).

The channel map updates automatically: two parallel paths from scouts to command. Rosa smiles. "N+1 redundancy."

**Minute 6:00 — The Careful Execute**
Rosa reviews every blueprint one final time. She clicks through each tab, checking rules, hooks, context config. She glances at the board, tracing signal paths mentally. Finally, she clicks EXECUTE.

The board expands from 50% to 100%. The volcanic coast fills the screen. Steam rises from geothermal vents. Her army spawns over the first 10 ticks. The relays take their positions at C3 and F3. The scouts fan out. Signals begin flowing — cyan dashed lines pulsing across the grid.

On tick 18, the enemy sends a group of strikers through the C4 chokepoint. Relay-C processes the incoming scout signals, compresses them, and forwards to command. The command unit evaluates and sends an "engage" order to Striker-E. On tick 22, Striker-E eliminates the lead enemy. The rest of the enemy group is picked off by tick 28.

No relay died. The backup wasn't needed. But Rosa designed a system that WOULD have survived if it had been. That's engineering.

**UI Annotations:**
- Channel map flyout: 300px wide panel from workbench left edge, overlaps board slightly, translucent dark background, auto-generated network diagram with directed arrows between channel labels
- Context config thermometer: 120px tall vertical bar, per-channel fill prediction, color gradient cool-blue (< 50%) → amber (50-75%) → pulsing-red (> 75%)
- Ghost unit drag: units snap to grid positions, perception radius updates in real-time, hop count badges on channel lines update on drop
- Relay duplication: "Clone Blueprint" button at bottom of editor, creates copy with "-copy" suffix, new ghost spawns at nearest empty tile to original

---

### Journey: Kwame, 28, Twitch streamer, Mission 10 (final boss, Taal Volcano)

**Context:** Kwame streams to 1,200 concurrent viewers. He's been playing Robot Uprising on stream for a week. Chat is invested. This is the final mission. He uses 40/60 split-screen with frequent Space-bar overlays for dramatic effect.

**Minute 0:00 — The Final Board**
The Taal Volcano map fills the left panel. Concentric rings of terrain: a boiling crater lake at center, volcanic ash fields, then jungle. The enemy base sits IN the crater — a massive spawner pulsing deep red. Kwame's factory is at the south edge of the board.

"Chat, this is it. This is the Big One." He clicks the channel map flyout. His architecture is a masterpiece: 12 channels, 3 tiers of relays, 2 command agents, and a production queue 8 blueprints deep. Chat spam: "PogChamp" "the wiring 🥵" "relay meta stonks."

**Minute 1:00 — The Final Edit**
Kwame adjusts his secondary command agent's rules — it's configured to monitor the primary command agent's heartbeat channel and take over if the primary goes silent. "If Command-Alpha goes dark, Command-Beta takes the wheel. It's like a Kubernetes failover."

He presses Space to show the overlay. The full-screen board appears, channel wiring glowing in a web of colored lines. Chat explodes: "LOOK AT THAT NETWORK" "it's like a circuit board" "actually beautiful." Kwame lingers on the overlay for 5 seconds — long enough for chat to appreciate the architecture — then releases Space.

**Minute 3:00 — EXECUTE**
"Chat. No pause. No skip. We watch the whole thing." He hovers over EXECUTE. The button pulses gold. Chat: "DO IT" "PRESS THE BUTTON" "🔥🔥🔥." He clicks.

The workbench dissolves. The volcanic battlefield fills the screen. Steam, ash, terrain transitions from cyberpunk data cables to volcanic rock. His army spawns. The 10-mission campaign's climax has begun.

Twenty-three ticks of autonomous combat. Kwame doesn't touch the mouse. His scouts map the volcanic terrain. Relays compress and forward. Strikers advance toward the crater. The enemy spawns waves of counter-units. On tick 15, an enemy specialist hacks Relay-B — the signal line goes red, then dark. Command-Alpha detects the silence on the heartbeat channel and triggers the reroute hook. Signal paths shift to Relay-C within one tick.

On tick 19, enemy strikers overwhelm Command-Alpha. It's eliminated. A beat of silence — no command signals for one tick. Then Command-Beta's rules fire: "ON heartbeat_timeout → ACTIVATE fallover protocol." The backup command agent takes over. Chat: "THE FAILOVER WORKED" "Kubernetes energy" "HE PLANNED THIS."

Tick 23. The last enemy falls. Mission complete. The screen holds on the final board state for 3 seconds. Confetti-like circuit sparks fall from the top of the screen.

Kwame is standing. Chat is a wall of emotes. The TikTok clip will be: the moment Command-Alpha dies, the one tick of silence, and Command-Beta taking over — with Kwame's face cam showing him nodding, arms crossed, "as designed."

**UI Annotations:**
- Stream overlay capture: the Space-bar board zoom is a perfect "show chat the architecture" tool — 400ms zoom, hold, 300ms unzoom
- Channel map complexity: 12 channels rendered as a small network diagram with node-and-edge graph, color-coded by type
- EXECUTE hover state: button grows 10% on hover, pulse frequency doubles, subtle bass hum audio
- Victory state: 3-second hold on final board, circuit-spark particle effect (cyan + gold), achievement banner slides in from top

---

## Sensory Design Summary

| Element | Paradigm A (Split) | Paradigm B (Full WB) | Paradigm C (Overlay) | Paradigm D (Canvas) | Paradigm E (Grid) | Paradigm F (Progressive) |
|---------|--------------------|-----------------------|---------------------|---------------------|--------------------|-|
| **Visual weight** | Balanced tension | Editor-dominant | Dramatic toggle | Spatial immersion | Surveillance grid | Growing organism |
| **Primary color** | Cyan/dark split | Dark workbench amber | Glass-pane translucent | Gold tethers on dark | Bordered panel grey | Changes per phase |
| **Sound on transition** | Workbench slide (whoosh) | Minimap click (blip) | Glass pane (tschk/thk) | Panel open (magnetic snap) | None (always visible) | Boot log typing (tktktk) |
| **EXECUTE moment** | Board expands (dramatic) | Map blooms from corner (explosive) | Workbench dissolves (dissolve) | Panels close (quiet) | Grid collapses to single (implosive) | Context-dependent |
| **Emotional character** | Professional, balanced | Focused, confident | Powerful, theatrical | Immersive, spatial | Tactical, overwhelming | Nurturing, progressive |

---

## TikTok Clips

**Paradigm A:** Split-screen timelapse of a player building a 6-blueprint architecture in the workbench while the board's ghost army assembles in the left panel. Speed up 8×. Cut to EXECUTE — board expands — army deploys. "I designed every thought they think."

**Paradigm C:** Space-bar overlay toggle — workbench full of rules and hooks, SPACE, DRAMATIC ZOOM to full board showing a beautiful signal network, release, back to editing, SPACE again, one more check, EXECUTE. The rhythm is mesmerizing.

**Paradigm D:** Four floating panels connected by gold tethers to units on an isometric battlefield. The player is editing two blueprints simultaneously while channel wires pulse between them. It looks like actual AI engineering. "This is what building AI agents looks like."

**Paradigm F:** Side-by-side Mission 1 (single panel, one blueprint, one rule) vs. Mission 10 (full war room with 8 blueprints, 12 channels, dual command agents). Same game. The progression is staggering. "The game grows WITH you."
