# 6.01a — Tile Art Deep Dive Per Biome

## The Challenge: Philippine Geography in 64×32 Pixels

A single isometric tile in Robot Uprising is 64 pixels wide by 32 pixels tall — a diamond that, after accounting for the 2:1 pixel ratio edges and checkerboard treatment, offers roughly **1,024 visible pixels** of terrain surface. Within this microscopic canvas, each tile must:

1. **Communicate terrain type** at a glance (jungle vs. beach vs. city)
2. **Carry cultural specificity** — not "generic tropical" but *Philippine* tropical
3. **Support gameplay overlays** — perception radii, channel wiring, buffer bars, EM rings, ghost units
4. **Tile seamlessly** with adjacent tiles of the same and different types
5. **Follow Into the Breach's clarity standard** — the board state must be readable in under 2 seconds

This analysis explores each of the five locked biomes at pixel-level detail: what every pixel row does, what cultural markers survive at this scale, what the tile *feels* like under gameplay overlays, and how transitions between biomes work.

---

## The Universal Tile Anatomy

Every 64×32 isometric tile in Robot Uprising shares a common structure before biome-specific treatment:

```
Row 0:        (1 pixel — diamond apex)
Rows 1-3:     TOP EDGE (expanding 2:1 slopes, corner tick marks at rows 1 and 3)
Rows 4-7:     UPPER FACE (terrain surface — brightest zone, primary biome detail)
Rows 8-11:    MIDLINE (terrain surface — secondary detail, checkerboard differentiation)
Rows 12-15:   LOWER FACE (terrain surface — subtle shadow gradient)
Rows 16-27:   WALL FACE (left and right walls visible below diamond — terrain depth)
Rows 28-31:   BOTTOM EDGE (converging 2:1 slopes, bottom tick marks)
Row 31:       (1 pixel — diamond nadir)
```

**Checkerboard treatment:** Alternating tiles shift the surface palette by 1 shade darker/lighter. The difference is subtle (10-15% luminance shift) — enough to read as a grid, not enough to compete with units or overlays. Into the Breach uses this exact technique: alternate tiles are barely distinguishable, creating a chess-feel without visual noise.

**Corner tick marks:** 2-pixel bright marks at each cardinal corner of the diamond (north, east, south, west). Color: 20% brighter than tile edge. These are the primary grid-reading aid — they let the eye trace grid lines without drawing actual lines across the board.

**Axis labels (A-H, 1-8):** Rendered in the board margin, not on tiles themselves. Monospace, 5×7 pixel font, same teal as the boot log.

**Lighting convention:** Top-left light source. The upper-left face of the diamond is brightest, upper-right face is 15% darker, and the wall faces (if visible) use the Into the Breach standard: left wall medium, right wall darkest.

---

## Biome 1: "Gubat" — Tropical Jungle

### Real-World Reference: Sierra Madre, Cordillera Mossy Forest, Palawan Mangrove Edge

The Philippines contains one of the densest tropical forests on Earth. The Sierra Madre mountain range runs the length of Luzon, covered in dipterocarp forest — towering emergent trees (30-50m) over a dense canopy of palm, bamboo, fern, and epiphyte. At altitude, the Cordillera cloud forest has moss-draped trees, ferns growing on every surface, and perpetual mist. At sea level, Palawan's forests transition to mangrove at the coast, with exposed root systems creating organic lattice patterns.

**Key visual signatures at macro scale:**
- Layered green canopy with darker shadows between leaf clusters
- Visible trunk/branch lines breaking through foliage
- Epiphytes (ferns, orchids) growing on other plants
- Mist/humidity haze
- Red-brown earth visible in clearings
- Bamboo — distinctively yellow-green, segmented

### Pixel-Level Tile Design

**"Gubat-A" — Dense Canopy (primary jungle tile)**

| Row Range | Content | Colors |
|-----------|---------|--------|
| 0-3 | Diamond edge, tick marks | #1B4332 edge, #3A7D5E tick |
| 4-7 | **Canopy surface.** Three leaf clusters rendered as irregular 3-5px wide blobs of #52B788 (highlight) over #2D6A4F (midtone). Darkest gap between clusters is #1B4332. One cluster extends to the north edge, one to the east, gap in between. A single 2px bamboo stalk accent — yellow-green #9ACD32 — emerges at the 5 o'clock position of the diamond. | #52B788, #2D6A4F, #1B4332, #9ACD32 |
| 8-11 | **Understory shadow.** Darker canopy (#1B4332 dominant) with tiny 1px fern frond accents at regular intervals — a zigzag pattern of #3A7D5E pixels suggesting fern shapes. One 2px orchid accent — a single dot of #D4A373 (warm earth tone that reads as a tiny tropical flower). | #1B4332, #3A7D5E, #D4A373 |
| 12-15 | **Forest floor shadow.** Deep shadow (#0B2618) with scattered 1px highlights (#2D6A4F) suggesting filtered light hitting the ground. The checkerboard variant shifts the light dots one pixel right, creating parallax when the eye sweeps across the board. | #0B2618, #2D6A4F |
| 16-27 | **Earth wall.** Red-brown earth (#5C3A21 left face, #3D2614 right face) with 1px root tendrils (#6B8F47) emerging from the surface — two or three horizontal 2-3px lines of root matter visible in the wall face, the organic Filipino forest floor where everything grows from everything. | #5C3A21, #3D2614, #6B8F47 |
| 28-31 | Diamond edge, bottom tick | #1B4332 edge |

**Checkerboard variant:** The alternate tile shifts the three canopy clusters one pixel south and swaps the bamboo accent for a hanging vine (2px vertical line of #3A7D5E dangling from the north edge). The orchid dot moves to 7 o'clock. The overall effect: when tiles are adjacent, the canopy clusters form a continuous, slightly irregular green surface rather than repeating visibly.

**"Gubat-B" — Bamboo Grove (secondary jungle tile)**

Same structure as Gubat-A but the 4-11 rows are dominated by vertical bamboo segments: three parallel stalks of #9ACD32 (2px wide each) with darker (#6B8F47) joint marks every 4 pixels. The spaces between bamboo stalks are deep shadow (#1B4332). This tile is used for choke-point jungle — visually it reads as "structured" jungle vs. the organic canopy of Gubat-A, and the vertical lines naturally draw the eye, making units on this tile more visually prominent.

### Cultural Detail at 64×32

What survives at this scale:
- **Bamboo** — 2px segments are instantly recognizable. Bamboo is ubiquitous in Philippine construction, transport, and daily life. The segmented yellow-green stalk is a visual fingerprint.
- **Orchids** — A single warm-toned dot among green reads as a tropical flower. Not identifiable as an orchid specifically, but "tropical forest with flowers" vs. "generic green forest."
- **Root systems** — The 2-3px root tendrils in the wall face are the mangrove-inspired detail. At full zoom they're just lines, but grouped across multiple tiles they create an "everything is growing" organic lattice.
- What does NOT survive: individual leaf shapes, mist effects, epiphyte detail, canopy layering. At 64×32, the canopy is blobs of green. The cultural specificity lives in the *palette* (Filipino tropical green is warmer and more saturated than temperate forest green) and the *accents* (bamboo, orchid dot, root lattice).

### Under Gameplay Overlays

- **Perception radius (cyan dashed circle):** Reads well against the green — high contrast. The circle cuts through canopy and shadow equally.
- **Channel wiring (magenta lines):** Excellent contrast against green. The complementary color relationship (green vs. magenta) is the strongest possible.
- **Buffer bars (colored pips below unit):** Unit sits on canopy surface. Buffer bar pips render in the wall-face zone. The dark earth wall provides clean backdrop for green/amber/red pips.
- **EM emission rings (expanding orange circles):** Good contrast against green. The warm emission color picks up the orchid accents — a subtle "the jungle is watching" resonance.
- **Ghost units (50% opacity cyan tint):** The ghost shimmer conflicts slightly with the green canopy — both are cool-toned. Mitigation: ghost units on jungle tiles use a slightly warmer cyan (#40E8D8 teal) to differentiate from the foliage green.

### Sensory Description

The jungle tiles form a carpet of deep green across the board — not flat, not uniform, but *breathing*. Each tile's canopy clusters catch the top-left light slightly differently, and the bamboo accents punctuate the green like vertical exclamation marks. When the board is populated with chrome-silver units, they look like interlopers — foreign metal objects placed on an ancient living surface. In the sealed watch, when a combat flash fires (red cell), the red pulses against the green like a wound in the forest. Signal delivery flashes (green) are harder to read here — the green-on-green is intentional: in the jungle, information flows blend into the environment. You have to look harder. The sound design for jungle tiles should lean into this: ambient insect hum, distant birdsong, a wet quality to the tick-clock snap suggesting humidity. When a unit is eliminated on a jungle tile, the combat flash fades into a brief warm-brown afterimage — the jungle reclaiming.

---

## Biome 2: "Hagdan" — Rice Terrace

### Real-World Reference: Banaue/Batad/Hungduan Rice Terraces, Ifugao Province

The Ifugao rice terraces are 2,000-year-old agricultural marvels — stepped pond fields carved into mountain contours at 1,500m elevation, irrigated by forest springs from the *muyong* (communal managed forest) that caps each terrace cluster. The Batad terraces form an amphitheatre — concentric arcs stepping down from a forested ridge. The Hungduan terraces uniquely emerge into a spider-web pattern. Stone or mud retaining walls (50cm-3m tall) separate each level. Water in the paddies reflects sky and cloud. Green rice shoots grow in shallow standing water.

**Key visual signatures at macro scale:**
- Horizontal stepped lines (the terraces themselves)
- Water reflecting light between green shoots
- Stone/mud retaining walls with moss
- Green vegetation gradients (dark forest above, bright rice below)
- Mist in valleys between terrace clusters

### Pixel-Level Tile Design

**"Hagdan-A" — Active Terrace (primary rice terrace tile)**

| Row Range | Content | Colors |
|-----------|---------|--------|
| 0-3 | Diamond edge, tick marks | #5C7A3E edge (muted earth-green), #8FBC6A tick |
| 4-7 | **Paddy surface — upper terrace.** Horizontal bands: 2px of water (#7EC8E3 light sky-reflecting blue) then 2px of rice shoots (#74C69D bright green) then 2px of water again. The horizontal banding is THE visual signature — even at 64×32, three horizontal stripes immediately read as "terraces." A single 1px stone wall line (#8B7355 warm grey-brown) runs along row 7, separating the upper terrace from the next. | #7EC8E3, #74C69D, #8B7355 |
| 8-11 | **Paddy surface — lower terrace.** Same horizontal banding but shifted: rice-water-rice (reversed pattern from upper terrace). The alternation between tiles creates a stepped visual rhythm across the board. Row 11: another 1px stone wall line. | Same as above, shifted |
| 12-15 | **Third terrace + shadow.** Compressed: 1px water, 1px rice, then gradient into shadow (#4A6328). The lowest visible terrace is darkened as if in the shadow of the wall above. | #7EC8E3, #74C69D, #4A6328 |
| 16-27 | **Retaining wall.** This is where the cultural detail lives. The left wall face is stone: irregular 2-3px blocks of #8B7355 (warm stone) with #6B5B3F (shadow between blocks) and 1px moss accents (#6B8F47) growing in the joints. The right wall face is darker (#5A4A35) with the same block pattern. The stone block pattern is NOT regular bricks — it's irregularly shaped, suggesting hand-fitted stone, the 2,000-year-old Ifugao engineering. Two 1px green dots on the wall face suggest fern growth from between stones. | #8B7355, #6B5B3F, #5A4A35, #6B8F47 |
| 28-31 | Diamond edge, bottom tick | #5C7A3E edge |

**Checkerboard variant:** Water and rice bands swap (water-rice-water becomes rice-water-rice), and the moss accents on the wall shift position. The 1px stone wall lines at rows 7 and 11 remain constant — they're the grid-line equivalent for terraces, always present.

**"Hagdan-B" — Muyong Forest Cap (secondary terrace tile, used at board edges)**

The upper half (rows 4-11) is dense forest similar to Gubat-A but with a distinctly different palette — cooler, higher-altitude green (#3B7A57 mossy) with 1px mist dots (#C8D8E4 pale blue-grey) scattered across the canopy. Rows 12-15 transition sharply to the first terrace step (water-rice-wall). This tile sits at the board edge where the forest meets the cultivated terraces — it anchors the setting by showing the *muyong* irrigation source above.

**"Hagdan-C" — Data-Light Terrace (cyberpunk variant)**

Identical to Hagdan-A but with a critical addition: every 8 pixels along the stone wall lines (rows 7, 11), a single pixel glows #18E0FF (signal cyan). These are the "data-lights embedded in the steps" described in the art direction spec — tiny embedded sensors monitoring water levels, soil pH, nutrient flow. At a distance, the terrace wall sparkles faintly with cool-blue dots among the warm stone. This is the cyberpunk layer: ancient terraces repurposed as cooling infrastructure for hidden server farms, their irrigation channels carrying data alongside water.

### Cultural Detail at 64×32

What survives at this scale:
- **Horizontal terracing** — THE signature. Three horizontal bands of water/rice at different levels, separated by stone lines. Unmistakable. No other terrain type on Earth creates this pattern.
- **Hand-fitted stone** — The irregular block pattern in the wall face (as opposed to regular brickwork) reads as "ancient construction" rather than "modern wall." At pixel scale, 2-3px irregular shapes with moss in joints.
- **Water reflection** — The sky-blue horizontal bands are the water in the paddies. Even at this scale, "blue horizontal lines in a green field" reads as flooded terraces.
- **Data-lights** — Single cyan pixels in stone walls. The contrast between ancient warm stone and cool tech glow IS the cyberpunk thesis of the game.
- What does NOT survive: individual rice shoots, the amphitheatre curvature of Batad, the mist in valleys, the *bale* houses. The muyong-to-terrace transition in Hagdan-B tile partially recovers the forest-cap context.

### Under Gameplay Overlays

- **Perception radius (cyan):** Conflicts slightly with the data-light cyan dots in Hagdan-C. Mitigation: perception radii use a dashed pattern; data-lights are solid. The dashes create visual differentiation.
- **Channel wiring (magenta):** Excellent contrast against the green-blue palette. Magenta lines crossing the terraces look like fiber optic cables running alongside irrigation channels — thematically resonant.
- **Buffer bars:** The wall face provides a warm-neutral backdrop. Buffer pips are highly readable.
- **Ghost units:** Cyan ghost shimmer harmonizes with the data-lights — ghost units on terrace tiles look like they're *part of the infrastructure*, which is thematically perfect for the plan screen preview.

### Sensory Description

The terrace tiles create a landscape of horizontal rhythm across the board. Where jungle is organic and irregular, the terraces are structured, human-made, *ancient.* The alternating water-and-rice bands catch the light differently each tick — a subtle shimmer as the water pixels pulse between #7EC8E3 and #6AB8D3 (a 1-shade animation at 0.5Hz, barely perceptible, suggesting wind rippling the paddies). The stone walls glow faintly with embedded data-lights, cool blue against warm brown, and when a relay unit sits on a terrace tile, its antenna seems to emerge from the stone as if the terraces grew it. Combat on terraces is sharp — the red flash against the structured horizontal lines feels like a disruption of order, an intrusion into something carefully built over millennia. The audio here: a gentle water trickle underlying the tick clock, the sound of irrigation channels flowing. When a signal is delivered across terrace tiles, the delivery flash follows the horizontal banding — a ripple rather than a burst.

---

## Biome 3: "Baybay" — Tropical Beach

### Real-World Reference: Boracay White Beach, El Nido Lagoons, Siargao Surf Coast

Boracay's White Beach — 4 kilometers of powdery white sand (local name *borac* = "white cotton"), turquoise-to-emerald shallows, palm fronds casting sharp shadows. El Nido: dramatic limestone karsts framing lagoons where water clarity lets you count fish at 3-meter depth. Siargao's east coast: darker volcanic sand, surf foam, raw Pacific energy. The Philippines has 36,289 km of coastline — more than the contiguous United States.

**Key visual signatures at macro scale:**
- White/golden sand gradient from dry (bright) to wet (darker, reflective)
- Turquoise shallow water transitioning to deep blue
- Foam lines at water's edge
- Palm tree silhouettes casting diagonal shadows
- Limestone formations (pale grey-white, dramatic vertical)
- Coral visible through shallow water (darker patches in turquoise)

### Pixel-Level Tile Design

**"Baybay-A" — Dry Beach (primary beach tile)**

| Row Range | Content | Colors |
|-----------|---------|--------|
| 0-3 | Diamond edge, tick marks | #D4A373 edge (warm sand), #FEFAE0 tick (bright) |
| 4-7 | **Dry sand surface.** A warm gradient from #FEFAE0 (white-gold, sunlit) at the north edge to #D4A373 (deeper gold) at row 7. Two tiny details: (1) a 2px diagonal shadow line at 45° — #C4935C darker sand — suggesting a palm frond shadow falling across the tile. (2) A single 1px shell accent — #E8D5C4 (pale pink-cream) — at the 3 o'clock position. The shadow line is the Filipino beach fingerprint: palm fronds cast these sharp-edged diagonal shadows on white sand in equatorial noon light. | #FEFAE0, #D4A373, #C4935C, #E8D5C4 |
| 8-11 | **Mid-sand.** Uniform warm sand (#D4A373) with scattered 1px texture dots (#C4935C, #E9C46A) suggesting sand grain variation. The checkerboard variant shifts the shadow line to 135° (the alternate palm frond). | #D4A373, #C4935C, #E9C46A |
| 12-15 | **Lower sand + damp edge.** Gradient to slightly darker (#BC8A5E) suggesting the sand is closer to the water line. A 1px line of #A8CCDB (pale blue-grey) at row 15 hints at moisture — the wet sand where the last wave reached. | #BC8A5E, #A8CCDB |
| 16-27 | **Sand cliff wall.** Compacted sand layers: #BC8A5E (left face), #9A7A52 (right face, shadowed). Horizontal banding at 4px intervals — visible sediment layers in the sand cliff. One 2px coral fragment accent (#F0E6D3 pale cream) embedded in the wall, suggesting a beach eroded from ancient coral reef. | #BC8A5E, #9A7A52, #F0E6D3 |
| 28-31 | Diamond edge, bottom tick | #D4A373 edge |

**"Baybay-B" — Shoreline (transition tile)**

The critical beach tile. Upper half (rows 4-9): wet sand — darker, reflective (#A8937A with 1px shimmer highlights of #C8E0EC, the "glassy" wet sand look). A 2px foam line runs diagonally across rows 8-9: scattered white (#F0F3FF) and pale blue (#D4EEF7) pixels in an irregular fringe — wave foam retreating. Lower half (rows 10-15): shallow water — #48BFE3 (turquoise) with 1px darker patches (#2A9BC2) suggesting coral or seagrass visible through crystal water. The wall face below is submerged — the left wall is dark water (#1A6B8A) and the right wall is even darker (#0E4F6B), with a single 1px bright spot (#48BFE3) suggesting light refracting underwater.

**"Baybay-C" — Deep Water (ocean tile)**

Full tile is water. Surface (rows 4-15): #0A5E7D (deep blue-green) with gentle 2px wave patterns — pairs of 1px lighter (#1A7A9D) pixels in diagonal waves suggesting ocean surface texture. One foam cap accent: a 3px cluster of #D4EEF7 at the 2 o'clock position. Wall face: deep dark water (#0A3D54 left, #062D3E right), uniform, suggesting depth. This tile is used for water obstacles or board edges.

**"Baybay-D" — Limestone Karst (El Nido inspired)**

A vertical accent tile. The surface (rows 4-7) is flat limestone — pale grey-white (#D5CFC4) with 1px crevice lines (#A89E8E). But the wall face (rows 16-27) is the star: tall pale limestone walls (#D5CFC4 left, #B5AFA4 right) with visible erosion — horizontal 1px lines of darker (#A89E8E) where water has carved channels, and 2-3 scattered bright green (#52B788) 1px dots where tropical vegetation clings to the rock face. The dramatic height of the wall face (and the vertical detail it carries) makes this tile read as "cliff" or "elevated terrain."

### Cultural Detail at 64×32

What survives at this scale:
- **Palm frond shadow** — A 2px diagonal shadow line on white sand IS a palm shadow. This is the single most efficient cultural marker. No other tree casts this sharp, narrow, diagonal shadow.
- **White sand** — The Boracay palette (#FEFAE0 to #D4A373) is distinctly warmer and whiter than generic beach palettes. Mediterranean beaches are more golden-brown; Philippine beaches are white-gold.
- **Foam line** — The irregular fringe of white-and-pale-blue pixels at the water's edge reads as wave foam retreating. Specific to shoreline rather than riverbank.
- **Limestone karst** — The pale wall face with green vegetation dots is the El Nido signature. No other coastal formation has this pale-vertical-with-tropical-green combination.
- **Coral through water** — Dark patches in turquoise surface of Baybay-B are visible reef. The clarity of Philippine waters (visibility often 15-30m) makes this a realistic detail.
- What does NOT survive: individual palm trees (too tall for 64×32), the powdery texture of *borac* sand, sunset colors, wave motion.

### Under Gameplay Overlays

- **Perception radius (cyan):** EXCELLENT contrast against warm sand. Possibly the highest-readability biome for cyan overlays. On water tiles, cyan radii overlap with turquoise water — mitigation: perception radius on water tiles shifts to a brighter, greener cyan (#00FFD0).
- **Channel wiring (magenta):** Strong contrast against sand. On water tiles, magenta pops dramatically. The magenta-on-turquoise is reminiscent of tropical fish colors — thematically pleasing.
- **Buffer bars:** Warm sand provides the highest contrast backdrop for all buffer pip colors. Beach tiles are the most readable biome for buffer state.
- **Combat flash (red):** Red on white sand is visceral — it reads as blood on the beach, an invasion scene. The cultural weight of this is significant — Philippine beach history includes WWII landing beaches (Leyte Gulf). The combat flash has unintended but powerful resonance.
- **Ghost units:** Cyan ghost shimmer on warm sand creates maximum visibility. Beach tiles are the best biome for plan-screen readability.

### Sensory Description

The beach tiles are the brightest zone on any mixed-biome board. Where jungle absorbs light and terraces structure it, the beach *radiates.* The white-gold sand catches the top-left illumination and throws it back. Units on beach tiles cast longer, sharper shadows (1px wider than on other biomes), emphasizing the equatorial sun. The palm frond shadow lines create a diagonal rhythm across the sand that moves between tiles — when two adjacent beach tiles have their shadow lines at alternating angles, the eye reads a palm grove overhead. The water tiles shimmer: a 0.5Hz pulse between turquoise shades, slower and deeper than the terrace water ripple. When a scout patrols across beach tiles during sealed watch, the tick-snap feels lighter — the bright palette creates an illusion of faster movement. The foam line on Baybay-B is the only tile with a *texture* animation: every 4 ticks, the foam pixels shift 1px east, suggesting the tide. Audio for beach tiles: a low surf rumble underlying the tick clock, with a faint hiss on the foam-line tiles. Signal delivery across beach tiles traces a brighter green — information flows clearly in the open.

---

## Biome 4: "Lungsod" — Cyberpunk Megacity

### Real-World Reference: Makati/BGC Manila, Cebu City IT Corridor, Divisoria Market

Manila IS a real-world cyberpunk city. Lucius Felimus's cyberpunk photography of Manila captures: neon Baybayin script on building facades, jeepney transport drones imagined as flying vehicles, vertical slums with exposed fiber optic cables, sari-sari store fronts hiding command nodes. Makati at night: glass towers reflecting neon, wet pavement creating mirror surfaces, electrical wires strung between buildings like a web. Divisoria market: the density of a hundred sari-sari stores packed into narrow alleys, each with hand-painted signage, each selling everything. The Philippine jeepney — originally rebuilt from WWII military jeeps, now chrome-plated, hand-decorated with bold colors, religious icons, and hand-lettered destinations — is the single most visually distinctive vehicle on Earth.

**Key visual signatures at macro scale:**
- Vertical density — buildings stacked on buildings
- Neon signage (Baybayin and Tagalog script, corporate logos)
- Jeepney chrome and color (bold reds, blues, greens, chrome detailing)
- Sari-sari store fronts (hand-painted signs, cluttered product displays, corrugated metal)
- Exposed infrastructure (power lines, water pipes, fiber optic)
- Wet pavement reflecting neon at night

### Pixel-Level Tile Design

**"Lungsod-A" — Street Level (primary city tile)**

| Row Range | Content | Colors |
|-----------|---------|--------|
| 0-3 | Diamond edge, tick marks | #2B2D42 edge (dark concrete), #6B7A8E tick |
| 4-7 | **Street surface.** Dark asphalt (#3A3C50) with a 2px neon reflection — a horizontal smear of color across rows 5-6 suggesting wet pavement reflecting a sign above. The reflection color varies by tile position: one tile gets #FF3CF2 (magenta neon), another gets #18E0FF (cyan neon), a third gets #E9C46A (warm golden shoplight). This creates a patchwork of neon puddle reflections across the board — no two adjacent tiles have the same reflection color. A single 1px manhole cover detail at the center: a 3px circle of #4A4C60 (slightly lighter than asphalt). | #3A3C50, varies by position, #4A4C60 |
| 8-11 | **Street detail.** Asphalt with lane markings: a 1px dashed yellow line (#E9C46A) at row 9 — a painted road stripe visible only when zoomed in, but contributing to the "urban" read at any distance. Two 1px bright spots at rows 10-11: a discarded aluminum can (#9DB4C0 tin blue) and a small trash detail (#8D99AE), suggesting the lived-in density of Manila streets. | #3A3C50, #E9C46A, #9DB4C0, #8D99AE |
| 12-15 | **Sidewalk edge.** A 1px curb line (#6B7A8E) at row 12 separates street from sidewalk. Below: concrete sidewalk (#5A5C6E lighter than asphalt) with a 2px sari-sari store awning accent — a tiny triangle of bright color (#BC6C25 rust orange corrugated metal, or #4A90D9 blue tarp) at the south edge, suggesting a shop front overhang. | #6B7A8E, #5A5C6E, #BC6C25 |
| 16-27 | **Building wall.** The wall face IS the building facade. Left wall: concrete (#8D99AE) with 1px window rectangles (#2B2D42 dark, 2px wide × 1px tall) stacked at 3px intervals, suggesting a multistory building face. One window glows — a single 2px rectangle of #E9C46A (warm light from inside). Right wall: corrugated metal (#6B7A8E with 1px vertical striping of #5A5C6E) — a different building material, suggesting the heterogeneous construction of Philippine cities where concrete towers sit beside tin-roofed structures. At the very bottom of the left wall: a 3px horizontal sign element — two bright pixels of neon (#FF3CF2 or #18E0FF) flanking a 1px dark gap — a tiny neon sign visible at the building base. | #8D99AE, #2B2D42, #E9C46A, #6B7A8E, neon varies |
| 28-31 | Diamond edge, bottom tick | #2B2D42 edge |

**Checkerboard variant:** The neon reflection color on the street surface swaps to the complementary hue. The building wall switches — left wall becomes corrugated metal, right wall becomes concrete with windows. The sari-sari awning changes color. Effect: adjacent city tiles look like different buildings on the same street — urban variety without repetition.

**"Lungsod-B" — Jeepney Stop (secondary city tile)**

Same structure as Lungsod-A but the street surface (rows 4-11) features a jeepney-scale detail: a 6px×4px rectangle of chrome (#C0C0C0 body) with 1px accents of bold color (#FF2D2D red or #4A90D9 blue) — a parked jeepney, tiny but recognizable as a vehicle by its proportions and chrome glint. The jeepney is the cultural anchor. At 6×4 pixels it's impressionistic — a chrome rectangle with color accents — but when the player zooms into the inspector view, the tooltip can read "Jeepney stop — Quiapo route" adding narrative texture.

**"Lungsod-C" — Data Center (cyberpunk heavy variant)**

The building wall face (rows 16-27) replaces windows with server rack detail: horizontal banding of dark (#1A1A2E) with rows of tiny colored LED dots — 1px green (#00FF87), amber (#FFB800), and red (#FF2D2D) at irregular intervals, suggesting server status lights seen through a building's glass facade. The street surface has more cyan neon reflection and less warm golden light — the data center neighborhood is cooler, bluer, more tech-saturated. Fiber optic detail: a 1px bright line (#18E0FF) running along the curb from edge to edge — exposed cable infrastructure.

### Cultural Detail at 64×32

What survives at this scale:
- **Neon puddle reflections** — Different neon colors per tile create the "wet Manila night" feel. The reflection IS the cyberpunk.
- **Sari-sari awning** — A 2px triangle of bright corrugated color at the tile edge. Can't read the hand-painted sign, but the material (corrugated metal, bright color) and position (overhanging the sidewalk) is the sari-sari fingerprint.
- **Heterogeneous construction** — Concrete beside corrugated metal, glass beside tin. The *mixed materials* across adjacent tiles are what make it Manila rather than Tokyo or Hong Kong. Those cities have uniform facades. Manila is a collage.
- **Jeepney chrome** — A 6px chrome rectangle with color accents. Not detailed enough to see the decorations, but the chrome-and-bright-color signature is identifiable.
- **Exposed fiber optic** — A 1px bright line along the curb. In Manila, infrastructure is often exposed — power lines drape between buildings, water pipes run along walls. The exposed cable is realistic and cyberpunk simultaneously.
- **Server rack LEDs** — Tiny colored dots in building facades. At pixel scale, the regular rows of multicolored dots read as "technology behind glass."
- What does NOT survive: Baybayin neon script, laundry lines, specific sari-sari product displays, jeepney decorations, building signage. These need the inspector's tooltip layer or higher-resolution portrait art.

### Under Gameplay Overlays

- **Perception radius (cyan):** The dark city palette provides excellent contrast for all overlay colors. Cyan radii glow against the asphalt. But on tiles with cyan neon reflections, the radius blends into the existing cyan — mitigation: perception radii have a 1px white outline on city biome tiles.
- **Channel wiring (magenta):** On tiles with magenta neon reflections, channel wiring merges with the environment — the wiring looks like part of the neon infrastructure. This is thematically interesting but mechanically confusing. Mitigation: channel wiring uses a brighter, more saturated magenta (#FF60FF) than the neon reflections (#FF3CF2), and the wiring has a 1px glow bloom.
- **Buffer bars:** Dark asphalt/concrete provides strong contrast for buffer pips. No issues.
- **EM emission rings:** Orange EM rings on city tiles harmonize with the warm golden shop-lights (#E9C46A). In the cyberpunk city, emissions feel natural — everything is broadcasting. The visual metaphor works: a noisy architecture in a noisy environment.
- **Ghost units:** Cyan ghost shimmer on dark city tiles is extremely readable — the unit seems to be projected onto the street like a holographic advertisement, which is the perfect plan-screen aesthetic for a cyberpunk setting.

### Sensory Description

The city tiles are the darkest ground on the board but the most *alive.* Every tile carries a different neon reflection — magenta, cyan, gold — and when the board renders, the street becomes a quilt of colored light on wet asphalt. Units on city tiles are silhouetted upward by the tile's glow — their chrome bodies catch the neon from below, creating a rim-light effect that makes them look like they're posing for a Lucius Felimus photograph. In the sealed watch, signal delivery across city tiles is spectacular: the green flash follows the fiber optic line along the curb, then arcs up to the receiving unit, as if the signal is routing through the city's infrastructure before arriving. Combat flashes in the city are sharp and quick — a red burst that reflects in the wet asphalt for one extra frame, a doubled impact. The audio for city tiles: a distant jeepney horn, electronic hum, the bass thrum of data centers, a wet-road texture to footstep sounds. When the tick clock fires over a city board, the tick sound has a slight digital echo — as if bouncing off building walls.

---

## Biome 5: "Siquijor" — Volcanic/Mystic Island

### Real-World Reference: Siquijor "Island of Fire," Apo Island Volcanic, Taal Volcano Lake

Siquijor is called the "Island of Fire" because of the bioluminescent glow — fireflies in mangrove forests and bioluminescent plankton illuminating the shore at night. The island has dense mangrove forests with exposed root systems creating lattice patterns in shallow water, fringing coral reefs in exceptional condition (Tubod Marine Sanctuary, 30+ years protected), and the mysterious reputation of healers and folk magic practitioners (*mananambal*). Nearby Apo Island has underwater volcanic vents producing visible gas bubbles. Taal Volcano sits in a lake on an island in a lake — nested geography as metaphor for nested systems.

**Key visual signatures at macro scale:**
- Bioluminescent glow (blue-green light from water/shore at night)
- Dark volcanic rock (basalt black, rough texture)
- Mangrove root lattice (tangled roots in shallow water)
- Coral formations (colorful, dense, organic)
- Mist/steam (volcanic vents, humid air)
- Deep blue-black water

### Pixel-Level Tile Design

**"Siquijor-A" — Volcanic Shore (primary island tile)**

| Row Range | Content | Colors |
|-----------|---------|--------|
| 0-3 | Diamond edge, tick marks | #1A1A2E edge (volcanic dark), #4A3F6B tick (deep purple-tint) |
| 4-7 | **Volcanic rock surface.** Near-black basalt (#1E1E30) with 1px texture: scattered bright specks of #4A3F6B (mineral glint in the rock). Two 1px bioluminescent dots: #00FFB2 (cyan-green) placed asymmetrically at 2 o'clock and 8 o'clock positions — bioluminescent organisms growing in rock crevices. The rock surface is rough — pixel pattern avoids any horizontal or vertical alignment, creating organic irregularity that contrasts sharply with the terrace's structured horizontals. | #1E1E30, #4A3F6B, #00FFB2 |
| 8-11 | **Rock with thermal vent.** Same basalt base, but rows 9-10 have a 3px horizontal smear of #8B5CF6 (purple) fading to #4A3F6B — thermal heat from a vent below, visible as a warm glow in the rock. This purple thermal signature is the Siquijor biome's unique color identity. One additional bioluminescent dot at 5 o'clock. | #1E1E30, #8B5CF6, #4A3F6B, #00FFB2 |
| 12-15 | **Tidal rock.** The basalt darkens (#141420) and gains 1px moisture highlights (#2A2A4E blue-tint) suggesting the rock is wet from tidal spray. A 2px mangrove root accent: a curved 2px line of #5C3A21 (dark wood brown) emerging from the lower edge — a root tendril growing across the rock face. | #141420, #2A2A4E, #5C3A21 |
| 16-27 | **Underwater volcanic wall.** The wall face is submerged or cliff-side: left wall is dark basalt (#141420) with vertical 1px lines of #8B5CF6 (purple thermal veins) running top-to-bottom at 6px intervals — volcanic thermal channels visible in cross-section. Right wall is darker (#0E0E18) with coral accents: 2-3px clusters of #FF6B6B (living coral pink) and #FFB84D (coral orange) growing on the rock surface. The coral-on-basalt contrast is striking — hot colors on cold dark rock. | #141420, #8B5CF6, #0E0E18, #FF6B6B, #FFB84D |
| 28-31 | Diamond edge, bottom tick | #1A1A2E edge |

**Checkerboard variant:** Bioluminescent dots shift positions and one changes color to #00BFFF (more blue, less green). The thermal vent smear moves from rows 9-10 to rows 10-11. The coral accents swap from left wall to right wall. The mangrove root curves in the opposite direction. Effect: each tile is a unique piece of volcanic shore, but the shared palette and bioluminescent signature unify them.

**"Siquijor-B" — Mangrove Shallows (secondary island tile)**

The surface (rows 4-15) is shallow water: #0E4F6B (dark teal) with a lattice of mangrove roots. The roots are the star: 3-4 curved lines of #5C3A21 (dark wood) crossing the tile surface, each 1px wide, creating an organic grid. Between roots, 1px bioluminescent dots (#00FFB2) cluster along root edges — the fireflies and plankton that give Siquijor its "Island of Fire" name. The wall face: underwater root lattice — the same root lines continue into the depth, converging toward a dark center (#0A2A3A), suggesting the roots reaching into black water.

**"Siquijor-C" — Relay Tower (signal infrastructure)**

A unique tile combining volcanic rock base with a vertical signal element. The surface is Siquijor-A basalt, but the wall face features a tall vertical antenna structure: a 2px wide column of #8B5CF6 (purple, matching thermal veins) rising from the bottom edge to row 18, topped with a 3px disc of #18E0FF (signal cyan). This is the "bioluminescent relay tower" from the setting description — Siquijor's unique relay infrastructure. Around the antenna base, coral and bioluminescent organisms grow in a ring, suggesting the tower has been there long enough for the ecosystem to integrate it.

### Cultural Detail at 64×32

What survives at this scale:
- **Bioluminescence** — The scattered cyan-green dots (#00FFB2) are the defining visual. No other biome has these. They pulse slowly (0.25Hz, alternating which dots are bright and which are dim), creating a living, breathing shore.
- **Volcanic rock texture** — The near-black, irregular surface with mineral glints is distinctly volcanic. It's darker and rougher than city asphalt, without the structured lines of terraces.
- **Purple thermal veins** — The #8B5CF6 purple is unique to this biome. It suggests volcanic heat, mystic energy, and the island's reputation for folk magic. The purple IS Siquijor.
- **Mangrove root lattice** — Curved brown lines crossing the shallow water tile. At 64×32, three or four curves are enough to read as "tangled roots in water."
- **Coral on volcanic rock** — Hot pink/orange clusters on dark basalt. The color contrast (warm on cold) is immediately striking and biome-specific.
- What does NOT survive: the firefly swarm effect (simulated by pulsing dots), the depth of the mangrove forest, the folk-magic atmosphere (handled by audio/narrative), the volcanic vent gas bubbles (too small for individual tiles).

### Under Gameplay Overlays

- **Perception radius (cyan):** The bioluminescent dots create a slight conflict — both are cyan-green. Mitigation: perception radii on Siquijor tiles use a warmer cyan (#40E8FF, same as jungle) and the bioluminescent dots are greener (#00FFB2). The two cyans are distinguishable by hue.
- **Channel wiring (magenta):** STRONG contrast against the dark volcanic palette. Magenta on near-black basalt is striking. The magenta also complements the purple thermal veins — magenta wiring crossing purple veins creates a "this island is ALL signal infrastructure" visual.
- **Buffer bars:** Dark volcanic rock provides excellent contrast for all pip colors. The coral accents in the wall face might overlap with buffer bar positions — mitigation: buffer bars render 2px below the wall face, in a thin dark margin.
- **EM emission rings (orange):** Orange EM rings harmonize with the coral accents (orange/pink). Emissions on Siquijor feel organic — like the island itself is broadcasting, which aligns with the "Island of Fire" lore.
- **Ghost units:** Cyan ghost shimmer merges beautifully with bioluminescent dots — a ghost unit on Siquijor looks like it's being assembled from the island's own light, emerging from the bioluminescence. This is the most atmospheric ghost-unit experience across all biomes.

### Sensory Description

Siquijor tiles are the most otherworldly terrain on any board. Where jungle is alive and city is built, Siquijor is *ancient and watching.* The near-black volcanic rock absorbs most light, but the bioluminescent dots pulse slowly in the darkness — green-blue fireflies embedded in stone. The purple thermal veins glow with subterranean heat, and where the veins meet the surface, tiny wisps of steam could be implied by a 1px pale dot flickering at half the tick rate. Units on Siquijor tiles are illuminated from below by the bioluminescence — their chrome undersides catch the green-blue glow, creating a rim-light opposite to the top-left key light. The effect is eerie and beautiful. In the sealed watch, combat on Siquijor is different from any other biome: the red flash is darker, more crimson (#AA2020 instead of #FF2D2D), as if the volcanic rock absorbs some of the violence. But signal delivery is brighter — the green flash picks up the bioluminescence and amplifies it, as if the island is helping carry the message. Audio for Siquijor: deep geological rumble, distant surf, the chittering of unseen creatures, and a 440Hz pure tone (barely audible, below-conscious) that suggests the island's mystic resonance. The tick clock on Siquijor boards has a slightly reverberant quality — echo, as if the sound bounces off volcanic cave walls.

---

## Biome Transitions

### The Seam Problem

When two different biomes share an edge, the tile boundary must not create a jarring visual seam. Into the Breach handles this with uniform tile heights — all tiles are the same elevation. Robot Uprising's biomes have different wall-face treatments, so transitions need design.

### Transition Tile System

For each biome pair, a set of **transition tiles** handles the seam:

**Jungle↔Terrace ("Forest Edge"):** The canopy clusters of the jungle tile fade into the muyong forest of Hagdan-B. This is historically accurate — the *muyong* IS the forest above the terraces. The transition tile has jungle canopy on its upper half and the first terrace step on its lower half.

**Jungle↔Beach ("Treeline"):** The jungle gives way to sand. The transition tile has palm trunks (2px brown verticals) emerging from the jungle edge, with their frond shadows falling onto the adjacent beach tile's sand surface. This is the Palawan coastline — dense forest to white sand in 50 meters.

**Beach↔City ("Waterfront"):** The sand meets concrete. The transition tile has a 1px seawall line (#8D99AE) at the biome boundary — the Manila Bay seawall, the Cebu waterfront, the concrete infrastructure where Filipino cities meet the sea.

**City↔Siquijor ("Abandoned District"):** Where the megacity transitions to volcanic island, the concrete buildings become half-ruined — the windows are dark, the corrugated metal has rust holes (#BC6C25 spreading), and bioluminescent growth (#00FFB2 dots) has begun reclaiming the building facade. The city is being absorbed by the island.

**Terrace↔Beach ("Coastal Terraces"):** The stepped horizontal lines of the terraces descend to sand. The lowest terrace step transitions from green rice to beach grass (#B5C48E sage green), and the water in the paddies matches the ocean blue. This is the coastal Ifugao terraces of Mayoyao, where the terraces descend toward lowland river valleys.

**Terrace↔Siquijor ("Volcanic Terraces"):** The stone walls of the terraces transition to volcanic basalt. The terrace's warm #8B7355 stone darkens to #4A3F6B, and data-light cyan gives way to bioluminescent green. The irrigation water in the paddies takes on a purplish tint from thermal influence.

### Mission Design Implications

Each mission in the 10-mission campaign can feature a **primary biome** and one **secondary biome** with transition tiles:

| Mission | Primary Biome | Secondary | Thematic Function |
|---------|---------------|-----------|-------------------|
| M1-2 | Lungsod (City) | — | Urban tutorial. Familiar, readable, dark backdrop for learning |
| M3 | Gubat (Jungle) | City edge | First environment shift. Green challenges cyan readability |
| M4 | Hagdan (Terrace) | Jungle edge | Structured terrain. Horizontal lines teach grid-thinking |
| M5 | Baybay (Beach) | City waterfront | Factory mission. Open, bright, readable for new complexity |
| M6 | Siquijor | Beach edge | Mystical. Bioluminescence introduces ambiance |
| M7 | Hagdan (Terrace) | Siquijor volcanic | Siege. Ancient architecture under siege from volcanic forces |
| M8 | Lungsod (City) | Data Center heavy | Infiltration. Dense urban, maximum neon, maximum noise |
| M9 | Gubat (Jungle) + Baybay | Transition heavy | Mirror match. Diverse terrain, full palette |
| M10 | All biomes | Maximum transitions | Final. The full Philippine landscape as battlefield |

---

## Cross-Biome Comparison Matrix

| Dimension | Gubat (Jungle) | Hagdan (Terrace) | Baybay (Beach) | Lungsod (City) | Siquijor (Volcanic) |
|-----------|----------------|-------------------|-----------------|-----------------|----------------------|
| **Dominant hue** | Green | Green-blue-brown | Warm gold-blue | Dark grey + neon | Near-black + purple-cyan |
| **Brightness** | Medium-dark | Medium | Bright | Dark ground, bright accents | Very dark, point-light accents |
| **Cultural marker** | Bamboo, orchid dot | Horizontal terracing, stone wall | Palm shadow, white sand | Neon reflection, sari-sari awning | Bioluminescent dots, purple thermal |
| **Overlay readability** | Good (cyan/magenta strong vs green) | Good (minor data-light conflict) | Excellent (highest contrast biome) | Good (neon conflicts need mitigation) | Mixed (bioluminescent conflicts need hue shifts) |
| **Emotional register** | Organic, alive, breathing | Ancient, structured, harmonious | Open, bright, exposed | Dense, alive, technological | Mystic, eerie, otherworldly |
| **Combat flash feel** | Wound in forest | Disruption of order | Violence on paradise | Sharp, reflected, doubled | Dark, absorbed, crimson |
| **Signal flow feel** | Green-on-green, blended | Follows horizontal terraces | Bright, clear, open | Routes through infrastructure | Amplified by bioluminescence |
| **Ghost unit feel** | Warmer cyan, distinct from foliage | Integrates with data-lights | Maximum visibility | Holographic advertisement | Emerging from bioluminescence |
| **Audio texture** | Insect hum, birdsong, humidity | Water trickle, irrigation flow | Surf rumble, wave hiss | Jeepney horn, data hum, echo | Geological rumble, chittering, 440Hz tone |
| **Best suited for** | Stealth missions, jungle ambush | Defensive missions, structured play | Tutorial, factory intro | Infiltration, dense combat | Boss/climax, atmospheric set-pieces |

---

## Pixel Budget Analysis

At 64×32, the "pixel budget" for cultural detail is ruthlessly constrained. Here's what each biome gets:

| Element | Pixels Available | Biome | What It Communicates |
|---------|-----------------|-------|---------------------|
| Bamboo stalk | 2×6 = 12px | Jungle | "Philippines, not Amazon" |
| Orchid dot | 1px | Jungle | "Tropical flowers, not temperate" |
| Horizontal terrace lines | 64×1 × 3 = 192px | Terrace | "Rice terraces" — unmistakable |
| Stone wall blocks | ~40px of irregular pattern | Terrace | "Hand-fitted, ancient, not machine-cut" |
| Data-light | 1px × 3 = 3px | Terrace | "Technology embedded in history" |
| Palm frond shadow | 2×8 = 16px | Beach | "Equatorial tropics" |
| White-gold gradient | ~200px of surface | Beach | "Boracay/El Nido, not Mediterranean" |
| Neon reflection | 2×12 = 24px | City | "Wet neon night = cyberpunk" |
| Sari-sari awning | 2×4 = 8px | City | "Filipino streetscape" |
| Jeepney chrome | 6×4 = 24px | City | "Philippine jeepney" |
| Server LEDs | 1px × 8 = 8px | City | "Data center behind glass" |
| Bioluminescent dots | 1px × 4 = 4px | Siquijor | "Island of Fire" |
| Purple thermal veins | 1px × 6 = 6px | Siquijor | "Volcanic, mystic" |
| Coral clusters | 2-3px × 2 = ~6px | Siquijor | "Tropical marine ecosystem" |
| Mangrove roots | 1px × 12 = 12px | Siquijor | "Mangrove forest" |

**Total cultural pixels per tile:** 3-25px of explicit cultural detail in a 1,024px canvas. That's 0.3-2.4% of the tile. The rest is base terrain (color, texture, lighting) that carries cultural identity through *palette* rather than *detail.*

**The palette IS the culture.** The specific greens of Philippine jungle (#52B788, #2D6A4F) are warmer and more saturated than Amazonian green or Pacific Northwest green. The specific white-gold of Boracay sand (#FEFAE0 to #D4A373) is brighter than Mediterranean sand. The specific near-black of volcanic basalt (#1E1E30 with purple tint) is darker and more purple than granite or slate. Even if every cultural marker were removed, the palette alone would signal "Southeast Asian" to anyone familiar with the region's light quality.

---

## The TikTok Clip

**"One board, five Philippines."** A 15-second clip that starts with an empty 8x8 board of city tiles — dark, neon reflections. The camera zooms to a corner where jungle transitions in — bamboo accents, green canopy. Pan across to rice terraces stepping down toward a beach shoreline — water shimmer, palm shadows on white sand. Cut to the opposite corner: Siquijor volcanic with bioluminescent dots pulsing in the darkness. Final wide shot: all five biomes on one board, transition tiles bridging them, and then 16 robot units deploy simultaneously — chrome against green, gold, dark, and glowing purple. Text overlay: "Real Philippine landscapes. 64 pixels at a time."

---

## Interaction Effects

- **Art Direction (6.01):** This analysis applies to both Option A "Circuit Board" (which would use a more restrained palette per biome) and Option B "Tropical Hologram" (which would maximize environmental detail within the pixel budget). The cultural detail pixel budget above is calibrated for Option B; Option A would reduce cultural markers by ~50% in favor of gameplay clarity.
- **Building Blocks:** The workbench panel's dark technical aesthetic (Shenzhen I/O inspired) contrasts with the lush biome tiles — the left panel (workbench) is a dark tool, the right panel (board) is a living landscape. This contrast reinforces the "foreign technology imposing on nature" theme.
- **Sealed Watch:** Biome-specific combat and signal flash colors (described per biome above) mean the same action *feels different* depending on where it happens. Combat on the beach is sharp and bright; combat on Siquijor is dark and absorbed. This is emergent narrative through palette.
- **Inspector:** The timeline scrubber and analysis panels should adopt the primary biome's accent color. An inspector analyzing a jungle mission has green accent lines; a city mission gets neon magenta. This connects the analytical tool to the battlefield's emotional register.
- **Audio Design (6.02):** Each biome has a distinct audio bed (described in sensory sections). The audio bed should crossfade when the selected unit moves between biome zones — a scout patrolling from jungle to beach transitions from insect hum to surf rumble over 3 ticks.
- **Accessibility (6.08):** Shape-First Design (recommended in 6.08) should apply to biome differentiation: in high-contrast mode, each biome gets a unique geometric surface pattern (jungle = diagonal hatching, terrace = horizontal lines, beach = stippling, city = grid, Siquijor = concentric circles) replacing color as the primary biome identifier.
- **Campaign Pacing:** The biome sequence (city → jungle → terrace → beach → Siquijor → terrace → city → jungle/beach → all) creates a visual journey across the Philippines. Each new biome in a new mission refreshes the visual experience.

---

## Comparable Games

- **Into the Breach:** 8×8 grid with terrain types (grass, sand, desert, acid, mountain, water, ice). Each terrain type uses a 3-tile set (base, damaged, destroyed). Terrain is secondary to units — the board is a stage. Robot Uprising's biome system is more detailed than ITB's terrain, but must maintain the same readability priority.
- **Advance Wars / Wargroove:** Terrain tiles at similar pixel scale with cultural theming. Advance Wars' grass/forest/mountain tiles have 2-3 variations each. Wargroove adds biome theming (desert, tundra, volcanic) per campaign chapter.
- **Factorio:** Terrain tiles at larger scale (32×32 orthogonal) carry enormous environmental detail — alien vegetation, water edges, sand-to-grass transitions. Factorio's terrain is beautiful but gameplay-neutral; Robot Uprising's terrain affects signal propagation (if spatial routing Model 6 is used).
- **Civilization VI:** District tiles with cultural theming per civilization. The "culture in a tile" challenge is identical — how much Thai, Egyptian, or Maori detail fits in a small tile? Civ VI solves it with landmark buildings rather than ground texture.
- **Tropico series:** The gold standard for "tropical tile art" — Caribbean architecture, vegetation, and terrain rendered at isometric scale with cultural detail that communicates "Caribbean" rather than "generic tropical."

---

## New Aspects Discovered

- **6.01a-i — Tile animation budget:** How much per-tile animation is affordable? Bioluminescent pulsing (0.25Hz), water shimmer (0.5Hz), foam drift (every 4 ticks), neon reflection flicker — full animation spec per biome, Pixi.js rendering cost analysis, and the "does it compete with gameplay" question.
- **6.01a-ii — Biome-specific signal propagation visuals:** If spatial routing Model 6 (terrain-modified) is adopted, each biome type needs a distinct signal-delivery animation: jungle signals trace through canopy, terrace signals follow horizontal lines, city signals route through fiber optic, Siquijor signals are amplified by bioluminescence. Full animation spec per biome × signal type.
- **6.01a-iii — Dynamic tile damage states:** When combat occurs on a tile, does the tile show damage? Cracked terrace stones, scorched jungle canopy, shattered beach limestone, broken city neon, extinguished bioluminescence. How many damage states per biome? How does tile damage interact with terrain signal propagation?
- **6.01a-iv — Biome transition tile set completeness:** Fifteen biome pairs (5 choose 2) each need at least one transition tile. Some pairs (jungle↔Siquijor, terrace↔city) aren't covered above. Full transition tile set with pixel-level specs for all 15 combinations.
- **6.01a-v — High-contrast / accessibility tile variants:** Shape-First Design requires unique geometric patterns per biome that communicate terrain type without relying on color. Full specification of high-contrast tile variants: pattern type, line weight, contrast ratio, and readability testing methodology across protanopia/deuteranopia/tritanopia/achromatopsia.
