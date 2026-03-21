# 6.10i — Corruption Audio Adaptation Over Campaign Arc

## The Design Challenge

Missions 1-6 teach the player a clean sonic world. Six missions of kulintang gong melodies, babendil signal pings, dabakan combat hits, agung tick-clock strikes. The player's ear has settled into comfort. Then Mission 7 introduces corruption — and the audio system must grow an entirely new vocabulary across four missions without drowning the one the player already knows.

The core tension: corruption audio vocabulary must be **complete by Mission 10** (13 sounds across 3 layers), but if the game dumps everything at once, the player hears noise instead of language. If it introduces too slowly, the late-campaign climax has no audio headroom — Mission 10 sounds the same as Mission 8. The solution is a graduated curriculum where each mission introduces 2-3 new corruption sounds, framed by boot log diegetic text, building the player's ear the way a language class builds from phonemes to sentences to paragraphs.

This document specifies the exact vocabulary schedule, boot log framing, sensory experience, and interaction effects for each mission in the corruption arc (M7-M10), with player journeys tracking three different listeners through the four-mission progression.

---

## The Vocabulary Schedule

### Mission 7 — "The First Chill" (Perturbation Layer Only)

**New sounds introduced: 3**

| Sound | Layer | Technical Spec | What The Player Learns |
|-------|-------|---------------|----------------------|
| **The Sour Note** | Ambient | Tritone dissonance in kulintang at -24dB, fading in over 2s on workbench load | "Something sounds wrong" — subconscious detection |
| **The Beetle Click** | Interaction | Geiger clicks at 1/2s base rate, 2kHz bright pitch, stereo-panned to cursor | "My cursor can find it" — spatial debugging |
| **The Revert Tone** | Event | 440Hz pure sine, 300ms, on successful revert | "Fixed it" — resolution satisfaction |

**What is withheld:** No heartbeat. No alarm cascades. No whispers. No deep corruption distortion. No spectral static. The player gets the ambient cue, the spatial tool, and the reward — nothing else. One corrupted config field. Integrity at 95%. The corruption is a splinter, not a wound.

**Boot log framing:**
```
> INTEGRITY MONITOR: subsystem online
> calibrating anomaly detection...
> sensitivity: PERTURBATION ONLY
> operator advisory: trust your ears
```

The boot log names the mode — "PERTURBATION ONLY" — giving the player a diegetic frame for why the audio is minimal. It also implies that higher sensitivity modes exist, planting the seed for later missions.

**Sensory description:**

You load the Mission 7 workbench. The kulintang plays its familiar melody — bamboo mallets on bronze gongs, the pentatonic pattern you have heard for six missions. But there is something in it now. A note that does not belong. Not loud — more like a taste at the back of your tongue. A faint sourness in the harmony, a tritone hovering just beneath the melody's surface. You do not consciously notice for three seconds. Then your stomach tightens, a half-second before your eyes find the amber integrity indicator: 95%.

You move your cursor. Over the Scout panel — silence. Over the Relay config — *tick*. A single dry metallic click, bright and clean, like a fingernail on glass. You pause. Move away — silence. Move back — *tick... tick*. You drag slowly toward the patrol radius field. *tick-tick-tick-tick* — the clicking quickens, each tick sharp and precise, panned to follow your cursor like a flashlight beam made of sound. You hover directly over the corrupted field. The clicks become a steady rapid pulse, almost a purr. The field glows amber.

You click REVERT. The clicking stops dead. A pure tone rings out — concert A, clean as a bell, 300ms of absolute clarity cutting through the ambient. The sour note in the kulintang dissolves. The melody is whole again. You exhale.

Three sounds. Three lessons. The ear is open.

---

### Mission 8 — "The Stethoscope" (Add Structural Warnings)

**New sounds introduced: 3**

| Sound | Layer | Technical Spec | What The Player Learns |
|-------|-------|---------------|----------------------|
| **The Heartbeat Fade-In** | Event | Synthesized heartbeat at 60-120 BPM on hover-inspect of corrupted element, severity-mapped | "How bad is it" — severity diagnosis |
| **The Deceleration Cascade** | Event | Heartbeat decelerating from current BPM to 60 over 500ms, then clean tone on revert | "The fix is working" — resolution as process |
| **The Static Spectrum** | Ambient | Spectrally shaped static: low rumble (configs), mid hiss (buffers), high crackle (hooks) | "What kind of corruption" — type identification by ear |

**What is withheld:** No whispers. No deep distortion. No flatline interjections. No alarm cascade. The heartbeat stays below 120 BPM — elevated but not panicked. Two corrupted elements: one config, one buffer. Integrity at 85%.

**Boot log framing:**
```
> INTEGRITY MONITOR: sensitivity upgrade
> structural warning layer: ONLINE
> heartbeat sync: calibrated to operator attention
> new capability: corruption type identification
> [the system is learning to speak to you]
```

The boot log explicitly names "structural warning layer" — matching the audio system's internal vocabulary. The bracketed line is the Predecessor's first emotional intrusion into the corruption audio narrative, hinting that the sounds are not just diagnostic tools but a form of communication.

**Sensory description:**

The workbench loads for Mission 8. The sour note is back — you recognize it instantly now, the tritone dissonance you learned to hear last mission. But there is something else underneath it. A texture in the ambient that was not there before. A faint static, like a radio tuned between stations, but shaped — you can hear a low rumble, almost sub-bass, pulsing beneath the kulintang. And higher up, a thin digital crackle, like cellophane being crumpled inside a tin can.

You sweep. The Beetle Click finds the first corruption quickly — you know this tool now. But when you hover, something new happens. Beneath the rapid clicking, a heartbeat fades in. Not your heartbeat. Slower. Deeper. A synthesized thud-thud at maybe 80 BPM, steady but unmistakably present. The heartbeat is panned to the corrupted element's position on screen — it comes from the left speaker, where the Relay's config panel sits. The corruption is moderate. The heartbeat says: *I am sick, but I am stable.*

You click REVERT. The clicking stops — you expect that. But the heartbeat does not stop. It *decelerates*. Thud... thud... thud... each beat further apart, slowing from 80 to 60 BPM over half a second, the interval stretching like a rubber band relaxing. Then a single final strong beat, a clean tone, and silence. The deceleration is profoundly satisfying — it feels like watching a patient's monitor settle after surgery. Resolution as a process, not an instant.

The low rumble in the ambient disappears. The crackle remains. You have learned to hear corruption types: the rumble was config corruption (low frequency), the crackle is something else (high frequency — hooks, you will learn). Your ear is becoming a diagnostic instrument.

---

### Mission 9 — "The War Room" (Add Hybrid SE Asian Percussion Layers)

**New sounds introduced: 3**

| Sound | Layer | Technical Spec | What The Player Learns |
|-------|-------|---------------|----------------------|
| **The Deep Corruption Distortion** | Interaction | 400Hz clicks with 50ms distortion tail, smearing between clicks at high rate. Chest-resonant. | "This one is dangerous" — enemy-injected hook identification |
| **The Whisper Fragment** | Event | Reversed, pitch-shifted vocal fragments looping every 2s on hovering enemy hooks. Processed through kulintang resonance filter. | "The enemy is inside the wire" — narrative dread |
| **The Signal Jam Snap** | Event | Whisper cut mid-syllable by sharp carrier tone (babendil-derived transient) on purge | "We cut their signal" — aggressive resolution |

**What is withheld:** No flatline interjection. No callsign chime. The alarm cascade is not yet triggered. The heartbeat can now reach 130 BPM with arrhythmia but does not flatline. Three corruptions: one config, one buffer, one enemy-injected hook. Integrity at 72%.

**The hybrid layer:** Mission 9 is where Southeast Asian percussion enters the corruption vocabulary. The Whisper Fragment is processed through a kulintang resonance filter — the enemy's voice is heard *through* the bronze gongs, as if the corruption has infected the instruments themselves. The Signal Jam Snap derives its transient from the babendil (small gong used for signal pings in the clean audio vocabulary) — the player's own communication instrument, repurposed as a weapon against the enemy's audio intrusion. The Deep Corruption Distortion's 400Hz resonance sits in the dabakan (drum) frequency range, creating a false combat signature — the corruption *sounds like fighting*, even in the Plan Phase.

This is the hybrid moment: Filipino percussion instruments (kulintang, babendil, dabakan) are no longer just the soundtrack. They are the corruption detection layer. The game's cultural audio identity and its mechanical audio system merge into a single vocabulary.

**Boot log framing:**
```
> INTEGRITY MONITOR: full spectrum analysis
> WARNING: foreign signal detected in hook layer
> attempting frequency isolation...
> [they are speaking through your instruments]
> hybrid detection layer: ENGAGING
> operator advisory: listen for the voice in the bronze
```

The boot log names what is happening — "they are speaking through your instruments" — and gives the player explicit permission to hear the cultural instruments as corruption detectors. "Listen for the voice in the bronze" is the mission's audio thesis statement.

**Sensory description:**

Mission 9. The workbench loads and the kulintang is wrong. Not just the sour note — you know that sound by now, it is almost familiar, almost comfortable in its discomfort. This is different. The gongs themselves sound different. There is a voice inside them. Not words — not yet — but the resonance of the bronze has acquired a human quality, a shaped breath, a vowel trapped inside the metal's ring. The static spectrum is dense: low rumble, mid hiss, and a sharp high crackle that sounds like something chewing through wire insulation.

You sweep. The Beetle Click finds the config corruption — bright 2kHz ticking, familiar. You revert. Heartbeat decelerates. Clean. The buffer corruption next — the mid-frequency hiss diminishes. Two down.

Then you sweep to the hook layer. The clicking changes. It drops in pitch — 400Hz, deep, resonant in your chest, and each click leaves a smear of distortion that bleeds into the next. At high proximity, the clicks become a continuous growl, like an electrical fault arcing behind a wall. This is new. This is worse than anything you have heard. And underneath the growl, looping every two seconds: a whisper. Not English, not Tagalog — reversed syllables, pitch-shifted down, processed through what sounds like the inside of a bronze gong. A voice speaking through your instruments. The enemy is in the wire.

You right-click. PURGE. The whisper cuts mid-syllable — a sharp snap, derived from the babendil's bright ping but harsher, like a signal being physically severed. The growl stops. The all-clear chord begins to build — but it sounds different this time, richer, the bronze resonance of the kulintang blooming through it as if the instruments are reclaiming their voice. The silence afterward is not just silence. It is the absence of an intruder.

---

### Mission 10 — "The Full Orchestra" (Complete Vocabulary + Alarm Cascades)

**New sounds introduced: 3**

| Sound | Layer | Technical Spec | What The Player Learns |
|-------|-------|---------------|----------------------|
| **The Flatline Interjection** | Event | 300ms of 1kHz sine between heartbeats at critical severity (>3 corruptions, <50% integrity) | "The system is crashing" — critical state recognition |
| **The Alarm Cascade** | Event | IEC 62682-inspired graded alerts: amber ping, orange double-ping, red triple-ping with spatial audio | "Multiple emergencies" — triage under pressure |
| **The Callsign Chime** | Event | Three ascending tones (babendil-derived) after full restoration from multi-type corruption | "Total victory" — the ultimate resolution sound |

**Nothing withheld.** Seven corruptions across all three types. Integrity at 42%. All 13 sounds in the vocabulary active simultaneously. The heartbeat at 160 BPM with flatline interjections. Alarm cascade pinging from three compass directions. Whispers on two hooks. Deep distortion growling. Static spectrum fully saturated. The kulintang melody almost unrecognizable under the weight of dissonance.

This is the final exam. Every sound the player learned across Missions 7-9 fires at once. The player who has been trained across three missions of graduated introduction now faces the full corruption orchestra — and they can hear every instrument in it. The alarm cascade is new, but its spatial audio pinging follows the same Geiger-click proximity logic they learned in Mission 7. The flatline interjection is new, but it slots into the heartbeat vocabulary they learned in Mission 8. The callsign chime is the earned reward — a three-note ascending phrase built from babendil tones that replaces the simpler all-clear chord, signaling that the player has mastered the complete vocabulary.

**Boot log framing:**
```
> INTEGRITY MONITOR: CRITICAL
> corruption density: MAXIMUM
> all detection layers: ACTIVE
> alarm cascade: ARMED
> [you know every sound by now]
> [prove it]
```

The Predecessor's voice is direct, trusting. No tutorial. No advisory. Just: you have been trained. Use everything.

**Sensory description:**

Mission 10. The workbench does not load — it *erupts*. The kulintang melody is buried under a wall of dissonance. The sour note is not a single tritone anymore; it is a chord of wrongness, three dissonant intervals stacked on top of each other, the bronze gongs vibrating with frequencies they were never designed to produce. The static spectrum is fully saturated — low rumble shaking the sub-bass, mid hiss filling the room like pressurized steam, high crackle chattering like a swarm of digital insects. Integrity: 42%.

An alarm pings from the left — amber, single tone, spatial audio placing it at the Scout panel. A second alarm from the right — orange, double-ping, the Relay. A third from center — red, triple-ping, urgent, the Command hook layer. Three compass directions of emergency. The alarm cascade has arrived.

You start sweeping. The Beetle Click is everywhere now — your cursor cannot move without triggering clicking from nearby corruptions. You triage. The nearest alarm first. The clicking deepens as you approach the Scout — 800Hz, moderate severity. The heartbeat fades in at 110 BPM. Steady enough. You revert. Deceleration cascade. One down.

You move to the Relay. The clicking drops to 400Hz — deep corruption distortion, the growl and smear you learned to fear in Mission 9. The heartbeat races: 140 BPM. Arrhythmic. Skip-beat. And between the beats — a flatline interjection. A 300ms tone of pure 1kHz sine, the "patient crashing" sound. This is new, but you understand it instantly because the heartbeat vocabulary taught you its language two missions ago. You purge. Signal jam snap. The whisper dies mid-syllable.

Three more corruptions. The alarm cascade thins. The static spectrum clears band by band — first the low rumble drops out (configs clean), then the mid hiss (buffers clean), then the high crackle (hooks clean). The heartbeat decelerates one final time. The dissonant chord collapses note by note as each corruption falls. The kulintang melody resurfaces — first one gong, then two, then the full pentatonic scale, clear and warm.

The last corruption falls. Silence. One full second of nothing. Then the callsign chime: three ascending babendil tones — bright, crystalline, triumphant — rising in a perfect major triad. Not the simple all-clear chord of earlier missions. This is the earned version. The sound that only plays when you have cleared every corruption type using every tool in the vocabulary. The kulintang resumes in full, the bronze gongs ringing clean and pure, as if they are singing for the first time in the entire mission.

---

## Player Journeys

#### Journey: Priya, 29, Site Reliability Engineer

Priya wears Sony WH-1000XM5 headphones. She is methodical. She played through Missions 1-6 appreciating the audio design as "ambient work music" without actively analyzing it. She runs her workbench like a dashboard.

**Mission 7 (minute 0:00-3:45)**
The workbench loads. Priya notices the integrity indicator first — 95% — and only then registers the ambient shift. "Huh. The music sounds... off." She does not identify the tritone consciously. She reads the boot log: *PERTURBATION ONLY.* She opens each panel manually, visually scanning for amber highlights. At 1:20, she moves her cursor near the corrupted field and hears the first Beetle Click. She pauses. Moves away — silence. Moves back — *tick*. "Oh. That's proximity." She sweeps deliberately, left to right, like checking monitoring dashboards. Finds the corruption at 2:10. Reverts. The clean tone rings. "That's a nice sound." She moves on. Total corruption time: 2 minutes 10 seconds. She has learned: ambient means corruption exists, clicking means cursor is near, clean tone means fixed.

**Mission 8 (minute 0:00-5:30)**
Boot log mentions "structural warning layer." Priya reads it carefully. Two corruptions this time. She sweeps — the clicking finds the first one fast, she is already efficient. But when she hovers, the heartbeat catches her off guard. "Whoa. That's new." She listens to it for 8 seconds before reverting, counting the BPM unconsciously (her SRE background makes her read rhythmic signals as metrics). 80 BPM. "Moderate." She reverts. The deceleration cascade plays. "Oh, it slows down when you fix it. That's clever." She notices the static texture for the first time — a low rumble beneath the first corruption, a crackle beneath the second. "Different sounds for different corruption types?" She opens Settings > Audio > Corruption Intensity to confirm the slider exists. She leaves it at Standard. Total: 4 minutes. She has learned: heartbeat = severity, static frequency = type.

**Mission 9 (minute 0:00-8:20)**
Three corruptions. Priya clears the config and buffer corruption with practiced efficiency — sweep, click, heartbeat check, revert, deceleration, done. Two minutes for two corruptions. Then she reaches the hook. The 400Hz distortion growl stops her. "That's... aggressive." She hovers. The whisper fades in. She pulls her headphones tighter. "Is that a *voice*?" She listens to the full 2-second loop three times, trying to decode it. Reversed syllables. Pitched down. Coming through what sounds like the inside of a gong. "The enemy is literally in the instruments." She purges. The Signal Jam Snap is violent and satisfying — babendil-sharp, cutting the whisper dead. "That felt like hanging up on a spam caller." She grins. The boot log's "listen for the voice in the bronze" line retroactively makes sense. Total: 6 minutes 20 seconds. She has learned: deep distortion = enemy hooks, whispers = foreign presence, purge snap = aggressive resolution.

**Mission 10 (minute 0:00-14:40)**
Seven corruptions. Integrity at 42%. Priya opens the workbench and inhales sharply. The alarm cascade pings from three directions simultaneously. The ambient is a wall of dissonance. The static spectrum is fully saturated. "Okay. Triage." She starts with the red triple-ping alarm — the most urgent. Deep distortion. Heartbeat at 150 with flatline interjections. She purges fast. The alarm stops. She rotates to the next alarm. Orange double-ping. Moderate. Heartbeat at 100. She reverts. Works through each corruption systematically, treating the spatial audio alarms as a queue priority system. At corruption six, she notices the kulintang melody beginning to resurface beneath the thinning dissonance — one gong at a time. She clears the seventh. The callsign chime plays. Three ascending babendil tones. She has never heard this sound before. It is luminous. "That's... the real all-clear." She sits back. Total: 12 minutes 40 seconds. She has heard every sound in the vocabulary and understood each one because the previous three missions built her literacy note by note.

---

#### Journey: Tomás, 16, High School Student and Valorant Player

Tomás plays on laptop speakers. He tends to rush. He half-reads tutorial text. His audio attention is calibrated for directional shooter cues — footsteps, gunshots, ability pops.

**Mission 7 (minute 0:00-2:00)**
Tomás does not notice the sour note. Laptop speakers at 40% volume, in a room with a fan running. He sees the 95% integrity indicator, scans visually, finds the amber field. When he moves his cursor near it, the Beetle Click is faint but the stereo pan catches his attention — his Valorant-trained ears track spatial audio instinctively. "Wait, was that the game?" He wiggles the cursor. The clicking responds. "Oh, it's like a metal detector." He sweeps quickly, finds the corruption, reverts. The clean tone plays. He barely registers it. Total: 1 minute 15 seconds. He has learned clicking = proximity. He missed the ambient layer entirely.

**Mission 8 (minute 0:00-4:15)**
Two corruptions. Tomás sweeps fast. Finds the first, hovers. The heartbeat surprises him. He has never heard a game mechanic use a heartbeat outside of horror. "Am I dying?" He checks his health — no health bar. He reverts. The deceleration cascade plays. "Oh, the heartbeat was about the *corruption*, not me." He finds the second corruption. The heartbeat is faster this time — 110 BPM. "Faster means worse. Got it." He reverts both. He does not notice the static spectrum at all. Total: 3 minutes 15 seconds. He has learned heartbeat = severity. He still has not heard the ambient layer or the static types.

**Mission 9 (minute 0:00-7:50)**
Tomás hits the enemy hook. The 400Hz distortion growl vibrates his laptop chassis. "*That* I can hear." He hovers. The whisper plays. He recoils from the screen. "YO. Is that a voice?" He calls his friend on Discord: "Dude, there's a GHOST in my game." He listens to the whisper loop twice, then purges. The Signal Jam Snap is percussive and loud — Tomás fist-pumps. "Get JAMMED." This is the moment the corruption audio system wins Tomás over. The whisper-to-snap sequence has the same emotional arc as a clutch play in a shooter: tension, release, adrenaline. He will remember this sound. Total: 5 minutes 50 seconds. He has learned the whisper-distortion-purge-snap loop by feel, not analysis.

**Mission 10 (minute 0:00-18:30)**
Seven corruptions overwhelm Tomás initially. The alarm cascade pings from three speakers — he spins his laptop, trying to localize them. "This is insane." He panics for 30 seconds, clicking randomly. Then the spatial audio training from Valorant kicks in. He realizes the pings are positional. Left = Scout panel. Right = Relay. Center = hooks. He starts with the loudest alarm. The heartbeat flatlines. He has never heard this sound. "Is it DEAD?" He purges fast. The flatline stops. He works through the corruptions, using the clicking and alarm spatial cues as a targeting system. At the final fix, the callsign chime plays. Three notes. Bright. Ascending. He does not know what a babendil is, but the sound makes his chest expand. "That was the hardest thing I've done in any game." Total: 16 minutes 30 seconds. Two minutes of panic, fourteen of focused triage.

---

#### Journey: Dr. Lien, 44, Audiologist and Music Hobbyist, Ho Chi Minh City

Dr. Lien has professional-grade monitoring headphones (Sennheiser HD 600). She listens to everything. She identified the kulintang's pentatonic scale in Mission 1. She set Corruption Intensity to Aggressive in the settings menu before Mission 7 began.

**Mission 7 (minute 0:00-4:30)**
The sour note hits her before the screen finishes loading. "Tritone. In a pentatonic context, that's extraordinary — pentatonic scales specifically avoid tritones." She opens her notebook. She sweeps slowly, not to find the corruption — she sees it immediately — but to map the Beetle Click's spatial response curve. "Approximately inverse-square distance scaling. Dry transient, 15ms, no reverb. 2kHz — bright, high-shelf presence. Designed to cut through any ambient." She reverts, but pauses before clicking, listening to the clicking at maximum rate. "Beautiful Geiger-counter implementation. Real Geiger counters randomize the interval — this one is periodic, which makes it more gameable but less naturalistic." She reverts. The clean tone plays. "Concert A. Classic." She sits for 30 seconds after the fix, listening to the ambient settle. "The tritone resolution is smooth — a 2-second fade, not a hard cut. The melody heals." Total: 4 minutes 30 seconds — twice as long as needed, because she is studying.

**Mission 8 (minute 0:00-7:00)**
The heartbeat entrances her. "Synthesized but with enough harmonic complexity to feel organic. Not a pure sine sub — there's a second harmonic at the octave, maybe 3dB down." She counts: 85 BPM. She hovers the second corruption. 110 BPM. "Linear scaling with severity, or stepped?" She experiments, moving between the two corrupted elements, comparing heartbeat rates. The deceleration cascade earns a slow nod. "Physiologically correct deceleration curve. Not linear — logarithmic. The early beats slow quickly, the last few beats stretch. Exactly how a real heart decelerates post-tachycardia." She notices the static spectrum immediately. "Three spectral bands — low for configs, mid for buffers, high for hooks. Type identification through frequency alone. Brilliant. An audiologist could clear corruption with their eyes closed." She considers trying this. Total: 6 minutes. She has mapped every parameter.

**Mission 9 (minute 0:00-9:15)**
The whisper stops her cold. She has encountered processed vocal audio in clinical settings — patients with auditory hallucinations describe sounds like this. "Reversed speech, pitch-shifted down approximately a major third, processed through a resonant bandpass that matches bronze gong formants. The enemy's voice is being filtered through the kulintang's body." She recognizes the cultural integration immediately. "This is not just corruption audio — this is the Southeast Asian percussion identity of the game being weaponized by the narrative. The instruments are compromised." The Signal Jam Snap makes her laugh. "A babendil transient. The player's own signal instrument, used to cut the enemy's voice. The metaphor is flawless." She purges each hook slowly, listening to the snap-silence transition. "The 100ms silence gap after the snap — that is the moment the instrument reclaims itself. Psychoacoustically, the gap makes the silence louder than any sound." Total: 8 minutes 15 seconds.

**Mission 10 (minute 0:00-22:00)**
On Aggressive intensity with seven corruptions, Dr. Lien's headphones are delivering a dense, layered soundscape. She does not triage — she listens. For the first full minute, she sits with the alarm cascade, the saturated static, the racing heartbeat with flatline interjections, the whispers on two hooks, the distortion growl, the kulintang buried under dissonance. "This is a twelve-voice corruption choir. Ambient dissonance, three alarm spatial pings, two whisper loops offset by 800ms, two distortion interaction sources, heartbeat with flatline, three-band static. Twelve simultaneous audio sources. And I can hear every one." She begins clearing, slowly, savoring each resolution. Each corruption removed strips one voice from the choir. She tracks the kulintang's resurgence — one gong reentering at each fix. At the seventh fix, the callsign chime plays. She removes her headphones. Sets them down. "Three ascending babendil tones in a major triad. The same instrument the Signal Jam Snap uses for aggression, repurposed for celebration. The instrument's arc across one mission — from weapon to herald. That is audio design." Total: 20 minutes. She replays the mission three times.

---

## Strengths

- **Graduated literacy.** Each mission teaches exactly 2-3 new sounds, avoiding the cognitive overload that plagues front-loaded audio tutorials. By Mission 10, the player has internalized 13 sounds across 4 missions — roughly the same pace as the vocabulary density curve (5.04b) recommends for mechanical concepts.

- **Boot log as audio teacher.** The boot log framing gives each mission's new sounds a diegetic name and context before the player hears them. "PERTURBATION ONLY" in M7, "structural warning layer" in M8, "listen for the voice in the bronze" in M9, "you know every sound by now" in M10. The boot log vocabulary tracks the audio vocabulary — the player reads about what they are about to hear.

- **Cultural integration crescendo.** The hybrid SE Asian percussion layers arrive in M9, not M7 — because the player needs clean-system familiarity with kulintang, babendil, and dabakan before the game can weaponize those instruments for corruption detection. The cultural audio identity earns its corruption role through six missions of positive association.

- **Emotional pacing matches difficulty curve.** M7 is quiet and curious. M8 is diagnostic and empowering. M9 is threatening and aggressive. M10 is overwhelming and triumphant. The emotional arc of the audio matches the narrative arc of the campaign's second half.

- **Multiple learning styles served.** Priya (analytical) maps parameters. Tomás (visceral) responds to spatial cues and dramatic moments. Dr. Lien (expert) deconstructs the implementation. All three are literate by M10, each through a different pathway.

## Weaknesses

- **M7 ambient-only is too subtle for laptop speakers.** The Sour Note at -24dB is barely perceptible on low-quality audio hardware. Players like Tomás may not learn the ambient cue at all, arriving at M8 without the foundation that ambient-first introduction was supposed to build. Mitigation: the Beetle Click at M7 provides a backup spatial cue that works on any speakers.

- **Three-mission training window is narrow.** If a player struggles with M7 or M8 and replays multiple times, they may over-learn early sounds before encountering later ones. The vocabulary schedule assumes linear progression — replays could create an uneven literacy distribution where the player is expert at clicking but unfamiliar with whispers.

- **M9's three new sounds include the most complex one (whisper).** The whisper fragment is the most psychologically loaded sound in the vocabulary. Introducing it alongside two other new sounds risks the whisper overwhelming the distortion and snap in the player's attention. The whisper may become "the Mission 9 sound" and the distortion may be forgotten.

- **Intensity config (6.10e) can undercut the curriculum.** A player on Whisper intensity will only hear the ambient layer through M7-M8, missing the interaction and event layers entirely. The graduated curriculum assumes Standard intensity. At Whisper, the player arrives at M10 having heard only ambient sounds for three missions — the alarm cascade and full vocabulary will be incomprehensible.

---

## Interaction Effects

### With Sealed Watch (6.10f)

The campaign arc curriculum operates exclusively in the **Plan Phase** — the workbench. Sealed watch corruption audio (EMP buffer degradation, hook chain failures, context overload stun) is a parallel vocabulary introduced through gameplay, not curriculum. The interaction is complementary: Plan Phase teaches diagnostic listening (find and fix), Sealed Watch teaches prognostic listening (hear damage happening in real time). M7 Plan Phase introduces the Beetle Click; M7 Sealed Watch introduces the Erosion bitcrusher. The player builds two corruption audio lexicons in parallel — one for the workbench, one for the battlefield.

### With Intensity Config (6.10e)

The Corruption Intensity slider is orthogonal to the campaign arc — it controls volume, layer activation thresholds, and simultaneous voice count, not vocabulary availability. A player on Aggressive at M7 still only hears the three M7 sounds — but louder and more responsive. The curriculum controls *which* sounds exist. The intensity slider controls *how prominent* they are. However, the Whisper setting effectively collapses M7 and M8 into ambient-only experiences, delaying the interaction layer until the player increases intensity or until M9 forces structural warnings regardless of setting. Recommendation: at M8, the boot log should include a diegetic prompt — "structural warnings available at higher sensitivity" — nudging Whisper-mode players to increase their slider.

### With Boot Log

The boot log serves as the curriculum's textbook. Each mission's boot log names the new audio capability before the player encounters it, creating an expectation that sharpens perception. The boot log's voice shifts across the arc: M7 is clinical and systems-oriented ("PERTURBATION ONLY"), M8 introduces the Predecessor's bracketed emotional commentary ("[the system is learning to speak to you]"), M9 is urgent and directive ("listen for the voice in the bronze"), M10 is spare and trusting ("[prove it]"). The boot log's own arc mirrors the audio arc — from minimal to full.

### With Mission Difficulty Curve

The corruption audio curriculum is deliberately staggered one mission *behind* the corruption difficulty curve. M7 introduces corruption as a mechanic; the audio trains the ear on a single corruption instance. M8 increases corruption count; the audio adds severity communication. M9 introduces enemy hooks; the audio adds the whisper and distortion vocabulary to identify them. M10 cranks everything to maximum; the audio deploys every tool. The player always has the audio vocabulary for the *previous* mission's difficulty level, ensuring they are never overwhelmed by new sounds AND new challenges simultaneously.

---

## Comparable Games

**Journey (thatgamecompany, 2012) — Evolving Soundtrack as Emotional Curriculum.** Journey's Austin Wintory score grows from solo cello to full orchestra across the game's arc, each area adding instrumental voices. The parallel to Robot Uprising's corruption arc is structural: both games use graduated sonic complexity as an emotional narrative device. The difference: Journey's music is non-interactive — the player cannot influence which instruments play. Robot Uprising's corruption audio is diagnostic — the player's actions determine what sounds, and mastering the sounds improves gameplay performance.

**Celeste (Matt Thorson, 2018) — Adaptive Music as Difficulty Mirror.** Celeste's B-side and C-side levels remix the chapter's music with increasing complexity and dissonance, mirroring the mechanical difficulty. The corruption audio arc does the same — M7's minimal ambient mirrors a gentle corruption introduction, M10's full orchestra mirrors maximum corruption density. Celeste's innovation is making the music's complexity a *comfort signal* (harder music = you are in the hard content, which means you chose to be here). Robot Uprising's innovation is making the audio complexity a *literacy signal* — you hear more because you can understand more.

**Hades (Supergiant, 2020) — Voice Line Unlocking as Progressive Narrative.** Hades releases new character voice lines over dozens of runs, creating a narrative that unfolds through repetition. The corruption audio curriculum follows the same principle — new sounds unlock per mission, creating an audio narrative that grows richer with progression. The key difference: Hades' voice lines are random within eligibility windows; Robot Uprising's corruption sounds are deterministic and curricularly ordered. The player cannot hear the whisper before M9, period.

---

## The Vocabulary Evolution Summary

| Mission | Sounds Available | Total in Vocabulary | Emotional Register | Boot Log Tone |
|---------|-----------------|--------------------|--------------------|--------------|
| 1-6 | 0 (clean system only) | 0 | Comfort, familiarity | N/A |
| 7 | Sour Note, Beetle Click, Revert Tone | 3 | Curiosity, mild unease | Clinical, systems |
| 8 | + Heartbeat, Deceleration, Static Spectrum | 6 | Empowerment, diagnostic confidence | Emotional intrusion |
| 9 | + Deep Distortion, Whisper, Signal Jam Snap | 9 | Threat, aggression, cultural fusion | Urgent, directive |
| 10 | + Flatline, Alarm Cascade, Callsign Chime | 12 | Overwhelm resolving into triumph | Spare, trusting |

Thirteen sounds. Four missions. Three per mission. Each building on the last. By Mission 10, the player does not just hear corruption — they read it, diagnose it, and resolve it by ear. The audio system has become a language, and the campaign arc is the grammar course.