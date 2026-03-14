# 6.01 — Art Direction: Pixel Art vs. Vector vs. Abstract vs. Minimalist vs. Detailed

## The Locked Foundation

The spec locks **isometric pixel art** with a **Southeast Asian cyberpunk aesthetic** — specifically rooted in Philippine geography and culture (Ifugao rice terrace server farms, Siquijor relay stations, tropical beach forward bases, Manila/Cebu megacity sprawl). The tech stack is React + Pixi.js, rendering to Canvas. Into the Breach's visual clarity is the explicit reference point.

This analysis explores the **full spectrum of art direction approaches** within and around that locked decision. Even with "isometric pixel art" locked, there are vastly different ways to execute it — and understanding the alternatives illuminates *why* the lock exists and *where* it has room to flex.

---

## Option A: "The Circuit Board" — High-Contrast Technical Pixel Art

### What It Is

A Zachtronics-inspired approach where the board reads like a technical schematic. Dark backgrounds (deep navy #091833, charcoal #1A1A2E). Units are clean, high-contrast sprites with 1px outlines — readable at a glance, prioritizing silhouette over detail. The SE Asian aesthetic lives in the *tiles* (rice terrace patterns, tropical foliage, coral formations) while units themselves are pure function — geometric, robotic, glowing with status colors. Think: if Into the Breach and Shenzhen I/O had a baby raised in Manila.

**Color Palette (24 colors):**
- **Dark foundation:** #091833 (deep space), #141726 (surface), #1A1A2E (tile dark), #2D2B55 (tile mid)
- **Terrain greens:** #1B4332 (jungle dark), #2D6A4F (jungle mid), #52B788 (jungle highlight), #74C69D (rice terrace)
- **Terrain warm:** #D4A373 (beach sand), #E9C46A (sandy highlight), #FEFAE0 (white sand), #264653 (ocean deep)
- **Neon signals:** #18E0FF (cyan — scout perception), #FF3CF2 (magenta — hook channels), #F7FF4A (hazard — buffer overflow), #FF6B35 (combat red-orange)
- **Unit chrome:** #C0C0C0 (body), #E8E8E8 (highlight), #707070 (shadow), #404040 (dark accent)
- **Status indicators:** #00FF87 (signal delivered), #FFB800 (buffer warning), #FF2D2D (combat/death), #8B5CF6 (command unit purple)

**Tile rendering:** Each 64×32 isometric tile has a checkerboard treatment with corner tick marks (matching Into the Breach exactly). Terrain variation is subtle — the jungle tile has tiny pixel-art fronds at the edges, the beach tile has a gentle gradient from wet to dry sand, the city tile has miniature neon signs (2-3 pixels tall) that pulse on even ticks. The rice terrace tile has stepped horizontal lines suggesting ancient terracing, with tiny green data-lights embedded in the steps.

**Unit rendering:** Each unit is approximately 20×28 pixels in sprite space (fitting within the 64×32 isometric tile with room for buffer bars below). Strong 1px dark outline. Body is chrome/silver with colored accents denoting type:
- 👁 Scout: Cyan accent, single large "eye" sensor dome, compact low-slung chassis, antenna swept back
- 📡 Relay: Magenta accent, tall antenna array, squat hexagonal base, no legs (stationary), dish rotates on idle
- ⚔ Striker: Red-orange accent, angular aggressive silhouette, forward-leaning stance, blade-arms folded
- 🔧 Specialist: Purple accent, tool-arm with rotating attachment, hunched analytical posture
- 🤖 Command: Gold accent, largest sprite, elevated platform, multiple antenna, holographic projection dome

### Strengths

- **Maximum gameplay clarity.** When buffer bars, perception radii, and channel wiring lines are drawn over the board, the clean technical palette prevents visual noise from competing with gameplay information. This is the Into the Breach promise — you can read the entire board state at a glance.
- **Efficient production.** 24-color limited palette means every new sprite is automatically consistent. No "four artists who never talked to each other" problem.
- **Pixi.js friendly.** Simple sprites render fast. No alpha blending complexity. Ghost units can be achieved with a simple tint + 50% alpha shader.
- **Streamable.** Dark backgrounds with neon accents compress well in video codecs. Twitch/YouTube streams look good even at low bitrate.

### Weaknesses

- **Emotionally cold.** The technical aesthetic might feel sterile. The SE Asian warmth — tropical humidity, lush vegetation, cultural richness — gets flattened into a few green pixel accents. The game could read as "generic sci-fi chessboard" rather than "Philippine cyberpunk uprising."
- **Art ceiling.** Limited detail means the game's visual identity depends heavily on UI chrome and effects rather than world-building. Players might not *feel* that they're in the Ifugao highlands or on a Siquijor beach.
- **Marketing challenge.** Screenshots of a dark board with tiny sprites don't sell a game. The TikTok clip needs movement and spectacle that static technical art doesn't provide.

### Comparable Games

- **Into the Breach:** 32×32-ish tiles on an 8×8 grid, steep dimetric projection (~3:4 rather than 2:1), extremely readable. Earth-tone palette with red for Vek, blue for mechs. The key lesson: ITB's visual style is inseparable from its "you can always read the board" design philosophy.
- **Shenzhen I/O:** Dark background, neon traces, circuit-board aesthetic. The workbench UI in Robot Uprising could borrow this feel directly — dark panels, monospace text, colored wiring diagrams.
- **TIS-100:** Absolute minimalism. Green-on-black terminal aesthetic. Proves that a game about programming can be visually austere and still beloved — but TIS-100 sells on mechanic, not on art.

### Interaction Effects

- **Plan screen:** The dark technical palette works beautifully for the workbench panel — it *is* a workbench. Config panels with monospace text, neon-accented drop-downs, channel wiring drawn as glowing colored lines connecting units on the board.
- **Sealed watch:** Dark background makes combat flashes (red cell) and signal delivery (green cell) pop dramatically. Buffer bars glow against dark unit bases.
- **Inspector:** Timeline scrubber and data panels feel native in a technical aesthetic. This option makes the inspector the most visually at-home screen.
- **Ghost units:** Easy — same sprite with cyan tint at 40% opacity. Perception radii as dashed circles with soft glow.

### Sensory Description

The board is a pool of darkness. Tiles are barely visible — a grid of dark blue-grey squares with the faintest checkerboard alternation. What catches your eye are the *units*: tiny chrome robots with colored accents, each trailing a thin glow from their buffer bar. When the tick clock fires, the board *snaps* — units teleport to new positions, and for a fraction of a second, the cell they left glows with a fading afterimage. Signal delivery paints a neon green line from sender to receiver, persisting for exactly 200ms before fading. Combat is a single red flash — sharp, clinical, final. The sound design here would be all clicks and hums: mechanical tick sounds, relay antenna whirrs, sharp digital chimes for signal delivery.

---

## Option B: "The Tropical Hologram" — Lush Pixel Art with Neon Overlay

### What It Is

The opposite end of the pixel art spectrum. Richly detailed tiles — 64×32 pixels packed with environmental storytelling. The jungle tile has visible bamboo stalks, hanging vines, tiny pixel flowers. The rice terrace tile has water reflecting a faint sky gradient, stone walls with moss. The beach tile has individual palm fronds casting shadows, foam at the water's edge. The city tile has stacked buildings with laundry lines, sari-sari store signage, jeepney-shaped objects at street level.

Units live *in* this environment, not *on* it. They cast shadows. They interact with terrain — a scout on a jungle tile has vines draped over its chassis; a relay on a rice terrace has its antenna integrated into the terrace stonework.

The cyberpunk layer comes through a *holographic overlay system*: when the player enters Plan mode, a translucent cyan grid materializes over the lush environment, and UI elements (buffer bars, channel wiring, perception radii) render as holographic projections floating above the terrain. The sealed watch strips the hologram back, leaving just the lush world with minimal HUD. The inspector brings it back with analytical overlays.

**Color Palette (48 colors):**
- **Jungle palette:** 8 greens from deep shadow (#0B3D0B) to sunlit canopy (#A8D5A2), with warm undertones in the shadows (green-brown) and cool highlights (blue-green), mimicking tropical light filtering through leaves
- **Water palette:** 5 blues from deep (#0A2463) to turquoise shallows (#48BFE3) to white foam (#F0F3FF)
- **Earth palette:** 6 warm tones from volcanic rock (#2B2D42) to red clay (#C1666B) to sandy beaches (#F4D35E)
- **Architecture palette:** 5 greys with warm bias — concrete (#8D99AE), weathered wood (#6B705C), rusty metal (#BC6C25), corrugated tin (#9DB4C0), neon sign glow (multiple)
- **Neon overlay:** Same signal colors as Option A but rendered with a 2px bloom effect — the cyan/magenta/yellow glow bleeds 1 pixel beyond their boundaries, creating the holographic feel
- **Unit palette:** 6 chrome tones per unit type, plus 2 accent colors — more detailed than Option A, with visible panel lines, joints, and surface textures

**The "MAHARLIKA" reference:** Borrowing from the Filipino komik's "tropical punk with a brutalist flavor" — units have a brutalist, angular quality (exposed structural elements, visible bolts, raw metal surfaces) that contrasts with the organic lush environment. The robots are foreign objects in a living landscape.

### Strengths

- **Emotional resonance.** The lush environment makes the player *feel* the setting. "Philippine cyberpunk" isn't an abstract label — it's visible in every tile. The contrast between organic terrain and mechanical units reinforces the game's theme: artificial intelligence imposing order on a chaotic natural world.
- **Marketing gold.** Screenshots are gorgeous. Every frame is a desktop wallpaper. The TikTok clip writes itself: lush tropical battlefield, holographic overlay materializes, robots execute a coordinated flanking maneuver, the overlay dissolves to reveal the aftermath in the jungle.
- **Cultural specificity.** The Ifugao terraces, Siquijor bioluminescence, Manila megacity — these are visually distinctive. No other game looks like this. It's not "generic cyberpunk" — it's *Filipino* cyberpunk.
- **Screen-mode differentiation.** The holographic overlay toggling between screens creates a strong visual rhythm: lush (sealed watch) → technical (inspector) → hybrid (plan). Each screen has a distinct emotional register.

### Weaknesses

- **Readability risk.** Detailed tiles with hanging vines and water reflections create visual noise. When 8 units with buffer bars, 4 active channels, and 3 perception radii are drawn over a lush jungle, the player might struggle to read the board state.
- **Production cost.** 48-color palette with environmental detail means more art time per tile. Terrain-unit interaction (vines draping over chassis) means more sprite variants. The asset pipeline is 3-4× heavier than Option A.
- **Performance concern.** More pixels, more overlays, more alpha blending. Pixi.js handles this fine on modern hardware, but the Playwright screenshot tests need to be deterministic — alpha blending across frames could create flaky visual diffs.
- **Consistency challenge.** Detailed art is harder to keep consistent. Each tile type needs a style guide within a style guide. A new artist joining the project needs more ramp-up time.

### Comparable Games

- **Octopath Traveler (HD-2D):** Square Enix's technique of detailed pixel sprites over depth-of-field backgrounds. Not directly applicable to isometric but the principle — richly detailed sprites in an atmospheric environment — is the same aspiration.
- **Eastward:** Extremely detailed pixel art with environmental storytelling. Every screen tells a story through object placement and environmental detail. The production cost is enormous but the result is visually distinctive.
- **Hyper Light Drifter:** Rich neon-infused pixel art with strong environmental mood. Proves that pixel art can be both detailed and readable — but HLD isn't a grid-based strategy game, so the readability challenge is different.
- **Lucius Felimus's Filipino Cyberpunk Cities:** 3D renders of Manila as cyberpunk megacity — flying jeepneys, Baybayin neon signs, stacked architecture. This is the real-world art direction reference. Robot Uprising would be translating this vision into pixel art.

### Interaction Effects

- **Plan screen:** The holographic overlay must be carefully designed to be readable over lush terrain. Solution: when in Plan mode, terrain tiles dim by 40% (desaturation + brightness reduction) and the holographic grid snaps to full opacity. This creates a "tactical view" that preserves the setting flavor while prioritizing clarity.
- **Sealed watch:** This is where Option B shines. Full environmental detail, minimal overlay. The player watches robots move through a beautiful tropical landscape. Buffer bars are small colored pips on the unit — unobtrusive, integrated.
- **Inspector:** Split approach — the board retains environmental detail but the sidebar panels are purely technical (Option A's aesthetic for data displays). The contrast between organic battlefield and clinical data panels reinforces the two-act debrief structure.
- **Ghost units:** Rendered as holographic projections — same unit sprite but with horizontal scanlines (every other row at 30% opacity) and a slight cyan tint. The "hologram" treatment is thematically diegetic (the AI is projecting planned deployments).

### Sensory Description

The board *breathes*. Even before the first tick, the jungle tiles sway — pixel-art palm fronds animated on a 4-frame cycle, water on the rice terraces catching light on alternating frames, tiny fireflies (single bright pixels) drifting across Siquijor tiles. The city tiles pulse with neon — miniature Baybayin characters on storefronts, 2-pixel jeepneys crawling along bottom edges, laundry fluttering on lines. When the player opens Plan mode, the world *dims* — colors desaturate, the swaying stops — and a cyan holographic grid *blooms* upward from the tiles like a technical flower. Channel wiring appears as pulsing neon threads weaving between units, and perception radii shimmer like heat haze with cyan edges. The sound of entering Plan mode is a crystalline ascending chime — glass over glass — while the world ambient (jungle sounds, distant traffic, water) fades to 20% volume and a low electronic hum takes over. Combat is a brutal contrast: a single red flash fills the tile, the environmental detail *snaps* back to full saturation for one frame (shock), then the destroyed unit sparks and slumps, pixel debris scattering across the tile.

---

## Option C: "The Blueprint" — Vector-Influenced Minimalism

### What It Is

Not pixel art at all. Clean vector lines, flat geometric shapes, no texture. Units are iconic silhouettes — a scout is a circle with an eye-line, a relay is a hexagon with radiating lines, a striker is a triangle pointing forward. The board is a pure grid with color-coded cells — green for jungle (solid flat green, no detail), tan for beach, blue for water, grey for city. Channel wiring is drawn as clean bezier curves. Buffer bars are geometric progress indicators.

This approach leans into the game's identity as an **engineering workbench** rather than a battlefield. It says: "this is not a war game, this is a system design tool that happens to be a game."

**Color Palette (16 colors):**
- **Background:** #F8F9FA (light grey) or #1E1E2E (dark mode)
- **Grid:** #DEE2E6 (light lines) or #2D2B55 (dark lines)
- **Terrain:** 4 flat colors — #2D6A4F (jungle), #E9C46A (beach), #264653 (water), #6C757D (city)
- **Units:** 5 accent colors per type — same cyan/magenta/red-orange/purple/gold as other options but as flat fills, no shading
- **Signals:** Animated dashed lines (no glow, no blur)

### Strengths

- **Absolute clarity.** Nothing competes for attention. The board state is unambiguous at any zoom level. This is the Gladiabots philosophy — simple visual, complex system.
- **Infinitely scalable.** Vector art looks identical at 720p and 4K. Mobile, desktop, and projected-on-a-wall all look sharp.
- **Fastest production.** A new unit type can be designed in an afternoon. New terrain types are trivial. The art pipeline is essentially a design system, not a traditional art process.
- **Accessibility.** Clean shapes and flat colors are the most accessible to colorblind players. High contrast is trivial to maintain. Screen readers could potentially describe the board because the visual language maps to a semantic language directly.

### Weaknesses

- **No soul.** The game's pitch is "you are an AI leading a robot uprising in a Philippine cyberpunk world." A vector grid communicates none of that. No cultural specificity, no environmental storytelling, no emotional resonance.
- **The Gladiabots problem.** Gladiabots is a brilliant game with underwhelming visuals. It struggles to convert screenshots into downloads. Vector minimalism signals "tool" not "game" — fine for a programmer audience, alienating for broader appeal.
- **Missing the feeling.** The spec says the game should feel like "managing smart autonomous systems" with the feeling of StarCraft. StarCraft's feeling comes partly from watching marines die in swarms, hearing Zealot charge screams, seeing nuclear launches. The feeling is *visceral*. Flat vectors cannot be visceral.
- **The SE Asian setting vanishes.** There's no room for rice terraces, bioluminescent relay towers, or jeepney transport drones in a 16-color vector grid. The locked aesthetic is contradicted.

### Comparable Games

- **Gladiabots:** Simple geometric robots, flat colored backgrounds. Clean, readable, forgettable. The game succeeds on mechanic alone — its visual style neither helps nor hinders, which is itself a failure of potential.
- **Mini Metro / Mini Motorways:** The gold standard of vector game art. Proves that minimalism CAN be beautiful and emotionally resonant — but these games are about urban systems, where the minimalism is thematically coherent. Robot Uprising is about robots in a tropical landscape, where minimalism erases the landscape.
- **Baba Is You:** Near-vector simplicity. Works because the game IS simple rules on a grid. Robot Uprising has a richer world than Baba Is You's visual language can express.

### Interaction Effects

- **Plan screen:** Workbench panel looks native. Config editing, channel wiring, production queue — all map naturally to vector UI patterns. This is where Option C is strongest.
- **Sealed watch:** Flat and uninspiring. Watching geometric shapes hop across a flat grid at 1 tick per second has no spectacle. The sealed watch's emotional purpose (tension, attachment to your creations) is undermined by visual abstraction.
- **Inspector:** Data panels, charts, and timelines look great in vector. The analytical tools are the best they can be.

### Sensory Description

The board is a clean white-on-grey grid. Each cell has a single flat color — muted, professional, like a well-designed dashboard. Units are colored circles and polygons, perfectly centered in their cells. When the tick fires, they slide smoothly (or snap — the spec says snap) to their new positions. Channel wiring is drawn as thin colored lines with directional chevrons flowing along them — the only animation on the board. Signal delivery is a small circle expanding from the receiving unit and fading. Combat is a red X appearing over the eliminated unit, which fades out over 500ms. The sound palette is all UI sounds — soft clicks, gentle chimes, a muted drum for combat. No environmental audio. No jungle sounds. No city traffic. The silence speaks.

---

## Option D: "The Neon Jungle" — Maximalist Pixel Art + Particle Effects

### What It Is

Option B's lush environment cranked to 11. Every tile has animated environmental effects — rain on city tiles, mist on highland tiles, bioluminescent particles on Siquijor tiles, heat haze on beach tiles. Units leave particle trails when moving. Signal delivery is a full neon beam animation. Combat has a multi-frame explosion with pixel debris. Buffer overflow triggers visible sparks and screen shake on the affected unit.

This is the "game trailer" aesthetic — designed to look spectacular in motion, to make 15-second clips irresistible.

**Color Palette (64+ colors):**
Full spectrum with multiple shading ramps per material. Neon bloom effects using Pixi.js filters (BlurFilter for glow, ColorMatrixFilter for tinting). Environmental palettes per biome. Unit palettes with damage states (pristine → scratched → sparking → destroyed).

### Strengths

- **Maximum spectacle.** The TikTok clip is guaranteed. Lush jungle, neon particle beams, synchronized robot attacks, screen shake on critical moments — every execution is a light show.
- **Emotional attachment.** When your scout dies in a spray of sparks amidst glowing jungle particles, you FEEL the loss. The sealed watch becomes genuinely tense because the visual stakes match the strategic stakes.
- **Streamer-friendly.** Content creators will choose this game for its visual spectacle. "Watch me design agents" is dry content; "watch these agents execute in a neon tropical warzone" is entertainment.

### Weaknesses

- **Readability catastrophe.** Rain, mist, particle trails, neon beams, buffer sparks, screen shake — all happening simultaneously on an 8×8 grid with 12+ units. The board becomes unreadable. The Into the Breach promise is broken.
- **Performance risk.** Particle systems stress Pixi.js, especially on low-end hardware. The web-based requirement means running in a browser tab — no dedicated GPU. 60fps particle rendering + dozens of overlapping effects = performance budget crisis.
- **Production cost is enormous.** Multi-frame animations for every tile, every unit state, every effect. Rain systems, mist systems, particle emitters. This is AAA pixel art production at indie scale.
- **The inspector becomes noise.** Trying to scrub through a timeline where every tick has environmental particles, combat explosions, and signal beams means the analytical purpose of the inspector drowns in visual clutter.

### Comparable Games

- **Noita:** Maximalist pixel art with physics particles. Every pixel is simulated. Beautiful in motion, overwhelming in screenshots. The game works because you're always zoomed in on one character — not managing a full grid.
- **Dead Cells:** Intense pixel art with particle effects, screen shake, and visual feedback. Works because it's an action game where spectacle = feedback. In a strategy game, spectacle can obscure information.
- **Transistor:** Neon aesthetic with heavy particle effects in a more deliberate-paced game. Proves neon particles CAN work in slower gameplay — but Transistor controls one character, not a fleet.

### Interaction Effects

- **Plan screen:** Must strip most effects. Environmental particles continue but dimmed. The holographic overlay from Option B cuts through the noise.
- **Sealed watch:** This is the ONE screen where maximalism works. The player is watching, not making decisions. Let the spectacle happen. The sealed watch IS the trailer.
- **Inspector:** MUST offer an "effects off" toggle. The scrubber needs clean frames for analytical comparison. Two render modes: cinematic (sealed watch replay) and diagnostic (stripped to essentials).

### Sensory Description

The board is alive — not just animated, but *seething*. Jungle tiles have pixel-rain dripping through canopy gaps, each droplet splashing on leaf surfaces. Rice terrace tiles have water flowing in tiny channels, reflecting the neon glow of nearby relays. City tiles have flickering holographic advertisements, pixel-art pedestrians scurrying between buildings, the distant rumble of a jeepney engine rendered as a 2-pixel vehicle crawling along a road. When the tick fires, it's an EVENT: units snap into position with a burst of kinetic particles from their previous location — tiny chunks of displaced terrain, a puff of dust on beach tiles, scattered leaves on jungle tiles. Signal delivery is a beam of light that refracts through rain droplets. Combat is devastating — a single-frame white flash, then the target unit shatters into dozens of pixel fragments that scatter across adjacent tiles and slowly fade. The buffer overflow effect is deeply unsettling: the unit's buffer bar pulses violently, the sprite itself jitters left-right by 1 pixel on alternating frames, tiny sparks fly from joints, and the unit's "eye" or sensor dome flickers between its normal color and angry red. You can *feel* the overloaded machine panicking.

---

## Option E: "The Diorama" — Tilt-Shift Pixel Art (Recommended Hybrid)

### What It Is

The synthesis. Start with Option B's lush SE Asian environment, but apply a **tilt-shift depth-of-field** effect — the center of the board is sharp and detailed, the edges soften into a gentle blur. This creates a "miniature diorama" feeling — like looking at a meticulously crafted model of a Philippine cyberpunk world through a magnifying glass.

Units are detailed (Option B level) but outlined with a 1px black border (Option A's readability). Environmental detail is rich but *static* — no animated rain, no particle effects (saving those for key moments only). The neon overlay from Option B activates in Plan mode. The few animations that exist are reserved for gameplay-critical feedback: signal delivery, combat, buffer warnings.

**The Rule of Three Layers:**
1. **Background layer** (tiles): Rich, detailed, beautiful — but STATIC. No animation. This is the diorama's base.
2. **Unit layer** (sprites): Clean outlines, clear silhouettes, animated only when they act (move, fire, die). Buffer bars visible but small.
3. **Information layer** (overlays): Neon holographic overlay for channels, perception radii, ghost units. Only visible in Plan mode and Inspector. Completely absent in Sealed Watch.

**Color Palette (32 colors):**
Option A's efficiency + Option B's warmth. 32 colors: 10 for terrain (lush but limited — each biome gets 3 tones: dark/mid/highlight, plus shared shadow and highlight colors), 8 for units (chrome base + 5 type accents), 8 for neon overlay (channels, signals, buffer states, combat), 6 for UI (dark panels, text, borders, selection).

### Strengths

- **Readability + beauty.** The tilt-shift effect naturally guides the eye to the center of action. Detailed tiles provide setting and mood without competing with gameplay information, because the detail is static — your eye learns to filter it out, the way you stop seeing wallpaper in a familiar room.
- **Scalable production.** 32 colors and static tiles mean manageable asset production. The sprite sheet pipeline (anchor-first) works perfectly — master sheets with 3 states × 2 directions, sliced and flipped.
- **Strong screen differentiation.** Plan mode: tiles dim + neon overlay = workbench feel. Sealed watch: tiles at full vibrancy, no overlay = emotional watch. Inspector: tiles dimmed, analytical overlay = diagnostic feel. Three visually distinct modes from the same base art.
- **The diorama conceit.** The miniature/model feeling reinforces the game's theme — the player is an AI looking DOWN at a world it's manipulating. The tilt-shift blur at edges says "you are observing from above, through a lens." This is *diegetically coherent* with the game's premise.
- **Compromise on spectacle.** Static tiles mean performance is trivial. But combat and signal delivery can still be visually dramatic (single-frame flashes, particle bursts on destruction only) because they're rare events against a calm background, so they *pop*.

### Weaknesses

- **Still higher production cost than Option A.** Detailed tiles take time even without animation. The 32-color palette requires careful design — every color must do double duty.
- **Tilt-shift is a filter, not a style.** If the underlying art isn't good, the blur just makes bad art blurry. The base quality must be high for the effect to work.
- **Edge readability.** If important gameplay happens at the board edges (where tilt-shift blur lives), the player might miss it. Mitigation: the blur must be subtle (not Instagram aggressive), and any unit or event at the edge should temporarily sharpen.

### Comparable Games

- **Into the Breach:** The readability standard. Robot Uprising must match ITB's ability to read the entire board state at a glance — but with richer environmental art.
- **Octopath Traveler:** HD-2D technique uses blur to add depth to pixel art. The tilt-shift approach is the isometric equivalent of this technique.
- **The Touryst:** Voxel art with tilt-shift depth of field. Proves the "miniature world" feeling works in games and creates instant visual identity.
- **MAHARLIKA Komiks:** The "tropical punk with brutalist flavor" visual reference. Units should feel like they belong in a MAHARLIKA panel — angular, exposed-structure, industrial — contrasted against organic terrain.

### Interaction Effects

- **Plan screen:** Board shifts to 60% saturation. Tilt-shift blur deepens slightly. Neon holographic grid materializes. Channel wiring as glowing colored bezier curves. Ghost units rendered with horizontal scanlines. Workbench panel (right side) uses dark technical aesthetic (Option A). The split between lush-but-dimmed board and crisp technical panel creates visual tension that mirrors the Plan phase's cognitive tension: creative vision (board) meets systematic construction (workbench).
- **Sealed watch:** Full saturation. Minimal tilt-shift (10% at extreme edges only). No overlay. Buffer bars as tiny colored pips at unit bases — unobtrusive, integrated. Tick clock as clean horizontal pips at top center. This is the game at its most cinematic. When a scout is eliminated, it's a single red flash on the tile, the unit sprite replaced with a broken-sparking variant, 4-5 pixel fragments scattering outward. The only particle effect in the entire sealed watch — reserved for death, so it hits hard.
- **Inspector:** Board at 50% saturation, deeper tilt-shift blur (the board is background now). Sidebar panels are the focus — dark technical aesthetic with data visualizations. Click-to-inspect sharpens the selected unit's tile to 100% saturation and adds a glowing selection border. Queue depth chart renders as a bar chart with green/amber/red coloring matching buffer state.

### Sensory Description

You're looking into a diorama. The board is a miniature Philippine landscape — a terraced highland in the northwest corner, jungle canopy in the center, a strip of white beach along the south edge, a cluster of tiny neon-lit buildings in the southeast. Every tile is a lovingly crafted pixel-art miniature: the rice terrace has visible stone walls, tiny green data-lights embedded in the steps, a pool of turquoise water at the base. The jungle tile has three layers — dark understory, mid canopy, and bright emergent crown — packed into 64×32 pixels through careful color ramping. The city tiles have recognizable shapes — a tiny corrugated-tin roof (3 pixels wide), a neon sign rendered as 2 bright pixels and a 1-pixel shadow, the silhouette of a jeepney (5 pixels long) parked at an intersection.

The board edges soften. Not dramatically — a gentle loss of detail, like your peripheral vision. Your eye is drawn to the center, where units sit crisp and clear in their grid cells.

When you open Plan mode, the transformation is gentle but total. The colors *cool* — warm tropical tones shift toward blue-grey. The tilt-shift deepens, pushing the environment further into backdrop. And then the holographic overlay *breathes into existence*: first a thin cyan grid line snapping to tile edges, then channel wiring growing outward from units as glowing threads, then perception radii blooming as shimmering circles with soft edges. The workbench panel slides in from the right — dark, technical, precise — and you're in the workshop.

A tick fires. The clock at the top marks another pip. Units snap — there's no animation, just a positional jump, and the tile they left glows briefly with a warm afterimage (250ms fade). A signal delivery paints a thin green line between two units — sender to receiver — that persists for one tick then dissolves. You hear a soft *ping* — glass on metal. A striker moves adjacent to an enemy. The tile flashes red — one frame, full saturation, hard cut. The enemy sprite is replaced: its intact form disappears, replaced by a crumpled, sparking variant. Three tiny pixel fragments (2×2 each) scatter outward and fade. The sound: a sharp metallic *crack* followed by a descending electronic whine. One frame of spectacle in a world of calm observation.

---

## Player Journeys

### Journey: Maya, 26, UX Designer — First Session, Mission 1

**Context:** Downloaded the game after seeing a TikTok of a coordinated robot attack on a jungle board. Has played Civilization and Two Dots but nothing like Zachtronics. Attracted by the visual style.

**Minute 0:00 — Boot Sequence**
The screen is black. Green text types itself: "SUBSYSTEM INITIALIZATION..." — a boot log diegetic tutorial. But behind the text, the board is fading in — an 8×8 grid of jungle and highland tiles, the miniature diorama appearing through the darkness like dawn breaking. Maya watches the text but her eye keeps drifting to the tiny landscape forming behind it. A pool of turquoise water catches light in the rice terrace tiles. She didn't expect a strategy game to be this *pretty*.

**Minute 0:30 — Plan Screen Reveals**
The boot log finishes. The board brightens to full saturation — lush greens, warm earth tones, tiny neon accents in the city tiles at the south edge. The workbench panel slides in from the right, dark and technical. The contrast is immediate: organic world on the left, engineering tool on the right. A pre-placed scout unit sits at D4 — a small chrome robot with a cyan eye-dome, crisp black outline, clearly visible against the jungle tile beneath it. Its perception radius blooms as a shimmering cyan circle covering a 5-tile range. Maya thinks: "Oh, that's what it can see."

**Minute 1:00 — Examining the Scout**
She hovers over the scout. The unit's tile sharpens (the surrounding tilt-shift softens further, drawing focus). A tooltip appears: "Scout — Buffer: 6 slots | Perception: Wide (5)." The buffer bar at the unit's base — six tiny pips, currently empty, dim blue-grey — catches her attention. She clicks the unit. The workbench panel populates with the scout's config: skills (patrol ✓, evade ✓), rules (empty list), hooks (two slots, empty), context config. She doesn't understand most of it yet, but the layout is clean — dark panels with monospace text and colored accents.

**Minute 2:30 — First Execute**
She hits the EXECUTE button. The board transitions: colors saturate to full tropical warmth, the holographic grid dissolves, the workbench panel slides away. The tick clock appears at the top — a horizontal row of small pips. The first pip fills. The scout *moves* — snaps one tile northwest, toward a cluster of enemy units (red-tinted angular robots). Its buffer bar lights up: one pip turns cyan (it observed something). Then another pip — a second observation fills a second slot. Maya leans forward. She can *see* the scout's memory filling up, one slot at a time, as it patrols through the jungle.

**Minute 3:15 — First Death**
An enemy striker moves adjacent to her scout. The tile flashes red — a single harsh frame, like a camera flash. The scout sprite is gone. In its place: a broken chassis, sparking, with tiny pixel fragments scattered on the jungle tile. A descending electronic whine. The tick clock keeps going. Maya's mouth is slightly open. The death was *fast* — one frame, no animation, no health bar slowly depleting. Just... gone. The brutality of one-shot-one-kill, delivered through a single frame of red light on a beautiful green tile. She immediately wants to go back and give the scout an evade rule.

**Minute 4:00 — Inspector Debrief**
The sealed watch ends. The board dims slightly — saturation drops to 60%, tilt-shift deepens. A timeline scrubber appears at the top, replacing the tick clock. She clicks on the tick where her scout died. The tile sharpens. A sidebar shows the scout's buffer at that moment: 5 of 6 slots filled with observations, the last entry "ENEMY_STRIKER at E3." It saw the striker — but had no rule telling it to run. The information was there, unacted upon. Maya understands the core mechanic in a single debrief frame: *the unit knew, but didn't know what to do with what it knew.*

**UI Annotations:**
- **Board tiles:** 64×32 isometric, static detail, 32-color palette, tilt-shift blur at edges
- **Scout sprite:** ~20×28 pixel space, 1px black outline, cyan eye-dome accent, 6-pip buffer bar below
- **Perception radius:** Shimmering cyan circle, 5-tile range, visible only in Plan mode
- **Combat flash:** Single-frame full-saturation red on tile, 0ms transition, replaced by destroyed sprite + 3 particle fragments
- **Inspector highlight:** Click-to-select sharpens target tile to 100%, deepens surrounding blur

---

### Journey: Diego, 34, Software Architect — Mission 7, Command Agent Introduction

**Context:** Has cleared missions 1-6. Comfortable with scouts, strikers, relays. Understands channel wiring and buffer management. Mission 7 introduces the command agent.

**Minute 0:00 — Plan Screen, Factory Active**
The board is a mixed biome — jungle in the north, city tiles in the south, beach along the west edge. Diego's factory (a data center built into a coastal cliff, pixel-art greebles and antennae bristling from the rock face) sits at A1. The production queue — a horizontal conveyor belt of blueprint icons — shows his standard army: 2 scouts, 1 relay, 2 strikers. A new blueprint icon glows gold in his available blueprints panel: the Command unit.

He drags the Command blueprint onto the queue. A ghost unit appears on the board near the factory — the largest unit sprite, elevated on a platform base, multiple antennae projecting from a central dome, gold accent lines tracing panel edges. The ghost has horizontal scanlines and a cyan tint, marking it as a projection, not yet built.

**Minute 1:30 — Configuring the Command Agent**
Diego clicks the command ghost. The workbench panel fills with its config — and it's *dense*. Buffer: 14 slots. Hook slots: 6. Skills: reassign, reroute, prioritize. The skills panel has a new layout he hasn't seen: each skill targets *other units*, not the environment. "Reassign" has a dropdown: "Target: [any unit] | Change: [skill toggle]." "Reroute" targets hook channels. "Prioritize" targets eviction policies.

He's configuring a unit that configures other units. The workbench panel shows nested config — the command agent's rules reference his other blueprints by name. Channel wiring lines on the board multiply: the command unit has 6 hook slots, each potentially wired to a different channel. The neon overlay becomes complex — a web of colored lines radiating from the gold-accented command unit.

He sets up a rule: IF buffer contains "ENEMY_COUNT > 3" AND current_tick > 20, THEN reassign SCOUT-A patrol→evade. The rule appears as a condition→action pair in ordered list. On the board, a ghost-line connects the command unit to Scout-A's position, gold to cyan, showing the reassignment relationship.

**Minute 4:00 — Sealed Watch, Command in Action**
Tick 22. Three enemies cluster in the northeast. The command unit's buffer fills with forwarded scout observations (via relay). Its buffer bar — 14 pips, the longest on the board — ticks up: 8... 9... 10. At tick 23, the condition triggers. No visible animation on the command unit itself — but Scout-A, three tiles away, *shifts*: its cyan eye-dome flickers purple for one frame (the reassignment signal), and its behavior changes. It was patrolling north; now it evades south. Diego watches the change propagate — the command agent's decision, made from forwarded intelligence, altering a subordinate's behavior mid-battle.

**Minute 5:30 — The Meta-Level Clicks**
The debrief reveals: the command agent's reassignment saved Scout-A (which would have walked into a striker). But the reassignment also meant Scout-A stopped forwarding observations about the northeast — so the relay's buffer went stale, and the strikers in the south missed a flanking enemy. The command agent optimized one subsystem at the cost of another.

Diego stares at the inspector. The queue depth chart shows the relay's buffer fill dropping from 10 to 3 after the reassignment. He thinks: "I need a second relay. Or a reroute rule on the command agent that redirects the northeast channel to a different scout after reassignment." He's not designing units anymore. He's designing the system that designs the system. The pixel-art diorama below him is a living circuit board, and he's the architect.

**UI Annotations:**
- **Command unit sprite:** Largest unit, gold accents, elevated platform, multiple antennae, ~24×32 pixel space
- **Ghost unit scanlines:** Every other row at 30% opacity, cyan tint, diegetically a "holographic projection"
- **Nested config panel:** Command skills reference other blueprints by name, creating visual cross-references in the workbench
- **Reassignment flash:** Target unit's accent color flickers purple for 1 frame when reassigned, subtle but visible on close watch
- **Channel wiring from command:** 6 potential lines radiating outward, gold-tinted, distinguishable from standard cyan/magenta channels

---

### Journey: Lena, 45, Professional Illustrator — Aesthetics-First Encounter

**Context:** Doesn't play strategy games. Was sent a screenshot by a friend who said "you'll love the art direction." Lena works in digital illustration specializing in Southeast Asian cultural art.

**Minute 0:00 — First Screenshot Impression**
Before downloading, Lena sees a screenshot: an 8×8 isometric board with jungle tiles in the upper half and Manila-inspired city tiles in the lower half. Her illustrator's eye immediately catches the rice terrace tile — the stepped horizontal lines with embedded green data-lights, the tiny pool at the base reflecting turquoise. She zooms in on her phone. The city tiles have recognizable Filipino elements — a corrugated tin roof (she's seen a thousand of those), what looks like a sari-sari store front with neon signage, the silhouette of a jeepney. She recognizes the Baybayin-influenced neon glyphs on the store signs. This isn't "generic Asian cyberpunk" — this is *her* culture, rendered in pixel art with care and specificity.

**Minute 0:30 — Game Launch**
The boot log starts. Behind the typing text, the board fades in. She recognizes the Banaue terraces immediately — the stepped structure, the water, the stone walls. But they're wrapped in fiber optic cables. Server racks peek from behind bamboo scaffolding. A tiny satellite dish sits atop a centuries-old stone wall. The fusion is respectful — the technology doesn't replace the landscape, it *grows from* it. She screenshots this for her Instagram.

**Minute 2:00 — Plan Mode Overlay**
She opens Plan mode and gasps softly. The lush board *cools* — warm tropical tones shift to blue-grey, like the world is holding its breath. Then the holographic overlay materializes: cyan grid lines snapping to tile edges, channel wiring threads growing between units. The contrast between the organic landscape (still visible, just dimmed) and the technical overlay is *beautiful* — like seeing an X-ray of a living thing. The neon threads pulsing along channel lines look like bioluminescent roots — Siquijor's mangrove relay stations made literal.

**Minute 3:30 — Watching Combat**
She doesn't fully understand the strategy, but she set up a basic config and hit Execute. The sealed watch unfolds. The board at full saturation is gorgeous — she keeps wanting to pause and study tiles (she can't — sealed watch, no pause). When combat happens — that single red flash, the broken robot sprite, the scattering pixel fragments — it's *shocking* against the calm beauty. The violence is rendered with the same economy as the environment: precise, deliberate, nothing wasted. As a visual artist, she appreciates the restraint. One frame of red is more powerful than five seconds of explosion.

**Minute 5:00 — Instagram Post**
She screenshots the Inspector mode — the dimmed board with the analytical overlay, the queue depth chart in the sidebar — and the contrast between organic and technical. She posts: "A strategy game that respects the Philippines. The rice terraces in the background aren't decoration — they're terrain that matters. And the cyberpunk overlay is *chef's kiss*." Three of her artist friends download the game that day.

**UI Annotations:**
- **Rice terrace tile detail:** Stepped horizontal lines (3 visible steps), green data-light pixels (2 per step), turquoise water pool at base (4×6 pixel area), stone wall texture (1px alternating light/dark)
- **City tile Filipino elements:** Corrugated tin roof (3×2 px), sari-sari store sign (Baybayin-influenced glyphs, 2×4 px neon), jeepney silhouette (5×3 px, recognizable chromatic trim)
- **Plan mode transition:** 400ms ease — saturation drops linearly, cyan grid fades in from 0% to 100% opacity, channel wiring grows outward from units at ~2 tiles/100ms
- **Tilt-shift parameters:** Center 60% of board at 100% sharpness, outer 20% at Gaussian blur radius 1px (subtle, not Instagram-aggressive)

---

## Cross-Option Comparison Matrix

| Dimension | A: Circuit Board | B: Tropical Hologram | C: Blueprint | D: Neon Jungle | E: Diorama (Rec.) |
|-----------|-----------------|---------------------|-------------|----------------|-------------------|
| **Readability** | ★★★★★ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ | ★★★★☆ |
| **Emotional resonance** | ★★☆☆☆ | ★★★★★ | ★☆☆☆☆ | ★★★★★ | ★★★★☆ |
| **Cultural specificity** | ★★☆☆☆ | ★★★★★ | ★☆☆☆☆ | ★★★★★ | ★★★★☆ |
| **Production cost** | ★★★★★ (low) | ★★☆☆☆ (high) | ★★★★★ (low) | ★☆☆☆☆ (very high) | ★★★☆☆ (moderate) |
| **Performance** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★☆☆☆ | ★★★★★ |
| **Marketing appeal** | ★★★☆☆ | ★★★★★ | ★★☆☆☆ | ★★★★★ | ★★★★☆ |
| **Streamer appeal** | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ | ★★★★★ | ★★★★☆ |
| **Accessibility** | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ | ★★★★☆ |
| **Screen differentiation** | ★★☆☆☆ | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | ★★★★★ |
| **Theme coherence** | ★★★★☆ | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★★★★ |

---

## The TikTok Clip for Each Option

- **A (Circuit Board):** Dark board, neon signals zipping between units, a sudden red flash — "I built these attention systems. They just executed a flanking maneuver I never programmed." Cerebral, impressive, niche.
- **B (Tropical Hologram):** Lush jungle, holographic overlay blooms, robots coordinate through glowing channels, overlay dissolves to reveal aftermath. Beautiful, intriguing, broad appeal.
- **C (Blueprint):** Clean vector grid, geometric units moving in formation. Hard to make exciting in 15 seconds. Needs voiceover to carry.
- **D (Neon Jungle):** Maximum spectacle — particle beams, explosions, neon trails across a living jungle. Guaranteed views. Risk: looks like every other neon game.
- **E (Diorama):** Miniature tropical world, calm and detailed. A tick fires — units snap. Green signal lines paint across the board. Then one red flash, a broken robot amidst pixel jungle debris. The contrast between calm beauty and sudden violence. "I didn't control any of this. I just told them what to pay attention to." The clip that makes you download.

---

## New Aspects Discovered

- **6.01a — Tile art deep dive per biome:** Exact pixel-level design for each of the 4-5 terrain types (jungle, rice terrace, beach, city, Siquijor volcanic); how much cultural detail can fit in a 64×32 isometric tile; reference imagery from actual Philippine landscapes
- **6.01b — Unit sprite design language:** Detailed design of each unit type's visual identity — silhouette grammar, accent color system, how destroyed/ghost/hologram variants are derived from the base sprite; interaction with the locked sprite-sheet pipeline
- **6.01c — The holographic overlay system:** Full technical and aesthetic design of the Plan mode overlay — grid materialization animation, channel wiring rendering, perception radius visual treatment, ghost unit rendering, how the overlay interacts with each terrain type
- **6.01d — Color palette interaction with colorblind modes:** How each art direction option degrades under protanopia, deuteranopia, tritanopia; which palettes need redesign, which are naturally robust; interaction with locked signal colors (green=delivery, red=combat)
- **6.01e — Tilt-shift implementation in Pixi.js:** Technical feasibility of the "Diorama" effect — Pixi.js blur filters, performance on low-end hardware, dynamic sharpening when units are at board edges, integration with the screenshot-based Playwright testing pipeline
