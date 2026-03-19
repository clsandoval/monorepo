# 6.10a — Corruption Audio Learning Curve Design

## The Design Challenge

The player has spent Missions 1-6 building a sonic vocabulary of a *clean* system: tick-clock agung strikes, babendil signal pings, dabakan combat hits, kulintang ambient melodies, servo whirs, channel chirps. This is the "home sound" — six missions of auditory comfort food. Then Mission 7 arrives, and the corruption audio vocabulary needs to enter without destroying what the player has learned.

The challenge is a classic onboarding problem applied to audio: how do you teach a new sonic language *inside* an existing sonic language without overwhelming, without creating false associations, and without the player ever needing to read "here is what corruption sounds like"? The audio must teach itself through interaction, the way the Geiger clicking in 6.10 teaches spatial debugging through cursor movement alone.

Three constraints define the problem:

1. **The Innoculation Principle.** The first corruption encounter must be mild enough that the player *notices* the new sounds without panic, yet threatening enough that they understand these sounds mean danger. A single corrupted rule — not seven. A whisper, not a scream.
2. **The Vocabulary Budget.** The hybrid corruption audio vocabulary (6.10c, "The Clinic" recommended hybrid) has three simultaneous layers: ambient dissonance (Wrongness Chord), interaction clicking (Geiger Counter), and event heartbeat (Heartbeat Monitor). Introducing all three simultaneously in Mission 7 violates everything the onboarding analysis (Wave 5) established about progressive disclosure.
3. **The Second-Half Pacing Problem.** Missions 7-10 represent only 40% of the campaign, but must introduce *all* corruption audio vocabulary, scale it to maximum intensity, and deliver the Mission 10 climax where every layer fires simultaneously. The ramp must be steep enough to reach full vocabulary by Mission 9, leaving Mission 10 free to deploy everything the player has learned.

This analysis explores five pacing models for introducing corruption audio across the campaign's second half, with detailed player journeys for each.

---

## The Corruption Sound Inventory

Before exploring pacing, here is the complete set of corruption sounds that must be introduced (drawn from the 6.10 and 6.10c analyses):

| Sound | Layer | First Possible Mission | Description |
|-------|-------|----------------------|-------------|
| **The Sour Note** | Ambient | 7 | Tritone dissonance in the kulintang melody. The "something is off" subconscious cue. |
| **The Beetle Click** | Interaction | 7 | Geiger-counter clicking at low rate (~1/2s) when cursor is far from corruption. Dry metallic tick. |
| **The Proximity Buzz** | Interaction | 7 | Clicking accelerating to 8-20+ clicks/sec on direct hover. Pitch drops with severity (2kHz → 800Hz → 400Hz). |
| **The Heartbeat Fade-In** | Event | 8 | Synthesized heartbeat at 60-160 BPM on inspecting a corrupted element. Arrhythmia at high severity. |
| **The Revert Tone** | Event | 7 | 440Hz pure sine, 300ms. The "all clear for this element" signal. |
| **The Deceleration Cascade** | Event | 8 | Heartbeat decelerating from elevated BPM to 60 BPM over 500ms before final clean tone. Resolution as process, not instant. |
| **The All-Clear Chord** | Event | 7 | 1s silence → major triad swell → 1s hold → fade. Full integrity restored. |
| **The Flatline Interjection** | Event | 9 | 300ms of 1kHz sine between heartbeats at critical severity (>3 corruptions, <50% integrity). "Patient crashing." |
| **The Deep Corruption Distortion** | Interaction | 9 | 400Hz clicks with 50ms distortion tail that smears between clicks. Enemy-injected hooks. Chest-resonant. |
| **The Whisper Fragment** | Event | 9-10 | Reversed, pitch-shifted vocal fragments looping every 2s on hovering enemy-injected hooks. The ghost in the wire. |
| **The Static Spectrum** | Ambient | 8 | Spectrally shaped static: low-frequency rumble (configs), mid-frequency AM hiss (buffers), high-frequency digital crackle (hooks). Type identification by ear alone. |
| **The Signal Jam Snap** | Event | 9 | Whisper cut mid-syllable by carrier tone on purging enemy hooks. "We jammed their signal." |
| **The Callsign Chime** | Event | 10 | Three ascending tones — radio station callsign — after full restoration with all corruption types present. Replaces the simpler all-clear chord when the full vocabulary is deployed. |

Thirteen sounds total. Introducing one per mission from Mission 7 through Mission 10 means roughly 3-4 new sounds per mission — manageable if properly scaffolded.

---

## Option A: "The Single Symptom" — One Layer Per Mission

### How It Works

Each mission introduces exactly one corruption audio layer:

- **Mission 7:** Ambient layer only (The Sour Note). No interaction sounds. No event sounds. The player opens the workbench and something sounds *wrong* — the kulintang has a note that doesn't belong — but their cursor doesn't interact with it. They must find corruption visually (amber highlights, integrity indicator) while their subconscious registers the ambient shift. The Revert Tone and All-Clear Chord play on resolution, establishing the "fixed it" sound.
- **Mission 8:** Ambient + Interaction layer (add Beetle Click, Proximity Buzz). Now the cursor talks back. The Sour Note is already familiar — the player's attention is free to notice the new clicking when they move their mouse. The progression from "I know something is wrong" (ambient, learned Mission 7) to "now I can hunt it" (interaction, new Mission 8) feels like gaining a superpower.
- **Mission 9:** Ambient + Interaction + Event layer (add Heartbeat, Deceleration Cascade, Deep Corruption Distortion, Whisper Fragment, Signal Jam Snap). The full diagnostic suite. The ambient tells them it is wrong, the clicking tells them where, and now the heartbeat tells them how bad. Enemy hooks introduce the whisper — the creepiest sound in the vocabulary — at the same moment the player has enough audio literacy to handle it.
- **Mission 10:** Full vocabulary at maximum intensity (add Flatline, Static Spectrum, Callsign Chime). Seven corruptions. All three spectral bands of static. The heartbeat racing to 160 BPM with flatline interjections. The whisper on multiple hooks simultaneously. Everything the player has learned, deployed at once.

### Strengths

- Maximum clarity. Each mission teaches exactly one audio concept. Zero overload risk.
- The "gaining powers" feeling: Mission 7 is blindfolded, Mission 8 gives you sonar, Mission 9 gives you a stethoscope, Mission 10 gives you the full medical suite.
- Mirrors the campaign's locked progressive disclosure pattern (see 5.16d Terminal disclosure).

### Weaknesses

- Mission 7 with ambient-only corruption audio is *too* subtle. Many players will not notice the Sour Note, especially on laptop speakers. The corruption detection will be entirely visual, which defeats the purpose of audio cueing.
- The Mission 9 dump is heavy: five new sounds in one mission. After the gentle pace of one-layer-per-mission, suddenly five new audio elements violates the pacing contract.
- The Sour Note ambient layer requires the player to have deeply internalized the clean kulintang melody — possible after six missions, but not guaranteed for players who don't attend to background music.

---

## Option B: "The Inoculation Shot" — Controlled First Exposure, Then Escalation

### How It Works

Mission 7 introduces a *minimal but complete* corruption audio experience — all three layers present, but each at its mildest possible intensity. The player gets one corrupted element (a single modified rule), and experiences:

- **Ambient:** The faintest Sour Note (tritone at -30dB — barely perceptible).
- **Interaction:** The Beetle Click at minimum rate (1 click per 3 seconds, easily missable).
- **Event:** The Heartbeat at 60 BPM (calm, steady, "this is manageable") for 5 seconds on hover, then the Revert Tone and All-Clear Chord on resolution.

One corruption. Three sounds. All quiet. The boot log for Mission 7 includes a diegetic line: *"INTEGRITY MONITORING: subsystem online. Anomaly detection calibrated."* — a narrative heads-up that the audio layer has changed, without explaining what to listen for.

Then escalation:

- **Mission 8:** Two corruptions. The Sour Note is louder (noticeable). The clicking is faster (2-3/sec baseline). The heartbeat is at 90 BPM (elevated). The Deceleration Cascade plays for the first time on resolution. One corruption is a config (familiar), one is a degraded buffer (new — introduces mid-frequency static in the ambient layer alongside the Sour Note).
- **Mission 9:** Three-four corruptions including the first enemy-injected hook. Deep Corruption Distortion (400Hz with distortion tail). The Whisper Fragment on hook hover. The Signal Jam Snap on purge. The heartbeat hits 120+ BPM with arrhythmia. The ambient has two spectral bands of static layered on the Sour Note.
- **Mission 10:** Five-seven corruptions. All three spectral bands. Flatline interjections. Multiple whispers. The Callsign Chime on full restoration. Maximum everything.

### Strengths

- "The Inoculation Shot" name captures the design intent: a small, controlled exposure to build immunity before the full disease arrives. This is how vaccines work and how good tutorials work.
- The player's first corruption encounter is *complete* — they experience the full detection→location→severity→resolution chain in miniature. They build the right mental model from the start.
- Each subsequent mission adds *intensity*, not *new concepts*. The player never has to learn a fundamentally new interaction pattern — just recognize the familiar pattern at higher energy levels.
- The boot log line is light-touch foreshadowing, not a tutorial wall.

### Weaknesses

- Three simultaneous new sounds in Mission 7, even at low intensity, is a risk for sensory-overloaded players coming off the Mission 5-6 factory introduction.
- The "all layers at once but quiet" approach assumes players can detect the difference between "this is new" and "this is just the game." The Beetle Click at 1/3s might be attributed to the server room ambient or misidentified as a UI interaction sound.
- The Deceleration Cascade in Mission 8 is a resolution sound before the player has experienced high-severity corruption. They hear a heartbeat slow down from 90 to 60 — but they've never heard it at 120, so the deceleration lacks contrast.

---

## Option C: "The Broken Record" — Ambient-First With a Dramatic Reveal

### How It Works

Mission 7 begins with *no corruption*. The player opens the workbench, hears the clean kulintang, configures their units, and presses EXECUTE. The sealed watch plays normally. But in the **Inspector debrief**, one of their units made an inexplicable decision — a scout ignored a visible enemy. The decision trace shows a corrupted rule that *wasn't visible during the Plan phase*. The boot log for the mission's replay (if the player retries) now includes: *"WARNING: Configuration integrity cannot be verified. Manual inspection recommended."*

On the second attempt (or the next mission if the player succeeded despite the sabotage), the workbench opens with the Sour Note audible from the first second. The player, who just experienced the consequence of undetected corruption, is *primed* to hear it. The audio cue lands with maximum impact because the player has a reason to listen.

The corruption becomes visible (amber highlights appear after a 3-second delay — the audio cue arrives first). The Beetle Click starts when the player moves their cursor. The Revert Tone plays on fix. The full interaction sequence unfolds naturally because the player is *motivated* by their recent loss.

Missions 8-10 follow Option B's escalation pattern.

### Strengths

- The "consequence before detection" structure creates the strongest possible motivation to learn the audio vocabulary. The player doesn't just hear corruption — they've *felt* what undetected corruption does to their carefully designed system.
- The 3-second delay between audio cue and visual reveal teaches the primacy of audio detection. The player who hears the Sour Note and starts investigating before the amber highlights appear has learned the deepest lesson: your ears are faster than your eyes.
- Maximum dramatic impact. The first corruption encounter is a story, not a tutorial.

### Weaknesses

- The "invisible corruption that causes a loss" in Mission 7 could feel *unfair*. The player had no way to know their config was sabotaged. If the loss costs 5-10 minutes of replay, the teaching moment becomes a frustration moment.
- Players who succeed despite the corruption never get the "consequence" beat. Their first corruption encounter on retry/next mission lacks the emotional priming.
- The 3-second visual delay on subsequent encounters requires careful calibration — too long and the player feels the game is hiding information; too short and the audio-before-visual lesson is lost.
- Contradicts the locked "invisible randomization" design which already provides failure variation. Adding invisible corruption as a *designed* failure source is a different kind of unfairness.

---

## Option D: "The Graduated Stethoscope" — Teach Detection Tool By Tool

### How It Works

Each corruption sound is introduced as a *named tool* in the Blueprint Codex, with a 3-second audio preview. The boot log announces each new tool diegetically:

- **Mission 7 boot log:** *"SUBSYSTEM BOOT: Integrity Monitoring v0.1. Ambient anomaly detection: ONLINE. [The Sour Note plays for 2 seconds, then resolves to clean.] Manual sweep capability: ONLINE. [Three Beetle Clicks play, accelerating, then silence.] Resolution protocol: CALIBRATED. [The Revert Tone plays.] Operator advisory: inspect all configurations before deployment."*
- **Mission 8 boot log:** *"SUBSYSTEM UPDATE: Integrity Monitoring v0.2. Severity assessment: ONLINE. [The Heartbeat plays at 60 BPM for 3 seconds, then at 120 BPM for 2 seconds.] Spectral classification: ONLINE. [Low-frequency rumble plays for 1 second, then mid-frequency hiss for 1 second.] Expanded threat detection operational."*
- **Mission 9 boot log:** *"SUBSYSTEM UPDATE: Integrity Monitoring v0.3. Foreign agent detection: ONLINE. [The Whisper Fragment plays for 3 seconds. The Deep Corruption Distortion clicks play.] Countermeasure protocol: ARMED. [The Signal Jam Snap plays.] WARNING: Hostile intelligence signatures detected in local network."*
- **Mission 10 boot log:** *"SUBSYSTEM UPDATE: Integrity Monitoring v1.0. ALL SYSTEMS NOMINAL. [Silence for 2 seconds.] ... [The Sour Note fades in. The static rises. The heartbeat starts.] CORRECTION: INTEGRITY COMPROMISED. Full diagnostic suite engaged."*

After each boot log introduction, the player enters the workbench and encounters the sounds they just previewed. The boot log served as a listening guide — "you will hear X, and it means Y" — delivered in the AI's self-documenting voice.

### Strengths

- Maximum audio literacy. The player hears each sound in isolation (boot log preview) before encountering it in context (workbench). The boot log is a sonic reference card.
- Diegetically consistent with the locked boot log narrative. The AI is upgrading its own diagnostic subsystems — this IS the story of Missions 7-10.
- The Blueprint Codex entries give players a permanent reference. "What was that clicking sound?" → open Codex → "Integrity Sweep: Geiger-style proximity detection. Faster clicking = closer to anomaly."
- Mission 10's bait-and-switch ("ALL SYSTEMS NOMINAL" → "CORRECTION: INTEGRITY COMPROMISED") is the best single audio moment in the campaign — the false all-clear followed by the full corruption suite is a gut punch.

### Weaknesses

- Boot log previews are *explicit teaching*, which is less elegant than learning-by-doing. The "I figured it out myself" feeling is stronger in Options A-C.
- Audio previews in the boot log require the boot log to be voiced or at least to have audio accompaniment, which may not be locked.
- The Codex entries add content burden — each corruption sound needs a written description, an audio preview button, and a visual example.
- Players who skip boot logs (and some will) miss the entire scaffolding.

---

## Option E: "The Whisper Curriculum" — RECOMMENDED

### How It Works

A hybrid of B (inoculation) and D (graduated stethoscope) with one key addition: **the Predecessor's voice** (see `aesthetics/predecessor-character-arc.md`) delivers the first corruption audio lesson as a character moment, not a system announcement.

**Mission 7 — "The First Whisper"**

The boot log runs as normal. At the end, a new voice enters — not the clinical AI, but the Predecessor (the echo of a previous operator). The Predecessor's line is brief, emotional, and audio-demonstrative:

*"Listen. [2-second silence.] Hear that? [The Sour Note fades in — the tritone dissonance.] That's not yours. That was never yours. Find it. Fix it. Don't deploy until it's clean."*

The player enters the workbench with one corruption. The Sour Note is already audible (they just heard it named). The Beetle Click activates on cursor movement — not previewed, just present. The player discovers it through interaction. The Revert Tone plays on fix. The All-Clear Chord plays on full restoration. Three new sounds total: one named by the Predecessor, two discovered by playing.

**Mission 8 — "The Stethoscope"**

Boot log upgrade: *"INTEGRITY MONITORING v0.2: Severity assessment online."* No Predecessor line. Two corruptions — one config, one degraded buffer. The Heartbeat enters on hover. The Deceleration Cascade plays on resolution. The Static Spectrum adds its mid-frequency hiss to the ambient. Four sounds total from Mission 7 (Sour Note, Beetle Click, Revert Tone, All-Clear Chord) are now familiar. Two new sounds (Heartbeat, Deceleration) are introduced. The Static is subtle but learnable.

**Mission 9 — "The Ghost in the Wire"**

Boot log upgrade: *"INTEGRITY MONITORING v0.3: Foreign agent detection armed."* The Predecessor returns with a second line — shorter, darker:

*"If you hear a voice that isn't yours or mine — cut it. Don't listen. Cut it."*

Three-four corruptions including the first enemy-injected hook. The Deep Corruption Distortion clicks (400Hz, distortion tail) mark the hook's location. On direct hover, the Whisper Fragment emerges. The Signal Jam Snap fires on purge. The Predecessor's warning gives the whisper emotional weight — the player knows to be afraid of it before they hear it. Three new sounds (Distortion, Whisper, Snap), two familiar layers (ambient + interaction), one familiar resolution pattern.

**Mission 10 — "Full Diagnostic"**

No Predecessor. The boot log begins with the Mission 10 bait-and-switch from Option D: *"ALL SYSTEMS NOMINAL. ... CORRECTION: INTEGRITY COMPROMISED."* Five-seven corruptions. All spectral bands. Flatline interjections at critical severity. Multiple whispers. The Callsign Chime on full restoration replaces the simpler All-Clear Chord. The player deploys every audio skill they have learned. This is the final exam.

### The Pacing Table

| Mission | New Sounds | Total Active Sounds | Corruption Count | Highest Severity | Predecessor Line |
|---------|-----------|-------------------|-----------------|-----------------|-----------------|
| 7 | Sour Note, Beetle Click, Revert Tone, All-Clear Chord | 4 | 1 | Mild (single field) | Yes — names the Sour Note |
| 8 | Heartbeat, Deceleration Cascade, Static Spectrum | 7 | 2 | Moderate (config + buffer) | No |
| 9 | Deep Distortion, Whisper Fragment, Signal Jam Snap | 10 | 3-4 | Severe (enemy hook) | Yes — warns about the whisper |
| 10 | Flatline, Callsign Chime | 12 | 5-7 | Critical (full compromise) | No — the AI is alone |

### Why This Works

The Predecessor's two appearances bracket the corruption curriculum. The first line (*"Hear that?"*) teaches the player to *listen*. The second line (*"If you hear a voice"*) teaches the player to *fear*. The Predecessor doesn't explain the Geiger clicking or the heartbeat — those are discovered through play. The Predecessor only names the sounds that carry emotional weight: the wrongness and the enemy voice. This division — character teaches emotion, system teaches mechanics — is the same pattern that makes the boot log work for the rest of the campaign.

The even-odd rhythm (Predecessor on 7 and 9, system-only on 8 and 10) prevents narrative fatigue while ensuring the two hardest audio moments (first corruption, first enemy hook) have emotional scaffolding.

---

## Player Journeys

### Journey: Sofia, 15, Manila, First Strategy Game

**Context:** Mission 7. Sofia completed Missions 1-6 over two evenings. She is comfortable with the Plan-Execute-Inspect loop. She wears over-ear headphones her brother left behind. She has never encountered corruption.

**Minute 0:00 — The Boot Log Speaks**
The Mission 7 boot log runs. Sofia reads the text as it scrolls — she always reads the boot log, it makes her feel like a hacker. Then a new voice enters. Not the clinical system voice. Softer, warmer, with a slight urgency: *"Listen."*

Two seconds of silence. Sofia's eyes widen. She is listening.

*"Hear that?"*

And she does — a note beneath the kulintang melody that does not belong. A tritone. Not loud. Not alarming. But *wrong*, like a single off-key string in a guitar chord. The note hangs for two seconds.

*"That's not yours. That was never yours. Find it. Fix it. Don't deploy until it's clean."*

The boot log ends. The workbench opens.

**Minute 0:20 — The Sour Note**
The kulintang plays. The Sour Note is there — the same tritone the Predecessor pointed out. Sofia's eyes go to the integrity indicator: **INTEGRITY: 94% — 1 anomaly detected.** She has never seen this indicator display anything but 100%.

She moves her cursor toward the SCOUT-1 config panel. Beneath the Sour Note — so faint she almost misses it — *tick... tick...* A metallic click. She moves the cursor away. The clicking stops. She moves it back. *tick... tick-tick...* Faster.

"It's like a metal detector," she whispers. She does not know the word "Geiger counter." She does not need to.

**Minute 0:40 — The Hunt**
She sweeps the cursor across each agent's panel. SCOUT-1 rules: the clicking accelerates — *tick-tick-tick-tick-tick* — until she hovers directly over Rule 3. The clicking becomes a rapid buzz at 2kHz, bright and insistent. Rule 3 is highlighted amber: **MODIFIED: evade threshold 30 → 85.** The scout would run from everything.

She clicks [REVERT]. The buzzing STOPS. A pure tone rings — 440Hz, clean as a bell, 300ms. The Sour Note fades. The kulintang melody resolves. One second of silence — then a warm chord blooms, three notes swelling from nothing, holding, then gently releasing into the clean ambient.

Sofia removes her headphones. She is grinning. "That was SO satisfying."

**Minute 1:00 — Deploying Clean**
She presses EXECUTE. The breaker-switch clack. During the sealed watch, every sound is familiar — tick clock, signal pings, servo whirs. No sour notes. No clicking. The system sounds *right*. She notices this for the first time because she now knows what *wrong* sounds like.

**UI Annotations:**
- Integrity indicator: top-left, first time below 100%, amber text with pulsing border
- Beetle Click: stereo-panned to cursor position, 1/2s far → 12/s on hover
- Revert Tone: 440Hz pure sine, hard stop to buzzing, 300ms fade
- All-Clear Chord: 1s silence → C-E-G major triad → 1s hold → ambient resume
- Predecessor voice: slightly warmer EQ than boot log system voice, panned center

---

### Journey: Marcus, 42, DevOps Engineer, Factorio/Screeps Veteran

**Context:** Mission 9. Third corruption encounter. Marcus has cleared Missions 7-8 corruption flawlessly using the Geiger sweep. He wears studio headphones. He has a systematic approach: listen first, then sweep left-to-right, top-to-bottom.

**Minute 0:00 — The Predecessor's Warning**
The boot log announces Integrity Monitoring v0.3. Then the Predecessor's voice: *"If you hear a voice that isn't yours or mine — cut it. Don't listen. Cut it."*

Marcus raises an eyebrow. "Voice?" He has encountered corrupted configs and degraded buffers. He has never heard a voice.

**Minute 0:10 — The Ambient Assessment**
The workbench opens. Marcus closes his eyes for 3 seconds — his ritual. The Sour Note is there, louder than previous missions. But there is something else: a high-frequency crackle layered on top of the kulintang, sharp and digital, like bit-crushed noise. This is different from the low rumble he heard in Mission 8 (config corruption). Different from the AM hiss of buffer degradation. This is a new spectral band. His ears separate it instantly — years of monitoring Grafana dashboards through audio alerts have trained him to decompose layered signals.

"Hook corruption," he says, though the game has never told him that high-frequency static means hooks. He inferred it from the spectral progression: low = configs, mid = buffers, high = hooks. The game taught him a classification system without a single label.

Integrity: **72% — 4 anomalies detected.**

**Minute 0:25 — The Familiar Sweep**
Marcus sweeps the cursor across the workbench. Two configs (Beetle Clicks at 2kHz — bright, familiar) and one degraded buffer (clicks at 800Hz — lower, he knows this register). He reverts them efficiently: click, buzz, revert, tone. Click, buzz, revert, tone. Three heartbeat decelerations (90→60 BPM, steady), three clean tones. Integrity climbs from 72% to 89%.

One anomaly remains. The high-frequency crackle persists in the ambient.

**Minute 0:55 — The Ghost in the Wire**
He sweeps the Relay's hook panel. The clicking starts — but it is different. Not the bright 2kHz of a config, not the 800Hz of a buffer. This is 400Hz. Deep. Each click has a distortion tail that smears into the next one, like a crackling electrical fault. The sound vibrates in his chest through the headphones.

He hovers the third hook wire. The distortion clicking becomes a steady buzz — and something emerges from it. A voice. Not words — fragments. Reversed, pitch-shifted, looping every 2 seconds: *"...ssss-reK-...ssss-reK-..."*

The hairs on his forearms stand up.

He remembers the Predecessor's warning. *"If you hear a voice — cut it."*

**Minute 1:10 — The Purge**
Marcus right-clicks the hook wire. [PURGE]. The whisper is guillotined mid-phoneme — SNAP. The carrier tone is sharp, bright, definitive. The Signal Jam Snap — a new sound, aggressive and satisfying, like slamming a door on an intruder. The heartbeat that was racing at 130 BPM with arrhythmic skips performs the Deceleration Cascade: 130... 110... 90... 70... 60... clean tone. The high-frequency static vanishes from the ambient. The Sour Note resolves. The All-Clear Chord blooms.

Marcus exhales. "That was personal," he says. "That wasn't a misconfigured parameter. That was an entity in my network."

The corruption audio vocabulary has just taught him the difference between *damage* and *invasion* — through timbre alone.

**Minute 1:30 — The Inspector Replay**
During the Inspector debrief (after winning the mission), Marcus scrubs back to the Plan Phase and re-listens to the ambient layer. He can now hear all three spectral bands in the initial ambient: the low config rumble (reverted first), the mid buffer hiss (reverted second), the high hook crackle (purged last). They were all there from the start. He just couldn't separate them until he had cleared them one at a time.

"It's like... mixing a song," he says. "You solo each track to hear it, then when you play the full mix again, you can pick out every instrument."

**UI Annotations:**
- Deep Corruption Distortion: 400Hz clicks with 50ms distortion tail, chest-resonant on studio headphones
- Whisper Fragment: reversed vocal, pitch-shifted, 500ms loop every 2s, stereo-panned to hook position
- Signal Jam Snap: abrupt whisper cutoff → bright carrier tone, 200ms attack
- Heartbeat arrhythmia: occasional 200ms gap between beats at 120+ BPM, creating stumble rhythm
- Spectral decomposition: three corruption types occupying distinct frequency bands (low/mid/high)

---

### Journey: Zara, 11, Plays on Family Computer, First Time With Headphones

**Context:** Mission 8. Zara discovered the Sour Note in Mission 7 but missed the Beetle Clicking — she was focused on the visual amber highlights and found the corruption by scanning. Today she is wearing headphones for the second time. She wants to try the "sound hunting" her older cousin described.

**Minute 0:00 — The Familiar Wrongness**
The workbench opens. The Sour Note is there — Zara recognizes it instantly. "Corrupted!" she announces. She checks the integrity indicator: **88% — 2 anomalies.** Two this time. Last mission was only one.

She moves her cursor to begin the visual scan. Then she hears it — *tick... tick-tick... tick...* — the clicking she missed last time. Her cousin told her: "Move your mouse around and listen for the fast clicking." She starts sweeping.

**Minute 0:20 — Two Types**
She finds the first corruption quickly — a config in the Striker's rules. The clicking is bright (2kHz), fast, familiar from what her cousin described. She hovers. The clicking buzzes. But this time, something new: a soft rhythmic pulse underneath the buzz. *ba-DUM... ba-DUM... ba-DUM...* A heartbeat. Slow and steady, about one beat per second. She has never heard this before.

"What's that thumping?" She doesn't know what it means. But it doesn't sound scary — 60 BPM is calm, reassuring. She clicks [REVERT].

The heartbeat does something unexpected: it *slows down*. The beats space out... further... further... then a single strong beat, then the clean tone. The Deceleration Cascade. Zara's eyes go wide. "It... calmed down? Like it was nervous and then relaxed?"

She has anthropomorphized the system in 3 seconds. The heartbeat made the corruption feel *alive* — a sick thing that got better when she fixed it. This emotional read is not the intended clinical metaphor. It is better.

**Minute 0:45 — The Second Hunt**
She sweeps for the second corruption. The clicking leads her to the Relay's buffer settings. The clicks here are lower — 800Hz instead of 2kHz. She notices the difference: "This one sounds deeper." She hovers. The heartbeat fades in again — faster this time. *ba-DUM-ba-DUM-ba-DUM* — maybe 90 BPM. Not scary, but noticeable. She clicks [REPAIR].

The Deceleration Cascade again: 90 BPM... 70... 60... strong final beat... clean tone. The Sour Note vanishes. The All-Clear Chord blooms.

"I HEALED it," Zara says. She does not say "I reverted the corruption." She says "I healed it." The heartbeat metaphor has reframed corruption detection as caretaking.

**Minute 1:05 — The Clean System**
During the sealed watch, Zara listens with new attention. Every tick clock strike, every signal ping — all clean, all in rhythm. No irregular heartbeats. No sour notes. The system sounds healthy because she made it healthy. She feels protective of it.

**UI Annotations:**
- Heartbeat at 60 BPM: one beat per second, sub-bass thump with high-frequency click transient
- Heartbeat at 90 BPM: three beats per two seconds, noticeable acceleration
- Deceleration Cascade: 500ms from elevated BPM to 60 BPM, logarithmic curve (fast initial deceleration, slow approach to rest)
- Clean tone after cascade: 440Hz, arrives 200ms after final heartbeat
- Emotional reframing: the heartbeat turns corruption from "broken machine" to "sick patient" — younger players especially respond to the caretaking metaphor

---

## Comparable Games

**Dead Space — Audio Logs as Horror Curriculum.** Dead Space introduces audio log types progressively: first personal logs (emotional, easy to understand), then scientific logs (jargon-heavy, reward attention), then ship system logs (gameplay-critical data buried in technical language). The player's audio literacy grows with the fiction. Robot Uprising's corruption audio curriculum follows the same pattern: first an emotional cue (Sour Note, named by the Predecessor), then mechanical tools (Beetle Click, Heartbeat), then narrative horror (Whisper Fragment, warned by the Predecessor).

**Subnautica — The Reaper Leviathan Audio Design.** Subnautica teaches players to fear the Reaper through a graduated audio curriculum: distant low-frequency roar (ambient layer — "something is out there"), directional echo-located approach sound (interaction layer — "it's getting closer"), and the attack scream (event layer — maximum intensity). The three layers map precisely to Robot Uprising's corruption audio layers. Crucially, Subnautica introduces the roar *before* the player ever sees a Reaper — audio-before-visual priming. The Predecessor's *"Hear that?"* serves the same function.

**Hollow Knight — Geo Loss Sound.** Hollow Knight's most effective audio teaching moment is the sound of dropping Geo on death — a bright, cascading *tinkle-tinkle-tinkle* that instantly communicates "you lost something valuable." The first time it plays, the player doesn't know what it means. The second time, they know to dread it. By the tenth time, the sound triggers an involuntary wince. Robot Uprising's Sour Note follows the same arc: meaningless on first hearing (if not for the Predecessor), recognized by second encounter, dreaded by Mission 9.

**Papers, Please — The Discrepancy Sound.** When the player spots a document discrepancy, a short rising tone plays — almost like a quiz show "correct" chime. The sound trains the player to associate detection with satisfaction. Robot Uprising's Revert Tone serves the identical function: the 440Hz clean sine is the "you found it" reward chime. Papers, Please also escalates discrepancy complexity over time (simple vs. multi-document vs. hidden) — the same pattern as Robot Uprising's corruption type progression (config → buffer → hook).

---

## Interaction Effects

- **With the boot log (locked):** The Predecessor's corruption audio lines must be written to work with or without voice acting. As text-only, *"Listen. ... Hear that?"* requires the audio to play simultaneously with the text scroll. As voiced, the Predecessor's vocal timbre must contrast with the system voice.
- **With the sealed watch (locked):** Corruption audio is Plan-phase only. The sealed watch has its own audio vocabulary (tick clock, combat, signals). Corruption sounds must be completely absent during the watch — their absence IS the signal that the player deployed clean. If corruption audio bled into the watch (see 6.10f for that exploration), it would contaminate the sealed watch's purity.
- **With the Inspector (locked):** The Inspector's timeline scrubber should allow re-listening to the Plan Phase ambient — including corruption audio if the player deployed without fixing all corruption. This is how veterans diagnose "I deployed at 88% integrity — what did I miss?" The corruption sounds are replayable artifacts.
- **With the Terminal progressive disclosure (5.16d):** The corruption audio Codex entries (Option D's contribution to the hybrid) must sync with the Terminal's own progressive disclosure. If the Terminal is at v0.2 (Mission 5-6 toolset), corruption audio entries should appear as INOP placeholders with the familiar counters — then boot to life in Mission 7.
- **With the cultural audio layer (6.03, Kulintang option):** The Sour Note's tritone is maximally effective against a pentatonic kulintang melody, which naturally avoids tritones. If a different base audio option is chosen (Server Room, Synthwave), the Sour Note must be recalibrated — a tritone in synthwave is less dissonant (synthwave uses chromatic harmony), so the corruption ambient shift would need a different interval (perhaps a quarter-tone detuning of the root).
- **With accessibility (6.10d):** Every sound in the curriculum must have a visual equivalent. The Beetle Click has the amber highlight. The Heartbeat has the integrity percentage and severity color. The Whisper has the red hook wire. The learning curve design must ensure that the visual curriculum matches the audio curriculum in pacing — a deaf player should encounter the same progressive complexity.

---

## Strengths of the Recommended "Whisper Curriculum"

1. **Emotional scaffolding at the hardest moments.** The Predecessor speaks at exactly the two points where audio literacy matters most: first encounter (Mission 7) and first enemy hook (Mission 9). The character's presence converts "what is this sound?" into "someone is warning me about this sound."
2. **Discovery-driven learning for mechanical sounds.** The Beetle Click, Heartbeat, Static Spectrum, and Deceleration Cascade are all discovered through interaction, not explained. The player's "I figured it out" feeling is preserved for the tools they will use most.
3. **The intensity ramp matches the corruption threat ramp.** One corruption in Mission 7, two in Mission 8, three-four in Mission 9, five-seven in Mission 10. The audio vocabulary grows exactly in proportion to the threat level — no sound is introduced before the player needs it.
4. **The even-odd Predecessor rhythm prevents narrative fatigue.** Two appearances in four missions is enough to establish the Predecessor as a corruption mentor without overusing the voice.
5. **The Mission 10 bait-and-switch is the best single audio moment in the campaign.** *"ALL SYSTEMS NOMINAL... CORRECTION: INTEGRITY COMPROMISED"* — full corruption suite drops — is the audio equivalent of a boss entrance in an action game. The player has spent three missions building audio literacy. Mission 10 tests all of it at once.

## Weaknesses

1. **Predecessor dependency.** If the Predecessor character is cut or redesigned, the emotional scaffolding for Missions 7 and 9 must be rebuilt. The Sour Note introduction could fall back to a system boot log line, but the whisper warning has no system-voice equivalent — the clinical AI would not say "don't listen."
2. **The Mission 9 sound dump.** Three new sounds in one mission (Deep Distortion, Whisper, Signal Jam Snap) is the steepest single-mission increase. A player who struggled with Mission 8's two new sounds may be overwhelmed. Mitigation: the Predecessor's warning primes the player for the whisper specifically, and the Signal Jam Snap only plays on resolution (a moment of relief, not stress).
3. **Laptop speaker degradation.** The Sour Note tritone, the 400Hz Deep Distortion, and the sub-bass Heartbeat all rely on frequency ranges that cheap laptop speakers reproduce poorly. The accessibility visual fallbacks prevent gameplay failure, but the *emotional* impact of the corruption audio curriculum is significantly diminished on hardware without bass response.
4. **The "I play with sound off" player.** An unknown percentage of players will never hear any of this. The visual corruption indicators (amber highlights, integrity percentage, red hook wires) must be a complete standalone system. The audio curriculum is an enhancer that transforms a competent experience into a memorable one — but it must never be *required*.

---

## The TikTok Clip

Split screen, two monitors. Left: Mission 7, headphones on. The Predecessor says *"Listen."* The player's face shifts — something is wrong. They hear the Sour Note. They sweep. They find it. Clean tone. Relief.

Right: Mission 10, same player, three days later. The boot log says *"ALL SYSTEMS NOMINAL"* — player leans back — *"CORRECTION: INTEGRITY COMPROMISED."* Their face drops. The full corruption suite hits: static on three bands, Sour Note screaming, Geiger clicking everywhere. They sweep like a veteran — cursor flying, heartbeats spinning up and slamming down, whispers cut mid-syllable by Signal Jam Snaps, seven fixes in 45 seconds. The Callsign Chime plays. Three ascending notes. The player pulls off headphones.

Caption: "Mission 7 me vs. Mission 10 me."

15 seconds. The audio tells the entire story.
