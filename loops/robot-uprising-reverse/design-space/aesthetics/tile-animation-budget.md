# 6.01a-i — Tile Animation Budget

## The Problem: 64 Living Tiles on a Competitive Battlefield

An 8×8 isometric board means 64 tiles, each 64×32 pixels, all potentially animated simultaneously. On top of those tiles live units with buffer bars, perception radii, channel wiring lines, EM emission rings, ghost previews, signal delivery flashes, and combat flashes. The animation budget isn't just "can Pixi.js render this?" — it's "can a player read the board state in under 2 seconds when tiles are breathing, water is shimmering, neon is flickering, AND a five-unit engagement is resolving?"

This analysis defines per-biome animation specs, calculates the rendering budget, and addresses the fundamental tension: **environmental animation that makes the world feel alive vs. gameplay overlay clarity that makes the board state readable.**

---

## The Animation Philosophy: "Breathe, Don't Dance"

Into the Breach's tiles are nearly static — subtle shadow shifts, minimal environmental movement. The board state is sacred. But Robot Uprising's SE Asian cyberpunk setting demands *life*: rice terrace water should glimmer, bioluminescent Siquijor flora should pulse, Manila neon should flicker. The resolution: tiles should **breathe** (slow, ambient, peripheral) rather than **dance** (fast, attention-grabbing, central).

**The Breathing Rule:** No tile animation should complete a full cycle in under 2 seconds. Anything faster competes with gameplay events (tick resolution at 1s, signal delivery flashes at 200ms, combat flashes). The eye is drawn to the fastest-moving element — that element must ALWAYS be a gameplay event, never a terrain animation.

**The Hierarchy of Motion:**
1. **Combat flash** (100ms, red) — fastest, highest priority
2. **Signal delivery** (200ms, green line) — second fastest
3. **Tick resolution snap** (instant, unit repositioning) — discrete event
4. **Buffer bar changes** (300ms transition) — smooth but brief
5. **Unit idle animation** (2-4s cycle) — slow ambient
6. **Tile animation** (4-16s cycle) — slowest, lowest priority

---

## Per-Biome Animation Specifications

### Ifugao Rice Terraces (Missions 1-2: Tutorial)

**Base state:** Stepped horizontal terrace lines with embedded green data-lights. Water fills the upper face of each terrace step.

| Animation Layer | Frequency | Cycle Length | Pixel Impact | Description |
|----------------|-----------|-------------|-------------|-------------|
| Water shimmer | 0.25 Hz | 4s | 8-12 pixels | Two-frame alternation of highlight pixels on the water surface. Frame A: bright pixel at positions (12,5), (28,7), (44,6). Frame B: bright pixel at positions (16,6), (32,5), (48,7). Slow crossfade, not hard swap. The water *breathes* — a gentle expansion and contraction of reflected sky light across the terrace step. |
| Data-light pulse | 0.125 Hz | 8s | 3-5 pixels | Tiny green (#00FF87) LEDs embedded in terrace stonework fade from 100% → 40% → 100% opacity over 8 seconds. Three lights per tile, staggered by 2.67s each so the pulse travels left-to-right across the terrace, suggesting data flowing through the ancient stone. |
| Mist drift | 0.0625 Hz | 16s | 6-8 pixels | A 4-frame mist sprite (semi-transparent white, 30% opacity) drifts across the lower face of the tile over 16 seconds. Only present on ~25% of terrace tiles (randomized at mission start). When present, it partially obscures the terrace wall face, creating depth. Pauses during sealed watch combat events (mist freezes when action happens). |

**Total animated pixels per tile per frame:** ~17-25 out of ~1,024 visible pixels (1.7-2.4%)

**Sensory description:** The rice terraces hum with quiet digital life. Water catches light in slow waves — not splashing, just *glistening*, the way a flooded paddy catches the setting sun. Embedded in the ancient stone, pinprick green lights pulse in lazy sequence: left, center, right, left again. Eight seconds per cycle. You don't notice them until you stop looking at your units — and then suddenly the terraces are alive, a server farm disguised as a UNESCO heritage site. Wisps of morning mist drift across the lower tiles, translucent enough to see through but present enough to remind you: this is a highland, and you are above the clouds.

---

### Siquijor Mystic Island (Missions 3-4: Hooks & Skills)

**Base state:** Dark volcanic rock with bioluminescent flora. Coral-encrusted signal boosters. Mangrove-root textures on tile walls.

| Animation Layer | Frequency | Cycle Length | Pixel Impact | Description |
|----------------|-----------|-------------|-------------|-------------|
| Bioluminescent pulse | 0.25 Hz | 4s | 10-15 pixels | Cyan-green (#18E0FF → #00FF87 gradient) organic lights embedded in volcanic rock surface. Unlike the terrace data-lights (mechanical, uniform), these are organic — irregular shapes, slightly different sizes, pulsing at slightly different rates (4s ± 0.5s per light, randomized at spawn). The effect is firefly-like: a constellation of tiny lights breathing independently but creating a collective rhythm. |
| Coral shimmer | 0.125 Hz | 8s | 4-6 pixels | Pink-orange coral accents on tile edges shift between two color states: warm (#FF6B9D) and cool (#C77DFF). Slow enough to be subliminal. The coral "breathes" — imperceptible unless you stare at one tile for 10+ seconds. |
| Root shadow sway | 0.0625 Hz | 16s | 3-4 pixels | Mangrove root shadows on the tile wall face shift 1 pixel left, then 1 pixel right, over 16 seconds. Suggests underwater current moving the roots. Four-frame animation: center → left → center → right. |

**Total animated pixels per tile per frame:** ~17-25 (1.7-2.4%)

**Sensory description:** Siquijor tiles glow from within. Not neon — *biological*. Tiny cyan-green lights scatter across the dark volcanic surface like deep-sea creatures, each pulsing to its own private rhythm. If the rice terraces feel like a server farm, Siquijor feels like a neural network grown in a coral reef. The bioluminescence is cool and quiet, never competing with the hot cyan of scout perception radii or the magenta of hook channels — the lights are softer, greener, more organic. At the tile edges, coral formations shift between warm pink and cool violet so slowly you'd swear they're static until you look away and look back. Below the surface, mangrove root shadows sway with invisible current, a reminder that the volcanic rock sits in living water.

---

### Palawan Jungle (Mission 5: Factory Introduction)

**Base state:** Dense tropical canopy. Bamboo stalks at tile edges. Tiny pixel flowers. Shadow from overhead foliage.

| Animation Layer | Frequency | Cycle Length | Pixel Impact | Description |
|----------------|-----------|-------------|-------------|-------------|
| Canopy shadow drift | 0.0625 Hz | 16s | 15-20 pixels | The most pixel-impactful animation in the game. The upper face of jungle tiles has a dappled shadow pattern (3-4 dark spots, 40% opacity) that shifts position by 1-2 pixels over 16 seconds, simulating overhead canopy movement. This is a 4-frame animation where the shadow pattern slides diagonally. Because it's low-contrast (shadow on already-dark green), it reads as ambient atmosphere rather than gameplay information. |
| Bamboo sway | 0.125 Hz | 8s | 2-3 pixels | Bamboo stalks at tile edges shift 1 pixel at the tip over 8 seconds. Two-frame: straight → lean right. Only visible on tiles at board edges where bamboo stalks are larger (3-4 pixels tall). Interior tiles have bamboo too small to animate. |
| Flower color cycle | 0.0417 Hz | 24s | 1-2 pixels | Tiny 1-pixel flowers on the tile surface shift between 3 colors over 24 seconds: red → yellow → white. So slow it's barely perceptible. A "did that flower change?" moment if you notice at all. Easter egg-level subtlety. |

**Total animated pixels per tile per frame:** ~18-25 (1.8-2.4%)

**Sensory description:** The jungle floor is never still, but it's never *busy*. Shadows drift across the green surface like clouds passing overhead — you're under a canopy, and the canopy is alive. It takes fifteen seconds for a shadow to cross a tile. You notice it the way you notice a cloud passing over the sun: not consciously, but your brain registers that the light changed. Bamboo tips lean and return at the very edges of your vision. Somewhere in the undergrowth, a pixel-flower is shifting from red to gold, but you'd have to stare at one tile for half a minute to catch it. The jungle *breathes*. It's the slowest breath in the game.

---

### Cebu/Manila Cyberpunk City (Missions 6-8: Command & Competition)

**Base state:** Stacked buildings, neon signs, fiber optic cables, jeepney-shaped objects at street level. Darkest base palette.

| Animation Layer | Frequency | Cycle Length | Pixel Impact | Description |
|----------------|-----------|-------------|-------------|-------------|
| Neon sign flicker | 0.5 Hz | 2s | 4-6 pixels | The FASTEST tile animation in the game, and the only one that approaches gameplay-speed motion. Tiny neon signs (2-3 pixels tall) on building facades flicker between on/off states. NOT a smooth pulse — a hard binary flicker with irregular timing (on for 0.8s, off for 0.2s, on for 0.6s, off for 0.4s — pseudo-random pattern from a fixed seed). Restricted to the wall face of the tile (rows 16-27), never on the top surface where gameplay happens. The flicker is contained BELOW the gameplay plane. |
| Fiber optic glow | 0.25 Hz | 4s | 3-5 pixels | Horizontal fiber optic lines on building walls pulse with traveling light — a bright pixel moves left-to-right along a 3-5 pixel horizontal line over 4 seconds, then repeats. Different lines travel in different directions. Suggests data flowing through the city's infrastructure. |
| Laundry line sway | 0.0625 Hz | 16s | 1-2 pixels | Tiny laundry on lines between buildings shifts 1 pixel. 16-second cycle. Barely visible. Humanizes the cyberpunk environment — people live here. |
| Street-level movement | 0.125 Hz | 8s | 2-3 pixels | At the very bottom of the tile wall face, tiny 1-2 pixel shapes (jeepney-scale vehicles) shift position by 1 pixel over 8 seconds. Suggests traffic. Only visible when zoomed in. |

**Total animated pixels per tile per frame:** ~10-16 (1.0-1.6%)

**Important constraint:** City tiles have the LEAST top-surface animation because they're introduced when gameplay complexity peaks (command agents, production queues, competitive mechanics). The animation budget shifts to the wall face — the "below the fold" of the isometric diamond — keeping the gameplay surface clean while the city pulses underneath.

**Sensory description:** Manila at night. The tile surface is dark — charcoal and deep navy — but the walls beneath it *burn*. Neon signs blink in arrhythmic patterns: not the smooth pulse of Siquijor's bioluminescence but the staccato flicker of a sign with a bad power connection. Pink. Yellow. Off. Pink again. Fiber optic lines carry traveling light like veins carrying blood — horizontal streaks of cyan flowing through the building facades. Far below, at the very bottom of the tile where no one looks during gameplay, a pixel-sized jeepney inches through traffic. And between two buildings, a laundry line sways. Someone hung their clothes out to dry above the robot war. The city is alive in a different way than the jungle — not organic but *electric*, not breathing but *buzzing*.

---

### Taal Volcano (Mission 10: Final Boss)

**Base state:** Volcanic rock, lava fissures, steam vents. Hostile terrain. The only biome designed to feel actively dangerous.

| Animation Layer | Frequency | Cycle Length | Pixel Impact | Description |
|----------------|-----------|-------------|-------------|-------------|
| Lava fissure glow | 0.25 Hz | 4s | 6-10 pixels | Crack patterns in the volcanic surface pulse between deep red (#8B0000) and bright orange (#FF4500). Unlike other biomes where animation is ambient, lava glow is HOT — it demands attention. This is deliberate: the final mission should feel dangerous. The terrain itself is a threat. |
| Steam vent burst | Variable | 6-10s | 8-12 pixels | Semi-transparent white sprites (40% opacity) erupt from specific tiles every 6-10 seconds (randomized). A 3-frame animation: nothing → small puff → large plume → nothing. Each burst lasts 1.5 seconds. Only 4-6 tiles per board have active vents (marked at mission start). These are the only tile animations that overlap the TOP SURFACE of the tile — and that's intentional, because Taal should feel like the board itself is fighting you. |
| Heat distortion | 0.125 Hz | 8s | Full tile | A subtle 1-pixel vertical offset applied to the entire tile sprite every 8 seconds (shift up 1px for 4s, shift down 1px for 4s). Creates a heat-shimmer mirage effect. On low-end hardware, this is the first animation to disable (see Performance Tiers below). |
| Ember drift | 0.0833 Hz | 12s | 2-3 pixels | Tiny orange-red pixels (1×1) drift upward across the tile wall face. Volcanic ash. 2-3 embers per tile, staggered timing. |

**Total animated pixels per tile per frame:** ~16-25 (1.6-2.4%), but with full-tile distortion adding perceived impact

**Sensory description:** The ground glows. Not the soft bioluminescent pulse of Siquijor — this is HEAT, radiating from cracks in black rock. Orange light throbs in the fissures like a slow heartbeat: bright, dim, bright. The air above the tiles shimmers — a 1-pixel vertical wobble that makes the whole board feel unstable, like a screen on the edge of failure. Every few seconds, a tile erupts with a white plume of steam that briefly obscures whatever unit was standing there (1.5 seconds — long enough to make you anxious, short enough not to lose track). Tiny embers float upward past unit silhouettes. This is the only biome where the terrain competes with the units for your attention, and that's the point: the final boss mission should feel like the world itself is hostile. The volcano isn't backdrop — it's opponent.

---

## Pixi.js Rendering Budget Analysis

### Draw Call Accounting

Pixi.js v8 batches sprites sharing the same base texture into single draw calls. The `@pixi/tilemap` package can batch up to 16,384 tiles per tilemap with texture packing optimization.

**Static board (no animation):**
- 64 tiles from a single tilemap texture atlas = **1 draw call**
- 8 units from unit sprite sheet = **1 draw call**
- Buffer bars (colored rectangles) = **1 draw call** (batched Graphics)
- UI chrome = **2-3 draw calls**
- **Total: ~5-6 draw calls**

**Animated board:**

| Animation Approach | Additional Draw Calls | Why |
|-------------------|----------------------|-----|
| **A: Baked sprite sheets** | +0 | Each tile has 2-4 animation frames baked into the tilemap atlas. Swap tile index per frame. Same single tilemap draw call. |
| **B: Overlay sprites** | +1 to +3 | Separate animated sprite layer(s) on top of static tiles. Each layer = 1 additional draw call if same texture atlas. |
| **C: Shader-based** | +0 (but GPU cost) | Custom fragment shader applies animation (color cycling, UV offset) to static tiles. Zero additional draw calls but shader compilation overhead. |
| **D: Hybrid (RECOMMENDED)** | +1 | Static base tilemap (1 draw call) + one animated overlay tilemap containing all per-tile animations (1 draw call). Two draw calls total for 64 tiles + animations. |

**Recommendation: Approach D (Hybrid)**

The base tilemap renders 64 static tile sprites in 1 draw call. A second tilemap layer renders animated elements (water shimmer sprites, data-light sprites, neon flicker sprites) as overlay sprites, also batched into 1 draw call via a shared animation texture atlas.

### Frame Budget at 60 FPS

At 60 FPS, each frame has **16.67ms** of total budget. A well-optimized Pixi.js game typically allocates:

| Phase | Budget | Notes |
|-------|--------|-------|
| Game logic (tick simulation) | 2-3ms | Deterministic tick only fires every 1s; most frames are interpolation-only |
| Tile rendering (static + animated) | 1-2ms | 2 draw calls, <200 sprites total |
| Unit rendering | 1-2ms | 8-16 units, buffer bars, perception radii |
| Overlay rendering (channels, signals, EM) | 2-4ms | Variable based on active channels; most expensive during signal-heavy ticks |
| UI rendering (React DOM) | 3-5ms | Workbench panels, inspector sidebar — React handles this outside Canvas |
| Compositor + buffer swap | 1-2ms | GPU finalization |
| **Headroom** | **2-5ms** | Safety margin for garbage collection spikes, low-end hardware |

**Tile animation cost within the 1-2ms tile budget:**
- 64 tiles × 2-4 animation layers = 128-256 animated overlay sprites
- All from one texture atlas = 1 draw call
- Per-frame work: update `animationTime` uniform or swap tile indices based on global clock
- **Estimated: 0.3-0.8ms additional over static tiles**

This is well within budget. The animation is NOT the bottleneck. Overlay rendering (channel wiring, signal chains, EM emission rings) is the real performance concern.

### Texture Memory Budget

| Asset | Dimensions | Memory |
|-------|-----------|--------|
| Base tilemap atlas (5 biomes × 4 variants × 64×32px) | 512×512 | ~1 MB |
| Animation overlay atlas (all biome animations, 2-4 frames each) | 512×512 | ~1 MB |
| Unit sprite sheets (5 types × 3 states × 2 directions) | 512×256 | ~0.5 MB |
| Effect sprites (signals, combat, overload) | 256×256 | ~0.25 MB |
| UI textures | 512×512 | ~1 MB |
| **Total VRAM** | | **~3.75 MB** |

For context, even integrated GPUs on 2018 laptops have 1-2 GB of VRAM. This budget is trivial. The game could run on a Chromebook.

---

## The Critical Question: Does Animation Compete with Gameplay Overlays?

### Overlay Inventory (What Sits On Top of Tiles)

During a sealed watch tick resolution, the following can be simultaneously visible on a single tile:

1. **Unit sprite** (20×28px, opaque)
2. **Buffer bar** (colored pips below unit, 5-8px tall)
3. **Perception radius** (semi-transparent circle/cone, extends beyond tile)
4. **Channel wiring** (colored dashed lines crossing tile)
5. **Signal delivery flash** (green cell highlight, 200ms)
6. **Combat flash** (red cell highlight, 100ms)
7. **EM emission ring** (expanding circle, semi-transparent)
8. **Tag marker** (cyan diamond on tagged unit)

### The Conflict Zones

| Tile Region | Animation Present | Gameplay Overlay Present | Conflict? |
|------------|-------------------|------------------------|-----------|
| **Top surface (rows 4-15)** | Water shimmer, canopy shadow, bioluminescent pulse, lava glow | Unit sprite, buffer bar, tag marker, signal flash, combat flash | **YES — HIGH** |
| **Wall face (rows 16-27)** | Neon flicker, fiber optic glow, root shadow sway, laundry, street traffic, ember drift | Perception radius (extends below), channel wiring (may cross) | **LOW — manageable** |
| **Edges (rows 0-3, 28-31)** | Bamboo sway, coral shimmer | Corner tick marks, checkerboard pattern | **MINIMAL** |

### Resolution: The Suppression System

When a gameplay overlay activates on a tile, that tile's top-surface animations **dim to 20% intensity** for the duration of the overlay. The technical implementation:

```
// Pseudocode for per-tile animation suppression
for each tile:
  if tile.hasActiveOverlay():
    tile.animationAlpha = lerp(tile.animationAlpha, 0.2, 0.15)  // smooth dim over ~200ms
  else:
    tile.animationAlpha = lerp(tile.animationAlpha, 1.0, 0.08)  // slow restore over ~500ms
```

**Wall-face animations are NEVER suppressed** — they live below the gameplay plane and don't interfere.

**The effect:** When a signal chain fires across the board, tiles along the chain briefly dim their ambient animation, making the green signal delivery line pop against a quieter background. When the signal passes, the tiles slowly breathe back to life. The suppression itself becomes a visual cue — "something happened here."

### The Taal Exception

Taal volcano tiles do NOT suppress their top-surface animations. The lava glow and steam vents remain at full intensity even during gameplay events. This is a deliberate design choice:
- Mission 10 should feel overwhelming — the terrain fights your attention
- Information overload from terrain animation mirrors the in-game context overload mechanic
- The final boss earns the right to break the rules established in missions 1-9

---

## Performance Tiers

Not all players have the same hardware. The animation system must degrade gracefully.

### Tier 1: "Full Atmosphere" (Default — modern discrete GPU or recent integrated)

All animations active at specified frequencies and pixel counts. Heat distortion shader on Taal. Smooth overlay suppression with lerp transitions.

### Tier 2: "Reduced Motion" (Older hardware OR player preference)

| Change | Reason |
|--------|--------|
| All cycle lengths doubled (4s → 8s, 8s → 16s) | Halves animation update frequency |
| Heat distortion disabled | Removes per-tile shader |
| Mist/steam sprites disabled | Removes alpha-blended overlay sprites |
| Neon flicker → static glow | Removes highest-frequency animation |
| Max 32 animated tiles (alternating checkerboard) | Halves animated tile count |

### Tier 3: "Static Terrain" (Low-end hardware OR accessibility: reduce motion)

All tile animations disabled. Tiles render as static sprites. Gameplay overlays render at full quality. The board becomes a clean Into the Breach-style static grid.

**The "reduce motion" accessibility setting maps directly to Tier 3.** Players with vestibular sensitivity get a fully functional, completely static board. This is non-negotiable — no "reduced" middle ground for accessibility. When a player says "no motion," they mean NO ambient motion. Gameplay animations (tick resolution, signal delivery, combat flash) still fire because they're informational, but they use hard cuts instead of transitions.

### Tier Detection

```
// Auto-detect at first launch
if (navigator.hardwareConcurrency <= 2 || !window.WebGL2RenderingContext) {
  defaultTier = 3;
} else if (fps < 50 after 10 frames of benchmark scene) {
  defaultTier = 2;
} else {
  defaultTier = 1;
}
// Player can override in Settings → Display → Terrain Animation
```

---

## Playwright Screenshot Test Determinism

Animated tiles create a problem for visual regression testing: the screenshot depends on *when* during the animation cycle it's captured.

### Solution: Animation Clock Override

All tile animations derive their state from a single `animationClock` value (milliseconds since board render start). In Playwright test mode:

```javascript
// Test harness injects deterministic clock
window.__ROBOT_UPRISING_TEST_MODE__ = true;
window.__ANIMATION_CLOCK_OVERRIDE__ = 0; // All animations at frame 0
```

Every Playwright screenshot captures tiles at `animationClock = 0` (their "rest state"). Animation correctness is tested separately via a dedicated animation test that captures at clock values [0, 1000, 2000, 4000, 8000, 16000] and compares against golden frames.

---

## Interaction Effects

### With Sealed Watch (Locked)
The sealed watch's "no skip, no pause, no tools" rule means tile animations run uninterrupted. The player can't freeze the board to study terrain details. This makes the "breathe, don't dance" philosophy critical — if tiles were animating aggressively, the sealed watch would be visually overwhelming. The slow breathing creates ambient life without competing with the tick-by-tick action.

### With Inspector (Locked)
The inspector's timeline scrubber pauses gameplay but keeps tile animations running (they're cosmetic, not game-state). This means the inspector view has a "living diorama" quality — the board breathes while the player studies frozen unit states. The contrast between animated terrain and frozen units reinforces that the inspector is a tool for studying *agent behavior*, not *world state*.

### With Art Direction Options (6.01)
The animation budget is designed for Option B ("Tropical Hologram") with its 48-color palette and detailed tiles. Option A ("Circuit Board") with its 24-color technical palette would use simpler, lower-pixel-count animations (data-light pulses only, no organic effects). The budget scales down naturally — fewer colored pixels to animate means less visual noise.

### With Buffer Visualization (Locked: Context Bars)
Buffer bars sit directly above tile top surfaces. Animated tiles beneath buffer bars must never create false readings — a blue water shimmer pixel adjacent to a blue buffer pip could be misread. The animation atlas deliberately avoids the locked UI signal colors (cyan, magenta, yellow, red, green) in its top-surface animations. Organic biome colors (warm greens, deep blues, volcanic reds) occupy a different hue band.

### With EM Emission Rings (Locked)
EM emission rings expand outward from units as semi-transparent circles. When an EM ring crosses an animated tile, the ring must remain clearly visible. The overlay suppression system handles this — tiles under active EM rings dim their animation, making the ring's boundary sharp.

### With Colorblind Modes (6.01d)
Tile animations that rely on color shifts (coral shimmer warm→cool, flower color cycle, lava glow red→orange) must degrade to brightness-only shifts under colorblind modes. The animation timing and pixel positions remain identical — only the color values change to ensure adequate contrast under protanopia/deuteranopia/tritanopia.

---

## Comparable Games

### Into the Breach
Tiles are almost entirely static. Subtle shadow differences between "threatened" and "safe" tiles. Water tiles have a barely-perceptible color shift every few seconds. The lesson: ITB proves that static tiles work perfectly for tactical clarity. Robot Uprising's animations are a deliberate choice to exceed the ITB baseline for *atmosphere* — but the suppression system guarantees ITB-level clarity when it matters.

### Factorio
Belts, inserters, and assembling machines animate constantly. The screen is a sea of motion. Factorio gets away with this because the player is zoomed out far enough that individual animations blur into aggregate motion patterns — you read "belt is moving" not "belt frame 3 of 8." Robot Uprising is too zoomed-in (8×8 grid) for this approach. Each tile is individually visible, so each tile's animation is individually distracting.

### Slay the Spire
Card art has subtle animations (breathing characters, flickering flames). The key insight: Slay the Spire animates the *cards* (player's tools) not the *battlefield*. Robot Uprising inverts this — the workbench (player's tools) is static DOM, while the battlefield (the thing you watch) is animated. The risk profile is different: animated tools can be studied at the player's pace, animated battlefields cannot (sealed watch enforces tempo).

### Caves of Qud
ASCII/tile-based with a rich particle system layered on top. Rain, fire, gas clouds — all rendered as character-level effects that occupy the same grid cells as gameplay entities. Caves of Qud disambiguates via color: environmental effects are always a different color band than creatures and items. Robot Uprising's hue-band separation follows the same principle.

### Dorfromantik
Isometric hex tiles with gorgeous environmental animation — water flows, trees sway, trains move along tracks. Dorfromantik is purely aesthetic (no combat, no time pressure), so animation can be as elaborate as desired. The lesson: when there's no gameplay urgency, tile animation IS the game feel. When there IS urgency (Robot Uprising's sealed watch), animation must defer to information.

---

## The TikTok Clip

**15 seconds:** Camera slowly pans across the 8×8 board as it transitions between biomes. Rice terrace water glimmers in golden light. Cut to Siquijor: bioluminescent spots pulse like scattered stars. Cut to Manila: neon signs flicker against dark facades, fiber optic veins glow beneath. Cut to Taal: lava cracks throb, steam erupts from a tile just as a Scout unit snaps into position on the tick clock. The Scout's perception cone sweeps outward — and every tile it touches dims its animation, the world quieting to let the scan read clean. When the cone passes, the tiles breathe back to life. Text overlay: "The battlefield is alive. Your agents are awake."

---

## Player Journeys

### Journey: Mika, 14, Minecraft/Terraria Player

**Context:** First time playing Robot Uprising. Mission 1 (Ifugao rice terraces). Has never played a strategy game but has 2,000 hours in Minecraft.

**Minute 0:00 — First Board View**
Mika sees the 8×8 isometric grid for the first time. The board is... pretty. She notices the terraces immediately — the stepped lines remind her of Minecraft's rice farm tutorial she watched on YouTube. "Oh cool, it's like paddies." She leans closer to the screen. The water on the terraces is moving — just barely, a gentle shimmer. "Wait, is that animated?" She hovers her mouse over a tile. Nothing happens (tiles aren't interactive in sealed watch). She watches the water shimmer for 3-4 seconds, mesmerized by the subtlety.

**Minute 0:15 — Noticing the Data Lights**
Her eye catches a green pinprick of light on the terrace stone. It's fading. She watches it fade... and then it brightens again. "Are those little lights?" She counts three on one tile. They pulse in sequence: left, center, right. "That's like redstone!" The data-lights trigger her Minecraft pattern-recognition: this is a world with embedded technology, not just terrain. She's not consciously processing this, but her brain is filing "this world has circuits built into its bones."

**Minute 0:30 — Mist Discovery**
A wisp of mist drifts across a tile in the lower-left corner. It takes 16 seconds to cross. Mika doesn't notice it consciously — she's reading the boot log text. But when she glances back at the board 20 seconds later, the mist is on a different tile. "Did that fog move?" She stares at the spot. The mist is gone (already passed). She's not sure if she imagined it. This uncertainty is intentional — the mist creates a "living world" feeling without demanding attention.

**Minute 1:00 — First Tick Resolution**
The tick clock fires. Her pre-placed Scout snaps forward one tile. The signal delivery flash (green) overwhelms any tile animation under the Scout's new position. Mika doesn't even notice the tile animation dimmed — she's looking at the green flash. When the flash fades (200ms), the tile beneath the Scout slowly brightens back to full animation. Mika's attention is correctly on the gameplay event, not the terrain.

**Minute 3:00 — Board as Familiar Space**
By the third minute, Mika has stopped consciously noticing the tile animations. They've become part of the environment — the board feels "alive" in a way she can't articulate. If you paused the game and switched to Tier 3 (static tiles), she'd immediately feel something was wrong: "Why does it feel dead?" The animations have established a baseline of ambient life that the player's visual system calibrates to.

**UI Annotations:**
- Water shimmer: 2-frame crossfade at 0.25 Hz, upper face only, 8-12 pixels
- Data lights: 3 per tile, green (#00FF87), staggered 8s pulse, lower than gameplay overlays in z-order
- Mist: 30% opacity white sprite, 16s drift, 25% tile coverage, wall face only

---

### Journey: Derek, 38, Factorio Veteran (800+ Hours)

**Context:** Mission 6 (Cebu urban). First city biome. Has been playing for an hour (missions 1-5 complete). Intimately familiar with Factorio's animated belts and inserters.

**Minute 0:00 — City Biome First Impression**
Derek loads Mission 6 and immediately notices the difference. The board is *darker* than previous biomes. The tile surfaces are charcoal and navy — much less visual information on the gameplay plane. "Huh, clean." His Factorio-trained eye appreciates the reduced visual noise. Then he looks at the tile walls — the vertical faces below the diamond surface — and sees neon signs flickering. "Oh. Oh that's nice." He's looking at the Below-The-Fold animation strategy in action: all the city character lives in the wall face, keeping the top surface clean for gameplay.

**Minute 0:20 — Fiber Optic Recognition**
A bright cyan pixel travels left-to-right along a horizontal line in a building wall. Derek leans in. "Is that... a belt?" He watches another fiber optic line glow in the opposite direction. The traveling-pixel animation mimics Factorio belt items at the pixel level. Derek grins. "It's a data belt." This is intentional — the fiber optic animation deliberately echoes Factorio's visual language to create instant familiarity for factory-game veterans. But where Factorio belts carry items, these carry data. The metaphor bridges.

**Minute 0:40 — Animation During Combat**
A five-unit engagement resolves on the board. Strikers snap into position, combat flashes fire (red), signal chains illuminate (green dashed lines). During the 3-second resolution, Derek's attention is locked on the gameplay. He doesn't notice that the tiles under the engagement have dimmed their wall-face animations. When the dust settles and he reviews the board state, the neon signs flicker back to life around the surviving units. The city returns to normal. Derek processes this as "the city reacted to the battle" — a narrative reading of what is actually a technical overlay-suppression system.

**Minute 2:00 — Discovering the Laundry**
Between battles, Derek idly scans the board. On a tile in the corner where no units have been placed, he spots something he hasn't seen before: a tiny line between two buildings with a pixel that sways. "Is that... laundry?" He laughs. The 16-second laundry sway is the slowest, least visible animation in the city biome — a detail that most players will never notice. Derek screenshots it and posts to the game's Discord: "there's LAUNDRY in the cyberpunk city tiles lmao." The screenshot gets 200 reactions. Environmental storytelling at 1 pixel.

**UI Annotations:**
- Neon flicker: wall face only (rows 16-27), pseudo-random binary pattern, 0.5 Hz base rate
- Fiber optic: wall face, traveling pixel at ~3px/sec, direction-randomized per line
- Overlay suppression: tiles dim to 20% over 200ms when gameplay overlays activate, restore over 500ms
- Laundry: 16s sway, 1px amplitude, wall face upper region

---

### Journey: Prof. Adaora, 52, University CS Professor, Low Vision (Uses 150% Display Scaling)

**Context:** Mission 3 (Siquijor). Has completed missions 1-2 with 150% display scaling. Uses the game's "Reduced Motion" accessibility setting but has NOT enabled "Static Terrain" because she likes ambient atmosphere.

**Minute 0:00 — Siquijor at Tier 2**
At 150% scaling, each tile is effectively 96×48 screen pixels — large enough that individual animation pixels are clearly visible. Prof. Adaora has Tier 2 (Reduced Motion) active. All cycle lengths are doubled: bioluminescent pulse is now 8s instead of 4s. Mist and steam are disabled. The Siquijor tiles glow with a stately, slow rhythm. "It's like a night garden," she says to no one. The doubled cycle length actually enhances the meditative quality for her — the pulses are so slow they feel geological.

**Minute 0:30 — Bioluminescence vs. Signal Colors**
A hook fires from her Relay to her Scout. The channel wiring (magenta dashed line) cuts across a tile with active bioluminescent pulses (cyan-green). At 150% zoom, both are clearly visible. She pauses (Inspector mode). "Can I tell these apart?" The bioluminescent pulse is organic-shaped, warm green, and on the tile surface. The channel wiring is a geometric dashed line, pure magenta, layered above the tile. Different hue band, different layer, different geometry. She can distinguish them easily. "Good contrast." If she couldn't, she'd switch to Tier 3, but Tier 2 works.

**Minute 1:00 — Coral Shimmer Below Threshold**
The coral shimmer animation (warm pink → cool violet over 16s at Tier 2) is changing so slowly that at 150% zoom, it looks static. Prof. Adaora never notices it. This is correct behavior — the coral shimmer was designed as subliminal atmosphere. At Tier 2 speeds, it falls below conscious perception even at large zoom. No information lost, no distraction created.

**Minute 3:00 — Considering Static Mode**
Prof. Adaora's teaching assistant asks why she doesn't just use Tier 3. "Because I like that the board is alive. It makes me feel like the game cares about its world. The animations don't bother me at this speed — they're slower than my pulse." She makes a mental note to show her students the three tiers as an example of graceful degradation in interactive media design.

**UI Annotations:**
- Tier 2 at 150% scale: all cycles doubled, mist/steam disabled, 32 animated tiles (alternating)
- Bioluminescence at Tier 2: 8s cycle, clearly distinguishable from cyan gameplay signals
- Coral shimmer at Tier 2: 16s cycle, effectively imperceptible — below conscious threshold
- Settings path: Settings → Display → Terrain Animation → "Reduced Motion" (middle option)

---

## New Aspects Discovered

1. **6.01a-ii — Biome-specific signal propagation visuals** (already in frontier)
2. **6.01a-vi — Animation-as-narrative: biome animation intensity as difficulty signal** — do calmer biomes (terraces: slow, meditative) correlate with easier missions, and aggressive biomes (Taal: fast, intrusive) with harder ones? Is this mapping intentional or incidental? Should the player learn to "read" terrain animation speed as a difficulty preview?
3. **6.01a-vii — Tile animation response to game events** — beyond suppression, should tiles react to specific events? Water splashes when a unit steps on a terrace tile. Neon signs flicker harder when combat happens nearby. Bioluminescence dims when an enemy passes. Reactive tiles vs. ambient-only tiles.
4. **6.01a-viii — Cross-biome transition animation blending** — when the board has mixed biomes (e.g., terrace adjacent to jungle), how do their animations interact at the boundary? Do terrace water reflections carry into jungle shadow? Do Siquijor bioluminescent pulses illuminate adjacent city tiles?
5. **6.01a-ix — Animation sound design coupling** — each biome's animation implies specific ambient sounds (water lapping for terraces, insect hum for jungle, neon buzz for city, rumbling for Taal). How tightly coupled should visual animation and ambient audio be? Should disabling visual animations also silence biome audio?
