# 6.02c — Adaptive Mixing for Information Density: The Cocktail Party Problem

## The Design Challenge

Mission 8. Fourteen units on an 8x8 board. Eight column gongs layering the kulintang ensemble. Six active channels with distinct sonic identicons firing every 1-3 ticks. A Command unit with 6 hook slots receiving from multiple sources. Two Relays compressing and re-broadcasting. Enemy units triggering combat dabakan strikes. EM hum rising as the architecture transmits. Buffer bars creeping toward overflow on three units simultaneously.

The question: **what does this SOUND like?** If every audio system designed in 6.02, 6.02d, and 1.08c-ii fires simultaneously with no mixing intelligence, the answer is: cacophony. A wall of bronze pings, percussion, whines, cracks, and hums that communicates nothing because everything is fighting for the same frequency space and attention budget.

This is the **Cocktail Party Problem** in game audio — the same challenge humans face in a noisy room, trying to hear one conversation among many. The human auditory system uses binaural cues, frequency separation, and attention to isolate one voice. The game audio engine must do the same work artificially.

This is "The Smart Mix" — an adaptive mixing system that ensures every audio event is audible, identifiable, and informative even at maximum battlefield density.

---

## The Mixing Architecture

### The Priority Stack

Every audio event in Robot Uprising has an assigned priority tier:

| Tier | Events | Rationale |
|------|--------|-----------|
| **P0 — Critical** | Buffer overflow whine, combat elimination | Immediate gameplay consequence. Missing these = strategic blindness. |
| **P1 — Tactical** | Channel pings (signal delivery), compression squish, EM threshold alert | Active information flow. The hook architecture communicating. |
| **P2 — Rhythmic** | Agung tick strike, kick drum, sub-bass drone | Temporal framework. Time-keeping. |
| **P3 — Ambient** | Kulintang column gongs, topology chord, terrain ambience | Background musical layer. Atmosphere, not information. |

When events from multiple tiers fire simultaneously, higher-priority events **duck** lower-priority events. Ducking means reducing the volume of lower-priority audio by a specified amount for the duration of the higher-priority event.

### The Ducking Matrix

| When this plays → | P0 Critical | P1 Tactical | P2 Rhythmic | P3 Ambient |
|-------------------|-------------|-------------|-------------|------------|
| **P0 ducks by** | 0 dB | -6 dB | -9 dB | -12 dB |
| **P1 ducks by** | 0 dB | 0 dB | -3 dB | -6 dB |
| **P2 ducks by** | 0 dB | 0 dB | 0 dB | -3 dB |
| **P3 ducks by** | 0 dB | 0 dB | 0 dB | 0 dB |

When a buffer overflow fires (P0), the kulintang gongs (P3) drop by 12 dB — nearly inaudible — so the whine cuts through unmistakably. Channel pings (P1) drop by 6 dB, still audible but not competing. The agung tick (P2) drops by 9 dB — the rhythm continues but the crisis dominates.

Implementation: each priority tier feeds through a dedicated `GainNode` in the Web Audio graph. Ducking is applied via `gainNode.gain.exponentialRampToValueAtTime()` with a 10ms attack (fast enough to feel instant) and a 200ms release (smooth enough to avoid pumping artifacts).

---

## Option A: "The Spotlight" — Event-Driven Priority Ducking

### How It Works

The simplest adaptive mix. When a high-priority event fires, lower tiers duck. When the event ends, lower tiers recover. No spatial awareness, no frequency management — just volume priority.

**Behavior at maximum density (14 units, Mission 8, Tick 12):**

Events this tick:
- Scout at A2 broadcasts on "patrol-report" (P1)
- Relay at D4 compresses and re-broadcasts on "threat-relay" (P1 × 2 events)
- Striker at G7 eliminates enemy at F6 (P0)
- Buffer overflow on Relay at D4 (P0)
- Agung tick strike (P2)
- 8 kulintang column gongs sustaining (P3)
- EM hum from Command unit (P3)
- Topology chord (P3)

**The Spotlight mix:**
1. Two P0 events fire. All lower tiers duck: P1 at -6dB, P2 at -9dB, P3 at -12dB.
2. The combat CRACK (dabakan + glitch tail, 200ms) and overflow whine (500ms rising) dominate the mix.
3. The channel pings are audible but quiet — you hear them but they're pushed back.
4. The agung tick is faint — you barely notice the tick boundary.
5. The kulintang gongs, topology chord, and EM hum are essentially inaudible for 500ms.
6. After the overflow whine resolves (500ms), P0 clears. Tiers recover over 200ms.
7. For the remaining 500ms of the tick, the normal mix returns — pings at full volume, gongs audible, agung clear.

**Strengths:**
- Simple to implement. A priority queue and four gain nodes.
- Guarantees critical events are always heard.
- Works at any density — more events just means more ducking.
- Players learn the ducking itself as information: "the music went quiet, something bad happened."

**Weaknesses:**
- **P1 events blur together.** When three channel pings fire in the same tick, they all play at the same priority with no ducking between them. Three overlapping pings merge into one complex sound — you hear "signals happened" but can't tell how many or which channels.
- **Constant ducking at high density feels oppressive.** If every tick has at least one P1 event (likely in Mission 8+), the P3 ambient layer is perpetually suppressed. The kulintang gongs never get a chance to breathe. The musical identity is smothered by the gameplay information layer.
- **No spatial dimension.** Events at A1 and H8 sound identical in the mix — no panning, no distance cues. You can't locate events by ear.

---

## Option B: "The Radar Sweep" — Spatial Audio Panning per Grid Position

### How It Works

Every audio event is panned in the stereo field based on its grid position. The 8x8 grid maps to stereo as follows:

- **Columns A-H → Left-to-Right panning:** Column A = hard left (-1.0), Column D = slight left (-0.15), Column E = slight right (+0.15), Column H = hard right (+1.0). Linear interpolation between.
- **Rows 1-8 → Volume attenuation (depth):** Row 1 (near, bottom of board) = 0dB (full volume), Row 8 (far, top of board) = -6dB. Linear interpolation. Far events are quieter — not inaudible, just less prominent.

**At maximum density, the spatial mix creates separation:**
- Scout at A2 pings from the LEFT at near-full volume.
- Relay at D4 compresses in the LEFT-CENTER at moderate volume.
- Striker at G7 eliminates in the RIGHT at reduced volume (far row).
- Overflow on Relay at D4 whines from LEFT-CENTER.

The player can LOCATE events by ear — the ping from the left is the Scout, the crack from the right is the Striker. This is the same auditory separation humans use in real rooms: binaural panning creates spatial streams that the brain can individually attend to.

**Strengths:**
- **Spatial separation solves the P1 collision problem.** Three channel pings at different grid positions pan to different stereo positions — the brain separates them automatically.
- **Board awareness without looking.** A player focused on one unit can hear events at other positions, building a subconscious spatial map. "Something happened on the right side" = something happened at columns G-H.
- **Combat location by ear.** The dabakan crack panned hard right means the elimination happened at column H. Useful during dense Sealed Watch when the visual flash might be lost in the crowd.
- **EM hum spatial signature.** Each transmitting unit's EM hum is panned to its position. Multiple hums from different positions create a "spatial fingerprint" of the architecture's emission pattern. A clustered army hums from one spot; a spread army hums across the field.

**Weaknesses:**
- **Mono speakers destroy it.** Phone speakers, laptop speakers, many external speakers — all mono or pseudo-stereo at small separation. Spatial panning collapses to center. The mixing intelligence is wasted on the most common playback systems.
- **Headphone requirement.** True stereo separation requires headphones. The game would need to detect headphone use and enable/disable spatial panning accordingly. Unreliable detection on web platforms.
- **Row-depth attenuation is confusing.** Reducing volume for "far" rows (top of board) assumes a camera perspective where "up" = "far." In isometric view, this maps imperfectly — the isometric projection already encodes depth visually, and adding audio depth may conflict with visual depth cues.
- **No vertical separation.** Stereo has only left-right. Two events at A2 and A7 (same column, different row) have the same panning — only the 6dB volume difference distinguishes them.

---

## Option C: "The Frequency Notch" — Spectral Band Reservation per Event Type

### How It Works

Instead of competing for the same frequency range, each event type is EQ'd to occupy a distinct spectral band. The human ear has ~24 critical bands (Bark scale) from 20Hz to 20kHz. The game's audio events are distributed across these bands:

| Event Type | Frequency Band | Character |
|------------|---------------|-----------|
| Sub-bass drone | 20-80Hz | Felt more than heard. The "weight" of the game. |
| Agung tick | 80-250Hz | Deep resonant boom. Chest-thumping. |
| Kulintang column gongs | 250-800Hz | Warm, metallic, melodic. The musical core. |
| Topology chord | 800-1500Hz | Mid-range harmonic pad. Background harmony. |
| Channel pings (babendil identicons) | 1500-4000Hz | Bright, cutting, identifiable. Information layer. |
| Combat (dabakan) | 4000-8000Hz | Sharp, percussive, attention-grabbing. |
| Buffer overflow whine | 2000-6000Hz (sweeping) | Cutting, urgent. Overlaps ping band intentionally. |
| EM hum | 100-300Hz (modulated) | Low presence. Subtle awareness. |
| Compression squish | 500-2000Hz (filtered burst) | Mid-range textural. Brief. |

**Band reservation via BiquadFilterNode:** Each audio source chain includes a bandpass filter centered on its reserved band. The kulintang gongs pass through a 250-800Hz bandpass, attenuating their upper harmonics that would conflict with the channel ping band. Channel pings pass through a 1500-4000Hz bandpass, attenuating their fundamental that would conflict with the gong band.

**At maximum density, the spectral mix maintains clarity:**
All 14 units could be producing simultaneous audio events and each occupies a distinct spectral region. The gongs warm the low-mids, the pings sparkle in the upper-mids, the agung thumps in the bass, combat cracks in the highs. Even without priority ducking or spatial panning, the events are distinguishable by frequency alone.

**Strengths:**
- **Works on ALL speakers.** Mono, stereo, phone, laptop, headphones — frequency separation is preserved on every playback system. No headphone requirement.
- **Constant audibility of all layers.** Unlike ducking, no event is suppressed. The kulintang gongs play at full volume even during combat — they just occupy a different spectral band that doesn't mask the dabakan.
- **Cognitive load distribution.** Different frequency bands recruit different auditory attention channels. Low frequencies are processed more automatically (rhythm, presence); high frequencies require more active attention (identification, location). The mix naturally distributes cognitive load.

**Weaknesses:**
- **Timbral distortion.** Bandpass filtering removes harmonics that define an instrument's character. A kulintang gong with its upper partials removed sounds like a marimba, not a gong. A dabakan without its low-frequency body sounds like a hi-hat, not a drum. Aggressive filtering destroys the sonic identity.
- **Buffer overflow occupies the ping band.** The overflow whine (2-6kHz) and channel pings (1.5-4kHz) overlap. During overflow, pings are masked by the whine. This could be intentional (overflow drowns out information — mechanically appropriate) or frustrating (I need to hear which channels are firing during the crisis).
- **Narrow bands limit dynamic range.** A full-spectrum sound has more perceived loudness than a band-limited sound. Filtered events feel quieter and thinner, requiring volume compensation that risks clipping.

---

## Option D: "The Concertmaster" — RECOMMENDED Hybrid

### How It Works

Combine all three approaches in a layered system:

1. **Frequency reservation (always active):** Each event type is gently shaped (not aggressively filtered) to emphasize its primary band while keeping harmonics. Gongs are slightly darkened (high shelf -3dB above 2kHz), pings are slightly brightened (low shelf -3dB below 800Hz). Subtle spectral hygiene, not harsh bandpassing.
2. **Priority ducking (event-driven):** The P0-P3 priority stack ducks lower tiers when critical events fire. But ducking amounts are REDUCED because frequency reservation already provides separation: P0 ducks P3 by only -6dB (not -12dB), because they already occupy different bands.
3. **Spatial panning (headphone-dependent):** When headphones are detected (via AudioContext latency heuristic — headphone latency < 20ms vs. speaker latency > 20ms), spatial panning activates. On speakers, panning is disabled and stereo width is collapsed to a narrow ±0.3 range.
4. **Voice limiting (density-dependent):** Maximum simultaneous channel pings capped at 4. When 6 channels fire on the same tick, the 4 most recent are played; the 2 oldest are dropped with a visual-only indicator. This prevents the "ping avalanche" at high density.
5. **Proximity priority within P1:** When multiple P1 events fire simultaneously, the event nearest to the player's LAST INSPECTED UNIT gets a +3dB boost. The mixer remembers which unit the player was focused on in the Plan phase and subtly highlights audio events related to that unit's signal network. This creates a "follow your attention" audio focus.

**The Concertmaster's Decision Tree (per tick):**

```
FOR each tick:
  1. Collect all audio events this tick
  2. Sort by priority (P0 first)
  3. Apply frequency shaping to each event
  4. IF headphones detected: apply spatial panning
  5. IF P0 events exist: duck P1 by -6dB, P2 by -6dB, P3 by -6dB
  6. IF P1 count > 4: drop oldest, keep 4 most recent
  7. IF proximity priority: boost nearest-to-focus by +3dB
  8. Schedule all events via AudioWorklet
  9. After longest P0 event ends: release ducks over 200ms
```

**Strengths:**
- Three layers of separation (frequency + priority + spatial) means each layer can be gentle. No single technique is pushed to extremes.
- Degrades gracefully: no headphones = no spatial (still clear from frequency + priority), budget phone = reduced voice limit (still clear from frequency), hearing impaired = visual fallback (6.02b).
- Proximity priority creates a personalized mix — two players in the same battle hear slightly different mixes based on their attention focus. This mirrors the real agentic engineering experience: you're focused on the system you built, hearing it more than the background.
- Voice limiting at 4 is perceptually invisible — human attention can track ~4 audio streams simultaneously (Cowan's magical number). Dropping the 5th and 6th ping loses no perceptual information.

**Weaknesses:**
- Complexity. Five interacting systems with edge cases: What if the proximity-boosted event is also the oldest (should be dropped)? What if P0 and P1 events are at the same grid position (spatial panning doesn't separate them)?
- Headphone detection is unreliable. The latency heuristic is a guess. Bluetooth headphones have high latency (>50ms) and might be misidentified as speakers. Include a manual toggle.
- The "follow your attention" proximity boost might create confirmation bias — you hear what you WANT to hear rather than what you NEED to hear. A unit you didn't focus on might be in crisis, and its audio is the one getting -3dB reduced.

---

## Player Journeys

### Journey: Kwame, 28, Twitch Streamer in Accra, Streaming Mission 8

**Context:** Kwame is a Diamond-ranked competitive player streaming a Mission 8 attempt. He plays with studio headphones (Audio-Technica ATH-M50x) and a mic. His stream overlay shows his face, the game, and a chat window. 847 viewers.

**Minute 0:00 — Plan Phase, Building a 14-Unit Army**
Kwame has been optimizing this architecture for three days. His army: 2 Scouts, 3 Strikers, 2 Relays, 1 Specialist, 1 Command. Six channels wired in a star topology with Command at the center. During the Plan phase, the kulintang melody is sparse — his units are spread across columns A, C, D, E, F, and H, leaving B and G silent. He hears a 6-gong layered pattern, warm and spacious. "Listen to that chord," he tells chat. "Six voices. That's my army." He knows the chord will change during battle as units die or reposition.

He hovers over the EXECUTE button. The DualSense adaptive trigger provides resistance (6.06b). He presses through it. The kulintang accelerates.

**Minute 0:30 — Tick 1-5, The Opening**
Agung BOOM. Full ensemble — the remaining two columns (B, G) are enemy-occupied, so all 8 gong voices play. Dense, shimmering, bronze. His two Scouts begin patrolling. From the LEFT speaker: a bright double-note ping (the "patrol-report" identicon, generated from the name hash — ascending triangle wave at B3). From the LEFT-CENTER: the Relay receives. A squish sound (compression) plays briefly. From the CENTER: a lower, warmer ping (the "compressed-intel" identicon — the Relay's outbound channel, descending sine wave at E3).

"Signal chain is clean," he narrates. "Scout to Relay to Striker. Two hops, 4 ticks latency. Watch the right side — Striker will move at Tick 5."

Tick 5: From the RIGHT speaker, a movement sound (servo whir + metallic tap — urban terrain). The Striker repositions. Kwame nods. He heard the whole chain play out spatially from left to right across the stereo field, tracking the information flow across the board by ear.

**Minute 1:00 — Tick 8-10, The Stress Test**
Enemies swarm. Tick 8: three combat events across the board. Three dabakan CRACKS — left, center-right, right — staggered within the tick resolution. The spatial panning separates them: he knows three fights happened at different positions. The kulintang ducks by -6dB for 200ms during the dabakan peaks, then recovers. The music breathes — loud-quiet-loud — synchronized to the violence.

Tick 9: his Command unit receives six signals simultaneously (all hook slots trigger on the same tick). Voice limiting kicks in — only 4 pings play. But Kwame notices: the 4 that play are panned to four distinct positions (left, left-center, center, right), creating a satisfying spatial spread. The 2 dropped pings flash as visual-only signal line glows (no audio). He doesn't notice the drops — 4 concurrent pings already sound like "the network is busy."

The proximity priority kicks in: his most-inspected unit last session was the Relay at D4. The "compressed-intel" ping from D4 gets a +3dB boost. It cuts through slightly more than the others. Subconsciously, he's tracking his Relay network's health more than the peripheral Scouts'.

**Minute 1:30 — Tick 12, The Crisis**
Buffer overflow on Relay at D4. The rising whine begins at 2kHz, climbing. Priority: P0. The ducking engages: kulintang drops -6dB. Channel pings drop -6dB. The agung at tick boundary is reduced but still thumps. The overflow whine DOMINATES — a thin, sharp, insistent scream from the LEFT-CENTER (D4's spatial position). "RELAY'S OVERLOADING!" Kwame shouts. Chat explodes with LULW and F emojis.

Simultaneously, Striker eliminates an enemy at H6 — dabakan CRACK from the hard RIGHT. Two P0 events from different spatial positions. The brain separates them: left = whine (crisis), right = crack (victory). Without spatial panning, these two P0 events would merge into a confusing wall. With panning, they're distinct narratives happening in different locations.

The overflow resolves (500ms). The duck releases over 200ms. The kulintang swells back. Kwame exhales. "The mix went quiet for half a second and I knew something was wrong BEFORE I saw the bar turn red," he tells chat. "This game uses audio as a sixth sense."

**Minute 3:00 — The Fade**
Ticks 15-20: units dying. Each elimination drops a gong voice. Kwame watches the music thin in real time. Six voices, five, four. The spatial field narrows — his surviving units are clustered on the right side of the board, so the stereo image collapses rightward. The left speaker goes almost silent. "I'm losing the left flank," he says. "I can HEAR it in the music. Listen — no gongs on the left anymore."

By Tick 22, he has 4 units left. The kulintang is skeletal — four quiet gong voices, no kick drum (enemy killed his factory), just the agung tick marking time. The silence on the left is deafening. Then his Striker at G7 eliminates the last enemy base. Dabakan CRACK from the right. The remaining 4 gong voices swell to full volume. The agung plays its seal-breaking sustained hit. Kwame punches the air.

**UI Annotations:**
- Headphone detection: active (studio monitors, <10ms latency)
- Spatial panning: full ±1.0 stereo field, row depth -6dB max
- Voice limit: 4 concurrent P1 events, dropped events get visual-only
- Proximity boost: +3dB on events near last-inspected unit
- Ducking: P0→P3 -6dB, 10ms attack, 200ms release


### Journey: Sofia, 15, First-Timer in Manila on Laptop Speakers

**Context:** Mission 5, first factory mission. Built-in laptop speakers (mono-adjacent, 200Hz-12kHz range). No headphones. Playing in a moderately noisy classroom during lunch break.

**Minute 0:00 — Plan Phase, Low-Volume Audio**
Sofia has the game at 60% volume — classmates are chatting. The kulintang melody plays through the laptop speaker, warm but thin (no sub-bass, limited stereo). She can hear the gong pattern but can't distinguish spatial positions — everything comes from the same small speaker grille. The frequency shaping helps: gongs sound distinctly different from pings (warm metallic vs. bright chirp) even without spatial separation.

She configures her first hook. The descending three-note sound plays when she types a channel name. She names it "help" — short, simple. The channel identicon sound is a quick high-pitched blip. She'll recognize it later during Sealed Watch, maybe.

**Minute 1:00 — EXECUTE, Speaker Mix**
The agung hits — on laptop speakers, it sounds like a dull thump rather than a chest-vibrating boom. The frequency shaping has kept the agung's 80-250Hz presence as strong as the speaker allows. The kick drum is nearly inaudible (too low for laptop speakers). The kulintang gongs provide the rhythmic anchor instead.

Tick 3: her Scout broadcasts "help." A bright chirp from the speaker — the babendil ping. She can't tell which direction it came from (no spatial panning on mono speaker), but she heard SOMETHING happen. She looks at the board and sees the green signal line flash. Audio + visual together = confirmation that the hook fired.

Tick 5: two events — a channel ping and a combat crack. The frequency separation saves the mix: the ping is in the 1.5-4kHz range, the dabakan crack is in the 4-8kHz range. Even through the laptop speaker, they sound distinct — a bright chirp followed by a sharp snap. Without frequency reservation, both events would occupy the same upper-mid range and merge into mush.

**Minute 2:00 — The Classroom Mix Challenge**
A classmate starts talking loudly. The game audio competes with ambient noise. The priority ducking ensures that when the buffer overflow whine fires at Tick 9, it's the LOUDEST thing in the mix — cutting through both the game music AND the classroom chatter. The -6dB ducking on the kulintang gongs means the whine has 6dB more headroom. Sofia's head snaps back to the screen. The whine did its job — it grabbed her attention in a noisy environment.

She enables subtitles from the accessibility menu (she saw the option in settings earlier). Now she has audio (frequency-separated, priority-ducked) plus text (subtitle track at the bottom). Between the chirps she can hear and the text she can read, she misses nothing even on a tiny laptop speaker in a noisy room.

**UI Annotations:**
- Speaker detection: non-headphone (latency >30ms), spatial panning disabled
- Stereo collapsed to ±0.3 narrow field
- Frequency reservation as primary separation (no spatial fallback)
- Sub-bass drone inaudible on laptop speakers — no gameplay information lost
- Subtitle track enabled as supplement


### Journey: Dr. Tanaka, 58, Accessibility Researcher Testing with Lab Equipment

**Context:** Dr. Tanaka is evaluating Robot Uprising's audio mixing for a SIGCHI paper on adaptive game audio. She has a calibrated audio setup: Sennheiser HD 600 headphones, RME Babyface Pro audio interface, Audacity recording, MATLAB spectral analysis.

**Minute 0:00 — Baseline Measurement, Plan Phase**
She records 30 seconds of Plan phase audio. In Audacity, the spectrogram shows: a clear band at 250-800Hz (kulintang gongs), sub-bass presence below 80Hz (drone), and sporadic bright events at 1.5-4kHz (config change tones). The spectral bands are distinct — no overlap below -12dB between the gong band and the ping band. "Good spectral hygiene," she notes.

She opens the EXECUTE button and records the full Sealed Watch.

**Minute 1:00 — Dense Mix Analysis**
The spectrogram at peak density (Tick 12, 14 units, P0 event) shows: the overflow whine sweeps from 2kHz to 6kHz over 500ms — a clear ascending diagonal line in the spectrogram. Below it, the kulintang band (250-800Hz) dips by exactly 6dB for 500ms (the P0 ducking). The channel pings (1.5-4kHz band) also dip by 6dB. Recovery ramp is 200ms, visible as a gradual return to baseline in the spectrogram.

She measures the signal-to-noise ratio of a single channel ping during the overflow event: -6dB from normal level, but with the overflow whine occupying 2-6kHz and the ping at 1.8kHz, the spectral distance provides an additional ~9dB of perceived separation. Net perceived SNR: ~3dB above masked threshold. "Audible but not comfortable," she notes. "The designer intended you to STRUGGLE to hear signals during overflow — mechanically appropriate."

She counts concurrent voices at Tick 12: 8 column gongs + 1 agung + 1 kick + 4 channel pings (voice-limited from 6) + 1 overflow whine + 1 combat crack + 1 EM hum = 17 simultaneous audio sources. The master bus DynamicsCompressorNode is working: gain reduction shows -4dB at peak, preventing clipping while maintaining dynamic range. Crest factor (peak-to-RMS ratio) is 8dB — healthy for game audio (anything below 6dB sounds crushed, above 12dB sounds too dynamic).

**Minute 3:00 — Spatial Analysis**
She plays back a segment with three combat events at different board positions. Binaural analysis in MATLAB shows: Event 1 at column A is panned to -0.85 (left), Event 2 at column E is panned to +0.15 (slight right), Event 3 at column H is panned to +1.0 (hard right). The interaural level difference (ILD) between Events 1 and 3 is 6dB — sufficient for localization. The interaural time difference (ITD) is 0ms (panning is volume-based, not delay-based) — a limitation noted in her paper.

She switches to laptop speakers (built-in MacBook Pro) and repeats. Spatial separation collapses: all three events center at ±0.2. But frequency separation maintains distinction — three dabakan cracks with slightly different spectral shaping (frequency reservation applies a slight per-position tilt, ±1dB, to the combat band). "Marginal but present," she notes. "The spectral micro-separation is a nice fallback."

**Minute 5:00 — Inspector Audio, Scrubber Interaction**
She records the Inspector mode. The spectrogram shows: sustained drones at 250-800Hz (stretched gong partials), LFO modulation at 0.5-2Hz visible as amplitude ripples, and transient clicks at 1-3kHz (unit inspection pops). When she scrubs the timeline, the drone pitch shifts — a continuous glissando from 400Hz (scrubbing backward) to 600Hz (scrubbing forward). The pitch change is proportional to scrub speed: faster scrubbing = larger pitch deviation. "Sonification of time navigation. Novel approach," she notes.

She measures the buffer slot chord: four occupied slots humming at C4 (262Hz), E4 (330Hz), G4 (392Hz), A4 (440Hz) — pentatonic intervals. Combined, they form a stable, consonant chord. When she scrubs to a tick where the fifth slot fills, B4 (494Hz) enters. The chord shifts character — still pentatonic but more complex. "The buffer state IS a musical state. Clever isomorphism."

**UI Annotations:**
- Master bus compressor: threshold -18dB, ratio 4:1, knee 6dB
- Peak concurrent voices: 17 at maximum density
- Crest factor target: 8dB (measured at 7.6-8.4dB range)
- Spectral bands: 6 distinct bands with >12dB inter-band isolation at -6dB points
- Spatial panning: ILD-based only, no ITD (Web Audio PannerNode limitation in equalpower mode)

---

## Strengths and Weaknesses

### Strengths
- **The Concertmaster degrades gracefully.** Remove spatial panning (no headphones) → frequency separation still works. Remove frequency shaping (processing budget) → priority ducking still works. Remove priority ducking (uniform mix) → you still hear everything, just messier. Each layer is independently valuable.
- **Proximity priority creates personalized mixes.** Two players in the same battle hear slightly different emphases based on their attention. This mirrors real agentic engineering: you monitor YOUR system more closely than background systems.
- **Voice limiting at 4 is perceptually lossless.** Human attention can track ~4 simultaneous audio streams (Cowan's magical number 4). Dropping the 5th and 6th ping loses no practical information while preventing the "ping avalanche."
- **The ducking itself becomes information.** When the kulintang suddenly quiets, the player knows a P0 event fired before consciously identifying it. The absence of music IS a signal. This is exploitable — the moment the mix ducks, your hands should be reaching for the Inspector entry.
- **Spectral separation works on all speakers.** Laptop, phone, headphones, monitors — frequency-based separation translates universally.

### Weaknesses
- **Five interacting systems create edge cases.** Proximity boost + voice limiting + spatial panning + frequency shaping + priority ducking = a parameter space with unexpected interactions. What if all four voice-limited pings are from the same grid position? Spatial panning provides no separation and you get a stacked chord.
- **Headphone detection is unreliable.** Bluetooth headphones have high latency (50-200ms) and may be misidentified as speakers. Manual override toggle is essential.
- **Proximity priority introduces bias.** Boosting audio near your "focus" unit means you're LESS aware of crises elsewhere. In competitive play, a skilled opponent might exploit your audio blind spot on the non-focus flank.
- **The overflow whine MUST cut through everything.** Even with gentle frequency reservation, the overflow whine (2-6kHz sweep) and channel pings (1.5-4kHz) compete. During overflow, you can't hear which channels are still transmitting — which is arguably correct (your relay is stunned, NOTHING should be transmitting) but might frustrate players who want full awareness.

---

## Interaction Effects with Locked Decisions

- **8x8 grid:** The grid size constrains the spatial panning resolution. Eight columns map to 8 discrete stereo positions — sufficient for left/center/right discrimination, too few for precise localization. A 16x16 grid would need HRTF-based spatial audio; 8x8 can use simple panning.
- **1 second per tick:** Each tick provides a 1-second window for all audio events. At 2x speed (0.5s), the window halves. Voice limiting becomes more important at 2x — less time means fewer events can be perceived. At 0.5x (2s), the window is generous and voice limiting can relax to 6 or 8 concurrent pings.
- **One-shot one-kill:** Combat is binary and instant. The dabakan crack must be unmistakable — P0 priority + spatial panning + frequency reservation in the 4-8kHz band ensures combat is always the sharpest, most attention-grabbing event in the mix.
- **5 unit types with different hook slot counts:** Scout (2 slots) generates 0-2 pings per tick. Command (6 slots) generates 0-6 pings per tick. A single Command unit can consume the entire 4-voice limit. The mixer should weight ping priority by unit type — Command pings at normal volume, individual Scout pings at -2dB (Scouts produce less critical signals).
- **Inspector timeline scrubber:** When scrubbing through a replayed battle, the adaptive mix must reconstruct from the event log. The same priority/spatial/frequency processing applies to replayed audio, maintaining consistency between live and replayed experience.

---

## Comparable Games

- **Overwatch 2 (Blizzard):** The gold standard of competitive game audio mixing. 12 players with 30+ abilities firing simultaneously. Overwatch uses "importance" scoring — each ability has a threat level that dynamically adjusts its audio priority. Enemy ultimates are always the loudest sound. Robot Uprising's P0-P3 system directly parallels Overwatch's threat scoring.
- **Dead Cells (Motion Twin):** Rapid combat with dozens of concurrent sound effects. Uses aggressive spectral reservation — each weapon type occupies a distinct frequency band. The "whip" sounds completely different from the "hammer" even with 8 enemies on screen. Key lesson: timbral variety IS a mixing tool.
- **Rez (Tetsuya Mizuguchi):** Every enemy, every shot, every collectible is a musical voice quantized to the beat grid. At maximum density, 20+ simultaneous sounds create a "sound world" rather than a mix. Key lesson: when everything is musical, density isn't cacophony — it's a richer composition. The kulintang gongs follow this principle.
- **Factorio (Wube Software):** Factory noise increases with complexity. At scale, the ambient noise is a wall of clanking, hissing, and whirring. Factorio uses distance-based attenuation aggressively — you only hear nearby machines. Key lesson: locality is a powerful mixing tool. Robot Uprising's row-depth attenuation and proximity priority serve the same function.
- **Mini Metro (Dinosaur Polo Club):** Each metro line is a musical voice. At 8+ lines, the mix could become chaos but Disasterpeace used frequency reservation and volume balancing to keep each line audible. Key lesson: procedural music at scale requires automated mixing — hand-tuning doesn't survive the combinatorial explosion.

---

## Sensory Description

**Mission 8, Tick 12, maximum density through studio headphones:**
Fourteen units. Eight gong voices creating a shimmering bronze wash — warm, metallic, each voice panned to its column position, the leftmost gong ringing from your left ear, the rightmost from your right. Below: the kick drum punches at 120 BPM, the sub-bass drone vibrates the headphone cushions against your temples. The agung BOOMS center-stage, deep, reverberant, the tick boundary felt in your chest.

Then three things happen in 400 milliseconds. From the LEFT: a bright ascending chirp (the Scout's "patrol-report" ping). From the CENTER: a brief textural squish (the Relay compressing). From the RIGHT: a sharp CRACK (the Striker eliminating an enemy), the dabakan cutting through the mix like a slap on a desk. The three events occupy three spatial positions and three frequency bands — the chirp at 2kHz, the squish at 800Hz, the crack at 5kHz. Your brain separates them effortlessly, like three instruments in an orchestra.

Then the crisis: from the LEFT-CENTER, a rising whine. 2kHz climbing to 6kHz over half a second. The kulintang gongs fade — not gone, just quieter, pushed back, like a conversation dropping to whispers when someone screams. The whine fills the space the gongs vacated. Your attention snaps to the Relay's position in the stereo field. The DualSense in your hands begins the Cascade vibration — escalating pulses, faster and faster. Audio whine + haptic cascade + visual buffer bar turning red. Three channels, one message: OVERLOAD.

The whine resolves. Thud. The gongs swell back. The stereo field fills again. You exhale. Seventeen simultaneous audio sources played through your headphones and you heard every one that mattered.

**Same moment through a laptop speaker:**
A wall of metallic sound — gongs and pings merged into a busy shimmer. No spatial separation. But frequency separation preserves the essentials: the low agung thump is distinct from the bright babendil chirps, which are distinct from the sharp dabakan crack. When the overflow whine fires, the gongs quiet (ducking), and the whine rises — thin and piercing through the laptop speaker's 3kHz peak response frequency. You hear the crisis. You hear the combat. You hear the rhythm. The spatial nuance is gone but the information survives.

---

## The TikTok Clip

The 15-second clip: a spectrogram visualization running alongside the battlefield. Real-time animated frequency bars showing each audio layer as a distinct colored band. The kulintang gongs glow warm amber in the low-mids. Channel pings flash cyan in the upper-mids. The dabakan cracks spark white in the highs. Then the overflow whine sweeps upward — a diagonal line of red cutting across the spectrogram — and the amber gong band visibly ducks downward. The visual is beautiful: a living painting of sound, showing how 17 concurrent voices sort themselves into clarity. Caption: "17 sounds. Zero chaos. The game mixes itself."
