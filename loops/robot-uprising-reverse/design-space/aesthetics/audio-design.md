# 6.02 — Audio Design: Soundtrack, Sound Effects, and the Sonic Identity of Robot Uprising

## The Design Challenge

Robot Uprising has three radically different emotional states that cycle every 3-8 minutes: **Plan** (focused construction, flow state), **Sealed Watch** (tense observation, no control), and **Inspector** (analytical deconstruction, forensic calm). The audio must serve all three without jarring transitions, while establishing a sonic identity rooted in the locked **SE Asian cyberpunk** aesthetic — specifically Philippine cultural textures (kulintang gong ensembles, jeepney horn harmonics, Manila market noise) fused with electronic production.

The Into the Breach precedent is instructive: Ben Prunty deliberately broke the convention that strategy game music should be quiet, creating rhythmic tension that energized rather than accompanied. Robot Uprising faces a harder version of this problem — it needs music that energizes during Plan, builds unbearable tension during Sealed Watch, and then clears to clinical calm during Inspector, all within the same session.

---

## Option A: "The Kulintang Machine" — Philippine Gong Electronica

### What It Is

The sonic foundation is the **kulintang** — a row of small horizontally-laid gongs from the Southern Philippines (Maguindanao, Maranao traditions) that produce interlocking melodic patterns. In Robot Uprising, the kulintang is processed through electronic production: granular synthesis stretching individual gong strikes into drones, side-chained to a four-on-the-floor kick that only enters during Sealed Watch, ring-modulated through digital distortion during buffer overflow events.

**The core idea:** The game's soundtrack IS a kulintang ensemble where each instrument maps to a game system:
- **Kulintang melody** (8 small gongs) = the 8 columns of the board. As units occupy columns, those gongs enter the mix. An empty board is near-silence. A full board is a complete melodic pattern.
- **Agung** (large hanging gong) = tick clock. Each tick is an agung strike — deep, resonant, reverberating for the full 1-second tick duration.
- **Gandingan** (four suspended gongs) = the four primitive types (skills, rules, hooks, context). When a player edits a primitive in the workbench, the corresponding gandingan pitch sounds.
- **Dabakan** (single-headed drum) = combat. Every elimination is a sharp dabakan strike — dry, immediate, final.
- **Babendil** (small timekeeper gong) = signal delivery. Every successful hook transmission pings the babendil — bright, cutting, almost like a notification chime.

**Plan Phase Music:**
A slow, meditative kulintang pattern plays at ~70 BPM, polyrhythmic and slightly unpredictable (traditional kulintang doesn't follow Western meter). As the player adds units to the board, additional gong voices layer in. The effect is organic, growing — like watching a rice terrace fill with water level by level. Sub-bass hum beneath, barely audible, from a processed agung drone. When the player opens the blueprint editor, a gentle high-frequency shimmer (processed babendil harmonics) replaces the melody, signaling "you're in the detail view now."

**Sealed Watch Music:**
The moment EXECUTE is pressed, the kulintang pattern accelerates to ~120 BPM and a synthetic kick drum enters. The agung strikes now coincide with each tick — massive, room-filling low-end that you feel in your chest. The kulintang melody becomes a driving ostinato. Between ticks, the melody fragments, leaving only the reverb tail and the sub-bass — creating a breathing pattern of IMPACT-silence-IMPACT-silence. As units are eliminated, their corresponding gong voice drops from the mix. By the endgame, if your army is decimated, the music has thinned to almost nothing — just the tick clock agung and a ghost of melody. If you're winning, the full ensemble stays rich and complex.

**Inspector Music:**
All percussion drops. The kulintang gongs are stretched via granular synthesis into long, shimmering drones — each gong's timbre recognizable but transformed into something ambient and clinical. A soft pad of processed agung harmonics fills the low-mid frequencies. The timeline scrubber controls the pitch — scrubbing backward lowers the drone, scrubbing forward raises it. The effect is somewhere between a meditation room and a forensics lab.

**Transition Sound — The Seal:**
When Sealed Watch ends and Inspector begins, a single massive agung strike rings out and decays over 4 seconds while the screen transitions. This is "the seal breaking" — the emotional-to-analytical handoff. The decay of the agung IS the transition duration.

### Sensory Description

**Plan phase:** You hear soft metallic pinging — irregular, organic, like wind chimes made of bronze. As you drag a Scout onto the board, a new voice enters, higher-pitched, bright. The workbench has a subtle ambient hum, like electronics in a warm room. Each config change (toggling a skill, reordering a rule) produces a short melodic fragment — two or three gong strikes in sequence, pitched to the unit type. The channel map panel, when hovered, adds a faint reverb wash that makes the space feel larger.

**Sealed Watch:** BOOM — the agung hits and the kick drum drops. Your pulse rises. Each tick is visceral: the deep gong, then a half-second of silence where you can hear only the reverb tail, then the board snaps to its new state with a chorus of smaller sounds (movement clicks, signal pings, the bright babendil for hook transmissions). A combat elimination cuts through everything — a sharp dabakan strike with a 200ms digital glitch tail, like a record scratch made of static. Buffer overflow on a unit produces a rising electronic whine that resolves with a dull thud (the evicted data "hitting the floor").

**Inspector:** Calm. The gong drones wash over you. Clicking a unit to inspect it produces a soft, hollow pop — like tapping the side of a ceramic bowl. The buffer state visualization has its own sonic texture: occupied slots emit a faint hum at different pitches (creating an evolving chord as you scrub through ticks), empty slots are silent, and the moment a signal is dropped, there's a tiny descending tone — a miniature sigh.

### Player Journeys

#### Journey: Reyes, 28, Filipino game developer in Cebu

**Context:** Mission 3, just unlocked hooks. Has been playing for 40 minutes. Grew up hearing kulintang at cultural festivals.

**Minute 0:00 — Plan Phase Entry**
Reyes hears the kulintang melody and pauses. The recognition is instant — those are kulintang tones, but processed, electronic, wrong in a beautiful way. The traditional 2-3-2-1 melodic contour is there but stretched, digitized, layered over a sub-bass that wouldn't exist in a real ensemble. He grins. This is HIS instrument, remixed for a robot war.

**Minute 0:30 — Blueprint Editing**
He opens the Scout blueprint. The high-frequency shimmer replaces the melody — he's in "detail mode" aurally. He toggles the patrol skill on: two bright gong strikes, ascending. He configures a hook to broadcast on "enemy-spotted": a quick three-note descending pattern on the babendil, like a notification jingle. Each config change SOUNDS different — skills have ascending tones, rules have neutral tones, hooks have descending tones, context config has a resonant drone shift.

**Minute 2:00 — EXECUTE**
The agung HITS. The kulintang accelerates. The kick drops. Reyes is frozen, watching. Tick 1: his Scout moves, a soft movement sound (servo whir + footstep on terrain — jungle terrain has a soft crunch, city terrain has a metallic tap). Tick 3: the Scout's hook fires — babendil ping, bright and cutting, followed by a green cell flash on the board. Tick 5: the Striker receives the signal — another babendil, this one slightly lower-pitched (the relay degraded the signal?), and the Striker pivots.

**Minute 3:30 — Combat**
Tick 8: Striker adjacent to enemy. DABAKAN — the dry drum crack. A digital glitch tail, like audio breaking apart. The enemy sprite shatters. The enemy's gong voice drops from the mix. The music thins slightly. Reyes exhales.

**Minute 4:00 — Seal Breaks**
The final tick resolves. MASSIVE agung strike. 4-second decay. The screen darkens, then brightens into Inspector mode. The drone washes in. Reyes feels the shift — from adrenaline to calm — carried entirely by the audio transition.

**Minute 5:00 — Inspector**
He clicks the Scout at Tick 3 (the hook fire). Soft ceramic pop. The buffer visualization hums — 4 occupied slots creating a minor-key chord, 2 empty slots silent. He scrubs to Tick 5 and one slot changes pitch — the signal arrived. The chord resolves to major. He smiles. The sound TOLD him the signal arrived before he read the slot contents.

**UI Annotations:**
- Plan phase ambient: ~70 BPM kulintang, polyrhythmic, layered with unit placement
- Config change sounds: skills (ascending 2-note), rules (neutral 2-note), hooks (descending 3-note), context (drone shift)
- EXECUTE transition: agung + kick drop, 0.5s build
- Tick clock: agung strike, 1s interval
- Signal delivery: babendil ping, pitch varies by hop count
- Combat: dabakan + 200ms digital glitch tail
- Seal break: single agung, 4s decay
- Inspector click: ceramic pop, buffer slots as pitched hum

#### Journey: Sarah, 35, indie game audio designer in Portland

**Context:** Mission 7, post-factory introduction. Professional interest in the audio implementation. Has never heard kulintang before playing.

**Minute 0:00 — Plan Phase, Deep Configuration**
Sarah has 4 blueprints in her production queue. The conveyor belt strip at the bottom has its own subtle sound — a soft mechanical rhythm, like a tiny assembly line. Each blueprint icon she drags produces a satisfying weighted thunk (heavier for expensive units, lighter for cheap ones). The kulintang melody is now complex — she has units across 6 of 8 columns, so 6 gong voices are layered. She notices that the melody creates different harmonies depending on which columns are occupied. Columns A and E together sound consonant. Columns B and F sound dissonant, slightly unsettling.

**Minute 1:00 — Channel Wiring**
She's wiring a hook from her Scout to her Relay. As she types the channel name "scan-report" in the autocomplete field, each keystroke produces a tiny click — but the autocomplete suggestions each play a faint preview of that channel's sonic signature. She picks "scan-report" and a soft wash of signal-green tone plays. She already has a "critical-alert" channel, which previews in amber-warning tone. The channels have COLOR-coded sounds, not just colors.

**Minute 2:30 — EXECUTE (Complex Battle)**
14 units on the board. The Sealed Watch music is DENSE — full kulintang ensemble, driving kick, plus a new element she hasn't heard before: a pulsing electronic heartbeat that wasn't present in earlier missions. This is the "EM noise" — the sound of her deep hook architecture creating electromagnetic emissions. The more hooks she's wired, the louder the pulse. 6-hook-slot Command unit makes the pulse prominent. She realizes: the audio is telling her that her architecture is LOUD. The enemy can hear her.

**Minute 3:00 — Buffer Overflow Event**
Tick 12: her Relay's buffer fills to capacity. A rising electronic whine, starting at 2kHz and climbing to 6kHz over 500ms, cuts through the mix. The unit's buffer bar flashes. Then a dull thud — the oldest data evicted. The whine drops back to a residual buzz for the rest of the tick. She can HEAR which unit is overloaded without looking at the buffer bars.

**Minute 3:30 — Chain Reaction**
Tick 15: Scout hook fires (babendil), Relay receives and compresses (a distinctive "squish" sound — like data being wadded into a ball), Relay broadcasts compressed signal (babendil, lower pitch, heavier), Striker receives (babendil, lowest pitch) and engages (movement servo). The whole chain plays out as a descending melodic phrase — ping, squish, PING, PING — in under a second. Sarah recognizes this as a **sonic signature of a successful hook chain**. The chain sounds like a musical phrase. A broken chain (dropped signal) would leave the phrase hanging — an unresolved melodic fragment.

**Minute 5:00 — Inspector Deep Dive**
She opens the queue depth chart for the Relay. As the chart renders, each bar height is sonified — taller bars (higher fill) produce higher pitches. Scrubbing through the chart plays a quick melody: the shape of the buffer-fill-over-time as a musical contour. A spike to full capacity plays as a sharp ascending run. A gradual decline plays as a gentle descending glissando. She's hearing the buffer history as a melody.

**UI Annotations:**
- Conveyor belt: soft mechanical loop rhythm, responds to drag-reorder
- Blueprint drag: weighted thunk sound, mass proportional to cost
- Channel preview: color-coded tonal signature per channel name
- EM noise: pulsing electronic heartbeat, volume scales with hook depth
- Buffer overflow: rising whine (2kHz→6kHz, 500ms) + eviction thud
- Compression skill: "squish" sound (data compaction metaphor)
- Hook chain: descending babendil melody — pitch drops per hop
- Queue depth sonification: buffer fill history as musical contour

#### Journey: Tomás, 14, first strategy game, playing on laptop with earbuds

**Context:** Mission 1, the very first tutorial. Has never heard of kulintang. Plays mostly Fortnite and Minecraft.

**Minute 0:00 — Boot Log**
The game opens with a black screen. Text appears character by character — the boot log narrative. Each character has a faint typewriter click, but every 4th line, a single kulintang gong rings out, slightly different pitch each time. It sounds alien to Tomás — not like any game soundtrack he knows. Not synthwave, not orchestral, not chiptune. Something ancient processed through something digital. The gongs get closer together as the boot log accelerates. By the time the boot log finishes, a full kulintang melody is playing.

**Minute 0:30 — First Plan Phase**
The board appears. Tomás has one pre-placed Scout. The kulintang is minimal — one gong voice for the one occupied column. A second is offered: the tutorial tells him to drag the Scout to a different position. He drags. As the unit ghost moves across columns, he hears the gong voice SHIFT — each column has a slightly different pitch. When he drops the unit on column D, the D-gong enters the mix. He didn't consciously notice, but his brain registered: position changes SOUND.

**Minute 1:00 — First Config**
Tutorial says to toggle the "evade" skill off. He clicks the toggle. A descending two-note tone. Subtle but present. The tutorial says "Good — now your Scout will hold position instead of dodging." The sound reinforced: something was REMOVED. The descending tone = subtraction. He gets this intuitively without thinking about it.

**Minute 1:30 — First EXECUTE**
He presses the big EXECUTE button. The button itself has a satisfying heavy click — spring-loaded, mechanical, like a breaker switch on a power grid. Then the agung HITS. Even through earbuds, the low-frequency gong fills his head. The kick drops. His Scout moves. Movement sounds are crisp: servo whir, terrain crunch. The tick clock is FELT, not just seen — each agung strike is spaced exactly 1 second apart, creating a heartbeat that his own pulse starts to match.

**Minute 2:00 — First Signal**
The Scout's hook fires for the first time. PING — the babendil, bright and unexpected, cuts through the rhythmic fabric. A green flash on the board. Tomás doesn't know what just happened, but the sound told him it was GOOD — the babendil tone is major-key, rising, resolved. If a signal had been dropped, he'd have heard a minor-key, falling, unresolved fragment. The emotional valence is encoded in the interval.

**Minute 2:30 — Mission End**
The enemy is eliminated. Dabakan crack. The music thins to the agung reverb tail. Then the seal-breaking agung. Inspector opens. Tomás pulls out one earbud — the drone is too calm, too different from what he's used to. But when he clicks a unit and hears the buffer chord, he puts it back in. There's something happening in the sound that isn't happening visually.

**UI Annotations:**
- Boot log: typewriter clicks + periodic kulintang gongs accelerating
- Unit drag: column-gong pitch shifts as ghost crosses columns
- Skill toggle off: descending 2-note (subtraction)
- Skill toggle on: ascending 2-note (addition)
- EXECUTE button: mechanical breaker-switch click
- Agung tick: 1s heartbeat pacing, entrains player pulse
- Signal success: major-key babendil (rising, resolved)
- Signal failure: minor-key fragment (falling, unresolved)
- Combat elimination: dabakan + enemy gong voice drops from mix

---

## Option B: "The Server Room" — Industrial-Electronic Ambient

### What It Is

Forget cultural instruments. The sonic world of Robot Uprising is a **data center** — humming server racks, cooling fan drones, HDD seek-head chattering, the barely-audible 60Hz electrical hum of transformer rooms. The music is generated procedurally from the game state, like Factorio's approach taken to its logical extreme: every sound in the game IS the game.

**Plan Phase:**
Near-silence. A deep 50Hz hum — the "power grid" — always present, like tinnitus. When the player opens a blueprint, a soft whir (fan spin-up) layers in. Config changes produce mechanical clicks — not musical, not tonal, just the sound of switches being thrown, relays engaging, connectors seating. The production queue conveyor belt has an actual belt sound — a rhythmic slap-slap-slap at the production rate. It feels like sitting in a server room at 3am with headphones off.

**Sealed Watch:**
The power grid hum intensifies. Each tick is a heavy CLUNK — a breaker engaging. Unit movements are servo whirs with different motor characteristics per unit type (Scout = high-RPM small motor, Striker = low-RPM torque motor). Signal transmissions are data-modem sounds — the chirp-screech of a dial-up handshake compressed into 100ms. Combat is an electrical arc — a sharp ZAP with a crackle tail. Buffer overflow is the sound of a hard drive thrashing — rapid clicking, head seeking, then a sudden silence when data is evicted (the head parks).

**Inspector:**
White noise at -40dB — the quietest sound. Like being in an anechoic chamber. Each click on a unit produces a soft data-read sound — the subtle whir of an SSD accessing a sector. Buffer state visualization is rendered as spectral tones — each slot has a frequency, occupied slots emit a sine wave at that frequency. Together they create an alien chord that shifts as you scrub.

### Sensory Description

**Plan phase:** Silence, broken by purposeful mechanical sounds. You feel alone in a vast, humming space. The 50Hz power drone is comforting — the factory is alive. Every config toggle CLACKS. Every drag produces a rail-slide sound. The total absence of music focuses attention on the work. When the production queue fills with 4+ blueprints, the belt rhythm becomes a polyrhythm against the power grid hum — inadvertent music emerging from industry.

**Sealed Watch:** CLUNK. The breaker fires. Then chaos — motors whirring, modem chirps overlapping, the power grid straining under load (the hum gets slightly louder and more distorted as more units are active). Combat ZAPs cut through like lightning strikes. The soundscape is DENSE in a way that communicates "many things are happening simultaneously" without any musical organization. It's overwhelming by design — the same information overload your agents are experiencing.

**Inspector:** Cathedral-like quiet. Forensic. Your own breathing is the loudest thing. Each interaction produces a single clean sound in the void. The spectral buffer tones hover like ghosts.

### Player Journeys

#### Journey: Alex, 31, SRE (Site Reliability Engineer) at a cloud company

**Context:** Mission 5, factory just introduced. Alex spends their workdays in actual server rooms.

**Minute 0:00 — Recognition**
The Plan phase loads. Alex hears the 50Hz hum and laughs — that's the exact frequency of a 240V transformer. The white noise floor sounds like rack-mounted cooling. When they open the first blueprint editor, the fan-spin-up sound is eerily similar to a Dell PowerEdge booting. The game is making them feel like they're at work, and somehow that's... fun? Because at work, they manage systems that manage other systems, and that's exactly what Robot Uprising asks them to do.

**Minute 1:30 — Factory Configuration**
The production queue belt sound starts up: slap-slap-slap. Alex drags blueprints to reorder. Each blueprint has a different mass — the Relay (5 minerals) produces a light slide sound, the Command (10 minerals) produces a heavy grinding slide. Cost is communicated sonically. When they over-commit the queue (total cost exceeds resources), the belt sound stutters and coughs — a motor under load.

**Minute 3:00 — Sealed Watch**
CLUNK. The breaker. Alex's 14-unit army activates. The soundscape explodes into industrial noise — but organized industrial noise. They can pick out individual sound layers: the Scout's high-RPM whine tracking across the board, the Relay's constant modem-chirp as it processes signals, the Striker's heavy motor activating only when engagement range is reached. It sounds like a healthy data center — many components, each doing their job. When a unit is eliminated (ZAP-crackle), the sound DIES — one layer removed from the mix, leaving a hole in the frequency spectrum. Alex viscerally notices because the spectrum gap feels like a server going down.

**Minute 4:30 — Buffer Overflow**
The HDD-thrash sound is unmistakable to Alex. They know that sound in their bones — the sound of a system swapping, running out of memory, about to crash. In the game, it means their Relay's buffer is full. The rapid clicking intensifies, then cuts to silence (eviction). Alex's stress response activates — the same response that pages them at 2am. The game has weaponized their professional anxiety into engagement.

**UI Annotations:**
- Power grid: 50Hz hum, always-on, intensity scales with unit count
- Fan spin-up: blueprint editor open
- Mechanical click: every toggle, button, config change
- Belt rhythm: production rate as slap-slap tempo
- Blueprint mass: drag sound weight proportional to cost
- Over-commit: belt stutter/cough
- Servo per unit type: Scout (high RPM), Striker (low torque), Relay (static hum)
- Signal: compressed modem chirp (100ms)
- Combat: electrical arc (ZAP + crackle)
- Buffer overflow: HDD thrash → silence
- Inspector: anechoic silence + sine-wave buffer slots

#### Journey: Min-ji, 22, music production student, never worked in IT

**Context:** Mission 2, second time playing.

**Minute 0:00 — Ambient Fascination**
Min-ji doesn't recognize the server room sounds as literal. To her, the 50Hz hum is a drone note — a foundation for layering. The mechanical clicks of config changes sound like prepared piano or musique concrète. She starts toggling settings partly to hear the sounds they make, treating the workbench as a sound instrument.

**Minute 1:00 — Emergent Rhythm Discovery**
She's configuring the production queue. The belt sound (slap-slap) runs at the production rate. She adds a second blueprint — the queue tempo adjusts. She starts tapping her desk in rhythm with the belt. When she places the EXECUTE button's breaker-CLUNK at the downbeat of the belt rhythm, there's a satisfying rhythmic resolution. The game isn't trying to be musical, but the mechanical sounds have enough periodicity that musical patterns emerge. She thinks: "this is like if Autechre made a strategy game."

**Minute 2:30 — Sealed Watch as Performance**
The battle soundscape is overwhelming. Min-ji closes her eyes and just LISTENS. She can track the spatial position of units by their motor sounds — the Scout's whine pans left as it moves left on the grid. The modem chirps create an irregular rhythm. The ZAPs are accents. She's hearing the battle as a piece of music — chaotic, generative, unrepeatable. When the battle ends and Inspector's silence arrives, the contrast is ASMR-level satisfying.

**UI Annotations:**
- Sound as instrument: config changes as prepared piano
- Emergent rhythm: belt tempo + production rate = polyrhythm
- Spatial panning: unit sounds pan with grid position
- Generative music: battle soundscape as procedural composition
- Silence contrast: Inspector emptiness as artistic resolution

---

## Option C: "The Neon Pulse" — Synthwave with Filipino Flavor

### What It Is

A more conventional approach: authored synthwave tracks with Filipino musical elements woven in. Arpeggiated synths, analog bass, reverb-drenched pads, but with kulintang melodic fragments, rondalla guitar textures, and kundiman-inspired vocal samples (wordless, melancholic, processed through vocoders). The Into the Breach approach — composed tracks that break genre expectations — but aimed at SE Asian cyberpunk instead of mech-apocalypse.

**Plan Phase:**
Lo-fi synthwave at ~80 BPM. Analog bass pulse (root note of the mission's key). Arpeggiated synth pad cycling through a 4-chord loop. Rondalla guitar (a Philippine string ensemble instrument) picked dry over the top, playing a simple melody. It sounds like "studying at a Manila café at midnight while it rains outside." Warm, focused, slightly melancholic. When the player enters the blueprint editor, the guitar drops and a vocoder hum replaces it — more technical, more focused.

**Sealed Watch:**
The BPM doubles to ~160. The bass becomes aggressive — sidechained to the tick clock, pumping on every beat. The arpeggiator accelerates. A cyberpunk drum machine (TR-808 variant with distortion) enters. The kulintang melody from the Plan phase returns but pitched up an octave and quantized to the grid — the organic has become mechanical. The music is the same material, transformed by urgency. Between ticks, the volume ducks 6dB — creating a breathing effect synchronized to the game clock.

**Inspector:**
The BPM halves back to ~80. All percussion drops. The reverb increases to 100% wet. The vocoder hum becomes the primary voice — singing a wordless kundiman melody, slow and mournful. It sounds like the aftermath of something. Like reading a letter from someone who didn't make it. The emotional register is intentionally somber — even when the player won, the Inspector phase acknowledges the cost.

### Sensory Description

**Plan phase:** Warm analog wash. The bass pulses like a heartbeat at rest. Guitar plucking is intimate — close-miked, you can hear the fingertip on nylon. The arpeggiated synth sparkles behind the guitar like city lights reflected in wet pavement. When you hover over the channel map, the guitar adds a subtle wah-wah effect — the channels are vibrating, alive.

**Sealed Watch:** The world accelerates. The pump of the sidechain compression on the bass makes the air feel like it's being squeezed in and out of your lungs. The TR-808 kick hits hard, clipped, distorted. The kulintang melody that was organic in the Plan phase is now locked to the grid — its Philippine character still present but regimented, militarized. Between ticks, the 6dB duck creates a physical sensation of the world pausing to breathe before the next tick resolves.

**Inspector:** Haunted. The reverb turns the room into a cathedral. The vocoder kundiman melody is human but alien — you can hear the voice trying to form words but the digital processing won't let it. It's beautiful and unsettling. This is the sound of looking at data and finding stories in it.

### Player Journeys

#### Journey: Kenji, 40, Factorio veteran, listens to synthwave while coding

**Context:** Mission 6, mid-campaign. Has played Factorio for 2000+ hours with synthwave playlists.

**Minute 0:00 — Instant Comfort**
The Plan phase loads. Kenji immediately recognizes the genre: synthwave. But there's something else — the guitar isn't a standard synthwave lead. It has a different timbre, a different scale. The rondalla plucking creates intervals he doesn't expect from Western pop-influenced synthwave. He can't name it, but it makes the familiar genre feel fresh.

**Minute 2:00 — Production Tuning**
He's optimizing his factory output. The production queue belt sound (from the game's SFX layer) plays OVER the synthwave track — the belt rhythm and the music's BPM are synchronized at 80 BPM. When he adjusts the production rate, the belt tempo shifts, and it goes slightly out of sync with the music before locking back in on the next bar. This micro-desynchronization creates a J Dilla-style rhythmic tension that Kenji, as a music listener, finds deeply satisfying.

**Minute 3:00 — EXECUTE to 160 BPM**
The track doubles tempo. Kenji's head starts nodding involuntarily. The sidechain pump matches the tick clock. He's watching his agents execute a complex flanking maneuver — Scout broadcasts, Relay compresses, Striker engages — and each system event (babendil ping, compression squish, dabakan strike) lands ON BEAT. The SFX are quantized to the music grid. The battle IS the music's percussion section.

**Minute 4:30 — Inspector**
The tempo halves. The vocoder kundiman enters. Kenji, normally the type to skip debriefs, stays in Inspector mode because the music is too good to leave. He scrubs through the timeline, and the vocoder melody phases slightly with each tick — creating a phaser-like effect that makes the debrief feel dreamlike. He spends 3 minutes in Inspector. His previous average was 45 seconds.

**UI Annotations:**
- Plan BPM: 80, synced to production queue belt
- Guitar: rondalla, Philippine intervals within synthwave framework
- EXECUTE: tempo doubles to 160, sidechain pump enters
- SFX quantization: game events land on musical beats
- Inspector: half-tempo, 100% wet reverb, vocoder kundiman
- Timeline scrub: phases vocoder melody

---

## Option D: "Adaptive Silence" — Minimal + Procedural

### What It Is

Almost no authored music. Instead, a sophisticated system of **sonic feedback** where every game event has a sound, and the totality of those sounds IS the soundtrack. Inspired by Factorio's approach (where the factory itself creates the ambient soundscape) but designed for a smaller, more intimate game.

**The philosophy:** Silence is the default. Every sound must be earned by a game event. The player builds the soundtrack by building their army.

**Plan Phase:**
No music. Board ambient only — a faint electronic hum from the grid itself, cicada-like synthesizer chirps (SE Asian night ambience processed through a resonant filter). Each unit placement adds a subtle persistent tone to the ambient layer. By the time 6 units are placed, the ambient has evolved into a chord. Config changes produce UI feedback sounds only — no musical embellishment. The effect is focus — nothing competes with the player's thinking.

**Sealed Watch:**
The tick clock creates a rhythmic backbone. Every game event adds a sound. Over 30-60 ticks, a complex layered soundscape emerges organically — never the same twice. The player's architecture determines the "genre": a communication-heavy architecture (many hooks, deep relay chains) sounds chattery and electronic (lots of babendil pings, modem chirps). A combat-heavy architecture (many Strikers, few Relays) sounds percussive and violent (dabakan strikes, servo motors). The sonic profile of a battle is a direct readout of the underlying architecture.

**Inspector:**
Near-silence returns. Only the buffer chord (one tone per occupied slot) and interaction sounds. The contrast to Sealed Watch is maximum.

### Strengths (Across All Options)
- **D uniquely rewards replay.** Each configuration produces a different soundscape. Players will replay to hear what their new architecture sounds like.
- **D is technically simplest.** No authored music to license, compose, or loop-point-edit.
- **D has the strongest "audio tells."** When every sound maps to a game event, experienced players can HEAR problems before they see them.

### Weaknesses
- **D is alienating for new players.** Silence + sparse SFX feels unfinished, like a game without music. First impressions suffer.
- **D requires exceptional SFX quality.** Every individual sound must be polished enough to stand alone. No music bed to hide rough edges.

---

## Sound Effect Taxonomy (Universal Across All Options)

Regardless of which music option is chosen, these SFX should exist:

### Plan Phase SFX

| Event | Sound | Emotional Valence |
|-------|-------|-------------------|
| Unit placed on board | Weighted thunk (mass ∝ cost) + column gong | Satisfying, constructive |
| Unit removed from board | Reverse thunk + column gong exits | Neutral, subtractive |
| Skill toggled ON | Ascending 2-note interval | Positive, additive |
| Skill toggled OFF | Descending 2-note interval | Neutral, reductive |
| Rule reordered (drag) | Slide-click (like a card being slotted) | Tactile, mechanical |
| Hook configured | Channel-colored tone + descending 3-note | Informational |
| Channel name typed | Keystroke clicks + autocomplete soft chime | Responsive |
| Context buffer resized | Resonant drone pitch shift (up = bigger, down = smaller) | Spatial |
| Production queue drag | Rail-slide sound, weight ∝ blueprint cost | Physical |
| Ghost unit preview appears | Ethereal shimmer (high-pass filtered white noise) | Anticipatory |
| Perception radius drawn | Soft expanding ring tone (like sonar) | Spatial awareness |
| Channel wiring line drawn | Electrical crackle, soft, like static discharge | Connection |
| EXECUTE button pressed | Heavy breaker-switch CLACK | Commitment, finality |

### Sealed Watch SFX

| Event | Sound | Emotional Valence |
|-------|-------|-------------------|
| Tick clock fire | Deep agung/bass hit (1s interval) | Heartbeat, tension |
| Unit movement | Servo whir (pitch/speed varies by unit type) | Activity |
| Signal transmitted (hook fire) | Babendil ping (pitch ∝ hop count — lower = further traveled) | Information flowing |
| Signal received | Soft harmonic of the transmit ping (confirmation) | Resolution |
| Signal dropped (buffer full) | Descending minor-key fragment, unresolved | Failure, loss |
| Buffer entry evicted | Dull thud + faint descending whisper | Something forgotten |
| Buffer overflow warning | Rising electronic whine (2kHz→6kHz, 500ms) | Danger, urgency |
| Combat elimination | Dabakan strike + digital glitch (200ms) | Violence, finality |
| Unit destroyed (own) | Lower-pitched dabakan + gong voice exits mix | Loss, grief |
| Unit destroyed (enemy) | Higher-pitched dabakan + bright sparkle tail | Victory, satisfaction |
| Unit spawned from factory | Assembly whir + ascending chime | Creation |
| Territory tagged | Soft pulse + resonant hum at node | Control |
| Territory contested | Dissonant buzz (two clashing frequencies) | Tension |
| EM noise detected | Pulsing electronic heartbeat (volume ∝ hook depth) | Exposure risk |
| Compression skill | "Squish" — data wadding sound | Processing |
| Amplify skill | Volume swell + overtone bloom | Expansion |
| Filter skill | High-pass sweep — removing lows | Reduction |

### Inspector SFX

| Event | Sound | Emotional Valence |
|-------|-------|-------------------|
| Unit clicked for inspection | Ceramic bowl pop | Clinical curiosity |
| Timeline scrub (step forward) | Soft tick + pitch-up micro-shift | Progression |
| Timeline scrub (step backward) | Soft tick + pitch-down micro-shift | Regression |
| Buffer slot occupied (persistent) | Sine wave at slot-specific frequency | Data present |
| Buffer slot empty (persistent) | Silence | Data absent |
| Signal drop moment (in scrub) | Tiny descending sigh | Micro-loss |
| Queue depth chart render | Bar heights as quick ascending melody | Data visualization |
| Channel metric hover | Channel's color-coded tone + reverb wash | Connection highlight |

---

## Interaction Effects

### With Building Blocks (design-space/building-blocks/)
- The **Mixing Board Paradigm** for building blocks has a natural pairing with Option A (Kulintang Machine) — sliders adjusting attention parameters could literally control the volumes of individual kulintang voices, making the building interface and the audio system one unified metaphor.
- The **Node Graph** paradigm pairs with Option B (Server Room) — wiring nodes together sounds like plugging in patch cables.

### With Sealed Watch (locked)
- The "no skip, no pause, no tools" constraint means the player MUST sit with whatever audio is playing. This elevates audio quality from "nice to have" to "game-critical" — bad audio during Sealed Watch is a force-quit trigger.
- The 1-second tick at 0.5x speed (2 seconds between ticks) leaves long gaps where only ambient audio fills. These gaps must be designed, not empty.

### With Mobile/Touch (design-space/platform/mobile-touch-adaptation.md)
- Haptic feedback on mobile should synchronize with audio events — the agung tick clock should trigger a medium haptic pulse, combat should trigger a sharp haptic, and buffer overflow should trigger a rapid haptic burst.
- Mobile speakers handle bass poorly. Option A (Kulintang) with its prominent sub-bass agung may need a "mobile mix" with the agung transposed up an octave. Option B (Server Room) with its 50Hz hum would be inaudible on phone speakers.

### With Onboarding (design-space/onboarding/)
- Audio teaches before words do. Signal success (major-key) vs. signal failure (minor-key) communicates valence instantly. The tutorial can rely on this: "Hear that? That sound means your signal arrived."
- Option C (Synthwave) is most familiar to the target audience and least alienating for onboarding. Option D (Adaptive Silence) is worst for onboarding — silence feels broken.

### With Art Direction (design-space/aesthetics/art-direction-*)
- Option A (Kulintang) perfectly reinforces the locked SE Asian aesthetic. The audio and visuals tell the same cultural story.
- Option B (Server Room) creates productive tension — Philippine visuals with universal industrial audio. The juxtaposition communicates: "this technology is everywhere, but it's being used HERE."
- Option C (Synthwave + Filipino) is the safest complement — it matches the cyberpunk half of "SE Asian cyberpunk" while the rondalla/kundiman elements match the cultural half.

### With Competitive Analysis
- **Into the Breach** (Prunty): broke the "quiet strategy music" convention. Robot Uprising should follow suit — the Sealed Watch needs ENERGY, not calm.
- **Factorio** (procedural approach): sound accents synchronized to animation, item-specific feedback, environmental ambient from tiles. Direct inspiration for Option D and the SFX taxonomy.
- **Zachtronics** (ambient): quiet background for deep thinking. Relevant only for Plan phase.
- **Slay the Spire**: audio cues for card play success/failure. Direct inspiration for the hook-chain-as-melodic-phrase concept.

---

## Comparable Games & Media

| Reference | What It Does | What Translates |
|-----------|-------------|-----------------|
| Into the Breach | Guitar-driven tension tracks, silence during deployment, dynamic entry when battle begins | Deployment silence → battle energy pattern maps exactly to Plan → Sealed Watch |
| Factorio | Procedural soundscape from factory state, item-specific SFX, sound accents synced to animation | Game-state-driven audio, per-event feedback sounds |
| Cyberpunk 2077 | Deliberately avoided synthwave cliché, went 90s instead of 80s | Lesson: avoid generic synthwave, find YOUR version |
| Pantayo (band) | Kulintang + electronic fusion, kulintang gongs processed through synths and effects | Direct sonic template for Option A |
| Shenzhen I/O | In-game FM synthesizer, ambient "music for thinking" | Plan phase needs to support focus, not distract |
| FTL | Dynamic music layers that add/remove based on combat state | Layer addition/removal based on board state |

---

## The TikTok Clip (Audio Perspective)

**Option A clip:** A 15-second Sealed Watch excerpt where you can see AND hear a hook chain fire — Scout babendil ping, Relay squish, Striker babendil, dabakan combat strike — the chain sounds like a descending musical phrase that ends in an explosion. The viewer thinks: "the gameplay has a MELODY?"

**Option B clip:** Extreme contrast — silent Plan phase (mechanical clicks), then the EXECUTE breaker-CLUNK and suddenly the server room is alive with layered industrial noise. The "factory turns on" moment.

**Option C clip:** The BPM-doubling moment. Lo-fi chill plan phase, then EXECUTE and the same music TRANSFORMS — tempo doubles, bass drops, the gentle rondalla becomes a regimented kulintang machine. The viewer recognizes the song but it's been weaponized.

**Option D clip:** A complex late-game battle where the procedurally-generated soundscape is accidentally beautiful — overlapping signal pings, rhythmic factory spawns, and combat strikes create an unplanned polyrhythm. The caption: "my agent architecture made this beat."

---

## Recommendation Matrix

| Criterion | A: Kulintang | B: Server Room | C: Synthwave | D: Silence |
|-----------|-------------|----------------|-------------|-----------|
| Cultural identity | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ |
| Onboarding friendliness | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ |
| Replay variety | ★★★★☆ | ★★★★★ | ★★★☆☆ | ★★★★★ |
| Implementation complexity | ★★★★☆ | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| Streamer/content appeal | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |
| Sealed Watch tension | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Inspector calm | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★★ |
| Distinctiveness | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ |

No decision is made here. All four are valid. But Option A is the most distinctive, most culturally resonant, and most likely to produce a "what IS that sound?" reaction that drives word-of-mouth.
