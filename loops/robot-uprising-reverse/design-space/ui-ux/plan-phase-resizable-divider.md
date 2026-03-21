# 4.01a — Resizable Split-Screen Divider UX

The plan screen's split between board preview (left) and workbench (right) is the most-touched layout surface in the entire game. Every player has different needs at different moments: sometimes you need the board large to study terrain and channel wiring; sometimes the workbench needs every pixel for a 12-rule priority stack. A fixed split is a compromise nobody chose. A resizable divider hands that power to the player — but the divider itself becomes a micro-UI that must be invisible when ignored and instantly responsive when grabbed.

This analysis explores the full design space of the drag handle, snap points, persistence, responsive reflow, minimum widths, and keyboard accessibility.

---

## The Divider as Object

### Visual Design: "The Seam"

The divider is a vertical line running the full height of the viewport, positioned between the board and workbench panels. At rest, it is a 4px-wide line in `#1a2a1a` (dark green-black, nearly invisible against the dark UI chrome). A subtle 1px inner highlight of `#2a3a2a` gives it just enough presence to be discoverable without being distracting.

**Hover state:** When the cursor enters a 12px-wide invisible hit zone centered on the divider, the line expands to 6px and shifts to `#3d5a3d` (muted cyan-green), and the cursor changes to `col-resize`. Two small triangular grip arrows (left-pointing and right-pointing, 8px tall, rendered in `#5a8a5a`) fade in at the vertical center of the divider. A tooltip reading "Drag to resize — Ctrl+Left/Right to nudge" appears above the grip arrows after a 600ms hover dwell.

**Active/dragging state:** The line becomes 6px of solid `#00ccaa` (the game's signature cyan), and a translucent overlay (rgba 0,0,0,0.15) covers the panel that is shrinking, giving the player a spatial sense of which side is losing space. Both panels reflow in real-time — no placeholder ghost lines, no "release to apply." The board's isometric grid rescales continuously. The workbench's content reflows with CSS-like responsiveness (elements stack, wrap, or collapse as width changes).

**Keyboard focus state:** When the divider receives focus via Tab or Ctrl+D shortcut, a pulsing cyan outline (2px, `#00ccaa`, 1.5s pulse cycle) appears around the entire divider line. The grip arrows become permanently visible and gently bounce left-right in a 400ms loop to indicate "I can be moved."

### Grip Handle Variants

**Option A: "Minimal Arrows"** — Two opposing triangles at the divider's vertical midpoint. Clean, unobtrusive, Figma-like. Risk: hard to discover on first encounter.

**Option B: "Textured Bar"** — A 24×48px rounded rectangle at the vertical center with three horizontal grooves (like a drawer pull). More tactile, stronger affordance. Slightly breaks the minimal aesthetic. This is what VS Code, Chrome DevTools, and most IDE split panes use.

**Option C: "Breadcrumb Dots"** — Three vertically stacked 4px dots at the center. Subtle but discoverable. Google Sheets sidebar divider does this.

**Recommendation: Option B for first playable.** The game already has a complex UI. The divider handle needs maximum discoverability so players find it organically, not through a tooltip. After players internalize the interaction, a settings toggle could switch to Option A for a cleaner look.

---

## Snap Points: The Three Regimes

Rather than continuous free-form resizing (which produces awkward 37/63 splits nobody intended), the divider snaps to three deliberate positions with a magnetic pull. Players can drag past a snap point to reach the next one, but releasing within a snap zone (plus or minus 40px of the snap position) locks to that position.

### Snap Point 1: "Workbench Focus" — 20/80

- **Board:** 20% of viewport width (~384px at 1920). The isometric grid renders at thumbnail scale — tiles are roughly 24px wide. Unit icons become colored pips. Perception radii are not drawn. Channel wiring is hidden. This is a glanceable reminder that a battlefield exists, not a usable tactical view.
- **Workbench:** 80% (~1536px at 1920). Luxurious space. The rules priority list can show 14+ rules without scrolling. The hooks patch bay has room for full channel name labels next to each socket. The context config mixing board faders have 200px of travel. Blueprint tabs across the top can show full blueprint names instead of truncated abbreviations.
- **When players use this:** Deep blueprint editing sessions. Mission 5+ when blueprints grow complex. Any time the player is "in the zone" configuring agents and doesn't need tactical context.
- **Board content at this width:** Simplified top-down view (not isometric). Color-coded tiles. Ghost unit dots. Click-to-expand overlay button in the corner ("View Battlefield" with a magnifying glass icon). Essentially the minimap from Paradigm B (see plan-phase-layout.md), but the player chose this size rather than having it imposed.

### Snap Point 2: "Balanced" — 35/65

- **Board:** 35% (~672px at 1920). Isometric grid is comfortable — tiles are ~42px, unit icons are legible, perception radius circles render as translucent overlays, channel wiring shows as simplified color-coded lines (no labels, but hovering a line shows the channel name in a tooltip). This is the default split.
- **Workbench:** 65% (~1248px at 1920). Comfortable for most editing. Rules list shows 8-10 without scrolling. Hooks patch bay works but channel names may truncate to 8 characters. Context config faders have ~120px of travel. Blueprint tabs truncate names over 12 characters with ellipsis.
- **When players use this:** The default for most play. Good balance of "I can see the board context" and "I have room to work." Tutorial missions lock to this split.
- **Board content at this width:** Full isometric render. Ghost units with perception radii. Channel wiring in simplified form. Terrain fully rendered with muted saturation. Enemy spawner positions pulsing dim red. Hovering a unit on the board highlights its blueprint card in the workbench (bidirectional).

### Snap Point 3: "Tactical" — 50/50

- **Board:** 50% (~960px at 1920). Generous isometric view — tiles are ~60px, unit icons are detailed, perception radii are fully drawn with range labels, channel wiring shows as labeled colored lines with signal-direction arrows. This is nearly as much board as the sealed watch screen.
- **Workbench:** 50% (~960px at 1920). Tight but functional. Rules list shows 6-7 without scrolling. Hooks patch bay stacks vertically instead of horizontally. Context config faders compact to ~80px of travel. Blueprint tabs collapse to icons only (unit type icon + color dot for identification).
- **When players use this:** Pre-EXECUTE "final check" moments. Studying terrain for a new mission. Inspecting channel wiring topology. Players who came from Into the Breach and want the map to feel like the main event.
- **Board content at this width:** Full isometric render with all overlays. Ghost units, perception radii with numeric labels, channel wiring with full channel names, terrain at full saturation. A "ghost simulation" toggle appears in the board toolbar — clicking it runs a 3-tick preview animation showing predicted unit movement (locked feature for Mission 6+).

### Snap Behavior Mechanics

- **Magnetic range:** 40px on either side of each snap position. If the user releases within this zone, the divider animates (100ms ease-out) to the exact snap position.
- **Crossing a snap boundary:** When dragging past a snap point, a subtle haptic pulse (on supported devices) and a soft "tick" sound (like a detent on a physical dial) play. The divider momentarily stiffens — drag velocity is reduced by 30% for 80ms — creating a physical sensation of "clicking past a notch."
- **Free positioning:** Releasing outside any snap zone is allowed. The divider stays where released. But the next time the player drags it, the nearest snap point's magnetic zone activates normally. Free positions are not persisted across sessions — on reload, the divider returns to the nearest snap point.
- **Overshoot prevention:** The divider cannot be dragged past the minimum panel widths (see below). Attempting to drag past triggers a rubber-band resistance — the divider follows the cursor at 20% speed, then springs back to the minimum when released.

---

## Position Persistence

### Across Sessions (localStorage)

The divider position is stored in `localStorage` under key `robot-uprising:plan-divider-pos`. The stored value is one of: `"20/80"`, `"35/65"`, `"50/50"`, or a numeric pixel value for free positions.

**On game load:** The divider initializes at the stored position. If no stored value exists, default is `"35/65"`.

**On snap:** The new snap position is written to localStorage immediately (no debounce needed — snaps are discrete events).

**On free-position release:** The pixel value is written after a 500ms debounce (in case the player is still adjusting).

### Across Missions

The divider position carries across missions within a session. Switching from Mission 3 to Mission 4 does not reset the divider. Rationale: the player's screen preference is about their monitor and work style, not about the mission.

### Tutorial Override

Missions 1-4 (tutorial) lock the divider at 35/65. The grip handle is hidden. The hit zone does not activate. This prevents new players from accidentally collapsing the board or workbench before they understand both panels. On Mission 5 (factory introduction), the divider unlocks with a brief boot-log message: `[SYSTEM] Workbench interface unlocked: adaptive layout enabled. Drag the panel divider to resize.` The grip handle fades in with a 1.5s animation and briefly pulses cyan three times to draw attention.

---

## Responsive Reflow During Drag

Both panels must reflow their content in real-time as the divider moves. No jank. No layout thrashing. No "resize on release." The player must see content adapt fluidly as they drag.

### Board Panel Reflow

| Width Range | Rendering Mode | Content Changes |
|---|---|---|
| 960px+ (50%+) | Full isometric, all overlays | Perception radii with labels, full channel wiring, terrain at full saturation |
| 672-959px (35-49%) | Full isometric, simplified overlays | Perception radii without labels, channel wiring as simple colored lines, terrain slightly desaturated |
| 384-671px (20-34%) | Simplified top-down | Color-coded tiles, ghost unit dots, no perception radii, no channel wiring |
| Below 384px | Collapsed minimap | 200x150px fixed minimap in corner, rest of space is dark with a "Click to expand" overlay |

**Transition between modes:** When the board width crosses a rendering-mode threshold during drag, the transition is a 150ms cross-fade. The old render fades out while the new render fades in. No jarring pop. The cross-fade is fast enough that the player perceives a smooth morph rather than a mode switch.

### Workbench Panel Reflow

| Width Range | Layout Mode | Content Changes |
|---|---|---|
| 1200px+ (62%+) | Full expanded | All labels visible, horizontal hook patch bay, generous fader travel, full blueprint names in tabs |
| 960-1199px (50-62%) | Standard | Labels present but abbreviated, hook bay horizontal, moderate fader travel, blueprint names truncated |
| 768-959px (40-49%) | Compact | Labels become icons with tooltips, hook bay stacks vertically, faders compress, blueprint tabs become icon-only |
| Below 768px | Minimal | Single-column layout, sections become accordion panels (tap to expand one at a time), production queue moves to overlay |

**Key reflow behaviors:**
- **Rules priority list:** At full width, each rule shows `IF [condition icon] [condition text] THEN [action icon] [action text]`. At compact width, it becomes `[condition icon] → [action icon]` with full text on hover. At minimal width, rules stack as single-line summaries.
- **Hooks patch bay:** At full width, horizontal layout with channel name labels and colored wires. At compact, vertical stack with abbreviated channel names. At minimal, collapsed list view.
- **Production queue conveyor belt:** Remains as a horizontal strip anchored at the bottom. At minimal workbench width, it detaches and becomes a floating overlay that can be toggled.
- **Blueprint tabs:** At full width, `[icon] Scout Alpha` with full name. At standard, `[icon] Sct Alpha`. At compact, `[icon]` only (colored dot distinguishes blueprints of the same unit type). At minimal, dropdown selector replaces tabs.

---

## Minimum Panel Widths

### Board Minimum: 200px

Below 200px, the board panel collapses entirely. The divider snaps to the left edge. A small "Show Board" tab (40x120px, vertical text, anchored to left edge) appears. Clicking it smoothly animates the divider to the 20/80 snap point (300ms ease-out). The board-collapsed state is NOT persisted — it's a temporary state for maximum workbench immersion.

### Workbench Minimum: 480px

Below 480px, the workbench panel collapses entirely. The divider snaps to the right edge. A "Show Workbench" tab (40x120px, vertical text, anchored to right edge) appears. This state is unusual — it means the board fills nearly the entire screen, which mirrors the sealed watch layout. An "EXECUTE" floating button appears in the bottom-right corner so the player can still launch without the workbench.

### Why These Minimums

- **200px board:** Enough for a recognizable minimap. Below this, the board provides no tactical value — it's just noise.
- **480px workbench:** Enough for the minimal single-column accordion layout. Below this, even one section (like the rules list) cannot render usably.

---

## Keyboard Accessibility: The Ctrl+Arrow Alternative

### Activation

- **Ctrl+D** (for "Divider"): Focuses the divider. Screen readers announce "Panel divider. Board preview: 35%. Workbench: 65%. Use arrow keys to resize."
- **Tab navigation:** The divider is in the tab order between the board panel and workbench panel. Tabbing from the last board element focuses the divider. Tabbing again enters the workbench.

### Movement

- **Ctrl+Left Arrow:** Shrinks the board by 80px (or to the next snap point if within 40px of a boundary). 100ms animation to new position.
- **Ctrl+Right Arrow:** Grows the board by 80px (or to the next snap point if within 40px).
- **Ctrl+Shift+Left:** Jump to the previous snap point (e.g., 50/50 → 35/65 → 20/80).
- **Ctrl+Shift+Right:** Jump to the next snap point.
- **Ctrl+Shift+1/2/3:** Jump directly to snap points 1 (20/80), 2 (35/65), or 3 (50/50).
- **Home:** Jump to 20/80 (maximum workbench).
- **End:** Jump to 50/50 (maximum board).
- **Escape:** Defocus the divider, return focus to last active element.

### Screen Reader Announcements

After each resize, the screen reader announces: "Board preview: [X]%. Workbench: [Y]%." After snapping, it adds the snap name: "Snapped to Balanced layout. Board: 35%. Workbench: 65%."

### Visual Focus Indicator

When the divider is keyboard-focused, the 2px pulsing cyan outline replaces the standard hover state. The grip arrows are visible and gently bouncing. Arrow key presses cause a brief flash (50ms) of the full 6px cyan active state on each keypress, giving visual feedback that the keyboard shortcut registered.

---

## Player Journeys

### Journey 1: Reyna, 16, First Strategy Game (Discovery)

**Context:** Mission 5, first time the factory is introduced. The divider has just been unlocked. Reyna has played Missions 1-4 with a locked 35/65 split and never thought about resizing.

**Minute 0:00 — The Unlock Moment**
The mission loads. The boot log scrolls: `[SYSTEM] Workbench interface unlocked: adaptive layout enabled.` At the divider's center, a small textured grip handle fades in over 1.5 seconds and pulses cyan three times. Reyna notices it — the rest of the UI is static, so the animation draws the eye. She wonders what it does.

**Minute 0:15 — Accidental Hover**
While moving the mouse from the board to the workbench, Reyna's cursor crosses the divider. The line brightens from near-invisible dark green to muted cyan-green. The cursor changes to `col-resize`. The grip arrows appear. Reyna pauses. She's seen this cursor in Google Docs when resizing columns. She knows what this means instinctively.

**Minute 0:20 — First Drag**
Reyna clicks and drags left. The board shrinks. She watches the isometric grid rescale in real-time — tiles get smaller, the terrain compresses. The workbench panel expands, and she notices the blueprint editor sections spreading out, the rules list showing more entries. She drags past the 20/80 snap point and feels a slight resistance — the divider slows for a moment, and she hears a soft "tick." She releases. The divider snaps to 20/80.

**Minute 0:30 — Workbench Exploration**
With 80% workbench, Reyna can see all the new Mission 5 UI elements — the production queue conveyor belt at the bottom, the blueprint tabs across the top, the factory resource counter. There is so much room. She edits her first blueprint, dragging skills into slots. The minimap board in the corner shows colored dots at spawn positions. She glances at it occasionally but doesn't need more detail right now.

**Minute 2:00 — Wanting the Board Back**
Reyna has configured two blueprints and wants to see where units will spawn. She grabs the divider and drags right. As the board panel grows past 672px, the rendering transitions from the simplified top-down view to the full isometric view — a 150ms cross-fade that feels like the map "coming to life." Tiles gain depth, unit ghost icons become detailed sprites. She stops at 35/65 (the snap pulls her in) and studies the terrain. She sees a chokepoint she hadn't noticed and adjusts her blueprint's rules to account for it.

**Minute 3:30 — Pre-Execute Check**
Before hitting EXECUTE, Reyna drags the divider to 50/50. The board is now large enough to show channel wiring labels and perception radii with numeric ranges. She traces a channel from her scout to her relay to her striker. The signal path makes sense. She clicks EXECUTE.

**UI Annotations:**
- **Grip handle:** 24x48px textured rectangle at divider midpoint, fades in on Mission 5 unlock with 3-pulse cyan animation
- **Snap feedback:** Soft "tick" audio + 30% drag velocity reduction for 80ms at each snap boundary
- **Cross-fade:** 150ms transition between board rendering modes (top-down to isometric at 672px threshold)
- **Tooltip:** "Drag to resize — Ctrl+Left/Right to nudge" appears after 600ms hover dwell, positioned 20px above grip handle

---

### Journey 2: Marco, 34, Software Engineer and Factorio Veteran (Optimization)

**Context:** Mission 8, deep into the factory-vs-factory endgame. Marco has been playing for hours and has strong opinions about screen layout. He uses keyboard shortcuts for everything.

**Minute 0:00 — Session Start, Muscle Memory**
Marco opens the game. The divider loads at 20/80 — his stored preference from localStorage. He always works in workbench-dominant mode. His blueprints are complex: the command agent has 14 context window slots, 6 hook slots wired to 4 channels, and 8 rules in its priority stack. He needs every pixel of workbench space.

**Minute 0:10 — Keyboard Resize**
Marco presses Ctrl+D. The divider receives focus — a pulsing cyan outline appears. He doesn't look at it; his eyes are on the workbench. He presses Ctrl+Shift+3 to jump to 50/50. The board panel expands with a smooth 200ms animation. He studies the enemy spawner layout — two spawners in opposite corners, with jungle terrain creating a narrow corridor in the center. He's planning a relay-chain that exploits the chokepoint.

**Minute 0:25 — Quick Study, Back to Work**
Marco presses Ctrl+Shift+1. The divider jumps back to 20/80 in 200ms. He didn't need the board for long — just a 15-second tactical survey. This is his flow: brief board checks punctuating long workbench sessions. The keyboard shortcuts make the round-trip instant. No mouse required.

**Minute 1:00 — The Complex Wiring Check**
Marco has wired a 4-agent relay chain: Scout → Relay-Alpha → Relay-Beta → Striker. He needs to verify the channel wiring on the board. He presses Ctrl+Right Arrow three times (80px per press = 240px added to the board). The board grows from 20% to roughly 32%. At each keypress, the screen reader (which Marco doesn't use, but the system supports) would announce the new percentage. The board is now showing the simplified isometric view with channel wiring as colored lines. He can trace the scout-to-relay-alpha channel (cyan line) and relay-beta-to-striker channel (amber line). The wiring looks correct.

**Minute 1:20 — Micro-Adjustment**
Marco presses Ctrl+Left Arrow twice, shrinking the board back by 160px. He's found his sweet spot: about 25% board, 75% workbench. This isn't a snap point — it's a free position. The divider stays exactly where he put it. He returns focus to the workbench with Escape and continues editing. The free position won't persist across sessions (it'll snap to 20/80 on next load), but within this session, it holds steady.

**Minute 5:00 — Pre-Execute Ritual**
Marco has a pre-execute ritual. He presses Ctrl+Shift+3 (jump to 50/50), scans the board for 10 seconds, then presses Ctrl+Shift+1 (back to 20/80) and hits Enter on the EXECUTE button. The board expansion is his "deep breath before the dive." He's done this for every mission since Mission 5. The keyboard shortcut round-trip takes under a second.

**UI Annotations:**
- **Ctrl+D focus:** Pulsing 2px cyan outline on entire divider line, grip arrows visible and bouncing
- **Ctrl+Shift+1/2/3:** Direct snap point jump, 200ms ease-out animation
- **Ctrl+Arrow:** 80px incremental resize per keypress, 100ms animation, brief 50ms cyan flash on divider
- **Free position:** Not persisted to localStorage; reverts to nearest snap on reload
- **Escape:** Returns focus to last active element in the panel the cursor was most recently in

---

### Journey 3: Tala, 28, Accessibility Tester and Screen Reader User (Keyboard-Only Flow)

**Context:** Mission 6, using NVDA screen reader on Windows. Tala navigates entirely by keyboard. She has never used a mouse with this game.

**Minute 0:00 — Navigating to the Divider**
Tala is in the workbench, having just finished configuring a relay blueprint's hooks. She presses Shift+Tab repeatedly to navigate backward through the workbench elements. After passing the first workbench element (blueprint tab bar), the next Shift+Tab lands on the divider. NVDA announces: "Panel divider. Board preview: 35 percent. Workbench: 65 percent. Use arrow keys to resize. Use Ctrl+Shift+1, 2, or 3 to jump to preset layouts."

**Minute 0:12 — Understanding the Control**
Tala recognizes this as a slider-like control from the ARIA role description. She presses Right Arrow. NVDA announces: "Board preview: 39 percent. Workbench: 61 percent." She presses Right Arrow again. "Board preview: 43 percent. Workbench: 57 percent." Each press moves the divider by the 80px increment (roughly 4% at 1920px wide). She hears the layout changing — the workbench reflow causes subtle DOM updates that she can detect when she re-enters the workbench.

**Minute 0:30 — Using Snap Shortcuts**
Tala presses Ctrl+Shift+3. NVDA announces: "Snapped to Tactical layout. Board preview: 50 percent. Workbench: 50 percent." She presses Ctrl+Shift+1. "Snapped to Workbench Focus layout. Board preview: 20 percent. Workbench: 80 percent." The named snap points give her a mental model of the three available layouts. She doesn't need to think in percentages — "Workbench Focus," "Balanced," and "Tactical" are meaningful categories.

**Minute 0:50 — Choosing Her Layout**
Tala presses Ctrl+Shift+2 to select the Balanced layout. "Snapped to Balanced layout. Board preview: 35 percent. Workbench: 65 percent." She presses Tab to enter the workbench. The first element she lands on is the blueprint tab bar. She continues configuring her agents.

**Minute 3:00 — Quick Board Check Without Resizing**
Tala wants to check the board state but doesn't want to resize. She presses Ctrl+Shift+B (a separate shortcut documented in the game's accessibility panel) which shifts focus to the board panel. In the board, she tabs through interactive elements: spawn point descriptions, terrain summaries, enemy positions. NVDA reads: "Spawn point Alpha-3. Scout ghost unit. Perception radius: 5 tiles. Connected channels: recon-net, threat-alert." She gathers what she needs, presses Ctrl+Shift+W to return focus to the workbench, and continues.

**Minute 4:00 — Pre-Execute**
Tala tabs to the EXECUTE button. NVDA announces: "Execute battle. Button. Press Enter to launch." She reviews her mental model: relay in the center, scout on the flank, striker near the enemy base. She presses Enter.

**UI Annotations:**
- **ARIA role:** The divider has `role="separator"` with `aria-orientation="vertical"`, `aria-valuenow` (current board %), `aria-valuemin` (10), `aria-valuemax` (52), `aria-label="Panel divider between board preview and workbench"`
- **Named snaps in announcements:** "Workbench Focus" (20/80), "Balanced" (35/65), "Tactical" (50/50) — names, not just numbers
- **Ctrl+Shift+B / Ctrl+Shift+W:** Focus jump shortcuts for board and workbench panels, independent of divider position
- **Board element tab order:** Spawn points, terrain features, and enemy positions are tabbable with descriptive labels when the board panel has focus

---

### Journey 4: Dev, 42, Twitch Streamer (Performance and Spectacle)

**Context:** Mission 9, streaming to 200 viewers. Dev resizes the divider frequently for dramatic effect while narrating strategy.

**Minute 0:00 — The Reveal**
Dev has been explaining a complex relay chain in 20/80 mode, workbench filling the screen. "Okay chat, NOW look at this." He grabs the divider and drags it to 50/50 in one smooth motion. The board expands, the isometric terrain fills the left half of the screen, and the channel wiring lights up — cyan and amber lines tracing the relay chain he just described. Chat sees the full tactical picture for the first time. "See how the scout feeds relay-alpha, which compresses and forwards to the striker? That's a three-hop chain, chat. Three ticks of latency. But the compression means the striker gets clean targeting data instead of noise."

**Minute 0:15 — The Snap Sound**
As Dev dragged past the 35/65 snap point, viewers heard the soft detent "tick" in the stream audio. Several chat messages: "nice snap sound" and "that UI is clean." The magnetic resistance at the snap point created a visible hitch in the drag — the divider briefly slowed — which read as polished on stream.

**Minute 0:30 — Back to Editing**
Dev snaps the divider to 20/80 with a quick flick left. The board shrinks, the workbench expands, and he's back to editing. "Alright, one more tweak to the eviction priority..." The rapid resize transition (snap animation + content reflow in under 200ms) doesn't cause any dropped frames. The stream stays at a smooth 60fps because the reflow is CSS-driven (grid template column resize), not JavaScript layout recalculation.

**Minute 2:00 — The Execute Zoom**
Dev's pre-execute ritual: he drags the divider all the way to 50/50, pauses for two seconds of dramatic silence, then clicks EXECUTE. The sealed watch transition kicks in — the workbench slides off-screen to the right, the board expands to fill the viewport, and the tick clock appears at the top. The transition from 50/50 to full board is less dramatic than from 20/80 to full board (shorter travel distance), but Dev prefers starting from 50/50 because the board is already at "tactical" fidelity — there's no rendering mode change during the transition.

**UI Annotations:**
- **Stream performance:** Divider drag triggers `requestAnimationFrame`-synced CSS grid resize, not JS layout. No dropped frames even at high drag velocity
- **Snap sound:** 15ms WAV sample, low frequency "tick" (280Hz), mixed at -18dB relative to game music. Audible but not intrusive on stream
- **Sealed watch transition from 50/50:** Board expands from 50% to 100% (960px to 1920px). Workbench slides right and fades. 400ms ease-out. Less dramatic than the 20/80 → 100% transition (which moves 1536px vs 960px)
- **No dropped frames during drag:** Reflow is pure CSS Grid `grid-template-columns` property animation. Board Pixi.js canvas rescales via `renderer.resize()` throttled to 60fps. Workbench DOM reflow handled by CSS container queries

---

## Strengths

- **Player agency over workspace.** Every player's monitor, eyesight, and workflow is different. A draggable divider respects that diversity without requiring a settings menu.
- **Snap points prevent bad states.** Continuous free-form resizing would let players create awkward splits (like 43/57) where neither panel renders well. Snap points guide toward three deliberately designed layouts.
- **Keyboard parity.** The Ctrl+Shift+1/2/3 shortcuts are actually *faster* than mouse dragging. Power users may never touch the drag handle after discovering them.
- **Persistence eliminates friction.** Storing the preference means players set their layout once and forget about it. The divider becomes invisible infrastructure.
- **Tutorial gate prevents confusion.** Locking the divider during Missions 1-4 means new players learn the core game before learning the UI customization.
- **Stream-friendly.** The snap sounds, smooth animations, and dramatic resize gestures add spectacle for viewers. The divider becomes a presentation tool, not just a layout control.

## Weaknesses

- **Discovery problem.** A 4px dark line is easy to miss entirely. Some players may never find the divider without the Mission 5 unlock animation. If they miss that moment (looking at their phone, alt-tabbed), they may play the entire game at 35/65.
- **Reflow jank risk.** Real-time reflow of both panels during drag is technically demanding. If the Pixi.js canvas resize or the workbench DOM reflow drops frames, the entire interaction feels broken. This must be a performance-critical code path.
- **Three snap points may not be enough.** A player on a 1366x768 laptop may want a different set of snap points than a player on a 3440x1440 ultrawide. The fixed 20/80, 35/65, 50/50 set assumes a roughly 1920-wide viewport.
- **Keyboard shortcuts are non-discoverable.** Ctrl+Shift+1/2/3 won't be found by casual players. The tooltip (600ms hover dwell) helps for mouse users but not for keyboard users who skip the divider entirely.
- **Collapsed panels are confusing.** If a player drags the board to 0% width, the small "Show Board" tab on the left edge may be mistaken for a window border or ignored entirely.

## Interaction Effects

- **Plan-phase layout (4.01):** This analysis is a direct sub-aspect. The divider turns the six paradigms in the parent analysis into a player-controlled spectrum rather than a designer-imposed choice. The player can shift from "Architect's Desk" (20/80) to "War Room" (50/50) within a single mission.
- **Hook visualization (3.10):** Channel wiring rendering must support three fidelity levels — full labels (50/50), simplified lines (35/65), and hidden (20/80). The rendering mode switches must be seamless during drag.
- **Rules priority list (3.07a):** The rules list reflow from "full text" to "icon pairs" to "single-line summary" must be pre-designed for all three snap widths. This is 3 separate CSS layouts for one component.
- **Context config (3.12):** Mixing board fader travel directly correlates with workbench width. At 20/80, faders have 200px of travel (precise). At 50/50, faders compress to 80px (coarse). This affects the granularity of context configuration.
- **Sealed watch transition:** The transition animation from plan to sealed watch depends on the current divider position. Starting from 50/50 is a shorter, faster expansion. Starting from 20/80 is a dramatic full-screen reveal. Both must feel intentional.
- **Mobile/responsive (6.xx):** On viewports below 1024px, the divider concept breaks down entirely. The board and workbench should become stacked vertical panels (board top, workbench bottom) or tab-switched views. The divider is a desktop/tablet-landscape-only feature.

## Comparable Games

- **VS Code split editor:** Draggable vertical divider between editor panes. No snap points — fully free-form. Thin 4px handle with `col-resize` cursor. Persists across sessions. The gold standard for developer-tool split panes.
- **Figma canvas/panel divider:** Draggable divider between canvas and right panel. Snap to closed (panel collapses to icon strip). Very discoverable because the panel has visible width and the handle is on the panel edge, not floating in space.
- **Chrome DevTools:** Draggable divider between page and devtools panel. Supports both vertical and horizontal splits. Collapse buttons on the divider to minimize either panel. Persists across sessions.
- **Into the Breach loadout screen:** No split at all — the mech loadout is a separate screen from the tactical map. Players switch between them with a button press. This is the polar opposite approach: instead of a resizable split, you get full-screen context switching. Simpler but loses the cross-reference capability.
- **Factorio map + inventory:** The inventory panel overlays the map (not a split). Pressing E toggles it. The map is always full-screen underneath. This avoids the split-screen problem entirely but requires semi-transparent overlays.

## Sensory Description

**At rest:** The divider is nearly invisible — a dark vertical seam, the grout line between two panels. Your eye slides over it. The board glows softly on the left with isometric terrain in muted blue-greens. The workbench hums with UI elements on the right — slot outlines, button glows, text labels in `#c0d0b0` (pale green-grey). The EXECUTE button pulses its distant heartbeat in the top-right corner.

**On hover:** A subtle warmth. The seam brightens from black to dark green. Two tiny arrows materialize at the center, pointing left and right like a breathing exercise: *expand, contract, expand, contract.* The cursor changes shape. The UI is whispering: *you can change this.*

**During drag:** The screen comes alive. Both panels reflow in real-time — the board's isometric grid scales smoothly, tiles growing or shrinking like a living organism. The workbench elements shuffle and rearrange, text labels appearing and disappearing as space allows. The divider itself is a bright cyan line, 6px wide, glowing with the game's signature color. Crossing a snap point produces a soft mechanical "tick" — the sound of a dial clicking into a detent — and a momentary resistance in the drag, like the divider is magnetized. Release, and the divider snaps with a 100ms ease-out to its final position. Both panels settle into their new proportions with a single frame of stillness — a visual exhale.

**The TikTok clip:** A player grabs the divider and drags it from 20/80 to 50/50 in one smooth motion. The board expands from a tiny minimap to a full tactical view, channel wiring lighting up as the isometric grid grows. The player pauses for a beat, then hits EXECUTE. The workbench slides off-screen and the battlefield fills the viewport. Cut. 8 seconds. Caption: "the resize into execute is so satisfying."
