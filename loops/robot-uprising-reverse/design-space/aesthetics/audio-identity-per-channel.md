# 6.02d — Audio Identity Per Named Channel: The Sonic Identicon

## The Design Challenge

In Robot Uprising, channels are named pipes created implicitly when a player types a name into a hook config. A channel called `"enemy-spotted"` exists the moment someone types it. By Mission 7, a veteran might have 6-10 active channels wiring their army together. The question: **can each channel have a unique, procedurally generated audio signature derived from its name string, so players learn to recognize channels by ear?**

This is the **audio identicon** problem. Visual identicons (GitHub, Gravatar) hash a string into a deterministic geometric avatar. We want the same for sound: hash `"enemy-spotted"` → a short, distinctive melodic/timbral motif that plays every time a signal travels that channel. Type the same name on a different playthrough → same sound. Type a different name → different sound.

The locked audio direction (Option A "Kulintang Machine") already maps the babendil to signal delivery — a bright, cutting ping. This aspect explores how that ping can carry **channel identity** information without becoming cacophony.

---

## The Hash-to-Sound Pipeline

### How It Works (All Variations)

1. **Hash the channel name.** `"enemy-spotted"` → MD5/SHA-256 → 32+ hex characters of deterministic entropy.
2. **Parse hash segments into musical parameters.** Different byte ranges map to different sonic dimensions.
3. **Synthesize at runtime via Web Audio API.** Zero samples needed — pure `OscillatorNode` + `BiquadFilterNode` + `GainNode` chains. No audio files, no memory footprint.
4. **Play the motif** every time a signal traverses the channel. Duration: 150-400ms. Volume: scaled by channel traffic density (frequent channels get quieter per-signal to prevent fatigue).

### Parameter Space

The hash provides enough entropy to populate a rich sound space:

| Hash Bytes | Musical Parameter | Range | Perceptual Effect |
|------------|------------------|-------|-------------------|
| 0-1 | **Root pitch** | C3–C5 (24 semitones) | "High" vs. "low" channel |
| 2 | **Interval** | unison, m3, P4, P5, M6 (pentatonic) | Melodic character — warm vs. bright |
| 3 | **Waveform** | sine, triangle, square, sawtooth | Texture — smooth vs. buzzy vs. sharp |
| 4 | **Attack time** | 5ms–80ms | Percussive snap vs. gentle swell |
| 5 | **Decay curve** | 100ms–400ms, linear vs. exponential | Short ping vs. lingering tone |
| 6 | **Filter cutoff** | 400Hz–8kHz | Muffled vs. bright |
| 7 | **Filter resonance** | Q 0.5–8.0 | Flat vs. nasal/ringing |
| 8 | **Detune** | -25¢ to +25¢ | Clean vs. slightly detuned/organic |
| 9 | **Reverb send** | 0%–40% | Dry/close vs. spacious |
| 10 | **Rhythmic pattern** | 1-note, 2-note rising, 2-note falling, 3-note arpeggio | Simple ping vs. melodic fragment |

This gives ~24 × 5 × 4 × 4 × 4 × 16 × 16 × 8 × 5 × 4 = **~39 million** perceptually distinct combinations from 11 bytes. Far more than any player will ever create channels.

### The Pentatonic Constraint

All pitches are quantized to the **pentatonic scale** (locked audio direction uses kulintang, which is pentatonic). This guarantees that any two channels playing simultaneously are harmonically compatible. No dissonance. Even a 10-channel army with overlapping transmissions produces a chord, not a clash.

This is a critical design decision: the pentatonic scale is the harmonic equivalent of a "safe default" — any combination works. Western music uses 12 tones and can produce dissonance; pentatonic uses 5 and cannot. The kulintang ensemble already lives in this space.

---

## Variation A: "The Ping" — Single-Note Identity

### What It Is

Each channel gets a **single synthesized note** — 150-250ms — that plays every time a signal traverses it. The note's pitch, timbre, envelope, and filter character are derived from the channel name hash. It replaces the generic babendil ping from the base audio design.

The simplest version. One channel, one note.

### Sensory Description

**`"enemy-spotted"` channel:** Hash produces a high C5 triangle wave with fast 10ms attack, short 150ms decay, slight filter resonance at 3kHz — a bright, sharp *ting!* like a struck bell, cutting through the mix. Every time a scout broadcasts on this channel, you hear that exact bell.

**`"regroup"` channel:** Hash produces a low G3 sine wave with slow 60ms attack, long 350ms decay, low-pass at 1.2kHz — a warm, round *bwomm* that sits underneath the mix. When the relay forwards a regroup signal, it's a felt hum, not a heard note.

**`"threat-north"` channel:** Hash produces a mid A4 sawtooth with 15ms attack, medium 200ms decay, bandpass resonance — a nasal, insistent *nneep* that demands attention.

The player never configures these sounds. They emerge from the name. But over 10 minutes of play, the player's ear maps the timbres: bell = spotted, hum = regroup, buzz = threat. When you hear the bell followed by the buzz, you know: a scout spotted something, and it triggered a threat assessment. **The sound tells the story before the visuals catch up.**

### Strengths

- **Zero configuration overhead.** Sound happens automatically. No audio settings to manage.
- **Emergent audio storytelling.** Multi-channel signal chains become melodic sequences — Scout broadcasts "spotted" (bell), Relay compresses and forwards on "threat" (buzz), Striker receives on "engage" (different note). The three-note sequence IS the flanking maneuver, audible before visible.
- **Diagnostic without looking.** Experienced players can hear which channels are active without watching the board. "I heard the regroup hum but not the threat buzz — the relay didn't forward."
- **Memory aid.** Naming a channel "scout-alert" doesn't just create a logical connection — it creates a sonic one. The sound becomes part of the name's meaning.

### Weaknesses

- **Collision risk at scale.** With 8+ channels, simultaneous pings blur into a chord. Individual identity is lost in the wash.
- **No player agency.** You can't pick your channel's sound — it's deterministic from the name. Some players will want control.
- **Hash aesthetic lottery.** Some names produce pleasing sounds, others produce unpleasant ones. `"data-relay"` might hash to a gorgeous bell; `"data-relay-2"` might hash to an ugly buzz. This could subtly influence naming decisions.

---

## Variation B: "The Motif" — Multi-Note Melodic Fragment

### What It Is

Each channel gets a **2-4 note melodic phrase** — 300-600ms — derived from the hash. Byte 10 determines the rhythmic pattern (single note, rising pair, falling pair, three-note arpeggio, four-note sequence). The remaining bytes set the starting pitch, interval, timbre, and envelope for each note.

A channel doesn't just *ping* — it plays a tiny melody. `"enemy-spotted"` might be a rising two-note phrase (dah-DAH!). `"all-clear"` might be a descending three-note phrase (doo-dah-dum). Each melody is unique, short, and pentatonic.

### Sensory Description

**A scout broadcasts on `"enemy-spotted"`:** Two quick ascending triangle-wave notes — C4 to E4 — 80ms each with 10ms gap. *ting-TING!* Rising inflection, like a question. Bright, 3kHz resonance.

**The relay compresses and forwards on `"threat-confirmed"`:** Three descending sawtooth notes — A4-G4-E4 — 60ms each, staccato. *nee-nah-nuh.* Nasal, urgent, like a tiny alarm. The descending contour says "settling into certainty."

**The striker receives on `"engage-now"`:** One heavy sine-wave note — G3 — 250ms with slow attack. *BWOMM.* Low, authoritative. The single note says "action, not deliberation."

**The full chain heard in 2 seconds:** *ting-TING! ... nee-nah-nuh ... BWOMM.* Scout saw something → Relay confirmed threat → Striker engages. The three-motif sequence is an audible sentence. A player who's heard this chain 15 times can predict the BWOMM after hearing the nee-nah-nuh — **anticipation through audio.**

### Strengths

- **Richer identity space.** Multi-note motifs are far more distinguishable than single tones. Musical memory is powerful — people recognize phone ringtones from the first two notes.
- **Temporal storytelling.** Signal chains become audible narratives. The motifs play in transmission order with latency gaps, so you HEAR the hop count: fast sequence = short chain, slow sequence = deep architecture.
- **The "channel voice" becomes a character.** Players anthropomorphize channels — "threat-confirmed sounds angry" (descending sawtooth), "all-clear sounds relieved" (rising sine). This is emergent emotional design.
- **Mashup potential.** When two channels fire simultaneously, their motifs interleave into a mini-composition. Random but always harmonically safe (pentatonic guarantee). Sometimes beautiful.

### Weaknesses

- **Duration budget.** 300-600ms per motif means a 3-hop chain takes 1-2 seconds of audio. At 1 second per tick, motifs from one tick may overlap with the next tick's events.
- **Cognitive load for new players.** Hearing 4 different melodic fragments in rapid succession is harder to parse than 4 distinct pings.
- **Hash aesthetic lottery amplified.** A bad rhythmic pattern assignment (e.g., monotone four-note repetition) is more annoying than a bad single ping.

---

## Variation C: "The Instrument" — Persistent Timbral Identity

### What It Is

Instead of a distinct motif per channel, each channel gets a **unique timbre** (instrument voice) that plays the SAME rhythmic pattern (the standard babendil ping from the base audio design). The hash determines waveform, filter character, attack/decay, and harmonics — but NOT pitch or rhythm. Every channel plays the same note pattern; they differ only in HOW they sound.

Think of it as: every channel plays "the same melody on a different instrument." `"enemy-spotted"` is played on a bright bell. `"regroup"` is played on a warm flute. `"engage"` is played on a sharp plucked string. Same rhythm, different voice.

### Sensory Description

**Signal on `"enemy-spotted"`:** The standard babendil ping — but rendered as a bright, shimmery, high-resonance triangle wave with fast attack. Crystal bell.

**Signal on `"regroup"`:** Same ping pattern — but rendered as a round, warm sine wave with slow attack and low-pass filter. Wooden flute.

**Signal on `"engage-now"`:** Same ping pattern — but rendered as a sharp, buzzy sawtooth with zero attack and high harmonics. Plucked metal string.

**All three firing in sequence:** *shimmer ... whooo ... twang.* Same rhythm. Three different textures. The ear groups them by similarity to the original ping but distinguishes by timbre.

### Strengths

- **Easiest to parse under load.** Timbre differences are processed pre-attentively (before conscious awareness). The brain separates audio streams by timbre automatically (auditory scene analysis / the "cocktail party effect"). Players can track 4-5 distinct timbres simultaneously.
- **Lowest cognitive overhead.** No new musical information to process — just "which instrument was that?"
- **Duration-neutral.** Same 150ms ping duration regardless of channel count.
- **Hardest to produce unpleasant results.** Timbre variation within a well-designed range is always acceptable.

### Weaknesses

- **Lower distinctiveness ceiling.** Timbre differences are subtler than melodic differences. With 8+ channels, some timbres will feel similar.
- **Less emotional character.** "That channel sounds like a bell" is less memorable than "that channel plays dah-DAH!"
- **No temporal storytelling.** Without melodic variation, signal chains sound like the same event repeated in different voices, not a narrative.

---

## Variation D: "The Tuning Fork" — Player-Configurable Audio Identity

### What It Is

The hash-to-sound pipeline generates a DEFAULT sound per channel, but the player can **override it** in the channel map panel. A small audio preview widget appears next to each channel name — click to hear the current sound, click-and-hold to open a mini sound designer with 3-5 sliders (pitch, brightness, length, texture, pattern).

Deterministic default + manual override = best of both worlds.

### Sensory Description

**The channel map panel,** currently a read-only auto-generated summary (per locked spec), gains a new column: a tiny speaker icon per channel. Hovering plays a 200ms preview of the channel's current sound. The icon pulses with the waveform.

**Clicking the speaker icon** opens a compact inline editor:
- **Pitch slider** (vertical, 2 octaves, labeled with note names C3-C5, snapped to pentatonic)
- **Texture slider** (horizontal, labeled "Soft ← → Sharp", controlling waveform blend)
- **Length slider** (horizontal, labeled "Short ← → Long", 100ms-500ms)
- **Pattern buttons** (4 icons: single dot, rising dots, falling dots, triple dots)
- **Preview button** (plays the current configuration over the board with spatial audio from where a signal would emit)

A "Reset to Default" button restores the hash-derived sound. Changed sounds show a small pencil icon on the channel map.

**Marcus, 38, DevOps engineer at Mission 8:** He's built a 6-channel relay architecture and finds that `"priority-alert"` and `"sector-update"` hash to similar-sounding timbres. He opens the audio editor for `"priority-alert"` and drags the pitch up, switches the pattern to a rising two-note motif, and cranks the brightness. Now it cuts through the mix — unmistakable. He leaves the other 5 channels at their defaults.

### Strengths

- **Player agency.** Players who care about audio identity can customize. Players who don't can ignore it.
- **Fixes hash collisions.** When two channels sound too similar, the player can manually differentiate them.
- **Deeper audio engagement.** The sound editor teaches oscillator/filter concepts — transferable knowledge to music production and audio engineering.
- **Content creation tool.** Streamers can tune their channels to be more distinctive on stream. Config exports include audio settings.

### Weaknesses

- **Configuration burden.** Another thing to configure in an already config-heavy game.
- **Feature discovery.** Many players will never find or use the audio editor.
- **Config Code complexity.** Audio settings need to serialize into shareable configs.
- **Breaks determinism for spectators.** If two players have the same channel name but different audio configs, spectating/replaying becomes inconsistent.

---

## Variation E: "The Chorus" — Channel Volume Scales with Traffic

### What It Is

The base sound identity (any of A-D above) is combined with a **traffic-adaptive volume and prominence system.** Channels that carry more signals per minute become louder and more present in the mix. Channels that are quiet fade to near-silence. The busiest channel in any given tick becomes the "lead voice" — slightly louder, slightly more reverb, slightly more stereo width.

This creates an **audible network topology.** The channel carrying the most information dominates the soundscape. When a relay compresses and redistributes, you hear the sonic weight shift from many quiet pings to one prominent tone.

### Sensory Description

**Early Mission 5 — Two channels, low traffic:**
`"scout-report"` pings occasionally — soft, gentle, like a distant wind chime. `"engage"` fires rarely — a single low note barely audible.

**Mission 8 — Six channels, heavy traffic:**
`"threat-confirmed"` is ROARING — 4-5 signals per tick, its motif has become a rhythmic loop, a persistent ostinato in the soundscape. `"engage"` punches through occasionally — louder per-signal because it's rare, each ping carrying more weight. `"data-compress"` is a constant background hum — so frequent it's blurred into texture. The three quietest channels (`"sector-2-clear"`, `"patrol-ack"`, `"regroup"`) are whispers, barely there, adding subtle shimmer.

**A relay dies:** Suddenly `"threat-confirmed"` goes silent. The sonic weight vanishes. The absence is deafening — louder than any sound. The player hears the network failure before seeing the red flash.

### Strengths

- **Network topology is audible.** Busy = loud. Broken = silent. The mix IS the network health.
- **Automatic mixing.** No cacophony because volume self-regulates. 10 channels don't produce 10× the noise — the loudest 2-3 dominate while others fade.
- **Emergent drama.** The moment a critical channel goes silent is the most powerful audio event in the game — pure absence.
- **Visceral network legibility.** The locked design wants information overload to be "viscerally legible." Hearing your network hum and then stutter accomplishes this at an animal level.

### Weaknesses

- **Quiet channels become inaudible.** If a critical but low-traffic channel fires once, its ping might be masked by louder channels.
- **Traffic ≠ importance.** The busiest channel isn't necessarily the most important one. Volume-as-importance can mislead.
- **Mixing complexity.** Adaptive mixing interacts with the locked audio design (kulintang, agung tick, dabakan combat). The channel layer competes for sonic space.

---

## Variation F: "The Babel Problem" — When Audio Identity Breaks

### What It Is

Not a variation to implement, but a **failure mode analysis** that applies to all variations above. At what point does channel audio identity fail? What happens when:

- **12+ channels are active simultaneously?** Even with adaptive mixing, the sonic space is saturated. Solution: auto-clustering — channels with similar timbres (nearby hash values) are grouped into "channel families" with a shared base timbre and subtle per-channel variation.
- **A channel name is changed mid-campaign?** The sound changes. Players who learned the old sound are disoriented. Solution: a "migrating" transition — the old sound morphs into the new one over 3-5 signals, giving the ear time to re-learn.
- **Two players in co-op have different audio configs (Variation D)?** The Architect hears a bell for `"threat"`, the Analyst hears a buzz. Disorienting during voice chat. Solution: audio configs are per-config-code, not per-player — shared configs share sounds.
- **A deaf/HoH player cannot hear the audio identity?** Visual equivalent needed: channel-colored waveform icon that pulses with the channel's audio pattern. The icon shape varies with the hash (circle, diamond, triangle, star, hexagon) — a visual identicon paired with the audio identicon.
- **Enemy channels are audible (EM emission mechanic)?** Enemy channels have the same hash-to-sound pipeline but processed through a **distortion filter** — bitcrushed, lower sample rate, slightly detuned. You can hear enemy communications as corrupted, garbled versions of sounds. High-traffic enemy channels become ominous background noise — a wall of distorted pings that tells you the enemy is coordinating heavily even if you can't read the content.

---

## Player Journeys

### Journey: Sofia, 15, First-Time Strategy Player, Manila

**Context:** Mission 4, just learned hooks. Has two channels: `"enemy-spotted"` and `"move-order"`. Playing with headphones on her laptop.

**Minute 0:00 — Plan Phase, Creating a Hook**
Sofia configures her Scout's first hook: trigger ON_SEE_ENEMY, broadcast on... she types `"enemy-spotted"`. As she finishes typing and hits Enter, a soft two-note ascending chime plays — *ting-TING!* — bright, crystalline, in the upper register. She startles slightly. She didn't expect the channel to have a voice. She hovers over the channel name in the channel map panel — the speaker icon pulses and replays the motif. *ting-TING!* She recognizes it. That's `"enemy-spotted"`.

She configures the Striker's hook: listen on `"enemy-spotted"`, action: move toward source. Then a second hook: trigger ON_RECEIVE_ENGAGE, broadcast on `"move-order"`. A different sound plays — a single low, warm tone. *bwooom.* Deeper, rounder, slower. She notes the contrast unconsciously: the alert is sharp and high, the order is deep and authoritative.

**Minute 1:30 — EXECUTE (Sealed Watch)**
The agung hits. Tick 1: the Scout moves. Tick 2: Scout sees an enemy. *ting-TING!* — the "enemy-spotted" chime cuts through the tick-clock percussion. A green flash on the Scout's tile. Sofia's eyes snap to the Scout before she consciously processes why — the sound pulled her attention.

Tick 3: nothing. The 1-tick latency gap. Sofia is learning: there's a pause between the alert and the response. She doesn't know why yet, but the silence AFTER the chime feels significant.

Tick 4: the Striker pivots. *bwooom* — the "move-order" hum confirms the chain completed. The two sounds, separated by two ticks, form a call-and-response: *ting-TING! ... ... bwooom.* Alert, then order. She hears the architecture working.

Tick 7: another enemy spotted. *ting-TING!* again. This time she doesn't startle — she expects it. She's already looking for the green flash.

**Minute 3:00 — Inspector**
She scrubs to Tick 2. Clicks the Scout. The context window shows the enemy observation. She presses Play on the tick — *ting-TING!* plays again, spatialized from the Scout's position. She scrubs to Tick 4. Clicks the Striker. Presses Play — *bwooom.* She's replaying the audio chain in slow motion, correlating sound to data flow.

"Oh. The high one is when it sees. The low one is when it moves." She's mapped channel sound to channel function without anyone telling her. **The audio identity taught her the architecture.**

**Minute 4:00 — Back to Plan**
She creates a third channel: `"all-clear"`. Types the name, hits Enter. A new sound: three descending notes, soft and round. *doo-dah-dum.* Falling contour, gentle. She smiles — it sounds like "all clear" should sound. (It doesn't, of course — it's hash-derived. But the pentatonic constraint makes most sounds feel vaguely appropriate, and confirmation bias does the rest.)

**UI Annotations:**
- Channel name text input: 200ms delay after typing stops → audio preview plays
- Channel map panel: speaker icon per channel, hover → 200ms preview
- Sealed watch: channel motif plays on every signal delivery, spatialized to source unit position
- Inspector: play button per tick replays all audio events for that tick
- Volume: scales with tick speed (0.5× = louder per signal, 2× = quieter per signal)

---

### Journey: Marcus, 38, DevOps Engineer, Berlin, Mission 8

**Context:** Six active channels. Has been playing for 5 hours total. Uses studio monitor speakers. Approaching the game like infrastructure monitoring.

**Minute 0:00 — Plan Phase, Architecture Review**
Marcus opens the channel map panel. Six channels listed with speaker icons:
- `"scout-ping"` — bright bell *ting!*
- `"threat-assess"` — nasal buzzy two-note *nee-NAH*
- `"engage-order"` — low authoritative *BWOMM*
- `"regroup-signal"` — warm descending *doo-dah*
- `"status-report"` — medium clicking *tik-tik-tik*
- `"priority-override"` — sharp ascending *DWEE-DEE!*

He hovers over each one, playing the previews. He's checking his "audio dashboard" — making sure he can distinguish all six. `"status-report"` and `"scout-ping"` sound similar — both are bright and percussive. He considers renaming one but decides to try the battle first.

**Minute 2:00 — Sealed Watch, Heavy Traffic**
The kulintang accelerates. Tick 1-3: reconnaissance phase. *ting! ... ting! ... ting!* — three scout pings, rapid. Then *nee-NAH ... nee-NAH* — two threat assessments layered. The mix is building. Marcus leans forward.

Tick 4: cascade. *nee-NAH* → *BWOMM* → *DWEE-DEE!* Threat assessed, engagement ordered, priority override fired for a second striker. Three channel voices in rapid succession — a three-note descending phrase that he didn't design but recognizes instantly. "There's the flanking pattern." **He identified a multi-agent coordination event by sound alone.**

Tick 6: silence. One of his relays was destroyed. `"threat-assess"` goes quiet. The *nee-NAH* that had been a constant presence in every tick is gone. The mix feels empty, wrong. Marcus knows before looking: Relay-B is dead. The absence of a sound told him.

Tick 8: `"status-report"` is firing rapidly — *tik-tik-tik-tik-tik* — units sending status updates that used to route through the dead relay are now flooding a backup channel. The clickety sound is frantic, loud, insistent. It sounds like panic. It IS panic — the network is compensating for a lost node.

**Minute 3:30 — Post-Battle Realization**
Marcus sits back. "That sounded like an incident." He's mapped the sealed watch audio experience directly to his professional life: the dashboard hum → the alert cascade → the silence of a dead node → the compensatory traffic spike. Robot Uprising's audio layer just gave him a PagerDuty incident, rendered as music.

**Minute 4:00 — Inspector, Audio Forensics**
He scrubs to Tick 6, the relay death. He clicks the Relay-B unit. The decision trace shows the last context window state. He presses Play — the tick's audio plays. He can hear the gap where `"threat-assess"` should have sounded. He scrubs forward one tick — Tick 7 — and the `"status-report"` surge is audible. He's using sound to navigate the timeline, scrubbing until he hears the anomaly.

He opens the channel metrics in the sidebar. Traffic graph for `"threat-assess"` shows a cliff to zero at Tick 6. Traffic graph for `"status-report"` shows a spike at Tick 7. The audio and the graph are telling the same story in different media.

"I need redundant relays." The lesson is immediate and visceral because he HEARD the failure before he analyzed it.

**UI Annotations:**
- Channel map panel: 6 channels with speaker icons, hover preview
- Sealed watch: adaptive mixing — loudest 2-3 channels dominate, others fade
- Relay death: 500ms silence gap in the channel's audio stream (absence as event)
- Traffic spike: per-signal volume decreases but aggregate volume increases (many quiet pings = loud texture)
- Inspector: per-tick audio playback with channel-highlighted waveform scrubber

---

### Journey: Aisha, 14, Manila, Playing on School iPad with AirPods

**Context:** Mission 6, just got factory. Four channels. Plays during lunch break in a noisy cafeteria.

**Minute 0:00 — Naming Channels**
Aisha doesn't use English channel names — she types in Tagalog. `"nakita-kalaban"` (enemy-seen), `"atake"` (attack), `"balik"` (return), `"ayos"` (okay/fixed). Each name hashes to a different sound. `"nakita-kalaban"` gets a cascading three-note motif — *tee-tah-TOH!* — because the longer string hashes to a more complex rhythmic pattern. `"atake"` gets a sharp two-note burst — *DAH-dah!* `"balik"` gets a single warm descending note — *bwooom.* `"ayos"` gets a gentle ascending pair — *doo-DEE.*

She's inadvertently created a **Tagalog audio vocabulary** — her army speaks her language sonically even though the sounds are hash-derived, not linguistically meaningful.

**Minute 1:30 — Sealed Watch, Learning Through Audio**
The cafeteria is loud. AirPods are in but competing with friends' conversations. She can't always watch the screen. But she can HEAR: *tee-tah-TOH!* — enemy seen. She glances down. *DAH-dah!* — attack launched. She smiles. *bwooom* — someone's retreating. She frowns. Her army is talking to her through audio even when she can't give the screen her full attention.

At one point, she hears *tee-tah-TOH!* followed by silence — no *DAH-dah!* The chain broke. She looks at the screen: her relay was destroyed. The absence of the expected attack sound was the alarm.

**Minute 3:00 — Social Audio**
After lunch, she shows her friend Camille. "Listen — *tee-tah-TOH!* means they found one. Then you hear *DAH-dah!* and that means they're fighting." She's TEACHING the audio identity to someone else, using the sounds as vocabulary. The channel names are Tagalog, the sounds are procedural, and the teaching is in Taglish. Three layers of language, one system.

Camille creates her own config with French channel names. `"ennemi-vu"` hashes to a completely different sound — higher, sharper. They compare. "Mine sounds angrier," Camille says. The channels have cultural personality through hash accident.

**UI Annotations:**
- Channel name input: accepts Unicode, hash operates on UTF-8 bytes
- Audio preview: plays on channel creation, replay on hover
- Mobile/touch: long-press channel name for audio preview
- AirPod spatial audio: signal sounds positioned in stereo field relative to unit's board position
- Social: audio motifs become shareable shorthand between players

---

### Journey: Dr. Tanaka, 58, Electrical Engineer, Osaka, Accessibility Testing

**Context:** Mission 7. Moderate hearing loss in high frequencies (presbycusis). Uses gaming headphones with bass boost.

**Minute 0:00 — The High-Frequency Problem**
Dr. Tanaka has configured 5 channels. He hovers over them in the channel map. Two of them — `"recon-alpha"` and `"flank-signal"` — both hash to high-frequency triangle waves above 4kHz. He can barely distinguish them. The hash lottery gave him two channels that live in his hearing loss range.

He notices the accessibility setting: **Audio → Channel Identity → Frequency Floor**. He drags the slider from "Full Range" to "Bass-Friendly" — this remaps the entire pitch space from C3-C5 to C2-C4, shifting all channel sounds down an octave. Now `"recon-alpha"` is a low bell and `"flank-signal"` is a mid-range buzz. He can hear both clearly.

Additionally, he enables **Visual Audio Identity** in accessibility settings. Each channel name in the channel map now shows a small **waveform icon** — not just a speaker, but a mini oscilloscope rendering of the channel's sound. `"recon-alpha"` shows a smooth sine-like waveform. `"flank-signal"` shows a jagged sawtooth. During sealed watch, these waveform icons pulse on units when their associated channel fires — a visual echo of the audio event.

**Minute 2:00 — Combined Audio-Visual**
During sealed watch, he can partially hear the channel sounds (bass-shifted) and simultaneously see the waveform icons pulse on units. The two modalities reinforce: when he misses a quiet audio ping, the visual waveform catches it. When a visual pulse is ambiguous, the audio timbre clarifies. Redundant channels, literally — audio and visual, carrying the same identity.

**UI Annotations:**
- Accessibility: Frequency Floor slider (maps all channels to lower octaves)
- Accessibility: Visual Audio Identity toggle (waveform icons per channel)
- Waveform icons: 16×16px, rendered from same hash parameters, pulse on signal delivery
- Combined mode: audio + visual waveform + channel-colored cell flash (triple redundancy)

---

## Interaction Effects

### × Locked Audio Design (6.02 Option A "Kulintang Machine")
Channel audio identity replaces the generic babendil ping. The babendil timbre becomes the "seed" — all channel sounds are variations of processed babendil (same metallic base texture, varied through synthesis parameters). This maintains sonic coherence with the kulintang ensemble. The agung (tick), dabakan (combat), and gandingan (primitive types) remain fixed; only the babendil layer carries channel identity. The babendil WAS the notification chime; now it's a FAMILY of notification chimes.

### × Hook Visualization (3.10)
Audio identity pairs with the locked "Subway Map" lane visualization during Plan. Each lane already has a channel color; now each lane also has an associated sound. The channel map panel becomes a **color-and-sound legend**. During sealed watch, the "Lightning Flash + Pulse Wire" visualization triggers simultaneously with the audio motif — the player sees a colored flash AND hears a distinctive tone. Dual-coding theory predicts this pairing dramatically improves memory.

### × EM Emission Mechanic
Every channel audio ping is also an EM emission. Deeper architectures with more channels produce a richer, more complex soundscape — but also more noise for enemies to detect. **The beauty of your network IS its vulnerability.** A perfectly tuned 8-channel symphony is also a loud electromagnetic signature. The player must choose: acoustic richness (many channels, distinctive sounds, beautiful sealed watch) vs. stealth (few channels, sparse pings, empty soundscape). Stealth Doctrine (5.09a) configs sound EMPTY — near-silence during sealed watch — which is itself a powerful aesthetic statement.

### × Inspector Decision Trace (4.04b)
In the Inspector, scrubbing the timeline replays audio events at reduced speed. Each tick's audio layer is isolatable — a "solo channel" button lets the player hear ONLY one channel's events across the full timeline. This is the audio equivalent of highlighting a single subway line. "Solo `threat-assess`" → hear every threat signal → identify the gap at Tick 6 → find the relay death.

### × Signal Latency (Locked: 1 tick per hop)
The 1-tick-per-hop latency means a 3-hop signal chain produces 3 audio events spaced 1 second apart. The spacing IS the latency, made audible. A direct Scout→Striker chain sounds like: *ting! ... BWOMM* (1-second gap). A Scout→Relay→Relay→Striker chain sounds like: *ting! ... nee-nah ... bzzz ... BWOMM* (3-second chain). **Latency is music.** The more hops, the longer and more complex the melodic phrase. Players can HEAR whether their architecture is fast or slow.

### × Context Overload (Locked: 1-tick stun)
When a unit's context window overflows and it stuns, the audio event should be distinctive: a **channel cacophony** — all channel motifs that were trying to deliver simultaneously play at once, overlapping chaotically, then cut to a sharp silence with a low thud ("data hitting the floor" from base audio design). The cacophony-then-silence IS the overload, rendered sonically. Experienced players will hear the cacophony building and think "that unit is about to stun" BEFORE it happens — the audio foreshadows the overload.

### × Mobile/Touch (6.07)
On mobile with speakers (no headphones), channel audio identity competes with environment noise. Solution: haptic pairing — each channel's audio identity has a paired vibration pattern. `"enemy-spotted"` = two quick pulses. `"engage"` = one long pulse. In noisy environments, players feel the channels through haptics even if they can't hear them. The audio-haptic pairing uses the same hash — deterministic from channel name.

### × Co-op (6.06c Joy-Con Split)
In co-op mode, the Architect player hears channel sounds from the Plan phase (previews during configuration). The Analyst player hears them during Inspector (replay and forensics). During Sealed Watch (shared screen), both hear the full audio layer. The shared audio vocabulary becomes part of co-op communication: "I heard the regroup sound but it was late — check the relay at Tick 5."

### × Content Creation / Streaming (6.04)
Channel audio identity is inherently clippable. A perfectly executed 5-channel cascade that eliminates an enemy base produces a unique melodic sequence that will never repeat identically (different channel names = different sounds). Every player's "victory song" is unique. Streamers can narrate using channel sounds: "Listen for the bell — that's the scout alert — and then the buzz — that means the threat was confirmed." Audio becomes a storytelling language for content creators.

---

## Comparable Games and Media

### Spore (2008) — Creature Audio Procedural Generation
Spore used **libpd** (embeddable Pure Data) to generate creature vocalizations from creature characteristics at runtime. Each creature's physical design (limb count, mouth shape, body mass) mapped to audio parameters. This is the closest game precedent: deterministic audio identity from game-state parameters. Robot Uprising's channel-name-to-sound pipeline is simpler (hash to oscillator params) but conceptually identical.

### No Man's Sky — Procedural Everything, Including Sound
65daysofstatic's adaptive soundtrack layers musical elements based on planetary biome, time of day, and player activity. The VocAlien Wwise plugin generates alien vocalizations from creature parameters. Proves that procedural audio at scale works in shipping games on the Web Audio API's spiritual ancestor.

### Sonic-Hash (jQuery Plugin) — Audio Identicon for Passwords
The most direct technical precedent: Sonic-Hash (by Mattt) takes a password string, computes its MD5 hash, and synthesizes a pentatonic melody from the hash bytes. Every time you type the same password, you hear the same tune. If you mistype, the tune changes. Proves the concept works — users learned their password melodies within 2-3 sessions. Robot Uprising channels would benefit from the same rapid learning curve.

### Slack / Discord / Teams — Notification Sound Fatigue
The anti-reference. All channels share one notification sound. After 100+ notifications, the sound becomes meaningless noise. Robot Uprising's per-channel audio identity is explicitly designed to PREVENT this: each channel sounds different, so each notification carries information. The contrast with Slack's single-sound model is a core design argument.

### GitHub / Gravatar Identicons — Visual Hash Identity
The visual precedent. Hash a string → generate a deterministic geometric avatar. Universally understood, zero configuration, automatic uniqueness. The audio version should feel equally natural — "of course each channel sounds different, just like each GitHub user looks different."

### Factorio — Inserter/Belt Sound Design
Factorio's machine sounds are procedural-feeling but actually sample-based. The key lesson: Factorio players report that they can "hear" when a production line is broken because the rhythm changes. A missing belt click or inserter swing disrupts the expected pattern. Robot Uprising's channel sounds should aspire to this: the regular rhythm of a working network, disrupted by failure.

### Into the Breach — Audio Restraint
Into the Breach uses VERY few sounds. Each one carries enormous weight because the sonic space is sparse. Channel audio identity should follow this philosophy for Stealth Doctrine configs: few channels = few sounds = each one precious. The opposite of cacophony.

---

## The TikTok Clip

**"My Army Has a Voice"** — 15-second clip, split screen. Left side: the Plan screen, where the player types channel names one by one, each producing a unique sound preview. Right side: the Sealed Watch, where those same sounds play in a cascade as a coordinated attack unfolds. The visual: a Scout spots an enemy → *ting-TING!* → Relay processes → *nee-NAH* → Striker engages → *BWOMM* → enemy eliminated → dabakan crack. The three channel sounds form a melodic phrase that builds to the kill. Caption: "I didn't compose this. I just named the channels." The implication: **the player accidentally created music by building an information architecture.**

**Alt clip: "When the Relay Dies"** — full cacophony of a working 6-channel network, then the relay goes down, and one by one the sounds drop out until silence. The visual: units standing still, context windows overflowing, sparking. Caption: "You can hear when the architecture breaks." The drama IS the silence.

---

## Recommendation

**Variation B ("The Motif") + Variation E ("The Chorus") + accessibility from Variation D ("The Tuning Fork").**

- Default: hash-derived 2-4 note melodic fragments per channel (Variation B) — rich identity, temporal storytelling, emergent musicality.
- Traffic-adaptive mixing (Variation E) — prevents cacophony, makes network topology audible.
- Accessibility override (from Variation D) — frequency floor slider, visual waveform identicons, player-configurable override for hash collision resolution.
- Pentatonic constraint — guarantees harmonic safety under all channel combinations.
- Deterministic from name — zero configuration required, same name = same sound across all players.

This creates a system where the player's information architecture IS a musical composition, composed not by choosing notes but by choosing names and wiring channels. The sealed watch becomes a performance of the player's design — heard as well as seen.

---

## New Aspects Discovered

- **6.02d-i — Channel sound collision resolution:** When two channel names hash to perceptually similar sounds (within 2 semitones + same waveform), automatic detection and nudge-to-differentiate; "these channels sound similar — rename one?" vs. silent auto-offset; the collision probability math and when it becomes a real problem (>8 channels)
- **6.02d-ii — Enemy channel audio as intelligence gathering:** Player hears distorted versions of enemy channel sounds through EM detection; recognizing enemy channel patterns through audio before visual confirmation; "I heard their attack signal" as advanced gameplay; audio reconnaissance as a Scout skill variant
- **6.02d-iii — Channel sound evolution across campaign:** Should channel sounds subtly evolve as the player's architecture matures? A channel used for 100+ signals could develop richer harmonics, longer decay, or added reverb — "worn in" like a real instrument; channels as living audio entities vs. deterministic consistency
- **6.02d-iv — Audio identity in Config Code exports:** How channel sounds serialize into shareable configs; when importing someone else's config, do you hear THEIR channel sounds or YOUR hash of their names? Deterministic hash = same sounds everywhere; custom overrides = sound divergence; social implications for co-op and streaming
- **6.02d-v — The "silent channel" as stealth design:** A player who deliberately names channels to hash to minimal/quiet sounds (short decay, low volume, sine wave); "sound hacking" as metagame; interaction with EM emission mechanic where quieter sounds = lower detection; the emergent strategy of naming channels for their sonic stealth properties rather than their semantic meaning
