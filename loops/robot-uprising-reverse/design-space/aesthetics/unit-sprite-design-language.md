# 6.01b — Unit Sprite Design Language

## The Problem: Five Robots on a Chessboard

Robot Uprising has five player unit types (Scout, Striker, Relay, Specialist, Command) plus three enemy variants, a base, and ghost/hologram/destroyed states for each. All must be instantly distinguishable on an 8×8 isometric board at roughly 20×28 pixels each, placed atop richly detailed Philippine cyberpunk terrain tiles, under gameplay overlays (buffer bars, perception radii, channel wiring, EM emission rings).

The sprite design language is the visual grammar that lets a player glance at the board and *instantly* parse: "two Scouts north, Relay center, Striker flanking east, Command at base." No reading. No hovering. No tooltips. Pure silhouette recognition in under 500ms.

This analysis explores the complete design space: silhouette grammar, accent color systems, shape language mapping, state variant derivation, enemy faction differentiation, and how all of it survives under the game's many visual overlay systems.

---

## The Shape Language Foundation

### The Three-Shape Vocabulary

Game character design uses three primary geometric forms to communicate role at a pre-conscious level. Robot Uprising's five unit types map naturally onto this vocabulary:

| Unit | Primary Shape | Secondary Shape | Why |
|------|--------------|-----------------|-----|
| **Scout** | **Triangle** (forward-pointing wedge) | Circle (sensor dome) | Triangles communicate speed, direction, and danger-awareness. The Scout's role is forward, fast, pointed — literally an arrowhead moving through the battlespace. The secondary circle (sensor dome) softens the aggression, communicating "I look, I don't fight." |
| **Striker** | **Triangle** (aggressive, broader) | Square (armored chassis) | The Striker's triangle is wider and heavier than the Scout's — a battering ram vs. an arrowhead. The square secondary communicates mass and lethality. "I arrive, you're dead." |
| **Relay** | **Circle** (dish/dome) | Square (base) | Circles communicate reception, broadcasting, completeness. The Relay receives from all directions. Its stationary square base says "I don't move, I anchor." The circle-on-square silhouette is visually unique — no other unit has it. |
| **Specialist** | **Square** (tool platform) | Triangle (tool arm) | The square body communicates reliability and precision — a workbench on legs. The triangular tool arm adds dynamic capability without threatening aggression. |
| **Command** | **Square** (large platform) | Circle (holographic dome) | The largest silhouette on the board. Square = authority, stability, immovability. The circular holographic dome atop says "I see everything." The Command is a fortress that thinks. |

### The Silhouette Test

A design passes the silhouette test when every unit can be identified from a solid black fill at game-scale resolution. At 20×28 pixels, this means each silhouette must differ in at least TWO of these properties:

1. **Height** — tall vs. short (Relay's antenna vs. Scout's low profile)
2. **Width** — broad vs. narrow (Command's platform vs. Scout's wedge)
3. **Top profile** — pointed vs. rounded vs. flat (Striker's blade-arms vs. Relay's dish)
4. **Symmetry** — symmetric vs. asymmetric (Specialist's tool arm breaks symmetry)
5. **Verticality** — ratio of height to width (Relay is nearly as tall as wide; Scout is wider than tall)

### The Silhouette Matrix (Black Fill, 20×28 Canvas)

```
Scout:          Striker:        Relay:          Specialist:     Command:
   ▲               ▲▲             ⊙              ■▸             ┃
  ◢█◣             ◢██◣            ┃              ███             █
 ◢███◣           ◢████◣          ⬡█⬡            ███▸           █████
  ███             ████            ██              ███           █████
   █               ██             █               █            █████
                                                                ███

Height:  Low       Medium        Tall           Medium          Tall
Width:   Narrow    Medium        Medium         Medium          Wide
Top:     Pointed   Pointed       Round          Flat+Arm        Flat+Dome
Symm:    Yes       Yes           Yes            NO (tool arm)   Yes
H:W:     1:1.4     1:1.2         1.5:1          1:1             1:1.3
```

**Key differentiator pairs:**
- Scout vs. Striker: Scout is narrower, lower, single point; Striker is broader, taller, blade-arms visible at sides
- Relay vs. Command: Relay is vertical (tall, narrow base), Command is horizontal (wide platform)
- Specialist: Only asymmetric unit — the protruding tool arm makes it instantly unique even as a silhouette

---

## The Accent Color System

### Design Principle: Color Confirms, Shape Identifies

Color should NEVER be the primary identification method (accessibility mandate — colorblind players must still distinguish units). Shape is primary. Color is a fast-track confirmation layer that makes identification *faster* for sighted players but isn't *required*.

### The Five-Hue System

Each unit type has a dedicated hue. The hue appears in three places on the sprite:

1. **Primary accent** — the unit's "eye" or "core" glow (3-5 brightest pixels)
2. **Secondary accent** — stripe, trim, or panel edge (8-12 pixels at medium brightness)
3. **Buffer bar tint** — the tiny pip row below the unit tints toward the unit's hue

| Unit | Hue | Hex (Bright) | Hex (Dark) | Where It Appears |
|------|-----|-------------|------------|-----------------|
| Scout | **Cyan** | #18E0FF | #0A7B8C | Sensor dome glow, antenna tip, perception cone tint |
| Striker | **Red-Orange** | #FF6B35 | #8C3A1C | Blade-arm edge glow, chassis stripe, combat flash tint |
| Relay | **Magenta** | #FF3CF2 | #8C1F85 | Dish glow, base ring, channel wiring source tint |
| Specialist | **Purple** | #8B5CF6 | #4A2F85 | Tool arm tip glow, chest panel, hack effect tint |
| Command | **Gold** | #FFB800 | #8C6400 | Dome glow, platform edge trim, holographic projection tint |

### The Chrome Body Convention

All player units share a common chrome/silver body palette: #C0C0C0 (body), #E8E8E8 (highlight), #707070 (shadow), #404040 (darkest accent). This serves three purposes:

1. **Faction identification** — chrome = player. Enemy units use a different body palette (gunmetal #3A3A4A with red-shifted accents), creating an immediate faction read.
2. **Accent contrast** — colored accents pop maximally against neutral chrome.
3. **Production efficiency** — the shared body palette means new states (damaged, ghost, hologram) can be derived algorithmically from the base sprite.

### Colorblind Resilience

Under protanopia/deuteranopia (red-green confusion), the critical distinction is Scout (cyan) vs. Striker (red-orange). Both shift toward yellow-brown under simulation, but the SHAPE difference (narrow wedge vs. broad blade-arms) maintains readability. Under tritanopia (blue-yellow confusion), Scout and Command become harder to distinguish by color alone — again, shape (tiny wedge vs. massive platform) carries the load.

**The acid test:** Print the board in grayscale. Can you still identify every unit? With proper silhouette grammar, yes.

---

## Per-Unit Sprite Specifications

### Scout — "The Arrowhead"

**Silhouette:** A compact, forward-leaning wedge. Low center of gravity. Single sensor dome on top (2×2px cyan circle). Swept-back antenna (1px line extending from dome rearward). No visible legs — treads or hover skirt implied by the smooth bottom edge. The fastest-looking unit on the board.

**Pixel Budget (20×28, SE-facing isometric):**

| Row Range | Content |
|-----------|---------|
| 0-5 | Empty (Scout is SHORT — top 6 rows unused, making height difference from Relay/Command immediately visible) |
| 6-8 | Antenna: 1px diagonal line of #0A7B8C from row 6 center-right to row 8 center, ending in sensor dome |
| 8-10 | **Sensor dome:** 3×3px rounded area, center pixel #18E0FF (bright cyan glow), surrounding pixels #0A7B8C (dark cyan), subtle 1px glow halo on even ticks |
| 10-14 | **Chassis wedge:** Forward-pointing triangle of chrome (#C0C0C0 top, #707070 sides), narrowing from 8px wide at row 10 to 4px at row 14. Cyan stripe (1px, #0A7B8C) runs along the center line. The wedge shape IS the Scout's identity. |
| 14-17 | **Undercarriage:** 6px wide platform, #404040 darkest chrome. A 1px shadow extends 2px below on terrain. |
| 18-20 | **Buffer bar zone:** 6 horizontal pip slots (Scout has 6 buffer slots). Each pip is 2×1 pixels. Filled pips use Scout's cyan tint (#18E0FF at 60% against dark background). Empty pips are #2A2A3A. |
| 21-28 | Empty (shadow and tile space) |

**Idle animation (2 frames, alternating every 8 ticks):**
- Frame A: Sensor dome pixel at full brightness (#18E0FF)
- Frame B: Sensor dome pixel dims to #0A7B8C, antenna tip brightens to #18E0FF

This creates a "scanning" effect — the eye appears to pulse between dome and antenna tip, suggesting constant vigilance. Total animation cost: 2 pixels change, negligible GPU impact.

**What it FEELS like:** A darting insect. An eye on stilts. Something that exists to SEE and FLEE. The cyan glow says "signal," not "weapon." When you look at a board with three Scouts, your eye naturally follows their pointed wedges like arrows on a map — they POINT at the space they're observing, even in a static screenshot.

### Striker — "The Blade"

**Silhouette:** Aggressive forward lean, broader than the Scout, with distinctive blade-arms extending from the shoulders. The blade-arms are the signature detail — two 1px lines extending outward and slightly forward from the upper chassis, ending in bright red-orange tips. Without the blade-arms, a Striker could be confused with a Scout. WITH them, it's unmistakable.

**Pixel Budget (20×28, SE-facing isometric):**

| Row Range | Content |
|-----------|---------|
| 0-3 | Empty |
| 4-6 | **Blade-arms:** Two diagonal 1px lines of #8C3A1C extending from shoulders (row 6) upward and outward to row 4. Tips are #FF6B35 (bright red-orange). These 4 pixels are the Striker's IDENTITY — remove them and you lose the unit. |
| 6-10 | **Upper chassis:** Angular forward-leaning torso, 10px wide at shoulders, narrowing to 6px at waist. Chrome body with a 2px red-orange (#FF6B35) horizontal stripe across the chest. The angular shoulder line (row 6) is 2px higher on the leading (SE) side — the lean communicates forward momentum. |
| 10-15 | **Lower chassis:** Heavier than Scout, 8px wide. Two visible leg struts (2px each), mechanical/angular, suggesting bipedal stance. #707070 chrome shadow. |
| 15-18 | **Feet/ground:** 4px shadow. Heavier ground contact than Scout suggests weight, mass, lethality. |
| 18-21 | **Buffer bar zone:** 8 pips (Striker has 8 buffer slots). Red-orange tint (#FF6B35 at 60%). |
| 22-28 | Empty |

**Idle animation (2 frames, 12-tick cycle):**
- Frame A: Blade-arm tips at full brightness, chest stripe dim
- Frame B: Blade-arm tips dim, chest stripe brightens

A slow, menacing pulse — the energy cycles between arms and core, suggesting coiled potential. Unlike the Scout's quick scanning, the Striker's animation is deliberate, heavy.

**What it FEELS like:** A spring-loaded trap. Even standing still, the Striker looks like it's about to move. The blade-arms create a wider silhouette than any other unit at that height, and the red-orange tips draw the eye like warning markings on a venomous animal. When a Striker reaches an adjacent tile and the combat flash fires — instant red, snap, gone — the blade-arms feel like the last thing the enemy saw.

### Relay — "The Tower"

**Silhouette:** The most vertically distinctive unit. A tall antenna array rising from a squat hexagonal base. The Relay is the only unit that's TALLER than it is wide. Combined with its stationary nature (no legs, no movement), it reads as architecture — a building, not a creature. This is intentional: Relays are infrastructure, not combatants.

**Pixel Budget (20×28, SE-facing isometric):**

| Row Range | Content |
|-----------|---------|
| 0-2 | **Antenna tip:** 1px bright magenta (#FF3CF2) at center, flanked by 1px dark magenta (#8C1F85) on each side. The tip pixel pulses (animation). Three prongs visible = "broadcasting." |
| 2-8 | **Antenna shaft:** 2px wide vertical line of #707070 chrome, centered. At rows 4 and 6, tiny 1px horizontal crossbars of #404040 suggest a lattice tower structure. The shaft is the tallest continuous feature on any unit — it makes the Relay visible even behind other units due to the isometric projection. |
| 8-10 | **Dish:** A 6px wide shallow arc of #C0C0C0 chrome, dipping 2px in the center like a satellite dish. The concave center pixel is #FF3CF2 (bright magenta), creating a "reception point." The dish is the Relay's SHAPE SIGNATURE — it's the only concave feature on any unit. |
| 10-16 | **Hexagonal base:** 8px wide at row 12 (widest), narrowing to 6px at rows 10 and 16. Chrome (#C0C0C0) with a 1px magenta (#8C1F85) ring around the base edge at row 15. The hexagonal shape (visible as a diamond in isometric) distinguishes the base from the rectangular platforms of other units. |
| 16-18 | **Ground contact:** Flush with terrain — no legs, no shadow gap. The Relay is PLANTED. |
| 18-21 | **Buffer bar zone:** 12 pips (Relay has the second-largest buffer). Magenta tint. More pips than other units = visually wider buffer bar = immediate "this unit handles data" signal. |
| 22-28 | Empty |

**Idle animation (3 frames, 6-tick cycle):**
- Frame A: Antenna tip bright, dish center dim, base ring dim
- Frame B: Antenna tip dim, dish center bright, base ring dim
- Frame C: Antenna tip dim, dish center dim, base ring bright

Energy flows DOWN the Relay — receive at antenna, focus at dish, distribute at base. This three-beat animation is unique to the Relay and creates a visible "heartbeat" rhythm that's faster than the Striker's and different in direction from the Scout's lateral scanning.

**What it FEELS like:** A lighthouse. A cell tower. Something that stands still and *radiates*. The vertical emphasis among horizontal-dominant units makes Relays pop on the board — your eye finds them quickly because they break the height rhythm. When four Relays form a network and their animations fall slightly out of sync, they create a visible "pulse network" — each one's glow cascading to the next's dish, the next's base ring, a wave of magenta energy flowing through the infrastructure. This is the "wiring diagram comes alive" moment that Into the Breach never has, because Into the Breach has no communication layer.

### Specialist — "The Tool Arm"

**Silhouette:** The only ASYMMETRIC unit on the board. A medium-height rectangular body with a prominent tool arm extending from the right shoulder at a 45-degree angle. The asymmetry is the Specialist's entire visual identity — in a game where every other unit is bilaterally symmetric, the one robot with a single protruding arm is instantly identifiable even at 12px tall in a zoomed-out screenshot.

**Pixel Budget (20×28, SE-facing isometric):**

| Row Range | Content |
|-----------|---------|
| 0-3 | Empty |
| 4-7 | **Tool arm:** Extending from the right shoulder (row 7) diagonally upward to row 4, rightward. 3px long, 1px wide. Tip is #8B5CF6 (bright purple), shaft is #707070. The arm's diagonal line contrasts with every other unit's vertical/horizontal emphasis. When facing SE (default), the tool arm points NE — creating a visual "reaching" gesture. |
| 7-12 | **Body:** Rectangular, 8px wide, 5px tall. Squarer than Scout or Striker — no aggressive angles, no wedge shape. Chrome body with a 2×2px purple panel (#4A2F85) at center-chest. The panel suggests internal systems visible through a viewport — this is a diagnostic/analytical unit. |
| 12-16 | **Legs:** Two leg struts like Striker but thinner (1px each), positioned closer together. Hunched posture — the body sits slightly forward of center over the legs, suggesting an analytical lean. |
| 16-18 | **Shadow and ground** |
| 18-21 | **Buffer bar zone:** 10 pips. Purple tint. |
| 22-28 | Empty |

**Idle animation (2 frames, 10-tick cycle):**
- Frame A: Tool arm tip at full purple brightness, chest panel dim
- Frame B: Tool arm tip dims, chest panel brightens. ALSO: the tool arm rotates 1px clockwise (the tip pixel shifts down-right by 1px)

The subtle tool rotation is the Specialist's signature animation — it suggests the tool arm is cycling through attachments, scanning, analyzing. The rotation is tiny (1 pixel shift) but visible because it changes the unit's outline, which no other idle animation does.

**What it FEELS like:** A robotic praying mantis. Something that peers and probes. The asymmetry creates a slight visual tension — your eye wants to resolve the imbalance, so the Specialist draws attention disproportionate to its importance. This is actually useful: Specialists perform high-value actions (hack, extract) and SHOULD draw the player's eye. When a Specialist deploys its hack skill on an adjacent enemy, the tool arm extends 2px further and its tip brightens to maximum — a tiny reaching gesture that, at game scale, reads as "touching" the target.

### Command — "The Fortress"

**Silhouette:** The LARGEST unit on the board by a significant margin. A wide, low platform (wider than tall, unlike every other unit) with a holographic dome rising from its center. The Command unit should be immediately visible as "the boss" — it occupies more visual space than anything else, and its gold accents are the warmest color on the board.

**Pixel Budget (20×28, SE-facing isometric):**

| Row Range | Content |
|-----------|---------|
| 0-1 | Empty |
| 2-6 | **Holographic dome:** A 4px wide, 4px tall rounded shape at center. Semi-transparent: underlying pixels of #FFB800 (gold) at 60% opacity over the chrome platform below. The dome's center pixel is full brightness #FFB800, creating a "golden eye" effect. The dome distinguishes Command from Relay — Relay's height comes from a thin antenna, Command's comes from a broad dome. |
| 6-10 | **Upper platform:** 12px wide (widest of any unit), chrome body. Two rows of 1px antenna stubs rise from the platform edges (3 stubs on each side, 1px tall each), suggesting multiple communication arrays. Gold (#8C6400) trim along the platform edge at row 10. |
| 10-15 | **Lower platform:** Continues at 12px wide, with visible isometric depth (3px tall walls). The walls show panel lines (#404040) and small status LEDs (1px dots of varying colors — a miniature dashboard visible at macro scale). |
| 15-17 | **Ground contact:** Wide shadow (10px), no legs. Like the Relay, the Command is PLANTED — but its shadow is much wider, communicating greater mass and presence. |
| 17-21 | **Buffer bar zone:** 14 pips (largest buffer in the game). Gold tint. The 14-pip bar is visually wider than any other unit's, reinforcing the "this is the most important unit" hierarchy. |
| 22-28 | Empty |

**Idle animation (4 frames, 8-tick cycle):**
- Frame A: Dome full gold, all antenna stubs dim
- Frame B: Dome half brightness, left antenna stubs brighten
- Frame C: Dome dim, right antenna stubs brighten, left dim
- Frame D: All antenna stubs bright, dome begins brightening

The Command's animation is the most complex — a four-beat cycle suggesting orchestration. Energy radiates outward from the dome to the antenna arrays and back, like a conductor's pattern. When the Command unit uses its reassign/reroute/prioritize skills, the dome flares to maximum brightness and the animation temporarily doubles in speed — a visible "thinking harder" state.

**What it FEELS like:** A throne. A command center. The gold glow among chrome and neon creates a visual anchor — your eye gravitates to it. When a Command unit is destroyed (one-shot-one-kill), the largest sprite on the board collapses into the largest debris field, the gold glow extinguishes, and the silence where its animation used to pulse is palpable. Losing the Command should feel like losing your queen in chess — the board suddenly looks empty.

---

## State Variants: Deriving Destroyed, Ghost, and Hologram from Base Sprites

### The Derivation Pipeline

A key production constraint: each unit needs idle, destroyed, and hologram (ghost) states, plus icon and portrait. Rather than hand-painting 5×5=25 sprites from scratch, the design language should enable algorithmic derivation from base sprites:

### Destroyed State — "The Wreckage"

**Derivation rule:** Take the base sprite. Apply three transformations:
1. **Collapse:** Compress the sprite vertically by 40% (the unit has fallen over / collapsed). A 20×28 sprite becomes 20×17, with the remaining rows filled with debris scatter.
2. **Desaturate:** Shift all accent colors toward grey. Cyan → #7AA8B0. Red-orange → #A08070. Gold → #A09060. The color drains from the wreck.
3. **Spark overlay:** 2-3 pixels of bright white (#FFFFFF) scattered at random positions within the collapsed form, flickering on alternating ticks. These are electrical arcs — the only animation on a destroyed unit.

**What it LOOKS like:** A crumpled chrome form, half the height of the living unit, lying on its tile. The accent color is gone — replaced by a muted echo. Tiny white sparks pop and vanish. Vines (1px green tendrils from the terrain tile below) begin to encroach on the wreckage after 10 ticks — the Philippine jungle reclaiming the fallen machine. The destroyed state is deliberately pathetic — these were your agents, and now they're scrap.

**Cultural detail:** The vine reclamation is specifically inspired by the way tropical vegetation in the Philippines reclaims abandoned structures within months — rusting jeepneys swallowed by ficus, abandoned Marcos-era buildings consumed by jungle. The fastest visual shorthand for "this was technology, now it's nature."

### Ghost/Hologram State — "The Projection"

**Derivation rule:** Used during Plan phase to preview unit placement. Three transformations:
1. **Opacity:** Render the base sprite at 40% opacity. The terrain tile shows through.
2. **Tint:** Apply a uniform cyan tint (#18E0FF at 20% blend) regardless of unit type. All ghost units share this tint — they're all projections from the same planning system. This also reinforces the holographic overlay aesthetic (see art direction Option B "The Tropical Hologram").
3. **Scan line:** A 1px horizontal line of full brightness sweeps down the sprite every 16 ticks (top to bottom in 8 frames). This is the "refresh line" of a holographic projection — a simple effect that screams "this isn't real yet."

**What it LOOKS like:** A translucent cyan shimmer of the unit, standing on its intended tile. The scan line sweeps down like an old CRT monitor refreshing. The unit's silhouette is still readable (shape language survives at 40% opacity), but the accent colors are washed out by the cyan tint. You can see the terrain through the ghost.

**Interaction with perception radii and channel wiring:** Ghost units display their perception radii as dashed cyan circles (matching the ghost tint) and channel wiring as dashed magenta lines. "Dashed" means every other pixel is transparent — the dashing reinforces "this is a plan, not reality."

### Icon State (32×32) — "The Glyph"

**Derivation rule:** Simplify the silhouette to its single most distinctive feature, rendered at 32×32 with 2px padding:

| Unit | Icon Glyph | Description |
|------|-----------|-------------|
| Scout | A single large eye/circle with a pointed wedge below | Reduces to: circle-on-triangle. 4 colors: cyan glow, chrome, dark chrome, background. |
| Striker | Crossed blade-arms over a chassis wedge | Reduces to: X-on-triangle. Red-orange blades, chrome body. |
| Relay | Antenna with dish, vertical emphasis | Reduces to: line-with-arc. Magenta dish, chrome shaft. |
| Specialist | Rectangular body with protruding diagonal arm | Reduces to: square-with-diagonal. Purple tip, chrome body. |
| Command | Wide platform with dome | Reduces to: dome-on-rectangle. Gold dome, chrome platform. |

Each icon must pass the "production queue test" — when five icons sit side by side in the conveyor belt at 32×32, can you distinguish all five instantly? The shape-first approach guarantees this.

### Portrait State — "The Blueprint"

**Purpose:** Shown in the workbench's blueprint editor panel (Plan screen, right side). Larger, more detailed, with room for aesthetic expression.

**Rendering approach:** A 128×128 detailed view of the unit's upper body, rendered in the same pixel art style but with much more detail — visible panel seams, rivets, serial number stamps, cultural embellishments. The portrait is where the SE Asian cyberpunk aesthetic can breathe:

- **Scout portrait:** Close-up of the sensor dome and antenna. Tiny Philippine script (Baybayin) etched into the dome housing. The iris of the sensor eye has visible concentric rings suggesting a Fresnel lens. Background: bokeh of jungle green.
- **Striker portrait:** Blade-arms crossed in front of the chest. The blade edges have a machete-like curve inspired by Filipino bolos. Red-orange energy crackles along the cutting edge. Background: dark red atmospheric glow.
- **Relay portrait:** The dish dominates the frame, with the antenna extending upward out of view. The dish's interior surface has a pattern of concentric circles overlaid with a spider-web pattern — inspired by the geometric patterns of Filipino weaving (T'nalak). Background: signal wave pattern in magenta.
- **Specialist portrait:** The tool arm extends into the foreground, tip glowing purple. The tool head has visible interchangeable attachments — a tiny carousel of specialized implements. Inspired by the multi-tool knives carried by Philippine fishermen. Background: schematic blueprint lines.
- **Command portrait:** The holographic dome fills the upper third, casting golden light across the platform below. Multiple antenna arrays visible in detail — each one a different height and style, suggesting different communication protocols. The platform has tiny screens showing miniaturized versions of the battlefield. Background: golden radial glow.

---

## Enemy Faction Visual Differentiation

### The "Adversarial Chrome" Palette

Enemy units use the same five silhouettes (Scout, Striker, Relay) but with a completely different body palette:

| Property | Player Units | Enemy Units |
|----------|-------------|-------------|
| Body chrome | #C0C0C0 (bright silver) | #3A3A4A (gunmetal dark) |
| Highlights | #E8E8E8 (white-silver) | #5A5A6A (steel blue) |
| Shadows | #707070 (medium grey) | #1A1A2A (near-black) |
| Darkest | #404040 (dark grey) | #0A0A1A (abyss) |
| Accent override | Per-type hue | **All red** — #FF2D2D (bright), #8C1616 (dark) |

**Why all-red accents for enemies:** In the player's units, accent color differentiates type. In enemy units, the SHAPE still differentiates type, but the uniform red accent immediately signals "threat" — you don't need to know what KIND of enemy unit it is as fast as you need to know WHERE the enemies are. Red is the universal danger signal. The gunmetal body ensures enemies are visually darker than player units — "our chrome vs. their shadow."

**Enemy idle animation difference:** Enemy animations are FASTER — the pulse cycle runs at 4 ticks instead of 8-12. This creates subliminal unease. Player units breathe slowly; enemy units vibrate with aggression. The speed difference is below conscious perception at first, but veterans learn to read it — a slowed enemy animation would signal a debuff or disruption.

### The Enemy Base

The enemy base uses the same dark gunmetal palette but is rendered as a corrupted/inverted version of the player base. Where the player base is a factory (orderly, productive, gold-lit), the enemy base is a hive (organic angles, red pulsing, asymmetric growth). This isn't a lore decision at the sprite level — it's a readability decision. The two bases must be instantly distinguishable at opposite corners of the 8×8 board.

---

## Interaction Effects: How Sprites Survive Under Overlays

### Buffer Bars

Each unit has a buffer bar rendered directly below its sprite (in the 18-21 row zone). The buffer bar's WIDTH is proportional to buffer size: Scout (6 pips, narrowest) → Command (14 pips, widest). This creates a secondary visual hierarchy that reinforces the unit type: wider bar = more important information processor.

**Pip colors during gameplay:**
- Empty: #2A2A3A (barely visible)
- Filled (recent): Unit's accent color at 80% brightness
- Filled (stale): Unit's accent color at 40% brightness (signals aging data)
- Overflowing/evicting: Bright red flash (#FF2D2D) on the leftmost pip as it's evicted

The buffer bar is the "health bar" of Robot Uprising — except it measures information capacity, not hit points. A glance at bar fill levels across the board tells the story: "Relays full (good, they're processing), Scouts half-full (expected, they're scouting), Striker full (BAD — it's drowning in data and can't process orders)."

### Perception Radii

Scout and Specialist perception radii render as translucent colored circles around the unit. The circle uses the unit's accent color at 15% opacity with a 1px solid border at 30% opacity. The radius must NOT obscure unit silhouettes within it — hence the extreme transparency. The border is the readable element; the fill is atmospheric.

### Channel Wiring Lines

Hook channel connections render as colored lines between units. Lines route orthogonally along grid edges (not diagonally through tiles) to maintain the schematic/circuit-board aesthetic. Each channel has a unique color derived from a hash of its name string. Lines originate from the unit's accent glow point (Scout's dome, Relay's dish, etc.) and terminate at the receiving unit's base.

**Sprite interaction:** Wiring lines route AROUND unit sprites, never through them. A line approaching a unit curves to connect at the unit's base/side, creating a visual "plugging in" effect. When a signal traverses a channel during sealed watch, the line brightens momentarily and a 2px dot of light travels along it at a rate matching signal latency (1 tile per tick).

### EM Emission Rings

Units that transmit via hooks emit detectable EM noise, visualized as expanding concentric rings from the unit's position. The rings use the unit's accent color at 10% opacity, expanding outward at 1 tile per tick, fading over 3 ticks. On a board with many active units, multiple overlapping EM rings create a complex interference pattern — visually beautiful and informationally meaningful (areas of high EM density are "loud").

**Sprite interaction:** EM rings render BEHIND unit sprites (lower z-order), so unit silhouettes remain readable even in high-emission scenarios.

---

## Player Journeys

#### Journey: Tomás, 16, First-Time Strategy Player

**Context:** Mission 1 ("Wake Up"). Tomás has never played a strategy game. He's looking at the Plan screen for the first time.

**Minute 0:00 — "What Are These Things?"**
The board loads on the left side of the split-view Plan screen. Two units stand on the 8×8 grid — a Scout at D3 and a Scout at F5. They're tiny chrome wedges with pulsing cyan dots. Tomás's eye is immediately drawn to the cyan glow — it's the brightest thing on the dark jungle terrain. He can tell both units are the same type because they have the same shape and color, even though he doesn't know what a "Scout" is yet.

The boot log on the right reads: `PERCEPTION SUBSYSTEM: online. Two forward observers deployed. Awaiting configuration.`

He hovers over the Scout at D3. A tooltip appears: "Scout — 👁 — Buffer: 6 slots." The perception radius materializes — a translucent cyan circle extending 5 tiles in every direction. "Oh, this is what it can SEE," Tomás thinks. The radius overlaps with the other Scout's.

**Minute 0:30 — "They Look Different From the Bad Guys"**
Three enemy units are visible on the board — darker, redder. Tomás doesn't read the labels. He doesn't need to. The enemies are DARK (gunmetal bodies) with RED accents. His units are BRIGHT (chrome bodies) with CYAN accents. The faction distinction is pre-verbal: dark-red = threat, bright-cyan = mine.

**Minute 1:00 — "The Little Bars"**
He notices the tiny buffer bars below each Scout. Six dim dots in a row. The boot log says: `CONTEXT WINDOW: 6 slots per observer. Information fills slots. Oldest data evicted when full.` He doesn't fully understand yet, but the bars are THERE — a visual promise that they'll matter later.

**Minute 1:30 — Hitting EXECUTE**
The sealed watch begins. Ticks fire. His Scouts move. Their cyan sensor domes pulse with each tick — scanning. An enemy Scout enters a perception radius. The buffer bar below his Scout flickers — one pip lights up cyan. Something was observed. Another tick: two pips. The buffer is FILLING. Tomás watches the bar grow, pip by pip, and feels a strange anxiety — like watching a glass fill with water. "When it's full... what happens?"

**UI Annotations:**
- Scout sprite: 20×28px, 6-row buffer bar below, cyan accent on sensor dome
- Enemy scout: Same silhouette but gunmetal body, red accent, faster animation pulse
- Perception radius: Translucent cyan circle, 1px solid border, 5-tile radius
- Buffer bar: 6 pips, 2×1px each, filling left-to-right with cyan glow

---

#### Journey: Dr. Priya, 38, ML Engineer and Factorio Veteran

**Context:** Mission 6 ("Assembly Line"). Priya has unlocked the factory and is building her first production queue. She's designing blueprints for a multi-unit architecture.

**Minute 0:00 — "Reading the Board Hierarchy"**
Priya's board has 8 units: 2 Scouts (wedges, cyan), 3 Relays (towers, magenta), 2 Strikers (blades, red-orange), and 1 Command (fortress, gold). She's been playing long enough that she reads the board in a single glance — the shape grammar is internalized. She doesn't think "that's a Relay" — she thinks "that's my signal tower at E4" the same way a chess player thinks "bishop on e4."

The visual hierarchy works exactly as designed: her eye goes to the Command first (largest sprite, gold glow), then sweeps the Relay network (tallest silhouettes, magenta pulses), then finds the Scouts (smallest, furthest forward), then locates the Strikers (blade-arms visible even at board scale).

**Minute 0:45 — "The Production Queue Reads Like a Sentence"**
The conveyor belt at the bottom of the Plan screen shows her build order as 32×32 icons: Scout, Relay, Striker, Relay, Scout. The icon glyphs are immediately readable — eye-triangle, line-arc, X-triangle, line-arc, eye-triangle. She drags to reorder: Relay first (infrastructure before scouts), then Scout, Scout, Striker. The icons snap into position. Each icon's accent color (magenta, cyan, cyan, red-orange) creates a color sentence in the queue — she's reading production plans by color pattern now.

**Minute 2:00 — "The Ghost Preview Network"**
She places a ghost Relay at C6. The hologram appears — translucent cyan shimmer, scan line sweeping down. As she configures its hooks, dashed magenta lines extend from the ghost Relay to her existing Scouts and Strikers, showing the channel topology she's building. The ghost units are clearly FAKE (translucent, scan-line, dashed connections) but they show real spatial relationships. She can see her signal network before committing resources.

She places a ghost Striker at G7. Its perception radius appears — a tiny dashed circle (radius 2). "That's not enough coverage," she mutters. She moves it to G5. The radius now overlaps with a Scout's observation zone. She nods — the Striker will receive relayed intelligence about enemies the Scout sees.

**Minute 3:30 — "Buffer Bars as Dashboard"**
During sealed watch, Priya's attention is 60% on buffer bars, 40% on unit positions. She's reading the board like a systems dashboard — the Relays' 12-pip bars are all half-full (good throughput), the Scouts' 6-pip bars are cycling rapidly (healthy observation churn), but the Command's 14-pip bar is FULL and the leftmost pip is flashing red. The Command is drowning in data. "I need to add a filter Relay between the Scouts and the Command," she decides before the battle even ends.

**UI Annotations:**
- Command buffer bar: 14 pips, gold-tinted, full state with red eviction flash
- Ghost Relay: 40% opacity, cyan tint, horizontal scan line, dashed channel wiring
- Production queue icons: 32×32, shape-first glyphs with accent color, drag-to-reorder
- Board read order: Command (gold, large) → Relays (magenta, tall) → Scouts (cyan, small) → Strikers (red-orange, blade-arms)

---

#### Journey: Marcus, 52, Colorblind (Deuteranopia) History Teacher

**Context:** Mission 3 ("Blind Spots"). Marcus has deuteranopia — he can't reliably distinguish red from green. He's never played a programming game.

**Minute 0:00 — "I Can Tell Them Apart"**
Marcus has six units on the board: 2 Scouts, 2 Relays, 1 Striker, 1 Specialist. Under deuteranopia simulation, cyan reads as light blue (still distinct from background), red-orange reads as brownish-yellow, magenta reads as blue-purple, and purple reads as blue. Gold reads as brownish-yellow — similar to the Striker's shifted red-orange.

But Marcus doesn't need color. He identifies units by shape:
- Scouts: small pointed wedges (the only forward-pointing units)
- Relays: tall towers with dishes (the only vertical units)
- Striker: the one with blade-arms sticking out (asymmetric width)
- Specialist: the one with a single arm angled diagonally (the only asymmetric unit)

The silhouette grammar carries the entire identification burden. Color is a bonus — it makes identification faster for players who can perceive it, but it's never required.

**Minute 1:00 — "The Buffer Bars Help Too"**
Even though Striker and Command have similar shifted colors under deuteranopia, their buffer bars are wildly different widths: 8 pips vs. 14 pips. Marcus uses bar width as a secondary identification cue — "the unit with the huge bar is my Command." He doesn't realize he's doing this; it's unconscious information processing.

**Minute 2:00 — "The Shape Stays in Destruction"**
An enemy Striker reaches his Scout. Combat flash (red — which Marcus sees as brownish). His Scout collapses into wreckage. But the wreckage still has a recognizable shape — the collapsed wedge, 40% height. "My Scout!" he says. He didn't need color to identify the wreckage. The vine tendrils start growing over it. He feels a pang.

**Minute 3:00 — "I Know What Each One Does By Looking"**
By Mission 3, Marcus has internalized the shape→role mapping without ever consulting a legend:
- Pointed things move fast and see far → Scout
- Wide blade things kill → Striker
- Tall tower things relay signals → Relay
- The one with the weird arm does special stuff → Specialist

This is the shape language working as intended. Marcus has learned a complete visual vocabulary through gameplay, and color blindness hasn't slowed him down at all.

**UI Annotations:**
- Silhouette readability: All five units distinguishable in grayscale/deuteranopia simulation
- Buffer bar width as secondary ID cue: 6 < 8 < 10 < 12 < 14 pips
- Destroyed state: Retains collapsed silhouette shape, vine reclamation animation
- No tooltips needed for identification after Mission 2

---

#### Journey: Anika, 14, Minecraft Builder and Aspiring Artist

**Context:** Mission 7 ("Full Spectrum"). Anika has unlocked all five unit types. She's in the Inspector, studying her Specialist's behavior.

**Minute 0:00 — "The Portraits Are Beautiful"**
Anika clicks on her Specialist in the Inspector. The blueprint panel shows the 128×128 portrait — the tool arm in the foreground, the carousel of implements visible, purple energy at the tip. She zooms in (the portrait supports 2x zoom). She can see the tiny pixel-art rivets on the tool arm's joint, the Philippine fisherman's multi-tool inspiration in the blade array. "That's so cool," she says. She screenshots it.

**Minute 0:30 — "I Want to Draw These"**
The five unit portraits in the blueprint editor have become her reference material. She's been sketching them in her notebook — the Scout's Fresnel-lens eye, the Relay's T'nalak-patterned dish, the Command's golden dome with tiny screens. The pixel art style is accessible to her — she can count pixels, see how the shapes are constructed, understand the color choices. "The Striker's blades are like bolos," she tells her friend, who's never heard of a bolo but now wants to Google it.

**Minute 1:30 — "The Animation Tells the Story"**
During the sealed watch, Anika watches her Specialist approach an enemy relay. The tool arm's idle rotation is subtle — 1 pixel shift per cycle. But when the hack skill activates, the arm EXTENDS (2 extra pixels forward) and the tip blazes bright purple. It's a tiny gesture at game scale — maybe 3 pixels of change — but it reads as the Specialist reaching out to touch the enemy. The enemy relay's magenta glow flickers, dims, then goes dark. "It hacked it!" Anika shouts. The visual storytelling happened entirely through sprite animation — no text, no UI overlay, just a 3-pixel arm extension and a color shift.

**UI Annotations:**
- Portrait: 128×128 detailed view with cultural embellishments (Baybayin etchings, bolo blades, T'nalak patterns)
- Hack animation: Tool arm extends 2px, tip brightens, target's accent color flickers and dies
- Portrait zoom: 2x magnification supported in Inspector panel
- Cultural details visible at portrait scale, implied at game scale

---

## Comparable Games

### Into the Breach
ITB uses a similar shape-first approach but with much larger sprites (roughly 32×48 per mech). Each mech squad has a distinctive silhouette — the Rift Walkers are boxy humanoids, the Zenith Guard are sleek and angular, the Steel Judoka are asymmetric. Enemy Vek use organic/insectoid shapes that contrast sharply with mechanical player units. The key lesson for Robot Uprising: ITB's unit differentiation works because EVERY unit on the board has a unique height, width, and top-profile combination. No two units share all three properties.

### Advance Wars
AW operates at a smaller scale (16×16 tiles) and uses color as the PRIMARY faction identifier (each army is a different color). Unit type differentiation uses vehicle type recognition — tank, infantry, helicopter, battleship — which works because these are real-world objects with pre-existing visual vocabularies. Robot Uprising can't rely on this: all five unit types are robots, so the shape differentiation must be DESIGNED rather than borrowed from reality.

### StarCraft II
SC2 uses the shape language principles identified in the research: Terran Marines are square (reliable), Zerglings are triangular (aggressive), Protoss Zealots are circular (mystical). This three-shape vocabulary works at the faction level. Robot Uprising needs it at the unit-type level WITHIN a single faction — a more demanding differentiation task, but feasible because the game has only 5 player unit types vs. SC2's dozens.

### Factorio
Factorio's inserters, belts, and assemblers are differentiated primarily by animation rather than static silhouette. A belt MOVES; an inserter ROTATES; an assembler BLINKS. Robot Uprising's idle animations serve a similar function — the Scout scans, the Relay cascades, the Striker pulses, the Specialist rotates, the Command orchestrates. Animation is the tie-breaker when silhouettes are similar.

### Gladiabots
Gladiabots uses size as the primary differentiator: small scouts, medium fighters, large tanks. Robot Uprising extends this with shape (each unit has a distinct silhouette) and animation (each unit has a unique idle pattern). Gladiabots' robots are also all the same color within a team, relying purely on size — Robot Uprising's accent color system adds a faster identification layer.

---

## Sensory Description: The Full Board at Tick 0

The board loads. Eight-by-eight tiles of Philippine jungle and rice terrace stretch across the screen in isometric perspective. Corner tick marks glint like tiny mirrors at each tile intersection.

Your units materialize in a bottom-left cluster. The **Command** appears first — a wide golden platform, its holographic dome casting a warm amber pool of light across the adjacent tiles. It's the sun in a solar system of chrome. Two **Relays** tower to its north and east — tall magenta antenna arrays, their dishes catching phantom light, their three-beat pulse animations already cycling: antenna tip bright... dish bright... base ring bright. Three **Scouts** deploy in a forward arc — tiny cyan wedges, low and fast-looking, their sensor domes blinking alternately with their antenna tips in a nervous scanning rhythm. Two **Strikers** hold the flanks — angular, broader than Scouts, their blade-arms glowing red-orange at the tips like embers. And there — the **Specialist**, asymmetric, its tool arm extended at a diagnostic angle, tip glowing purple, rotating imperceptibly.

Against the far wall, the enemy base pulses red. Gunmetal units emerge — the same shapes as yours but DARKER, faster-pulsing, all accents shifted to threatening red. You don't know their configuration. You can't see their buffer bars from here. But you can COUNT them (3 scouts, 2 strikers, 1 relay) by silhouette alone, from across the entire board, in under a second.

The buffer bars sit below each unit like tiny vital signs monitors. Your Relays' 12-pip bars are empty — no signals yet. Your Command's 14-pip bar is pristine gold. The Scouts' 6-pip bars are already flickering — they see the enemy base in their perception radii, and observations are filling their buffers, one pip per tick, tick by tick, the information war already beginning.

You haven't touched a thing. But the board is ALIVE — pulsing, scanning, cascading, waiting. The shape grammar has already told you everything you need to know about your army's structure. The color accents have already sorted your attention: gold Command at the center of gravity, magenta Relays as infrastructure, cyan Scouts as eyes, red-orange Strikers as fists, purple Specialist as wildcard. The visual language is complete. The game hasn't even started.

---

## The TikTok Clip

**"The Silhouette Challenge"** — A 15-second clip. The board renders in pure black silhouettes against a white background. No color. No animation. No terrain. Just five shapes on a grid. A hand reaches for a slider labeled "DETAIL" and slowly pushes it right. Color floods in — accents first, then chrome, then terrain. Animations begin. Buffer bars appear. Channel wiring draws itself. The board transforms from a black-and-white chess diagram into a living cyberpunk diorama. Caption: "Every unit in Robot Uprising is designed to be identified in silhouette. No color. No animation. Just shape." Cut to a gameplay clip — a board full of units, overlays, wiring — and superimpose the silhouette version. "Can you still tell them apart?"

---

## Discovered Aspects

1. **6.01b-i — Directional sprite variants and the facing problem:** When a Scout faces NE vs. SW, does the wedge flip? Does the tool arm switch shoulders on the Specialist? Four approaches: mirror (horizontal flip), rotate (4 directional sprites), fixed (always SE-facing, movement direction shown by trail), hybrid (body fixed, accent features rotate). Into the Breach uses fixed facing with attack direction shown by targeting lines.

2. **6.01b-ii — Unit grouping and stack visualization:** When 2+ units occupy the same tile (if rules allow), how are sprites composited? Vertical stacking, horizontal offset, miniaturized icon overlay, or rule-it-out (one unit per tile)?

3. **6.01b-iii — Rank/veterancy visual indicators:** Should units that survive many ticks gain visual "veteran" markers? Kill marks, battle scarring, accent color saturation increase? Risk: visual noise vs. rewarding attachment to specific units.

4. **6.01b-iv — Unit personality through micro-animation variance:** Identical blueprints produce identical units, but should individual instances have slight animation timing offsets to feel like individual agents rather than clones? The "uncanny synchrony" problem.

5. **6.01b-v — Sprite readability at different zoom levels:** How the sprite design degrades at 50% zoom (strategy overview), 100% (normal play), and 200% (accessibility zoom). Which design elements survive each scale? The "critical pixel" — the one pixel that, if lost, makes the unit unidentifiable.
