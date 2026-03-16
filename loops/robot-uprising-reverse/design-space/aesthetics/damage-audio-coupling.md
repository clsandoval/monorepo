# 6.01a-iii-d — Damage Audio Coupling: The Sound of a Wounded World

## The Design Challenge

When a striker eliminates a unit and the tile beneath transforms — terrace stone cracking, neon shattering, canopy tearing open — what does the player HEAR? The visual damage transition (6.01a-iii) is a 500ms crossfade radiating from the impact point, slotted between the 100ms red combat flash and the next tick. The audio design vocabulary (6.02) already defines combat as a sharp dabakan strike with a digital glitch tail. But between the combat hit and the next tick, there's an unmapped sonic window: the sound of the *terrain itself* reacting.

This isn't just a sound effect decision. It's a question about whether the WORLD has a voice. The dabakan says "a unit died." The damage audio says "the ground remembers." Two fundamentally different storytelling channels — tactical information (combat happened) vs. environmental narrative (the world was changed). Getting this wrong means either sonic clutter (too many sounds per combat event) or wasted emotional real estate (a silent tile transformation that should have been felt).

The timing constraint is tight: the full combat→damage→settle sequence must complete within a single 1-second tick. The red flash takes 100ms. The dabakan strike and its tail take ~300ms. The tile crossfade is 500ms. These events overlap — the damage audio must BEGIN during the dabakan tail and COMPLETE before the next tick fires. That gives the damage sound a window of approximately 200-500ms, starting ~200ms after the combat event, ending by ~700ms.

---

## The Five Biome Voices

### "The Wounded Terrace" — Ifugao Terraces Damage Sound

**Sound design:** A layered two-part sound. PART 1 (0-150ms): A ceramic crack — the sharp, bright fracture of fired clay or stone, pitched at ~1.2kHz, with a 50ms attack and 100ms natural decay. Think of the sound when a terracotta pot hits a stone floor — not a shatter (that's too violent for a terrace), but a CRACK. A single definitive fracture. The sound is dry, no reverb, immediate — it happened RIGHT HERE on this tile. PART 2 (100-400ms, overlapping): A liquid drain — a descending water trickle, starting at ~800Hz and falling to ~200Hz over 300ms. This is the water draining from the cracked terrace face. Not a splash or a pour — a trickle that thins and dies, like the last water running out of a cracked vase. The trickle has a slight granular texture (tiny bubbles in the water column catching on rough stone).

**What the player feels:** The crack is sudden — the world broke. The trickle is sad — the water is leaving. Together they create a tiny grief: this beautiful terrace, with its data-light shimmer and careful water levels, was just broken. The agricultural metaphor is visceral even if unconscious: something that was growing is now draining.

**Interaction with ambient:** Under Option A (Kulintang Machine), the crack displaces one of the kulintang melody gong voices for exactly one beat — the gong that corresponds to the tile's column goes silent at the crack moment, as if the terrace's own musical voice was stunned. It returns on the next beat, but pitched slightly flat (detuned by ~25 cents) for the rest of the battle. The board's melody accumulates subtle detuning as terraces crack — by the end of a heavy battle on Ifugao, the kulintang sounds ancient and damaged, like a set of gongs that have been through a war.

**Under Option B (Server Room):** The crack is a relay click — a loud, definitive electromagnetic relay engaging, then the trickle becomes a coolant leak: liquid dripping onto hot metal with tiny hiss-sizzle transients. The data center is leaking.

### "The Dying Light" — Siquijor Mystic Damage Sound

**Sound design:** A crystalline chime that BREAKS. Attack (0-50ms): A bright, pure bell tone at ~3kHz — the bioluminescent organism's sonic signature, a single clear note like tapping a crystal wine glass. Sustain (50-150ms): The tone holds, shimmering, beautiful — for just a moment you hear what the living tile sounded like. Break (150-400ms): The tone cracks. The pure sine wave fragments into inharmonic partials — the fundamental drops while upper harmonics scatter upward. Mathematically: the original tone splits into 3-4 components that each detune at different rates, creating a rapid dissonance bloom from a single pure note. A faint reverb tail (~200ms) in a space that sounds like a cave — wet stone reflections, the volcanic rock chamber where the bioluminescence lived.

**What the player feels:** Beauty dying. The chime starts gorgeous and ends ugly. It's the audio equivalent of watching a light go out — you hear the thing that was alive in the instant before it dies, which makes the death register harder. The cave reverb adds loneliness — the sound bounces off empty stone walls where light used to be.

**Interaction with ambient:** Under Option A (Kulintang), the chime is pitched to harmonize with the current kulintang pattern for its first 150ms, then the break deliberately clashes with the next kulintang note. The harmony-to-dissonance transition is the musical version of life-to-death. Under Option C (Synthwave), the chime is a synth bell that distorts into bitcrushed noise — digital death of an analog organism.

### "The Torn Canopy" — Palawan Jungle Damage Sound

**Sound design:** A multi-layered organic rupture. Layer 1 (0-200ms): A woody SNAP — a bamboo stalk breaking, sharp and resonant at ~600Hz. Bamboo has a distinctive hollow crack: bright attack, then a brief hollow resonance as the tube vibrates from the break point. This is louder and more present than the other layers — it's the structural sound, the skeleton breaking. Layer 2 (50-350ms): A leafy rustle cascade — mid-frequency broadband noise (500Hz-4kHz) that sounds like a branch falling through other branches, hitting leaves on the way down. The rustle has a descending trajectory — it starts high in the stereo field (canopy level) and settles toward center (forest floor). Layer 3 (200-500ms): A soft thud — low-frequency (~100Hz), padded, almost gentle. The branch hitting the forest floor, muffled by leaf litter. And then: a brief rise in insect/bird ambient — a 200ms burst of cicada and distant birdsong, 3dB louder than the ongoing ambient. The canopy just opened. Sunlight floods in. The creatures react.

**What the player feels:** Violence and consequence in rapid sequence. The snap is violent — something broke. The rustle is chaotic — debris is falling. The thud is final — it landed. The insect burst is alive — the jungle doesn't care about your war, it immediately exploits the new sunlight gap. This is the most "alive" of the five biome damage sounds because the jungle responds to its own damage.

**Interaction with ambient:** Under Option A (Kulintang), the bamboo snap is pitched to match a gandingan tone — the "skills" gandingan at ~600Hz — creating a momentary confusion: was that a game event or a combat consequence? The ambiguity is intentional. The war and the world are made of the same materials.

### "The Shattered Grid" — Cebu/Manila City Damage Sound

**Sound design:** An electrical-industrial collapse in miniature. Hit (0-80ms): A sharp glass shatter — high-frequency (4-8kHz) with rapid transient attack. This is the neon tube breaking: not a window, not a bottle, specifically glass tubing under gas pressure — a slightly more explosive, pressurized pop than normal glass. The neon gas escaping adds a microsecond hiss (~8kHz, 10ms). Cascade (80-300ms): An electrical arc — a ZAP sound starting at ~2kHz and descending to ~500Hz as the exposed wiring shorts and the arc stabilizes. The arc has a buzzy, angry quality: sawtooth-wave-ish, with irregular amplitude modulation (the current is unstable). Two or three discrete sparks (10ms bright transients at ~3kHz) punctuate the arc — the visual "spark" animation on the exposed wiring each have an audio counterpart. Settle (300-500ms): The arc diminishes to a faint, irregular crackle — 60Hz hum with intermittent 5ms pops. This is the residual sound of the damaged tile's ongoing electrical fault. Under the Hybrid Memory damage model (recommended in 6.01a-iii), this crackle fades to silence over 3-5 ticks as the "fading residue" dissipates, but the permanent "subtle scar" retains a barely audible 60Hz hum — only noticeable if you listen for it, but present, suggesting the wiring was never properly repaired.

**What the player feels:** Modern infrastructure collapsing. The neon shatter is glamorous destruction — cyberpunk aesthetic fulfilled. The arc is dangerous — live electricity, exposed. The settling crackle is unsettling — this tile is now slightly hazardous, still sparking. This is the most "cinematic" of the five damage sounds because urban destruction is the most familiar from movies and games.

**Interaction with ambient:** Under Option B (Server Room), the glass shatter blends seamlessly with the industrial soundscape. The arc is indistinguishable from the "electrical arc combat" sound described in 6.02 Option B — creating a deliberate ambiguity between "combat sound" and "environmental damage sound." The player can't tell if they're hearing the fight or its aftermath. Under Option A (Kulintang), the neon shatter introduces a non-kulintang timbre (glass) that stands out starkly against the metallic gong palette — the city tile's damage sounds FOREIGN in the Philippine instrument set, which is exactly the cultural tension: cyberpunk Manila is Philippine AND alien.

### "The Cracking Earth" — Taal Volcanic Damage Sound

**Sound design:** Geological violence compressed to 500ms. Crack (0-100ms): A deep, sub-bass THOOM — a low-frequency impact at ~50Hz, felt more than heard on speakers, unmistakable on headphones or subwoofer. This is the obsidian surface fracturing — a tectonic event at tile scale. The attack is slow for a percussion sound (~30ms rise time), making it feel massive and heavy. Rumble (50-300ms): A granular low-frequency rumble (40-120Hz) with slow amplitude modulation — the sound of rubble shifting, magma moving beneath the cracked surface. Random pitch fluctuations within the rumble create an organic, geological character. This is NOT a smooth synth drone — it's textured, gritty, composed of hundreds of tiny rock-grinding events summed together. Vent (200-500ms): A rising hiss starting at ~1kHz and climbing to ~4kHz — steam escaping through the newly opened crack. The hiss has a pressurized quality (narrow-bandwidth noise with a resonant peak that shifts upward as more gas escapes). At 400ms, a single deep POP — a magma bubble bursting at the surface of the newly visible lava. The pop is ~200Hz, wet-sounding, with a brief splatter transient.

**What the player feels:** The floor is ANGRY. The sub-bass thoom registers in the chest before the brain processes it. The rumble is ominous — there's something enormous underneath. The steam hiss is danger — pressure building. The magma pop is alien — this isn't a human-scale sound, it's a geological process rendered intimate. Taal is the final boss province — its damage sound should be the most unsettling, the most "this world will destroy you."

**Interaction with ambient:** Under Option A (Kulintang), the sub-bass thoom creates a beating frequency with the agung tick gong (also low-frequency), producing a momentary interference pattern that makes the speakers/headphones vibrate differently — the player feels the agung and the earth crack COLLIDE. Under Option D (Adaptive Silence), the Taal damage sound is the loudest thing in the entire game because the silence amplifies everything — a volcanic crack in near-silence is terrifying.

---

## Design Axis: Sonic Layering Strategy

How do the five biome damage sounds interact with the already-dense combat audio landscape?

### Option A: "The Replacement" — Damage Sound REPLACES the Combat Tail

The dabakan strike fires at 0ms (combat event). Its normal 200ms digital glitch tail is CUT SHORT — instead of the full tail, the tail crossfades into the biome damage sound at ~100ms. The biome damage sound replaces the tail as the "aftermath" audio. The player hears: STRIKE → [brief glitch] → [biome damage beginning].

**Strengths:**
- Cleanest sonic profile. No overlapping layers — one sound flows into the next.
- The biome damage sound IS the combat tail, biome-specific. Each biome's combat sounds different because the aftermath sounds different.
- Minimal audio budget: one sound replaces another, net-zero new concurrent voices.

**Weaknesses:**
- Loses the universal combat sound identity. If the dabakan tail changes per biome, the player might not register "combat happened" as quickly — the consistent audio signature becomes variable.
- Biome damage sounds need to start abruptly enough to fill the tail's role, which constrains their design (no gentle fade-ins).

### Option B: "The Underlayer" — Damage Sound Plays BENEATH the Combat Hit

The dabakan strike and its full 200ms tail play as designed. The biome damage sound begins at ~150ms (just before the tail ends) at -6dB relative to the dabakan — clearly subordinate, a quieter layer beneath the combat hit. The two overlap for ~150ms (150ms-300ms), then the dabakan fades and the damage sound continues alone for its remaining duration.

**Strengths:**
- Preserves the universal combat audio signature. The dabakan always sounds the same — the biome damage is additional information, not replacement.
- The quieter mix level creates a "sonic archaeology" effect: the loud combat hit is what happened, the quieter damage sound is what it did to the world. Foreground/background mirrors event/consequence.
- Can be mixed out entirely for players who find it distracting (accessibility audio slider: "Environmental damage sounds").

**Weaknesses:**
- Two concurrent sounds in a tight window risk muddiness, especially on phone speakers where frequency separation is limited.
- The -6dB mix means damage sounds must be designed for low-volume legibility — subtle textures (the Siquijor crystal break, the terrace water trickle) might disappear entirely.
- Adds cognitive processing demand during the densest moment of the game.

### Option C: "The Aftermath" — Damage Sound Plays AFTER the Combat Sequence

The dabakan strike fires, its full tail completes at ~300ms, and THEN the biome damage sound begins at ~300ms. Pure sequential: combat → pause → environmental response. The tile crossfade (visual) starts at ~200ms (as designed in 6.01a-iii), so the damage sound begins ~100ms after the visual transition is already underway — the player SEES the tile start to change, then HEARS why.

**Strengths:**
- Maximum clarity. No overlapping sounds. Each layer is fully legible.
- The visual-before-audio delay creates a "see-then-understand" rhythm: the player's eye catches the tile starting to crack, then their ear confirms it. This is how real-world destruction often works (you see the explosion before you hear it — though at tile scale this is artistic license, not physics).
- Damage sounds can be designed for their full dynamic range without competing with combat audio.
- The gap between combat and damage creates a micro-beat of silence — a tiny breath that makes the damage sound more impactful when it arrives.

**Weaknesses:**
- Timing risk. If the biome damage sound starts at 300ms and needs 400ms to complete, the total combat→damage sequence is 700ms — leaving only 300ms before the next tick at 1000ms. If the next tick has ANOTHER combat event, the damage sound of tick N may be truncated by the dabakan of tick N+1.
- Sequential events at this timescale feel slow. 300ms of dabakan, a gap, then 400ms of damage — in a game where ticks are 1 second, spending 700ms+ on a single combat event's audio may feel like the game is lagging.

### Option D: "The Terrain Persistence" — Damage Sound as Ongoing Ambient Change

No discrete damage sound plays at the moment of combat. Instead, the biome's ambient soundscape SHIFTS permanently when a tile is damaged. Before damage, the terrace tile contributes its water shimmer to the ambient bed. After damage, that contribution changes to a cracked-stone crackle. The change is gradual (crossfading over 2-3 seconds) and ongoing — the damaged tile sounds different for the entire rest of the battle.

**Strengths:**
- Zero combat-moment audio load. The combat event sounds exactly the same on every biome — pure, clean dabakan.
- Creates an evolving battlefield soundscape. Early battle: full ambient (water, insects, neon hum, bioluminescence). Late battle on a scarred board: a degraded ambient (crackles, drains, broken hums). The SOUND of the board degrades alongside the VISUALS.
- Pairs perfectly with the Hybrid Memory damage model — as tiles accumulate scars, the ambient accumulates damage sounds.
- Strongest "the world remembers" effect. Not a momentary sound but a lasting sonic scar.

**Weaknesses:**
- No immediate audio feedback for tile damage. The player might not NOTICE a tile was damaged for several seconds, by which time other events have occurred.
- Ambient shifts over 2-3 seconds are below most players' conscious detection threshold. Only players who've been in the soundscape for 5+ minutes will notice "something changed."
- Per-tile ambient contribution means up to 64 individual sound sources on an 8×8 board — a significant audio processing budget.
- Difficult to mix. 8 damaged tiles each contributing their own damage ambient creates an unpredictable sonic soup.

### Option E: "The Double Voice" (RECOMMENDED) — Impact Sound + Ambient Shift

**Combine Options B and D.** At the combat moment: the biome damage sound plays beneath the dabakan at -6dB (Option B's underlayer). After the immediate sound completes: the tile's ambient contribution shifts permanently (Option D's terrain persistence). The player gets BOTH the momentary "the tile just cracked" event AND the ongoing "this tile is now damaged" ambient change.

**Strengths:**
- Double-encoded information: immediate + persistent. The player notices damage both in the moment (underlayer sound) and on reflection (ambient degradation).
- The immediate sound tells them WHAT happened. The ambient shift tells them it MATTERS.
- Scales gracefully: early battle with one or two damaged tiles has subtle ambient changes. Late battle with a scarred board has a dramatically different soundscape.
- Natural crescendo over a match: the ambient degradation accumulates, creating a sense of escalating destruction that mirrors the visual scarring.

**Weaknesses:**
- Highest audio complexity of all options. Both immediate and persistent layers need design, mixing, and performance budgeting.
- Risk of the persistent ambient layer becoming "noise" that interferes with gameplay-critical audio (signal pings, buffer overflows).
- Requires a mixing strategy that scales: what happens when 20 tiles are damaged and all contributing degraded ambient?

**Mixing strategy for E:** Each damaged tile contributes to a single "damage ambient" bus, not 64 individual sources. The bus has a master volume curve: 0 damaged tiles = silent, 1-3 tiles = barely audible, 4-8 tiles = noticeable, 9+ tiles = prominent. The bus never exceeds -12dB relative to the main music/SFX mix. The damage ambient is always the quietest layer in the mix — a subliminal texture, not a foreground element.

---

## Progressive Damage Sound Escalation

Under the Progressive Scarring model (Option C in 6.01a-iii — three damage levels), each subsequent combat event on the same tile produces a progressively more severe version of the biome damage sound:

| Level | Terrace | Siquijor | Jungle | City | Taal |
|-------|---------|----------|--------|------|------|
| **Light** (1st hit) | Crack + trickle | Crystal chime breaking | Bamboo snap + leaf rustle | Glass shatter + small arc | Sub-bass crack + hiss |
| **Heavy** (2-3 hits) | LOUDER crack (stone splitting) + GUSH (water pouring, not trickling) + grinding (stone on stone) | MULTIPLE chimes breaking in sequence (cascade of dying lights) + cave echo doubles | TRUNK crack (deeper, louder than bamboo) + heavy branch crash + bird scatter (panicked birdcall burst) | STRUCTURAL groan (low-frequency metal bending) + transformer explosion (loud arc + pop) + rebar ping | DEEP rumble (sustained 2-3s) + multiple steam vents + lava FLOW sound (viscous liquid) |
| **Devastated** (4+ hits) | COLLAPSE — cascading stone avalanche sound, 500ms, all water gone, just dry rubble and dust settling | TOTAL DARKNESS — the chime attempt fails immediately (a dull click where the crystal tone should be, then silence). The absence of the chime IS the sound. | CLEARING — a massive crash, then wind. Open air. The canopy is gone. You hear the sky where the forest was. A single lonely bird call far away. | CRATER — a deep explosion, then settling concrete dust (granular high-frequency noise) and the eerie sound of distant city ambiance now audible through the gap where the building was. | ERUPTION — the longest damage sound in the game (800ms). Sub-bass roar, lava splash, and a rising harmonic tone (the earth itself resonating). Everything vibrates. |

The escalation creates a dramatic arc within individual tiles: the first hit hurts. The second hit BREAKS. The third hit DESTROYS. And the audio tells this story independently of the visuals — a blind player could reconstruct the damage level of a tile from its sound alone.

---

## Interaction Effects

### With Sealed Watch Pacing (Locked)

At 1 second per tick, combat events are rare and meaningful. The damage audio has SPACE to breathe — there might be 3-5 combat events in a 30-tick battle, each with seconds of silence between them. This is the opposite of an FPS where gunfire is continuous. Every damage sound is an EVENT, not background noise. The sparse pacing makes even the Option C (sequential aftermath) timing work — 700ms per combat is 70% of a tick, but with only 1-2 combats per several ticks, the audio never piles up.

Exception: a well-executed flanking maneuver that eliminates 3 adjacent enemies in a single tick. Three simultaneous damage sounds on potentially three different biome tiles. The audio engine must handle this gracefully — either by selecting the "most dramatic" of the three and playing it at full volume while reducing the others to -9dB, or by playing all three with slight timing offsets (0ms, 60ms, 120ms) to create a cascade rather than a wall of sound.

### With Inspector Timeline Scrubber (Locked)

When the player scrubs to a tick where combat occurred, the damage audio should replay at the scrubbed tick. But scrubbing isn't real-time — the player might scrub through 5 combat events in 2 seconds. The Inspector needs a "scrub-mode" variant of damage audio: a compressed, shortened version (~100ms) that retains the biome identity (the crack timbre, the chime break, the bamboo snap) without the full duration. Think of it as thumbnail audio — recognizable but compact. This allows rapid scrubbing while still hearing "terrace cracked here, city shattered there."

### With Signal Chain Sounds (6.02)

The babendil ping (signal delivery) and the damage sound can occur on adjacent ticks. If a Scout broadcasts "enemy-spotted" on tick 7 (babendil ping, green flash) and a Striker eliminates the enemy on tick 8 (dabakan + biome damage), the sequence is: ping → 1 second → STRIKE + crack. The audio tells a story: information → action → consequence. If the signal chain is longer (Scout → Relay → Striker over 4 ticks), the audio narrative stretches: ping... squish... PING... STRIKE+crack. The damage sound is the resolution of a multi-tick signal melody. It should feel like a cadence — the musical "landing" after a signal chain's ascending phrase.

### With Buffer Overflow Sound (6.02)

A unit whose buffer overflows (rising whine + eviction thud) on the same tick as combat nearby creates a compound audio event: combat dabakan + damage sound + overflow whine. This is the game's maximum sonic density moment. The mixing priority should be: 1) dabakan (loudest — combat is always king), 2) overflow whine (gameplay-critical information), 3) damage sound (atmospheric). The damage sound may be barely audible under double-event conditions, which is acceptable — the player's attention is on the combat and the overflow, not the tile.

### With EM Noise (Locked)

Deeper architectures produce EM emissions. The continuous EM heartbeat pulse (described in 6.02 Option A) creates a rhythmic bed underneath all other sounds. Damage audio must be designed to cut through the EM pulse — which means damage sounds need a frequency range NOT occupied by the EM heartbeat. If the EM heartbeat is a low-mid pulse (~200-400Hz), the damage sounds should have their primary energy above 500Hz (cracking, glass, chimes) with only Taal's sub-bass thoom dipping into the EM range (acceptable because Taal's sound should feel like it's competing with the infrastructure — the earth vs. the machines).

### With Colorblind/Deaf Accessibility

For deaf or hard-of-hearing players: all damage audio cues must have visual equivalents. The existing tile damage visual transition (500ms crossfade) serves this role. But for players who can hear SOME frequencies: damage sounds should be spread across the frequency spectrum (Siquijor high, Jungle mid, Taal low) so that players with partial hearing loss in specific ranges can still catch some biome distinctions. For fully deaf players: a subtle screen-edge flash in the biome's palette color (green for jungle, cyan for Siquijor, amber for terrace, magenta for city, orange for Taal) at the moment of damage provides the "something happened to the terrain" cue.

---

## Player Journeys

### Journey: Reyes, 28, Filipino game developer, playing Mission 6 (Cebu urban map) with studio monitors

**Context:** Just unlocked factory production. Building his first multi-blueprint army. Has been playing for 3 hours across sessions. Using Audio Option A (Kulintang Machine).

**Minute 0:00 — Plan Phase, Cebu City Board**
The board shows an 8×8 grid of neon-lit city tiles. The kulintang melody plays with a distinctly urban undertone — Reyes notices that the ambient has a faint 60Hz hum beneath the gongs, the city's electrical grid adding its own frequency to the Philippine soundscape. He configures three blueprints: Scout, Relay, Striker. The production queue conveys its gentle mechanical rhythm. He hits EXECUTE.

**Minute 0:45 — First Combat, Tick 12**
His Striker reaches an enemy Scout. DABAKAN — the dry drum crack he knows well. But then — *TSHING-zzzZZAP-tk-tk-tk*. Glass shattering, an electrical arc whipping through air, sparks snapping. The neon tube on the tile below breaks apart visually while the arc sound buzzes angrily for 300ms. He feels his neck tense — that's a LIVE WIRE sound. The visual: shattered neon fragments, exposed wiring with a hot orange glow, concrete cracking. The audio: danger, electricity, broken infrastructure. The tile now contributes a faint intermittent crackle to the ambient bed — barely noticeable, but the city soundscape just got slightly more damaged.

**Minute 1:30 — Second Combat on Adjacent Tile, Tick 19**
Another elimination. Another glass shatter and arc. But this time Reyes notices: the two damaged tiles together make the ambient hum unstable. The formerly steady 60Hz hum now has a slight waver — the city's electrical grid, damaged in two places, is struggling. He didn't consciously hear the change from one damaged tile, but two makes it legible. The board is telling him, through his ears, that this area of the city has taken hits.

**Minute 2:15 — Heavy Combat Zone, Tick 25**
A third combat event happens on the SAME tile as the first. The sound is DIFFERENT — louder, deeper. Not a neon tube popping but a STRUCTURAL GROAN. Low-frequency metal bending, a transformer explosion POP, and a high rebar ping that rings for 200ms. The progressive damage escalation from "Light" to "Heavy" is audible: the first hit broke the surface, the second hit broke the structure. The tile now shows exposed infrastructure and sparking rebar. Its ambient contribution shifts from faint crackle to a more assertive buzz. Reyes realizes the damage sounds are telling him about the tile's state without looking at it.

**Minute 3:00 — Sealed Watch Ends, Inspector Opens**
The agung seal-break rings out. Inspector opens. Reyes scrubs the timeline back to Tick 12 — the first combat event. As he scrubs through it, a compressed *tshing-zap* plays in 100ms — the thumbnail version. He scrubs to Tick 25 — the heavy damage — and hears the deeper *groan-pop-ping* thumbnail. The damage sounds in Inspector mode are sonic bookmarks: even at scrub speed, he can HEAR which combat events were on city tiles (electrical) vs. the one event that happened on a jungle border tile (bamboo snap). The biome damage sounds are his audio map of the battle.

**Minute 4:00 — Reflection**
"I felt the city break," he tells his coworker. "Not just the units — the actual city." He thinks about Manila during a brownout — the way the whole neighborhood sounds different when the transformer blows. The game captured that.

**UI Annotations:**
- Cebu city damage: glass shatter (4-8kHz, 80ms) → electrical arc (2kHz→500Hz, 220ms, sawtooth) → spark pops (3×10ms at 3kHz) → settling crackle (60Hz + random pops, fading over 3 ticks)
- Progressive escalation: Light = surface neon, Heavy = structural groan + transformer pop, Devastated = explosion + concrete dust
- Ambient degradation: 60Hz hum wavering increases per damaged tile, cumulative instability
- Inspector scrub: 100ms compressed thumbnail preserving biome timbre signature
- Screen-edge flash for deaf accessibility: magenta pulse for city biome damage

### Journey: Anika, 19, college student, first strategy game, playing Mission 3 (Palawan jungle) on laptop with earbuds

**Context:** Just completed Mission 2 (Siquijor). Learned hooks last mission. Playing in a coffee shop with one earbud in, music playing in the other ear.

**Minute 0:00 — Plan Phase**
Anika has two pre-placed units (tutorial mission). The kulintang is gentle, jungle ambient underneath — insect hum, distant birdcall. She barely hears it over her own music in the other ear. She configures a hook on her Scout to broadcast enemy positions. Hits EXECUTE.

**Minute 0:30 — First Combat, Tick 8**
Her Scout gets eliminated by an enemy Striker. DABAKAN crack — she flinches, takes out her other earbud. Then she hears it: *CRACK — rustle-rustle-rustle — thump.* And then — a brief burst of birdsong, louder than the ambient, as if the jungle just startled awake. She looks at the tile: the canopy is torn open, a shaft of warm light cutting through, broken bamboo stalk.

She whispers: "Did the jungle just... react?"

The sound stays with her. The tile's ambient contribution has shifted — where the jungle tile used to add a layer of dense insect hum, it now adds a more open, airy texture with wind. The canopy opened. The sound opened with it. She puts both earbuds in.

**Minute 1:00 — Second Combat, Tick 14**
She repositions her Striker and takes out an enemy. DABAKAN + *CRACK-crash-rustle-THUMP*. This one's on a different jungle tile. The bamboo snap is louder, the leaf cascade more dramatic. Two tiles now have open canopy, and the ambient has shifted: more wind, more birdsong, less dense insect hum. The jungle is thinning audibly. She can HEAR the forest being damaged even though she's focused on unit positions.

**Minute 1:45 — Third Combat on Same Tile, Tick 20**
The Heavy-damage version fires. Not a bamboo snap but a TRUNK crack — deep, resonant, like a tree falling. A heavy branch crash with multiple impacts (hitting other branches on the way down). Then a burst of panicked birdcall — not the gentle startle-chirp of Light damage, but a genuine alarm cry, like a flock scattering. Anika gasps. "I destroyed that tile," she thinks.

**Minute 2:30 — Inspector, Scrubbing**
She scrubs to Tick 8 (her Scout's death). The thumbnail plays: *crack-rustle* in 100ms. She scrubs to Tick 14: *crack-crash* — slightly different. Tick 20: *CRACK-boom* — noticeably heavier, even in thumbnail form. She can hear the escalation. The tiles aren't just scenery — they're participants.

**Minute 3:00 — Post-Session**
She texts her friend: "the game has jungle sounds that change when you fight on them. like the trees break and you can hear it." Her friend replies: "that sounds cool." She replies: "it sounds SAD."

**UI Annotations:**
- Jungle Light: bamboo snap (600Hz hollow crack) + leaf rustle cascade (descending stereo) + soft thud (100Hz) + insect burst (+3dB for 200ms)
- Jungle Heavy: trunk crack (deeper, 300Hz, louder) + heavy multi-impact branch crash + panicked bird scatter (alarm call, wider stereo spread)
- Ambient shift: dense insect hum → open wind + bird, per damaged tile; cumulative "thinning" effect
- One-earbud scenario: damage sounds designed with strong mono compatibility — stereo positioning is additive, not essential

### Journey: Marcus, 42, Factorio veteran, playing Mission 9 (Taal volcanic, late campaign) with audiophile headphones

**Context:** 30+ hours in. Audio Option B (Server Room). Running a 5-unit factory with Command agent. Taal is the penultimate mission — volcanic terrain, maximum difficulty.

**Minute 0:00 — Plan Phase**
The server room hum is deeper on Taal — the ambient has a low-frequency thermal rumble beneath the usual 50Hz power grid drone. The obsidian tiles add a glassy, high-frequency shimmer to the ambient — like hard drives spinning up on a volcanic shelf. Marcus configures his relay network for maximum compression, trying to prevent buffer overflows in the tight Taal corridors.

**Minute 1:00 — First Combat, Tick 6**
An enemy Striker reaches one of his Scouts. CLUNK (Server Room dabakan equivalent). Then — **THOOM.** The sub-bass hits his headphones like a physical object. 50Hz, 30ms rise time, felt in the jaw. The obsidian cracked. A granular rumble follows, textured and geological, like standing on a bridge while a truck passes underneath. Then a rising hiss — steam through a crack — and a wet, guttural POP. Magma. He grips the desk edge. That was the most visceral sound in the game. The Server Room audio option makes it even more industrial — the geological violence rendered through the metaphor of server hardware failing: a rack-mount falling, coolant leaking onto hot processors, a capacitor blowing.

**Minute 1:30 — Second Hit on Same Tile, Tick 11**
Heavy damage. The sub-bass is SUSTAINED this time — not a thoom but a RRRUMBLE that lasts 2-3 seconds. Multiple steam vents hiss in stereo. And a new sound: viscous liquid flow. Lava moving. It sounds like thick syrup pouring, but at geological pitch — everything shifted 3 octaves down from what syrup would sound like. The lava flow sound doesn't stop — it becomes part of the tile's ambient contribution. This tile is now ACTIVELY volconic. The board's ambient has shifted: the clean server room hum now has a sub-bass thermal component from the active lava.

**Minute 2:00 — Devastated Tile, Tick 18**
A third combat event on the same tile. ERUPTION. The longest damage sound in the game: 800ms. Sub-bass ROAR — not a hit but a sustained bellow from inside the earth, like opening a furnace door. Lava SPLASH — wet, heavy, spattering. And then a rising harmonic tone: the volcanic rock resonating at its fundamental frequency, a clear pitch emerging from the noise, like a singing bowl made of basalt. Marcus has never heard this sound in 30 hours of play — Taal's devastated state is unique to the final missions. His headphones vibrate. The board now has a permanently molten tile, glowing orange, and its ambient contribution is a continuous low rumble that makes the entire soundscape feel unstable.

**Minute 2:30 — "The Volcano IS the Enemy"**
Marcus has lost 3 units to enemy flanking and 2 tiles are devastated. The board's ambient is dramatically different from minute 0: the clean server hum is now polluted with geological rumble, steam hiss, and lava flow. He realizes: the tile damage sounds aren't just aesthetic — they're making it harder to hear gameplay-critical audio. The signal babendil pings are being masked by the volcanic ambient. The buffer overflow whines are competing with steam hisses. The battlefield is literally getting NOISIER as it's destroyed, which means his information architecture is fighting against an increasingly hostile sonic environment. This is the Taal difficulty multiplier: not just harder enemies, but harder listening conditions.

**Minute 4:00 — Inspector**
He scrubs through the battle. Tick 6: *THOOM* thumbnail, 100ms, recognizably volcanic. Tick 11: the heavier *RUMBLE* thumbnail. Tick 18: the devastated *ROAR* — even the thumbnail version is the longest at 150ms. He compares: his Ifugao mission had gentle crack-and-trickle damage sounds. His Cebu mission had sharp electrical zaps. Taal is geological warfare. Each biome doesn't just LOOK different in combat — it SOUNDS different. He wonders if his signal architecture should be biome-aware: noisier biomes might need compression-heavy relay networks to cut through the ambient chaos.

**Minute 5:00 — Reflection**
"Factorio doesn't do this," he thinks. Factorio's combat is a generic pew-pew regardless of terrain. Robot Uprising's tile damage audio creates terrain-specific combat identity — fighting in the jungle SOUNDS like jungle destruction, fighting in the city SOUNDS like urban collapse, fighting on a volcano SOUNDS like the earth breaking open. The terrain isn't just a backdrop. It's a character.

**UI Annotations:**
- Taal Light: sub-bass THOOM (50Hz, 100ms, 30ms attack) + granular geological rumble (40-120Hz, 200ms) + steam hiss (1-4kHz rising) + magma pop (200Hz, wet)
- Taal Heavy: sustained sub-bass rumble (2-3s) + multiple steam vents (stereo) + viscous lava flow (continuous, becomes ambient)
- Taal Devastated: 800ms eruption sequence — sub-bass roar + lava splash + rising harmonic singing-bowl tone (unique to this state and biome)
- Server Room interaction: geological sounds rendered through industrial metaphor (rack fall, coolant leak, capacitor blow)
- Ambient masking effect: accumulated damage ambient competes with gameplay audio — Taal's difficulty is partially SONIC
- Headphone design: sub-bass content below 80Hz present, designed for monitoring headphones; laptop speakers will miss the THOOM's lowest frequencies but catch the rumble

---

## Comparable Games and Media

### Into the Breach — The Silence Precedent
Into the Breach has NO tile damage sounds because it has no tile damage. Combat sounds are clean, discrete, and universal. The game proves that tile-agnostic combat audio is perfectly functional for tactical games. Robot Uprising's tile damage audio is an explicit deviation from this precedent — choosing environmental storytelling over maximum clarity. The risk is real: Into the Breach's audio clarity is legendary among strategy gamers.

### Noita — Environmental Destruction as Sound Design
Noita's every-pixel-is-simulated physics means every material has a sound when destroyed: sand whispers, wood cracks, metal rings, water splashes, lava sizzles. Noita proves that per-material destruction audio creates a deep sense of physical world — players report "feeling" the materials through sound. But Noita's soundscape gets CHAOTIC in large-scale destruction. Robot Uprising's 8×8 grid with rare one-shot-one-kill events is the opposite environment — sparse destruction where every sound event matters.

### Outer Wilds — The Singing Dark Bramble
Outer Wilds uses environment-specific audio to create distinct emotional identities for each planet. The Dark Bramble's anglerfish sounds create genuine dread. Giant's Deep's tornado roar creates vertigo. Robot Uprising's biome damage sounds serve the same function: each battlefield should FEEL sonically distinct, and combat on different terrains should evoke different emotional responses. The terrace crack is melancholy. The jungle tear is alarming. The volcanic thoom is terrifying.

### Battlefield 1 — Dynamic Destruction Audio
Battlefield 1's building destruction system uses multi-stage audio: initial impact, structural groaning, collapse sequence, dust settling. The progressive escalation (wall crack → partial collapse → full collapse) directly parallels Robot Uprising's Light → Heavy → Devastated progression. BF1 proves that players can read damage severity from audio alone — experienced BF1 players can estimate building integrity by sound.

### Minecraft — Block Break Sound Identity
Every block in Minecraft has a distinct break sound: dirt is soft, stone is sharp, glass is bright, wood is hollow. Players learn the vocabulary unconsciously — you KNOW what's being broken before you see it. Robot Uprising's five biome damage sounds need the same instant-recognition quality: hear the crack → know it's terrace. Hear the chime → know it's Siquijor. Hear the snap → know it's jungle. Five sounds, five identities, zero confusion.

---

## The TikTok Clip

A Taal volcanic mission. Intense battle. The camera is close on a cluster of 4 tiles. Over 30 seconds of gameplay, each tile takes damage in sequence:

Tick 12: Tile A cracks. *THOOM.* Obsidian fissure. Steam wisps.
Tick 18: Tile B cracks. *THOOM.* Another fissure. The ambient rumbles.
Tick 23: Tile A takes heavy damage. *RRRUMBLE.* Lava flows. The tile glows.
Tick 27: Tile C cracks. *THOOM.*
Tick 31: Tile A devastated. **ROAR.** Full eruption. Singing-bowl harmonic. The entire cluster of tiles is now a disaster zone — cracked, flowing, and one fully erupted.

Time-lapse accelerates. The camera pulls back to show the full board. Half the tiles are scarred. The ambient is a volcanic symphony: rumbles, hisses, crackles, the faint singing tone from the erupted tile. The player's army is winning, but the world they're winning is broken.

Text overlay: "the game remembers every fight."

Cut to black. Sound: the single erupted tile's singing-bowl harmonic, sustained, fading slowly into silence.

---

## New Aspects Discovered

- **6.01a-iii-d-i — Biome damage sound as unit identity confusion:** If the Scout's movement sound on jungle includes a bamboo creak, and the jungle tile damage includes a bamboo snap, can the player distinguish "a Scout moved" from "a tile was damaged"? Sound collision audit across all biome×unit×event combinations.
- **6.01a-iii-d-ii — Damage sound volume scaling with camera zoom:** If the game supports zoom levels, should damage sounds get louder/quieter with zoom, or play at constant volume? The "objective perspective" (constant) vs. "spatial audio" (zoom-scaled) design decision.
- **6.01a-iii-d-iii — Player-authored damage sound mods:** Custom sound packs for tile damage — community horror, comedy, lo-fi, minimalist variants. Which audio slots are moddable and which are locked for gameplay legibility?
- **6.01a-iii-d-iv — The "battle choir" emergent composition:** On boards with mixed biomes, accumulated damage sounds from different biomes create an unintentional choir — terrace trickle + jungle wind + city buzz + Siquijor silence + Taal rumble. Is this emergent sonic layering designed for or just tolerated? Could biome transitions be tuned for harmonic compatibility?
