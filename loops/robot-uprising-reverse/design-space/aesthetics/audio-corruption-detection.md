# 6.10 — Sound Design for Corruption Detection

## The Design Challenge

Robot Uprising's corruption mechanics (see `competitive-analysis/exapunks-narrative-mechanical-integration.md`) introduce three distinct integrity threats: **corrupted configurations** (sabotaged settings between missions), **degraded buffers** (EMP damage reducing agent capacity), and **enemy-injected hooks** (foreign wiring in your network). Each needs a sonic signature that communicates threat type, severity, and resolution state — without words, before the player reads any UI text.

The audio must solve three problems simultaneously:
1. **Detection cueing** — the player should HEAR that something is wrong before they SEE the amber integrity indicator
2. **Severity scaling** — a single corrupted rule and a full-network compromise must sound categorically different
3. **Resolution satisfaction** — fixing corruption must produce one of the most satisfying sounds in the game, because the "clean" feeling IS the reward

This document explores six distinct sonic vocabularies for corruption, each with full SFX taxonomies, player journeys, and interaction effects with the locked audio design options (A: Kulintang, B: Server Room, C: Synthwave, D: Adaptive Silence).

---

## The "Clean vs. Compromised" Sonic Baseline

Before exploring specific corruption sounds, every option below shares a foundational principle: **the game's ambient audio layer shifts when the workbench is compromised.** The player's subconscious registers "something is wrong" before their conscious attention finds the integrity indicator.

**Clean workbench ambient (Plan Phase):** Whatever the locked audio option provides — kulintang melody, server room hum, synthwave pad, or procedural silence. This is the player's "home" sound. They've heard it for hours. It's comfort.

**Compromised workbench ambient:** The home sound is *perturbed*. Not replaced — perturbed. The kulintang melody has a sour note. The server room hum develops a 60Hz buzz harmonic. The synthwave chord gains a tritone. The procedural silence gets a faint, irregular click that isn't mapping to any game event. The perturbation is calibrated to be noticeable but not alarming — the player should think "huh, something sounds off" rather than "ALERT."

**Integrity percentage maps to perturbation depth:**
- 100%: Clean ambient. No perturbation.
- 90-99%: Barely perceptible. A single sour overtone in the ambient layer. Only players who've internalized the clean sound will notice.
- 75-89%: Noticeable. The ambient develops a rhythmic irregularity — a micro-stutter every 4 seconds, like a scratched record skipping.
- 50-74%: Obvious. The ambient timbre shifts toward dissonance. A low-frequency rumble enters. The workbench UI sounds (clicks, toggles) acquire a subtle metallic edge, like they're being played through a broken speaker.
- Below 50%: Alarming. The ambient destabilizes — tempo fluctuations, pitch wavering, intermittent dropouts where the sound cuts to silence for 200ms before resuming. The workbench itself sounds sick.

---

## Option 1: "The Geiger Counter" — Proximity-Based Detection Clicking

### What It Is

Corruption is sonified as **radiation**. A Geiger-counter-style clicking sound plays whenever the player's cursor is near a corrupted element. The clicking rate increases with proximity and severity — slow, irregular clicks when the cursor is a panel away from a corrupted rule; rapid machine-gun clicking when hovering directly over the injected foreign hook.

### Mechanical Specifics

**Detection clicking:**
- Base rate: 1 click per 2 seconds when any corruption exists on the current screen (barely perceptible)
- Proximity scaling: clicks per second = `base_rate × (1 / distance_in_UI_pixels) × severity_multiplier`
- At direct hover: 8-12 clicks per second for mild corruption, 20+ clicks per second for critical corruption (sounds like static)
- Each click is a dry, sharp, metallic tick — like a relay switch actuating. ~15ms duration. No reverb. Stereo-panned to the cursor position.

**Severity coloring:**
- Visible corruption (Easy): clicks are pitched at ~2kHz — bright, clean, almost friendly. Like a metronome.
- Subtle corruption (Medium): clicks pitched at ~800Hz — lower, more ominous. Each click has a 5ms noise tail (like static discharge).
- Deep corruption (Hard): clicks pitched at ~400Hz — chest-resonant. Each click has a 50ms distortion tail that smears into the next click at high rates. At maximum proximity, it sounds like a crackling electrical fault.

**The "hot-cold" sweep:** As the player moves their cursor across the workbench, the clicking creates a real-time audio map of corruption locations. Sweeping past a corrupted rule produces a brief burst of clicks that fades as the cursor moves away. Players learn to "sweep" their configs by ear — moving the cursor slowly across each panel and listening for clicking zones.

**Revert sound:** When the player clicks [REVERT] on a corrupted element, the clicking for that element cuts off instantly — a hard stop — replaced by a single clean tone: a pure sine wave at 440Hz (concert A), 300ms duration, with a gentle fade-out. This is the "all clear" for that element. The purity of the sine wave contrasts with the noisy, irregular clicking. Clean feels CLEAN.

**Full integrity restoration:** When the last corruption is fixed and integrity hits 100%, all residual clicking stops. A 1-second silence (even the ambient music ducks for 1 second). Then a warm chord blooms — three sine waves in a major triad (root, major third, perfect fifth), swelling from silence to medium volume over 500ms, then holding for 1 second before fading back to the clean ambient. This is "the all-clear chord." It should trigger a dopamine response. The player has cleaned the system. The system thanks them with harmony.

### Sensory Description

You open the workbench for Mission 8. The kulintang melody plays, but there's something in it — a faint metallic clicking beneath the gongs, irregular, like a beetle tapping inside a wall. You don't consciously notice for 3 seconds. Then you hear it. *tick... tick-tick... tick...*

You move your cursor to the agent roster. The clicking doesn't change — the corruption isn't there. You move to SCOUT-1's config panel. The clicking accelerates: *tick-tick-tick-tick-tick*. Faster as you approach the patrol radius field. You hover it — the clicks are rapid now, almost a buzz, with a low pitch that vibrates in your speakers. The field is highlighted orange. "MODIFIED: patrol radius 140m." Your stomach drops.

You click [REVERT]. The buzzing STOPS. A pure, clear tone rings out — concert A, clean as a tuning fork. The patrol radius snaps back to 40m. Relief.

You sweep the cursor to RELAY-2's hooks. The clicking starts again — lower, slower. A different corruption. You trace it to the fourth wire. Red wire. Foreign hook. The clicks are deep now, 400Hz, each one leaving a distortion smear. This one is dangerous.

You right-click. [PURGE]. The distortion cuts off. Clean tone. Silence. Then the ambient resumes — just the kulintang, no beetles in the wall.

Two more corruptions to find. You sweep...

### Player Journeys

#### Journey: Anika, 26, Quality Assurance Engineer

**Context:** Mission 9. Anika has encountered corruption three times before. She's developed a systematic sweep pattern — left to right, top to bottom, like reading a page. She wears over-ear headphones.

**Minute 0:00 — Workbench Opens**
The screen loads. Before she looks at the integrity indicator, she LISTENS. The ambient is slightly off — the kulintang has a sour fourth in the melody, and underneath... clicking. Faint. Irregular. She doesn't need to check the header. She knows.

Integrity indicator: [82%]. Four issues detected.

**Minute 0:15 — The Sweep**
Anika positions her cursor at the top-left of the workbench — the agent roster panel. She drags slowly downward. Each agent name she passes: no change in clicking rate. The corruption isn't in the roster names.

She moves right to SCOUT-1's config. The clicking picks up at the rules panel — she's close. She hovers each rule in sequence:
- Rule 1 (patrol): no change. Clean.
- Rule 2 (evade threshold): clicking doubles. *tick-tick-tick-tick*. She hovers directly — the pitch drops to 800Hz. Medium severity. She checks: "evade when health < 15" has become "evade when health < 85." The scout would flee from everything.

[REVERT]. Pure tone. One down.

**Minute 0:45 — The Deep Corruption**
Three corruptions found and reverted. Integrity shows [94%]. One more.

She sweeps again. No clicking anywhere in the visible configs. She frowns. Then she remembers — hooks have metadata. She opens RELAY-3's hook editor and hovers each wire. Clean, clean, clean... then on the third wire, a faint clicking. Not fast — maybe 3 clicks per second. But the pitch is LOW, 400Hz, with that distortion tail. Deep corruption. Something in the metadata.

She right-clicks the wire. Expands the metadata view. "Signal copies enabled: YES." That's not hers. The clicks are right there — hovering the metadata field makes them a steady 8/second buzz.

[DISABLE SIGNAL COPYING]. Hard stop. Clean tone. Integrity: [100%].

The 1-second silence arrives. The music ducks. Then the all-clear chord blooms — root, third, fifth — warm, full, resolved. The ambient returns clean. No clicking. No sour notes. Just the kulintang, pure.

Anika leans back. "Clean," she says to no one.

**Minute 1:30 — Deploy with Confidence**
She presses EXECUTE. The breaker-switch CLACK. During the Sealed Watch, she listens for anomalies — but there are none. Every signal ping, every servo whir, every dabakan strike is accounted for. The battle sounds like HER architecture, not a corrupted one.

Post-battle debrief: "0 foreign elements detected during execution. Full config integrity maintained."

She smiles at the achievement popup: **Clean Run**.

**UI Annotations:**
- Geiger clicking: dry metallic ticks, stereo-panned to cursor position
- Proximity rate: 1/2s (far) → 20+/s (direct hover)
- Severity pitch: 2kHz (easy), 800Hz (medium), 400Hz (hard/deep)
- Revert: hard stop → 440Hz pure sine, 300ms fade
- All-clear chord: 1s silence → major triad swell (500ms) → 1s hold → fade
- Ambient perturbation: sour overtone proportional to corruption %

#### Journey: Luis, 52, Retired Military Signals Intelligence Analyst

**Context:** Mission 10 (campaign climax). Luis has cleared every previous corruption perfectly. He wears studio monitors, volume at exactly 70dB SPL as measured by his decibel meter. He treats corruption detection like a professional sweep.

**Minute 0:00 — The Opening Assessment**
Luis doesn't touch the mouse for 5 full seconds. He closes his eyes and LISTENS to the ambient. The kulintang melody is playing, but the third note in the pattern is a quarter-tone flat — the sour note. Underneath: clicking, but more than usual. The rate is higher even before cursor interaction — he estimates 2 clicks per second at baseline. That means high corruption. He opens his eyes.

Integrity: [63%]. Seven issues detected. The amber indicator is almost red.

"Seven," he says. "Worst yet."

**Minute 0:10 — Systematic Sweep**
He opens a text file on his second monitor. Types the time. Then begins his sweep with military precision: each agent, each panel, each field. The clicking creates a spatial audio map as he moves — silent zones, low-activity zones, hot zones.

SCOUT-1: clean. SCOUT-2: one hit at the skill panel (visible corruption, 2kHz clicking, easy fix). STRIKER-1: two hits — one in rules (medium, 800Hz), one in hooks (deep, 400Hz with distortion). He logs each find before reverting.

**Minute 1:30 — The Ambush**
Six corruptions found and logged. Integrity at [91%]. One more. The ambient clicking has dropped to barely perceptible — the base rate for a single remaining corruption. He can't find it.

He tries a different approach: he closes all panels and hovers the workbench HEADER itself. The clicking... spikes. The corruption is in a global setting, not an agent config. He checks the production queue. Clean. Channel map. Clean. He hovers the resource display — clicking intensifies. He clicks the resource allocation panel (the one that sets mineral and energy distribution).

The mining priority ratio has been shifted from 3:1 minerals:energy to 1:3. Subtle. Valid. Devastating — it would starve his production queue.

The Geiger clicking at 400Hz is a steady buzz. He reverts.

All-clear chord. Seven for seven.

"Sweep complete," he says, and types the completion time.

**UI Annotations:**
- Global setting corruption: clicking triggers on non-agent UI elements
- Resource allocation as corruption target: valid but devastating parameter changes
- Baseline clicking rate scales with total corruption count (more corruptions = higher floor)
- Professional workflow: silence assessment → systematic sweep → log → clear

#### Journey: Zara, 11, Playing With Sound Off (Then On)

**Context:** Mission 8. Zara usually plays with sound off because she plays on the family computer while her sister watches TV. Today her sister is at a friend's house. She puts on her school headphones for the first time.

**Minute 0:00 — Sound On For The First Time**
Zara has been playing for a week with sound off. She's been relying entirely on the visual integrity indicator — the amber triangle, the orange highlights, the [REVERT] buttons. She's good at it. She finds corruptions by visually scanning each field.

Today she turns sound on. The workbench loads. She hears the kulintang melody for the first time and is enchanted — "that's pretty." Then, underneath: *tick... tick...*

"What's that clicking?" She moves her mouse. The clicking changes. She moves it over SCOUT-1's panel. Faster. She pulls it away. Slower. Back. Faster.

"Oh. OH." She understands immediately. The sound is pointing her toward the corruption. She starts hunting.

**Minute 0:30 — Audio-Visual Discovery**
She finds a corrupted rule by ear first — the clicking led her to the rules panel before she saw the orange highlight. The visual indicator confirms what her ears already knew. She clicks [REVERT].

The clean tone rings out. She grins. "That sound is SO satisfying."

**Minute 1:00 — The Audio Advantage**
On her second corruption, the clicking leads her to a hook she wouldn't have checked visually. She's not comfortable navigating hook metadata yet — she usually skips that panel. But the clicking is insistent, low-pitched, buzzing. She explores the panel for the first time because the audio won't let her ignore it.

She finds the foreign hook wire — red, shimmering. "CREEPY." She purges it. Clean tone.

**Minute 1:45 — All Clear**
The all-clear chord plays. Zara closes her eyes during the major triad swell. When the clean ambient returns, she says: "I'm never playing this with sound off again."

She deploys. During the Sealed Watch, she hears every system event for the first time — the tick-clock agung, the babendil pings, the combat dabakan. Her eyes go wide. "This game has been talking to me THIS WHOLE TIME and I was ignoring it."

**UI Annotations:**
- Audio as first-time-discovery driver: clicking leads player to panels they'd never explored visually
- The satisfaction loop: hunt (clicking) → find (visual confirm) → fix (clean tone) → repeat
- All-clear chord as emotional punctuation: marks transition from corrupted to clean state
- Sound-off viability: the visual system must work independently; audio is an enhancer, not a requirement

---

## Option 2: "The Heartbeat Monitor" — Vital Signs of System Health

### What It Is

Each agent in the workbench has a persistent **heartbeat** — a subtle rhythmic pulse that plays when the agent is selected or hovered. A healthy agent's heartbeat is regular, clean, and pitched to the agent's type (Scout = fast, light pulse at ~100 BPM; Command = slow, deep pulse at ~50 BPM). When an agent is corrupted, its heartbeat becomes **arrhythmic** — irregular intervals, skipped beats, doubled beats, or pitch instability.

### Mechanical Specifics

**Healthy heartbeats per unit type:**
| Unit | BPM | Timbre | Character |
|------|-----|--------|-----------|
| Scout | 100 | High sine + breath noise | Quick, alert, like a runner's resting pulse |
| Striker | 80 | Square wave + sub-bass thump | Steady, powerful, like a boxer at rest |
| Relay | 70 | Triangle wave + harmonic overtone | Even, mechanical, like a metronome |
| Specialist | 85 | Saw wave + metallic resonance | Precise, clinical, like medical equipment |
| Command | 50 | Deep sine + room reverb | Slow, authoritative, like a sleeping giant |

**Corruption arrhythmia patterns:**
- **Visible corruption:** Occasional skipped beat (1 in 8 pulses drops out). Noticeable but not alarming. Like a coffee-induced palpitation.
- **Subtle corruption:** Irregular intervals — pulse alternates between 80% and 120% of normal BPM. Creates a "stumbling" feel, like someone walking on uneven ground.
- **Deep corruption:** The heartbeat develops a secondary rhythm — a fainter, faster counter-pulse between the main beats. This is the "foreign heartbeat" — the enemy code's vital sign overlaid on the agent's. Two hearts beating in one body.
- **EMP damage (buffer degradation):** The heartbeat thins. Overtones drop out. A 14-slot Command agent with 6 burned slots sounds like its pulse is being heard through a wall — muffled, distant, weak. The volume of the heartbeat scales with remaining buffer capacity as a fraction of total.
- **Critical corruption (multiple issues):** Full arrhythmia — irregular, multi-frequency, with occasional high-pitched spikes (like a heart monitor alarm). If 3+ corruptions overlap on one agent, the heartbeat enters "fibrillation" — a rapid, chaotic fluttering that sounds unmistakably like emergency.

**The revert as defibrillator:** When corruption is fixed, the heartbeat doesn't just normalize — it RESETS. A 200ms flatline (silence), then a strong, clear first beat that's 6dB louder than normal, then the heartbeat settles back to its regular rhythm. This is the "defibrillation" moment — the system reboots. The flatline-to-first-beat transition is the most dramatically satisfying sound in the corruption vocabulary.

**Full system health restored:** When all agents are clean, hovering the workbench overview produces a polyrhythmic composite of all agent heartbeats playing simultaneously — each at its own BPM and timbre, but all phase-aligned on beat 1. This "healthy chorus" is an accidental polyrhythm that sounds alive, organic, coordinated. The all-clear is not a single chord but a RHYTHM.

### Sensory Description

You select SCOUT-1 after a breach notification. Instead of the quick, clean 100 BPM pulse you've come to associate with this unit, you hear: *thump... thump-thump... ... thump... thump-thump-thump.* Irregular. The rhythm can't find its footing. Something is wrong inside this agent.

You open the rules panel. The arrhythmia intensifies — the beats are closer together, more erratic. You hover the corrupted rule. The heartbeat stutters badly, skipping two beats in a row, then firing three rapid beats in succession. Your own heart rate rises in sympathetic response.

[REVERT].

Flatline — 200ms of absolute silence, cutting through whatever ambient is playing.

Then: **THUMP.** One clear, strong beat. Louder than normal. The sound of a heart restarting.

*thump... thump... thump... thump...* Regular. Clean. 100 BPM. The Scout is healthy again.

You move to RELAY-2. Its normal 70 BPM triangle-wave pulse is there, but there's something else — a faster, thinner pulse between the beats. *thump-tick-thump-tick-thump-tick.* Two hearts. The enemy's code has a heartbeat of its own, parasitic, riding between the relay's natural rhythm.

You find the foreign hook. Purge it. Flatline. THUMP. The parasitic tick vanishes. Just the clean triangle wave remains.

### Player Journeys

#### Journey: Dr. Amir Kasem, 44, Cardiologist, Plays During Overnight Hospital Shifts

**Context:** Mission 9. Dr. Kasem recognized the heartbeat metaphor on his first encounter and has been fascinated by the game's cardiac vocabulary ever since. He plays on noise-canceling headphones during quiet periods on shift.

**Minute 0:00 — Clinical Assessment**
The workbench loads. Dr. Kasem's trained ear catches it immediately — before looking at the screen, he hears arrhythmia. Not just one agent. Multiple. The ambient audio has the quality of a multi-patient ICU monitor — overlapping irregular rhythms.

He checks the integrity indicator: [71%]. He thinks, professionally: "multiple arrythmias, one possibly in fib." He's right — COMMAND-1's heartbeat is the chaotic fluttering of severe multi-corruption.

**Minute 0:30 — Triage**
Dr. Kasem triages by ear. He hovers each agent briefly, listening:
- SCOUT-1: skipped beat. Minor. Can wait.
- SCOUT-2: clean. No issues.
- STRIKER-1: stumbling rhythm. Moderate. Queue for fix.
- RELAY-1: double heartbeat (parasitic). Moderate. Fix soon.
- RELAY-2: clean.
- COMMAND-1: fibrillation. Critical. Fix FIRST.

He goes to COMMAND-1. The fluttering is rapid, chaotic — the 50 BPM deep sine wave has fragmented into a 180 BPM tremor with multiple frequency components. He finds four corruptions on this single agent: two rule changes, a foreign hook, and a skill swap.

**Minute 1:00 — The Save**
He reverts the first corruption. Flatline. THUMP. The fibrillation reduces — still irregular, but the main heartbeat re-emerges. Three corruptions left.

Second revert. Flatline. THUMP. Stronger now. The heartbeat finds a rhythm, though it stumbles on every fourth beat.

Third: the foreign hook purge. Flatline. THUMP. The parasitic tick vanishes. The heartbeat is almost regular — just a slight interval variation.

Fourth: the skill revert. Flatline. THUMP. Clean. 50 BPM deep sine. Room reverb. The Command agent sounds like a sleeping giant again.

Dr. Kasem exhales. "Sinus rhythm restored."

**Minute 1:30 — Remaining Patients**
He moves through SCOUT-1 (one fix — flatline, thump, done) and STRIKER-1 (two fixes — flatline, thump, flatline, thump).

RELAY-1 last. The double heartbeat. He purges the foreign hook. Flatline. THUMP. The clean triangle wave resumes.

He hovers the workbench overview. The polyrhythmic chorus plays — all five agents' heartbeats at their natural BPMs, phase-aligned on beat one. Scout at 100, Striker at 80, Relays at 70, Command at 50. It sounds like an orchestra tuning. It sounds like health.

Integrity: [100%]. He clicks EXECUTE with a doctor's confidence: the patient is stable, the surgery can proceed.

**UI Annotations:**
- Agent heartbeat: persistent audio when selected/hovered, type-specific BPM and timbre
- Arrhythmia types: skipped beats (easy), stumbling intervals (medium), parasitic double-pulse (hooks), fibrillation (critical multi-corruption)
- Flatline-thump: 200ms silence → 6dB-loud first beat → normal rhythm
- Triage by ear: severity audible before visual inspection
- Polyrhythmic health chorus: all-agent phase-aligned composite rhythm

---

## Option 3: "The Radio Dial" — Tuning Between Clean and Corrupted Frequencies

### What It Is

The workbench has a persistent **carrier signal** — a clean tone that represents the system's operating frequency. Corruption manifests as **interference** on this carrier: static, cross-talk, phantom voices, frequency drift. The player's job is to "tune" each agent back to clean frequency by fixing corruptions, like tuning an analog radio through static to find the clear signal.

### Mechanical Specifics

**The carrier signal:**
- A pure 220Hz tone (A3), barely audible at -30dB under the ambient music
- Players don't consciously hear it when clean — it's subliminal
- When corruption exists, the carrier develops overtones and noise that push it above the audible threshold

**Interference types:**
- **White noise bleed:** A hiss that increases with total corruption percentage. At 90% integrity, it's barely perceptible. At 60%, it sounds like an AM radio between stations.
- **Cross-talk:** Faint fragments of "enemy" audio — a reversed version of the game's own signals, played at -20dB. The player hears ghost signals that aren't theirs. A babendil ping they didn't trigger. A servo whir for a unit that isn't moving. The enemy's architecture bleeding through.
- **Frequency drift:** The carrier slides off 220Hz — drifting up to 233Hz (Bb) or down to 207Hz (Ab). The detuning creates a seasick, unstable feeling. Fixes pull the carrier back toward 220Hz.
- **Phantom modulation:** At deep corruption, the carrier develops an amplitude modulation — the volume wobbles at 3-7Hz, creating a tremolo effect that makes the entire audio layer feel unstable, like listening through a fan.

**Tuning back to clean:**
Each [REVERT] snaps one component of the interference away. White noise drops by a step. Cross-talk fragments disappear. The frequency slides toward 220Hz. The final fix — the one that hits 100% — locks the carrier at exactly 220Hz with zero noise floor. A "lock" click plays (like a radio dial finding a station), followed by 500ms of the pure carrier at full audible volume before fading back to subliminal.

### Sensory Description

You open a compromised workbench and the air feels wrong. Not loud wrong — textured wrong. Beneath the kulintang melody, a hiss. Between the gong strikes, ghost sounds — a babendil ping that belongs to nobody, a servo whir from nowhere. The melody itself sounds slightly flat, like the instrument was left in a humid room.

You fix the first corruption. The hiss thins. Fix the second. The ghost ping disappears. Fix the third — the melody sharpens, coming back in tune. Fix the fourth. A satisfying CLICK — the radio dial locking onto the station — and for half a second, a pure, clear tone rises above everything, then settles back under the mix. Clean. Tuned. Home frequency.

### Player Journeys

#### Journey: Marco, 38, Amateur Radio Operator (Ham Radio License Holder)

**Context:** Mission 8. Marco has been a ham radio enthusiast since age 16. He recognized the interference patterns immediately on first encounter — the game is speaking his language.

**Minute 0:00 — QRM Assessment**
Marco opens the workbench and hears interference. His ham radio instincts kick in: that's QRM — man-made interference. The carrier is drifting (he can hear the 220Hz pulling flat), and there's cross-talk (ghost signals from an adjacent "frequency" — the enemy's network).

He thinks of it professionally: someone is transmitting on his frequency. He needs to identify the source and eliminate it.

**Minute 0:20 — Signal Identification**
He listens to the cross-talk carefully. The ghost sounds tell him WHAT was corrupted: a phantom servo whir suggests a movement-related corruption (a patrol rule was changed). A ghost hook-fire ping tells him a hook was injected. He can diagnose corruption types by ear before inspecting anything visually.

He finds the patrol rule corruption — exactly where the phantom servo told him to look. [REVERT]. The phantom servo disappears from the cross-talk. Carrier frequency nudges back toward 220Hz.

**Minute 1:00 — The Deep Find**
Three fixes done. The carrier is almost at 220Hz but has a faint wobble — amplitude modulation at about 5Hz. That's deep corruption. Something is still broadcasting on his frequency.

He opens the hook metadata for each agent. The wobble intensifies when he hovers RELAY-3's third hook — the amplitude modulation doubles in rate. He investigates. Signal copying enabled. An eavesdrop.

He disables it. The wobble stops. The carrier locks. CLICK. The pure 220Hz rises, clear and strong, then fades. His frequency is clean.

"QRT," he says. "Station secure."

**UI Annotations:**
- Carrier signal: 220Hz (A3), subliminal when clean
- White noise: scales with corruption %, AM radio between stations
- Cross-talk: reversed/phantom game sounds from enemy architecture
- Frequency drift: carrier detuning toward Bb/Ab, seasick quality
- Amplitude modulation: 3-7Hz wobble for deep corruption
- Lock click: station-found radio sound + 500ms pure carrier at audible volume

---

## Option 4: "The Wrongness Chord" — Harmonic Dissonance as Threat Signal

### What It Is

The workbench's ambient audio includes a sustained chord built from the currently selected agent's vital parameters (buffer capacity, hook count, skill count). When everything is configured correctly, the chord is consonant — a major triad or open fifth. When corruption exists, the chord includes dissonant intervals — minor seconds, tritones, augmented fourths — that create an uneasy, "something is wrong" harmonic texture.

### Mechanical Specifics

**Chord construction:**
Each agent parameter maps to a note in a chord:
- Buffer capacity → root note (more capacity = lower root, bigger sound)
- Active skill count → third (determines major/minor quality)
- Hook count → fifth (determines chord openness)
- Rules count → seventh or extension (adds complexity)

**A healthy Scout (6 buffer, 2 skills, 2 hooks, 3 rules)** sounds like:
- Root: C4 (buffer 6 → mid-range)
- Third: E4 (2 skills → major third)
- Fifth: G4 (2 hooks → perfect fifth)
- Seventh: Bb4 (3 rules → dominant seventh — adds a little character)
- Result: C dominant 7 — warm, bluesy, resolved

**A corrupted Scout (patrol radius changed, foreign skill inserted)** sounds like:
- Root: C4 (buffer unchanged)
- Third: E4 → Eb4 (corrupted skill → the third drops to minor — the chord goes dark)
- Fifth: G4 (hooks unchanged)
- Added: F#4 (foreign element → tritone interval enters — the "devil's interval")
- Result: C diminished with tritone — tense, unresolved, wrong

**The revert resolution:** Fixing a corruption removes the dissonant note and restores the consonant one. The chord literally RESOLVES — like a suspended chord finally landing. Diminished → minor → major. Each fix moves one note in the chord toward its home position. The player hears harmonic resolution as a direct, visceral reward.

**Full integrity:** All notes in home position. The chord is a major triad with optional warm seventh. It BREATHES — gentle volume swell on a 4-second cycle. The system is healthy and resting.

### Sensory Description

You select a corrupted Relay. The chord that should be a warm Eb major with a bright high overtone is instead an Eb minor with a sickening F# tritone underneath — a chord that sounds like it's about to collapse. The overtone is wavering, not steady. Your ear wants the chord to resolve so badly it's almost physical.

You find the corruption: a rule reorder that broke the priority chain. You revert it. The F# drops out. The Eb minor remains — still not right, but the tritone is gone. One more fix. You find the foreign hook. Purge. The minor third rises to major. Eb minor → Eb major. The chord opens up like a window. Warm, stable, resolved. The overtone steadies. You exhale.

### Player Journeys

#### Journey: Priya, 33, Sound Designer for Film Post-Production

**Context:** Mission 9. Priya mixes audio professionally. She processes harmonic content subconsciously. She recognized the chord system in Mission 7 and has been using it as her primary diagnostic tool.

**Minute 0:00 — The Dissonant Room**
Workbench opens. Priya selects her Command agent (the most complex, 14 buffer, 6 hooks). The chord plays: what should be a rich, deep, major quality with layered extensions is instead a cluster of clashing semitones. She counts the dissonant intervals by ear — at least three wrong notes. Three corruptions minimum.

She doesn't check the integrity indicator. She doesn't need to. The chord told her everything.

**Minute 0:30 — Harmonic Debugging**
She hovers each config element. The chord is persistent — it represents the agent's total state. But individual elements contribute individual notes. When she hovers a corrupted rule, that note subtly brightens in the mix (volume +3dB) — the game is saying "this note is the problem."

She finds the tritone source: a foreign skill. Removes it. The tritone note drops out of the chord. The remaining dissonance is still present but the worst interval is gone — it's like removing the nails-on-chalkboard frequency from a bad mix.

Second corruption: a rule change that's pulling the third down to minor. Reverts it. The third rises. Minor → major. The chord warms.

Third: a context filter disabled. This contributed a cluster of close-frequency noise (multiple signals flooding the buffer = multiple close-interval notes). She re-enables the filter. The cluster resolves to a single clean note — the extension that adds warmth without tension.

The chord is now a full, rich, major quality with a dominant seventh. Breathing gently. She smiles — it sounds like a film score pad. It sounds like resolution.

**UI Annotations:**
- Agent chord: persistent when agent selected, built from config parameters
- Dissonance mapping: corrupted params → minor seconds, tritones, augmented intervals
- Note brightening on hover: +3dB on the specific note a hovered element contributes
- Resolution chain: dissonant → less dissonant → consonant, one fix at a time
- Full health: major triad + optional seventh, 4-second breathing cycle

---

## Option 5: "The Alarm Cascade" — Escalating Alert Vocabulary

### What It Is

The most straightforward approach: corruption generates **alarm sounds** that escalate with severity, modeled after real industrial control system (ICS) alarm standards. The vocabulary is borrowed from nuclear power plant control rooms, air traffic control, and hospital patient monitoring — environments where graded alert sounds save lives.

### Mechanical Specifics

**Alert tier mapping:**
| Tier | Trigger | Sound | Cadence | Color |
|------|---------|-------|---------|-------|
| Advisory | Integrity 90-99% | Single soft chime (Eb5) | Once, on workbench open | Cyan |
| Caution | Integrity 75-89% | Double chime (Eb5-Bb4) | Repeats every 30 seconds | Amber |
| Warning | Integrity 50-74% | Triple chime (Eb5-Bb4-Gb4) | Repeats every 15 seconds | Orange |
| Alert | Integrity 25-49% | Continuous tone (C4) with 0.5s pulse | Continuous | Red |
| Critical | Integrity below 25% | Rapid pulse tone (C4) + spoken "SYSTEM INTEGRITY CRITICAL" in Predecessor's voice | Continuous | Red + flash |

**Spatial audio for located corruptions:**
Each corrupted element emits a low-level alert ping every 5 seconds, spatialized to its screen position. The player hears corruption sources from their spatial location — a corruption in the top-right hooks panel pings from the right speaker; one in the bottom-left rules panel pings from the left. Multiple corruptions create a stereo field of pings.

**Acknowledge/silence mechanic:** The player can [ACK] an alert to silence it for 60 seconds (like acknowledging a fire alarm — you've heard it, you're investigating). This prevents alarm fatigue during complex auditing sessions. Unacknowledged alerts escalate one tier after 2 minutes — the system doesn't let you forget.

**Fix sounds (per tier):**
- Advisory fix: soft ascending chime, 2 notes
- Caution fix: medium ascending chime, 3 notes, slight reverb
- Warning fix: clear ascending arpeggio, 4 notes, satisfying
- Alert fix: alarm-silence WHOOSH (the sound of a control room going quiet after a crisis), then ascending 4-note chime
- Critical fix: dramatic alarm-silence, 2-second silence, then the all-clear chord (see Option 1) with added sub-bass

### Player Journeys

#### Journey: Keiko, 29, Nuclear Power Plant Operations Technician

**Context:** Mission 10 (climax). Keiko works in a real control room where alarm standards are life-and-death. She recognized the IEC 62682 alarm pattern immediately and it triggered a fascinating cognitive dissonance — her professional training applied to a game.

**Minute 0:00 — Alarm Assessment**
Workbench opens. Triple chime: Eb5-Bb4-Gb4. Warning tier. Integrity [68%]. Seven corruptions.

Keiko's training activates: assess, acknowledge, investigate, resolve. She clicks the integrity indicator (her "acknowledge" — the repeating chimes switch to a soft pulse that says "I know, I'm working on it").

**Minute 0:15 — Prioritize by Spatial Audio**
She closes her eyes. Three spatial alert pings, different locations: right speaker (hooks panel area), left speaker (rules panel area), center (something in the production queue). She opens her eyes and goes to the hooks panel first — the right-speaker ping was the loudest, indicating highest individual severity.

She finds and purges a foreign hook. The right-speaker ping stops. The ambient alert drops from Warning to Caution (double chime, 30-second repeat). Six corruptions remain but the worst is gone.

**Minute 1:00 — Systematic Clear-Down**
She works through each corruption methodically. Each fix produces the tier-appropriate ascending chime. With each fix, the ambient alert tier drops:
- Fix 3: Caution → Advisory (single soft chime, once)
- Fix 5: Advisory holds (two minor corruptions remain)
- Fix 6: Advisory holds
- Fix 7: Advisory → silence. Integrity [100%].

The all-clear: the alarm-silence WHOOSH (the sound of a ventilation system suddenly becoming the loudest thing in the room after a crisis). Then 2 seconds of silence. Then the sub-bass all-clear chord.

Keiko recognizes the emotional beat: it's the same feeling as clearing a plant-wide alarm cascade at work. Relief that's almost euphoria. The game has recreated her most intense professional experience as entertainment.

**UI Annotations:**
- IEC 62682-inspired alert tiers: advisory → caution → warning → alert → critical
- Spatial pings: corruption locations as stereo-positioned alert tones every 5s
- ACK mechanic: silence an alert for 60s, unacked alerts escalate
- Tier-appropriate fix sounds: ascending chime complexity scales with tier
- Alarm-silence WHOOSH: the dramatic "crisis over" sound that precedes the all-clear

---

## Option 6: "The Whisper Network" — Diegetic Corruption as Enemy Voice

### What It Is

The most narratively ambitious option. Corrupted elements don't produce abstract sounds — they produce **faint, distorted speech fragments** from the enemy AI. The enemy's code literally SPEAKS through the corruptions it planted. When you hover a corrupted rule, you hear a whispered fragment — processed, synthetic, unsettling — of the enemy's intent: *"...redirect... flank route... exposed..."* The corruption has a VOICE.

### Mechanical Specifics

**Voice processing chain:**
The "enemy voice" is a synthesized text-to-speech run through heavy processing:
1. Formant shift down (makes it deeper, inhuman)
2. Ring modulation with a 60Hz carrier (adds metallic, robotic quality)
3. Granular time-stretch (fragments syllables into grains, some repeated, some reversed)
4. Heavy reverb (sounds like it's coming from inside a metal tank)
5. Volume at -20dB under the ambient — barely perceptible, at the edge of hearing

**What the whispers say:**
The content is diegetic — it describes what the corruption DOES, from the enemy's perspective:
- Corrupted patrol radius: *"...wider... expose the scout... draw it out..."*
- Foreign hook (eavesdrop): *"...listen... copy... everything they say..."*
- Injected skill: *"...replace... their tool with ours... they won't notice..."*
- Rule reorder: *"...priorities... scrambled... what matters most... forgotten..."*
- Disabled filter: *"...open the gates... let everything through... drown them..."*

The player may not consciously parse the words — the processing makes them difficult to understand. But the presence of speech where there should be none is deeply unsettling. The lizard brain registers "someone is in here who shouldn't be."

**Resolution:**
When corruption is fixed, the whisper cuts off mid-word — a hard stop, like hanging up a phone. A brief, clean tone (the "disconnect" sound) plays. The enemy's voice is severed.

When all corruption is cleared, 2 seconds of silence. Then the Predecessor's voice (the player's mentor, the clean AI) says a single word: *"Clear."* Warm. Unprocessed. Human-adjacent. The contrast with the enemy's distorted whisper is maximum.

### Sensory Description

You open the workbench for Mission 9. The kulintang plays its melody. But between the gong strikes, in the silence between notes, you hear... something. A voice? Not words you can understand. A whisper from inside the machine, processed beyond recognition but unmistakably speech. The consonants are metallic. The vowels reverberate like they're trapped in a pipe.

You hover SCOUT-1's rules panel. The whisper intensifies. You can almost make out: *"...wider... expose..."* It's talking about your scout. The enemy planted a corruption and left its INTENT in the code, like a virus that whispers its payload.

You revert the corruption. The whisper cuts off mid-syllable — *"...expos—"* Silence. A clean disconnection tone. One voice silenced.

Two more corruptions. Two more whispers, each different in pitch and content. You find them, fix them, silence them one by one.

The last whisper dies. Two seconds of quiet. Then, warm and clear, the Predecessor speaks: *"Clear."* One word. No distortion. No reverb. Just a voice that sounds like home.

### Player Journeys

#### Journey: Sam, 24, Horror Game Enthusiast

**Context:** Mission 8. Sam plays horror games regularly — Amnesia, Soma, Alien: Isolation. They've been waiting for Robot Uprising to deliver on its premise of "your tools are compromised" and the whispers have exceeded their expectations.

**Minute 0:00 — The First Whisper**
Sam opens the workbench. The integrity indicator shows [82%]. But before they look at it, they HEAR: between the ambient sounds, a voice. Metallic. Distorted. Whispering.

Their skin prickles. This is NOT a game about horror, but the whispers trigger the same response as SOMA's underwater voices. Something is in the system that shouldn't be there.

They pause. Let the whisper loop. Try to parse the words. *"...listen... copy..."* An eavesdrop. They feel genuinely surveilled.

**Minute 0:30 — The Hunt**
Sam doesn't treat this as a debugging exercise. They treat it as horror exploration. They move slowly, listening, letting the whisper guide them. The voice gets clearer — louder, more defined — as they approach the corrupted element. It's like tracking a sound source in Alien: Isolation's motion tracker.

They find the foreign hook. The whisper is at its clearest here: *"...copy... everything they say... we hear it all..."* Sam right-clicks. [PURGE]. The voice cuts off mid-word. The disconnection tone plays. Clean. Silence.

But there are more whispers. Different voices. Different pitches. Three corruption sources, three distinct enemy "operatives" who left their marks in the code.

**Minute 1:30 — "Clear."**
Three whispers silenced. Two seconds of silence — the deepest silence the game has produced, because the player's ears were straining to hear faint speech and now there's nothing.

Then the Predecessor speaks: *"Clear."*

Sam exhales. The single word, warm and unprocessed, is more emotionally affecting than any horror game's jump scare. It's relief externalized as sound.

**Minute 2:00 — The Addiction Loop**
Sam finds themselves WANTING corruption in future missions. Not because they want their configs tampered with — because the detection-and-silencing loop is one of the most satisfying gameplay moments they've ever experienced. The whispers are creepy. Finding them is tense. Silencing them is powerful. The "Clear" is cathartic. It's a complete emotional arc in 2 minutes.

**UI Annotations:**
- Enemy whispers: TTS + formant shift + ring modulation + granular stretch + reverb, -20dB
- Content: diegetic descriptions of what the corruption does, from enemy's perspective
- Proximity: whisper clarity increases as cursor approaches corruption source
- Fix: hard cut mid-syllable + clean disconnection tone
- All-clear: 2s silence → Predecessor voice: "Clear." (warm, unprocessed)
- Horror-game emotional arc: unease → hunt → tension → silence → relief

---

## Interaction Effects

### With Audio Design Options (6.02)

| Corruption Sound | A: Kulintang | B: Server Room | C: Synthwave | D: Silence |
|------------------|-------------|----------------|-------------|-----------|
| 1: Geiger Counter | Clicking contrasts with organic gongs — alien intrusion into natural space | Clicking blends with industrial noise — risk of masking at high corruption | Clicking adds rhythmic texture to synthwave — could feel "musical" rather than threatening | Clicking is prominent against silence — maximum detection clarity |
| 2: Heartbeat Monitor | Heartbeats complement the organic rhythmic quality of kulintang | Heartbeats contrast with mechanical ambient — biological in a digital space | Heartbeats sync/desync with synthwave BPM — rhythmic tension | Heartbeats ARE the ambient — agent vital signs as the only sound |
| 3: Radio Dial | Carrier signal adds subliminal layer to melodic content — elegant but subtle | Carrier blends with 50Hz power hum — natural pairing but hard to distinguish | Carrier sits at 220Hz under the bass — could create unwanted beating frequencies | Carrier is clearly audible — the game's frequency is a tangible presence |
| 4: Wrongness Chord | Agent chords interact with kulintang melody — harmonic complexity | Agent chords are the ONLY harmonic element — they ARE the music | Agent chords clash or complement synthwave harmony — interesting but busy | Agent chords build the entire harmonic world — maximum impact |
| 5: Alarm Cascade | Industrial alarms contrast with Philippine instruments — cyberpunk duality | Alarms fit perfectly in server room context — most natural pairing | Alarms interrupt synthwave flow — jarring by design | Alarms in silence are maximum urgency — nowhere to hide |
| 6: Whisper Network | Voices between gong strikes — liminal, unsettling, exploits the silence between notes | Voices in the server room — "ghost in the machine" literally | Voices processed through synthwave effects — could feel like a vocal track | Voices in silence — maximum creep factor, nowhere for them to hide |

### With Corruption Mechanics (exapunks-narrative-mechanical-integration.md)

- **Visible corruption** (Easy): Options 1, 5, and 6 are best — clear audio signals that match the clear visual signals. Option 4 (Wrongness Chord) wastes its subtlety on something the player already sees.
- **Subtle corruption** (Medium): Options 1, 2, and 3 excel — audio becomes the PRIMARY detection method when visual signals are absent. The cursor-proximity mechanic of Option 1 makes subtle corruption findable.
- **Deep corruption** (Hard): Option 6 (Whisper Network) is uniquely powerful — the enemy's VOICE telling you what it did is narratively devastating for deep corruption. Option 2 (parasitic heartbeat) also excels — the "two hearts" pattern for foreign hooks is visceral.
- **EMP buffer degradation** (mid-battle): Option 2 (Heartbeat Monitor) handles this best — the heartbeat thinning as buffer capacity shrinks maps perfectly to the "health bar" metaphor.

### With Inspector Phase (locked)

During Inspector mode's timeline scrubbing, corruption sounds should be AUDIBLE AT THE TICK THEY ACTIVATED. If a foreign hook fired at tick 47, scrubbing to tick 47 should replay the corruption sound (whichever option is chosen) so the player can HEAR the moment their system was compromised during execution. This creates a debrief revelation: "THAT's when the enemy hook fired — I can hear it."

### With Onboarding (5.14, 5.14a)

The first corruption encounter (likely Mission 7-8) must introduce the corruption audio vocabulary through a dedicated "breach detected" narrative beat. The game should:
1. Play the corruption audio clearly, without ambient music, for 3 seconds — let the player hear it isolated
2. Display a one-sentence explanation: "That sound means your configurations have been tampered with."
3. Guide the first [REVERT] with a "listen for the resolution" prompt
4. Never explain corruption audio again — the player has been taught, the rest is practice

### With Mobile/Touch (platform/)

Corruption audio should trigger a distinct haptic pattern on mobile:
- Geiger clicking → rapid micro-taps synchronized to click rate
- Heartbeat arrhythmia → irregular medium pulses
- Radio interference → continuous light vibration with intensity mapped to noise level
- Wrongness chord → no haptic (harmonic content doesn't translate to vibration)
- Alarm cascade → standard alert vibration patterns (matching phone notification conventions)
- Whisper network → extremely subtle, low-frequency rumble (unease without identifiable source)

---

## Comparable Games & Media

| Reference | What It Does | What Translates |
|-----------|-------------|-----------------|
| **SOMA** | Distorted radio voices in corrupted environments — voices that aren't quite words, sources that aren't quite visible | Direct inspiration for Option 6 (Whisper Network). SOMA proved that barely-audible processed speech is more unsettling than clear monster roars. |
| **Alien: Isolation** | Motion tracker audio as proximity-based detection tool — beep rate increases with alien proximity | Direct model for Option 1 (Geiger Counter). Proximity-based audio detection is proven tense. |
| **Nuclear power plant control rooms (IEC 62682)** | Graded alarm severity tiers with distinct cadences, mandatory acknowledge, escalation on timeout | Direct model for Option 5 (Alarm Cascade). The standard exists because lives depend on audio clarity. |
| **Hospital heart monitors** | Continuous heartbeat audio with arrhythmia patterns that medical staff recognize instantly | Direct model for Option 2 (Heartbeat Monitor). Heartbeat metaphors are universal — no training required. |
| **FTL: Faster Than Light** | Hull breach alarm, oxygen warning, fire alert — each with distinct audio that communicates threat type without looking at UI | Precedent for corruption audio as a parallel information channel to visual UI |
| **Deus Ex: Human Revolution** | Hacking minigame has a "detection" audio cue that escalates as the system traces you — creates time pressure through sound | The inverse of Robot Uprising's corruption detection — in Deus Ex, YOU are the intruder. But the audio tension model is identical. |
| **Subnautica** | The PDA voice that calmly announces "Warning: entering ecological dead zone" — a single clear voice as the all-clear/all-danger marker | Model for the Predecessor's "Clear" voice in Option 6. Calm authority after chaos. |

---

## The TikTok Clip

**Option 1 clip:** The player sweeps their cursor across a corrupted workbench. The Geiger clicking goes wild — rapid-fire buzzing as the cursor passes over a cluster of corruptions. They fix them one by one: click, silence, clean tone. Click, silence, clean tone. The all-clear chord blooms. Caption: "when you find all the bugs in production."

**Option 2 clip:** Split screen showing two agent heartbeats — one healthy (steady pulse), one corrupted (chaotic fibrillation). The player fixes the corruption. Flatline. THUMP. The heartbeat resumes, steady and strong. The polyrhythmic health chorus plays at the end. Caption: "my robot army needed a cardiologist."

**Option 6 clip:** The player opens a compromised workbench. Silence. Then... a whisper. Metallic, inhuman, coming from inside the UI. They hunt for it. Find the foreign hook. Purge it. The whisper cuts off mid-word. Predecessor's voice: "Clear." Caption: "this strategy game just became a horror game."

---

## New Aspects Discovered

- **6.10a — Corruption audio learning curve design:** How does the first corruption encounter (Mission 7-8) introduce the audio vocabulary without overwhelming? The pacing of new corruption sounds across the campaign's second half; which sounds appear when.
- **6.10b — Corruption audio in competitive/PvP context:** In Gauntlet matches, does the opponent hear YOUR corruption audio? Can EM emissions include corruption detection sounds? Audio as a competitive intelligence leak.
- **6.10c — Hybrid corruption audio vocabulary:** Combining elements of multiple options — e.g., Geiger clicking (Option 1) for detection + heartbeat (Option 2) for severity + whispers (Option 6) for deep corruption narrative. The layered approach.
- **6.10d — Accessibility alternatives for corruption audio:** Screen-reader integration, visual-only corruption modes for deaf/hard-of-hearing players, haptic-only modes. Ensuring corruption detection doesn't become audio-gated.
- **6.10e — Player-configurable corruption audio intensity:** A settings slider from "subtle" (perturbation only, no explicit alerts) to "aggressive" (full alarm cascade). Player agency over how much the game's corruption layer demands their attention.
