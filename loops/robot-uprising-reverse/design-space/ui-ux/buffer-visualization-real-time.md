# 4.03 — The Buffer Visualization: How to Show a Unit's Working Memory in Real Time

The context window is the game's central resource. Every strategic decision the player makes — channel subscriptions, skill loadouts, rule ordering, perception radius tuning — ultimately manifests as data flowing through a fixed-size buffer. The buffer visualization is how the player **reads the consequences** of their design decisions during sealed watch and in the inspector.

This is not a secondary UI element. The buffer visualization IS the game's equivalent of a health bar, mana bar, and cooldown timer rolled into one. It tells you: is this unit thriving or drowning? Is it making decisions on good data or stale garbage? Is it about to overload and stun?

The locked spec establishes: "Context bars on each unit (tiny colored pips at bottom of tile showing context window fill)." This document explores every possible implementation of that requirement — from minimalist pips to rich animated micro-displays — and how each approach affects gameplay, readability, and emotional experience.

---

## The Design Problem

The buffer visualization must solve five simultaneous problems:

1. **At-a-glance health.** During sealed watch at 1s/tick, the player needs instant visual read on whether a unit is healthy, stressed, or about to stun. This must be parseable in under 200ms per unit.

2. **Multi-unit scanning.** The player may have 6-12 units on an 8x8 board. They need to scan ALL buffer states simultaneously, like a nurse checking monitors in an ICU. The visualization must support peripheral vision — you should be able to "feel" a unit going critical at the edge of your gaze.

3. **Data type legibility.** Not all buffer contents are equal. An observation (self-perceived) is different from a received signal (hook message), which is different from a processed output (compress/filter). Whether the player can distinguish data types during sealed watch or only in the inspector is a major design decision.

4. **Temporal dynamics.** The buffer is a flowing river, not a static pool. Data enters, ages, gets evicted. The visualization should convey this dynamism — the *rate* of change matters as much as the current state. A buffer that's been full for 10 ticks tells a different story than one that just filled this tick.

5. **Overload telegraphing.** Context overload (buffer full + new data → 1 tick stun) is the game's primary "damage" mechanic. The visualization must telegraph approaching overload BEFORE it happens, giving the player a moment of dread ("oh no, my relay is going to stun") even though they can't intervene.

---

## Paradigm 1: "The Thermometer" — Single Fill Bar

**What it is:** A single horizontal or vertical bar beneath (or beside) the unit sprite showing buffer fill percentage as a continuous gradient. No individual slot rendering. Just a smooth bar that fills up and changes color.

**Visual specification:**
- Horizontal bar, 24px wide × 3px tall, centered beneath the unit sprite on its tile
- Fill level: `occupied_slots / total_slots`, rendered as a filled portion from left to right
- Color gradient: 0-50% → cool cyan (#00d4ff), 50-75% → amber (#ffa500), 75-99% → red (#ff3333), 100% → pulsing white-red alternation
- Empty portion is dark charcoal (#1a1a2e) with a 1px darker border
- On eviction: a brief "bleed" animation — the left edge of the bar flickers red for 100ms, like data hemorrhaging out the old end
- On new data: the right edge brightens momentarily (white flash 50ms), then settles to the new fill level color
- On overload stun: the entire bar flashes white 3x rapidly (100ms on/off cycle), then collapses to a thin red line that pulses for the stun duration (1 tick)

**Sensory description:**
The scout crouches on its rice-terrace tile, cyan eye icon glinting. Beneath its feet, a thin bar glows tranquil blue — three of six slots occupied. The scout moves, perceiving two new enemies. The bar's right edge pulses white twice in quick succession as new observations enter. The fill creeps past the halfway mark, the bar's hue shifting from cyan toward a warm amber, like a mood ring responding to stress. Five ticks later, a relay floods the scout's channel with compressed signals. The bar lurches toward full — amber to orange to angry red in two ticks. The left edge begins flickering with tiny red bleeds as old observations evict. Then: full. The bar goes white, flashes three times like a dying fluorescent, and the scout's sprite jitters — stunned. The bar crumples into a thin pulsing red line. One agonizing tick passes. The bar reinflates to 75%, now amber again — the scout's auto-eviction compressed away the overflow. The scout resumes. You exhale.

**Strengths:**
- **Maximum readability at distance.** A color-changing bar is the fastest possible visual parse. Peripheral vision can distinguish "blue bar" from "red bar" instantly, even on the other side of the 8x8 board. This supports the ICU-scanning use case perfectly.
- **Tiny footprint.** At 24×3px, this visualization barely impacts the tile. The unit sprite remains dominant. The board stays clean.
- **Universal gaming literacy.** Every player who has ever seen a health bar understands this instantly. Zero learning curve for the bar itself — only the *meaning* of "full bar = bad" is inverted from typical games (full health = good; full buffer = danger). This inversion is itself a teaching moment.
- **Clean streaming.** Viewers immediately understand which units are stressed. The amber-to-red transition is universally parseable, even at low stream resolution.

**Weaknesses:**
- **No data type information.** The player cannot see WHAT is in the buffer — only HOW FULL it is. A buffer full of relevant enemy observations looks identical to one full of stale relay noise. The distinction between "usefully full" and "dangerously full" is invisible.
- **No slot granularity.** A 6-slot Scout at 4/6 looks the same as a 14-slot Command at 9/14 (both ~67% full). The player loses the visceral understanding that a Scout has precious few slots while a Command has headroom.
- **Eviction rate invisible.** The "bleed" animation helps, but a bar that's been steady at 75% for 20 ticks reads identically to one that's cycling rapidly (constant eviction + constant fill = steady level). The bar hides turbulence beneath apparent stability.
- **Overload telegraphing is coarse.** The bar goes red at 75%, but overload only happens at 100%. This leaves a 25% danger zone where the player knows "something is wrong" but can't gauge how close to stun they are. A 12-slot Relay at 10/12 (83%) and 12/12 (100%) are both "red" but strategically very different.

---

## Paradigm 2: "The Chip Rack" — Discrete Slot Pips

**What it is:** Each buffer slot is rendered as an individual tiny pip (2-3px square) arranged in a horizontal row beneath the unit sprite. Empty slots are dimmed. Occupied slots glow with a color indicating data type.

**Visual specification:**
- Row of N pips (N = buffer size: Scout 6, Relay 12, Command 14), each 3px × 3px with 1px gap
- Total width: Scout = 23px, Relay = 47px, Command = 55px (Commands may need a double-row: 7×2)
- Empty slot: dark charcoal (#1a1a2e), barely visible
- Occupied slot by data type:
  - Observation (self-perceived): green (#00ff88)
  - Hook message (received signal): blue (#3388ff)
  - Processed output (compress/filter): amber (#ffcc00)
  - Tagged data (high-priority/pinned): magenta (#ff44cc)
- Brightness: newly arrived data (this tick) glows at full luminance. Each subsequent tick, the pip dims 10% per tick, so a datum that's 5 ticks old is at 50% brightness. This creates a visual "age trail" — you can see data aging and fading as it approaches eviction.
- Leftmost pip = oldest slot (slot 0). When evicted, the pip briefly flashes red, then goes dark. All remaining pips shift left by one position over 100ms (a subtle "conveyor" animation showing data flowing through the buffer).
- When a new datum enters, the rightmost pip lights up from dark to its data-type color with a 50ms fade-in.
- Overload: when all N pips are lit and new data arrives, the leftmost pip flashes white → red → dark in rapid sequence (150ms total). If the overflow triggers a stun, ALL pips flash white simultaneously for 200ms, then the entire row goes to a rapid red pulse.

**Sensory description:**
The relay station hums on its jungle tile, its antenna sprite rotating slowly. Beneath it: twelve tiny squares, arrayed left to right like a miniature abacus. Seven are lit — five green (observations), two blue (messages from the scout channel) — glowing with varying brightness. The leftmost green pip is dim, almost invisible: that observation is 7 ticks old, about to age out naturally. The second pip is slightly brighter: 5 ticks. The pattern creates a visual wave — bright on the right where fresh data lives, dimming leftward toward oblivion.

A new tick fires. Two blue signals arrive from different scouts. The rightmost empty slots light up blue, bright as LEDs. The row is now at 9/12. Another tick: three more signals flood in. The relay was listening to too many channels. Three green pips on the left — the oldest observations — flash red in quick succession, POP POP POP, like arcade lights dying. They go dark. But the three new signals push in from the right: blue, blue, blue. The row reshuffles, the conveyor animation subtle but perceptible — everything moves one slot left over 100ms. The player sees it: the relay is churning. Fresh data is good, but it's coming at the cost of everything it previously knew.

Two ticks later: overload. All twelve pips are blazing. A thirteenth signal arrives. The leftmost pip — a dim green observation from 10 ticks ago — flashes white, then red, then dark. But there's no room. The relay's row of twelve goes simultaneously white. Lightning particles spray from the sprite. One tick of stillness. Then seven pips relight — the auto-eviction cleared the five oldest entries. The relay resumes, but the player saw it all happen pip by pip. They know exactly what was lost.

**Strengths:**
- **Data type legibility.** The player can see that a relay is full of blue signals vs. green observations vs. amber processed data. "My relay is drowning in raw observations and nobody's sending it signals" vs. "my relay has too many incoming signals" are visually distinct problems with different solutions.
- **Slot count is visceral.** A Scout's 6 tiny pips versus a Command's 14-pip double row makes buffer capacity a *felt* difference, not an abstract number. The player understands "Scout has barely any memory" in their gut.
- **Age visualization.** The brightness decay creates a temporal gradient: bright = fresh, dim = stale. An experienced player can glance at a relay's pip row and estimate the average age of its data, not just the fill level. This is strategic information — a relay operating on old data is making old decisions.
- **Eviction drama.** The per-pip eviction flash is the game's most important micro-animation. Each eviction is a tiny event — a piece of memory being destroyed. Over time, the player develops an emotional response to seeing pips flash red. "My scout is bleeding data" becomes a felt experience, not a stat.
- **Conveyor animation teaches the buffer model.** The leftward shift animation literally shows the FIFO queue in action. New data enters right, flows left, falls off the edge. The player doesn't need to read documentation — the animation IS the tutorial.

**Weaknesses:**
- **Scaling problems.** A Command unit's 14 pips at 3px each with 1px gaps = 55px wide. On an isometric tile that might be 48-64px wide at standard zoom, this either overflows or requires a second row. A double row (7×2) is readable but adds visual complexity.
- **Color palette conflict.** Green, blue, amber, and magenta pips on varied terrain backgrounds (green rice terraces, brown jungle, gray urban) will have contrast problems. Green observations on green terrain tiles will be invisible without careful outline or glow treatment.
- **Dense boards are noisy.** With 10+ units on an 8x8 board, each displaying 6-14 colored pips, the lower portion of every tile becomes a tiny LED panel. The cumulative effect could make the board feel cluttered, especially during high-activity ticks when multiple units are simultaneously receiving and evicting data.
- **Peripheral parsing is harder.** Unlike the thermometer's "just check the color," reading pips requires slightly more focused attention. You can tell "mostly lit" from "mostly dark" peripherally, but distinguishing "7/12 blue" from "8/12 green" requires direct gaze.

---

## Paradigm 3: "The Ring Gauge" — Circular Buffer Display

**What it is:** A circular ring around (or beneath) the unit sprite, where each buffer slot is an arc segment of the ring. The ring fills clockwise as slots fill, with color indicating data type and brightness indicating age.

**Visual specification:**
- Circular ring, outer radius 16px, inner radius 12px (4px thick ring), centered on the unit sprite
- Ring divided into N equal arc segments (one per buffer slot)
- Newest data enters at 12 o'clock, fills clockwise. Oldest data is at the 11 o'clock position (about to evict)
- Slot coloring and brightness identical to the Chip Rack paradigm
- Empty segments: translucent dark (#1a1a2e at 30% opacity) — nearly invisible but just perceptible
- On eviction: the 11 o'clock segment flashes red and shrinks to nothing over 100ms, then all segments rotate clockwise by one position (the "clock tick" animation)
- On overload: the ring pulses outward (radius expands 2px, contracts back) three times rapidly, then fractures — the segments separate with 2px gaps, glow white, and the unit stun animation plays

**Sensory description:**
The striker advances across the cyberpunk rooftop, its orange sword icon stark against gray tiles. Around it: a faint circular halo, divided into eight arc segments like a clock face with no hands. Five segments glow — three green arcs (observations of nearby enemies), two blue arcs (relayed coordinates from the scout network). The newest blue arc at twelve o'clock blazes bright; the oldest green arc near eleven o'clock has dimmed to a whisper. The ring turns the unit into a little compass of awareness: you can see what direction the unit's attention is weighted toward just by which segments are brightest.

A massive tick: four new signals arrive simultaneously. The ring spins — arcs rotate clockwise as old data evicts from the eleven o'clock position. The eviction segments flash red and vanish as fresh blue arcs ignite at noon. The ring is now seven of eight. One more signal and it's full. The player watches the next tick with held breath. One observation enters — from the striker's own narrow perception radius. The ring completes. Eight arcs, all lit. The striker's ring bloats outward in a rapid pulse — once, twice, three times — then the arcs separate with tiny gaps and flash white. Overload. The striker stands paralyzed for one tick, its ring fractured. Then the segments snap back together, five arcs still glowing. Recovery. But the player saw the ring shatter and felt it in their chest.

**Strengths:**
- **Aesthetically distinctive.** No other game uses circular slot-level buffer rings on units. This creates a strong visual identity — screenshots of Robot Uprising would be instantly recognizable. "The game with the rings around the robots."
- **360-degree information density.** The ring packs N slots into a small circular footprint without the horizontal space problem of the Chip Rack. A 14-slot Command ring and a 6-slot Scout ring occupy the same screen space — the Command just has more, thinner segments.
- **Overload animation is spectacular.** A ring shattering into fragments is viscerally powerful. It's also very shareable — the TikTok clip of six units' rings shattering simultaneously is dramatic.
- **Spatial metaphor.** The clockwise flow naturally maps to "time" — newest at the top, flowing around to oldest at the bottom-left. This is more intuitive than left-to-right for many players.

**Weaknesses:**
- **Occludes the unit sprite.** The ring overlaps the unit's visual footprint. On a 48-64px isometric tile, a 32px diameter ring centered on the unit covers a significant portion of the sprite. This makes unit identification harder, especially when the ring is brightly lit (high fill) — the very moment you need to know WHICH unit is stressed.
- **Segment distinction at small sizes.** Dividing a 32px diameter circle into 14 arc segments gives each segment roughly 7px of arc length. At typical screen resolution, distinguishing individual segment colors requires zoom or direct mouse hover. The ring degrades into "colored donut" at board overview zoom levels.
- **Animation complexity.** The clockwise rotation, segment coloring, eviction flash, and fracture animation are significantly more complex to render in Pixi.js than horizontal bars. This matters for performance with 12+ units, each animating independently every tick.
- **No clear "oldest" signal at a glance.** Unlike the Chip Rack (leftmost pip is always oldest) or the Thermometer (left edge is always the eviction point), the ring's oldest segment rotates as data cycles through. After several ticks, the oldest slot might be at 2 o'clock or 4 o'clock — the player can't just "look left" to check for imminent eviction.

---

## Paradigm 4: "The Heartbeat" — Oscilloscope Line

**What it is:** A continuous waveform line above or below the unit, like a vital signs monitor. The line's height encodes buffer fill, its frequency encodes data throughput rate, and its color encodes stress level. Think: ICU monitor strapped to a robot.

**Visual specification:**
- Waveform display: 32px wide × 8px tall, positioned above the unit sprite (above, not below — less occluded by adjacent tiles in isometric view)
- The line is a continuous curve, updated each tick:
  - Y-axis: buffer fill percentage (bottom = empty, top = full)
  - X-axis: last 8 ticks of history (scrolling left, newest on right)
  - Each tick adds a new data point and shifts the line left
- Line color: cyan when fill < 50%, amber 50-75%, red > 75%, pulsing white at 100%
- Line thickness: 1px normally, thickens to 2px when fill > 75% (heavier line = heavier load)
- Background: semi-transparent dark panel (#0a0a14 at 60% opacity), rounded corners, subtle glow matching line color
- When buffer fill spikes (>3 slots filled in one tick), the line shows a sharp upward peak — a visible "spike" in the waveform
- When overload occurs: the line flatlines at the top of the display and pulses red. A tiny "×" appears where the overload event happened.
- Subtle beep sound effect (optional, toggle-able): a soft ping each tick whose pitch corresponds to fill level. Low fill = low mellow tone. High fill = high-pitched whine. Overload = a sharp electronic screech that cuts through all other sound.

**Sensory description:**
The command unit sits in the center of the Manila megacity board, its gold crown icon surveying the battlefield. Above it, a small dark rectangle hovers like a thought bubble. Inside: a thin cyan line traces a gentle wave — the command's 14-slot buffer is at 6/14, comfortable, the line undulating mildly with each tick as observations drift in and age out. The waveform scrolls left, a cardiac monitor for artificial cognition.

Suddenly, three scouts report simultaneously. The line spikes — a sharp peak shoots upward, the cyan shifting to amber as the buffer jumps from 6/14 to 11/14 in one tick. The waveform shows the history: the gentle plateau, then the dramatic spike. The player's eyes snap to the command unit — that spike was visible from across the board, a visual alarm bell. The line settles at the elevated level, now amber, pulsing gently. Another tick: two more messages. The line creeps higher, amber to red. The waveform shows a rising trend line — each tick point higher than the last. The player can SEE the trajectory: at this rate, overload in 2 ticks. They can't intervene — sealed watch — but they can brace.

Overload. The line hits the ceiling and flatlines. A tiny red × marks the moment. The electronic screech cuts through the battle ambience. One tick of silence. Then the line drops as the auto-eviction clears old data — a sharp valley after the peak. The waveform now shows the entire drama: plateau → spike → rise → flatline → drop. A diagnostic story told in 32 pixels.

**Strengths:**
- **Temporal history is built in.** Unlike all other paradigms which show only current state, the Heartbeat shows 8 ticks of history directly on the unit. The player can see trends: "filling up," "steady state," "just recovered from overload." This is diagnostic information that other paradigms only provide in the Inspector.
- **Spike detection.** Sudden buffer influxes are visually dramatic — a sharp peak in the waveform. This is far more visible at a glance than a bar changing from "half full" to "mostly full." Humans are wired to notice sudden changes, and the waveform exploits this.
- **Medical/monitoring metaphor.** The ICU monitor aesthetic fits the game's theme perfectly — you're watching autonomous robots' vital signs. It also creates a strong emotional resonance: the flatline-at-overload is immediately understood as "this unit is in trouble," borrowing from decades of medical drama visual literacy.
- **Sound design opportunity.** The pitch-mapped beep creates an audio layer that works even when the player isn't looking at a specific unit. A high-pitched whine from the board's edge tells the player "something over there is about to stun" without requiring visual scan.

**Weaknesses:**
- **Screen space.** A 32×8px display above every unit is a lot of overlay. With 12 units on an 8x8 board, the waveforms could obscure terrain, other units' waveforms, or signal chain lines. The floating-panel aesthetic may clash with the Into the Breach pixel-art clarity.
- **Information overload irony.** A buffer visualization about information overload that itself adds information overload is a design failure. The Heartbeat risks exactly this — too much data per unit, making the board unreadable in aggregate.
- **No data type information.** Like the Thermometer, the Heartbeat shows fill level and dynamics but not WHAT is in the buffer. A spike of observations and a spike of hook messages look identical in the waveform.
- **Not pixel-art native.** Smooth waveform curves require anti-aliased rendering that may clash with the game's isometric pixel art style. The rounded panels and curved lines exist in a different visual register than the crisp pixel sprites.

---

## Paradigm 5: "The Inbox Stack" — Vertical Data Pile

**What it is:** A small vertical stack of colored rectangles beside or behind the unit, growing upward as the buffer fills — like a stack of papers in an inbox. Each rectangle is one buffer slot. When full, the stack visibly overflows.

**Visual specification:**
- Stack position: directly behind the unit sprite (offset 4px up and 4px right in isometric space), so it peeks out behind the unit like a stack on a desk
- Each slot: a 12px × 2px colored rectangle
- Stack grows from bottom (oldest, slot 0) to top (newest, slot N-1)
- Colors match Chip Rack: green observations, blue messages, amber processed, magenta tagged
- Empty slots: not rendered (stack only shows occupied slots, so height = visual fill)
- When new data arrives: a new rectangle slides in from the right and lands on top with a tiny "plop" animation (1px overshoot, settle back)
- When data evicts (from bottom): the bottom rectangle slides left and fades to nothing over 100ms. The entire stack drops down 2px (gravity animation, 50ms)
- At 75%+ fill: the stack begins to wobble — each new addition makes it sway slightly left and right for 200ms, like a Jenga tower getting unsteady
- At 100%: the stack crumbles — all rectangles scatter in a brief 200ms particle burst, then reassemble at the post-eviction fill level
- Overload stun: the stack collapse is more dramatic — rectangles fly upward like an explosion, the unit stun animation plays, then rectangles rain back down over the stun tick duration

**Sensory description:**
The scout darts between terrace tiles, its cyan eye sharp in the humid air. Behind it, barely visible behind the sprite, a tiny stack of colored bars peeks out — three green rectangles, neatly stacked like miniature Post-It notes. The scout perceives a new enemy. A fourth green rectangle zips in from the right and PLOPS onto the stack with a satisfying micro-bounce. The stack is four tall now, still sturdy.

The scout enters a crowded zone. Enemies everywhere. Observations flood in — green rectangles pile on, the stack growing tick by tick. At five of six slots, the stack begins to wobble. Each new arrival makes the whole pile sway like a drunken waiter's tray. The player watches, tense. One more and...

A hook message arrives (blue rectangle) at the same tick as two more observations. The stack can't hold them all. The bottom rectangle — the oldest green observation — slides left and vanishes. The stack drops 2px with a tiny gravity settle. But two more are coming in. The pile shivers. Full. The stack wobbles violently and then — BURST. The six colored rectangles scatter like confetti. The scout's sprite jitters. Stunned. One beat of stillness. Then the rectangles drift back down, reassembling — but only four land. Two were evicted forever. The scout recovers, its inbox a little lighter.

**Strengths:**
- **Physicality.** The stacking metaphor makes the buffer TANGIBLE. Data isn't an abstract fill level — it's a pile of things with weight and precariousness. The wobble animation at high fill is immediately communicative: "this pile is about to topple." This exploits physics intuition that all players share.
- **Stack height as instant read.** Tall stack = full buffer. The height is readable from across the board, similar to the Thermometer but with the added expressiveness of individual slot rendering.
- **Eviction has gravity.** The bottom-drops-out animation with the gravity settle makes FIFO eviction physically intuitive: old stuff falls off the bottom, everything above drops down. This is an extremely natural visualization of the buffer model.
- **The crumble animation is memorable.** When six robots' inbox stacks simultaneously scatter in a coordinated overload event, it's visually spectacular. The "paper explosion" is shareable, distinctive, and viscerally communicates "everything fell apart."

**Weaknesses:**
- **Isometric depth confusion.** Placing the stack "behind" the unit in isometric space means it occupies visual real estate that might overlap with units on adjacent tiles. On a dense 8x8 board, stacks from units on adjacent rows could visually merge or conflict.
- **Vertical space competition.** The stack grows upward, but in isometric view, "up" on screen is also "deeper" on the board. A tall stack on a unit in the front row could visually overlap with terrain or units in the row behind it.
- **Small rectangles at distance.** 12×2px rectangles are effectively invisible at lower zoom levels. The stacking metaphor works beautifully at close zoom but degrades to "colored smudge behind the unit" at board-overview zoom.
- **Animation budget.** Per-slot physics (wobble, scatter, gravity) for 12+ units simultaneously is computationally expensive. On lower-end hardware, animation frame rate could degrade during high-activity ticks when multiple units are simultaneously receiving, evicting, and stacking.

---

## Paradigm 6: "The Light Panel" — Glowing Grid Behind the Unit

**What it is:** A small rectangular grid of light cells behind or beneath the unit, where each cell represents one buffer slot. The grid fills from top-left to bottom-right (reading order), creating a visual panel of lights like an LED matrix status board.

**Visual specification:**
- Grid dimensions adapt to buffer size:
  - Scout (6): 3×2 grid
  - Striker (8): 4×2 grid
  - Specialist (10): 5×2 grid
  - Relay (12): 4×3 grid
  - Command (14): 7×2 grid
- Each cell: 4×4px with 1px gap
- Position: centered directly beneath the unit sprite, flush against the tile bottom
- Cell states: dark (empty), colored by data type (same palette as Chip Rack), with brightness encoding age
- Fill order: left-to-right, top-to-bottom. Slot 0 = top-left, slot N-1 = bottom-right
- Eviction animation: top-left cell blinks red and goes dark; all lit cells "shift" positions (cascade animation: each cell briefly brightens as data "flows" through it, 50ms per cell, creating a ripple from left to right that takes 150-300ms total)
- Overload: all cells flash white simultaneously, then half go dark (eviction recovery)
- **Key detail: the grid creates a recognizable "shape" per unit type.** A 3×2 Scout grid and a 4×3 Relay grid are immediately visually distinct shapes. Players learn to associate grid shapes with unit types, reinforcing the buffer-capacity-per-type understanding without reading numbers.

**Sensory description:**
The battlefield is the Cebu urban grid. Chrome and neon. A relay sits at a network junction, its dish antenna pointing skyward. Beneath it, a 4×3 grid of tiny cells — an LED panel like the indicator lights on a network switch. Eight of twelve cells glow: five green, three blue, arranged in reading order. The top row: green, green, green, green. The second row: green, blue, blue, blue. Third row: dark, dark, dark, dark — empty slots. The panel tells a story: the relay perceived things first (green, older, top rows) and then started receiving signals (blue, newer, second row).

A flood of data: the relay receives six signals in rapid succession across multiple channels. The bottom row lights up in a cascade — blue, blue, blue, blue, left to right over 200ms, like a loading bar completing. All twelve cells are now lit. The panel looks like a fully-powered status board: twelve tiny lights, all blazing. Then one more signal arrives. The top-left cell — the oldest green observation — blinks red once and goes dark. A cascade ripple flows across the panel, each cell brightening briefly in sequence, like a wave of current through a circuit. The data has shifted. The panel is still twelve lit cells, but the pattern has changed: the oldest observation was replaced by the newest signal.

**Strengths:**
- **Shape as identity.** The grid dimensions double as a unit-type identifier. After a few missions, players recognize the 3×2 shape as "scout" and the 4×3 shape as "relay" even without looking at the unit sprite. This is unique among all paradigms — none other create a per-type visual identity from the buffer itself.
- **Two-dimensional layout supports pattern recognition.** A 4×3 grid with the top rows green and bottom row blue immediately communicates "observations older than messages" — a spatial pattern that a 1D bar or pip row can't convey as quickly.
- **LED matrix aesthetic.** The glowing grid beneath each unit evokes server rack indicator lights, network switch status panels, and data center monitoring. This directly supports the "you're managing an information architecture" theme.
- **Moderate footprint.** The grid sits flush against the tile bottom, not floating above (like Heartbeat) or behind (like Inbox Stack). It occupies a defined rectangle that doesn't overlap into adjacent tile space.

**Weaknesses:**
- **Fill order is arbitrary.** "Left-to-right, top-to-bottom" reading order is intuitive for text but arbitrary for buffer data. There's no inherent reason slot 4 should be at position (0,1) vs. (1,0). The mapping is learnable but not self-evident.
- **Grid overflow.** A 14-slot Command grid at 7×2 is 35px × 9px — wider than some tile widths at default zoom. The grid may need to scale with zoom level, adding rendering complexity.
- **Cascade animation cost.** The per-cell ripple animation for 12+ units simultaneously is expensive. Each cell must independently animate during a cascade, and with ticks arriving every 1s, animations from the previous tick must complete before the next tick's animations begin. At 2x speed (0.5s ticks), the cascade animation (300ms) would barely complete.
- **Color contrast on isometric tiles.** 4×4px colored cells on varied terrain backgrounds will have contrast issues. The semi-transparent dark background of each grid cell helps, but on dark terrain (jungle canopy, urban shadows), the empty cells might be invisible.

---

## Paradigm 7: "The Dual Display" — Hybrid Thermometer + Pips on Hover/Proximity

**What it is:** A two-tier system. At board-overview level, every unit shows a simple Thermometer bar (Paradigm 1). When the player hovers their mouse near a unit (within ~100px in screen space) OR when the camera is zoomed in beyond a threshold, the Thermometer smoothly transitions into the Chip Rack (Paradigm 2), revealing individual slot data.

This isn't a separate paradigm so much as a **Level of Detail (LOD) system** for buffer visualization — the same approach used in 3D rendering, applied to UI elements.

**Visual specification:**
- **Far mode (default / board overview):** Thermometer bar (24×3px, color gradient, no slots)
- **Near mode (hover / zoom):** Chip Rack pips (N × 3×3px, colored by data type, brightness = age)
- **Transition:** 200ms crossfade. The Thermometer bar "splits" into individual pips like a caterpillar becoming segmented — the smooth bar visually partitions into N sections, the sections separate with 1px gaps, and the per-slot coloring fades in. On zoom-out, the reverse: pips merge back into a smooth bar.
- **Hover proximity:** The "near" trigger is based on cursor distance, not click. Moving the cursor across the board creates a "spotlight" effect — units near the cursor show detailed pips, units far away show summary bars. The entire board dynamically shifts between detail levels based on cursor position.
- **Lock mode (Right-click):** Right-clicking a unit during sealed watch locks it into "near" mode regardless of cursor position, keeping its pips always visible. A small lock icon (🔒) appears next to the unit. Up to 3 units can be locked simultaneously.

**Sensory description:**
The board overview shows the full 8x8 grid. Twelve units are deployed, each with a tiny colored bar at their feet — a fleet of miniature thermometers. At a glance: three bars are blue (healthy), five amber (moderate), two red (critical), two dark (empty). The player's eyes are drawn to the red bars — something is wrong at positions D4 and F7.

The player moves their cursor toward D4. As the cursor approaches, the red bar at D4 begins to shimmer — then splits, like a cell dividing. The smooth bar segments into eight distinct pips: green, green, blue, blue, blue, blue, amber, amber. The transition takes 200ms but feels organic, like looking through a magnifying glass. The player can now see: the striker at D4 has a buffer full of blue signals but almost no observations. It's receiving tons of relayed data but can't see anything nearby with its own eyes — it's operating blind, relying entirely on external intelligence. That's the problem. Too many signals, not enough direct perception.

Meanwhile, the units farther from the cursor retain their summary bars. The amber bars at the board's edges pulse gently, their simple fill-level display sufficient for peripheral monitoring. The player right-clicks the relay at E5 — a tiny lock icon appears, and E5's bar splits into its twelve pips permanently, even as the cursor moves away. Now the player has D4 (cursor-near) and E5 (locked) showing full detail while the rest of the board stays clean.

**Strengths:**
- **Best of both worlds.** Solves the fundamental tension between at-a-glance scanning (Thermometer) and data-type granularity (Chip Rack). The player gets instant board-level health monitoring with the ability to drill into any unit without leaving the sealed watch.
- **The magnifying glass feel.** The cursor-proximity LOD creates a "flashlight of attention" metaphor that mirrors the game's theme: you have limited attention, and where you focus determines what you see. The player is experiencing the buffer problem themselves — they can't monitor everything in detail simultaneously.
- **Lock mode for repeated inspection.** Right-click locking lets the player mark 2-3 "problem units" for continuous detailed monitoring. This creates a mini-dashboard within the sealed watch, personalized per-run based on what the player is worried about.
- **Scales perfectly.** 5 units on board? Pips everywhere, no problem. 15 units? Summary bars prevent visual noise, with detail on demand.

**Weaknesses:**
- **Sealed watch is hands-off.** The locked spec says "No skip, no pause, no tools — not even on retry." If "no tools" means no mouse interaction at all, the proximity/hover system doesn't work during sealed watch. The LOD would only function in the Inspector. However, "no tools" could reasonably be interpreted as "no tools that affect the simulation" — passive observation (hover for detail) isn't intervention.
- **Transition animation is complex.** Smooth bar-to-pips crossfade requires careful interpolation — each pip must emerge from the correct position within the bar, colored correctly. This is a non-trivial animation system.
- **Cognitive context switching.** When the cursor moves and bars transition between detail levels, the player's mental model must switch between "fill level" and "data type" processing modes. This context switching may reduce, rather than enhance, readability during fast-paced sealed watch moments.

---

## Player Journeys

### Journey: Lia, 16, First-Time Gamer

**Context:** Mission 1 (Ifugao rice terraces), pre-placed scout and relay. Lia has never played a strategy game. She just configured her scout's channel subscription per the boot log tutorial and pressed EXECUTE for the first time.

**Minute 0:00 — The First Watch**
Lia stares at the screen. The isometric rice terraces glow green. Two small robot sprites stand on the grid — the cyan-eyed scout and the dish-antenna relay. She notices tiny colored indicators beneath each one. The scout has a short bar with three faint green marks (observations). The relay has a longer bar, mostly dark (empty buffer).

*With Thermometer:* Lia sees a thin blue-green line under the scout. It means nothing to her yet. She watches the scout move. The bar grows slightly longer. She doesn't understand why.

*With Chip Rack:* Lia sees six tiny dots under the scout, three glowing green. She counts them — "it can hold six things and has three." The green color means nothing yet, but the ratio is immediately intuitive. When a new dot lights up, she connects: "it saw something."

*With Heartbeat:* Lia sees a wiggly line above the scout. It looks like a heart monitor from a hospital show. She intuitively understands "flat = calm, spiky = stressed" even without understanding what "buffer" means.

**Minute 0:30 — The First Eviction**
The scout enters an area with multiple enemies. Its buffer fills quickly. In the Chip Rack paradigm, Lia watches the dots light up one by one: green, green, green, green, green — five of six. Then a sixth green pip appears. Full. On the next tick, a blue signal arrives from the relay. The leftmost green pip blinks red and disappears. A new blue pip appears on the right.

*Lia's reaction:* "Oh! It forgot the first thing it saw to make room for the new message!" She gets it. The visualization taught her the buffer model in 3 seconds.

*With Thermometer:* The bar hits red. Lia knows "red = bad" but doesn't understand WHY. The eviction is invisible — the bar stays full. She doesn't learn FIFO; she just learns "full = danger."

**Minute 1:00 — The First Overload**
The scout receives three signals in one tick with no room. All pips flash white. The scout sprite jitters. Lia gasps — "it broke!" The pips partially relight. The scout recovers. Lia has a visceral memory of "too many things happening at once = robot freezes." She now has a reason to care about buffer management.

**Resolution:** Lia enters the inspector. She clicks the scout. She sees the buffer slots at each tick, scrollable. The visualization paradigm used during sealed watch is echoed in the inspector but at full detail — each slot showing the actual data content, not just a colored pip. She traces the overload moment: "Oh, three signals arrived when there was only one slot free." She now understands the problem and returns to the Plan screen to reduce the scout's channel subscriptions.

---

### Journey: Marcus, 34, Factorio Veteran (800+ hours)

**Context:** Mission 7 (Mindanao jungle). Marcus has a 6-unit army with a command agent, two relays, two strikers, and a scout. He's running a sophisticated relay compression chain. He's about to execute a configuration he spent 15 minutes tuning.

**Minute 0:00 — The Diagnostic Scan**
Marcus presses EXECUTE. His eyes don't follow any single unit — instead, he does an ICU scan of all six buffer indicators simultaneously. He's looking for the *pattern*: which units are filling up, which are empty, whether the fill rates match his expectations.

*With Thermometer:* Marcus glances across six colored bars. "Scout: amber, Relay-A: blue, Relay-B: blue, Striker-1: green, Striker-2: green, Command: amber." The two ambers worry him — scout and command are both moderately full. He expected the command to be fuller (it listens to everything) but the scout shouldn't be this stressed. He flags it mentally.

*With Chip Rack:* Marcus sees pip details without needing to hover. The scout's 6 pips are: green, green, green, blue, blue, blue — three observations, three relay messages. He frowns: "Why is the scout receiving three messages? The relay should only be sending compressed outputs, which should be one datum per tick, not three." He's spotted a configuration error — he accidentally subscribed the scout to the raw data channel instead of the compressed channel. He can't fix it now, but he knows what to look for in the inspector.

*With Dual Display:* Marcus right-clicks the scout and the command to lock them into pip view. The rest of the army shows summary bars. He's created a custom monitoring dashboard for this run's key concern points.

**Minute 1:30 — The Cascade Failure**
An enemy swarm appears. Marcus watches the relays absorb a wave of data. Relay-A's buffer fills to 10/12. Relay-B fills to 9/12. Both are processing and forwarding. Then the command agent — listening on both relay output channels — receives 6 messages in one tick.

*With Chip Rack:* Marcus watches the command's 14 pips. Before: 9/14 occupied. After the flood: the rightmost 5 empty slots fill up with blue pips in rapid succession — 14/14. Full. Next tick: 4 more messages arrive. The command's leftmost pips start flashing red — POP POP POP POP. Four evictions. But the evicted data included critical scout coordinates from 8 ticks ago. The command's next decision is based on stale data. Marcus can see this happening in real time because the pips that evicted were dim (old) but strategically important (they were the only observation-type data in the command's buffer).

*With Thermometer:* Marcus sees the command bar hit red and start pulsing. He knows it's full but doesn't know what's being lost. The bar tells him "problem" but not "what kind of problem." He'll have to wait for the inspector.

**Minute 3:00 — The Recovery Read**
The crisis passes. Marcus's army lost one striker to a stun-lock (three consecutive overloads due to the scout-on-wrong-channel bug). In the inspector, Marcus traces the failure:

1. Scout was on raw channel, receiving 3 messages/tick instead of 1
2. Scout's observations were being evicted to make room for redundant messages
3. Scout sent degraded intelligence to relays
4. Relays forwarded degraded data to command
5. Command made decisions on stale data
6. Striker-1 moved to wrong position based on command's stale data
7. Striker-1 overloaded from sudden proximity to enemy noise generator

The buffer visualization paradigm used during sealed watch determined how much of this chain Marcus could diagnose IN REAL TIME vs. needing the inspector. The Chip Rack let him spot step 1 during the watch. The Thermometer would have only shown him step 7 (the final overload).

---

### Journey: Dani, 28, Twitch Streamer (1,200 average viewers)

**Context:** Dani is streaming a Gauntlet match against a top-10 opponent. Chat is active. The sealed watch is about to begin.

**Minute 0:00 — The Commentary Setup**
Dani presses EXECUTE. The sealed watch begins. Chat spams emotes.

*With Thermometer:* "Okay chat, look at the bars. My relay — that's the blue one — it's chilling, buffer's green. Scout is amber already, which is... not great. Let's see if it holds." The simple color language translates directly to commentary. Dani can narrate every unit's state in one sentence. Chat understands immediately.

*With Chip Rack:* "Look at my relay — bottom pips, see the colors? Three green observations, two blue signals, all bright because they just arrived. My relay is cooking." The detail is rich but takes longer to explain. Chat asks "what do the colors mean?" — this is a recurring question in Dani's stream.

*With Heartbeat:* "Oh! See that spike? My scout just got FLOODED. Look at the heartbeat — it was flat and then BAM, straight up. If it flatlines we're cooked." This is the most naturally dramatic paradigm for streaming. The medical metaphor creates tension that chat can follow without understanding the underlying mechanics.

**Minute 1:00 — The Chat Moment**
An enemy noise generator forces three of Dani's units into simultaneous overload.

*With Thermometer:* Three bars flash white simultaneously. Clean visual moment. Dani screams. Chat goes "GGGGGG." The clip is 2 seconds long: three bars flashing white, three robots jittering.

*With Chip Rack:* Twelve pips on one unit, eight on another, six on a third — all flash white simultaneously. It's visually dramatic but harder to parse at stream resolution (720p). The pips are very small on screen. Chat can tell SOMETHING happened but the detail is lost.

*With Ring Gauge:* Three rings shatter simultaneously. Fragments spray outward from three units. This is the single most visually dramatic option. The clip goes viral. Chat spams the ring-shatter emote (which Dani had custom-made after the first time it happened on stream). "THREE RINGS SHATTERED chat, THREE. I'm so cooked."

*With Heartbeat:* Three waveforms flatline simultaneously. The electronic screech sounds three times in rapid succession. It literally sounds like a hospital scene. Chat types "CALL THE AMBULANCE." The audio moment is as powerful as the visual.

---

### Journey: Amir, 42, Accessibility Needs (Red-Green Color Blindness)

**Context:** Amir has deuteranopia (red-green color blindness, affecting ~8% of males). He's playing Mission 3 with the default color scheme.

**The Problem:**
The Chip Rack and Light Panel paradigms encode data type as green (observations) vs. blue (messages). For Amir, green and blue are distinguishable. But the Thermometer and Heartbeat use a green→amber→red gradient where the green-to-amber transition is nearly invisible to him. He can see "not red" and "red" but can't distinguish the 0-50% and 50-75% ranges.

**Accessible alternatives for each paradigm:**

- **Thermometer:** Replace color gradient with luminance gradient. 0% = dim, 50% = medium, 100% = bright pulsing. Add a shape change: at 75%, the bar develops a serrated/jagged top edge. At 100%, it becomes a thick pulsing line. Color becomes a supplementary signal, not the primary one.

- **Chip Rack:** Use shape coding in addition to color. Observations = circles, messages = squares, processed = triangles, tagged = diamonds. At 3px, shapes are barely distinguishable, but at the Light Panel's 4px or the Inspector's full-size view, shapes are readable.

- **Ring Gauge:** Add pattern fill. Observations = solid, messages = hatched, processed = dotted. The pattern is subtle but distinguishable even without color.

- **Heartbeat:** Add a numerical readout: "8/12" in tiny text below the waveform. The number is always accessible regardless of color perception.

- **All paradigms:** Offer a "colorblind mode" in settings that replaces the green→amber→red gradient with blue→yellow→white, which is safe for all common forms of color blindness (protanopia, deuteranopia, tritanopia).

---

## Interaction Effects

### Buffer Visualization × Building Block Paradigm
- If the player uses a **card-based deckbuilding** approach to configure agents, the buffer should echo the card metaphor — the Inbox Stack paradigm naturally pairs with deckbuilding (data as "cards" in a "hand").
- If the player uses a **mixing board** approach (sliders and dials), the Heartbeat waveform pairs well — both use continuous graphical representations rather than discrete slots.
- The locked **loadout-style blueprint editor** with discrete slot limits pairs most naturally with the **Chip Rack** or **Light Panel** — both show discrete slots, creating a visual echo between "the slots you configured in the editor" and "the slots running in real time."

### Buffer Visualization × Sealed Watch Philosophy
- The **Fishbowl approach** (Approach A in execute-phase analysis) pairs with Thermometer — minimal information, maximum cinema.
- The **Mission Control approach** (Approach B) pairs with Chip Rack or Light Panel — more information density matching the sidebar telemetry aesthetic.
- The Heartbeat inherently creates a **third approach**: the waveform IS the sidebar, except it's on every unit instead of in a side panel.

### Buffer Visualization × Inspector Design
- Whatever paradigm is used during sealed watch should be **echoed but expanded** in the inspector. If sealed watch uses Chip Rack pips, the inspector should show full-size slot rectangles with the same colors, plus detailed content.
- The Dual Display paradigm creates the smoothest sealed-watch-to-inspector transition: the player already learned to "zoom in for detail" during the watch; the inspector is just a permanent zoom.

### Buffer Visualization × Streaming/Viral Clips
- **Ring Gauge** produces the most dramatic clip moments (ring shatter).
- **Heartbeat** produces the best audio clips (flatline screech).
- **Thermometer** produces the most readable clips at any resolution.
- **Chip Rack** produces the most informationally rich clips for the "study this replay" community.

---

## Comparable Games

| Game | Visualization | What It Shows | Relevance |
|------|---------------|---------------|-----------|
| **Into the Breach** | HP pips on each unit | Small discrete dots (1-7 HP) beneath unit sprites | Direct ancestor. Into the Breach proves that 3-7 tiny dots beneath isometric units are readable. Robot Uprising can use the same spatial language. |
| **Cogmind** | Component integrity bars | Each attached component has a small colored bar showing durability | Shows that per-component status indicators on individual units work even in complex roguelikes. Cogmind has 10+ components per unit, each with its own bar. |
| **StarCraft** | Health/shield bars | Green bar (health) + blue bar (shield) floating above each unit | The universal RTS reference. Simple, readable, universally understood. But only shows ONE resource (health), not the multi-typed data problem Robot Uprising has. |
| **Slay the Spire** | Card draw pile / discard pile counters | Numbers showing cards remaining in draw and discard | Shows that discrete counts ("3 cards remaining") are sufficient for deck management. The buffer is a different kind of "hand." |
| **Oxygen Not Included** | Resource meters on buildings | Small meters showing oxygen, water, power levels per building | Multiple resource types per object, each with a different colored meter. Proves multi-resource micro-visualization works in management sims. |
| **Dwarf Fortress** | Thoughts/mood indicator | Colored face icon showing dwarf mental state | Compresses complex internal state (100+ thought/mood values) into a single colored icon. The ultimate "thermometer" approach — sacrifice granularity for instant readability. |
| **Factorio** | Belt fullness | Visual item density on conveyor belts | Shows throughput rate visually. A full belt looks different from an empty belt, and a belt with intermittent items shows irregular flow. The Heartbeat paradigm echoes this — showing not just level but rate. |

---

## Recommendation Matrix

| Criterion | Thermometer | Chip Rack | Ring Gauge | Heartbeat | Inbox Stack | Light Panel | Dual Display |
|-----------|-------------|-----------|------------|-----------|-------------|-------------|--------------|
| At-a-glance readability | ★★★★★ | ★★★ | ★★★ | ★★★★ | ★★★ | ★★★ | ★★★★★ |
| Data type legibility | ★ | ★★★★★ | ★★★★ | ★ | ★★★★★ | ★★★★★ | ★★★★ |
| Temporal dynamics | ★ | ★★ | ★★ | ★★★★★ | ★★★ | ★★ | ★★ |
| Overload drama | ★★★ | ★★★★ | ★★★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★★ |
| Screen space efficiency | ★★★★★ | ★★★ | ★★★ | ★★ | ★★ | ★★★ | ★★★★★ |
| Pixel art compatibility | ★★★★★ | ★★★★ | ★★★ | ★★ | ★★★★ | ★★★★★ | ★★★★ |
| Streaming clarity | ★★★★★ | ★★ | ★★★★ | ★★★★ | ★★★ | ★★★ | ★★★★ |
| Accessibility | ★★ | ★★★ | ★★ | ★★★ | ★★★★ | ★★★ | ★★★★ |
| Performance cost | ★★★★★ | ★★★★ | ★★★ | ★★★★ | ★★ | ★★★★ | ★★★★ |
| Tutorial-free learnability | ★★★★★ | ★★★★ | ★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★★ |

---

## The TikTok Clip Test

**Thermometer:** "Watch six bars go from blue to red in 3 seconds as the enemy noise bomb hits. Then all six flash white. Total army stun." Simple, readable, dramatic. The clip works at any resolution, even phone-screen vertical crop. 7/10 shareability.

**Chip Rack:** "Watch 80 individual pips across 8 units cascade from green to blue to white in a wave pattern as signal chains propagate across the board. Then every pip simultaneously flashes. The board looks like a circuit board shorting out." Visually dense and impressive to those who understand it, but requires context to appreciate. 5/10 shareability for cold audience, 9/10 for community.

**Ring Gauge:** "Eight robots with glowing rings. The rings fill up, segment by segment. Then the enemy triggers overload. Eight rings SHATTER simultaneously — fragments spraying outward in eight directions. One second of chaos. Then the rings reassemble, but smaller — half the army's memory was wiped." This is the clip. 10/10 shareability. The ring shatter is the game's signature visual moment.

**Heartbeat:** "Eight little EKG monitors above eight robots. They're humming along, steady heartbeats. Then the enemy noise bomb hits. All eight waveforms spike to the ceiling and FLATLINE. The electronic screech plays. One beat of silence. Then the waveforms stutter back to life, one by one." This is the audio clip. On TikTok with the screech sound, this is terrifying and memorable. 9/10 shareability.

**Inbox Stack:** "Eight tiny paper stacks behind eight robots. The stacks grow, wobble, and then EXPLODE — papers scatter across the screen from eight points simultaneously. It looks like a confetti cannon made of robot memories." Fun, physical, but less dramatic than the ring shatter. 7/10 shareability.
