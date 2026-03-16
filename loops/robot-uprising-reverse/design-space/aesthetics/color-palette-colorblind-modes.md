# 6.01d — Color Palette Interaction with Colorblind Modes

How every locked color in Robot Uprising degrades under the three types of color vision deficiency — and the design space for making the game accessible without a single "colorblind mode" toggle.

---

## The Color Inventory: What Must Survive

Robot Uprising has a locked color vocabulary that carries gameplay-critical information. Every one of these colors must be distinguishable from every other color it appears alongside, under all three CVD types.

### Locked Signal & Status Colors (from art direction spec)

| Color Role | Hex | Normal Appearance | Used Where |
|------------|-----|-------------------|------------|
| Signal delivered | #00FF87 | Bright green | Cell flash on delivery, signal lines |
| Buffer warning | #FFB800 | Amber | Buffer bar at 75%+ fill |
| Combat/death | #FF2D2D | Red | Cell flash on elimination, combat events |
| Buffer overload | #F7FF4A | Hazard yellow | Buffer overflow indicator |
| Scout perception | #18E0FF | Cyan | Perception radius, Scout accent |
| Hook channels | #FF3CF2 | Magenta | Channel wiring, Relay accent |
| Striker accent | #FF6B35 | Red-orange | Blade-arm tips, combat tint |
| Specialist accent | #8B5CF6 | Purple | Tool arm, extraction events |
| Command accent | #FFD700 | Gold | Holographic dome, command signals |
| Player faction | #C0C0C0 | Chrome | Unit body base |
| Enemy faction | #3A3A4A | Gunmetal | Enemy unit body base |
| Tagged target | (cyan diamond) | Cyan marker | Tag indicator on units |

### The Critical Pairs

These are the color pairs that appear simultaneously on screen and MUST be distinguishable:

1. **Green (signal) vs. Red (combat)** — the most critical pair, appears during sealed watch on adjacent tiles
2. **Cyan (Scout) vs. Magenta (channel wiring)** — appears simultaneously in Plan mode
3. **Red-orange (Striker) vs. Red (combat flash)** — Striker's own accent vs. combat event on same tile
4. **Amber (buffer warning) vs. Yellow (overload)** — sequential states of the same element
5. **Cyan (Scout) vs. Green (signal)** — both appear during watch phase
6. **Purple (Specialist) vs. Magenta (Relay)** — two unit accents
7. **Gold (Command) vs. Amber (buffer warning)** — Command's accent vs. buffer state
8. **Chrome (player) vs. Gunmetal (enemy)** — faction identification

---

## The Three Degradation Profiles

### Protanopia (Red-Blind, ~1% of males)

Red light sensitivity is dramatically reduced. Reds darken and shift toward brown/olive.

**What breaks:**
- **Green (#00FF87) vs. Red (#FF2D2D):** CATASTROPHIC. Both collapse toward olive/yellow-brown. The most important gameplay pair — "signal delivered" vs. "unit killed" — becomes indistinguishable. A cell flashing could mean success or death.
- **Red-orange (#FF6B35) vs. Amber (#FFB800):** SEVERE. Striker's accent and buffer warning converge. The Striker's blade-arm tips lose their threatening read.
- **Magenta (#FF3CF2) vs. Purple (#8B5CF6):** MODERATE. Both shift bluer. Relay vs. Specialist distinction weakens but shape difference (tall antenna vs. asymmetric tool arm) compensates.
- **Chrome vs. Gunmetal:** SAFE. Luminance difference survives — this is a brightness distinction, not a hue distinction.
- **Cyan (#18E0FF):** SAFE. Cyan is not affected by protanopia. Scout perception radii remain clear.

**What survives:**
- Cyan (#18E0FF) — strong and distinct
- Gold (#FFD700) — slightly shifted but still bright and warm
- Chrome/Gunmetal — luminance-based distinction is robust
- All shape/silhouette information — fully intact

**Severity: HIGH.** The green/red signal-vs-combat pair is a showstopper.

### Deuteranopia (Green-Blind, ~1% of males; deuteranomaly ~5% of males)

Green light sensitivity is reduced. Similar collapse pattern to protanopia but greens shift differently.

**What breaks:**
- **Green (#00FF87) vs. Red (#FF2D2D):** CATASTROPHIC. Same problem as protanopia — both collapse toward yellow-brown. Signal vs. combat flash becomes ambiguous.
- **Red-orange (#FF6B35) vs. Green (#00FF87):** SEVERE. Striker accent and signal delivery converge.
- **Amber (#FFB800) vs. Hazard yellow (#F7FF4A):** MODERATE. Already close in normal vision; under deuteranopia they're nearly identical. Buffer "warning" vs. "overload" becomes a single state.

**What survives:**
- Cyan (#18E0FF) — distinct and clear
- Magenta (#FF3CF2) — shifts slightly but remains distinguishable from cyan
- Purple (#8B5CF6) — strong blue component survives
- Gold (#FFD700) — luminance carries it
- Chrome/Gunmetal — safe

**Severity: HIGH.** Same green/red problem. Combined protanopia + deuteranomaly affects ~8% of males.

### Tritanopia (Blue-Blind, ~0.01% of population)

Blue light sensitivity is dramatically reduced. Blues become greenish; yellows become pinkish.

**What breaks:**
- **Cyan (#18E0FF) vs. Green (#00FF87):** SEVERE. Cyan loses its blue component and shifts toward green. Scout perception radius and signal delivery flash converge. The Scout appears to be "signaling at itself."
- **Purple (#8B5CF6) vs. Red (#FF2D2D):** MODERATE. Purple's blue component is lost; it shifts toward red-pink. Specialist and combat events could be confused on the same tile.
- **Gold (#FFD700) vs. Hazard yellow (#F7FF4A):** MODERATE. Both shift pinkish. Command accent and overload indicator merge.
- **Amber (#FFB800) vs. Magenta (#FF3CF2):** MODERATE. Amber pinkens; magenta pinkens. Buffer warning and channel wiring converge.

**What survives:**
- Green (#00FF87) vs. Red (#FF2D2D) — the critical pair WORKS under tritanopia
- Chrome/Gunmetal — safe
- Red-orange (#FF6B35) — maintains warmth, distinct from remaining blues

**Severity: MODERATE.** Less common, and the most critical pair (green/red) survives. But cyan degradation hurts the Scout's entire visual language.

---

## Design Space: Six Approaches to Colorblind Accessibility

### Approach A: "The Double Code" — Shape-First, Color Confirms

**Philosophy:** Never use color as the sole differentiator for ANY gameplay information. Every color-coded element also has a shape, icon, pattern, or animation difference. Color is a speed boost for typical vision, not a requirement.

**Implementation across all locked colors:**

| Color Role | Primary Differentiator (non-color) | Secondary (color) |
|------------|-------------------------------------|-------------------|
| Signal delivered | Expanding ring animation (outward pulse) | Green flash |
| Combat/death | X-burst animation (inward collapse) + screen shake | Red flash |
| Buffer warning | Pips fill with diagonal hatching pattern | Amber tint |
| Buffer overload | Pips fill with lightning-bolt pattern + unit jitter | Yellow pulse |
| Scout accent | Wedge silhouette + antenna | Cyan |
| Relay accent | Tall dish silhouette + concave shape | Magenta |
| Striker accent | Blade-arm extensions (unique feature) | Red-orange |
| Specialist accent | Asymmetric tool arm (unique feature) | Purple |
| Command accent | Largest sprite + dome | Gold |
| Player faction | Smooth chrome finish | Silver |
| Enemy faction | Angular/jagged edges + red eye | Dark grey |
| Tagged target | Diamond-shape marker | Cyan fill |
| Channel wiring | Dash pattern unique per channel + directional flow | Channel-specific color |

**The critical green/red pair gets:**
- Signal delivery: expanding concentric rings (think sonar pulse) — animation flows OUTWARD from the receiving unit
- Combat: sharp X-pattern burst (think impact) — animation implodes INWARD toward the eliminated unit, plus 1px screen nudge
- Even without color, the motion tells you: outward = received something, inward = lost something

**Strengths:**
- Accessible by default — no mode to discover or toggle
- Every player benefits from shape redundancy (readability in chaos, information at a glance)
- Future-proof against any palette change
- The gold standard per GDC 2019 (Douglas Pennant, Creative Assembly): "never use color alone"

**Weaknesses:**
- Requires designing TWO information channels for every element (more art, more animation, more design)
- Animation differences can be hard to distinguish at 1-second tick speed — the green flash and red flash last ~200ms each, so the shape difference must be perceivable within that window
- Doesn't help with static screenshot comprehension (Inspector, which is paused)

**Comparable:** Into the Breach does this naturally — enemy attack previews use arrows, numbers, and directional indicators, not just color. The Last of Us Part II received BAFTA recognition for shape-first UI. Atomfall (2025 TGA Innovation in Accessibility nominee) shipped "accessible by default" — no toggle needed.

### Approach B: "The Palette Swap" — Targeted CVD-Specific Color Remapping

**Philosophy:** Offer three separate color presets (protanopia, deuteranopia, tritanopia), each remapping ONLY the conflicting pairs while preserving as much of the original palette as possible.

**Protanopia/Deuteranopia Preset ("Warm Shift"):**

| Original | Remapped | Why |
|----------|----------|-----|
| Signal green #00FF87 | Vivid blue #4488FF | Blue is fully visible under protan/deutan; distinct from red |
| Combat red #FF2D2D | Bright orange #FF8800 + X-burst shape | Orange is darker and luminance-distinct from remapped blue |
| Striker red-orange #FF6B35 | Deep amber #CC6600 | Shifts away from the red that's hardest to see |
| Buffer amber #FFB800 | (unchanged) | Still visible; now distinctly brighter than deep amber Striker |
| Hazard yellow #F7FF4A | (unchanged) | Still visible; luminance separates from amber |

**Tritanopia Preset ("Cool Shift"):**

| Original | Remapped | Why |
|----------|----------|-----|
| Cyan #18E0FF | Vivid magenta #FF44CC | Magenta is fully visible under tritanopia |
| Scout accent | Matches magenta remap | Perception radius shifts to magenta |
| Purple #8B5CF6 | Deep blue #3355CC | Retains blue (not affected by tritan) |
| Gold #FFD700 | Bright red #FF4444 | Red is fully visible under tritanopia |
| Magenta #FF3CF2 | Electric green #44FF44 | Green is unaffected by tritanopia |

**Settings UI:** Three CVD type buttons with real-time board preview. When the player selects a type, a split-screen shows original palette (left) vs. remapped palette (right) with a 10-second sealed watch replay running in both panels simultaneously. The player sees their game BEFORE committing to the change. A "custom" option (Approach C) is available for edge cases.

**Strengths:**
- Targeted, not global — only conflicting colors change, preserving the game's visual identity
- Precedent in Overwatch (post-2018 overhaul), Destiny, Apex Legends
- Minimal art impact — sprite colors don't change (they're unit accent tints applied via shader), only signal/status overlays shift
- Players self-select the preset they need

**Weaknesses:**
- Requires players to know their CVD type (many don't — Pennant's GDC talk notes this)
- "Pick your disability" feels medicalized
- Three palette variants to test for every new visual element
- Doesn't help the 5% of males with deuteranomaly (partial green weakness) — preset designed for full deuteranopia may over-correct

**Comparable:** Destiny offers three separate presets with preview. Apex Legends adds intensity sliders. Overwatch's nine-color picker for enemy/friendly is the most granular.

### Approach C: "The Custom Palette" — Per-Element Color Picker

**Philosophy:** Let the player reassign any gameplay color to any value. Full control.

**Implementation:** Settings → Accessibility → Colors → a grid of color wells, one per gameplay role. Click a well → color wheel picker opens. A "test" button runs a 5-tick battle simulation in the settings panel using the current palette.

**The color wells:**

```
┌─────────────────────────────────────────────┐
│ SIGNAL COLORS                                │
│ ● Signal Delivered  [■ #00FF87]  [Edit]     │
│ ● Combat            [■ #FF2D2D]  [Edit]     │
│ ● Buffer Warning    [■ #FFB800]  [Edit]     │
│ ● Buffer Overload   [■ #F7FF4A]  [Edit]     │
│                                              │
│ UNIT ACCENTS                                 │
│ ● Scout             [■ #18E0FF]  [Edit]     │
│ ● Relay             [■ #FF3CF2]  [Edit]     │
│ ● Striker           [■ #FF6B35]  [Edit]     │
│ ● Specialist        [■ #8B5CF6]  [Edit]     │
│ ● Command           [■ #FFD700]  [Edit]     │
│                                              │
│ FACTION                                      │
│ ● Player Chrome     [■ #C0C0C0]  [Edit]     │
│ ● Enemy Gunmetal    [■ #3A3A4A]  [Edit]     │
│                                              │
│ PRESETS: [Default] [Protanopia] [Deuteranopia]│
│          [Tritanopia] [High Contrast]        │
│                                              │
│ [Test Battle ▶]  [Import Code]  [Share Code] │
└─────────────────────────────────────────────┘
```

**Conflict detection:** When the player edits a color, all other color wells display their contrast ratio against the edited color. Pairs below WCAG 3:1 luminance contrast flash an amber warning: "Signal Delivered and Scout accent may be hard to distinguish."

**Color palette sharing:** Palettes serialize to a Config Code variant (same `RU1.` prefix, `P` flag for palette). Community-shared palettes for specific CVD types + stylistic preferences.

**Strengths:**
- Maximum player agency
- Covers edge cases (anomalous trichromacy, multiple overlapping CVD types, personal preference)
- Community-shared palettes compensate for individual players' inability to design their own
- The game itself teaches that configuration beats one-size-fits-all — the color picker IS the game's design philosophy applied to accessibility

**Weaknesses:**
- Most players can't evaluate their own color needs — "pick your colors" is unhelpful for someone who doesn't know what they can't see
- Requires robust conflict detection to prevent players from accidentally creating worse problems
- Testing matrix explodes: any combination of 11 custom colors could produce unforeseen visual artifacts
- Overwhelming for new players — settings page bloat

**Comparable:** Overwatch's nine-color option set per enemy/friendly. Factorio's community mod ColorblindUI (proves community will build this if the game doesn't). Civilization VI's customizable territory colors.

### Approach D: "The Luminance Guarantee" — Brightness as the Universal Channel

**Philosophy:** Redesign the ENTIRE color system so that luminance (brightness) alone carries all critical distinctions. Hue is decorative; luminance is functional.

**Implementation:** Assign each gameplay role a brightness band:

| Brightness Band | Luminance (0-100) | Assigned Role |
|-----------------|-------------------|---------------|
| Brightest (90-100) | Near-white | Buffer overload (hazard) |
| Very bright (75-89) | | Signal delivered, active channels |
| Bright (60-74) | | Unit accents (Scout, Relay, Striker) |
| Medium (40-59) | | Terrain features, buffer bars |
| Dark (20-39) | | Board grid, non-active channels |
| Darkest (0-19) | | Board background |

**Combat flash** is handled as a luminance spike — the tile hits 100% brightness for one frame (white flash, not red flash), then the destroyed unit drops to 0% (black silhouette) before the sprite replacement renders. Any CVD type can perceive "bright flash → dark absence."

**The crucial insight:** Under ANY type of CVD, luminance perception is preserved. A player who cannot see green can still see that a pixel is bright. By ensuring that functionally different elements occupy different brightness bands, the game remains legible under complete achromatopsia (total color blindness, ~0.003% of population).

**Strengths:**
- Universal — works for all CVD types, including rare and compound forms
- Elegant — one design pass, not three separate palette variants
- Testable — convert any screenshot to greyscale; if the information survives, the design is accessible
- Supports the game's dark-background aesthetic — neon information on dark backgrounds is inherently high-luminance-contrast

**Weaknesses:**
- Constrains the art direction — the SE Asian cyberpunk warmth (warm greens, rich earth tones, neon variety) is flattened into a brightness hierarchy
- Five unit types at similar brightness become hard to distinguish (cyan, magenta, red-orange, purple, gold all in the 60-74% band)
- Removes aesthetic variety — all "bright things are gameplay, all dark things are scenery" can feel mechanical
- Doesn't address the HUED information that IS useful for typical-vision players (hue as fast-track identification)

**Comparable:** Into the Breach uses luminance heavily — enemy attacks are the brightest elements on screen regardless of hue. TIS-100 and Shenzhen I/O are effectively luminance-only (green-on-black, amber-on-black).

### Approach E: "The Pattern Layer" — Texture Fills Replace Color

**Philosophy:** When colorblind support is active, add geometric PATTERNS to every color-coded element — the color remains for aesthetic purpose, but the pattern is the functional identifier.

**Pattern assignments:**

| Gameplay Role | Pattern | Why |
|---------------|---------|-----|
| Signal delivered | Horizontal lines (═══) | Flowing, directional, like data transfer |
| Combat/death | Diagonal crosshatch (╳╳╳) | Aggressive, cutting, like destruction |
| Buffer warning | Vertical lines (║║║) | Rising, like filling up |
| Buffer overload | Zigzag (⚡⚡⚡) | Electric, dangerous, like sparks |
| Scout accent | Dots (●●●) | Eyes, sensors, observation points |
| Relay accent | Circles (◎◎◎) | Broadcast rings, omnidirectional |
| Striker accent | Triangles (▲▲▲) | Arrows, aggression, forward motion |
| Specialist accent | Squares (■□■□) | Tool heads, precision, modularity |
| Command accent | Stars (★★★) | Rank, authority, military insignia |
| Player faction | Smooth (no pattern) | Clean, polished, controlled |
| Enemy faction | Static noise (░░░) | Glitchy, threatening, foreign |

**Where patterns render:**
- **Buffer bars:** Each pip is filled with the unit's pattern instead of flat color
- **Cell flashes:** Signal delivery fills the cell with horizontal lines; combat fills with crosshatch — even at 200ms, the pattern direction is distinguishable
- **Channel wiring:** Each channel's dashed line uses its assigned unit's pattern as the dash texture
- **Perception radii:** The radius boundary uses the unit's pattern as a border style

**Strengths:**
- Extremely high information density — even a single pixel is distinguishable by pattern direction
- Stackable with color (pattern + color = two channels)
- Aesthetic potential — patterns create a "technical blueprint" feel that enhances the workbench theme
- Precedent in Hue (the puzzle game), which added patterns after convention players couldn't play — critical acclaim for accessibility followed
- Patterns survive screenshot, GIF, video compression, and static image sharing

**Weaknesses:**
- Visual noise — 64 tiles with patterns on buffer bars, cell flashes, wiring, and radii creates dense information
- Pattern readability at pixel scale — buffer pips are 2×1 pixels; horizontal vs. vertical lines at that scale may be indistinguishable
- Performance — rendering patterns inside animated elements (flowing channel wiring) adds texture sampling overhead
- "Looks clinical" — pattern overlays can strip the game of its aesthetic warmth

**Comparable:** Hue (puzzle game) — added geometric patterns to color-coded elements after convention testing revealed colorblind players couldn't play. Puyo Puyo Tetris's colorblind mode replaces colors with symbols. Magic: The Gathering's mana symbols have unique shapes plus textured card borders. The board game Scythe uses unique piece silhouettes per faction.

### Approach F: "The Hybrid Stack" — Progressive, Layered, Opt-In (RECOMMENDED)

**Philosophy:** Build accessibility into the foundation (Approach A: shape-first), offer targeted presets (Approach B) as one-click improvements, unlock full customization (Approach C) for edge cases, and apply luminance discipline (Approach D) as a design constraint throughout. Patterns (Approach E) available as an additional toggle for maximum clarity.

**The four layers, from foundation to surface:**

**Layer 1 — Shape-First Foundation (Always On, Cannot Disable)**
Every gameplay element has a non-color differentiator baked into the base art and animation:
- Signal delivery: expanding ring animation
- Combat: imploding X-burst + screen nudge
- Five unit silhouettes pass the black-fill test (already locked in 6.01b)
- Buffer states differ by fill pattern (empty, partial, hatched, zigzag)
- Player/enemy differ by silhouette angularity (smooth chrome vs. jagged edges)
- Channel wiring uses unique dash patterns per channel (already viable per 6.01c subway map option)

**Layer 2 — Luminance Discipline (Design Constraint, Not Player-Facing)**
The art direction ensures all critical pairs have ≥3:1 luminance contrast:
- Signal green (#00FF87, L=89) vs. Combat red (#FF2D2D, L=43): ratio 2.1:1 — FAILS → combat red needs brightness boost to #FF5555 (L=53) or add white inner flash
- Cyan (#18E0FF, L=80) vs. Magenta (#FF3CF2, L=60): ratio 1.3:1 — needs work at sub-40px sizes; mitigated by shape difference
- Amber (#FFB800, L=78) vs. Yellow (#F7FF4A, L=96): ratio 1.2:1 — CLOSE → overload needs animated treatment (jitter + zigzag pattern) rather than color alone

**Layer 3 — CVD Presets (Settings → Accessibility, One-Click)**
Three presets (Protanopia, Deuteranopia, Tritanopia) that remap ONLY the broken pairs from the degradation analysis above. Plus a "High Contrast" preset that maximizes luminance spread and enables patterns.

Settings UI: First-time launch detects OS-level accessibility settings (where available) and suggests the corresponding preset. "Not sure which one? Here's a quick test" link runs a 5-color discrimination minigame using the game's actual palette — the result auto-selects the best preset.

**Layer 4 — Custom Color Picker (Unlockable via Settings → Advanced)**
Full per-element color wells with conflict detection, community sharing, and import/export. Not shown by default to avoid overwhelming new players.

**The Settings Flow:**

```
Settings → Accessibility → Visual
┌─────────────────────────────────────────────┐
│ COLOR VISION                                 │
│                                              │
│ ○ Default (shape + color)                   │
│ ○ Protanopia (red-reduced)                  │
│ ○ Deuteranopia (green-reduced)              │
│ ○ Tritanopia (blue-reduced)                 │
│ ○ High Contrast (maximum distinction)       │
│                                              │
│ [Preview ▶] shows 10-second sealed watch    │
│                                              │
│ ☐ Enable texture patterns on status elements │
│   (adds geometric fills to buffer bars,      │
│    cell flashes, channel wiring)             │
│                                              │
│ [Advanced: Custom Color Picker →]            │
│                                              │
│ [Not sure? Take the quick color test →]      │
└─────────────────────────────────────────────┘
```

---

## Player Journeys

### Journey: Reyes, 28, Filipino Frontend Developer (Deuteranomaly)

**Context:** Mission 3, first session. Reyes has partial green weakness (deuteranomaly, affecting ~5% of males). He's never been diagnosed — he just knows some games "feel weird." He downloaded Robot Uprising after seeing a TikTok of a coordinated robot attack.

**Minute 0:00 — First Sealed Watch**
The board is an 8×8 Ifugao rice terrace — warm ochre tiles with turquoise water accents, tiny green data-lights embedded in stone steps. Three pre-placed units: a Scout (wedge silhouette, cyan sensor dome), a Relay (tall antenna, dish shape), a Striker (broad body, blade-arm tips). Reyes sees the units clearly — the shapes are distinct even before he registers the colors. The tick clock fills its first pip.

**Minute 0:15 — Signal Delivery**
The Scout spots an enemy. A signal fires: a bright line traces from the Scout to the Relay. On the receiving tile, a ring animation expands outward — concentric circles blooming from the Relay's position. A soft *ping* chime accompanies the expansion. Reyes sees the ring clearly. The flash has a greenish tint that he perceives as yellowish (his deuteranomaly shifting it), but the RING ANIMATION tells him unambiguously: "signal received." He doesn't need to parse the color.

**Minute 0:45 — Combat**
An enemy Striker reaches his Scout. The tile erupts — but not with a ring. An X-shaped burst collapses INWARD toward the Scout's position. A sharp metallic *crack*. The sprite is replaced with a broken chassis. Reyes doesn't see "red vs. green" — he sees "inward collapse vs. outward expansion." Signal = bloom. Death = implosion. The distinction is immediate, physical, pre-conscious. He understands the board state without thinking about color.

**Minute 1:30 — Buffer Bars**
In the Inspector debrief, Reyes clicks on his dead Scout. The buffer visualization shows 6 pips: 5 filled with tiny horizontal-line patterns (occupied slots), 1 empty with just a dashed outline. The filled pips have a color tint he perceives as brownish-cyan (his deuteranomaly shifting the cyan slightly). But the LINE PATTERN in the pips — that's unambiguous. He can count occupied vs. empty by pattern, not color.

**Minute 2:00 — Plan Screen Channel Wiring**
Reyes sets up his first hook, wiring the Scout's ON_SIGHT to a channel called "threats." A dashed line appears on the board between the Scout and the Relay — the Relay listens on "threats." The dash pattern is 4px-on-2px-off with tiny arrow chevrons flowing along the line. The line's color is... he's not sure. Pinkish-purple? The Relay's dish glows with the same pinkish hue. But the DASH PATTERN and FLOW DIRECTION tell him where the signal goes. He doesn't need to identify the color — the animation carries the information.

**Minute 3:00 — Discovery**
Reyes has played three missions without hitting a single colorblind barrier. He doesn't know this is by design. The game never asked him about his color vision. It never offered a "colorblind mode." It simply... works. The shapes, animations, patterns, and sounds carry all gameplay information. The colors make it prettier and faster for his girlfriend watching over his shoulder, but Reyes has never needed them.

**UI Annotations:**
- Signal delivery: expanding ring (outward pulse), 200ms, with sound cue
- Combat: imploding X-burst (inward collapse), 200ms, with screen nudge + sound
- Buffer pips: horizontal-line fill pattern at all times (not just colorblind mode)
- Channel wiring: unique dash pattern with directional chevrons

---

### Journey: Mei, 24, CS Student (Protanopia — Complete Red-Blind)

**Context:** Mission 7, experienced player. Mei has severe protanopia — she sees no red light at all. Reds appear as dark olive/brown. She enabled the Protanopia preset during first launch after the game's "quick color test" auto-suggested it.

**Minute 0:00 — Pre-Battle Plan Screen**
The board is a Cebu urban cyberpunk grid — neon-lit buildings, jeepney silhouettes, exposed fiber optic cables. Mei's factory is at A1, enemy spawner at H8. She's wiring a complex signal chain: Scout → Relay → Striker. In her Protanopia preset, the signal delivery color has been remapped from green (#00FF87) to vivid blue (#4488FF). Channel wiring retains its per-channel dash patterns, but the Relay's accent has shifted from magenta to a cooler blue-violet that's distinct from the signal blue.

Her ghost units sit on the board — holographic projections with horizontal scan-lines. The Scout ghost (wedge silhouette, cyan dome) at C3. The Relay ghost (tall antenna, dish) at D5. Two Striker ghosts (broad body, blade-arms) at F6 and G7. She can identify each by shape at a glance. The color accents confirm her identification but aren't required.

**Minute 0:30 — Buffer Configuration**
She opens her Relay's context config. Buffer bar: 12 pips displayed as a vertical thermometer on the unit's portrait. Each pip is a small horizontal rectangle. At Mei's current fill: 8 of 12 occupied. The occupied pips have a subtle hatching pattern (diagonal lines at 45°), while empty pips show only a dashed outline. The overall bar glows... she perceives the amber warning as a warm yellowish tone. The fact that it's at 8/12 — that's what matters, and the number "8/12" is displayed in small text beside the bar.

She adjusts the eviction priority: oldest-first. The lowest pip in the thermometer gets a tiny downward arrow icon — "this gets evicted first." The arrow is shape information, not color.

**Minute 1:00 — Sealed Watch: The Decisive Moment**
She hits EXECUTE. The board comes alive. Her Scouts fan out. At tick 4, a Scout spots three enemies in the northeast. The signal fires — a BLUE flash (her remapped color) on the receiving Relay's tile, expanding ring animation, ascending *ping*. The Relay compresses and forwards. At tick 6, her Striker receives the compressed intel. Its blade-arm tips (which she perceives as dark olive, but recognizes by their triangular shape extending from the shoulders) orient northeast.

At tick 8, the Striker moves adjacent to an enemy Scout. The tile BURSTS — an X-pattern implodes inward, accompanied by a sharp *CRACK* and a 1px screen shake. The enemy Scout's sprite is replaced with a broken, sparking chassis. Under her Protanopia preset, the combat flash is bright orange (#FF8800) — which she perceives as a warm yellow burst. Crucially, this warm yellow burst is visually distinct from the cool blue signal flash. Signal = cool, expanding. Combat = warm, collapsing. Two dimensions of difference (hue AND animation direction) make the distinction unambiguous.

**Minute 2:00 — Inspector: The Trace**
She scrubs to tick 6 in the Inspector timeline. She clicks her Striker. The decision trace panel shows: "Rule 2 matched: IF context contains [enemy_position, fresh] → engage." The context window visualization shows 8 slots — each with a content type label (text, not just color), a source label (text), and an age number. She reads: "Slot 3: ENEMY_POS, from RELAY-A via threats, age: 2 ticks." The entire diagnostic chain is textual. Color helps her scan faster, but the TEXT is the authoritative source.

She notices the signal genealogy graph — a mini network diagram showing SCOUT-B → RELAY-A → STRIKER-C. The connection lines use the same channel dash patterns as the Plan screen. Even in greyscale, the topology is legible.

**Minute 3:00 — Custom Color Adjustment**
After 7 missions, Mei wants to fine-tune. She opens Settings → Accessibility → Advanced: Custom Color Picker. She sees 11 color wells, currently set to her Protanopia preset values. She wants the combat flash to be even more distinct from signals — she drags it from orange (#FF8800) toward hot pink (#FF3388). The conflict detector shows: "Combat ↔ Relay accent: contrast ratio 2.8:1 — adequate." She accepts. In the preview battle, the combat flash is now a vivid pink burst — instantly distinct from the cool blue signals. She exports her custom palette as a Config Code: `RU1.P.eJx...` and posts it in the r/RobotUprising colorblind thread.

**UI Annotations:**
- Protanopia preset: signal green → vivid blue, combat red → bright orange
- Conflict detection: real-time contrast ratio between all 11 color wells
- Decision trace: all-text with color as speed boost, not requirement
- Custom palette export: Config Code format, community-shareable

---

### Journey: Dr. Tanaka, 58, Retired Physicist (Achromatopsia — Complete Color Blindness)

**Context:** Mission 5, factory introduction. Dr. Tanaka sees NO color — only luminance (brightness). Everything is greyscale. This affects ~0.003% of the population. He enabled "High Contrast" mode at first launch.

**Minute 0:00 — The Board in Greyscale**
High Contrast mode activates all four accessibility layers simultaneously: shape-first foundation, maximum luminance spread, pattern overlays on all status elements, and a boosted contrast preset. The board is a Palawan jungle grid. In Dr. Tanaka's perception, the jungle tiles are mid-grey with slightly lighter canopy textures. The game's luminance discipline ensures the board background lives in the 20-40% brightness band.

Units are BRIGHT — 70-90% brightness band. Against the mid-grey terrain, they pop like light bulbs. His Scout is recognizable by its wedge silhouette and the dotted pattern (●●●) on its buffer bar. His Relay has circle patterns (◎◎◎) on its buffer bar and is the tallest sprite. His Striker has triangle patterns (▲▲▲) — matching the triangular blade-arms. The patterns aren't just random assignments; they REINFORCE the unit's shape language.

**Minute 0:30 — Texture Patterns in Action**
He opens the Plan screen. Channel wiring appears as dashed lines between units. In normal mode, each channel has a color. In High Contrast mode with texture patterns enabled, each channel has a distinct dash pattern: channel "threats" uses long-dash-dot (━·━·), channel "positions" uses double-short-dash (⸗⸗ ⸗⸗), channel "retreat" uses dotted (····). He can trace the topology by pattern alone.

Perception radii render as tile-border highlights. The Scout's radius uses a solid-line border on tiles within range. The Specialist's uses a double-line border. The distinction is structural, not chromatic.

**Minute 1:00 — Factory Introduction**
This is Mission 5 — the factory is introduced. The production queue appears as a horizontal conveyor belt of blueprint icons at the bottom of the Plan screen. Each blueprint icon is a small version of the unit's silhouette — the SAME shape language from the battlefield, miniaturized. Scout icon = tiny wedge. Relay icon = tiny antenna-and-dish. Striker icon = tiny blade-arms. Dr. Tanaka doesn't need color to tell them apart. He drags to reorder: Striker first (he wants offense), then Relay (infrastructure), then Scout (intelligence). The conveyor belt animates left-to-right, each icon sliding into place with a satisfying mechanical *chunk*.

**Minute 2:00 — Combat in Greyscale**
The sealed watch begins. At tick 5, his Striker eliminates an enemy. He sees: a bright flash (100% luminance — white), an X-burst collapsing inward, the sprite replaced by a dark broken shape. The luminance spike is unmistakable — SOMETHING happened at that tile. The X-burst tells him it was destruction, not a signal. A moment later, his Relay receives a compressed signal: a medium-bright expanding ring with a *ping*. The ring is ~75% brightness. The combat flash was ~100%. The 25% luminance gap between "signal received" and "combat" is perceptible even in pure greyscale.

**Minute 3:00 — Inspector with Patterns**
In the Inspector, he scrubs to the decisive tick. He clicks his eliminated enemy. The buffer visualization is entirely pattern-based: occupied pips show horizontal lines (═══), empty pips show dashed outlines. The decision trace uses text labels with small icons: a circle icon (●) for observation entries, a triangle icon (▲) for action entries, a square icon (■) for rule-match entries. He can read the full causal chain without any color information.

**UI Annotations:**
- High Contrast mode: maximum luminance spread + texture patterns + boosted contrast
- Unit identification: silhouette shape + buffer bar pattern (dots/circles/triangles/squares/stars)
- Channel identification: unique dash patterns (long-dash-dot, double-short-dash, dotted, etc.)
- Combat vs. signal: luminance spike (100% vs. 75%) + animation direction (inward vs. outward)
- Inspector decision trace: icon-typed entries (●/▲/■) + text labels

---

## Interaction Effects

### × Art Direction (6.01)
- **Option A "Circuit Board":** Naturally high contrast. Dark backgrounds make neon information pop. Most colorblind-friendly base palette — fewer competing terrain colors. Pattern overlays fit the technical aesthetic.
- **Option B "Tropical Hologram":** Most challenging for colorblind accessibility. Rich terrain colors compete with signal/status colors. The holographic overlay transition must dim terrain enough that remapped signal colors remain distinct against BOTH dark and bright terrain tiles.
- **Option E "Diorama" (recommended):** Good middle ground. Static terrain reduces visual competition. Tilt-shift blur pushes terrain into background, leaving foreground elements (units, signals, combat) in the sharp zone where patterns and shapes are most legible.

### × Unit Sprite Design (6.01b)
The sprite design language's shape-first principle (already locked) IS colorblind accessibility Layer 1. The silhouette test (all units identifiable from solid black fill at game scale) means the unit identification system works under achromatopsia by design. The accent color system (cyan/magenta/red-orange/purple/gold) is a SPEED LAYER for typical vision, not a requirement. This was explicitly stated in 6.01b: "Color should NEVER be the primary identification method."

### × Holographic Overlay (6.01c)
Channel wiring in the overlay system already uses the "Subway Map" style with unique dash patterns per channel. Under colorblind modes, the dash pattern becomes the PRIMARY identifier rather than the color. Channel names displayed at station circles provide text redundancy. The "Shape-First Accessible Overlay" variant (6.01c already designed 6 dash patterns, hatching fills, and number labels) IS Approach E applied to the overlay specifically.

### × Sealed Watch Purity
The locked "no skip, no pause, no tools" rule for sealed watch means the colorblind adaptations must work at the SPEED OF PLAY (1-second ticks, 200ms flash duration). Texture patterns must be perceivable within 200ms — this constrains pattern complexity. Simple direction (horizontal vs. diagonal vs. vertical) works. Complex patterns (dots, stars) may not register at flash speed. **Design constraint: flash-speed patterns must differ in LINE DIRECTION, not detail.**

### × EM Emissions Visualization
EM noise radiates outward from transmitting units. Under colorblind modes, EM pulses need a distinct visual treatment from signal delivery pulses. Solution: EM pulses use circular RIPPLES (fading outward, no directional bias) while signals use LINEAR traces (point-to-point, directional). Shape difference first, color difference second.

### × Inspector Diagnostics
The Inspector is a STATIC analytical tool — the player controls time. This means patterns and color details have unlimited viewing time. All Inspector elements should maximize text/label information over color-coding. The decision trace, buffer visualization, and signal genealogy already use text labels; colorblind modes simply ensure the COLOR elements are also accessible for quick scanning.

### × Mobile / Touch (6.07)
Small screen = smaller sprites = harder to see patterns. Mobile colorblind support should lean MORE heavily on luminance (larger elements are bright, smaller elements are differentiated by shape) and LESS on texture patterns (which require resolution that small screens lack). The buffer bar could be rendered as a simple number (6/12) on mobile rather than colored pips with patterns.

### × Community Config Sharing (7.03a)
Custom color palettes serialize as Config Code variants. This means a colorblind player's community-posted blueprint Config Code includes their palette, and another player importing it sees the color scheme applied in a preview — "this is how the creator intended it to look." Accessible palette sharing as emergent community feature.

### × Boot Log Narrative (6.03)
Diegetic framing for accessibility settings: the boot log could acknowledge the player's visual configuration during initialization. Not medical — functional: "VISUAL PIPELINE CONFIGURED: PATTERN REDUNDANCY ENABLED. LUMINANCE PRIORITY: HIGH." The AI adjusting its own output format to match its operator's capabilities IS the game's theme.

---

## Comparable Games: What Works and What Doesn't

### Into the Breach (What Works)
Into the Breach's colorblind mode adds supplemental icons and maintains the "Alpha Vek" icon variant for enemy type distinction. But its real accessibility comes from STRUCTURAL design: attack previews use arrows, numbers, and tile markers — not just color. The grid is readable in greyscale. Robot Uprising should match this structural baseline and exceed it with targeted palette support.

### Factorio (What Fails)
Factorio's built-in colorblind filter barely changes anything. Items like Productivity vs. Efficiency Modules share identical shapes, differentiated ONLY by color. Community mods (ColorblindUI, Color Blind Ultimate) add numbers, letters, and custom sprites. **Lesson: if you force the community to fix your accessibility, you've failed — but if you build the mod hooks INTO the game (custom color picker, pattern toggles), you've succeeded differently.** Robot Uprising's Custom Palette (Approach C) is the built-in version of what Factorio's community had to build externally.

### Overwatch (Gold Standard for Targeted Palette)
Overwatch's September 2018 overhaul replaced its useless whole-screen filter with nine-color customization for friendly/enemy outlines. Players can separately configure outline colors for allies, enemies, and neutral elements. This granular control — not a global filter, not a single toggle — is the reference for Robot Uprising's Approach C. Key Overwatch limitation: in-game ability colors (Mei's Ice Wall, Lucio's healing aura) don't change. Robot Uprising should ensure ALL gameplay-relevant colors respond to the palette.

### Hue (Pattern Accessibility Pioneer)
Hue is a color-based puzzle game that couldn't be played by colorblind attendees at conventions. The developer went to Reddit's r/colorblind community, who suggested patterns instead of colors. The resulting pattern mode made a COLOR GAME accessible to people who can't see color. Critical acclaim followed. **Lesson: if a game ABOUT color can be made colorblind-accessible with patterns, Robot Uprising (which is about ATTENTION, not color) certainly can.**

### The Last of Us Part II (Scale of Ambition)
60+ accessibility options, BAFTA recognition, became the industry benchmark. Key features: per-element color customization, high-contrast mode that outlines interactive objects, audio cues for visual events. **Lesson: comprehensive accessibility sells games AND wins awards. It's not charity — it's market expansion.**

---

## Sensory Description: What Colorblind Modes FEEL Like

### Default Mode (Typical Vision)
The board is a symphony of color. Jungle tiles glow emerald, rice terraces shimmer with turquoise data-lights, city neon pulses in hot pink and electric blue. Signal delivery paints a bright green line between units, and the receiving tile blooms with an expanding green ring. Combat is a violent red flash — one frame of crimson, a metallic crack, sparks scattering. The contrast between warm terrain and cool information overlays creates a visual rhythm: ground = warm, signals = cool, danger = hot.

### Protanopia Preset
The same board, shifted. Reds are gone — where there was crimson danger, there's now warm orange. Where there was green signal success, there's now vivid blue. The jungle tiles look slightly less green, slightly more yellow-olive to typical-vision observers — but to Mei (protanopic player), they look like lush vegetation. The signal lines are clearly blue, clearly different from the warm orange combat flashes. The game's emotional register is slightly cooler — blue success, orange danger — but the RHYTHM is identical. Bloom outward = good. Collapse inward = bad. Cool = signal. Warm = combat.

### High Contrast + Patterns
The board is starker. Terrain is pushed to mid-grey, units blaze with brightness. Buffer bars on each unit show tiny geometric fills: dots for Scouts, circles for Relays, triangles for Strikers. Channel wiring uses distinct dash patterns — long-dash-dot threading from Scout to Relay, double-short-dash from Relay to Striker. Combat flash is a white spike that bleaches the tile, then an X-burst collapse. Signal delivery is a medium-bright expanding ring with horizontal line texture filling the ring's interior for 200ms.

The Inspector is a field of text and shape. Decision traces use icons: ● for observations, ▲ for actions, ■ for rule matches. The buffer visualization is a vertical column of tiny rectangles, each filled with horizontal lines (occupied) or just an outline (empty). The signal genealogy is a network of nodes connected by dash-pattern lines. It reads like a technical diagram — because it IS a technical diagram, and technical diagrams were never designed around color.

---

## The TikTok Clip

**"I Can't See Color and I'm Winning"** — Split-screen: left side shows the board in full color (typical vision), right side shows the same board in greyscale (simulating achromatopsia). Both sides play the same sealed watch. Left side: green signals, red combat, colorful chaos. Right side: bright expanding rings, white flash X-bursts, pattern-textured buffer bars — every event is legible. A coordinated three-unit flanking maneuver plays out identically on both sides. The voiceover: "Same game. Same clarity. Zero color required." 15 seconds. The comment section: "Wait, the greyscale side looks CLEANER." It does.

---

## New Aspects Discovered

- **6.01d-i — Colorblind quick-test minigame design:** The 5-color discrimination test that auto-selects a CVD preset — exact game design, visual presentation, false-positive handling, integration with first-launch flow
- **6.01d-ii — Community-shared color palettes as accessibility aid:** How the Config Code palette sharing system enables crowdsourced accessibility — r/RobotUprising "best palettes for deuteranomaly" threads, curator role, discovery UX
- **6.01d-iii — Pattern readability at sealed-watch speed:** Empirical testing protocol for which geometric patterns are distinguishable within 200ms flash duration at game-scale pixel resolution; minimum pattern size and complexity constraints
- **6.01d-iv — Diegetic framing of accessibility as AI self-configuration:** Boot log acknowledging visual pipeline settings ("PATTERN REDUNDANCY ENABLED"); diegetic vs. menu-only accessibility; the AI adjusting output to operator capability as thematic coherence
- **6.01d-v — Cross-CVD-type interaction (compound color vision deficiency):** What happens when a player has both protanomaly AND tritanomaly? Custom palette as the only viable approach for compound CVD; minimum viable palette that works under ALL three types simultaneously (the "universal palette" challenge)
