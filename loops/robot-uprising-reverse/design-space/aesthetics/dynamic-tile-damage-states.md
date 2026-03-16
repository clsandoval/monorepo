# 6.01a-iii — Dynamic Tile Damage States

## The Question: Should the Battlefield Remember?

When a striker eliminates a unit on a rice terrace tile, does the terrace crack? When combat happens in the jungle, does the canopy scorch? When a relay is destroyed in Siquijor, does the bioluminescence die? The question isn't just aesthetic — it's about whether the *board itself* accumulates readable history during a sealed watch. Damaged tiles become a visual archaeology of the battle: "heavy fighting happened here, the enemy pushed through the center, this flank was untouched."

This is fundamentally a tension between **Into the Breach's clean readability** (every tick, the board state is instantly parseable) and **Factorio's environmental storytelling** (the world shows evidence of what happened). Into the Breach chose no damage — tiles are pristine forever. Robot Uprising's one-shot-one-kill system means combat events are rare and high-impact, which actually argues FOR damage states: each one is memorable, not visual noise.

---

## Design Axis: Damage State Depth

How many visual states does each tile have?

### Option A: "No Scars" — Pristine Tiles (Into the Breach model)

Tiles never change. Combat happens, the red flash fires (100ms), the destroyed unit plays its death animation, and the tile beneath is untouched. The board is always maximally readable because it's always the same.

**Strengths:**
- Zero cognitive overhead. Tile always means the same thing.
- No rendering cost for damage sprites.
- Simplest to implement — no tile state tracking needed.
- Into the Breach proved this works for tactical games.

**Weaknesses:**
- The battlefield feels sterile. One-shot-one-kill combat is dramatic, but the world doesn't react.
- Missed opportunity for readable battle history during sealed watch.
- The "SE Asian cyberpunk server farm" setting begs for environmental reactivity — data racks sparking, terraces flooding, coral cracking.
- Loses a potential layer of information in the Inspector (where was combat densest?).

### Option B: "Single Scar" — One Damage State Per Biome

Each biome has exactly one alternate "damaged" tile variant. When combat occurs (striker eliminates a unit), the tile underneath transitions to its damaged state and stays there for the remainder of the battle. Tiles never repair during a match.

**Damage state per biome:**

| Biome | Undamaged → Damaged Transition | Pixel-Level Change |
|-------|-------------------------------|-------------------|
| **Ifugao Terraces** | Terrace stone cracks, water drains from upper face. Data-lights go amber/flickering instead of steady green pulse. | Rows 4-7: The clean horizontal terrace line breaks — a 3-pixel diagonal crack (#2A1810) cuts across the water surface. The 8-12 shimmer pixels go dark. The two-frame water animation stops (static frame). Data-lights shift from green (#00FF87) to amber (#FFB347), pulse doubles to 0.5 Hz — frantic, not calm. Wall face: one root tendril snaps (gap in the horizontal line). |
| **Siquijor Mystic** | Volcanic rock spiders with cracks, bioluminescence dies in the impact area, coral turns ashen. | Rows 4-7: Central bioluminescent cluster goes dark (pixels revert to volcanic rock base #1A1A2E). A 2-pixel crack radiates from center outward. Remaining bioluminescence at tile edges shifts from cyan-green to dim amber — the organism is stressed. Coral accents lose their color shimmer and lock to a grey-pink (#8E7685). Root shadows on the wall face freeze mid-sway. |
| **Palawan Jungle** | Canopy tears open — direct sunlight hits the forest floor. Bamboo snaps. | Rows 4-7: The three leaf-cluster blobs shrink — one cluster replaced by a bright shaft of light (#F5DEB3, warm tropical sun) cutting through the gap. The hole in the canopy is 4-5 pixels of warm light surrounded by torn leaf edges (#1B4332 darker than normal canopy). Any bamboo accent snaps: the 2px vertical stalk breaks at the midpoint with a 1px gap. Orchid dot disappears. Wall face: charred root (one root line turns from green #6B8F47 to black #1A1008). |
| **Cebu/Manila City** | Neon shatters, concrete cracks, exposed wiring sparks. | Rows 4-7: The primary neon accent (whatever color the city tile uses — magenta, cyan, gold) shatters: the solid neon line becomes fragmented (alternating lit/dark pixels along its path). A 3-pixel crack in the concrete surface (#3A3A3A → #1A1A1A dark gap). Exposed wiring: 2-3 pixels of hot orange (#FF6B35) where the neon was, suggesting live current. The neon flicker animation goes arrhythmic — instead of steady pulse, it stutters (on-off-on-off-on at irregular intervals, conveying "broken" vs. "breathing"). |
| **Taal Volcanic** | Lava seeps through cracks, obsidian surface fractures, thermal vents emerge. | Rows 4-7: A 2-pixel crack opens in the obsidian surface, and beneath it: molten orange (#FF4500 → #FF6B35 gradient) seeps through — 3-4 pixels of lava glow visible through the fractured rock. The normal Taal tile has a subdued dark surface with ember accents; the damaged tile's ember count doubles, and the cracks let deep heat show through. Wall face: a new thermal vent — a 2px bright spot on the left wall where steam (1px white, 40% opacity) emerges. |

**Animation changes in damaged state:**

Each damaged tile adjusts its breathing animation to convey "wounded but still alive":

- **Terraces:** Water shimmer stops (drained). Data-light pulse doubles in speed and shifts to amber. Mist continues (it's environmental, not structural).
- **Siquijor:** Bioluminescent pulse stops for dead organisms, shifts to stressed amber for survivors. Coral shimmer freezes. Root sway continues at half speed (roots don't care about surface damage).
- **Jungle:** Canopy hole introduces a new animation: the light shaft slowly shifts 1 pixel over 8 seconds (moving sun). Remaining leaf clusters animate normally. Broken bamboo is static.
- **City:** Neon goes arrhythmic (see above). Exposed wiring has a new 0.5s spark animation: a 1px bright white pixel appears at the wire end for 1 frame every 2 seconds, suggesting intermittent short circuit. Concrete crack is static.
- **Taal:** Lava glow pulses at 0.5 Hz (faster than normal ember accents at 0.25 Hz) — the exposed magma is more active. Steam vent animation: 1px white dot appears, rises 1px, fades, over 3 seconds.

**Transition animation (the moment of damage):**

When combat resolves on the tick:
1. **Red combat flash** fires (100ms, existing system)
2. **0.5s crossfade** — the undamaged tile's pixel values lerp to the damaged tile's pixel values over 500ms
3. The crossfade starts from the combat impact point (center of where the destroyed unit was) and radiates outward — pixels near the center change first, edges change last, creating a "damage spreading from the point of impact" wavefront

This 500ms crossfade is fast enough to complete within the 1-second tick window but slow enough to be readable as "the tile just changed." It slots between the combat flash (100ms) and the next tick, giving the player a clear sequence: flash → tile transforms → new tick begins.

**Strengths:**
- Readable battle history: at any point during sealed watch, you can see where combat happened.
- Minimal cognitive load: one alternate state per biome, easily learned.
- Enhances the one-shot-one-kill drama — when a unit dies, the WORLD reacts.
- Creates "scorched earth" visual narrative during intense battles.
- Useful in Inspector: damaged tiles are an instant map of engagement zones.

**Weaknesses:**
- 5 additional tile sprites (one per biome) needed.
- Slight increase in rendering complexity (tracking tile state, crossfade animation).
- On a board with heavy combat (many destroyed units), multiple damaged tiles may create a cluttered look.
- Binary: either pristine or damaged, no gradient.

### Option C: "Progressive Scarring" — Three Damage Levels Per Biome

Each biome has three damage states: **Light** (single combat event), **Heavy** (2-3 events on the same tile), and **Devastated** (4+ events). Each level shows escalating environmental destruction.

| Biome | Light | Heavy | Devastated |
|-------|-------|-------|------------|
| **Terraces** | Cracked stone, water dims | Stone fractures widen, water drained, data-lights dead | Terrace collapses to rubble, wall face crumbles, just dark broken stone with dying amber sparks |
| **Siquijor** | Bioluminescence dims, single crack | Most bioluminescence dead, coral grey, multiple cracks | Black volcanic ruin — all light gone, surface is just fractured basalt. The mystic island is just... rock. |
| **Jungle** | Canopy hole, broken bamboo | Major canopy gap (half the tile is sunlight), scorched ground visible | Clearing — canopy almost gone, charred stumps, ash-grey ground. The jungle was deleted. |
| **City** | Broken neon, cracked concrete | Multiple neon shattered, exposed infrastructure, rebar visible | Crater — the building collapsed. Just rubble pixels in grey and brown with a few sparking wires. The city block doesn't exist anymore. |
| **Taal** | Lava crack, steam vent | Multiple lava flows, surface half-molten | Full magma exposure — the obsidian cap broke and lava dominates the tile. Bright orange-red surface, hazardous-looking. |

**Strengths:**
- Incredibly expressive. A devastated tile tells a story of repeated, desperate fighting.
- The progressive degradation creates a visual "heat map" of battle intensity without any UI overlay.
- The devastated state is visually striking — potential TikTok moment: "my whole jungle board turned to ash."
- Creates strategic consideration for future mechanics: could damaged terrain affect movement or signal propagation?

**Weaknesses:**
- 15 additional tile sprites (3 levels × 5 biomes).
- Combat on the same tile 4+ times in an 8×8 board with one-shot-one-kill is rare — the devastated state may almost never be seen.
- Progressive damage adds cognitive complexity: "wait, what does that tile mean? Is it double-damaged or triple-damaged?"
- Risk of the board becoming ugly/unreadable in heavy-combat matches.

### Option D: "Residue, Not Scars" — Temporary Combat Traces

Instead of permanent tile damage, combat leaves a **residue** that fades over 3-5 ticks. The tile itself never changes — instead, an overlay effect appears on the tile surface after combat and gradually dissipates.

**Per-biome residue:**

| Biome | Residue Visual | Fade Behavior |
|-------|---------------|---------------|
| **Terraces** | Ripple rings in the water (concentric circles emanating from combat point, 3-4 pixels expanding outward) | Rings expand and fade over 3 ticks. Water resettles. |
| **Siquijor** | Bioluminescence flare — all nearby organisms pulse bright cyan simultaneously (shock response), then gradually desynchronize back to individual rhythms | Bright flash → synchronized pulse for 2 ticks → gradual desync over 3 more ticks → normal by tick 5 |
| **Jungle** | Leaf shower — 3-4 single-pixel green dots "fall" from the canopy rows down through the tile (1 pixel/tick descent) suggesting shaken foliage | Leaves fall and disappear when they reach the wall face (3-4 ticks) |
| **City** | Sparks shower — 2-3 bright white/orange pixels appear and descend (like sparks from damaged electrical infrastructure above the tile) | Sparks fall and extinguish over 2-3 ticks |
| **Taal** | Seismic tremor — the entire tile shifts 1 pixel in a random direction and back (a micro-shake), then a single new ember pixel appears | Shake is instant (1 tick), ember pixel fades over 4 ticks |

**Strengths:**
- The board stays clean. After 5 ticks, it's pristine again.
- Combat events feel impactful in the moment without cluttering long battles.
- Residue fading is visually beautiful — water settling, leaves falling, sparks extinguishing.
- Zero long-term cognitive overhead.
- Aligns with Into the Breach's "clean board" philosophy while adding SE Asian flavor.

**Weaknesses:**
- No battle history accumulation — you can't read where fighting happened 10 ticks ago.
- The fading animations add per-tick rendering cost during combat-heavy moments (exactly when the board is already busiest).
- Less dramatic than permanent scars. The one-shot-one-kill weight is diminished if the world shrugs it off in 5 seconds.

### Option E: "Hybrid Memory" — Fading Residue + Permanent Subtle Scar

The best of both worlds. Combat triggers an immediate residue effect (Option D's dramatic moment), which fades over 3-5 ticks into a permanent but subtle scar (a toned-down version of Option B).

**The timeline:**
1. **Tick 0 (combat):** Red flash (100ms) → dramatic residue (biome-specific, Options D effects)
2. **Ticks 1-3:** Residue fades gradually
3. **Tick 4+:** Residue fully gone, but the tile now shows a permanent subtle scar — not the full Option B damage, but a hint:

| Biome | Permanent Subtle Scar |
|-------|----------------------|
| **Terraces** | One data-light permanently shifted to amber. Water shimmer unchanged. A hairline crack (1px, barely visible) in the stone. |
| **Siquijor** | One bioluminescent organism permanently dark. Others unaffected. A single coral accent permanently grey. |
| **Jungle** | The orchid dot is gone. One leaf cluster is 10% darker. That's it — a shadow of trauma. |
| **City** | One neon segment permanently flickering arrhythmically instead of breathing. The rest is fine. |
| **Taal** | One additional ember pixel permanently visible. A 1px hairline in the obsidian. |

**Strengths:**
- Maximum drama at the moment of combat (residue effects are visceral and biome-specific).
- Readable battle history (subtle scars accumulate, but never dominate).
- The scar is so subtle that board readability is barely affected — you have to look for them.
- In the Inspector, these subtle scars become a forensic tool: "ah, there's a dimmed orchid on E4 — combat happened here."
- Multiple scars on one tile stack (two dark bioluminescent organisms, two amber data-lights) but never overpower the tile.
- Elegant aesthetic: the world heals but remembers.

**Weaknesses:**
- Most complex to implement: residue animation system + permanent scar sprite variants + stacking logic.
- The subtle scars might be TOO subtle — players may never notice them.
- Stacking logic needs a cap: after 5+ combat events on one tile, does it just have all data-lights amber? That could be readable as "war zone" but needs careful calibration.

---

## Interaction with Gameplay Overlays

Damage states must coexist with the overlay hierarchy from the tile animation budget (6.01a-i):

1. **Perception radii** (translucent colored circles around scouts) — Damage states must not conflict with perception radius colors. The amber data-lights in damaged terraces could read as "perception indicator" to new players. **Mitigation:** damaged indicators use warm amber (#FFB347), perception radii use cool cyan (#00E5FF). Different color temperature = no confusion.

2. **Channel wiring lines** (colored dashed lines between units) — On damaged tiles, wiring lines should render ABOVE the damage effects. The 1px crack in a terrace shouldn't break a channel wire visually. **Mitigation:** channel wires always render on the overlay layer above tile sprites.

3. **Buffer bars** (tiny colored pips at bottom of unit tiles) — Buffer bars sit at the bottom edge of the unit sprite, which overlaps the tile's upper face. Damaged tile effects in rows 4-7 are partially hidden by unit sprites anyway. **Mitigation:** no special handling needed — units naturally occlude tile damage beneath them.

4. **EM emission rings** — EM rings are concentric circles radiating from units with active hooks. On damaged Taal tiles with lava glow, EM rings (typically purple/magenta) must be distinguishable from lava orange. **Mitigation:** EM rings render on the overlay layer with 60% opacity, creating a visible composite but never blending into terrain colors.

5. **Ghost unit previews** (plan screen holographic units) — Ghost previews are semi-transparent. On heavily damaged tiles, the ghost might look like it's standing in a crater. This is actually GOOD — it communicates "this is a contested area" even in the plan phase (for subsequent battles on the same map).

---

## Interaction with the Inspector

The Inspector (post-battle timeline scrubber) is where damage states become a powerful analytical tool:

**"Battle Scar Overlay" toggle in Inspector sidebar:**
When enabled, the timeline scrubber shows damage state progression. Scrub to tick 1: pristine board. Scrub to tick 15: five tiles scarred. Scrub to tick 30: twelve tiles scarred. The accumulation of scars IS the battle's spatial narrative.

**Heat map derived from damage:**
The Inspector could auto-generate a "Combat Density" overlay from damage state data — a translucent red gradient over areas with the most combat events. This is not the damage itself but a derived analytical layer, available only in the Inspector's analytical toolkit.

**Decision trace annotation:**
When inspecting a unit's decision at tick N, the Inspector could highlight which nearby damaged tiles the unit could "see" in its context window. A scout that moved AWAY from damaged tiles might have been using damage as a fear signal (if rules include "avoid recent combat zones"). This makes damage states gameplay-relevant even without mechanical effects.

---

## The Signal Propagation Question

Should tile damage affect signal propagation? This is a major design axis:

### Sub-option: Damage Is Purely Visual
Damaged tiles have zero gameplay effect. They're narrative texture, not mechanics. The board state is determined entirely by unit positions and context windows, never by terrain state.

**Argument for:** Keeps the game about information architecture, not terrain management. The player's attention should be on agents, not ground.

### Sub-option: Damage Creates Signal Noise
Damaged tiles emit low-level "interference" signals that can enter nearby units' context windows — essentially, the destruction generates noise. A unit standing on a devastated tile receives 1 extra noise entry per tick in its context window, representing the chaotic environment.

**Argument for:** Creates a mechanical consequence for concentrated fighting. Encourages spreading combat across the board. Makes the "scorched earth" strategy have a real cost.

**Argument against:** Adds a terrain management layer that competes with the core information architecture mechanic. Could feel unfair — "I lost because of tile damage I couldn't control."

### Sub-option: Damage Blocks Signal Paths
Devastated tiles (Option C, level 3 only) block signal propagation — signals can't pass through a tile that's been completely destroyed. This creates dynamic obstacles during battle.

**Argument for:** Creates emergent terrain, making each battle unique. Forces adaptive signal routing.

**Argument against:** Too much mechanical weight on a system that should be purely aesthetic. Changes the game's core identity from "information architecture" to "information architecture + terrain management."

**Recommendation for Robot Uprising:** Start with **purely visual** damage. The game is about agent configuration, not terrain. If playtesting reveals that the visual damage naturally teaches players to think about spatial patterns, consider adding the "noise" variant as an advanced campaign mechanic (Mission 8+), but never the blocking variant.

---

## Player Journeys

### Journey: Sofia, 28, UX Designer, First Strategy Game

**Context:** Mission 2 (Ifugao Rice Terraces). She's just learned context windows in Mission 1 and is now configuring her first hooks. She has 2 pre-placed scouts and 1 striker. The enemy has 3 enemy strikers advancing from the east.

**Minute 0:00 — The Calm Before**
Sofia hits EXECUTE. The sealed watch begins. The 8×8 rice terrace board fills the screen. Water shimmers on every tile — slow, peaceful. Green data-lights pulse left-to-right across the ancient stone. Her two scouts (👁) sit at C3 and E5. Her striker (⚔) waits at D4. The world is pristine.

The tick clock shows 8 horizontal pips at the top. Pip 1 lights up. Tick 1 resolves — her scouts move outward, perception radii sweeping the terraces. No contact yet. The terraces breathe.

**Minute 0:15 — First Contact**
Tick 4. Scout at E5 spots an enemy striker (🤖) entering E7. The green signal flash fires — a bright line from E5 to D4 (scout to striker, channel "threat-alert"). Sofia's striker receives the signal. She watches the tiny buffer bar under the striker's icon fill by one pip.

**Minute 0:25 — First Blood**
Tick 6. The enemy striker at E7 has moved to E6, adjacent to Sofia's scout at E5. One-shot-one-kill. The red flash fires — 100ms of angry crimson across E5 and E6. Sofia flinches.

Then: the rice terrace tile at E5 begins to change. The red flash fades and something new happens — concentric ripples spread across the water surface. Tiny rings expanding outward from where her scout just died, like a stone dropped into a flooded paddy. The clean horizontal terrace lines are disturbed. Over the next 3 ticks, the ripples settle. But when the water calms, Sofia notices: one of the three green data-lights on E5 is now amber. Flickering. Not pulsing in rhythm with the others. And there's a hairline crack in the terrace stone — barely visible, a single pixel of darkness cutting across the surface.

Her scout is gone. The tile remembers.

**Minute 0:40 — The Scarred Board**
By tick 12, Sofia has lost both scouts. Tiles E5 and C4 both carry subtle scars — amber data-lights, hairline cracks, slightly dimmer water shimmer. Her striker at D4 is still alive, flanked by damaged terraces on both sides. The visual composition is striking: the center of the board looks like a battlefield. The edges are pristine, still breathing peacefully. The contrast tells the story of the battle's flow without any UI overlay.

Sofia's striker engages the first enemy at D5 — red flash, and now D5's terrace cracks too. Three scarred tiles in a line: C4, D5, E5. The diagonal line of damage reads like a battle front. Sofia doesn't know the word "engagement zone" but she can SEE it on the board.

**Minute 1:00 — Inspector Discovery**
The battle ends (she lost). Inspector loads. Sofia scrubs the timeline back to tick 1 — the board is pristine. She scrubs forward slowly. Tick 6 — E5's ripples appear. She'd missed the ripples during the heat of the sealed watch, but in the Inspector's slow scrub, they're beautiful and melancholic. She scrubs to tick 12 — three scarred tiles tell the whole story. She clicks on E5 and sees her scout's final context window state. The scar on the tile beneath makes the moment feel weighted, consequential.

**What she learned:** Combat leaves marks. The board isn't disposable — it's a crime scene. When she retries Mission 2, she'll look at where the scars form and think about positioning differently.

**UI Annotations:**
- Tile ripple effect: 3-4 concentric pixel rings expanding at 1 pixel/tick from combat point
- Amber data-light: warm #FFB347, double pulse speed (0.5 Hz), permanently replacing one green light
- Hairline crack: single pixel line (#2A1810) cutting diagonally across rows 5-6
- Inspector timeline scrub: tile states interpolate smoothly as the player scrubs, damage appearing/disappearing at exact ticks

---

### Journey: Marcus, 34, Software Engineer, Factorio Veteran (800 hours)

**Context:** Mission 7 (Cebu Urban, first Command agent mission). Marcus has a complex factory setup with 2 blueprints producing scouts and strikers, plus a Command agent and a Relay network. The enemy has multiple spawners. This is a long battle — 40+ ticks.

**Minute 0:00 — Factory Online**
Marcus hits EXECUTE. The Cebu city board loads — neon signs flicker in slow rhythm across the urban tiles. His factory pulses at the bottom-left corner. The conveyor belt preview from the plan screen is now live: Scout blueprint first, then Striker, then Scout again.

The city tiles are dense with detail. Every tile has at least one neon element — magenta signs, cyan data streams, gold price tickers. The concrete is dark grey with visible panel lines. Marcus appreciates the pixel work. It looks like a cyberpunk night market compressed to 64×32.

**Minute 0:30 — The Northern Skirmish**
Ticks 8-15: a cluster of engagements in the northern tiles (row 7-8). Three combats in quick succession. Marcus watches the neon die:

Tile B8 — red flash, a scout falls. The neon sign on B8 shatters. What was a smooth magenta line becomes a fragmented stutter — lit, dark, lit, dark, lit. The smooth breath becomes a broken gasp. A spray of sparks (2 bright orange pixels) cascades down from the broken neon, falling through the tile like rain, extinguishing before they reach the wall face. As the sparks fade, Marcus sees: a crack in the concrete. One neon segment permanently arrhythmic. Exposed wiring — a 2-pixel hot orange line where clean infrastructure used to be.

Tile C8 — another engagement two ticks later. Same sequence: red flash, spark shower, settling into scar. Now B8 and C8 are both scarred. Two broken neon signs next to each other. The street feels dangerous — the cyberpunk market took shrapnel.

Tile B7 — a third combat. Now there's a triangle of damaged tiles in the corner. The contrast with the pristine southern tiles is stark. Marcus's clean factory area at A1-B2 still glows with healthy neon. The northern engagement zone looks like a different city.

**Minute 1:00 — Reading the Damage Map**
By tick 25, Marcus has fought across most of the board. Eight tiles carry scars. He can READ the battle just from the tile states:
- Northern cluster (B7, B8, C8): early skirmish, his scouts ran into the first wave
- Center line (D4, E4, E5): the main engagement, where his striker line met the enemy advance
- Eastern pocket (G3): a lone engagement — an enemy scout slipped through and hit his relay

The damaged tiles form a narrative. Marcus, a Factorio player, sees this as a production efficiency map: "my defensive line held in the center but leaked on the east flank." The visual information is the same kind of pattern recognition he uses when looking at Factorio factory throughput — where are the bottlenecks, where did the system fail?

**Minute 1:30 — Inspector Forensics**
In the Inspector, Marcus enables the "Battle Scar Overlay" toggle in the sidebar. The scrubber advances tick by tick, and he watches the scars accumulate like a time-lapse. When he pauses at tick 15, the northern triangle is visible but the center is pristine — this tells him the enemy's opening push was northwest, not central. He adjusts his mental model. He scrubs to tick 25 — now the center is scarred too, the second wave. Two pushes, two engagement zones, readable from tile scars alone.

He clicks on tile E4 — the most heavily-scarred city tile, with two shattered neon segments and a prominent concrete crack. Two combat events on the same tile. The Inspector shows: tick 18, his striker eliminated an enemy; tick 22, an enemy striker eliminated his striker on the same tile. The tile's double scar is a memorial to a bitter exchange.

**What he learned:** The damage map is a free analytical tool. He didn't need to click anything — the board SHOWED him where his defensive configuration failed. In Mission 8, he'll use damage patterns from early ticks to decide whether to adjust his factory's blueprint priority mid-battle (if the Command agent's "reroute" skill allows it).

**UI Annotations:**
- Neon shatter: smooth neon line (#FF6BCA) fragments into alternating lit/dark pixels
- Spark cascade: 2-3 bright pixels (#FF9F1C, #FFFFFF) descend at 1px/tick over 2-3 ticks
- Concrete crack: 3px diagonal line (#1A1A1A) across rows 5-7
- Exposed wiring: 2px hot orange (#FF6B35) with 1px white spark every 2 seconds
- Double-scar tile: second combat event on same tile adds additional broken neon + wider crack, not replaying the same damage
- Inspector "Battle Scar Overlay" toggle: sidebar checkbox, when enabled adds a red-heat gradient layer proportional to combat event count per tile

---

### Journey: Kai, 16, Twitch Streamer, Into the Breach Fan

**Context:** Mission 9 (Mindanao Jungle, late-game full factory). Kai is streaming to 200 viewers. He's built an elaborate hook network with 4 relay units compressing and routing intelligence across the board. The enemy factory is pumping out units fast.

**Minute 0:00 — "Chat, This Config Is Either Genius or Garbage"**
Kai hits EXECUTE with zero confidence. His chat knows — they've watched him rebuild his relay network three times. The Mindanao jungle board loads. Dense canopy tiles, bamboo accents, orchid dots. Everything is green and alive. His factory hums at the south edge. Enemy spawner pulses red at the north.

**Minute 0:20 — "THEY'RE EVERYWHERE"**
Tick 5-10: the enemy rushes south. Kai's scouts detect them but his signal chain is slow (scout → relay → relay → striker, 4 ticks latency). By the time his strikers react, three scouts are already dead.

The jungle SHREDS. Tile after tile — red flash, canopy tears, sunlight punches through. Where there were dense green leaf clusters, warm light shafts (#F5DEB3) now beam down to the forest floor. Bamboo stalks snap. Orchid dots vanish. Each damaged tile is a wound in the canopy, and the cumulative effect is devastating: by tick 10, the northern half of the board has five torn-canopy tiles. Shafts of light cut through the darkness like spotlights on a stage.

Chat reacts: "THE JUNGLE IS DYING" / "look at the map lmao it's deforestation simulator" / "each light shaft is a dead homie RIP"

**Minute 0:45 — "The Last Stand at D4"**
Kai's striker line holds at row 4. The southern jungle is still pristine — canopy intact, orchids blooming, bamboo standing. The northern jungle is scarred — light shafts, broken bamboo, no orchids. The visual contrast IS the battle line. Kai doesn't need a minimap or strategic overlay — the TILES tell him where his defense holds.

Tick 20: his striker at D4 eliminates two enemies in consecutive ticks. D4 and D5 both scar, but they're HIS scars — victories, not losses. He cheers. Chat cheers. The tiles don't know the difference, but the surrounding context does: his units stand on damaged tiles THEY damaged. The striker is a battle-scarred veteran standing in a clearing it made.

**Minute 1:00 — "THE CLIP, CHAT, THE CLIP"**
Tick 28: A dramatic moment. Kai's last relay unit, sitting on a pristine tile at C2 surrounded by four scarred tiles, receives a compressed signal and broadcasts on "emergency-net." Five allies respond simultaneously. The channel wiring lines light up — five green dashed lines converging on C2 from all directions, cutting across damaged tiles. The visual composition: a web of living connections threading through a scarred forest. The relay is the hub. The damaged tiles are the battlefield's memory. The signal lines are the nervous system still firing.

Kai clips it. Chat spams hearts. The 15-second TikTok clip writes itself: the slow pan across scarred jungle tiles, light shafts cutting through what used to be canopy, then the signal burst — green lines lacing through the destruction like new growth after a fire.

**What he learned:** The damaged tiles created a visual narrative his audience could follow without understanding the mechanics. "Tiles with light = where fighting happened" is instantly readable even for viewers who've never played the game. The contrast between pristine and damaged tiles IS the story.

**UI Annotations:**
- Canopy tear: leaf cluster replaced by 4-5 pixel warm light shaft (#F5DEB3) with slow 1px drift animation (8s cycle, moving sun)
- Broken bamboo: 2px stalk with 1px gap at midpoint, upper segment tilted 1px
- Missing orchid: warm-toned dot simply absent, slightly darker green in its place
- Five-tile damage spread: cumulative visual of torn canopy creating a "deforested zone" visible at board scale
- Signal lines over damaged tiles: green dashed lines (#00FF87) render on overlay layer, clearly visible against warm light shafts
- The "hub and spokes" composition: relay at center of damage radiating signal lines, a moment of connection amid destruction

---

## The TikTok Clip

**The clip that sells this feature:** A time-lapse of a Taal volcano battle. The obsidian board starts smooth, dark, with subtle ember accents. Over 30 ticks (30 seconds at 1x speed, compressed to 10 seconds in the clip), combat cracks the surface open. Lava seeps through — first one tile, then three, then eight. By the end, the board is a fractured volcanic landscape with molten orange glowing through a web of cracks, steam vents puffing on the wall faces, and units still fighting among the geological chaos. The final frame: a lone striker standing on a tile so damaged it's more lava than rock, surrounded by the ghosts of a battle that literally broke the earth open. Caption: "my battlefield by tick 30."

---

## Recommendation Ranking

For Robot Uprising's identity and constraints:

1. **Option E (Hybrid Memory)** — Best overall. Dramatic moment + permanent subtle history. The subtle scars work perfectly with the Inspector's analytical role. Implementation cost is highest but the payoff in visual storytelling is enormous.

2. **Option B (Single Scar)** — Strong runner-up. Simpler to implement, still provides readable battle history. If Option E proves too expensive, this captures 80% of the value.

3. **Option D (Fading Residue)** — Best for "pure Into the Breach" aesthetic. If the team decides board readability trumps all, this provides dramatic combat moments without any permanent visual cost.

4. **Option A (No Scars)** — Safe fallback. Provably works (Into the Breach shipped it). Loses the environmental storytelling but keeps the board maximally clean.

5. **Option C (Progressive Scarring)** — Interesting but likely unnecessary. The devastated state would rarely trigger in one-shot-one-kill combat on an 8×8 board, making 10 of the 15 extra sprites wasted work.

---

## New Aspects Discovered

- **6.01a-iii-a — Damage state persistence across retries:** When a player retries the same mission, should the board start pristine or carry scars from the previous attempt? "Haunted tiles" as a visual record of past failures vs. clean slate each time.
- **6.01a-iii-b — Damage states as Inspector filter layer:** The "Combat Density" heat map derived from damage tiles, designed as a toggle overlay in the Inspector sidebar. Full specification of the overlay visual (gradient, opacity, legend).
- **6.01a-iii-c — Asymmetric damage for player vs. enemy kills:** Should a tile scarred by a player kill look different from a tile scarred by an enemy kill? Blue-tinted damage vs. red-tinted damage as instant friend/foe battlefield forensics.
- **6.01a-iii-d — Damage audio coupling:** What SOUNDS accompany tile damage transitions? The crack of terrace stone, the sputter of dying neon, the hiss of Taal steam vents, the rustle of falling jungle canopy. Interaction with 6.01a-ix (animation-audio coupling).
- **6.01a-iii-e — Tile repair as late-game Specialist skill:** A Specialist ability ("restore") that repairs a damaged tile to pristine state, removing the visual scar. Strategic use: cleaning up noise from the damage-as-signal-noise sub-option, or simply aesthetic satisfaction of "healing" the battlefield.
