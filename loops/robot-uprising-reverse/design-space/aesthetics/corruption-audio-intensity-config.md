# 6.10e — Player-Configurable Corruption Audio Intensity

## The Design Challenge

The corruption audio system (6.10, 6.10c hybrid vocabulary) is built to serve a wide band of player needs: detection cueing, severity communication, resolution satisfaction. But "wide band" is precisely the problem. A player deep in a 30-minute corruption sweep on Mission 9 has different tolerance for alarm cascades than a player cracking open Mission 7 for the first time. A streamer balancing game audio against voice commentary needs different headroom than a solo player on studio monitors at midnight. The hybrid vocabulary's three-layer ceiling (ambient, interaction, event) produces up to three simultaneous audio channels of corruption information — and the right amount of information for one player is sensory overload for another.

This document designs a **Corruption Intensity Slider** — a settings control that gives players agency over how aggressively the corruption audio demands their attention, without removing the information content of the system.

---

## The Mechanic: The Corruption Dial

### Setting Location

The slider lives in **Settings > Audio > Corruption Intensity**, accessible from the main menu and from the Plan Phase pause menu (so players can adjust mid-session without exiting to main menu). The setting is also surfaced as a quick-access icon in the Plan Phase toolbar — a small waveform icon that, when clicked, opens a minimal popup with just the slider and a 3-second audio preview at the current level.

### The Three Named Presets

The slider is continuous, but three named anchor points give players language for the positions:

**"Whisper" (0-30% of slider range)**
The corruption audio system operates in perturbation-only mode. Only the ambient layer is active. No Geiger clicking, no heartbeat events, no alarm cascades. The player knows corruption exists because the ambient soundscape subtly shifts — the sour harmonic in the kulintang, the faint static underneath the server room hum. This is a background hum of wrongness, not a call to action. The system trusts the player to notice on their own schedule.

**"Standard" (31-70% of slider range, default at 50%)**
The full hybrid vocabulary operates at its designed levels. All three layers (ambient, interaction, event) are active with the volume hierarchy and trigger thresholds documented in 6.10c. This is the intended experience for most players — corruption detection, spatial location via Geiger clicking, severity communication via heartbeat, satisfying resolution sounds.

**"Aggressive" (71-100% of slider range)**
The corruption audio system activates earlier, louder, and with more simultaneous voices. Thresholds for triggering higher-severity sounds are lowered. The system treats even minor corruption as urgent. A single corrupted config field that would produce faint ambient perturbation at Standard now triggers Geiger clicking at moderate proximity and a slow heartbeat. This mode is for players who want maximum diagnostic information from the audio channel — veterans who have internalized the sonic vocabulary and use it as a primary detection instrument.

### What Each Slider Position Actually Changes

The slider modulates four independent parameters on a continuous curve:

**1. Layer Volume Envelope**

| Parameter | Whisper (0%) | Standard (50%) | Aggressive (100%) |
|-----------|-------------|-----------------|-------------------|
| Ambient corruption layer | -24dB | -18dB | -12dB |
| Interaction layer (Geiger) | OFF | -12dB | -6dB |
| Event layer (heartbeat/alarm) | OFF | -6dB | 0dB (reference) |
| Resolution sounds (revert/purge) | -12dB | -6dB | 0dB |

At Whisper, the interaction and event layers are fully ducked — their volume is zero. Between Whisper and Standard (30-50%), these layers fade in gradually. At Aggressive, all layers are at their maximum designed volume, with the event layer approaching the loudest sounds in the game (matched only by combat impacts during sealed watch).

**2. Severity Trigger Thresholds**

The corruption system assigns severity tiers to corruption states (mild, moderate, severe, critical). The slider shifts when each tier's audio treatment kicks in:

| Corruption State | Whisper Tier | Standard Tier | Aggressive Tier |
|-----------------|-------------|---------------|-----------------|
| 1 corrupted field | Silent | Mild | Moderate |
| 1 corrupted rule | Silent | Mild | Severe |
| 1 injected hook | Perturbation only | Moderate | Severe |
| 2+ corruptions | Perturbation only | Moderate | Critical |
| 3+ corruptions | Mild | Severe | Critical |
| Integrity <50% | Moderate | Critical | Critical + alarm cascade |

At Aggressive, a single corrupted rule is already producing the arrhythmic heartbeat and deep-pitched Geiger clicks that Standard reserves for multi-corruption scenarios. The system is hypersensitive — it treats every anomaly as a potential crisis.

**3. Simultaneous Corruption Voice Count**

"Voices" are the number of independent corruption audio sources that can play simultaneously. When multiple corrupted elements exist, Standard plays the corruption audio for the element nearest the cursor plus the ambient layer. Aggressive plays audio for up to three nearest corrupted elements simultaneously, each stereo-panned to its screen position, creating a spatial audio map of all nearby corruption without requiring the player to sweep.

| Setting | Max Simultaneous Voices |
|---------|------------------------|
| Whisper | 1 (ambient only) |
| Standard | 2 (ambient + nearest interaction) |
| Aggressive | 4 (ambient + 3 nearest interactions) |

**4. Distortion Frequency Range**

The frequency band allocated to corruption distortion effects widens with intensity:

| Setting | Frequency Range | Character |
|---------|----------------|-----------|
| Whisper | 200-800Hz | A low murmur. Sits beneath the soundtrack. You feel it more than hear it. |
| Standard | 200-4000Hz | Spans the full mid-range. Clearly audible, clearly separate from music and SFX. |
| Aggressive | 60-8000Hz | Sub-bass to upper presence. Corruption occupies the full audible spectrum. At high severity, it competes with the soundtrack for spectral space. |

At Aggressive, full-alarm-cascade corruption literally fights the soundtrack for the listener's attention — the corruption audio becomes a second music layer, dissonant and intrusive, demanding resolution.

### Per-Screen vs. Global Setting

The slider is **global by default** — one setting applies to Plan Phase, Sealed Watch, and Inspector. However, an advanced toggle in Settings > Audio > Corruption Intensity unlocks **per-screen overrides**:

- **Plan Phase intensity** — Most players want this at Standard or above, since the Plan Phase is where corruption detection and resolution happen.
- **Sealed Watch intensity** — Many players prefer lower intensity here, since mid-battle corruption (EMP buffer degradation per 6.10f) competes with combat audio and the sealed watch's emotional arc. A common pattern is Standard for Plan, Whisper for Sealed Watch.
- **Inspector intensity** — The Inspector provides visual corruption data so thoroughly that some players mute corruption audio entirely here. Others want Aggressive because they use audio cues to quickly scan the replay timeline for corruption events.

Per-screen overrides display as three mini-sliders beneath the main slider, collapsed by default.

---

## Player Journeys

#### Journey: Dalisay, 34, UX Designer

**Context:** Mission 8 — her first encounter with corruption. She plays on laptop speakers in a shared apartment. Her partner is reading on the couch nearby. She has mild audio sensitivity and keeps game volume at 40%.

**Minute 0:00 — Workbench Opens**
The kulintang melody plays. Something sounds wrong — a sour note she can't place, plus a faint clicking underneath. She checks the integrity indicator: 82%. Three corrupted elements. The amber text explains what corruption is. She reads it. The clicking continues. It's distracting — she's trying to read the tutorial popup but the audio keeps pulling her attention.

**Minute 0:45 — Settings Detour**
She pauses, opens Settings > Audio. She sees "Corruption Intensity" with the slider at Standard. She reads the tooltip: *"Controls how aggressively corruption audio demands your attention. Whisper = subtle background shifts. Aggressive = full alarm cascade."* She drags it to Whisper. The clicking vanishes instantly. The sour note in the kulintang remains, but quieter — more of a coloring than a disruption. She can think again.

**Minute 1:30 — First Corruption Sweep**
She uses the visual integrity indicators to find corruption. The amber highlighting on corrupted fields guides her. In the background, the ambient perturbation provides a gentle reminder that the system isn't clean. She finds and reverts a corrupted patrol radius. A soft, clean tone plays — muted but present. The ambient dissonance lessens slightly. She smiles. The sound told her "you fixed something" without demanding she process the information.

**Minute 4:00 — Mission Launch**
All corruption resolved. The ambient returns to its clean state — the sour note dissolves into the proper melody. At Whisper intensity, this transition is gentle, almost subliminal. No dramatic all-clear chord, no silence-then-warmth. Just the music returning to normal, like a headache fading. She launches the mission. Her partner never looked up from their book.

**Minute 12:00 — Post-Mission Reflection**
In the debrief, she notices the corruption audio was barely present during sealed watch (Whisper applies globally). She didn't hear the EMP buffer degradation at all — she only noticed it in the Inspector timeline. She makes a mental note: "Maybe I should turn it up for sealed watch next time." She doesn't. Whisper stays. She completes the campaign at Whisper and never changes it.

---

#### Journey: Kai, 22, Computer Science Student and Speedrunner

**Context:** Mission 10 — his fourth playthrough. He's optimizing corruption sweep time for his speedrun category. He plays on open-back headphones with a DAC/amp. He has memorized the frequency signatures of every corruption type.

**Minute 0:00 — Pre-Session Calibration**
Before starting the run, Kai opens Settings > Audio > Corruption Intensity and drags the slider to 100% — full Aggressive. He also enables per-screen overrides: Plan Phase at 100%, Sealed Watch at 80%, Inspector at 0% (he uses visual data only in Inspector). He runs a "sound check" by loading a practice mission with known corruption placement and listening. At Aggressive, three corrupted elements produce a dense audio texture: the ambient tritone is unmistakable, the Geiger clicks from all three elements play simultaneously at different stereo positions, and the heartbeat for the nearest corruption is already audible at moderate proximity. He nods. Maximum information density.

**Minute 0:00 — Mission 10 Workbench Opens (Timed Run)**
Integrity: 64%. Five corruptions — this is the hardest corruption sweep in the campaign. The ambient layer at Aggressive is a wall of dissonance — the kulintang melody is buried under a tritone that pulses at 2Hz, nauseating and insistent. Beneath it, four distinct Geiger click streams at different pitches and stereo positions. He doesn't need to sweep. He can HEAR where they are.

**Minute 0:02 — Spatial Audio Triage**
Hard left: low-pitched clicking, slow heartbeat. Corrupted config. Minor. Hard right: rapid high-frequency clicking, arrhythmic heartbeat. Injected hook. Critical. Center-left: medium clicks. Center-right: medium clicks. He mentally maps four of five corruptions by ear in two seconds. The fifth must be in a panel he hasn't opened yet.

**Minute 0:05 — Speed Purge**
He navigates directly to the critical hook (hard right) first — highest severity = highest priority in the scoring category. The Aggressive event layer produces a dramatic heartbeat at 150 BPM with flatline interjections. He right-clicks, [PURGE]. The heartbeat's deceleration cascade is compressed at Aggressive — faster resolution animation, more dramatic. The all-clear tone is louder. He doesn't savor it. He's already moving to the next target.

**Minute 0:18 — Final Corruption**
Five corruptions purged in 18 seconds. The ambient tritone is gone. The all-clear chord at Aggressive is enormous — three sine waves in a major triad at near-maximum volume, filling the headphone soundstage. At Whisper, this moment is a gentle exhale. At Aggressive, it's a choir. Kai's chat timer shows 18.4 seconds. Personal best. The audio feedback loop — hear, locate, purge, hear resolution — is faster than any visual-only sweep because the ears process spatial information in parallel while the eyes process it serially.

**Minute 0:20 — Sealed Watch Begins**
At 80% Sealed Watch intensity, the EMP buffer degradation during combat is clearly audible — a rising-pitch distortion that signals which units are taking integrity damage in real-time. At Standard, this sound competes with combat audio and is easy to miss. At near-Aggressive, Kai can track which flank is under electronic attack without looking at the unit status bars. He's already planning his post-match config adjustments based on what he hears.

---

#### Journey: Patricia, 28, Twitch Streamer (800 avg. viewers)

**Context:** Mission 9 — first playthrough, streamed live. She plays with a condenser mic 18 inches from her face, studio monitors at moderate volume, and OBS capturing desktop audio. Her audio mix is: game at 60%, mic at 100%, alerts at 40%.

**Minute 0:00 — Pre-Stream Audio Check**
During her pre-stream setup, Patricia loads Mission 9 to check corruption audio levels. At Standard, the Geiger clicking is audible on her stream recording but competes with her commentary. The heartbeat event sounds are fine — they're lower frequency and sit beneath her voice. The issue is the clicking: it's in the 2-4kHz range, exactly where her voice's consonant clarity lives. She worries viewers will hear *tick-tick-tick-tick* competing with her explanations.

**Minute 0:03 — The Streamer Compromise**
She sets the main slider to 40% — just above Whisper, into the low end of Standard. At this position, the ambient perturbation is clearly audible (good for stream atmosphere — viewers can hear that something is wrong), the Geiger clicking is present but at -18dB (won't compete with voice), and the heartbeat events are quiet but still trigger (they add drama without drowning out commentary). She enables per-screen overrides: Plan Phase at 40%, Sealed Watch at 25% (she needs to narrate combat without corruption audio fighting her), Inspector at 60% (Inspector segments are less commentary-heavy, so the audio can be more prominent).

**Minute 5:00 — Live Corruption Sweep**
"Chat, you hear that? That sour note in the music? That means we have corruption. Let me sweep..." She moves her cursor across the workbench. The Geiger clicking is present but subtle — viewers can hear it in quiet moments between her sentences but it never steps on her voice. She finds a corrupted hook. "Okay, there's a foreign hook on our relay. Listen to the heartbeat — hear how it's fast? That means this is a serious one." The heartbeat at 40% intensity is audible enough to be a stream moment but quiet enough that her narration remains dominant.

**Minute 5:30 — The Clip Moment**
She purges the hook. The resolution sound — heartbeat deceleration into clean tone — plays at moderate volume. "CLEAN. God, I love that sound." Chat spams hearts. The resolution sound at 40% is satisfying without being overwhelming. At full Aggressive, the resolution chord would have clipped her audio compressor and produced a jarring volume spike on stream. At 40%, it's a moment of catharsis that fits the broadcast mix.

**Minute 7:00 — Chat Requests**
A viewer asks: "Can you turn up the corruption audio? I wanna hear the full alarm cascade." Patricia: "I'll turn it up for Inspector since I talk less there. But during Plan Phase, you need to hear ME, not the robot heartbeat." She opens per-screen overrides on stream, shows the three sliders, adjusts Inspector to 80%. Chat approves. The per-screen system lets her serve both audiences — her voice during active gameplay, rich corruption audio during analysis.

---

## Strengths

**"The Goldilocks Resolver"** — The most common complaint about layered audio systems is "too much" or "not enough." A continuous slider eliminates this complaint category entirely. The player finds their own Goldilocks zone.

**"The Accessibility Bridge"** — Players with audio processing difficulties (APD, hyperacusis, sensory processing sensitivity) can dial corruption audio to a level that provides information without triggering discomfort. This complements the full accessibility alternatives in 6.10d but serves the wider population of players who don't need accessible modes — just a volume preference.

**"The Expert Instrument"** — At Aggressive, the corruption audio system transforms from a notification system into a diagnostic instrument. The multi-voice spatial audio, lowered trigger thresholds, and expanded frequency range give veteran players genuinely new information that isn't available at Standard — specifically, the ability to locate multiple corruptions by ear simultaneously without cursor-sweeping. This creates skill expression in audio literacy.

**"The Broadcast Solution"** — Per-screen overrides solve the streaming audio mix problem without requiring streamers to sacrifice the corruption experience entirely. The game acknowledges that broadcast is a first-class use case.

**"The Named Presets Save Conversations"** — When players discuss corruption audio in forums, Discord, or Reddit, they have vocabulary: "I play at Whisper," "Try Aggressive for Gauntlet runs." Named presets create community language around a preference that would otherwise be described as "I turned that slider to about 70%."

---

## Weaknesses

**"The Untested Default" Problem** — Most players never change default settings. If Standard is wrong for a significant player segment, they'll simply endure suboptimal audio rather than discover the slider. The quick-access icon in the Plan Phase toolbar mitigates this, but mitigation isn't elimination. The first corruption encounter (Mission 7-8) should include a tooltip: *"Corruption audio too intense? Too subtle? Adjust in Settings > Audio or click the waveform icon."*

**Balancing for Three Targets Simultaneously** — The audio team must mix the corruption vocabulary to sound good at Whisper, Standard, AND Aggressive. This triples the QA surface. A sound that works beautifully at Standard might be inaudible at Whisper or distorted at Aggressive. Each corruption sound needs to be authored, tested, and balanced at three points on the curve, not just one.

**Per-Screen Overrides Add Complexity** — Three sliders instead of one is a non-trivial settings UI expansion. Players who discover per-screen mode might over-optimize, creating configurations that work well for their current mission but poorly for later ones (e.g., muting sealed watch corruption audio and then missing EMP degradation warnings in Mission 10).

**The "I Turned It Down and Missed Something" Blame Vector** — If a player at Whisper misses a critical corruption that costs them a mission, was it the player's fault for choosing Whisper or the game's fault for allowing an information-critical system to be nearly silenced? The design must accept that Whisper players will sometimes miss corruption — and the visual indicators must be robust enough to be the primary detection channel at Whisper.

**Aggressive Spectral Competition** — At 100%, the corruption audio's 60-8000Hz frequency range genuinely competes with the soundtrack. If the base audio is Kulintang (Option A), the agung gongs and kulintang chimes occupy 200-4000Hz — exactly where Aggressive corruption distortion lives. The mix can become muddy. Aggressive players accept this tradeoff (they're prioritizing diagnostic information over aesthetic pleasure), but the game should warn: *"Aggressive intensity may reduce soundtrack clarity during high-corruption scenarios."*

---

## Interaction Effects

### With Accessibility Modes (6.10d)

The intensity slider and accessibility alternatives are complementary, not competing. A deaf/HoH player using visual-only corruption mode (6.10d) has no use for the intensity slider — it's greyed out when visual-only mode is active. A player using haptic-only mode (6.10d) could have an analogous "haptic intensity" slider controlling vibration strength, but this is a separate control, not a repurposing of the audio slider.

The critical interaction: a player with mild hearing loss who doesn't need full accessibility mode but benefits from Aggressive intensity. For this player, Aggressive's expanded frequency range (60-8000Hz) and raised volume levels bring corruption audio into their audible range. The intensity slider is, in practice, a soft accessibility tool — it serves a population between "normal hearing" and "needs visual-only mode."

### With Sealed Watch Immersion (6.10f)

The sealed watch is Robot Uprising's emotional peak — the player watches their architecture execute under pressure. Corruption audio during sealed watch (EMP buffer degradation, mid-combat integrity loss) must serve emotion first and diagnostics second. At Whisper, sealed watch corruption is barely present — a faint dissonance in the battle soundtrack that most players won't consciously register. This preserves immersion. At Aggressive, sealed watch corruption is a competing emotional channel — the alarm cascade fights the battle soundtrack for the player's affect, creating tension that can feel like anxiety rather than drama. The per-screen override exists largely for this interaction: most players will want Standard-or-above for Plan Phase detection, but Whisper-to-Standard for sealed watch immersion.

### With Inspector Analysis

The Inspector provides comprehensive visual corruption data — timelines, integrity graphs, per-tick corruption state overlays. Audio in the Inspector serves a different role than in Plan Phase: it's not detection (you can see everything) but annotation (audio highlights the moments worth focusing on in a long replay). At Aggressive, the Inspector's corruption audio functions as an audio scrub guide — seeking through the replay, the player hears severity spikes as audio landmarks. At Whisper, the Inspector is a quiet analytical workspace. Neither is wrong; they serve different analytical styles.

### With Overall Soundtrack Mix

The base audio direction (Kulintang, Server Room, Synthwave, Adaptive Silence) interacts differently with each intensity level:

- **Kulintang + Whisper:** The sour harmonic is a single dissonant note in a pentatonic melody. Barely noticeable. Beautiful in its subtlety.
- **Kulintang + Aggressive:** The tritone is a wall of dissonance competing with the gong voices. The kulintang becomes a battlefield. Some players find this dramatically appropriate; others find it unpleasant.
- **Adaptive Silence + Whisper:** Almost nothing. The sub-40Hz throb is the only corruption indicator, and at Whisper volumes, most speakers can't reproduce it. This combination risks making corruption inaudible. The game should warn if both Adaptive Silence and Whisper are selected simultaneously.
- **Server Room + Aggressive:** The Geiger clicks blend into the server room's mechanical texture, but at Aggressive volume, they dominate it. The server room sounds sick rather than ambient. Effective but fatiguing.

### With Streaming/Recording Audio Levels

OBS, Streamlabs, and most streaming software capture desktop audio as a single channel. The corruption audio is mixed into this channel at whatever intensity the player has set. At Aggressive, corruption events can trigger audio compression/limiting in the streamer's audio chain, producing audible "pumping" artifacts — the stream audio ducks briefly when an alarm cascade fires, then bounces back. This is why the Streamer Compromise (Patricia's journey) targets 35-45% — enough for atmosphere without triggering compression artifacts. A "Streamer Mode" preset could be added as a fourth named point on the slider, calibrated for broadcast-friendly dynamics.

---

## Comparable Games

**iRacing / ACC — Spotter Verbosity Settings**
Racing simulators let players configure their in-ear spotter from minimal ("car left" only) to verbose (gap times, track position, weather changes, tire wear warnings). The parallel is exact: the spotter provides real-time diagnostic information during a high-attention activity, and different players want different information density. iRacing's approach — named presets (Minimal, Normal, Full) plus per-message-type toggles — is directly applicable. Robot Uprising's three named presets mirror Minimal/Normal/Full, and per-screen overrides serve the same role as per-message-type toggles.

**DCS World / IL-2 — Configurable Warning Systems**
Flight simulators with realistic cockpit warning systems (master caution, fire warning, stall warning, gear warning) let players configure which warnings are audio-active and at what volume. Some players silence the gear warning because they always check visually. Others want every warning at full volume because they fly in VR and can't glance at panels. The "expert player who wants maximum audio diagnostics" (Kai's journey) maps directly to the DCS player who enables every cockpit warning.

**Factorio — Pollution Overlay Opacity**
Factorio's pollution cloud overlay is a visual diagnostic layer that can be adjusted from invisible to fully opaque. Players who are optimizing pollution management crank the opacity; players who find it visually distracting turn it off and rely on the statistics screen. The parallel: the corruption audio is a diagnostic layer with adjustable prominence, and different play contexts call for different levels of that prominence. Factorio proves that diagnostic information layers work best when player-configurable rather than designer-mandated.

**Dead by Daylight — Heartbeat as Proximity Audio**
The killer's heartbeat in Dead by Daylight intensifies as the killer approaches. Players with audio sensitivity or streaming setups frequently request (and use mods for) heartbeat volume control. The lesson: proximity-based diagnostic audio is simultaneously the game's most important feedback channel and its most potentially overwhelming one. Player control over intensity is not a luxury — it's a predictable, legitimate need.

**Escape from Tarkov — Ambient Sound Slider**
Tarkov separates "interface volume" from "game volume," allowing players to reduce menu sounds independently. This is a coarser version of Robot Uprising's per-screen override — the principle (different audio contexts deserve different volume profiles) is identical, but Robot Uprising's implementation is more granular because the corruption audio system is more complex than Tarkov's interface sounds.

---

## Sensory Description: What Each Level Sounds Like

### Whisper — "The Uneasy Silence"

You open the workbench. The kulintang melody plays. If you listen — really listen — there is something in the upper register that doesn't belong. A tone a half-step flat from where it should be, wavering at the edge of perception like a candle flame in a draft. You aren't sure it's real. You check the integrity indicator. 82%. Ah. There it is. You look back at the workbench and now you can hear it — but only because you know it's there. It's a stain on glass, visible only at the right angle. The clicking, the heartbeat, the alarm — none of these exist at Whisper. There is only the music, and the wrongness in the music, and the knowledge that the wrongness means something. When you fix the last corruption, the sour note dissolves. The melody breathes. You didn't hear a fanfare. You heard an absence end.

### Standard — "The Attentive Companion"

You open the workbench. The kulintang plays with a dissonant harmonic that fades in over two seconds — something is wrong, and the sound tells you before you read anything. You move your cursor toward the relay panel. *Tick... tick-tick... tick...* The Geiger clicking finds you, faint but distinct, each click a dry metallic snap panned to your cursor's position. You're close to something. The clicking accelerates as you approach the corrupted hook — from one click per second to five to twelve, the pitch dropping from bright 2kHz to ominous 800Hz. You hover the hook. The clicking becomes a rapid, low buzz, and beneath it, a heartbeat fades in at 90 BPM — steady, elevated, like a resting pulse after a jog. You know the severity: moderate. Not critical. You purge it. The clicking stops. The heartbeat decelerates — thump... thump... thump... — each beat slower than the last, settling into calm before a single clean tone rings out, 440Hz, pure as a tuning fork. The sour harmonic in the ambient lessens by a third. Two more to find. The system is your partner in diagnosis: present, informative, and polite.

### Aggressive — "The War Room"

You open the workbench. The kulintang is barely audible — a tritone oscillating at 2Hz has consumed the lower register, pulsing like a headache, while three distinct streams of Geiger clicking fire from different stereo positions simultaneously. Hard left: rapid high-pitched clicks, 15 per second, sharp digital character — an injected hook somewhere in the scout config. Center: slower, deeper clicks, 800Hz, with distortion tails that smear each click into the next — a corrupted rule in the striker. Hard right: medium-fast clicks at moderate pitch — another corrupted element in the relay. You haven't moved your cursor yet. You already know the topology of corruption by ear alone. The room sounds like a hospital ICU that handles robots — monitors beeping at different rates, each one a patient in distress, and the ambient air itself carrying a low electrical hum that says the building's power grid is strained.

You move to the injected hook. The three click streams shift: the one you're approaching dominates, the others recede to 40% volume. A heartbeat slams in at 140 BPM, arrhythmic — skip-beat, skip-beat — with a 300ms flatline tone between every fourth beat. Critical. The frequency range of the distortion widens: sub-bass rumble you feel in your chest, high-frequency digital shriek at the edge of hearing, and everything in between filled with the modulated noise of a corrupted system screaming for attention.

You purge it. The heartbeat RACES — 160, 170 — the flatline tone stretches to 500ms — then the deceleration cascade hits like adrenaline wearing off: 170 to 120 to 80 to 60, each beat wider, slower, the arrhythmia smoothing, the flatline tones vanishing, until a final strong beat at 60 BPM is followed by a clean tone at maximum volume — 440Hz, no distortion, no noise, a laser of pure sound cutting through the chaos. One third of the ambient tritone disappears. The remaining two click streams are louder now, filling the space left by the purged voice.

When the last corruption falls and the all-clear chord blooms — three sine waves, root-third-fifth, swelling from silence to full volume over 500ms and holding — at Aggressive, this chord is the loudest non-combat sound in the game. It fills the headphone soundstage completely. The tritone is gone. The clicking is gone. The heartbeats are gone. There is only the chord, and the silence before the clean kulintang melody returns, and the unmistakable physical sensation of relief — the audio pressure that has been bearing down on your ears for the last two minutes has lifted, and the music sounds better than it has ever sounded, because you earned the right to hear it clean.
