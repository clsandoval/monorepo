# 6.10f — Corruption Audio in the Sealed Watch Phase: The Sound of a System Under Fire

## The Mechanic

Every corruption audio document so far (6.10, 6.10a, 6.10c, 6.10d, 6.10e) designs for the Plan screen — the workbench where the player has agency, can sweep with their cursor, can click REVERT, can listen at their own pace. The sealed watch is a fundamentally different acoustic environment. The player has NO control. The board resolves at 1 tick per second. Combat sounds fire. The agung strikes. The dabakan cracks. Signal delivery pings the babendil. Units die. The kulintang melody thins as columns empty. Into this dense, kinetic, emotionally heightened soundscape, corruption must speak — and it must speak a different dialect than it uses on the workbench.

The Plan screen corruption vocabulary is **diagnostic**. It helps the player locate, identify, and fix problems. The sealed watch corruption vocabulary is **prognostic**. It tells the player what is going wrong, how fast, and how badly — information they cannot act on until the Inspector phase, but which they need to absorb in real-time to plan their next iteration. The sealed watch teaches through witnessed consequence. You hear your compromised architecture fail under load.

Three corruption phenomena manifest during sealed watch:

### 1. EMP Buffer Degradation — "The Erosion"

When an enemy EMP skill targets a player unit, the unit's buffer capacity degrades — slots become unavailable, signals get evicted, context window shrinks. On the Plan screen, this would be the Geiger-plus-heartbeat diagnostic vocabulary. During sealed watch, the player cannot inspect individual buffers. Instead, the degradation manifests as an **audio filter applied to the affected unit's sound emissions**.

**The sound:** Every unit has a sonic footprint during sealed watch — movement sounds, skill activations, signal transmissions (babendil pings), combat impacts. When a unit suffers EMP buffer degradation, ALL of that unit's sounds pass through a progressive bitcrusher filter. At full buffer health, the unit's sounds are clean — full frequency range, normal dynamics. At 75% buffer capacity, a faint digital granularity appears: the babendil ping acquires a 4-bit edge, like hearing a bell through a low-quality phone speaker. At 50%, the bitcrushing is unmistakable — the unit's movement sounds become crunchy, the signal pings are ragged and harsh, combat impacts distort into clipped noise bursts. At 25% (one slot remaining), the unit's entire audio output sounds like it is being played through a broken transistor radio: narrow bandwidth, heavy distortion, intermittent dropouts where the sound cuts to 50ms of silence before resuming. The unit sounds like it is dying from the inside.

**Frequency specification:** The bitcrusher reduces effective bit depth from 16-bit (clean) through 12-bit (75%), 8-bit (50%), to 4-bit (25%). Simultaneously, a low-pass filter sweeps from 16kHz (clean) to 2kHz (25%), progressively removing high-frequency detail. The combination creates a sound that is both more distorted AND more muffled — the unit's voice is being crushed and buried simultaneously.

**Spatial behavior:** The degradation filter is spatialized to the unit's board position. A degrading Scout on the left flank sounds bitcrushed in the left channel. A degrading Relay at center sounds bitcrushed in the center. This means the player can localize which unit is taking EMP damage by ear, even if they are watching a different part of the board. When multiple units degrade simultaneously, the stereo field fills with asymmetric distortion — left channel crunching while right channel remains clean tells the player exactly which flank is under electronic attack.

**Onset timing:** The degradation filter does not appear instantly on EMP hit. It fades in over the 1-second tick following the EMP impact, synchronized to the tick boundary. The EMP strike itself has its own combat sound (a sharp, buzzing ZAP with a 100ms electromagnetic whine tail — distinct from the dabakan's physical impact). The degradation filter then creeps in during the next tick, creating a cause-then-consequence audio sequence: ZAP... then the unit's next sound is slightly crushed. The delay is critical — it separates "what happened" (EMP hit) from "what it means" (buffer degradation), giving the player two distinct audio events to process rather than one cluttered moment.

### 2. Hook Chain Failures — "The Dropped Call"

When corruption has sabotaged a hook configuration (foreign wiring, modified trigger conditions, rerouted channels), the hook will fail during sealed watch. The player designed an architecture; the corruption broke it. During battle, the break becomes audible.

**The sound:** A healthy hook transmission during sealed watch produces the babendil ping — bright, metallic, clean, pitched to the channel's sonic identicon (6.02d). A corrupted hook that fires and fails produces a **choked babendil**: the ping begins normally for 30ms (the player hears the familiar attack transient), then abruptly cuts to a descending glissando that drops from the ping's pitch to approximately 200Hz below it over 150ms, while simultaneously acquiring a flanging distortion. The effect sounds like a bell that was struck and then immediately grabbed — the resonance is killed, the pitch drops sickly, and the metal vibration warps into something wrong. The choked babendil is followed by 100ms of silence (the "gap" where the signal should have arrived at its destination) and then a soft, dry click — the sound of the receiver's buffer slot closing without having received anything. A door shutting on an empty hallway.

**Distinguishing corrupted failure from legitimate failure:** Hooks can fail for non-corruption reasons (receiver out of range, buffer full, unit stunned). Non-corruption failures produce a different sound: the babendil ping plays in full but at -6dB (quieter, indicating reduced effectiveness), followed by a gentle descending tone — a "not this time" signal that communicates temporary failure without alarm. The corrupted hook failure is harsher, more abrupt, more wrong-sounding. The choked quality — that grabbed-bell distortion — is unique to corruption. A player who has internalized the sound vocabulary can distinguish "my hook failed because the relay moved out of range" from "my hook failed because something tampered with it" purely by ear during sealed watch.

**Chain cascade audio:** When a hook chain fails (Scout broadcasts to Relay, Relay should forward to Striker, but the Relay's forwarding hook is corrupted), the initial babendil ping from Scout to Relay sounds healthy. Then the Relay's corrupted re-broadcast produces the choked babendil. Then the Striker, expecting a signal that never arrives, does nothing — and its SILENCE is the third sound in the cascade. The player hears: *ping... CHOKE-click... nothing*. Three beats. The third beat is silence, and silence during sealed watch is conspicuous because normally every tick has sound. The missing sound is the loudest indicator that the chain is broken.

### 3. Context Overload Stun — "The Sparking"

When a unit's context window overflows (too many signals, too many rule evaluations, too much data), the unit suffers a 1-tick stun — it freezes, sparking and jittering on the board, unable to act. This is Robot Uprising's most dramatic corruption-adjacent failure mode, and it gets a distinctive sealed watch audio treatment.

**The sound:** Context overload produces a three-phase audio event compressed into 1 second (one tick):

**Phase 1 — The Overflow (0-200ms):** A rapid ascending chromatic run of synthetic tones, starting at the unit's base frequency and climbing 2 octaves in 200ms. Each tone in the run is 15ms, staccato, with no gap between notes — a machine-gun of ascending pitches that sounds like a system counting past its limit. Think of a hard drive spin-up whine accelerated 10x. The run ends at the ceiling with a sharp metallic POP — the moment the buffer overflows. The POP has a 5ms attack, 50ms sustain of broadband white noise at -6dB, and a 30ms exponential decay. It sounds like a capacitor discharging.

**Phase 2 — The Stun (200-800ms):** A buzzing, crackling static field fills the unit's stereo position. This is synthesized as pink noise passed through a ring modulator at 60Hz, creating a harsh, electrical buzzing with a pulsating quality — the 60Hz modulation makes it sound like a malfunctioning power supply. Intermittent within the buzz, at random intervals of 80-200ms, are bright 3ms spark transients — the "sparking" that the player sees on the jittering sprite. Each spark is a burst of white noise at 4-8kHz, sharp as a camera flash, immediately decaying. The visual sparks and audio sparks are frame-synchronized: every visible spark on the sprite produces an audible spark in the audio.

**Phase 3 — The Recovery (800-1000ms):** The buzzing static descends in pitch over 200ms (the ring modulator frequency drops from 60Hz to 20Hz, taking the buzz below audible range) while the spark transients cease. In the final 50ms, a single clean tone sounds at the unit's base frequency — a "reboot" chime, faint (-18dB), indicating the unit has recovered. The chime is almost subliminal — the player might not consciously hear it, but its presence restores the unit's sonic identity after the noise of the stun.

**Emotional register:** The overflow run sounds like panic. The stun buzz sounds like damage. The recovery chime sounds like survival. The entire 1-second event is a micro-narrative: *too much, breakdown, recovery*. For the player, hearing this during sealed watch is a visceral reminder that their architecture is overloaded — they need to simplify rule evaluations or reduce signal traffic in the next iteration.

---

### Sealed Watch Corruption Vocabulary vs. Plan Screen Vocabulary

| Dimension | Plan Screen | Sealed Watch |
|-----------|------------|--------------|
| **Player agency** | Full — sweep, inspect, fix | None — observe only |
| **Audio purpose** | Diagnostic — locate and resolve | Prognostic — witness and learn |
| **Interaction model** | Cursor-responsive (Geiger clicks) | Autonomous (unit-bound filters) |
| **Temporal pacing** | Player-controlled, unlimited time | 1 tick/second, uninterruptible |
| **Information density** | One corruption at a time, detailed | Multiple simultaneous events, broad strokes |
| **Emotional register** | Methodical, satisfying resolution | Tense, helpless witnessing |
| **Corruption types audible** | All three (config, buffer, hook) pre-battle | Buffer degradation + hook failure + overload stun mid-battle |

The Plan screen vocabulary is a stethoscope. The sealed watch vocabulary is a battlefield triage alarm. They share timbral DNA — the bitcrusher degradation during sealed watch echoes the frequency-narrowing at low integrity on the Plan screen; the choked babendil shares the "grabbed resonance" quality of the Plan screen's sour harmonic — but they serve different cognitive functions. The Plan screen asks the player to diagnose. The sealed watch asks the player to witness.

---

### Layering with the Battlefield Soundtrack

The sealed watch already has a dense audio environment: the accelerated kulintang at 120 BPM, the agung tick clock, the kick drum, dabakan combat strikes, babendil signal pings, biome damage sounds, movement sounds. Adding corruption audio risks cacophony. The layering strategy follows three principles:

**Principle 1: Corruption audio replaces, not adds.** The bitcrusher degradation does not add a new audio layer — it modifies the existing sounds a unit produces. The hook failure does not add a sound on top of the babendil — it replaces the babendil with a corrupted version. Only the context overload stun introduces a genuinely NEW sound (the overflow-buzz-recovery sequence), and it displaces the unit's normal activity sounds for that tick (a stunned unit produces no movement or skill sounds, so the stun audio fills the same spectral space).

**Principle 2: Corruption occupies the distortion band, not the melody band.** The kulintang melody, agung, and babendil occupy the 200Hz-4kHz "clean" band. Corruption sounds introduce energy in two auxiliary bands: the sub-100Hz rumble range (the ring modulator's 60Hz buzz, the choked babendil's low descending glissando) and the 4kHz-8kHz "crunch" range (spark transients, bitcrusher aliasing artifacts). This frequency separation means corruption audio and battle audio can coexist without masking each other — the player hears the melody AND the distortion, in different frequency neighborhoods.

**Principle 3: The agung tick clock is sacred.** No corruption sound, no matter how dramatic, masks or modifies the agung strike. The agung is the player's temporal anchor — the metronome that tells them how many ticks remain, how fast time is passing, where they are in the battle's structure. The context overload stun's Phase 1 ascending run is timed to END 50ms before the next agung strike, ensuring the agung always rings clean. The bitcrusher filter has a 200ms sidechain duck triggered by the agung — at each tick boundary, the degradation effect dips by 6dB for 200ms, letting the agung through unobstructed.

---

## Player Journeys

#### Journey: Amara, 31, Network Engineer in Makati

**Context:** Mission 9, second playthrough. Amara resolved most corruption on the Plan screen but missed one injected hook in her Relay's outbound channel. She does not know the hook is corrupted. She plays on studio monitor speakers in her home office.

**Minute 0:00 — EXECUTE**
The agung strikes. The kulintang accelerates. Kick drops. Amara's five-unit architecture unfolds: Scout advances left, Relay holds center, two Strikers flank right, Command observes from rear. The soundscape is rich and clean — babendil pings as the Scout broadcasts, movement sounds stereo-panning as units traverse the Cebu city grid. She leans back. The architecture is running.

**Minute 0:08 — Tick 8: The Dropped Call**
Scout spots an enemy cluster, fires its broadcast hook. *Ping* — the babendil, bright and clean, Scout-to-Relay. She waits for the Relay's re-broadcast to the Strikers. Instead: a sound she has never heard in this context. The babendil begins — the familiar metallic attack — and then CHOKES. The pitch drops, flanging, warping downward like a record slowing to a stop. Then: silence. A dry click. The Relay transmitted nothing. The Strikers, ignorant of the enemy position, continue their default patrol.

Amara's stomach drops. She recognizes the sound from the corruption audio tutorial — that choked quality, the grabbed-bell distortion. But she thought she cleared all corruption on the workbench. She fixed three of four. The fourth is in the Relay's outbound hook, and she is hearing it fail in real-time. She cannot fix it. She can only watch.

**Minute 0:12 — Tick 12: Consequences**
The Strikers walk into the enemy cluster blind. No evasion. No coordinated approach. DABAKAN — one Striker down. The column gong drops from the kulintang. Amara's jaw tightens. DABAKAN — the second Striker engages but takes an EMP hit. ZAP — the electromagnetic whine. Then, over the next tick, the surviving Striker's combat sounds acquire a gritty, crunching edge. The bitcrusher filter. The Striker's buffer is degrading. Its next babendil ping — the distress signal to Command — sounds like it is being shouted through a broken megaphone. Harsh. Ragged. Barely recognizable as the clean metallic chime it should be.

**Minute 0:16 — Tick 16: The Seal Breaks**
The agung's final strike. Four-second decay. Inspector loads. Amara immediately scrubs to Tick 8. The Relay's outbound hook: red highlight, corrupted condition, modified channel. She sees it now. She HEARD it happen. The choked babendil at Tick 8 is the sound she will remember from this mission — the sound of a system she thought was clean failing under fire.

---

#### Journey: Tomas, 17, High School Student in Davao

**Context:** Mission 7, first time encountering EMP enemies. Tomas has never heard corruption audio during sealed watch because earlier missions had no EMP-capable enemies. He plays on wireless earbuds.

**Minute 0:00 — EXECUTE**
Clean architecture, no corruption on the workbench. The sealed watch begins normally. Tomas is still learning to read the battle — he watches unit positions, follows the babendil pings, feels the agung tempo in his chest. Everything sounds right.

**Minute 0:05 — Tick 5: First EMP**
An enemy Specialist activates its EMP skill targeting Tomas's Relay. ZAP — a bright, buzzing strike sound Tomas has not heard before. Different from the dabakan's dry crack. More electrical, more sustained, with a whining tail. He frowns. "What was that?"

**Minute 0:06 — Tick 6: The Erosion Begins**
The Relay broadcasts to the Strikers. The babendil ping sounds... off. Not wrong, exactly. A little gritty. Like someone rubbed sandpaper across the bell before striking it. Tomas tilts his head. He is not sure he heard what he thinks he heard. The next tick, the Relay takes another EMP hit. ZAP. This time the degradation is unmistakable. The Relay's next broadcast is crunchy — the ping has lost its bright upper harmonics, replaced with digital artifacts, a 12-bit graininess that makes the sound feel like it is coming through a worse speaker than the one in his ear.

**Minute 0:09 — Tick 9: Full Degradation**
Third EMP hit. The Relay's buffer is at 25%. Its outbound ping is no longer a recognizable babendil chime — it is a harsh, clipped burst of noise, the original pitch barely discernible underneath layers of bitcrushed distortion. Movement sounds from the Relay are gone (the unit has stopped moving, stunned by accumulated damage). In the silence where the Relay's movement should be, only the crackling static of its degraded audio footprint persists — a faint electrical hiss at the Relay's stereo position, like a machine idling on the verge of shutdown.

Tomas pulls one earbud out and stares at the board. The Relay sprite is sparking. The sound matches — those bright 3ms transients he keeps hearing are the sparks. He puts the earbud back in. He has learned something: the audio is telling him which units are damaged, even when he is not watching them. The crunchy sound IS the damage.

**Minute 0:14 — Inspector**
The Inspector loads. Tomas scrubs to the first EMP hit at Tick 5 and activates the buffer visualization. He watches the Relay's buffer bars shrink — and in the Inspector replay, the audio plays back the degradation sequence at reduced intensity (Inspector plays sealed watch audio at -12dB, analytical rather than emotional). The correlation is clear: each EMP hit caused the bars to shrink and the sound to degrade. The bitcrusher IS the buffer state, sonified. He understands.

---

#### Journey: Dr. Lien, 44, Audiologist in Ho Chi Minh City

**Context:** Mission 10, playing on high-end open-back headphones. Dr. Lien has a professional understanding of frequency perception and psychoacoustics. She plays at Aggressive corruption intensity for Plan Phase and Standard for Sealed Watch (she configured per-screen overrides in 6.10e settings). She specifically listens for corruption audio as a primary information channel.

**Minute 0:00 — Pre-Battle Assessment**
On the Plan screen, Dr. Lien's Aggressive setting revealed five corruptions via dense Geiger clicking and simultaneous heartbeat streams. She fixed four. The fifth — a subtly modified rule condition on her Command unit — she left intentionally. She wants to hear what it sounds like during battle. She has read the boot log explaining sealed watch corruption audio. She wants to experience it.

**Minute 0:03 — EXECUTE**
The sealed watch begins. Standard intensity for sealed watch means corruption audio is present but not overwhelming. She listens with clinical attention. The kulintang is driving, the agung deep. Her architecture moves.

**Minute 0:07 — Tick 7: Context Overload**
The Command unit, with its subtly corrupted rule condition, is evaluating one extra boolean per tick — the corruption changed a simple distance check into a compound condition that queries both distance AND signal history. The added evaluation consumes extra context window space. At Tick 7, with three incoming signals queued and the corrupted rule evaluating its expanded condition, the Command unit overflows.

She hears it: the ascending chromatic run — *dit-dit-dit-dit-dit-DIT-DIT-DIT-DIT* — a machine counting past its ceiling, each pitch 15ms, staccato, climbing two octaves in under a quarter second. Then the POP — a capacitor-discharge burst of white noise, sharp and definitive. Then the buzz: 60Hz ring-modulated pink noise, pulsating like a sick fluorescent light, filling the Command unit's center-right stereo position. Intermittent sparks — bright, crackling transients at 6kHz — punctuate the buzz at random intervals. She counts them: five sparks in 600ms. Each one synchronized with a visible jitter on the Command sprite.

Then the recovery: the buzz descends below audible range, the sparks cease, and a faint chime — the unit's base frequency, nearly subliminal at -18dB — signals reboot. The Command unit resumes at Tick 8, but it has lost a full tick of coordination. The Strikers acted independently at Tick 7. One took a suboptimal path.

Dr. Lien smiles. The ascending run told her "overflow." The buzz told her "stun in progress." The sparks told her "duration" (she could count them). The chime told her "recovered." Four pieces of information in one second of audio, delivered while she watched a different part of the board. She makes a mental note: in the Inspector, she will verify that the corrupted rule's extra evaluation caused the overflow. She already knows it did. She heard it.

**Minute 0:14 — Inspector Debrief**
She scrubs to Tick 7. The Command unit's context window chart shows the amber-to-red spike exactly where she expected. The rule trace shows the extra evaluation — the corrupted compound condition. She clicks REVERT on the rule. The clean tone plays. She re-queues the mission. This time, the Command unit will not overflow. She will listen to confirm.

---

## Strengths and Weaknesses

### Strengths

**Passive information during a no-control phase.** The sealed watch is the only game phase where the player has zero agency. Corruption audio fills this agency gap with information the player can absorb without interaction — they learn about their architecture's weaknesses by listening, building a mental repair list for the next Plan phase without needing to pause or annotate.

**Audio as temporal compression.** The Inspector provides detailed post-hoc analysis, but it requires scrubbing, clicking, and reading. The sealed watch corruption audio provides the SAME information (which units degraded, which hooks failed, when overloads occurred) in real-time, compressed into the natural flow of observation. Many players will enter the Inspector already knowing what went wrong because they heard it happen.

**Timbral continuity with Plan screen.** The bitcrusher degradation during sealed watch shares spectral characteristics with the Plan screen's low-integrity ambient perturbation. The choked babendil shares the "resonance killed" quality of the Plan screen's sour harmonic. Players who have internalized the Plan screen corruption vocabulary will recognize sealed watch corruption as the same system in a different context — familiar wrongness in an unfamiliar setting.

**Emergent architecture assessment.** When multiple units degrade simultaneously, the stereo field fills with asymmetric distortion. A player with stereo headphones can assess their entire army's health state by listening to the spatial distribution of clean vs. degraded sound — a kind of audio heatmap that emerges from the individual unit treatments without any additional UI overlay.

### Weaknesses

**Cognitive load during an already-dense phase.** The sealed watch is emotionally intense — combat, signals, unit deaths. Adding corruption audio risks overloading the player's auditory processing. The 6.10e per-screen intensity override is the primary mitigation (many players will set sealed watch to Whisper), but the default Standard intensity needs careful tuning to avoid the cocktail party problem.

**False negatives in noisy battles.** In missions with many units and rapid combat, the bitcrusher degradation on a single unit may be masked by the surrounding battle audio. The player might not notice a Relay degrading on the left flank if a dramatic combat sequence is happening on the right. The frequency-band separation (corruption in distortion/crunch bands, battle in melody band) mitigates this, but dense moments will still cause missed information.

**Learning curve for corruption-naive players.** A player encountering EMP enemies for the first time (Mission 7) has no context for what bitcrushed unit audio means. The first several encounters are confusing before the vocabulary establishes itself. The 6.10a learning curve design addresses this through the Whisper Curriculum — the Predecessor names the sounds when they first appear — but the sealed watch context overload stun in particular is a dense, fast, multi-phase sound that may confuse before it teaches.

**No resolution during sealed watch.** On the Plan screen, corruption audio has a satisfying resolution arc — find, fix, hear the all-clear. During sealed watch, there is no resolution. The player hears degradation, failure, stun — and can do nothing. The corruption audio is all tension with no release. The release is deferred to Inspector, where the player can finally diagnose and fix. This tension-without-release design is intentional (it motivates the player to care about the Inspector phase), but it is emotionally exhausting in long battles.

---

## Interaction Effects

### With Sealed Watch Pacing (1 tick/second)

The 1-tick-per-second cadence imposes strict timing on corruption audio events. The context overload stun is designed to fit exactly within one tick (1000ms: 200ms overflow, 600ms buzz, 200ms recovery). The EMP degradation filter onset spans one tick. The choked babendil is 280ms total. All corruption audio events are quantized to tick boundaries — they begin at tick-start and resolve before tick-end. This prevents corruption sounds from bleeding across ticks and confusing the temporal structure. The agung's 200ms sidechain duck ensures that even overlapping corruption events clear space for the tick boundary marker.

### With Accessibility Modes (6.10d)

**Visual-only mode:** EMP buffer degradation is communicated by progressive visual distortion on the unit sprite — scan lines, color desaturation, pixel breakup mirroring the audio bitcrusher. Hook chain failure produces a visible "broken link" icon on the failed channel line. Context overload produces the sparking/jittering animation that is already the visual component of the stun.

**Haptic mode:** Buffer degradation maps to progressive vibration roughness in the controller grip nearest the degrading unit. Hook failure produces a single sharp asymmetric click (one grip only). Context overload is a rapid-fire vibration burst (the overflow run) followed by sustained rough buzzing (the stun).

**Screen reader mode:** At each tick, the screen reader announces corruption events in the ARIA live region: "Tick 8: Relay-A buffer at 50%, EMP degradation. Tick 9: Scout-to-Relay hook failed, corrupted outbound channel. Tick 12: Command-A context overload, stunned 1 tick." These announcements queue at assertive priority for critical events (stun, hook failure) and polite priority for degradation updates.

### With Intensity Config (6.10e)

At Whisper sealed watch intensity, the bitcrusher degradation filter is reduced to a subtle high-frequency roll-off (barely perceptible softening of unit sounds). The choked babendil plays at -18dB with minimal pitch drop. The context overload stun plays only Phase 2 (the buzz) at -12dB — no ascending run, no recovery chime. Information is preserved but emotional impact is minimized.

At Aggressive sealed watch intensity, the bitcrusher is more severe (reducing to 3-bit at 25% health). The choked babendil's descending glissando extends lower (3 octaves below original pitch, producing a subsonic rumble). The context overload stun's ascending run spans 3 octaves, the POP is at -3dB (near-loudest sound in the game), and the buzz acquires additional harmonic content (60Hz + 120Hz + 180Hz harmonics, making the stun sound like a malfunctioning transformer). At Aggressive, corruption during sealed watch is unmissable and physically uncomfortable — the distortion demands attention.

### With Inspector Debrief

The Inspector phase is where the sealed watch's corruption audio pays off. The player heard degradation, failure, or stun during battle — now they can investigate. The Inspector replays sealed watch audio at -12dB when scrubbing through the timeline, allowing the player to re-hear corruption events in a calm, analytical context. A "corruption events" filter on the Inspector timeline highlights ticks where corruption audio fired (amber markers on the scrub bar), letting the player jump directly to the moments they heard something wrong. The correlation between "I heard it during battle" and "here's what caused it in the Inspector" closes the learning loop: the sealed watch teaches the ear, the Inspector teaches the mind.

---

## Comparable Games

### Into the Breach — Battle Tension Through Audio Restraint

Into the Breach's combat audio is famously spare — each attack has a single definitive sound, environmental damage has a secondary sound, and the music provides continuous tension underneath. Robot Uprising's sealed watch corruption audio follows the same philosophy of restraint: corruption MODIFIES existing sounds (bitcrusher on unit audio, choke on babendil) rather than adding new layers on top. Into the Breach teaches that in a dense tactical display, the most powerful audio design is subtractive — take a sound the player knows and make it wrong, rather than adding a new warning sound.

### FTL: Faster Than Light — Layered Battle Soundtrack as System State

FTL's battle theme adds and removes instrument layers based on game state — shields down means a layer drops, hull breach means distortion enters. Robot Uprising's sealed watch corruption audio is FTL's layering principle applied to corruption: EMP damage adds a distortion filter layer, unit death removes a kulintang voice, context overload introduces a noise burst. The player reads system health through the texture of the music itself, not through separate alert sounds. FTL proves that players will internalize complex audio state machines when the mapping from "system status" to "music quality" is consistent over time.

### XCOM — Overwatch Tension and the Sound of Waiting

XCOM's overwatch mechanic creates tension through helpless observation — the player's soldiers fire automatically, and the audio (gunshot, hit confirmation or miss whiff) communicates success or failure while the player watches. Robot Uprising's sealed watch is structurally identical: the player watches their architecture execute, and corruption audio communicates system failure while they are powerless. The XCOM overwatch trigger sound — that distinctive activation click — is comparable to the choked babendil: a familiar sound (gun firing / babendil pinging) that resolves into either success (hit / clean transmission) or failure (miss / choked corruption). Both games use the gap between "sound begins" and "sound resolves" as a micro-moment of tension.

---

## Sensory Descriptions

### The Sound of Buffer Degradation Under Fire

You are watching your Relay operate at Tick 6. Its babendil ping — the clean, bright metallic chime you have heard a hundred times — sounds normal. Tick 7: an EMP hits. ZAP — a buzzing electrical strike, like a Tesla coil discharging into metal, with a whining 200ms tail that descends from 2kHz to 400Hz. You wince. Then Tick 8: the Relay pings again. But the ping is... rough. The metallic brightness has a sandpaper edge — a gritty, granular texture overlaid on the bell tone, as if the bell were cast from impure metal. The upper harmonics that give the babendil its silvery shimmer are slightly crushed, slightly flattened, like hearing the chime through a wall of static that is just barely there. By Tick 10, after a second EMP hit, the same ping sounds like it is coming through a walkie-talkie in a thunderstorm — narrow, distorted, the original tone recognizable but wounded. The brightness is gone. What remains is the ghost of a chime, struggling to be heard through its own degradation.

### The Sound of a Hook Chain Breaking

*Ping* — Scout to Relay, clean, bright, stereo-panned left-to-center. You hear the signal arrive. You wait for the re-broadcast. The Relay's outbound hook fires. The babendil begins — same metallic attack, same familiar first 30 milliseconds — and then the sound collapses. The pitch sags downward like a record slowing, acquiring a seasick flanging quality, the metal resonance warping as if the bell is being crushed in a hydraulic press. 150ms of descending, distorting failure. Then silence — a conspicuous 100ms gap where the Striker should have received a signal. Then a soft, dry click. A latch closing on an empty slot. The silence after the click is enormous. In it, the Striker continues its default patrol, unaware. The chain is broken. The architecture you built has a severed nerve, and you heard the moment it went dead.

### The Sound of Context Overload

It begins as counting. A rapid ascending sequence of synthetic tones — *dit-dit-dit-dit-DIT-DIT-DIT-DIT* — each one higher than the last, each one 15ms of pure panic compressed into a staccato burst. The tones climb two octaves in a fifth of a second, like a meter needle sweeping past every graduation mark and slamming into the end stop. Then: POP. A sharp, bright burst of white noise — a capacitor blowing, a fuse tripping, a system hitting a wall it cannot pass. The pop lasts 50ms and fills the stereo field at the unit's position.

Then the buzz arrives. A thick, electrical humming at 60Hz — the frequency of mains power, the sound of infrastructure pushed past its design limits. The buzz pulsates, ring-modulated, dirty, like holding your ear against a failing transformer. Inside the buzz, sparks: bright, crackling transients that fire at irregular intervals, each one a 3ms burst of high-frequency noise, each one synchronized with a visible spark on the jittering unit sprite. Five, six sparks over 600ms. The unit is frozen, sparking, unable to process.

Then: descent. The buzz drops below hearing range over 200ms, the sparks cease, and a single, almost-silent chime sounds — the unit's own fundamental frequency, clean and pure, at -18dB. A whispered "I'm back." The unit moves again. You exhale. One tick lost. One tick where your Command unit stood sparking in the middle of a battle, deaf and blind, because its architecture demanded more context than its buffer could hold. You heard every millisecond of it.
