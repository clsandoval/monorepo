# 6.01c — The Holographic Overlay System

The Plan screen overlay is the player's primary creative canvas — the visual layer where attention architectures become visible before commitment. It transforms the battlefield from a living diorama into a holographic workbench. This analysis explores every dimension: how the grid materializes, how channel wiring renders, how perception radii communicate coverage, how ghost units bridge blueprint-to-battlefield mapping, and how all overlays interact with the terrain beneath them.

---

## The Transition: Diorama → Workbench

When the player enters Plan mode, the battlefield must transform from an immersive SE Asian cyberpunk landscape into a legible engineering workspace — without losing the sense that this IS the battlefield. The overlay system is what accomplishes this.

### Option A: "The Fade" — Gradual Desaturation + Grid Rise

**The transition.** Over 400ms, the battlefield desaturates from 100% to 60% saturation. Simultaneously, a cyan wireframe grid rises from beneath the tiles — each grid line a hair-thin neon thread (#18E0FF at 40% opacity) that appears to project upward from the tile seams. The grid doesn't drop from above like a HUD — it emerges from the board itself, as if the tiles have always contained this hidden circuitry and you're simply powering it on.

**Frame-by-frame:**
- **0ms:** Full-color battlefield. Jungle canopy rustles, city neon flickers, rice terrace water shimmers.
- **100ms:** Saturation begins dropping. Tile animations slow to 25% speed. A faint cyan glow appears at tile intersection points — like fiber-optic endpoints waking up.
- **200ms:** Saturation at 80%. Grid lines begin extending from intersection points, tracing tile edges. Each line grows at ~4 tiles/100ms, creating a ripple-outward pattern from the center of the board. The sound: a crystalline ascending tone, like glass harmonics, mixed with a soft electrical hum.
- **300ms:** Saturation at 70%. Grid fully connected. Lines pulse once brightly (100% opacity) then settle to 40%. Tile animations frozen. The battlefield looks like a technical diagram of itself.
- **400ms:** Saturation at 60%. Overlay fully active. Ghost units begin materializing at their spawn positions (see Ghost Unit section). The workbench panel slides in from the right.

**What it feels like.** The world doesn't disappear — it dims, like a theater house going to half-lights before the curtain rises. You can still see the jungle, the terraces, the city neon, but they've receded into backdrop. The grid says: *this is where you work now.*

**Strengths:** Preserves spatial context (terrain is still visible), clearly communicates mode shift, the "rising from tiles" animation reinforces that the overlay is revealing hidden structure rather than imposing external UI.

**Weaknesses:** 400ms is long enough to feel deliberate but might feel slow after the 50th time. The saturation drop reduces terrain readability — players who need to reference terrain types during planning must rely on the minimap or memory.

### Option B: "The X-Ray" — Blueprint Layer Toggle

**The transition.** Instantaneous (0ms). One keypress (Tab) toggles between full-color battlefield and a stark blueprint view. In blueprint mode, tiles are replaced by flat colored rectangles (jungle = dark green #1A4D2E, terrace = ochre #8B6914, city = gunmetal #3D3D3D, beach = sand #C2B280, volcanic = crimson-grey #4A2329), grid lines are bright cyan 1px, and all environmental detail vanishes. Units appear as their icon silhouettes (Scout 👁, Relay 📡, etc.) on the simplified tiles.

**What it feels like.** Like flipping a switch between "looking through a window" and "reading a blueprint." No animation, no ceremony. Pure information toggle.

**Strengths:** Maximum legibility. Zero terrain distraction. Players who plan frequently appreciate the speed. The flat-tile palette becomes a secondary terrain identification system (players learn: ochre = terrace, gunmetal = city).

**Weaknesses:** Jarring. Loses the emotional connection to the world. New players may feel disoriented — "where did everything go?" The toggle might be accidentally pressed, causing confusion. No graduated discovery — you see everything or nothing.

### Option C: "The Holographic Projection" — Volumetric Overlay (RECOMMENDED)

**The transition.** Over 300ms, a holographic projection materializes ABOVE the battlefield. The terrain stays fully visible at 80% saturation — significantly more than Option A. The overlay is a distinct visual layer, like a projected hologram hovering 2-4 pixels above the tile surface.

**Frame-by-frame:**
- **0ms:** Full-color battlefield. Player clicks PLAN or presses P.
- **50ms:** A faint cyan wash descends from the top of the board, like a light being switched on overhead. Tile saturation begins dropping gently (100% → 80%).
- **100ms:** Grid intersections materialize as bright cyan dots (#18E0FF, 80% opacity, 3×3 pixel diamonds). These appear simultaneously across the board — not rippling. The sound: a soft "boot" chime, like a system powering on. One note, resonant, with a 200ms tail.
- **150ms:** Grid lines extend between dots. But these aren't drawn ON the tiles — they float slightly above, with a 1px dark shadow beneath creating parallax depth. The lines use a dashed pattern (4px on, 2px off) that slowly animates rightward at 1px/tick, creating a flowing-current effect.
- **200ms:** Grid complete. Channel wiring begins rendering (see Channel Wiring section). Ghost units materialize with scan-line effect.
- **300ms:** Full overlay active. The battlefield beneath is clearly visible — you can read terrain types, see enemy spawner positions, identify cover tiles. But the holographic layer floats above it all, casting faint cyan light on the tiles below.

**The parallax effect.** When the player scrolls or pans (if the board supports it), the overlay layer moves at 102% speed relative to the terrain — creating micro-parallax that reinforces the "hovering above" perception. On a static 8×8 board this is subtle but perceptible during zoom changes.

**What it feels like.** You're an AI projecting your battle plan onto a real-world map table. The terrain is the territory; the overlay is the map. The slight visual separation between them communicates: *this is my plan, overlaid on their world. My plan is not the world. The world will do what it wants.*

**Strengths:** Maintains terrain readability (80% saturation preserves color information). The floating overlay creates a clear cognitive separation between "what exists" (terrain, enemies) and "what I'm designing" (wiring, ghosts, radii). The dashed flowing-line animation gives the grid a sense of active computation. The parallax subtly reinforces the layered nature.

**Weaknesses:** Two visual layers might create confusion about what's clickable — does clicking a tile interact with the terrain or the overlay? (Solution: overlay always captures clicks in Plan mode.) The "floating" effect requires careful rendering to avoid z-fighting artifacts in Pixi.js.

### Option D: "The Night Vision" — Dark Mode Inversion

**The transition.** Over 250ms, the battlefield inverts to a dark palette. Bright terrain becomes dark negative. Only unit positions and key terrain features (spawners, walls, resource nodes) remain lit — everything else drops to 15% brightness. The grid appears as bright green phosphor lines (#00FF41, CRT monitor green), and the entire board takes on a surveillance-camera / night-vision aesthetic.

**What it feels like.** Like switching from looking through a window to looking through a tactical scope. The world becomes intelligence — positions, routes, terrain features stripped to their game-mechanical essentials. The green phosphor palette directly references military HUDs and hacker terminals.

**Strengths:** Maximum focus on game-relevant information. The dark background makes neon overlays pop dramatically — channel wiring, perception radii, and ghost units become the brightest objects on screen. SE Asian cyberpunk aesthetic is enhanced, not contradicted, by the surveillance-camera treatment. Thematically resonant: you ARE an AI surveilling a battlefield.

**Weaknesses:** Loses almost all terrain character. The "surveillance" aesthetic might feel generic rather than distinctly Philippine. Players who enjoy the lush art direction will spend most of their time in the dim version. The green palette conflicts with the locked signal delivery color (green #00FF87 for signal success).

### Option E: "The Three-Layer Cake" — Explicit Depth Layers

**The transition.** Over 500ms, the board visually separates into three distinct depth layers that players can toggle independently:

1. **Terrain layer** (bottom): The full-detail battlefield, at 70% saturation during Plan mode.
2. **Unit layer** (middle): Unit sprites, enemy positions, spawn points. Always at full opacity.
3. **Overlay layer** (top): Grid, channel wiring, perception radii, ghost units. Full holographic cyan treatment.

Each layer has a tiny tab on the left edge of the board — three stacked rectangles colored terracotta (terrain), chrome (units), and cyan (overlay). Clicking a tab toggles that layer's visibility. All three default to visible.

**What it feels like.** Like working with Photoshop layers — you can isolate exactly the information you need. Looking at wiring topology? Hide terrain. Checking terrain cover? Hide overlay. The three-tab UI teaches players that the game is literally layered — terrain exists independently of their designs.

**Strengths:** Maximum player control. Power users can rapidly toggle between views. The explicit layer model reinforces the game's core lesson: the battlefield and your design are separate things that interact. Layer tabs work as a miniature information-management exercise — the game's theme reflected in its UI.

**Weaknesses:** Most players will leave all layers on and never toggle. The tab UI adds visual clutter. The "layer" metaphor assumes Photoshop/design tool familiarity. The 500ms transition for a 3-layer separation feels heavy. New players might accidentally hide a layer and not understand why information disappeared.

---

## Channel Wiring Visualization

The channel wiring is the player's most important design artifact — the literal nervous system of their robot army. How it renders determines whether the player can understand their own creation.

### Routing Algorithm Options

#### Option W1: "The Circuit Board" — Orthogonal Manhattan Routes

Channel wires run only horizontally and vertically along grid edges, never diagonally. When a wire must change direction, it turns at a sharp 90° corner. Wires route around unit sprites (never through them), using a simplified A* pathfinding on the grid's edge network.

**Visual treatment.** Each channel has a unique color derived from hashing its name string through a 12-hue palette (avoiding red, which is reserved for combat). The wire is 2px wide with a 1px bloom glow. At each 90° turn, a tiny 3×3 pixel junction dot appears. Wires originate from the accent glow point of the sending unit (Scout's dome tip, Relay's dish center, Command's antenna peak) and terminate at the base of the receiving unit.

**Animation.** During Plan mode, wires are static but shimmer — the bloom intensity oscillates between 60% and 100% on a 2-second cycle, offset per wire so the board has a gentle breathing effect. When the player hovers over a wire, it brightens to 100% and displays a tooltip: "recon-net: Scout-1 → Relay-2 (1 hop)."

**Collision resolution.** When two wires must share a grid edge, they offset by 1px (one runs along the top of the edge, one along the bottom). When three or more wires share an edge, a "bus" icon appears — a thickened line segment with a tiny count badge ("×3"). The bus expands on hover to show individual wires fanning out.

**What it looks like.** A printed circuit board overlaid on a battlefield. Clean, technical, precise. The right angles and junction dots create a schematic aesthetic that reinforces the engineering fantasy. The Manhattan routing means wires are always legible — no ambiguous diagonal crossings.

**Strengths:** Maximum legibility. Each wire segment is clearly attributable to its channel. The circuit-board aesthetic strongly reinforces the "workbench" metaphor. Collision resolution (bus icons) handles complexity gracefully. Works beautifully at all zoom levels — the orthogonal lines scale without becoming ambiguous.

**Weaknesses:** Can feel rigid. Complex topologies (5+ channels) create visually busy wire forests. The routing algorithm may produce unintuitive paths (a wire from A2 to A5 might route through C3 to avoid obstacles). Long wires consume more visual space than necessary.

#### Option W2: "The Nerve Bundle" — Curved Bezier Routes

Wires use smooth bezier curves that arc gracefully between units. The curve direction is determined by the relative positions of sender and receiver — horizontal pairs get gentle S-curves, vertical pairs get bowed arcs, diagonal pairs get swooping curves. Multiple wires between adjacent units separate into a visible fan (like fiber optic cables emerging from a bundle).

**Visual treatment.** Same color system as W1, but the wire width varies: 1px at the endpoints, swelling to 3px at the midpoint of the curve. This creates an organic, nerve-fiber appearance. The bloom effect follows the wire width — thicker at center, thinner at edges.

**Animation.** Flowing particles travel along the curve path at 1px/frame. Each particle is a bright dot of the wire's color, appearing at the sender, traveling the curve, and fading at the receiver. In Plan mode, particles flow at ¼ speed (design preview). During Sealed Watch, particles fire on each signal transmission at full speed. The particle motion direction communicates signal flow direction — crucial for understanding who sends to whom.

**What it looks like.** A neural network diagram. Organic, flowing, alive. The curved wires and flowing particles create a sense of biological connectivity — these aren't just data pipes, they're synaptic connections. The fan-out at connection points looks like dendrites branching.

**Strengths:** Beautiful. The particle animation inherently communicates signal direction and timing. Curves are more space-efficient than orthogonal routes — two diagonally-placed units connect with a single smooth arc instead of a two-segment L-shape. The organic aesthetic differentiates the overlay from traditional circuit/schematic visualizations.

**Weaknesses:** Curves can cross ambiguously — where two bezier curves intersect, it's hard to tell which wire goes where without hovering. Dense topologies (6+ channels) become spaghetti. The flowing particles compete for visual attention with unit animations and terrain effects. The organic aesthetic may conflict with the "engineering workbench" identity.

#### Option W3: "The Subway Map" — Simplified Diagrammatic Routes (RECOMMENDED)

A hybrid of W1 and W2. Wires route using the "London Underground" principle: 45° and 90° angles only, no curves, but diagonal segments allowed. Wires are color-coded by channel. Parallel wires are automatically spaced 2px apart (like transit lines running parallel on a subway map). When multiple channels converge at a unit, they merge into a visible "station" — a 5×5 pixel circle at the unit's base showing all incoming/outgoing channel colors as colored segments (like a tiny pie chart).

**Visual treatment.** Wire width is uniform 2px. Each wire has a 1px dark outline for contrast against any background. Channel colors are bright, saturated, and use the locked neon palette. The "station" circles at each unit pulse gently on the beat of a 2-second cycle — a heartbeat for the network.

**The "station" detail.** When the player hovers over a station circle, it expands to a 24×24 panel showing each channel as a colored horizontal bar with the channel name in 6px text. Active channels (currently receiving) pulse; dormant channels are dim. This micro-panel is the player's fastest way to audit "what does this unit hear?"

**Animation.** In Plan mode: static wires with gentle station-circle pulse. During sealed watch: signal transmission animates as a bright 4px dot traveling along the wire at 1 tile/tick (matching the locked signal latency), leaving a brief 200ms afterglow trail. Multiple simultaneous signals on the same wire are visible as a train of dots.

**What it looks like.** A transit map laid over a battlefield. Clean, colorful, informationally dense. The diagonal allowance prevents the excessive space consumption of pure Manhattan routing. The station circles at each unit create natural visual anchors that draw the eye to the network's nodes rather than its edges.

**Strengths:** Best of both worlds — cleaner than curves, more space-efficient than orthogonal-only. The subway metaphor is universally understood (even people who've never played a strategy game have read a transit map). Station circles provide at-a-glance audit of each unit's connectivity. Parallel wire spacing handles dense topologies gracefully. The 45°/90° constraint means wires never create ambiguous crossings.

**Weaknesses:** The subway metaphor might feel too "clean" for a cyberpunk aesthetic — transit maps are associated with civic order, not robot uprisings. The station circles add visual elements to every unit, which might compete with buffer bars (also at the unit's base). 45° diagonals on an isometric grid need careful alignment to avoid sub-pixel rendering artifacts.

#### Option W4: "The Pulse Network" — Minimalist Node-and-Edge

No visible wires at all during idle state. Instead, each unit displays its channel connections as tiny colored pips arranged in a ring around its base. When a signal transmits, a beam of light fires directly (straight line) from sender to receiver, ignoring obstacles — a pure logical connection, not a physical route. The beam fades over 300ms.

**Visual treatment.** The colored pips are 2×2 pixel squares, arranged clockwise by channel name (alphabetical). Each pip matches the channel color. The firing beam is 3px wide, the channel color at 80% opacity, with a white core that fades first (creating a "hollow neon tube" afterimage).

**Animation.** Plan mode: pips gently breathe (60→100% opacity, 3-second cycle, staggered per unit). When the player selects a channel in the workbench, ALL pips of that channel's color across all units flash simultaneously and briefly (200ms) connect with dim guide lines — showing the channel's full topology for that moment. This "flash topology" is the primary way players understand their wiring.

**What it looks like.** A constellation map. Most of the time, the board is clean — just units with colored dot necklaces. Then when you select a channel or a signal fires, the network blazes to life for a moment, like synapses firing. The board oscillates between calm and electric.

**Strengths:** Cleanest idle state. The board is never cluttered with wires. The "flash topology" pattern forces players to actively query the network rather than passively reading it — which might create deeper understanding. The firing beams during Sealed Watch are dramatic — a battle looks like a lightning storm of colored light.

**Weaknesses:** Harder to plan complex topologies because you can't see all wires simultaneously. The "flash" interaction requires extra clicks to understand. New players will struggle — "I can't see my wiring!" Players who've just carefully designed a 5-channel topology want to SEE it, persistently, as confirmation of their work.

---

## Perception Radius Visualization

Perception radii define what each unit can "see" — the tiles where observations enter its context window. Visualizing these radii is critical because the player is literally designing each unit's sensory apparatus.

### Option P1: "The Spotlight" — Filled Translucent Circles

Each unit with non-zero perception casts a filled circle onto the board. The fill uses the unit's accent color at 12% opacity. The border is the same color at 40% opacity, 1px solid. The radius matches the unit's perception value (Scout: 5 tiles, Striker: 2, Specialist: 3). Relay and Command have perception 0 (stationary, no circle).

**Overlap rendering.** Where two radii overlap, the fill colors blend additively. Two cyan Scout radii overlapping produce a brighter cyan region. A Scout (cyan) and Striker (orange) overlapping produce a pale warm tint. These overlap zones are visually meaningful — they're the regions where multiple units share observational data.

**What it looks like.** Soft pools of colored light on the battlefield, like stage spotlights. The overlap zones glow brighter, creating a heat-map effect. Dark zones between spotlights are the blind spots — the areas where no unit has perception.

**Edge treatment.** The circle edge is slightly feathered (1px antialiased) to avoid harsh cutoffs. On the outermost tiles (the edge of perception), a subtle dashed line replaces the solid border — communicating "perception drops off here, this is the boundary."

### Option P2: "The Radar Sweep" — Animated Scan Wedge

Instead of a static circle, each perceiving unit emits a rotating wedge — a pie-slice that sweeps 360° over 4 ticks (matching the game's discrete time). The wedge is 30° wide, the unit's accent color at 20% opacity, with a bright leading edge. Tiles that the wedge has recently swept show a brief afterglow (fading over 2 ticks), while tiles the wedge hasn't reached yet are unmarked.

**What it looks like.** Classic radar screens. The sweep creates a dynamic sense of perception as an ACTIVE process — units are constantly scanning, not passively seeing. The afterglow creates a temporal map: "this tile was observed 1 tick ago" vs. "this tile was observed 3 ticks ago."

**Strengths:** Communicates that perception is tick-based and directional. Creates natural visual rhythm. The sweep animation is mesmerizing during Plan mode — the board feels alive.

**Weaknesses:** Adds significant visual motion to the board, potentially distracting from the core planning work. The rotating wedge implies directional perception, but the locked spec has omnidirectional perception radii. Could mislead players into thinking facing matters when it doesn't. The temporal afterglow adds cognitive load.

### Option P3: "The Heatmap" — Tile-Level Observation Frequency

Each tile on the board is tinted based on how many units can observe it. 0 observers = untinted. 1 observer = faint cyan. 2 observers = brighter cyan. 3+ observers = bright cyan with glow. No per-unit circles at all — just a global observability heatmap.

**What it looks like.** A coverage map. The board is a gradient from dark (unobserved) to bright (heavily observed). The player immediately sees blind spots as dark tiles and strong coverage as bright tiles. No need to mentally combine individual circles.

**Interaction with unit selection.** When the player selects a specific unit, the heatmap shifts to show ONLY that unit's contribution — all other contributions temporarily subtract, revealing what this specific unit adds to the coverage. This "solo" view helps players understand individual unit value.

**Strengths:** Directly communicates what matters most: which tiles are observed and which aren't. The "solo" interaction teaches decomposition (what does each unit contribute?). No overlapping circles to parse. Clean, informationally efficient.

**Weaknesses:** Loses per-unit identity. When looking at the heatmap, you can't tell which unit is responsible for which coverage — only the global result. The "solo" interaction helps but requires clicks. The tinting might conflict with terrain coloring, especially on already-blue tiles (beach water, city neon).

### Option P4: "The Grid Highlight" — Discrete Tile Borders (RECOMMENDED)

No circles at all. Instead, each tile within a unit's perception radius gains a colored border — the inner edge of the tile lights up in the unit's accent color. Tiles with overlapping perception show segmented borders (top edge = Scout cyan, left edge = Striker orange, etc.), like tiles wearing multi-colored frames.

**What it looks like.** The board's checkerboard pattern activates. Tiles within perception zones gain glowing inner borders. Unobserved tiles remain bordered only by the dim grid. The effect is precise — you can see EXACTLY which tiles are within range, at grid-cell resolution.

**The "wire frame" detail.** On a selected unit, the perception border animates: a bright pulse travels clockwise around the border of each tile in range, one tile at a time, at 2 tiles/tick. This "tracing" animation helps the player count the exact number of tiles in range.

**Interaction with ghost units.** Ghost unit perception uses dashed borders (alternating 3px lit, 3px dark) instead of solid borders. This visually distinguishes "planned perception" from "current perception."

**Strengths:** Pixel-perfect precision. No ambiguity about which tiles are in range — the border is a binary yes/no. Segmented multi-color borders elegantly handle overlap. Dashed borders for ghosts naturally communicate "not yet real." Works at all zoom levels because the borders are tied to the tile grid, not to unit sprites.

**Weaknesses:** The segmented-border approach breaks down at high overlap (4+ units covering the same tile — 4 edge segments requires very thin sub-pixel color bands). Less immediately visually striking than filled circles — no "spotlight" drama. Players must look at the board analytically rather than getting a gestalt impression of coverage.

---

## Ghost Unit Visualization

Ghost units appear in Plan mode to show where blueprinted units WILL spawn. They're the player's preview of their army — the bridge between abstract blueprint design and concrete battlefield placement.

### The Ghost Rendering Pipeline

**Base derivation.** Start with the unit's idle sprite. Apply these transformations in order:

1. **Desaturate** to 30% (accent colors become whispers of themselves)
2. **Tint** with #18E0FF (holographic cyan) at 25% blend
3. **Set opacity** to 45% — terrain clearly visible through the unit
4. **Add scan-line effect** — a 1px horizontal line of full brightness sweeps top-to-bottom every 2 seconds (16 frames at 8fps). The line is 1px tall and spans the full sprite width. As it crosses, the ghost sprite momentarily (1 frame) appears at 90% opacity before dropping back to 45%.

**The result.** A translucent cyan shimmer. The unit's silhouette is clearly readable (shape-first design ensures ghosts are identifiable even at 45% opacity). The scan-line sweep creates a "holographic projection" effect — the ghost looks like it's being rendered by an imperfect display system. The momentary brightness as the scan line passes gives each ghost a regular "pulse of life" that says: *I'm not real yet, but I will be.*

### Ghost Interaction States

**Default (no hover/select):** The ghost stands at its spawn tile, scan-line sweeping. No outline. Perception radius shown with dashed tile borders (Option P4).

**Hover:** The ghost brightens to 65% opacity. A dashed cyan outline (1px, 4px dash, 2px gap) appears around the sprite. The unit's name and blueprint reference appear in a tooltip above: "Scout-2 (Recon Alpha blueprint)." Channel wiring endpoints at this ghost flash — "these wires connect here."

**Selected:** The ghost brightens to 80% opacity. The dashed outline becomes solid. The workbench panel scrolls to and highlights this ghost's blueprint. All channel wiring involving this ghost brightens to 100%. Other ghosts and wiring dim to 30% opacity. The player is now "focused" on this unit's role in the network.

**Dragging (Missions 1-4, pre-placed units):** In early missions where the player manually places pre-configured units, the ghost follows the cursor at 90% opacity with a bright cyan glow beneath it (a circular drop-shadow in cyan, 50% opacity, pulsing). Valid tiles (within spawn zone) show a green (#00FF87) border flash. Invalid tiles show a red (#FF2D2D) border and the ghost snaps back on release. The sound when placing: a satisfying "click" — magnetic, like a circuit component seating into a socket.

**Production queue preview (Missions 5+):** When the player hovers over a blueprint in the production queue, ghosts of that blueprint's units appear on the board at their future spawn positions. These ghosts are even more transparent (30% opacity, no scan-line) and their spawn order is indicated by small numbered badges (1, 2, 3...) in the blueprint's accent color. This gives the player a "what will my factory produce?" preview.

### Ghost Unit Perception Radius Interaction

Ghost unit radii MUST use dashed borders (not solid) to communicate "this is planned, not actual." The dashing pattern — 3px solid, 3px gap — is unique to ghosts and not used anywhere else in the overlay system. This creates a reliable visual vocabulary:

- **Solid glow** = real, active, happening now
- **Dashed glow** = planned, projected, not yet committed

When a ghost's perception radius overlaps with an enemy spawner's known position, the overlapping tiles pulse amber (not red — red is combat). This communicates "your planned scout WILL see this spawner" — a key planning insight.

---

## Overlay × Terrain Interaction

The overlay must coexist with five distinct biome types, each with different color palettes, brightness levels, and visual noise. This interaction is where the overlay system's design gets tested hardest.

### Per-Biome Overlay Tuning

**Jungle (Ifugao highlands / Palawan / Mindanao).** Dark green canopy with ochre rice terraces. The cyan overlay reads well against dark greens — natural complementary contrast. **No adjustment needed.** The grid lines and channel wiring pop naturally. Risk: jungle tiles with bioluminescent elements (if 6.01a-ii terrain animation is adopted) could compete with overlay glow. Solution: bioluminescent tile animations freeze during Plan mode.

**Beach (Palawan / Batanes).** Light sand and turquoise water. The cyan overlay has LOW contrast against turquoise water tiles. **Adjustment: overlay shifts from cyan #18E0FF to gold #FFD700 on beach biome boards.** The gold reads as "warm hologram" against cool water. Channel wiring retains its per-channel colors but gains a 1px dark outline for contrast. Alternatively: beach tiles desaturate more aggressively (down to 50%) during Plan mode to widen the contrast gap.

**City (Cebu / Manila).** Neon-lit cyberpunk with existing cyan, magenta, and amber light sources in the terrain. The overlay's cyan can merge visually with terrain neon. **Adjustment: overlay intensity increases to compensate.** Grid lines go from 40% to 60% opacity. The grid's dashed-flowing animation (Option C) differentiates it from static terrain neon — movement vs. stillness is the key distinction. Additionally: terrain neon dims to 40% brightness during Plan mode (the city "powers down" while you plan).

**Rice Terrace (Ifugao).** Horizontal stepped lines in the terrain create visual rhythm that can conflict with the grid's horizontal lines. **Adjustment: grid rendering uses dotted lines (2px dot, 2px gap) instead of dashed lines on terrace tiles.** The dotted pattern contrasts with the terrace's solid horizontal lines. The terrace's water reflections dim during Plan mode.

**Volcanic (Siquijor / Taal).** Dark basalt and bioluminescent elements. Naturally high contrast with cyan overlay. **No adjustment needed**, though bioluminescent elements freeze during Plan mode (same as jungle rule).

### The "Overlay Confidence" Rule

Across all biomes, the overlay follows one rule: **the player must be able to identify every overlay element without squinting.** If a channel wire crosses a bright terrain tile and becomes hard to trace, the wire automatically gains a 1px black outline on that segment. If a perception radius border overlaps a bright terrain edge, the radius border thickens to 2px on that edge. These adaptive adjustments are computed per-tile based on terrain brightness.

The implementation: for each tile, sample the average brightness of the rendered terrain. If brightness > 60% (on a 0-100 scale), all overlay elements on that tile gain enhanced contrast treatment (darker outlines, thicker lines, higher opacity). If brightness < 30%, overlay elements can use their default rendering. This adaptive approach handles edge cases (a single bright tile in a dark biome) without requiring per-biome override tables for every element.

---

## The "Seal Descend" Transition (Plan → Sealed Watch)

When the player hits EXECUTE, the overlay must disappear — but not instantly. The transition from Plan to Sealed Watch is one of the game's most important emotional beats: the moment of commitment.

### The Sequence (800ms total)

**0-100ms — "The Commit Flash."** The entire overlay flashes white (100% opacity, uniform white) for 1 frame (50ms), then rapidly fades. All ghost units flash solid (not transparent) for that single frame — for one instant, the plan is fully real. The sound: a sharp crystalline "ping," like glass struck once. A finality sound.

**100-300ms — "The Grid Dissolves."** Grid lines retract toward their intersection points, reversing the materialization sequence. Each line segment shrinks from its midpoint toward both endpoints simultaneously, taking 200ms to fully retract. The intersection dots linger 50ms after their connecting lines vanish, then wink out with a tiny cyan spark.

**300-500ms — "The Wires Burn."** Channel wiring doesn't simply vanish — it "burns" from the endpoints inward. A bright white-core erosion front travels along each wire at 4 tiles/100ms, consuming the wire into sparks. The sparks drift downward (2px over 200ms) and fade. The sound: a soft crackling, like static electricity dissipating. Each wire burns simultaneously from both sender and receiver, meeting and extinguishing at the midpoint.

**500-700ms — "Ghosts Solidify."** Ghost units transition from 45% holographic to 100% opaque real units. The scan-line effect runs one final sweep (fast, 100ms), and as it passes, each pixel row below it locks to full opacity and full color. The ghost BECOMES the real unit, top-to-bottom. The sound: a rising tone that resolves into the unit's idle audio (Scout's scanner hum, Relay's dish tone, etc.).

**700-800ms — "The World Returns."** Terrain saturation restores from 80% to 100%. Tile animations resume. Environmental sounds fade back in (jungle ambiance, city noise, beach waves). The battlefield is fully alive.

**800ms+:** The Sealed Watch tick clock appears at the top. The first tick fires. Battle begins.

### Why 800ms Matters

The seal-descend transition is a RITUAL. Every strategy game has a commit moment — Slay the Spire's card play, Into the Breach's end-turn, Factorio's launching a rocket. Robot Uprising's commit moment must feel weighty because the player is launching an ENTIRE AUTONOMOUS SYSTEM, not just one action. The 800ms gives the brain time to register: *the plan is gone. The system is running. I can't intervene now.*

The emotional arc of 800ms: certainty (flash) → loss (grid dissolving) → transformation (wires burning, ghosts solidifying) → wonder (world returns, alive). This maps onto the player's internal experience: commitment → anxiety → anticipation → excitement.

---

## Player Journeys

### Journey: Reyes, 26, Frontend Developer and Casual Gamer

**Context:** Mission 3 (hooks tutorial). First time planning with channel wiring visible. Has played Missions 1-2 with just context config and rules. Knows basic planning but has never seen channel wires on the board.

**Minute 0:00 — Boot Log & Plan Screen Entry**
Reyes finishes reading the boot log introducing hooks. The Plan screen opens with the familiar desaturated battlefield — Palawan jungle tiles, two pre-placed Scout ghosts and one Relay ghost visible. But something's new: a bright magenta line arcs from one Scout ghost's dome to the Relay ghost's dish. Reyes's eyes widen. "Oh, that's the hook I just configured." She hovers over the line. A tooltip reads: "threat-alert: Scout-1 → Relay-1 (1 hop)." She sees tiny colored pips at the base of each ghost — magenta dots on the connected units, grey dots on the unconnected Scout.

**Minute 0:45 — Wiring the Second Scout**
Reyes opens the blueprint editor for Scout-2. She adds a hook: ON_DETECT → SEND "threat-alert." The moment she saves, a second magenta line appears on the board — this one from Scout-2 to Relay-1. It materializes from the Scout's dome outward, growing at 2 tiles/100ms with a soft electric sound. The Relay ghost's station circle updates — two magenta segments now visible. Reyes feels a click of satisfaction: her network is growing.

**Minute 1:30 — Reading Coverage Gaps**
She notices the perception radius: dashed cyan borders around tiles near each Scout ghost. Five tiles deep for each. But there's a dark gap between the two Scouts — three tiles in the center with no dashed borders. She thinks: "That's where enemies could sneak through." She considers repositioning a Scout to close the gap, but in Mission 3, positions are pre-placed. She'll have to design hooks that compensate — maybe a rule that makes Scouts patrol toward the gap.

**Minute 2:15 — The "Aha" Moment**
She adds a second channel — "move-alert" — from the Relay to a Striker ghost. A new gold wire appears on the board, routing from Relay-1 to Striker-1. Now the board shows a clear signal chain: Scouts (magenta wires) → Relay (magenta in, gold out) → Striker (gold wire in). The Relay's station circle has both magenta and gold segments. Reyes traces the chain with her eyes and grins. "I just built a communication network." She hovers over the Relay's station circle, and the micro-panel shows both channels with their colors and names. The signal path is legible.

**Minute 3:00 — EXECUTE**
Reyes hits EXECUTE. The commit flash fires — white, sharp, one instant of certainty. The grid dissolves inward. The magenta and gold wires BURN from their endpoints, sparks drifting down. The ghosts solidify, scan lines locking each unit to full color top-to-bottom. The jungle returns at full saturation, sounds swelling. For 800ms, Reyes watches her design transform from holographic plan to living system. She feels a tiny thrill — anxiety and excitement mixed. The tick clock appears. The Sealed Watch begins.

**Minute 5:30 — Inspector Discovery**
After the sealed watch, in the Inspector, Reyes scrubs back to tick 8 where her Scout detected an enemy. She sees the magenta wire flash on the board — a signal traveling from Scout to Relay. One tick later, the gold wire flashes — Relay to Striker. The Striker moves. The whole chain is visible, causally linked, on the timeline. She realizes: the wiring she built in Plan mode is the SAME wiring she's tracing in the Inspector. The visual language carries across screens.

**UI Annotations:**
- Channel wire tooltip: appears above wire on hover, 10px offset, 6px font, dark background with colored wire-color border
- Station circle: 5×5px at unit base, hover expands to 24×24px channel list panel, 200ms expand animation
- Perception dashed borders: 1px dashed inside tile edges, unit accent color, visible only in Plan mode
- Seal-descend transition: 800ms total, audio mix: crystalline ping → static crackle → rising tone → jungle ambiance

---

### Journey: Marcus, 42, Factorio Veteran and Network Engineer

**Context:** Mission 7 (command agent + production tuning). Has completed Missions 1-6. Experienced with all overlay elements. Running a complex 3-blueprint setup with 8+ channels.

**Minute 0:00 — Opening the Wiring Map**
Marcus's Plan screen is dense. Five ghost units on the board: two Scouts, one Relay, one Striker, one Command. The board is a web of colored wires — magenta (threat-alert), gold (engage-order), green (status-ping), blue (recon-data), white (command-override), cyan (position-report), amber (resource-signal), and purple (emergency-recall). He pauses. "This is getting complex." He hovers over the Relay's station circle. The micro-panel expands, showing 6 active channels. The station circle itself is a tiny rainbow — segmented colors packed tight.

**Minute 0:30 — Isolating a Channel**
Marcus clicks the "recon-data" channel in the workbench sidebar. The board responds: ALL wires dim to 15% opacity EXCEPT the blue recon-data wires, which brighten to 100% with a 2px bloom. The perception radii for units sending recon-data remain visible; all others fade. Marcus can now see ONLY the reconnaissance topology — two Scouts feeding one Relay, which feeds the Command agent. He traces the route: Scout-1 (blue wire, 3 tiles Manhattan route) → Relay-1 (blue wire, 2 tiles) → Command-1. Clean. He clicks "threat-alert" to compare. Different topology — Scouts send directly to Striker, bypassing the Relay. He nods: that's by design. Threat data needs speed; recon data needs compression.

**Minute 1:15 — The Spaghetti Problem**
Marcus un-isolates (clicks the active channel filter again to show all). The full wiring returns. It's dense. Two wires cross over tile D4, creating an ambiguous intersection. Marcus squints. Which wire goes where? He zooms in (scroll wheel). At 200% zoom, the 2px offset between parallel wires becomes visible — the blue wire runs along the top of the grid edge, the gold wire along the bottom. The crossing is resolved by the offset rendering. At 100% zoom, the offset was too subtle. Marcus makes a mental note: "plan with zoom." He pans to the Relay and notices the station circle is cluttered — 6 segments in 5 pixels. He hovers, and the expanded panel is more legible.

**Minute 2:00 — Adding a Command Hook**
Marcus is configuring the Command agent's most complex hook: "When recon-data indicates 3+ enemies in a zone → reassign nearest Striker's rules to prioritize that zone." He adds the hook in the workbench. The moment he saves, a new wire materializes on the board — bright gold from Command to Striker, routing orthogonally. But this wire has a special appearance: a tiny wrench icon at the Command-end junction. This indicates it's a REASSIGNMENT channel — the Command agent isn't sending data, it's sending configuration changes. Marcus grins. "The factory that builds the factory."

**Minute 3:30 — The Pre-Commit Audit**
Before hitting EXECUTE, Marcus uses a power-user feature: he holds Shift and hovers over each unit ghost in sequence. Each hover triggers the "solo" view — that unit's wiring brightens, everything else dims. He's running a mental audit: "Scout-1: sends threat-alert, sends recon-data. Check. Scout-2: same channels. Check. Relay-1: receives recon-data from both Scouts, compresses, forwards to Command. Check. Command-1: receives compressed recon, evaluates zone threat, sends reassignment on 3+ enemy threshold. Check." The overlay system is his inspection instrument.

**Minute 4:00 — EXECUTE with Ceremony**
Marcus hits EXECUTE. He's seen the seal-descend 6 times before, but it still gives him a beat of anticipation. The commit flash. The grid dissolving. The wires burning — and this time there are SO MANY wires, the burn effect creates a cascade of sparks across the board, each wire igniting independently, the board briefly looking like a fireworks display of signal paths consuming themselves. Then the ghosts solidify. The world returns. The tick clock starts. Marcus leans back in his chair, arms crossed. "Let's see if the factory works."

**UI Annotations:**
- Channel isolation: click channel name in sidebar to isolate; all non-selected wires dim to 15% opacity, 200ms transition
- Zoom-dependent wire offset: at 100% zoom, parallel wire offset is 1px (barely visible); at 200%, offset is 2px (clearly visible)
- Reassignment wire icon: tiny wrench glyph (4×4px) at the sending endpoint, distinguishing data channels from command channels
- Shift+hover audit: hold Shift to enable "solo" mode on hover, dimming all non-selected-unit wiring

---

### Journey: Tomás, 14, First-Time Strategy Gamer

**Context:** Mission 1 (context window tutorial). Has never played a strategy game. Just finished the boot log. Entering Plan mode for the first time.

**Minute 0:00 — First Overlay Encounter**
The screen transforms. Tomás was looking at a cool cyberpunk rice terrace scene — mist curling around server racks built into stone steps, green jungle pressing in from the edges. Then he clicked PLAN, and the scene... shifted. The colors softened. A grid appeared — cyan lines floating just above the tiles, with tiny diamond-shaped dots at each corner. It looks like graph paper was projected onto the battlefield. A soft chime played, like a computer starting up. His eyes track a scan-line sweeping down a translucent blue figure standing on one of the tiles. "That's my robot?"

**Minute 0:20 — Understanding Ghosts**
The ghost Scout stands on tile C3. It's clearly a robot-shaped thing, but see-through — Tomás can see the jungle tile behind it. The scan-line sweeps down again, and for one frame the ghost is almost solid before fading back. Tomás hovers over it. A tooltip appears: "Scout-1 (Recon Alpha)." Dashed blue borders appear around 5 tiles in every direction from the Scout. Tomás doesn't know what these borders mean yet, but they're clearly centered on the robot. "That's probably what it can see?"

**Minute 0:45 — The Boot Log Explained It**
Tomás remembers the boot log mentioned "perception radius: 5 tiles." He counts the dashed borders. Five tiles in each direction from the Scout. "Yeah, that's the Scout's eyes." He looks at the tiles WITHOUT dashed borders — the dark areas. "And those tiles are blind spots." He's learning spatial coverage from the overlay alone, without any tooltip or explicit tutorial.

**Minute 1:30 — Adjusting Context Config**
The mission objective says: "Configure Scout-1's context window to listen for enemy positions." Tomás opens the workbench panel on the right. He sees the context config: a set of toggles labeled "Listen: enemy_position ☐ | ally_position ☐ | terrain ☐." He checks "enemy_position." Nothing visible changes on the board — the context config is invisible in the overlay (it's internal to the unit). But the boot log sidebar updates: "Context window now listening for enemy position data." Tomás is learning that some configuration is visible (perception, wiring) and some is internal (context filters, eviction priorities).

**Minute 2:00 — First EXECUTE**
Tomás hovers over the EXECUTE button. It's large, red-bordered, top-right corner. He clicks. THE COMMIT FLASH. The grid vanishes — the cyan lines retract into their corner dots, and the dots spark out. The ghost Scout solidifies: the scan-line does one fast final sweep and locks the sprite to full color. The rice terraces surge back to full saturation. Jungle sounds fill his headphones. The tick clock appears at the top: ten horizontal pips, the first one glowing gold. Tomás watches, slightly anxious. The first tick fires.

**Minute 2:15 — Sealed Watch**
The Scout moves. It steps from C3 to C4, snapping to the new tile. A brief blue glow traces where its perception reaches. On tick 3, an enemy appears at the edge of the Scout's perception — a red robot on tile C8. A green cell flash on tile C8 signals: "observation received." Tomás sees the Scout's tiny context bar (at the bottom of its sprite) gain one bright pip. "It SAW something!" He doesn't fully understand the mechanism, but the overlay's visual vocabulary — green flash = information received, pip lights up = context filled — is doing the teaching.

**Minute 3:00 — Post-Battle Inspector**
After the sealed watch, the Inspector opens. Tomás clicks on the Scout. A panel shows its context window at the current tick: one slot filled with "enemy_position: C8 (age: 0 ticks)." The slot glows green. Tomás scrubs back one tick — the slot is empty. He scrubs forward — the slot appears. "So that's when it saw the enemy." The connection between the sealed watch's green flash and the Inspector's context slot clicks into place. The overlay language is consistent across all three screens.

**UI Annotations:**
- First overlay appearance: cyan grid materialization, 300ms, soft boot chime
- Ghost unit tooltip: appears on hover, 200ms delay, 12px font, unit name + blueprint name
- Perception radius teaching: dashed borders appear on hover, centered on unit, countable by player
- EXECUTE button: 48×24px, dark background, red-orange border (#FF6B35), white "EXECUTE" text, top-right corner of workbench panel
- Context bar pip: 2×2px per pip, grey when empty, accent color when filled, bottom of unit sprite

---

### Journey: Dr. Priya, 38, ML Infrastructure Engineer (Accessibility Focus)

**Context:** Mission 5 (factory introduction). Plays with deuteranopia (red-green colorblindness). Has the Shape-First accessibility mode enabled. Experienced player — completed Missions 1-4 with full understanding.

**Minute 0:00 — The Accessible Overlay**
Priya's Plan screen looks different from other players'. With Shape-First mode, the overlay uses pattern fills instead of relying on color alone:

- **Channel wires** retain their colors but gain unique dash patterns: solid (channel 1), long-dash (channel 2), short-dash (channel 3), dot (channel 4), dash-dot (channel 5), dash-dot-dot (channel 6). Each pattern is readable in grayscale.
- **Perception radii** use crosshatch fill patterns instead of colored fills: Scout perception uses diagonal hatching (///), Striker uses horizontal (===), Specialist uses dots (•••). The hatching is at 10% opacity, barely visible but distinguishable.
- **Station circles** at unit bases show channel count as a number (not just colored segments). "3" in white text replaces the tiny pie chart.

**Minute 0:30 — Reading Factory Output Preview**
Priya hovers over her first blueprint in the production queue. Ghost units appear on the board — but now there are MULTIPLE ghosts, one for each unit the factory will produce. Numbered badges (1, 2, 3) appear on each ghost, indicating build order. Ghost #1 is more opaque (35%) than ghost #3 (25%), communicating temporal ordering through opacity. Priya reads the queue left-to-right: Scout first, Relay second, Striker third. The spawn positions on the board match the factory's output zone. She mentally traces: "Scout spawns at D2, scouts the east side, sends recon-data on the solid-dash wire to Relay at D1, which forwards via the long-dash wire to the Striker spawning at C1."

**Minute 1:15 — Complex Wiring on Accessible Board**
With 5 channels active, Priya's board has 5 distinct wire dash patterns. She can trace each wire by its pattern even in a monochrome view. Where wires cross, the distinct patterns prevent confusion — a solid line crossing a dotted line is unambiguous regardless of color. She thinks: "This is actually EASIER to read than the colored version." The accessible mode's pattern-based differentiation provides more bits of visual information than color alone.

**Minute 2:00 — Overlay Audit with Screen Magnifier**
Priya uses the browser's zoom at 150% (her default). The overlay scales cleanly — Pixi.js renders the grid at the scaled resolution, so dash patterns remain crisp. The station-circle numbers are now 7.5px effective size, clearly legible. Wire dash patterns at 150% zoom have ~6px visible dash segments, well above the readability threshold. The entire overlay system was designed to survive magnification because every element is vector-defined (grid lines, wire routes, radius borders) rather than raster (fixed-size sprites). The only raster elements — ghost unit sprites — are pre-rendered at 2× resolution for exactly this scaling scenario.

**UI Annotations:**
- Shape-First wire patterns: 6 distinct dash patterns, each ≥4px dash length at 100% zoom
- Perception hatching patterns: diagonal (Scout), horizontal (Striker), dots (Specialist), at 10% opacity fill
- Station circle number: white text, centered, replaces colored segments, 5px font at 100% zoom
- Production queue ghost opacity: build-order-dependent, #1=35%, #2=30%, #3=25%
- Magnification survival: all overlay elements vector-rendered; sprites pre-rendered at 2×

---

## Interaction Effects

### With Building Blocks (3.xx)
- **Rules UI (3.07):** When editing a rule's condition, the overlay could highlight relevant tiles — e.g., editing "IF enemy in perception" highlights the unit's perception radius in pulsing amber. This "rule → overlay" feedback loop helps players visualize what their rules mean spatially.
- **Hook configuration (3.09):** Adding/removing a hook immediately materializes/dissolves the corresponding wire on the overlay. The overlay is LIVE — it updates in real-time as the workbench changes. This is critical for the "tinker and see" workflow.

### With Sealed Watch (locked)
- The overlay must completely vanish during Sealed Watch. No grid, no perception circles, no ghost units. Only the battlefield, units, context bars, cell flashes, and signal-chain dashed lines (which are a DIFFERENT visual system from Plan-mode wiring — they appear per-signal, per-tick, as transient flashes, not persistent overlays).

### With Inspector (locked)
- The Inspector has its OWN overlay — dimmed board with analytical overlays. The Inspector overlay reuses channel wire colors and routing from Plan mode but renders them as click-to-highlight rather than always-visible. The visual language must be consistent: same colors, same routing, same station circles — so the player recognizes "this is the same network I designed."

### With Mobile/Touch (6.07)
- On mobile, the overlay must remain legible at smaller screen sizes. Station circles need larger tap targets (minimum 44×44px touch zone, even if rendered at 5×5px). Ghost unit hover interactions become tap-and-hold. Channel isolation (normally sidebar click) becomes a bottom-sheet selector. The floating overlay (Option C) is especially well-suited for touch — the parallax separation helps fat-finger accuracy by creating a clear "overlay layer = planning interactions, terrain layer = not interactive."

### With Colorblind Modes (6.08)
- The Shape-First accessible overlay (described in Priya's journey) must be tested across all four colorblindness types. The wire dash-pattern system is colorblindness-immune by design. The perception hatching patterns use orientation (diagonal/horizontal/dots) which is color-independent. Station circle numbers are pure contrast (white on dark). The adaptive contrast enhancement (Overlay Confidence Rule) also benefits low-vision players by ensuring overlay elements always meet WCAG contrast ratios.

---

## Comparable Games & Media

**Into the Breach — Movement Preview Overlay.** When you hover over a unit, Into the Breach shows a translucent highlight on reachable tiles — simple, clean, instantly legible. Robot Uprising's perception radius (Option P4, grid borders) follows this principle: highlight exactly the tiles that matter, no more. The key difference: Into the Breach's overlay is ephemeral (hover-only), while Robot Uprising's must be persistent (always visible in Plan mode) because the perception layout IS the design artifact.

**Factorio — Ghost Buildings.** Factorio's ghost buildings (translucent blue entities placed by blueprints before construction robots build them) are the direct ancestor of Robot Uprising's ghost units. Factorio ghosts are cyan-tinted, semi-transparent, and show connection wires to adjacent entities. Robot Uprising adds the scan-line effect and the Plan→Sealed Watch solidification ceremony, but the core "see the plan before it's real" function is inherited.

**StarCraft II — Rally Line Rendering.** When you set a rally point from a production building, StarCraft II draws a colored line from the building to the rally location. Multiple rally points create a web of lines. Robot Uprising's channel wiring is this concept exploded into a full information architecture — not just "where do units go?" but "who talks to whom about what?"

**Transistor — The Planning Mode Overlay.** Transistor's "Turn()" planning mode freezes time and overlays a white movement trace on the battlefield. The overlay is clean, high-contrast, and clearly communicates "this is a plan, not reality." Robot Uprising inherits the clarity principle but adds persistent visibility (Transistor's overlay vanishes when you commit; Robot Uprising's stays until EXECUTE).

**Slay the Spire — Card Energy Preview.** When hovering a card, Slay the Spire shows its effect zones highlighted on the enemy. This "preview what my design will do" pattern maps to Robot Uprising's ghost unit perception radii and channel wiring — showing the player the consequences of their design choices before commitment.

---

## Sensory Summary

**What it looks like.** A holographic engineering blueprint projected onto a living miniature diorama. The battlefield retains 80% of its SE Asian cyberpunk detail — you can see the rice terraces, the city neon, the jungle canopy — but floating above it is a clean, luminous layer of cyan lines, colored wires, translucent ghost units, and glowing station circles. The two layers are visually distinct: one organic and detailed, one geometric and precise. The contrast between them IS the game's core visual statement: nature vs. engineering, world vs. plan, territory vs. map.

**What it sounds like.** The Plan mode overlay has its own audio layer. The grid materialization plays a crystalline ascending tone (300ms, glass harmonics). Wire materialization plays a soft electric buzz scaled to wire length (shorter wires = higher pitch). Ghost unit scan-lines produce a barely-audible high-frequency sweep (19kHz, at the edge of perception — more felt than heard). The overall Plan mode ambient is a quiet electrical hum, like being inside a server room with excellent soundproofing. When EXECUTE fires, the commit flash plays the sharp crystalline ping, then the audio transitions through static crackle (wire burn), rising tones (ghost solidification), and finally the full environmental soundscape (world return).

**What it feels like.** Creative power. The overlay is the player's canvas — every wire they add, every perception radius they see, every ghost unit they place is a piece of their design becoming visible. The floating holographic layer communicates: "this exists because YOU are thinking it." When the overlay dissolves during EXECUTE, the feeling shifts from power to vulnerability — the plan has left your hands and become a living thing you can no longer control.

---

## The TikTok Clip

**The "Architecture Reveal" clip.** A time-lapse of a player building a complex 6-channel wiring topology over 30 seconds, sped up to 10 seconds. Wires materialize one by one, each a different color, criss-crossing the board in the subway-map style. Station circles fill with color segments. Perception radii activate as ghosts appear. The board goes from empty to a luminous, pulsing information architecture. Then EXECUTE: the commit flash, the wire burn cascade (EVERY wire burning simultaneously, sparks EVERYWHERE), ghosts solidifying in a wave, the world returning to full color. The 15-second clip starts quiet and geometric, builds to maximum visual complexity, then RELEASES in a cascade of light and sound. The caption: "I designed an autonomous robot communication network in 2 minutes. Then I watched it fight."

---

## New Aspects Discovered

- **6.01c-i — Overlay performance budget in Pixi.js:** exact rendering cost analysis for the recommended Option C (floating holographic) with all overlay elements active — grid lines (64 horizontal + 64 vertical), up to 12 channel wires with routing, up to 8 perception radii (tile borders), up to 8 ghost units with scan-line shaders. Target: 60fps on integrated GPU at 1080p. What's the shader cost of the flowing-dash animation and the scan-line sweep?
- **6.01c-ii — Overlay customization as power-user preference:** should veteran players be able to toggle individual overlay layers (grid on/off, perception on/off, wiring on/off, ghosts on/off)? Or does forced visibility preserve design clarity? The "Photoshop layers" model (Option E) as an unlockable preference after completing the campaign.
- **6.01c-iii — Overlay visual language consistency across Plan/Inspector/Replay:** ensuring that the same wire color, same routing path, same station circle appearance appears in all three screens. Color hash function for channel names must be deterministic and persistent across sessions. The "channel passport" — a channel's visual identity never changes once named.
- **6.01c-iv — The "wiring spaghetti" threshold and auto-layout:** at what channel count does the subway-map routing become unreadable? 6 channels? 8? 12? Automatic wire-bundling ("bus" segments) that groups co-routed wires. The Factorio "spaghetti base" phenomenon as a rite of passage vs. a UX failure.
- **6.01c-v — Overlay interaction with EM emissions visualization:** during Inspector mode, EM noise from hook transmissions could be visualized as radial pulses emanating from transmitting units. How does this EM overlay interact with the channel wiring overlay? Layered rendering order: terrain → grid → wiring → EM pulses → unit sprites → perception radii.
