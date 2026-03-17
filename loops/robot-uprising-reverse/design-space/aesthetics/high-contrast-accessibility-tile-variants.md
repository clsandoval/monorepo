# 6.01a-v — High-Contrast / Accessibility Tile Variants

How the five biome tiles (Gubat jungle, Hagdan terrace, Dagat beach, Lungsod city, Taal volcano) degrade under each axis of visual impairment — and the complete design space for making them readable without sacrificing cultural identity.

---

## The Problem: Beautiful Tiles That Disappear

Robot Uprising's tile art is pixel-dense, culturally specific, and gorgeous. The Ifugao rice terraces with their horizontal water-rice banding. The Siquijor jungle with bamboo accents and orchid dots. The Manila cyberpunk city with neon fiber optics. Each biome tells a story in 64×32 pixels.

But for a player with protanopia, the jungle's green canopy clusters and the combat red flash collapse into the same olive-brown. For a player with 20/200 vision using 300% OS magnification, each tile is a featureless blur of similar-hue pixels. For a player with photosensitivity, the Taal volcano's jitter animation and the Siquijor bioluminescent pulse are migraine triggers.

The tiles are the *floor* of every interaction. If a player can't read the floor, they can't read the board. This analysis explores four complete approaches to accessible tile design, plus hybrid configurations.

---

## Approach A: "Geometric Fingerprint" — Shape-First Biome Identity

**Philosophy:** Every biome gets a unique geometric pattern that identifies it without any color information at all. These patterns exist in the standard art (subtly) and become prominent in high-contrast mode. Inspired by the board game Azul, where each tile color has a unique geometric symbol (crescent, star, diamond, etc.) so colorblind players can distinguish all tiles by shape alone.

### The Five Geometric Signatures

| Biome | Pattern | Geometric Logic | At 64×32 |
|-------|---------|-----------------|----------|
| **Gubat (Jungle)** | Diagonal hatching, 45° | Leaf veins, bamboo crossing. Organic diagonal energy. | 1px diagonal lines at 4px spacing, upper-left to lower-right across the diamond face |
| **Hagdan (Terrace)** | Horizontal lines | Rice terrace stepping. Already inherent in the art (water-rice banding). | 1px horizontal lines at 3px spacing — reinforces the natural horizontal banding |
| **Dagat (Beach)** | Stippling / scattered dots | Sand grains, coral fragments, scattered light on water. Pointillist. | 1px dots at irregular but repeatable 5-7px spacing, suggesting sand texture |
| **Lungsod (City)** | Grid / crosshatch | Street grid, building grid, circuit board. Rectilinear order. | 1px perpendicular lines at 6px spacing forming a fine grid |
| **Taal (Volcano)** | Concentric arcs | Caldera rings, lava flow contours, tectonic pressure. | 1px arc segments radiating from tile center outward in 4px increments |

### How It Works In Standard Mode

In the normal, full-color art, these patterns exist but are subtle — embedded in the texture rather than overlaid. The jungle tile's canopy clusters already have a diagonal energy from the top-left lighting. The terrace's horizontal banding is its primary feature. The city grid naturally reads as crosshatch. The geometric fingerprints are *reinforced* by the art direction rather than imposed on it.

### How It Works In High-Contrast Mode

When the player activates Settings → Visual → High Contrast Tiles, the tile rendering shifts:

1. **All biome color collapses to a single neutral grey** (#3A3A3A dark grey base, #5A5A5A for diamond face, #2A2A2A for wall)
2. **The geometric fingerprint renders in bright white** (#E0E0E0) at full opacity
3. **Unit silhouettes sharpen** — chrome player units become pure white, enemy gunmetal becomes pure black
4. **Gameplay overlays gain thickness** — perception radius lines go from 1px to 2px, channel wiring from 1px to 3px
5. **The checkerboard lightens** — alternating tiles shift by 25% luminance (vs. 10-15% in standard mode)

The board transforms from a lush Southeast Asian landscape into a tactical schematic — like switching from a satellite photo to an architectural blueprint. The jungle becomes a field of diagonal hatch marks on grey. The terraces become horizontal ruled lines. The city becomes graph paper. Each is instantly distinguishable by pattern alone.

**Sensory description — High-Contrast Hagdan tile:**
The tile is a dark grey diamond. Three thin white horizontal lines cross its face at even intervals — the ghost of the rice terrace stepping. The wall face below is slightly darker grey, featureless. Corner tick marks are bright white, crisp against the grey. When a Scout occupies this tile, the Scout's pure-white silhouette sits cleanly on the grey surface, its perception radius rendered as a thick white dashed circle — the dash pattern using dots-and-dashes (Scout's unique dash signature from 6.08). A buffer bar of solid white rectangles floats below the unit. There is no ambiguity about anything: what type of tile, what type of unit, what state it's in. The board looks like a submarine tactical display rendered on carbon fiber — clean, precise, ruthlessly readable.

**Sensory description — High-Contrast Gubat tile:**
Identical grey diamond, but the face is covered in thin white diagonal lines running upper-left to lower-right. The diagonals have a slightly organic irregularity — not ruler-straight, but gently wavering, like leaf veins drawn freehand. The wall face has two tiny white horizontal dashes suggesting root tendrils. When combat fires on this tile, the X-mark animation renders in thick white (no red) — impossible to miss, even against the diagonal hatch. Signal delivery uses an upward chevron in white. Two events, two shapes, zero color required.

### Player Journeys

#### Journey: Marko, 34, Protanopic Software Engineer

**Context:** Mission 3 (hooks tutorial). Marko has red-green color vision deficiency. He enabled "High Contrast Tiles" during the tutorial when the boot log mentioned accessibility settings. He's also activated the Protanopia palette swap for non-tile elements (signal flash, combat flash).

**Minute 0:00 — Plan Screen, Inspecting the Board Preview**
The board preview shows an 8×8 grid in the corner of the Plan screen. Marko can immediately identify terrain: the left half of the board has diagonal hatching (jungle), the right half has horizontal lines (terraces). Two rows of crosshatch tiles (city) form a corridor through the middle. He doesn't need to read a legend or hover for tooltips — the patterns are self-documenting after the first tutorial board explained them.

**Minute 0:15 — Configuring Scout Hook**
Marko wires a Scout hook to broadcast on "recon-net." In the board preview, ghost Scouts appear as white silhouettes with thick white dashed-circle perception radii. The perception circles overlap on the terrace tiles. He can see exactly which tiles are covered. In standard mode, cyan circles on green-blue terraces would have been borderline readable for him — but in high-contrast, white-on-grey is unambiguous.

**Minute 1:30 — Sealed Watch, Combat on Jungle Tile**
Tick 8. An enemy Striker enters a jungle tile occupied by Marko's Scout. The tile flashes with a thick white expanding X-mark (combat). The Scout's silhouette vanishes — eliminated. In standard mode, the red flash on green jungle would have been olive-on-olive for Marko's vision. Here, white X-mark on grey-with-diagonal-hatch reads instantly: something died here, on a jungle tile.

**Minute 2:00 — Sealed Watch, Signal on Terrace Tile**
Tick 9. Marko's Relay broadcasts a compressed signal. The horizontal-lined terrace tile where the signal arrives flashes with a white upward chevron. Simultaneously, an adjacent jungle tile (diagonal hatch) flashes with the same chevron. Two different biome tiles, same event type. Marko reads both instantly. In standard mode, he would have seen two slightly-different green flashes — nearly identical to his protanopic vision.

**Minute 4:00 — Inspector, Scrubbing Tick 8**
Marko scrubs back to the combat event. The inspector sidebar shows the decision trace in high-contrast text (white on dark background, no color-coded text — all information conveyed through icons and indentation). He clicks the eliminated Scout to see its final context window state. Each slot is a white rectangle (filled) or outline (empty). No color needed to read fullness.

**What Marko feels:** Relief. He's played other strategy games where "colorblind mode" was a global hue filter that made everything look washed out. Here, the high-contrast tile mode is its own coherent aesthetic — not a degraded version of the "real" game, but an alternative visual language that's arguably *more* readable than the standard art for competitive play.

---

#### Journey: Lina, 62, Low Vision (20/200), Retired Teacher

**Context:** Mission 1 (context window tutorial). Lina uses Windows Magnifier at 300% zoom. She can see a roughly 640×360 pixel region of the screen at a time. She has enabled High Contrast Tiles, Large UI (200% scale), and Screen Reader Announcements.

**Minute 0:00 — Plan Screen, Zoomed Into Board Corner**
At 300% magnification, Lina can see about 4 tiles at once. Each tile is now effectively 192×96 pixels on screen — large enough that the geometric fingerprints are unmistakable. The diagonal hatching of the jungle tiles looks like a miniature blueprint texture. She pans slowly across the board (mouse drag), and the transition from diagonal hatch (jungle) to horizontal lines (terrace) is immediately obvious even at the 2-tile boundary.

**Minute 0:30 — Panning to the Pre-placed Scout**
Lina moves the magnifier viewport to find her pre-placed Scout. The Scout is a bold white silhouette — at 300% zoom, the 👁 icon is clearly visible. The perception radius is a thick white dashed circle. She can see it extends over 5 tiles. She hovers over the Scout, and a tooltip renders in 200%-scaled text: "SCOUT-A | Buffer: 3/6 | Perception: Wide (5)". The screen reader announces the same information.

**Minute 1:00 — Reading Buffer State at High Zoom**
Lina zooms into the Scout's buffer bar. At 300%, the six slots are each about 18 pixels wide — large enough to see that three are filled (solid white rectangles) and three are empty (white outlines). Each filled slot has a tiny icon inside: a map pin (position data), an eye (observation), and a dotted line (signal received). These icons are too small at standard zoom but perfectly readable at Lina's magnification.

**Minute 2:00 — Sealed Watch, Tick-by-Tick**
The sealed watch fires at 1 tick/second. At 300% zoom, Lina watches her visible 4-tile region. When a signal arrives at a tile, the white chevron animation is large enough to be unmistakable — about 60px tall on her screen. She can't see the whole board at once, but the tick-by-tick pacing gives her time to pan. Between ticks, she has a full second to reposition her viewport.

**Minute 3:30 — Inspector, Tile-by-Tile Inspection**
In the Inspector, Lina uses the timeline scrubber (scaled to 200%, thick white handle on grey track). She steps through ticks. At each tick, she pans across the board examining what happened where. The geometric tile patterns tell her exactly which biome she's looking at without needing to see the full board: "diagonal lines... this is jungle. horizontal... terrace. dots... beach."

**What Lina feels:** Included. The game respects her pace — no time pressure, discrete ticks she can step through, and the geometric patterns survive magnification perfectly. The high-contrast mode doesn't feel like an accommodation; it feels like the game was designed for her first and painted over for sighted players second.

---

#### Journey: Kai, 16, Photosensitive, Competitive Gamer

**Context:** Mission 7, advanced play. Kai has photosensitive epilepsy — rapid flashing and high-saturation color shifts can trigger seizures. He's enabled "Reduced Motion + High Contrast" mode, which combines high-contrast tiles with animation dampening.

**Minute 0:00 — Plan Screen**
The board preview renders in the same grey-with-geometric-patterns as standard high-contrast. The key difference in Kai's mode: ghost unit previews don't pulse or shimmer. They're static white silhouettes at 60% opacity. Channel wiring lines don't animate (no travelling dots) — they're static dashed lines.

**Minute 1:00 — Sealed Watch, Reduced Motion**
The tick clock fires. Instead of cell *flashes* (which involve a brightness spike), events are communicated through *persistent markers* that appear and fade over 500ms (well below the 3Hz photosensitive threshold). A combat event renders as a white X-mark that fades in over 250ms, holds for 250ms, then fades out over 500ms. No strobing, no rapid on/off. Signal delivery is a white chevron with the same gentle fade.

The Taal volcano tiles — which in standard mode have jitter animations suggesting tectonic activity — are completely static in Kai's mode. The concentric arc pattern identifies them as volcanic, but nothing moves. The board between ticks is a still image.

**Minute 2:00 — High-Intensity Combat Tick**
Tick 14: three simultaneous combat events and five signal deliveries. In standard mode, this would be a *barrage* of flashing tiles. In Kai's mode, eight tiles simultaneously gain markers (X-marks and chevrons) that fade in gently over 250ms. The visual load is communicated through *quantity* (eight markers appearing at once) rather than *intensity* (flashing). Kai reads the board: three X-marks (combat) on city-grid tiles (crosshatch pattern), five chevrons (signals) on terrace tiles (horizontal lines). The tick resolves, all markers fade, the board is still again.

**Minute 3:30 — Inspector Debrief**
The Inspector shows no animations at all — it's a static analysis tool by nature. The timeline scrubber steps between static board states. This is the phase Kai finds most comfortable. He spends 80% of his time here, building deep understanding of what happened.

**What Kai feels:** Safe. He can play competitively without monitoring his seizure risk. The reduced-motion mode doesn't hide information — it changes the *temporal envelope* of how information is delivered. Everything that flashed now fades. Everything that pulsed is now static. The game is fully readable at a pace his neurology can handle.

---

## Approach B: "Texture Swap" — Full Alternative Tile Sets

**Philosophy:** Instead of overlaying geometric patterns on greyed-out tiles, create entirely separate tile art sets optimized for each accessibility need. Multiple complete tilesets, each hand-crafted.

### Tileset Variants

| Tileset Name | Target | Description |
|------------|--------|-------------|
| **"Standard"** | Full-color vision | The locked SE Asian cyberpunk art. Rich, detailed, culturally specific. |
| **"Blueprint"** | High-contrast / low vision | Grey background, white geometric fingerprints (Approach A above). Technical drawing aesthetic. |
| **"Topographic"** | Moderate low vision | Simplified colors (5 per biome instead of 15+), bolder outlines, exaggerated contrast. The biome is still recognizable as jungle/terrace/etc., but the detail is stripped to essentials. Think USGS topographic map vs. satellite photo. |
| **"Radar"** | Severe low vision / screenreader-adjacent | Flat single-color fills per biome (dark green, brown, tan, blue-grey, orange-red). No texture detail. Maximally thick outlines. Biome identity carried entirely by fill color (which itself is paired with a geometric pattern overlay for colorblind users). |
| **"Paper"** | Photosensitive / reduced visual load | Warm cream (#F5F0E0) background, biome identity through thin brown (#5A4A35) line drawings. The jungle tile has a few diagonal lines suggesting leaves. The terrace has horizontal lines. The city has a grid. All drawn in a single brown ink color on cream, like a hand-sketched field map. Zero saturation, zero animation, minimal contrast. |

### Interaction with Gameplay Overlays

Each tileset must support the same overlay system — perception radii, channel wiring, buffer bars, signal/combat markers. The overlay rendering adapts per tileset:

- **Standard:** Colored overlays (cyan, magenta, etc.)
- **Blueprint:** White overlays on grey, thicker lines
- **Topographic:** Overlays render in a contrasting color per biome (e.g., white on dark-green jungle, dark on light-tan beach)
- **Radar:** Overlays render in black (high-contrast against all fill colors) with shape differentiators
- **Paper:** Overlays render in the same brown ink as the biome lines, distinguished by line weight and dash pattern

### Production Cost Analysis

Five complete tilesets × 5 biomes × 2 checkerboard variants × any damage states = significant asset overhead. But Robot Uprising's tiles are 64×32 pixel art — not 3D-rendered environments. The total pixel count for a complete alternative tileset is approximately 64 × 32 × 10 tiles × 4 bytes/pixel = ~80KB of image data. The art effort is in design, not rendering.

**Realistic scope:** Launch with Standard + Blueprint (Approach A). Add Topographic and Paper in a post-launch accessibility patch. Radar is an extreme edge case — could be a community-contributed tileset.

### Player Journeys

#### Journey: Dani, 28, Graphic Designer with Tritanopia

**Context:** Mission 5 (factory introduction). Dani has blue-yellow color vision deficiency. She's selected the "Topographic" tileset because she still wants to see terrain detail but needs the simplification.

**Minute 0:00 — Campaign Map**
The Philippine archipelago renders in the standard art. Dani navigates to Mission 5 (Cebu — urban). When the mission loads, the board renders in Topographic style: the city tiles are blue-grey blocks with bold dark outlines, clearly distinct from the jungle tiles which are a reduced-palette green with thick dark borders. Every tile has a 2px dark outline — the "topographic contour" that gives this tileset its name.

**Minute 0:30 — Reading the Factory**
Dani's player base is a factory icon on a city tile. In Topographic mode, the factory is rendered as a simplified white building silhouette (no detail, just the outline) with a pulsing production indicator (a horizontal white bar that fills left-to-right during production). The city tile beneath it is blue-grey with crosshatch lines in slightly darker grey. The factory silhouette contrasts cleanly.

**Minute 1:30 — Blueprint Editor**
The blueprint editor (workbench panel, right side) renders in standard UI — the tileset selection only affects the board. Dani configures her first factory blueprint. She can preview it on the board: the ghost unit appears on the Topographic tile with a dashed white outline, clearly distinguishable from the simplified terrain.

**Minute 3:00 — Sealed Watch, Multi-Biome Board**
This mission has jungle tiles in the northwest and city tiles in the southeast. In Topographic mode, the boundary is stark: diagonal-hatched green blocks end, crosshatched blue-grey blocks begin. The transition tile (if one exists) uses a split treatment — half diagonal, half crosshatch. Dani reads the terrain layout in under 2 seconds.

**What Dani feels:** Delighted by the Topographic aesthetic. It reminds her of the technical drawings she makes at work. She actually prefers it to the standard art — the bold outlines and reduced palette make the board state snappier to read. She tweets a screenshot with "Robot Uprising's topographic mode is genuinely beautiful" — accessible design as aesthetic choice, not accommodation.

---

## Approach C: "Dynamic Contrast" — Adaptive Per-Tile Contrast Enhancement

**Philosophy:** Instead of replacing the tile art, dynamically adjust each tile's contrast and brightness based on what's happening on it. The tile art stays, but the engine modulates it.

### Mechanism

Every tile has a "contrast score" computed per tick:
- **Base score:** The biome's inherent contrast (city tiles have high base contrast from neon; jungle has low contrast from uniform green)
- **Overlay count:** Each gameplay overlay on the tile (unit, perception radius, signal path, tag marker) increases the score
- **Event intensity:** Combat or signal events temporarily spike the score

When the score exceeds a threshold, the tile's rendering adjusts:
1. **Mild (1-2 overlays):** Tile dims to 70% brightness, overlays render at 130% brightness. The overlay "pops" from the dimmed background.
2. **Moderate (3-4 overlays):** Tile dims to 50% brightness and desaturates to 50%. Overlays render at full brightness with a 1px glow halo.
3. **Intense (5+ overlays / combat event):** Tile drops to 30% brightness, fully desaturated. Overlays render in high-contrast white with 2px glow. The tile becomes a dim grey stage for the gameplay event.

### Strengths

- **No alternative art needed.** The standard tiles are always used; only brightness/saturation modulation is applied.
- **Contextually adaptive.** Empty tiles stay beautiful. Busy tiles become readable. The player sees the full art most of the time.
- **Works for all vision types.** The dimming/desaturation effect improves contrast for colorblind players (reduced color competition), low-vision players (stronger overlay-vs-background contrast), and typical-vision players (reduced visual clutter during complex moments).

### Weaknesses

- **Biome identity degrades during combat.** When a jungle tile is dimmed to 30% grey with desaturation, it looks like every other biome at the same dimming level. The player loses terrain awareness during the moments when terrain matters most.
- **Unpredictable.** Players can't control when their tiles will dim. A player who prefers the standard art may find the automatic dimming jarring.
- **Insufficient for severe impairments.** A player who can't distinguish the biomes at *full* color/contrast will not benefit from dimming — they still can't see the patterns.

### Player Journey

#### Journey: Sam, 41, Macular Degeneration (Central Vision Loss)

**Context:** Mission 6. Sam has age-related macular degeneration — reduced central vision, preserved peripheral vision. He uses a combination of Dynamic Contrast and OS-level magnification.

**Minute 0:00 — Plan Screen**
Sam sees the board with his peripheral vision while focusing the magnifier on the workbench panel. The tiles render at full beauty. When he pans the magnifier to the board, the tiles he's inspecting are at standard contrast — crisp and detailed at magnification.

**Minute 1:00 — Sealed Watch, Early Ticks**
The board is sparse — few units, few signals. All tiles render at full beauty. Sam uses peripheral vision to track movement (his peripheral vision is relatively strong). When a unit enters a tile, the tile dims slightly (Mild level) — the unit pops against the dimmed background, making peripheral detection easier.

**Minute 2:30 — Sealed Watch, Combat Cluster**
Three units converge on the same region. The tiles beneath them dim to Moderate. Sam's peripheral vision catches the contrast change — "something is happening in the northeast." He pans the magnifier there. The tiles are desaturated enough that the white unit silhouettes are clearly distinct. The combat X-mark, rendered with a glow halo, is visible even to his reduced central acuity.

**What Sam feels:** The dynamic contrast is "good enough" for his condition but not perfect. He wishes he could lock tiles to a specific contrast level. The automatic modulation helps in combat but sometimes triggers on empty tiles when a perception radius passes through. He'd prefer to combine Dynamic Contrast with the Blueprint tileset for maximum readability.

---

## Approach D: "Multimodal Redundancy" — Every Tile Announces Itself

**Philosophy:** Tile identity isn't just visual. Every tile carries biome information through multiple non-visual channels simultaneously, so any single channel can fail and the player still knows what tile they're looking at.

### Channels

1. **Visual (Geometric fingerprint):** As described in Approach A — diagonal hatch, horizontal lines, dots, grid, arcs.
2. **Audio (Ambient signature):** Each biome has a subtle ambient sound that plays when a unit occupies or passes through it. Jungle: insect chirp. Terrace: water drip. Beach: wave whisper. City: distant hum. Volcano: deep rumble. These are *very* quiet — subliminal texture, not soundtrack. They play from the spatial position of the tile (if stereo/spatial audio is available).
3. **Screen reader (Tile announcement):** Hovering over or navigating to a tile triggers a screen reader announcement: "B4, jungle" / "E7, terrace" / "A1, city." Keyboard navigation (arrow keys during Plan screen) announces each tile as the cursor moves.
4. **Haptic (Controller vibration pattern):** When navigating tiles with a controller, each biome has a unique vibration pattern: jungle = short double pulse, terrace = three quick taps (stepping rhythm), beach = long slow roll, city = sharp single click, volcano = sustained low rumble.
5. **Tooltip (On-hover label):** Mouse hover shows a small "JUNGLE" / "TERRACE" label above the tile. Optional (Settings → Visual → Show Tile Labels). In high-contrast mode, this is always on.

### The "Audio Tile Walk" Technique

A blind player navigating the board with arrow keys hears a rapid succession of biome sounds: *chirp-chirp-chirp-drip-drip-drip-drip-hum-hum* — they're moving from the jungle region through terraces into the city. The sonic texture of the board builds a mental map. Combined with the screen reader announcing grid coordinates, a blind player can build complete spatial awareness of the 8×8 board in about 30 seconds of navigation.

### Player Journey

#### Journey: Ava, 22, Blind, Computer Science Student

**Context:** Mission 2 (rules tutorial). Ava is completely blind. She uses a screen reader (NVDA on Windows) with the game's accessibility API. She has never played a visual strategy game.

**Minute 0:00 — Plan Screen, Board Exploration**
The screen reader announces: "Plan screen. Board: 8 by 8. Cursor at A1." Ava presses right arrow. "A2, jungle." Right again. "A3, jungle." Again. "A4, terrace." She hears the ambient shift — insect chirp fades, water drip emerges. "A5, terrace." "A6, city." Ambient: distant hum. She's building a mental model: left side is jungle, middle is terrace, right side is city.

**Minute 0:30 — Finding Her Units**
She presses Tab — the cursor jumps to the first friendly unit. "B3, Scout Alpha. Jungle tile. Buffer: 2 of 6 slots used. Perception: wide, 5 tiles." She presses Tab again. "D5, Striker Bravo. Terrace tile. Buffer: 3 of 8 slots used." She now knows where her units are, what tiles they're on, and their current state.

**Minute 1:00 — Configuring Rules**
She tabs to the workbench panel. "Rule editor. Scout Alpha. Rule 1: empty." She activates the rule slot. "Condition dropdown: buffer full, enemy adjacent, signal received, idle." She selects "signal received." "Action dropdown: move toward source, move away from source, broadcast, evade." She selects "evade." "Rule 1 configured: IF signal received THEN evade."

**Minute 2:00 — Sealed Watch, Audio-Only Battle**
The sealed watch begins. The screen reader shifts to event narration: "Tick 1. Scout Alpha moves to B4, jungle. Enemy Striker enters D3, terrace." Ava hears ambient jungle chirp from the left speaker (Scout's position) and a terrace drip from center-right (enemy position). "Tick 2. Scout Alpha observes Enemy Striker at D3. Buffer now 3 of 6." The game plays a soft chime (observation added to buffer). "Tick 3. Enemy Striker moves to C3, terrace." The terrace drip sound shifts slightly left — spatial audio tracking the enemy's movement.

**Minute 3:00 — Inspector, Full State Replay**
Ava enters the inspector. "Inspector. Tick selector: 1 of 8. Use left/right arrows." She steps through ticks. At each tick, the screen reader gives a full state announcement: all unit positions, all buffer contents, all events. She can inspect a specific unit by pressing its shortcut key (S for Scout, K for Striker — mnemonic keys announced during onboarding).

**What Ava feels:** Amazement. She's playing a strategy game. Not a simplified version, not an audio-only spin-off — the actual game, with the same rules, the same depth, the same decisions. The screen reader integration doesn't dumb anything down; it translates the full game state into her modality. She posts on a blind gaming forum: "Robot Uprising is the first strategy game I can actually play competitively."

---

## Approach Comparison Matrix

| Dimension | A: Geometric Fingerprint | B: Texture Swap | C: Dynamic Contrast | D: Multimodal Redundancy |
|-----------|-------------------------|-----------------|---------------------|--------------------------|
| **Implementation cost** | Low (shader overlay) | High (5 tilesets × 5 biomes) | Medium (per-tile shader) | High (audio, haptic, screenreader) |
| **Colorblind coverage** | Excellent (shape, not color) | Excellent (per-tileset) | Good (reduces color competition) | Excellent (audio + shape) |
| **Low vision coverage** | Good (high contrast, geometric) | Excellent (Radar tileset) | Moderate (only helps when overlays present) | Excellent (screen reader) |
| **Blind coverage** | None (still visual) | None (still visual) | None (still visual) | Complete (audio + screen reader) |
| **Photosensitive coverage** | Excellent (with reduced motion) | Good (Paper tileset) | Poor (dynamic changes unpredictable) | Good (can disable visual, use audio) |
| **Cultural identity preserved** | Partially (patterns reference biomes abstractly) | Partially (Topographic preserves some) | Yes (standard art, just dimmed) | Yes (standard art + non-visual channels) |
| **Competitive viability** | High (pros may prefer Blueprint) | High (Topographic as competitive standard) | Medium (unpredictable dimming) | High (additional info channels) |
| **Art effort** | 1 pattern set | 4 additional tilesets | None (runtime computation) | 1 pattern set + audio + haptic + screen reader |

---

## Recommended Configuration: "The Layered Stack"

The approaches aren't mutually exclusive. The recommended design is a **layered accessibility stack** where each approach is a toggleable layer:

### Layer 0: Standard Art (Always present)
The locked SE Asian cyberpunk pixel art. The default.

### Layer 1: Shape-First Patterns (Approach A, on by default)
Geometric fingerprints are subtly embedded in the standard art. They're visible if you know to look for them — the jungle's diagonal energy, the terrace's horizontal banding, the city's grid structure. Not overlaid, *inherent*. This means the game is partially accessible to colorblind players out of the box, with zero settings changes.

### Layer 2: High-Contrast Mode (Approach A active, user toggle)
Settings → Visual → High Contrast: On. Tiles grey out, geometric patterns render in white. Overlays thicken. Checkerboard contrast increases. The "Blueprint" aesthetic.

### Layer 3: Alternative Tilesets (Approach B, user selection)
Settings → Visual → Tile Style: Standard / Blueprint / Topographic / Paper / Radar. Each is a coherent complete aesthetic, not a degraded version of Standard. Post-launch additions welcome.

### Layer 4: Dynamic Contrast (Approach C, user toggle)
Settings → Visual → Adaptive Tile Contrast: On/Off. Dims busy tiles to foreground overlays. Can be combined with any tileset. Defaults to Off (predictability preferred).

### Layer 5: Multimodal Redundancy (Approach D, always available)
Screen reader support is always active if a screen reader is detected. Biome ambient audio is always playing (can be muted in audio settings). Haptic patterns activate when controller is connected. Tile label tooltips toggled in Settings → Visual → Show Tile Labels.

### Interaction: Layers can be combined freely.

A player might use: Standard Art + Dynamic Contrast + Biome Audio (subtle enhancement).
Another might use: Blueprint Tileset + Screen Reader + Haptic (blind-friendly).
Another might use: Paper Tileset + Reduced Motion (photosensitive).
Another might use: Standard Art + Tile Labels (just wants text confirmation).

---

## The TikTok Clip

A split-screen comparison. Left: the standard art — lush jungle tiles, glowing neon city, water-shimmer terraces, the full SE Asian cyberpunk beauty. Right: the Blueprint mode — the same board, the same game state, rendered as a tactical schematic in white-on-grey with geometric patterns. Both are beautiful. Both are readable. The caption: "Same game. Same depth. Your eyes, your rules." The clip transitions between all five tilesets in a smooth animation — Standard melts into Topographic, which sharpens into Blueprint, which softens into Paper, which fills into Radar. The unit positions, the signals, the buffer bars — all perfectly readable in every mode. The viewer thinks: "Wait, the *paper* mode is gorgeous."

---

## Comparable Games & What We Learn

### Into the Breach (Subset Games)
Includes a colorblind mode that ensures enemy type icons (the Alpha Vek icon specifically) are distinguishable by shape, not just color. The game's visual clarity standard — every tile state readable in under 2 seconds — is the gold standard Robot Uprising should match across all accessibility modes. Into the Breach's *weakness:* no high-contrast tileset, no screen reader support, no alternative aesthetic modes. Robot Uprising can surpass it.

### FC 26 (EA Sports)
The first competitive multiplayer game to support highly customizable high-contrast modes — configurable color overlays for every entity type (home/away/referee), pitch desaturation slider, shadow toggles. Available in ALL game modes including ranked PvP. This precedent is critical: **accessible modes in competitive play are no longer controversial.** Robot Uprising should allow all tileset variants in ranked/Gauntlet play.

### DOOM: The Dark Ages (id Software)
Configurable degrees of environment desaturation with separate hue/opacity options for enemies, hazards, interactables, pickups, and attacks. This is the Dynamic Contrast approach (Approach C above) executed at AAA scale. What we learn: per-entity overlay configuration is more useful than global desaturation.

### Azul (Board Game, Plan B Games)
Six tile colors, each with a unique geometric symbol (crescent, star, diamond, etc.). Colorblind players identify tiles by symbol alone. The symbols are small but immediately recognizable. This is Approach A's direct ancestor — shape-first biome identity.

### Hue (Fiddlesticks Games)
A color-based puzzle game that experimented with pattern overlays for accessibility but found they created too much visual noise when combined with the intricate art. The lesson: **Pattern density must be calibrated so it enhances readability without creating its own visual clutter.** Robot Uprising's 64×32 tiles have limited pixel real estate — patterns must be sparse enough to leave room for the tile's face to breathe, even in high-contrast mode.

### Civilization (Firaxis)
Civ VI added colorblind options in a 2019 patch, including a "Jersey system" that auto-adjusts civilization colors when they're too similar. But the implementation was buggy — the colorblind dropdown locked after first use. Civ has no high-contrast mode, no alternative tile aesthetic, no screen reader support. The series represents the strategy-game accessibility status quo: minimal, afterthought, fragile. Robot Uprising should be the *counterexample.*

---

## Open Questions for Adjacent Aspects

1. **Transition tiles under high-contrast:** When jungle meets terrace, the transition tile uses a split geometric pattern — diagonal hatch on one half, horizontal lines on the other. But at 64×32, splitting a diamond diagonally creates a visually confusing micro-pattern. Does the transition tile need its own unique pattern (e.g., chevrons, suggesting the junction point)?

2. **Damage state visibility in high-contrast:** The dynamic tile damage system (6.01a-iii) uses cracking, scorching, vine-reclaiming visuals. In high-contrast Blueprint mode, how are damage states communicated? White crack lines on grey? Dashed outlines replacing solid outlines? A damage icon overlaid?

3. **Signal propagation visuals per tileset:** Biome-specific signal propagation visuals (6.01a-ii) change per biome — city fiber optic lines, jungle rustling leaves, terrace water ripples. In Blueprint mode, do signals use a universal propagation visual (e.g., expanding white ring) or do they maintain biome-specific patterns in white-on-grey?

4. **Competitive integrity:** If the Blueprint tileset provides strictly more readable information (sharper biome boundaries, thicker overlay lines), does it create a competitive advantage? Should Gauntlet/ranked play enforce a single tileset, allow all tilesets, or normalize tileset choice by ensuring all tilesets convey identical information at identical readability?

5. **Community-contributed tilesets:** The Paper and Radar tilesets are simple enough that community artists could create alternatives. Should there be a tileset mod system? What constraints ensure modded tilesets maintain gameplay readability (minimum contrast ratios, required geometric patterns)?

---

## New Aspects Discovered

- **6.01a-v-i** — Transition tile geometric pattern design: when two biomes meet, how their geometric fingerprints merge or split at the boundary; the "junction pattern" as a distinct visual element
- **6.01a-v-ii** — Damage state communication in high-contrast mode: crack lines, scorch marks, vine-reclaim visuals translated to Blueprint/Paper/Radar tilesets; damage as pattern disruption
- **6.01a-v-iii** — Competitive integrity of tileset choice: whether tileset variants create measurable readability advantages; "tileset normalization" rules for ranked play
- **6.01a-v-iv** — Community tileset modding API: constraints, validation, contrast ratio enforcement, and distribution for player-created tilesets
- **6.01a-v-v** — Biome ambient audio design for blind navigation: detailed specification of the five biome sounds, their spatial audio behavior, volume curves, and the "audio tile walk" technique as primary board exploration for blind players
