# 6.01a-iii-c — Asymmetric Tile Damage: Friend vs. Foe Battlefield Forensics

## The Question: Should the World Know Who Won?

The parent analysis (6.01a-iii) established that tiles scar when combat happens. The Inspector heat map (6.01a-iii-b) explored a Friend vs. Foe "Kill Map" overlay — a diagnostic tool showing cyan for player kills and magenta for losses, available only in the analytical debrief. But that overlay is an *annotation*. This aspect asks the deeper question: should the **tile scar itself** look different depending on who won the fight?

When a striker eliminates an enemy on a rice terrace tile, the stone cracks and a data-light goes amber. When an enemy striker eliminates YOUR scout on the same biome, the stone also cracks and a data-light goes amber. The damage looks identical. The tile doesn't know — or doesn't care — who won. It just records that violence happened.

But what if it did know? What if player kills left blue-tinted scars and enemy kills left red-tinted scars? The board becomes a forensic crime scene readable at a glance: "the blue zone is where I was winning, the red zone is where I was dying." No overlay needed. No Inspector toggle. The tiles *themselves* are the battle report.

This is the difference between a bullet hole in a wall (symmetric — just says "a gun fired here") and a police chalk outline (asymmetric — says "someone fell here"). The question is whether Robot Uprising's battlefield should be a wall with holes or a crime scene with outlines.

---

## Design Axis: How Much Asymmetry?

### Option A: "Agnostic Scars" — Symmetric Damage (Status Quo)

All combat events produce identical tile damage regardless of who won. A tile scarred by a player kill is visually indistinguishable from a tile scarred by an enemy kill. The board records WHERE combat happened but not WHO prevailed.

**The philosophy:** The world is neutral. It doesn't take sides. Damage is damage. The terrain doesn't celebrate your victories or mourn your losses — it just registers impact.

**Strengths:**
- Simplest implementation — one damage sprite per biome, no variant branching.
- Maximum visual consistency. The player learns one damage vocabulary: "cracked = combat happened."
- The Inspector's Kill Map (6.01a-iii-b, Metric D) already provides the friend/foe layer as an opt-in analytical tool. No need to bake it into the base tile.
- Avoids emotional manipulation. The board isn't judging the player.
- Matches Into the Breach — which has no terrain damage at all, let alone asymmetric damage.

**Weaknesses:**
- Misses a free information channel. The sealed watch is read-only — no tools, no overlays. Asymmetric scars would give the player spatial intelligence DURING the watch, not just after.
- The Inspector's Kill Map requires entering the analytical phase and toggling an overlay. Asymmetric scars are instant, ambient, zero-effort.
- "Combat happened here" is less useful than "I won here" or "I lost here" for real-time reading.

---

### Option B: "The Crime Scene" — Full Color-Tinted Asymmetric Scars

Player kills produce **cool-tinted** (cyan-blue) tile scars. Enemy kills produce **warm-tinted** (red-amber) tile scars. The tint is a color wash over the entire scar — the crack, the broken neon, the dead bioluminescence — everything shifts toward the winning side's palette.

**Per-biome asymmetric damage:**

| Biome | Player Kill Scar (Cool) | Enemy Kill Scar (Warm) |
|-------|------------------------|----------------------|
| **Ifugao Terraces** | Cracked stone with data-lights shifting to **cool cyan** (#00C9DB) instead of amber. Water shimmer gains a blue tint — the paddy glows with a cold light, like moonlight on water. The crack itself has a faint cyan edge-glow, as if the AI's presence lingers in the wound. | Cracked stone with data-lights shifting to **angry red** (#FF3B30). Water drains but the residual moisture catches a warm red reflection. The crack edge glows ember-orange — heat, not cold. The terrace looks burned, not broken. |
| **Siquijor Mystic** | Bioluminescence doesn't die — it **shifts blue**. The organisms on the tile change from their normal cyan-green to a deep ocean blue (#1E90FF), pulsing in a tighter, more confident rhythm. The coral accent shifts to silver-blue. The tile looks empowered, not damaged. "Something powerful happened here." | Bioluminescence **dies to red embers**. The organisms flicker between dim red and dark — not the healthy cyan-green rhythm, but a dying heartbeat in warm tones. Coral turns ashen with a faint red undertone. The volcanic rock surface shows heat stress (hairline veins of orange). "Something was killed here." |
| **Palawan Jungle** | Canopy torn but the light shaft through the gap has a **cool quality** — silver-blue (#B0C4DE) rather than warm tropical gold. The exposed forest floor shows machine-precise cut edges on the broken leaves — clean, surgical. Bamboo snapped cleanly at right angles. The wound is clinical. | Canopy torn with **warm, chaotic** light — the gap edges are charred (#8B4513), the light is harsh yellow-orange, smoke-pixel haze drifts upward for 2 ticks after the event. Bamboo splintered raggedly. The orchid didn't just disappear — it's blackened. The wound is violent. |
| **Cebu/Manila City** | Neon **rewires to blue**. The shattered sign reassembles into a single cyan bar — not the original sign, but a new cold glow that says "I own this street now." Concrete crack fills with a blue data-light strip — like fiber optic cable exposed in the broken pavement. The city tile looks *upgraded*, not damaged. | Neon **dies to red static**. The shattered sign fragments flicker angry red — not a new pattern, just dying in a different color. Exposed wiring sparks orange. The concrete crack is dark and empty — no data, just destruction. Graffiti-like red pixel smear across the wall face (1-2 pixels of red (#FF2D2D) where the neon used to be). |
| **Taal Volcanic** | Obsidian crack reveals **blue crystalline interior** — not lava but something colder. A cyan-blue mineral (#4169E1) gleams through the crack, like discovering a geode inside the volcanic rock. The steam vent shifts to a cool mist. The tile looks like it was broken open to reveal treasure. | Obsidian crack reveals **active magma** — the standard lava orange (#FF4500), hotter and angrier than the normal Taal palette. Steam vent is a hot jet, not gentle mist. The tile looks like the volcano is actively erupting from the wound. More ember pixels than normal damage. |

**The key insight: player kills don't just look "blue" — they look CONTROLLED. Enemy kills don't just look "red" — they look CHAOTIC.** The asymmetry isn't just a color swap. It's a visual vocabulary of precision vs. violence, mastery vs. defeat.

Player kill scars suggest the AI (you) left its mark: clean cuts, data in the wounds, rewired infrastructure, cold crystalline beauty. Enemy kill scars suggest the enemy left its mark: heat, chaos, destruction without purpose, dying systems.

**Transition animation differences:**

| Event Type | Flash | Crossfade Character |
|-----------|-------|-------------------|
| **Player kill** | Blue-white flash (100ms, #80D8FF) — bright but cold, like a camera flash | The 500ms crossfade radiates outward in a **precise circle** — uniform wavefront, like a shockwave in a physics simulation. Mathematically clean. |
| **Enemy kill** | Red flash (100ms, #FF3B30) — hot and angry, existing system | The 500ms crossfade radiates outward in an **irregular pattern** — some pixels change before others, edges are ragged, like fire spreading. Organic and chaotic. |

**Strengths:**
- **Instant battlefield forensics during sealed watch.** The player can see "I'm winning in the west (blue scars) and losing in the east (red scars)" without ANY overlay or tool. The information is baked into the terrain.
- **Doubles the visual vocabulary.** The parent analysis (6.01a-iii) gave us 5 biome damage states. Asymmetric damage gives us 10 — 5 cool + 5 warm. Each tells a distinct story.
- **Emotional resonance.** Blue scars feel GOOD — they're trophies. Red scars feel BAD — they're wounds. The player's emotional relationship to different parts of the board becomes spatially encoded.
- **Inspector redundancy.** The Kill Map overlay (6.01a-iii-b, Metric D) becomes a *quantitative* layer on top of the *qualitative* tile scars. The scars tell you blue/red; the Kill Map tells you HOW MUCH blue/red. Complementary, not redundant.
- **Streamer gold.** A board with blue western tiles and red eastern tiles is instantly readable on a stream — even viewers who've never played can see "blue = winning, red = losing."
- **The city neon rewiring** — neon that reassembles into a different pattern after a player kill — is a standout aesthetic moment. The AI doesn't just destroy; it remakes.

**Weaknesses:**
- **10 damage sprites instead of 5.** Double the asset work for tile damage.
- **Color collision with existing systems.** Cool cyan/blue scars overlap with the perception radius color (cyan #00E5FF) and tagging color. The red scars overlap with the combat flash. Careful palette separation needed.
- **Cognitive overhead increase.** Players must now learn TWO damage vocabularies: "cool scar = I won" AND "warm scar = I lost." The parent analysis's greatest strength was simplicity — "cracked = combat." Adding a friend/foe axis increases the learning curve.
- **Colorblind concerns.** Red-blue is the WORST color pair for deuteranopia and protanopia (the two most common forms of color blindness, affecting ~8% of men). Deuteranopic players would see both scars as similar brownish-yellow tones. **This is a serious accessibility problem.**
- **Emotional asymmetry may not be wanted.** Some players may not want the board judging their performance. A red-scarred area screams "YOU FAILED HERE" — potentially demoralizing for new or struggling players. Contrast with the neutral scars, which carry no emotional valence.
- **Contested tiles.** If both a player kill AND an enemy kill happen on the same tile, what color is the scar? Mixed? Layered? The first event's color? The most recent? This creates ambiguity.

---

### Option C: "The Tint" — Subtle Color Temperature Shift Only

The scar itself is identical regardless of who won. But the scar has a subtle **color temperature shift**: player kills are 10% cooler (bluer), enemy kills are 10% warmer (redder). The base scar pattern — crack shape, broken neon pattern, dead bioluminescence layout — is the same. Only the overall hue shifts slightly.

**Implementation:** Apply a post-processing color matrix to the scar sprite:
- Player kill: multiply by `[0.9, 0.95, 1.1, 1.0]` (slightly blue shift)
- Enemy kill: multiply by `[1.1, 0.95, 0.9, 1.0]` (slightly warm shift)

At tile scale in isometric view, this produces a barely-visible tint difference. Two adjacent scars — one player kill, one enemy kill — would show the contrast more clearly. A cluster of same-type scars becomes more legible as the color bias accumulates.

**Strengths:**
- **Minimal asset cost.** Same 5 damage sprites, different color matrix applied at render time.
- **Graceful degradation.** If the player can't distinguish the tint (colorblind, small screen, not paying attention), the scar still communicates "combat happened." The asymmetry is a bonus layer, not required information.
- **Avoids the accessibility catastrophe** of Option B. The tint is so subtle that colorblind players lose almost nothing — the base scar is still fully readable.
- **No emotional punishment.** The warm tint on an enemy kill is NOT obviously "red = bad." It's warm. Cozy, even. The emotional valence is ambiguous enough that players won't feel judged.
- **Contested tiles work naturally.** Two overlapping tints average out to neutral — a tile with both a player kill and an enemy kill looks like a standard neutral scar. This is semantically correct: a contested tile IS neutral.

**Weaknesses:**
- **Too subtle to matter.** If the tint is barely visible at tile scale, why bother? The feature might be imperceptible to most players, delivering none of the forensic value that motivated the design.
- **No sealed-watch value.** During the fast-paced sealed watch (1 second per tick), a 10% color temperature shift is invisible. The feature only matters in the Inspector, where the Kill Map overlay already provides better friend/foe visualization.
- **The "uncanny valley" of visual features.** Subtle enough that some players notice it subconsciously without understanding it. "Why does the west side of the board feel different from the east side?" This could be good (environmental storytelling) or bad (unexplained visual inconsistency).

---

### Option D: "The Aftermath" — Scar Shape Varies, Not Color

The scar's COLOR is identical regardless of who won. But the scar's SHAPE differs:

- **Player kills** leave **clean, geometric scars.** Straight-line cracks. Precise breaks. The damage looks engineered — the AI broke this tile with calculated force.
- **Enemy kills** leave **chaotic, organic scars.** Jagged cracks. Splintered edges. The damage looks violent — brute force, no precision.

**Per-biome shape differentiation:**

| Biome | Player Kill Shape | Enemy Kill Shape |
|-------|------------------|-----------------|
| **Terraces** | Crack follows the terrace's horizontal line — clean, aligned with the architecture. Water drains neatly along the crack channel. | Crack cuts diagonally across the terrace — disruptive, ignoring the structure. Water pools chaotically in broken stone. |
| **Siquijor** | Bioluminescent organisms dim in a **circular** pattern — a precise radius of darkness. Clean-edged dark zone. | Bioluminescent organisms dim in a **splatter** pattern — irregular dark patches scattered across the tile. |
| **Jungle** | Canopy gap is **rectangular** — a clean cut in the foliage, like a surgical excision. Sharp leaf edges. | Canopy gap is **ragged** — torn edges, drooping branches, leaf debris scattered on the floor. |
| **City** | Neon break is at a **joint** — the sign broke where it was welded, a clean structural failure. | Neon break is **mid-span** — the sign shattered randomly, fragments scattered. |
| **Taal** | Crack is a single **straight line** — a geological fault, precise. | Cracks **radiate from a central impact point** — a starburst pattern, explosive. |

**Strengths:**
- **No color collision.** The differentiation is purely geometric, avoiding all colorblind and palette-overlap concerns.
- **Semantically rich.** The "clean vs. chaotic" vocabulary reinforces the game's core fantasy: you are a PRECISE AI. Your kills are evidence of calculated intelligence. Enemy kills are evidence of brute aggression. The board's scar shapes tell you whether the AI (you) or the enemy dominated each area.
- **10 shape variants** (5 biomes × 2 shapes) instead of 10 color variants. Same asset count, but shape is more universally readable than color.
- **Works at all scales.** At 100% zoom, the shape difference (straight vs. jagged crack) is visible even on small tiles. At 150% zoom, it's unmistakable.
- **Contested tiles.** A tile with both types of damage shows BOTH shapes overlaid — a straight crack crossed by a jagged one creates a distinctive "X" pattern that screams "contested ground." This happens naturally without any special-case logic.

**Weaknesses:**
- **Harder to read at a glance than color.** Color differentiation (blue vs. red) is processed pre-attentively — the brain categorizes colors before conscious awareness. Shape differentiation (straight vs. jagged) requires more attentional processing. During the sealed watch at 1 tick per second, shape differences may be too subtle.
- **10 damage sprites.** Same asset cost as Option B.
- **"Clean" player scars might feel less satisfying.** A straight-line crack is geometrically elegant but visually boring compared to a jagged starburst. The enemy kill scars might actually look MORE impressive, inadvertently making losses feel more dramatic than victories.
- **Learning curve.** "Straight = mine, jagged = theirs" is less intuitive than "blue = mine, red = theirs." Requires teaching.

---

### Option E: "The Signature" — Hybrid Color + Shape (RECOMMENDED)

Combine Options B and D: player kills are **cool-tinted AND geometrically clean**. Enemy kills are **warm-tinted AND geometrically chaotic**. The two channels reinforce each other, creating redundant encoding that works for sighted, colorblind, and attentive-vs-glancing players.

**But with a critical modification for accessibility:** The cool/warm tint is NOT red-vs-blue. Instead:

- **Player kills: cyan (#00BCD4) tint + clean geometry.** Cyan is distinguishable from red/orange across all common forms of color blindness (it maintains its blue channel under protanopia and deuteranopia). It also aligns with the game's existing "player color" associations (cyan tagging, cyan perception radii).
- **Enemy kills: orange (#FF6D00) tint + chaotic geometry.** Orange is the existing enemy color vocabulary (red flash → orange damage). It reads as "warm" without the accessibility problems of pure red. Orange and cyan maintain distinct luminance values under all colorblind simulations.

This cyan/orange pairing:
- Works under protanopia (cyan → grayish-blue, orange → dark yellow — distinct)
- Works under deuteranopia (cyan → light blue-grey, orange → brownish-yellow — distinct)
- Works under tritanopia (cyan → desaturated teal, orange → pinkish — distinct)
- Maintains luminance contrast in full achromatopsia (cyan is lighter, orange is medium)

**And the shape channel provides full redundancy:** even if the color is completely invisible, straight-vs-jagged tells the story.

**Per-biome "Signature" damage:**

| Biome | Player Kill Signature | Enemy Kill Signature |
|-------|----------------------|---------------------|
| **Ifugao Terraces** | Clean horizontal crack along the terrace line. Data-light shifts to **steady cyan** pulse. Water gains a cool silver-blue reflection, still and glassy — a frozen moment of precision. The wound looks DELIBERATE, like the AI cut exactly here for a reason. | Diagonal jagged crack cutting across the terrace architecture. Data-light flickers **amber-orange**, arrhythmic and panicked. Water reflects warm disturbed amber. Terrace stone has micro-fractures radiating from the main crack — collateral damage. |
| **Siquijor Mystic** | Circular bioluminescent shift — organisms in a perfect radius shift from cyan-green to **deep ocean blue** (#0077BE), pulsing in precise unison. Coral turns steel-blue. The tile looks like it entered a different frequency — empowered, not damaged. | Splatter pattern of dying organisms — irregular patches of **amber-red** (#CD5C5C) bioluminescence mixed with dark. Coral ashen with warm vein. Root shadows freeze mid-sway then wilt. The tile looks poisoned. |
| **Palawan Jungle** | Rectangular canopy excision. Light shaft is **silver-blue** (#B0C4DE). Cut edges are precise. Bamboo snapped at the joint, clean break. Forest floor visible beneath is undisturbed — the violence was above. | Ragged canopy tear. Light shaft is **harsh amber** (#DAA520). Charred edges, leaf debris on forest floor. Bamboo splintered mid-stalk, fibrous ends. Smoke-haze pixel rises for 2 ticks. Everything below the tear is disturbed. |
| **Cebu/Manila City** | Neon break at the joint, but the severed end **rewires to cyan** — a clean new light emerges from the break, like a circuit finding a new path. Concrete crack has a faint cyan data-line in the gap (1px #00BCD4). | Neon **shatters to orange-red static** — fragments flicker with dying orange sparks. Concrete crack is dark and empty. Exposed wiring sparks amber. A 2px red-orange pixel smear on the wall face — scorched. |
| **Taal Volcanic** | Single straight fault line in obsidian. Through the crack: **blue crystal** (#4682B4) glints — something cold and precious beneath the volcanic surface. Steam vent is cool mist, almost beautiful. | Starburst crack radiating from impact point. Through the cracks: **active magma** (#FF4500), aggressive orange glow. Steam vent is a hot pressurized jet. Extra ember pixels. The volcano is winning. |

**Contested tile treatment (both player and enemy kills on same tile):**

When a tile accumulates both types of scars, the TWO scar shapes overlay physically. A clean horizontal crack (player kill) crossed by a jagged diagonal crack (enemy kill) creates a visible **"battlefield junction"** — the organized meets the chaotic. The color tints blend on the overlap zone, producing a neutral grey-brown where cyan meets orange (these are roughly complementary, and their blend desaturates). The contested tile reads as: "both sides fought here, and neither's signature dominates."

If the SAME tile has 2+ player kills and 1 enemy kill, the cyan tint dominates (weighted by count). Vice versa for enemy-dominated tiles. The tile's overall color temperature shifts toward whoever caused more damage there — a natural "territory control" signal.

**Strengths:**
- **Triple redundancy.** Color + shape + animation character. Any one channel alone tells the friend/foe story. All three together are unmistakable.
- **Accessible.** Cyan/orange works across all colorblind modes. Shape differentiation provides full backup. No player loses the forensic information.
- **Enriches every phase.** Sealed watch: ambient spatial forensics via tile tints and crack shapes. Inspector: the tile scars provide qualitative context for the Kill Map overlay's quantitative data. Plan phase: ghost scars (per 6.01a-iii-a) carry their friend/foe tint into the next attempt, telling the player "you were winning HERE last time."
- **The city neon rewiring moment.** When a player kills an enemy on a Cebu tile and the severed neon end *rewires to cyan* — finding a new circuit path through the broken infrastructure — that is a signature aesthetic moment. The AI doesn't just destroy; it repurposes. It leaves the world changed but functional in a new way.
- **Contested tiles are visually compelling.** The "junction" pattern — clean cracks meeting chaotic cracks, cyan bleeding into orange — creates a distinctive third visual state that communicates "this ground was fought over" without any special-case logic.
- **Emotional calibration.** Cyan scars feel like trophies ("I did that"). Orange scars feel like warnings ("danger zone"). The emotional geography of the board becomes spatially encoded and readable.

**Weaknesses:**
- **10 damage sprite variants.** 5 biomes × 2 scar types. Significant art investment.
- **Transition animation complexity.** Two different crossfade characters (precise circle vs. irregular spread) doubles the animation logic.
- **Cognitive load for new players.** In Missions 1-2 where the player is just learning that tiles CAN scar, adding friend/foe differentiation may be overwhelming. A player might notice "some scars look different" without understanding why.
- **Palette tension with Inspector Kill Map.** The Kill Map uses cyan and magenta for its friend/foe overlay. If tile scars use cyan and orange, the two systems use DIFFERENT color vocabularies for the same concept. The player must learn: "on tiles, cyan/orange = friend/foe. In the Kill Map overlay, cyan/magenta = friend/foe." This inconsistency could confuse. **Mitigation:** Align the Kill Map overlay to cyan/orange to match. This sacrifices the magenta's high contrast but creates unified vocabulary.

---

## Interaction Effects

### With Tile Damage Persistence (6.01a-iii-a)

The Fading Memory model (recommended in 6.01a-iii-a) carries scars across retries at 60% and 30% opacity. If those scars are asymmetrically tinted, the ghost scars on retry become **strategic intelligence**:

- "Last attempt, I had cyan scars in the northwest (I was winning there) and orange scars in the center (I was losing). This attempt, I'll try to hold the center."
- The color of ghost scars tells the player WHERE they were succeeding vs. failing in the previous attempt — a free spatial strategy hint.

At 30% opacity, the tint is very subtle. But it's there. A 30% cyan ghost on a pristine tile whispers "you won here before." A 30% orange ghost whispers "danger."

### With the Inspector Kill Map (6.01a-iii-b, Metric D)

The Kill Map overlay shows quantitative friend/foe data (how MANY events). The tile scars show qualitative friend/foe data (which SIDE's signature is on each tile). Together:

- A tile with a single cyan scar (player kill) + the Kill Map showing it as a pure cyan tile = redundant confirmation. "One player kill here."
- A tile with overlapping cyan/orange scars (contested) + the Kill Map showing a 60/40 split = the Kill Map quantifies what the scars show qualitatively.
- A tile with no scar (no combat) + the Kill Map showing nothing = both systems agree.

The two layers are complementary, not redundant. The tile scar is ambient (always visible during sealed watch). The Kill Map is deliberate (toggled on in Inspector). They serve different moments of the player experience.

### With Sealed Watch Readability

During the sealed watch — no tools, no overlays, no pause — the asymmetric tile scars are the ONLY spatial intelligence layer available. The player can't toggle a Kill Map. They can't click to inspect. They can only WATCH. And as combat unfolds, the tiles paint themselves in cyan and orange, building a real-time territory map that the player absorbs passively.

This is enormously valuable. A player watching their sealed watch at 1x speed (1 tick per second) sees:
- Tick 8: blue-white flash at D5, tile scars with cyan tint — "I won that fight."
- Tick 10: red flash at F6, tile scars with orange tint — "I lost that one."
- Tick 15: three orange scars clustered in the northeast — "I'm being overrun there."
- Tick 20: two cyan scars in the center — "My striker line is holding."

By the end of the sealed watch, the board IS a territory map. Blue zones and orange zones. The player enters the Inspector with spatial intelligence already absorbed — the analytical phase STARTS from a position of understanding rather than a blank slate.

### With the Boot Log Narrative

The asymmetric damage reinforces the AI identity. The boot log says "you are an AI." The cyan scars say "your kills look different from enemy kills because YOU are different. You are precise. You are calculated. The enemy is chaotic. Your signature is clean geometry and cold light. Theirs is heat and disorder."

The tile damage literally writes the AI's personality onto the terrain. The world becomes a surface that reflects the identity of whoever last acted on it.

### With EM Emissions (Signal Architecture)

Heavy combat zones with orange (enemy kill) scars are also likely zones where the player's signal architecture failed — units died because they didn't receive intelligence in time, or were stunned by context overload. The orange-tinted scars become a spatial indicator of "my information network's blind spots."

Cyan-scarred zones, conversely, are where the architecture WORKED — units received intelligence, reacted correctly, eliminated threats. The cyan scars are trophies for successful information architecture.

### With the Campaign Map (6.01a-iii-a-iii)

If provinces on the Philippine archipelago show battle scars proportional to difficulty, asymmetric scars add another dimension: a province where the player dominated (mostly cyan scars) could glow cool on the campaign map. A province where the player barely survived (heavily orange-scarred) could glow warm. The archipelago becomes not just a map of "where was hard" but "where was I strong vs. weak."

---

## Player Journeys

### Journey: Sofia, 28, UX Designer, First Strategy Game

**Context:** Mission 3 (Siquijor Mystic Island). Sofia has completed Missions 1-2 and understands basic hook configuration. She has 2 scouts, 1 striker, and the enemy has 3 strikers approaching from the northeast.

**Minute 0:00 — EXECUTE**
Sofia hits EXECUTE. The Siquijor board fills the screen. Volcanic rock, bioluminescent organisms pulsing cyan-green, coral accents in warm pink. Her scouts patrol outward. Tick clock pips fill left to right. The board breathes.

**Minute 0:15 — Her First Kill**
Tick 5. Her striker at D4 moves adjacent to an enemy scout at D5. One-shot-one-kill. A **blue-white flash** fires — cool, bright, like a camera strobe. Sofia blinks. The flash is different from the red flashes she saw in Mission 2 when she LOST units. She doesn't consciously register why yet, but it felt... clinical. Clean.

The tile at D5 transitions. The 500ms crossfade radiates outward in a **precise circle** — a clean wavefront expanding from the center of the tile. The bioluminescent organisms on D5 shift in a perfect radius: from cyan-green to **deep ocean blue** (#0077BE). Not dead — transformed. They pulse in tight, confident unison. The coral accent turns steel-blue. The volcanic rock shows a single straight crack — clean, geometric, aligned with the tile's natural grain.

Sofia thinks: "Ooh, the tile turned blue. That looks kinda cool." She doesn't fully connect "blue = my kill" yet. But the tile looks EMPOWERED, not damaged. It feels like a good thing happened here.

**Minute 0:25 — Her First Loss**
Tick 8. An enemy striker at F6 reaches her scout at E6. She'd forgotten to configure a hook for retreat. Red flash — hot, angry, 100ms of crimson. The familiar death flash from Mission 2.

The tile at E6 transitions. The 500ms crossfade radiates in an **irregular pattern** — pixels changing at different speeds, edges ragged, like fire licking across the surface. The bioluminescent organisms on E6 don't transform — they **die**. Splattered patches of **amber-red** (#CD5C5C) flicker where healthy cyan-green used to be. The coral turns ashen with a warm red vein. Root shadows on the wall face freeze then wilt. The tile looks POISONED.

Sofia notices immediately: "That looks different from D5." D5 is cool blue, confident. E6 is warm, dying, ugly. She doesn't need a tooltip. She doesn't need a tutorial. The TILES are different, and one feels like success and the other feels like failure.

**Minute 0:40 — The Board as Report Card**
Tick 15. Three more combats have resolved. The board now shows:
- **D5:** Blue scar. Her kill. Clean crack, ocean-blue bioluminescence.
- **E3:** Blue scar. Another of her kills. Same clean geometry, blue glow.
- **E6:** Orange scar. Her loss. Chaotic splatter, amber-red dying organisms.
- **F5:** Orange scar. Another loss. Same ragged chaos, warm death glow.
- **E5:** A mixed tile — her striker killed an enemy there, then an enemy killed her striker the next tick. The tile has BOTH a clean straight crack (cyan-tinted) and a jagged diagonal crack (orange-tinted). The two scars cross each other in an X pattern. The color bleeds to a neutral grey where they overlap. Sofia can see at a glance: "this was a contested spot."

Sofia looks at the full board. The west side has two blue tiles. The east side has two orange tiles. One contested tile in the center. Without any overlay, any Inspector tool, any analytical interface, the **terrain is her battle report.** Blue west, orange east, contested center.

"I'm winning on the left and losing on the right," Sofia says to herself. "My hooks send scouts left but not right." She hasn't opened any debrief tool. The tiles told her.

**Minute 1:00 — Inspector Confirmation**
The battle ends (she lost — the eastern push overwhelmed her). In the Inspector, she enables the Kill Map overlay. It confirms what the tiles already showed: cyan wash on the western tiles (her kills), warm wash on the eastern tiles (her losses). But she already KNEW this. The tiles taught her during the sealed watch.

She scrubs back to tick 5 — her first kill. The blue-white flash replays. The precise circular crossfade replays. The ocean-blue bioluminescence blooms. She watches it three times. It's beautiful. She wants MORE blue tiles next time.

**What she learned:** The asymmetric scars taught friend/foe spatial awareness without any tutorial text, overlay, or explicit instruction. "Blue = I won, orange = I lost" is instantly readable through color + shape + emotional resonance. She enters the Inspector already understanding her battle's spatial story — the analytical phase refines an insight she already has rather than teaching from scratch.

**UI Annotations:**
- Blue-white flash: #80D8FF, 100ms, cool and clinical
- Player kill crossfade: precise circular wavefront over 500ms
- Ocean-blue bioluminescence: #0077BE, confident pulse rhythm, clean circular boundary
- Orange-red dying bioluminescence: #CD5C5C, arrhythmic flicker, irregular splatter boundary
- Red flash (enemy kill): existing #FF3B30, 100ms, hot and angry
- Enemy kill crossfade: irregular, fire-like spread over 500ms
- Contested tile: X-pattern where clean and chaotic cracks intersect, desaturated overlap zone

---

### Journey: Marcus, 34, Software Engineer, Factorio Veteran (800 hours)

**Context:** Mission 8 (Bohol Hills). Marcus runs a complex factory with 3 blueprints, 4 channels, and a Command agent. This is a long battle (50+ ticks). He's been iterating for three attempts.

**Minute 0:00 — Ghost Scars from Attempt 2**
Marcus hits EXECUTE. The board loads with the Fading Memory system (6.01a-iii-a): ghost scars from attempt 2 at 60% opacity. But now those ghosts carry COLOR. The northwest ghost scars are 60%-opacity cyan — he was winning there last time. The center ghost scars are 60%-opacity orange — that's where his relay got overwhelmed.

Marcus reads the ghosts in 2 seconds: "Winning northwest, dying center. Let me shore up the center this time." He didn't need to open any history tool. The TINTED GHOSTS are the strategy brief.

**Minute 0:30 — The Turning Tide**
Tick 12-20: Marcus's reinforced center holds. His striker line eliminates three enemies in a row at D4, D5, E5. Three blue-white flashes in quick succession. Three tiles scar with clean cyan-tinted geometry. The bioluminescent organisms (Bohol Hills use Siquijor-adjacent biome) shift to ocean blue in precise circles. The center tiles glow cool — a line of cyan trophies where orange ghosts used to be.

Marcus mutters: "The center is mine now." He can see it physically: the warm orange ghosts from attempt 2 are overlaid by fresh cold cyan scars from attempt 3. The color shift from warm to cool IS the story of his improvement. Last time this area was orange (enemy territory). Now it's cyan (his territory). The tiles track his learning arc in color.

**Minute 1:00 — The Pipeline Through Cool Territory**
Tick 30. Marcus notices something he's never explicitly looked for: his relay at C3 sits on a pristine tile surrounded by cyan-scarred tiles. The relay is in a "friendly" zone — his kills protect it. His signal path runs THROUGH tiles he controls.

Now look at the east side: the enemy pushed and left orange scars at G4, G5, G6. His other relay at F5 sits in an orange zone — enemy kills surround it. That relay is in hostile territory. Its context window is filling with noise from nearby combat.

The asymmetric scars just visualized **signal infrastructure resilience** without any explicit tool. Blue zone = safe for infrastructure. Orange zone = dangerous for infrastructure. Marcus thinks: "I should move my relay from F5 to somewhere blue." He's using the damage color as a *deployment heatmap* — not because the game told him to, but because the visual correlation is obvious.

**Minute 1:30 — Inspector Deep Dive**
In the Inspector, Marcus enables both Battle Scars (showing the asymmetric damage) and the Heat Map (showing density). The layers compose beautifully:
- A cyan-scarred tile with high heat = "I fought hard here AND won." His strong point.
- An orange-scarred tile with high heat = "Heavy fighting where I lost." His vulnerability.
- A cyan-scarred tile with low heat = "One clean kill." Efficiency.
- An orange-scarred tile with low heat = "One loss." A mistake, not a rout.

The Heat Map's warm gradient and the tile scar's color tint create a two-dimensional reading: density (heat) × outcome (scar color). Marcus, a Factorio player, sees this as a bivariate data visualization. Two variables, one board. He takes a screenshot.

**What he learned:** The asymmetric scars create a spatial correlation between "territory control" and "signal infrastructure safety" that no overlay provides as elegantly. The tinted ghost scars from previous attempts function as a free strategy brief. The color shift from orange ghosts to cyan fresh scars is the visual signature of learning.

**UI Annotations:**
- 60% cyan ghost: ocean blue at 60% opacity on volcanic rock — visible as a cool tint on otherwise-dark tile
- 60% orange ghost: amber-red at 60% opacity — visible as a warm tint
- Fresh cyan scar over orange ghost: cool tint overwrites warm tint, creating a visible "territory flip" effect
- Inspector layer composition: tile sprite → damage scar (cyan/orange) → Heat Map gradient (warm gold→crimson). Three data layers on one tile.

---

### Journey: Kai, 16, Twitch Streamer, Into the Breach Fan

**Context:** Gauntlet match against a player called "HEXNET." Kai is streaming to 400 viewers. The match is on a Cebu Urban board.

**Minute 0:00 — "EXECUTE! Chat, Pray for Cyan."**
Kai hits EXECUTE. His chat has learned the color vocabulary from previous streams: cyan scars = Kai's kills, orange scars = enemy kills. Chat has already adopted the shorthand: "CYAN GANG" (when Kai gets a kill) and "ORANGE ZONE" (when the enemy pushes).

The sealed watch begins. Cebu city tiles glow with neon in the dark.

**Minute 0:15 — "CYAN! CYAN! CYAN!"**
Tick 6. Kai's striker eliminates an enemy scout at D5. Blue-white flash. The neon on D5 breaks at the joint — a clean structural failure — and the severed end **rewires to cyan**. A new cold blue light emerges from the broken sign, casting a cool glow on the concrete beneath. The crack in the pavement fills with a single pixel of cyan data-light, like fiber optic cable exposed in the rubble.

Chat erupts: "CYAN GANG" / "THE NEON REWIRED" / "his city tile just upgraded instead of breaking" / "enemy's neon dies, yours EVOLVES"

Kai sees it too. His kill didn't just damage the tile — it *changed* it. The neon isn't broken. It's different. It's HIS now.

**Minute 0:25 — The City Divides**
Tick 12. Four more combats have resolved. The board is painting itself:

Western tiles (B3, C4, D5): cyan-scarred. Neon rewired to blue. Clean concrete cracks with data-lines. The west side of the cyberpunk city looks like it's been **upgraded** — new blue infrastructure emerging from the breaks.

Eastern tiles (F5, G4, G5): orange-scarred. Neon flickering with dying orange static. Concrete cracked and dark. Scorch marks on wall faces. The east side looks like it was **bombed**.

The visual contrast is staggering. Same city. Two completely different post-combat aesthetics. The west is cold, clean, futuristic. The east is hot, chaotic, ruined. Kai's chat starts calling it "The Blue Zone" and "The Red Zone."

"Chat, look at this. My side of the city is UPGRADING. Their side is BURNING." Kai pans his camera across the board slowly. The color geography is unmistakable even at stream resolution.

**Minute 0:40 — The Contested Intersection**
Tick 18. Combat at E4 — the center tile where both forces meet. Kai's striker kills an enemy (clean crack, cyan tint). Next tick, HEXNET's striker kills Kai's striker on the same tile (jagged crack, orange tint). E4 now has BOTH scars: a clean horizontal crack with cyan glow crossing a jagged diagonal crack with orange glow. Where the cracks intersect, the colors neutralize to grey. The broken neon has one end rewired cyan and another end flickering orange static.

Chat: "THE INTERSECTION" / "neutral zone" / "that tile is Switzerland" / "the X marks the battle line"

E4 becomes the focal point of the stream. Every viewer can see what it means: both sides fought for this tile and neither owns it. The "X" pattern of clean-meets-chaotic cracks is instantly iconic.

**Minute 1:00 — The TikTok Clip**
Kai wins (barely). He clips a 12-second segment: a slow pan across the board, west to east. Blue neon → contested intersection with the X-crack → orange ruins. The visual gradient from cool to warm, from upgraded to destroyed, from precision to chaos — it tells the entire match story in a single camera movement. Caption: "my side of the city upgraded. their side burned. 🏙️❄️🔥"

Chat: "FRAME IT" / "THAT'S ART" / "the city has two mayors now"

**What he learned:** The asymmetric damage is premium streaming content because it's INSTANTLY readable by viewers at any resolution. Blue side = Kai winning. Orange side = enemy winning. Contested tiles = dramatic. No game knowledge required. The neon rewiring specifically — dying orange static vs. newly-minted cyan — is the most visually distinctive version of the asymmetry and creates the strongest stream moments.

**UI Annotations:**
- Cyan neon rewire: severed neon end generates new #00BCD4 glow, clean joint break, fiber-optic data-line in concrete crack
- Orange neon death: fragments flicker #FF6D00 static, mid-span shatter, exposed wiring sparks amber, scorch pixel on wall face
- Contested tile X-pattern: horizontal clean crack (cyan) + diagonal jagged crack (orange), neutral grey at intersection point
- Stream readability: cyan/orange tints visible at 720p, distinguishable even with stream compression artifacts

---

### Journey: Amara, 55, Retired Teacher, Low Vision (150% Zoom, High-Contrast Mode)

**Context:** Mission 4 (Batanes Highlands, using terrace-adjacent biome). Amara plays at 150% zoom with high-contrast mode.

**Minute 0:00 — Shape-First, Color-Second**
In high-contrast mode, the asymmetric damage system shifts emphasis from color to shape:

| Kill Type | Standard Mode | High-Contrast Mode |
|-----------|--------------|-------------------|
| Player kill | Cyan tint + clean geometry | **Bold straight-line crack** with ○ circle marker + subtle cyan tint retained. The clean geometry is exaggerated — thicker crack line (2px instead of 1px), more visible angular precision. |
| Enemy kill | Orange tint + chaotic geometry | **Bold jagged crack** with △ triangle marker + subtle orange tint retained. The chaotic geometry is exaggerated — wider crack (2px), sharper angles, more visible splinter lines. |

The **shape markers** (○ for player kills, △ for enemy kills) appear centered on the tile at the crack's origin point. At 150% zoom, these markers are large and clear. The circle (smooth, geometric) and triangle (angular, aggressive) reinforce the clean/chaotic vocabulary through a purely geometric channel.

**Minute 0:10 — Hover Tooltips**
Amara hovers over a tile with a circle marker. The tooltip reads: "Tile D5: Player kill (Tick 8). Your Striker-B eliminated Enemy-Scout. Clean engagement." The word "Clean" matches the visual: clean crack, circle marker.

She hovers over a triangle-marked tile: "Tile F6: Enemy kill (Tick 12). Enemy-Striker eliminated your Scout-A. Unit lost." The word "lost" carries emotional weight, but the tooltip doesn't add judgment — just facts and the marker shape.

**Minute 0:20 — Audio Differentiation**
When combat resolves during the sealed watch, the SOUND differs:
- **Player kill:** A crisp, high-pitched electronic **"ting"** (C5, 150ms) — clean, metallic, satisfying. Like a correct answer chime.
- **Enemy kill:** A low, dull **"thud"** (F2, 200ms) — heavy, organic, ominous. Like something falling.

For Amara, who relies more on audio than pixel-level color differences, the "ting" vs. "thud" distinction is the primary friend/foe signal. She hears it before she sees the scar.

**Minute 0:30 — Screen Reader Integration**
With a screen reader active, tile inspection announces: "Tile D5: player kill. Circle marker. Clean engagement." vs. "Tile F6: enemy kill. Triangle marker. Unit lost." The shape marker names (circle, triangle) serve as the screen reader's vocabulary for friend/foe distinction.

**What she learned:** The asymmetric damage system works through four independent channels: color (cyan/orange), shape (straight/jagged), marker (○/△), and audio (ting/thud). Any one channel is sufficient. Amara primarily uses audio + markers — two channels that require zero color perception. The system degrades gracefully across all accessibility needs.

**UI Annotations:**
- High-contrast player kill marker: ○ circle, 8px at 150% zoom, white outline, centered on crack origin
- High-contrast enemy kill marker: △ triangle, 8px at 150% zoom, white outline, centered on crack origin
- Audio: player kill "ting" at C5 (523 Hz), 150ms. Enemy kill "thud" at F2 (87 Hz), 200ms.
- Tooltip text includes kill type label: "Player kill" / "Enemy kill" + "Clean engagement" / "Unit lost"
- Screen reader: announces marker shape name and kill type on tile focus

---

## Progressive Disclosure Recommendation

The full asymmetric damage system shouldn't appear all at once. Recommended unlock timing:

| Mission | Damage System State |
|---------|-------------------|
| **Missions 1-2** | **Symmetric scars only.** The player is learning that tiles CAN scar. Adding friend/foe would be premature. |
| **Mission 3** | **Flash color differentiation only.** Blue-white flash for player kills, red flash for enemy kills. No scar tinting yet. The player notices "the flash looked different" and begins associating colors with outcomes. |
| **Mission 4** | **Full asymmetric scars introduced.** The boot log acknowledges it: `> COMBAT SIGNATURE ANALYSIS: online. Differentiating friendly engagements (cool signature) from hostile contacts (warm signature). Your actions leave a different mark than theirs.` |
| **Mission 5+** | Full system active including contested tile compositing, ghost scar tinting across retries, and Inspector integration. |

This mirrors the game's overall progressive disclosure philosophy: feel it, then see it, then understand it.

---

## The TikTok Clip

**"Two Cities."** A Cebu Urban board after a close Gauntlet match. Slow pan, 12 seconds. The western tiles glow with cyan-rewired neon — broken signs that found new circuits, cool blue data-lines in concrete cracks, the city upgraded by precise AI violence. The camera passes through the center tile with the X-crack — clean geometry meeting chaotic geometry, colors neutralizing to grey at the intersection. Then the eastern tiles: dying orange neon static, dark empty cracks, scorch marks, a city bombed into rubble. Same biome, two completely different post-war aesthetics. One side evolved. One side burned. Caption: "in this game your kills upgrade the map and theirs destroy it 🏙️💙🔥"

---

## Sensory Description: What It Feels Like

**A player kill** feels like signing your work. The blue-white flash is a camera shutter — capturing a moment of precision. The circular crossfade spreading outward is a sonar ping — clean, mathematical, expanding at a constant rate. The cyan-tinted scar that settles into the tile is a signature: "the AI was here. It was deliberate." The Siquijor bioluminescence shifting to deep ocean blue feels like a frequency change — the island tuned to a different channel, YOUR channel. The city neon rewiring to cyan feels like infrastructure finding a better path — evolution through destruction.

**An enemy kill** feels like being marked. The red flash is a wound flash — instinctive, animal. The irregular crossfade spreading like fire across the tile is organic and uncontrolled — nature, not design. The orange-tinted scar is a burn mark: "something violent happened here, and it wasn't calculated." The Siquijor bioluminescence dying to amber-red feels like an infection — the island's life force corrupted. The city neon shattering to orange static feels like infrastructure failing — entropy winning.

**A contested tile** feels like a battlefield. The X-pattern of crossed cracks — clean meeting chaotic — is a physical record of collision. Where the scars overlap, the colors cancel to grey, and the tile becomes neutral ground: neither side's signature prevails. The contested tile is the most visually complex and the most emotionally loaded. It says: "this square of ground cost BOTH sides something."

**The audio layer:** Player kills chime (high, bright, "ting"). Enemy kills thud (low, heavy, "thud"). A rapid sequence of alternating tings and thuds during an intense engagement creates a rhythm — the heartbeat of the battle encoded as friend/foe percussion. A sequence of nothing but thuds is devastating. A sequence of pure tings is triumphant. The audio tells the story even if you close your eyes.

---

## New Aspects Discovered

- **6.01a-iii-c-i — Asymmetric damage in high-density combat zones:** When 4+ scars accumulate on adjacent tiles all in the same color (e.g., four orange scars in a cluster), should the color intensify? "Orange saturation" as a visual alarm for catastrophic local failure; "cyan deepening" as a visual reward for dominant zones. The "territory painting" effect at scale.
- **6.01a-iii-c-ii — Player-vs-player asymmetric damage in Gauntlet:** In PvP, BOTH players produce "clean" kills from their own perspective. Whose signature colors the tile? Option: use player-assigned colors (Player 1's kills are cyan, Player 2's kills are magenta) rather than friend/foe colors. The board becomes a territory map painted in two player colors.
- **6.01a-iii-c-iii — Asymmetric damage audio vocabulary per biome:** Beyond the generic "ting" and "thud," should each biome have its own friend/foe audio? Terrace player kill: stone chime. Terrace enemy kill: stone crack. City player kill: neon connection sound. City enemy kill: glass shatter. Five biomes × 2 outcomes = 10 unique audio signatures.
- **6.01a-iii-c-iv — "Scoreboard tile" as emergent community metric:** Players sharing screenshots where the cyan-to-orange tile ratio IS their win/loss visualized spatially. Community culture around "all-cyan boards" (flawless runs) and "all-orange boards" (disaster runs). The tile damage ratio as a visual achievement.
- **6.01a-iii-c-v — Asymmetric ghost scar tinting interaction with retry psychology:** Do colored ghost scars change retry behavior differently than neutral ghosts? Orange ghosts may create avoidance patterns (players route away from "danger zones"). Cyan ghosts may create overconfidence ("I won here before, I'll hold here again"). The psychological valence of tinted ghosts vs. neutral ghosts as a design lever.
