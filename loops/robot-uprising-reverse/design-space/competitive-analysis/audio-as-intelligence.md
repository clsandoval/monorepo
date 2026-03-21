# Competitive Analysis: Audio-as-Intelligence in the Sealed Watch

**Aspect:** 1.20d — Audio-as-intelligence in sealed watch
**Category:** Competitive Analysis (Wave 1)
**Question:** Cogmind players identify threats by sound before seeing them; should Robot Uprising's sealed watch include audio signals that experienced players learn to decode? Signal chain sounds whose pitch/pattern indicates network health.

---

## The Precedent: Cogmind's "Ears Before Eyes" System

Cogmind (Grid Sage Games, solo developer Kyzrati) ships over 1,000 sound effects — more than any other roguelike by an order of magnitude. The design philosophy is simple: **if a sound effect will make the game easier to play, include it.** But the deeper insight is that Cogmind uses audio as a parallel information channel to its dense ASCII visual display.

### How It Works Mechanically

Every weapon type in Cogmind has a distinct sound profile. Kinetic weapons thud and rattle. Lasers hum and whine. Explosives boom with bass. Electromagnetic weapons crackle. These sounds are distance-attenuated — louder when close, fading when far. The critical gameplay implication: **once a player has internalized the sound vocabulary, hearing a burst of laser fire around a corner tells them a Programmer or similar laser-wielding enemy is fighting nearby, even without line of sight.** The player can make tactical decisions — engage, avoid, prepare the right countermeasure — before visual confirmation.

Cogmind extends this further with a "visible SFX" system that renders the origin point of off-screen sounds on the map. A battle happening three rooms away produces both audio cues and a visual ping showing its location. An "audio log" panel lists all currently audible sounds in text form, creating redundancy across three channels: audio, visual overlay, and text log. This triple-channel approach means the information reaches the player regardless of which sense they're attending to.

The ambient sound system adds another layer. Machines hum, generators drone, doors creak. Destroying or disabling a sound source silences it. This means **silence itself becomes information** — a quiet factory floor tells you the machines have been destroyed, even if you haven't scouted the area.

### What Makes It Work

1. **Sound vocabulary is learned, not taught.** No tutorial says "this is the sound of a Grunt's ballistic cannon." Players absorb it through exposure. The 50th time you hear that particular staccato burst, you know what's coming.
2. **Audio provides temporal advantage.** Sound travels faster than scouting. You hear the fight before you see the fight. This creates a window for decision-making that purely visual games don't offer.
3. **Audio bandwidth is independent of visual bandwidth.** Cogmind's screen is a 160x60 terminal grid packed with information. Audio lets the game deliver more data without adding more visual noise.

---

## Comparable Games: The Audio Intelligence Spectrum

### Hunt: Showdown — "The Sound Trap Ecosystem"

Hunt: Showdown builds its entire competitive identity around audio intelligence. The game's CrySpatial 3D audio system uses Head-Related Transfer Functions (HRTF) for precise directional audio — players can locate a gunshot's origin by ear alone, distinguishing left from right, above from below. But the masterclass is in environmental sound design.

**Sound traps** litter every compound: caged chickens squawk when you pass, dogs bark, horses whinny, glass shards crunch underfoot, hanging tin cans rattle. These are not ambient decoration — they are **player-generated intelligence signals.** A skilled Hunt player approaching a building listens for: Did the chickens already trigger? (Someone passed through.) Are the dogs barking directionally? (Enemy is northwest.) Is that a Mosin-Nagant report or a Sparks? (Different engagement ranges.)

The skill ceiling is in **reading absence.** Experienced players notice when environmental sounds *don't* trigger. If you hear nothing from a compound's dogs as you approach, either nobody is there or someone used the Beastface trait to reduce animal reaction range — and that *itself* is information about their loadout.

Audio obstruction matters too: gunfire behind stone sounds different from gunfire behind wood. Footsteps on metal grating sound different from footsteps on dirt. Players learn to read material composition by ear.

**Key lesson for Robot Uprising:** Hunt proves that audio-as-intelligence creates an entire skill dimension that separates novices from experts. The information is available to everyone but *legible* only to the experienced.

### Dead by Daylight — "The Terror Radius"

Dead by Daylight's Terror Radius is the purest example of audio encoding proximity. When a Survivor enters the Killer's Terror Radius (typically 32 meters), they hear a heartbeat. The heartbeat has three layers that correspond to proximity zones — distant thudding in the outer third, elevated tempo in the middle third, frantic pounding in the inner third. A fourth layer activates during active chase.

The genius is in the **violations of the pattern.** Certain Killers modify or suppress their Terror Radius. The Wraith has none while cloaked. The Shape (Michael Myers) starts with zero Terror Radius and grows it as he stalks. Freddy Krueger's manifests as a lullaby that provides directional information the heartbeat doesn't. Each Killer's unique Terror Radius music lets experienced Survivors identify *which* Killer they're facing by ear alone within the first ten seconds.

**Key lesson for Robot Uprising:** A consistent audio baseline that players learn to decode is powerful — but the real depth comes from **variations and exceptions** that reward advanced pattern recognition.

### Minecraft — "The Mood Engine"

Minecraft's cave ambience system operates on a "mood" percentage (0-100%). The mood increases when the player is in darkness surrounded by non-transparent blocks and decreases in open, lit areas. When mood crosses a threshold, one of 23 ambient sounds plays — distant growls, metallic scrapes, ethereal whispers.

These sounds do not directly indicate mob presence. They indicate **conditions conducive to mob spawning** — darkness and enclosure. This is a subtle but critical distinction: the audio doesn't say "there is a Creeper here," it says "this is the kind of place where Creepers spawn." The player must interpret the signal probabilistically.

Over hundreds of hours, Minecraft players develop an almost unconscious response: cave sound triggers → heightened alertness → torch placement → careful corner checks. The audio has trained a behavioral loop without ever being mechanically explicit.

**Key lesson for Robot Uprising:** Audio cues don't need to encode exact information. Encoding *conditions* or *probability* ("this network is stressed") can be more interesting than encoding facts ("relay #3 is overloaded").

### Subnautica — "The Roar Distance Problem"

Subnautica's Reaper Leviathan can be heard roaring from up to 5 kilometers away. The roar triggers only when the Reaper can see the player. But the Reaper's AI encircles before attacking, so a roar could mean it's a kilometer away or directly behind you. This creates **productive ambiguity** — the audio conveys danger but not degree, forcing the player into heightened awareness without providing enough information to feel safe.

The game also uses silence as a tool. The underwater environment is naturally quiet, and the sudden absence of ambient fish sounds in a biome signals the presence of a large predator. Players learn to read the negative space.

**Key lesson for Robot Uprising:** Ambiguous audio signals that convey threat-level without precise location create tension and engagement — especially in a sealed watch where the player cannot intervene.

### FTL: Faster Than Light — "The Systems Klaxon"

FTL uses targeted audio alarms for ship systems: a siren when environmental hazards (solar flares, ion pulsars) are about to fire, a klaxon for "POWER SURGE DETECTED" during the Flagship fight, and distinct audio for hull breaches, fires, and oxygen depletion. These are particularly crucial when the sensor system is damaged and the player cannot visually inspect rooms.

The brilliance is that **audio substitutes for broken visual systems.** When sensors go offline, the player loses visibility into room states — but can still hear fires crackling, breaches venting, and crew screaming. The audio becomes the fallback intelligence channel.

**Key lesson for Robot Uprising:** Audio becomes most valuable when it encodes information the visual channel *doesn't* — or when visual attention is saturated.

---

## Application to Robot Uprising's Sealed Watch

The sealed watch is defined by constraint: no skip, no pause, no tools. The player watches their system execute at 1 tick per second, reading the board and signal chains in real time. This constraint creates a natural opportunity for audio-as-intelligence, because:

1. **Visual bandwidth is limited.** An 8x8 grid with multiple units, signal chain lines, context bars, and cell flashes competes for visual attention. Audio provides a parallel channel.
2. **The player cannot act.** During sealed watch, the player's only job is to *observe and understand.* Audio enriches what they can observe without adding visual clutter.
3. **Signal chains are invisible processes.** Signals traveling between units via channels are abstract data flows. Sonifying them makes the invisible audible.
4. **The emotional arc matters.** Sealed watch is the "emotional" phase (before Inspector's "analytical" phase). Audio is inherently emotional — pitch, tempo, and timbre create tension, relief, dread, triumph.

### The Proposed System: "Signal Sonification"

Each channel in the player's network produces a distinct audio tone when a signal traverses it. The tone's characteristics encode the signal's properties:

**Pitch = signal urgency.** Low-priority context entries (ambient observations) produce low, warm tones. High-priority signals (threat detected, target tagged) produce higher, sharper tones. A network operating smoothly hums at a low register. A network under stress climbs in pitch.

**Pattern = signal type.** A scout's observation signal is a single clean note. A relay's compressed/filtered signal is a chord (multiple notes merged). A command agent's reassignment order is a descending arpeggio. An amplified signal is the original tone but louder and sustained.

**Rhythm = network health.** Signals arriving at regular intervals produce a steady pulse — the heartbeat of a healthy network. When context windows approach capacity, the rhythm becomes irregular, stuttering. When a unit enters context overload (stunned for 1 tick), its tone cuts out entirely — a beat of silence in the rhythm that experienced players learn to dread.

**Stereo positioning = board location.** Signals from the left side of the board pan left. Right side pans right. A player wearing headphones can track signal flow spatially: a scout reporting from the far left, relay in center processing, striker receiving on the right.

---

## Player Journeys

### Journey: Marcus, 28, Ambient Music Producer and Casual Gamer

**Context:** Mission 3, learning hooks for the first time. Has two pre-placed scouts and a relay wired to a striker. First time hearing signal sonification in a multi-unit setup.

**Minute 0:00 — The Calm Before**
Marcus hits EXECUTE. The board snaps to isometric view, tick clock at the top. His two scouts sit at B2 and F6, relay at D4, striker at E5. The first tick fires. Both scouts perceive — two clean, bell-like tones sound simultaneously, one panned slightly left (B2), one panned right (F6). The tones are low and warm. Nothing threatening detected. Marcus doesn't consciously register them yet — they blend into the ambient soundscape like background music.

**Minute 0:12 — The First Thread**
Tick 4. The left scout spots an enemy at A3. A sharper, higher-pitched tone rings from the left speaker — the urgency pitch shift. A half-second later, a softer echo of the same tone plays from center — the signal arriving at the relay at D4. Marcus's eyes are on the scout's cell flash (green), but his ears caught the relay echo. He doesn't realize it yet, but his brain is building the association: sharp tone left → echo center = scout reported to relay.

**Minute 0:30 — The Chord**
Tick 8. The relay compresses two incoming signals and forwards to the striker. The audio: two overlapping tones merge into a warm chord from center, then a moment later a clean version of that chord sounds from the right — the striker receiving. Marcus notices this one. "Oh, that sounded different — like two notes together." He's starting to hear the difference between raw signals and compressed signals. The visual signal chain lines confirm what he heard.

**Minute 0:45 — The Silence**
Tick 12. The right scout at F6 gets eliminated by an enemy striker. Its tone — which had been a steady low pulse every few ticks — simply stops. Marcus doesn't notice the visual immediately (his eyes are tracking the left side of the board), but something feels wrong. A beat passes. He looks right. The scout icon is gone, replaced by a destroyed marker. "Wait, when did that happen?" The silence told him before his eyes did, but he didn't know how to listen yet.

**Minute 1:10 — Resolution**
The battle ends. Marcus lost one scout but his striker eliminated two enemies. In the Inspector phase, he scrubs back to tick 12 and watches the right scout's destruction. He notices the audio timeline shows the scout's signal tone flatline at exactly that tick. "So that's what silence means." Next mission, he'll be listening for it.

**UI Annotations:**
- **Signal tones:** Each channel produces a synthesized bell/chime when a signal traverses it. Low C for ambient observations, rising to E-F for threat signals. Compressed signals play as major chords. Amplified signals sustain for 1.5x normal duration.
- **Stereo field:** Signals pan based on the sender's X position on the 8x8 grid. Column A = hard left, column H = hard right. Columns D-E = center.
- **Volume:** Distance-attenuated from the board's center point. Edge units are slightly quieter than center units.

---

### Journey: Priya, 34, Software Engineer and Factorio Veteran (500+ hours)

**Context:** Mission 7. Has a complex network: 2 scouts, 2 relays in a chain, 1 command agent, 3 strikers. She's been playing long enough that signal sonification is part of her reading vocabulary. She configured channel names deliberately: "recon-net" (scouts to relay 1), "processed" (relay 1 to relay 2 after compression), "strike-cmd" (relay 2 to strikers), "override" (command agent to all).

**Minute 0:00 — Reading the Orchestra**
Priya hits EXECUTE and closes her eyes for the first two ticks. She listens. Four distinct tonal voices: recon-net pings at a medium register from the flanks, processed hums as a compressed chord from center-left (relay 1's position), strike-cmd rings with a slightly metallic timbre from center-right, and override is silent — the command agent hasn't needed to intervene. "Network sounds healthy," she murmurs. She opens her eyes to confirm. All units operational, no threats detected yet.

**Minute 0:20 — The Pitch Climb**
Tick 6. Both scouts detect enemies simultaneously. The recon-net tones jump from C to F-sharp — two sharp pings in quick succession from both flanks. Priya's stomach tightens. She watches the relay process. The processed channel plays its chord, but the chord is tighter, more dissonant — the compression couldn't fully reconcile the two urgent signals. "Two contacts, different sectors. The relay's going to have to prioritize." She's reading the audio like a mixing board — the dissonance in the chord tells her the relay is under decision pressure before the Inspector could confirm it.

**Minute 0:35 — The Stutter**
Tick 9. Relay 1's context window is approaching capacity. The processed channel's rhythm, which had been a steady pulse every 2 ticks, begins to stutter — a tone plays, cuts short, plays again with a slight pitch waver. Priya recognizes this immediately: "Context pressure. It's about to overload." She watches relay 1's context bar (the tiny colored pips at the bottom of its tile) — amber, trending toward red. The audio told her before the visual bar updated.

**Minute 0:48 — The Override Breaks Silence**
Tick 12. The command agent fires. The override channel — silent until now — plays a descending three-note arpeggio, authoritative and clear, cutting through the other tones like a conductor's baton. It pans from center across the full stereo field — the command reached all units. Priya watches: the command agent rerouted one striker from the south to reinforce the north. The override tone was unmistakable. "Good. The architecture held."

**Minute 1:15 — The Flatline and the Recovery**
Tick 18. Relay 1 overloads. Its tone cuts to silence — not a gradual fade but an abrupt stop, like a note struck dead. One tick of nothing from center-left. Then, tick 19, a lower, rougher version of the processed chord returns — the relay has recovered but evicted entries, and the signal quality reflects it. The chord sounds muddier, less precise. Priya winces. "Lost fidelity. The strikers are operating on stale data now." She's already planning the Inspector review: was the eviction policy wrong? Should she have given relay 1 a larger context window or better filters?

**Minute 1:50 — Victory Hum**
The last enemy falls at tick 24. All surviving units' tones settle into a low, consonant chord — the network at rest. Priya hears it as a sigh of relief. The sealed watch ends. She pauses before entering Inspector, savoring the sound. "That override at tick 12 saved the run."

**UI Annotations:**
- **Channel-specific timbres:** Each named channel gets a subtly different timbre (synthesizer waveform). recon-net = clean sine wave. processed = warm triangle wave. strike-cmd = slightly bright sawtooth. override = deep square wave. Players don't consciously choose timbres — they emerge from channel creation order. But experienced players learn their sound.
- **Context pressure stutter:** When a unit's context window exceeds 75% capacity, its outgoing signal tone begins to exhibit micro-interruptions — 50ms silences injected into the tone. At 90%, the interruptions become rhythmic stuttering. At overload, total silence for the stun duration.
- **Dissonant chords:** When a relay compresses conflicting signals (e.g., two scouts reporting threats in opposite directions), the resulting chord contains a minor second interval — audibly tense. When signals agree (same direction, same threat), the chord is consonant — a major third or fifth.

---

### Journey: Tomoko, 41, Deaf in One Ear, Accessibility-Conscious Strategy Player

**Context:** Mission 5, factory just introduced. Tomoko has partial hearing (right ear only) and plays with mono audio enabled. She's been enjoying the game but worries about missing stereo-panned signals. She discovers the audio accessibility features.

**Minute 0:00 — The Accessibility Discovery**
Tomoko opens Settings before launching Mission 5. She finds "Audio Intelligence" with sub-options: Stereo (default), Mono (all signals centered), and "Visual Echo" — a mode that renders each signal tone as a small animated ripple on the unit that produced it, color-coded by urgency (cool blue for low, warm amber for medium, hot red for high). She enables Mono + Visual Echo. Now every audio cue has a corresponding visual pulse on the board.

**Minute 0:15 — The First Factory Run**
She hits EXECUTE. Her factory begins producing scouts from blueprints. Each unit spawn produces a brief rising tone — a "boot chime" — centered in mono. On the board, the factory tile pulses with a cyan ripple. Her first scout moves out and begins perceiving. A low tone plays — centered — and the scout's tile shows a blue ripple expanding outward. Tomoko can follow the signal flow both by ear (even with one ear) and by eye (the ripple animations).

**Minute 0:40 — The Relay Chain Visualization**
Tick 10. Scout sends a signal to relay. In mono audio, Tomoko hears the tone once (at signal send) and then a softer echo (at signal receive, one tick later). On the board, a blue ripple expands from the scout, and one tick later a matching ripple appears on the relay — visual confirmation of the audio's temporal structure. The relay processes and forwards: another ripple, slightly warmer in color (amber, because the relay's compression added urgency weighting). "Oh, I can see the signal moving across the board as ripples. That's beautiful."

**Minute 1:00 — Overload as Visual Earthquake**
Tick 15. Her relay overloads. The audio: the tone cuts to silence (same as stereo mode). The visual: the relay's ripple animation inverts — instead of expanding outward, the ripple contracts inward, collapsing into the unit like a sonic implosion, then the unit's tile jitters for the stun duration. Even without full stereo spatial information, Tomoko reads the overload instantly through the combined audio silence + visual collapse.

**Minute 1:20 — Comparative Advantage**
Tomoko finishes the mission and enters Inspector. She notices the event log has a column she hadn't seen before: "Audio Event" — each signal transmission is logged with its tone description ("recon-net: C4, low urgency" / "processed: chord [C4+E4], compressed" / "OVERLOAD: silence, 1 tick"). This text log is the third channel — audio, visual ripple, and text — ensuring the information reaches her regardless of her hearing limitations.

**Minute 1:45 — Resolution**
Tomoko rates the accessibility a 9/10. The mono mode loses the spatial dimension but the Visual Echo compensates. She leaves Visual Echo on permanently — she finds the ripple animations beautiful and informative even when she can hear the tones. "I wish every strategy game did this."

**UI Annotations:**
- **Visual Echo mode:** Each signal transmission triggers a circular ripple animation on the sending unit's tile. Ripple color: blue (urgency 0-3), amber (urgency 4-6), red (urgency 7-10). Ripple expands over 0.3 seconds and fades. Signal receipt on the receiving unit triggers a smaller, matching ripple one tick later.
- **Overload visual:** Ripple inverts (contracts inward) and the tile jitters horizontally 2px for the stun duration. Combined with audio silence, this creates a "signal collapse" effect readable in any hearing condition.
- **Audio Event log column:** Inspector event log includes a column describing each audio event in text. Useful for accessibility and for players who want to correlate what they heard with what happened mechanically.
- **Mono mode:** All spatial panning collapsed to center. Volume differences based on urgency/proximity preserved. No information lost — just spatial dimension.

---

## Strengths

1. **Parallel information channel.** The sealed watch's visual bandwidth is finite — 8x8 grid, signal lines, context bars, cell flashes. Audio adds an entirely separate channel that doesn't compete for screen space. Experienced players can process both simultaneously, effectively doubling their information intake.

2. **Skill-based legibility.** Like Cogmind's weapon sounds and Hunt: Showdown's environmental audio, signal sonification rewards accumulated experience. A novice hears pleasant sounds. A veteran hears "relay 2 is about to overload, the scout on the east flank just detected a high-priority threat, and the command agent hasn't responded yet." Same audio, different information extraction.

3. **Emotional amplification.** The sealed watch is the emotional phase. Audio is inherently emotional in ways that visual displays are not. A rising pitch creates tension. A sudden silence creates dread. A resolving chord creates relief. The audio transforms the sealed watch from "watching colored squares move" into "listening to your creation breathe, struggle, and fight."

4. **Network health at a glance — or rather, a listen.** The overall "sound" of the network — consonant vs. dissonant chords, steady vs. stuttering rhythm, full spectrum vs. gaps of silence — gives an instant gestalt reading of system health. This is analogous to how an experienced system administrator can hear a server room and know something is wrong before checking any dashboard.

5. **Natural accessibility path.** The Visual Echo mode and audio event log create a triple-redundancy system (audio + visual ripple + text) that serves both accessibility needs and different player preferences.

## Weaknesses

1. **Audio fatigue in long sessions.** Continuous signal sonification over many missions could become grating. Need volume controls, and potentially a "mute sonification" option per channel or globally. Risk of the audio becoming wallpaper that players tune out entirely.

2. **Complexity ceiling for audio.** A network with 6+ units, 4+ channels, and signals firing every tick produces a dense audio landscape that may become cacophonous rather than informative. Hunt: Showdown works because sound events are sparse and discrete; Robot Uprising's sealed watch could produce continuous overlapping tones. Needs careful mixing — perhaps only the loudest/most urgent signal plays at full volume while others duck beneath it.

3. **Learning curve mismatch.** Players must learn both the visual vocabulary (context bars, signal lines, cell flashes) AND the audio vocabulary (pitch = urgency, pattern = type, rhythm = health) simultaneously. This may overwhelm new players who are already processing an unfamiliar game. Solution: introduce audio gradually — mission 1-2 has simple single-unit tones, complexity grows with network complexity.

4. **Headphone dependency.** Stereo spatial panning requires headphones for full effect. Players using laptop speakers or TV speakers lose the spatial dimension. Mono mode is a fallback but loses information. Most comparable games (Hunt: Showdown especially) effectively require headphones for competitive play, which is acceptable for a niche strategy game but limits casual accessibility.

5. **Deterministic tick timing vs. musical expression.** With 1-second ticks and simultaneous resolution, many signal events may cluster at the same instant, creating a "chord" effect at each tick boundary rather than a flowing musical texture. This could sound mechanical and repetitive. Possible mitigation: add micro-timing offsets (50-100ms jitter) to signal tones within a tick for musical variety without affecting gameplay timing.

## Interaction Effects

- **Sealed watch "no tools" constraint:** Audio-as-intelligence doesn't violate the sealed watch's purity — it's not a tool the player activates, it's ambient information that's always present. Like background music, it doesn't give the player any ability to intervene. It only enriches their understanding.
- **Inspector phase:** The audio event log in Inspector allows players to correlate what they heard with what happened, creating a feedback loop that trains audio literacy. "Oh, THAT sound was the relay overloading at tick 18."
- **Context overload mechanic:** Audio silence during overload stun is a particularly elegant encoding — the absence of sound IS the information. This parallels Cogmind's "destroyed machine = silence" principle.
- **Emissions model:** If hook transmissions emit detectable EM noise (per locked design), audio sonification could make emissions *audible* to the player — hearing your own network's noise helps you understand why the enemy is detecting you.
- **Blueprint Codex:** The Codex could include audio samples for each skill and signal type, letting players study the sound vocabulary outside of sealed watch pressure.

## Comparable Games Summary

| Game | Audio Intelligence Mechanic | Key Lesson |
|------|---------------------------|------------|
| **Cogmind** | 1000+ weapon/environment SFX with distance attenuation; weapon type identifiable by sound; "visible SFX" overlay; audio log | Audio as parallel information channel to dense visual display; learned vocabulary rewards experience |
| **Hunt: Showdown** | Environmental sound traps (dogs, chickens, glass); 3D spatial audio (CrySpatial/HRTF); material-dependent obstruction; absence = information | Audio creates entire skill dimension; reading what you DON'T hear is advanced technique |
| **Dead by Daylight** | Terror Radius heartbeat with 3 proximity layers + chase layer; killer-specific music; pattern violations (no Terror Radius while cloaked) | Consistent baseline + exceptions = deep pattern recognition; audio encodes proximity gradient |
| **Minecraft** | Mood-based cave ambience (23 sounds); triggers on darkness/enclosure conditions, not mob presence directly | Audio can encode *conditions* rather than *facts*; probabilistic signals train behavioral loops |
| **Subnautica** | Reaper Leviathan roar audible 5km away but ambiguous distance; silence of absent fish = predator presence | Productive ambiguity creates tension; absence of expected sound is powerful signal |
| **FTL** | System alarms (hull breach, fire, oxygen, power surge); audio substitutes for broken sensor visibility | Audio is most valuable when it encodes what the visual channel cannot or when visual attention is saturated |

## Sensory Description

**What it sounds like during a healthy network tick:**
A constellation of soft tones, like wind chimes in a light breeze. Each scout's perception produces a brief, clean bell note — middle C, maybe D — panned to its position on the board. The relay's compression creates a warm chord that lingers for half a second, like pressing two piano keys gently. The striker receiving the compressed signal adds a quiet metallic ping. The overall effect is a steady, breathing rhythm: perception-compression-delivery, perception-compression-delivery. Every two ticks, like a slow heartbeat.

**What it sounds like when things go wrong:**
The bell notes climb in pitch — C becomes E, then F-sharp. The rhythm accelerates. The relay's chord tightens, becomes dissonant — a minor second grinding against itself. The steady breathing becomes ragged panting. When a unit overloads, its tone cuts dead — a hole in the music, a missing instrument. The remaining tones seem louder by contrast, more frantic. If multiple units overload in sequence, the music collapses note by note, like an orchestra's instruments being silenced one by one, until only the ambient hum of the board remains.

**What the override sounds like:**
The command agent's intervention is a descending three-note arpeggio — clear, authoritative, cutting through the chaos like a conductor's downbeat. It plays in the center of the stereo field, panning outward to reach all units. The other tones briefly duck in volume, as if yielding to the command. After the override resolves, the network's rhythm shifts — new pattern, new assignments, new breathing. The music reorganizes itself around the command's intervention.

**The TikTok clip:**
Split screen. Left: the 8x8 board during sealed watch, signal lines pulsing, units moving. Right: an audio waveform visualization. The network hums smoothly for five seconds — then two enemies appear. The audio climbs in pitch, the rhythm stutters, dissonance builds — the relay overloads — silence — then the command agent's override arpeggio cuts through, the strikers respond, enemies eliminated, and the music resolves into a satisfied chord. Text overlay: "My AI agents have their own soundtrack. And I can hear when they're dying." 15 seconds. Scroll-stopping.

---

*Sources:*
- [Sound in Roguelikes — Cogmind / Grid Sage Games](https://www.gridsagegames.com/blog/2014/04/sound-roguelikes/)
- [Sound Design in Cogmind — Grid Sage Games](https://www.gridsagegames.com/blog/2014/05/sound-design-cogmind/)
- [Audio Accessibility Features for Roguelikes — Grid Sage Games](https://www.gridsagegames.com/blog/2020/06/audio-accessibility-features-roguelikes/)
- [Ambient Sound — Cogmind / Grid Sage Games](https://www.gridsagegames.com/blog/2014/01/ambient-sound/)
- [Hunt: Showdown — Audio Readability, Realism, and Consistency](https://www.huntshowdown.com/news/hunt-audio-readability-realism-and-consistency)
- [Hunt: Showdown — Deep Dive into 3D Audio](https://www.huntshowdown.com/news/dev-insight-a-deep-dive-into-3d-audio-in-hunt)
- [Terror Radius — Dead by Daylight Wiki](https://deadbydaylight.fandom.com/wiki/Terror_Radius)
- [Ambience — Minecraft Wiki](https://minecraft.fandom.com/wiki/Ambience)
- [Subnautica and Sound — The Geekwave](https://thegeekwave.com/2020/06/subnautica-and-sound/)
- [Sonic Mechanics: Audio as Gameplay — Game Studies](https://gamestudies.org/1301/articles/oldenburg_sonic_mechanics)
