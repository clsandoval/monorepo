# 6.02a — Dynamic Music Layering Implementation in Pixi.js/Web Audio

## The Design Challenge

The Kulintang Machine audio direction (6.02) establishes a game-state-driven music system where kulintang gong voices enter and leave the mix as units occupy board columns, the agung marks tick boundaries, and the babendil signals hook transmissions. The Topology Chord (1.08c-ii) adds an emergent ambient harmonic layer from aggregate channel activity. The question this aspect addresses is: **how do you actually build this in a browser?** What Web Audio API architecture can synchronize music layers to a deterministic tick scheduler with sub-frame latency, scale to 14+ simultaneous units with overlapping signals, and run on a budget Android phone without audio dropouts?

This is "The Layering Engine" — the technical substrate that makes the Kulintang Machine possible.

---

## Option A: "The Howler Stack" — Sample-Based Layering via Howler.js

### How It Works

Howler.js is the most popular browser audio library (~35K GitHub stars). It abstracts Web Audio API behind a simple play/stop/fade interface. Each music layer is a pre-rendered audio loop:

- **Layer 0 — Sub-bass drone:** A continuous 2-bar loop at mission BPM, always playing, volume-controlled.
- **Layers 1-8 — Column gongs:** Eight pre-recorded kulintang voice loops, one per board column (A-H). Each loop is tempo-matched. When a unit occupies column C, `columnC.fade(0, 0.8, 200)` brings it in over 200ms.
- **Layer 9 — Kick drum:** Enters on EXECUTE, exits on seal-break. `kick.play()` at Sealed Watch start.
- **Layer 10 — Agung tick:** One-shot sample triggered by the tick scheduler.
- **Layers 11-14 — Signal/combat/overflow stingers:** One-shot Howler sprites triggered by game events.

**Strengths:**
- Dead simple API. `const gongC = new Howl({ src: ['gong-c.webm'], loop: true }); gongC.play(); gongC.fade(0, 1, 200);`
- Battle-tested on mobile browsers. Handles iOS AudioContext unlock ceremony automatically.
- Pre-rendered loops guarantee audio quality — recorded from real kulintang samples, mastered properly.
- Library size: ~12KB gzipped.

**Weaknesses:**
- **Quantization to loop boundaries.** When a unit enters column C mid-loop, the gong voice fades in at an arbitrary loop position. If the loop is 2 bars (4 seconds at 120 BPM), the new voice might enter off-beat. The Kulintang Machine demands that gong entries feel rhythmically intentional, not random.
- **No tick synchronization.** Howler uses `requestAnimationFrame` internally, not the deterministic tick scheduler. At 2x speed (0.5s per tick), audio events may drift by up to 16ms (one display frame) from visual events. Perceptible as a subtle desync — the agung hits slightly before or after the board snaps.
- **Sample file weight.** Eight column loops at ~30s each (to avoid audible loop points) × 128kbps WebM ≈ 240KB per loop × 8 = ~1.9MB. Plus stingers, drone, kick = ~2.5MB total audio payload. Acceptable for desktop; marginal for mobile cold-start.
- **No procedural synthesis.** The hash-to-sound pipeline (6.02d) for channel identicons requires raw Web Audio API oscillators. Howler can't create new timbres at runtime. You'd need a parallel Web Audio system for channel pings alongside Howler for music, doubling the audio architecture complexity.
- **No AudioWorklet access.** Advanced processing (real-time compression, spatial panning per grid position, adaptive ducking) requires AudioWorklet, which Howler doesn't expose.

### Verdict

Howler.js works for a simplified version of the Kulintang Machine where layers are pre-composed loops fading in and out. It fails for the full vision where gong entries are tick-synchronized, channel pings are procedurally synthesized, and the mix adapts dynamically to battlefield density. **Suitable for a prototype; insufficient for the shipped game.**

---

## Option B: "The Tone.js Orchestra" — Scheduled Synthesis via Tone.js

### How It Works

Tone.js is a Web Audio framework built for music applications (~13K GitHub stars). It provides a Transport (master clock), Instruments (synthesizers, samplers), Effects (reverb, compression), and Scheduling (exact-time event triggers).

**Architecture:**

```
Tone.Transport (master clock at mission BPM)
  ├── Tone.Sampler (kulintang multi-sample instrument)
  │     └── 8 mapped gong samples, velocity-sensitive
  ├── Tone.MembraneSynth (agung — deep pitched membrane)
  ├── Tone.MetalSynth (babendil — bright metallic)
  ├── Tone.NoiseSynth (dabakan — filtered burst)
  ├── Tone.Sequence (column patterns — per-column rhythmic loops)
  ├── Tone.Loop (sub-bass drone)
  └── Tone.Channel × 14 (per-source mixer with panning/volume)
        └── Tone.Compressor (master bus)
              └── Tone.Destination
```

**Tick synchronization:** The deterministic game tick scheduler fires events into Tone.js using `Tone.Transport.scheduleOnce(callback, "+0.01")`. The "+0.01" provides a 10ms lookahead buffer, allowing the audio thread to schedule precisely without glitching. The game tick sets a flag → Tone.Transport's next quantized beat triggers the audio event. Result: audio and visual events are synchronized to within ~5ms.

**Gong entry quantization:** When a unit enters column C, the gong voice doesn't enter immediately — it waits for the next strong beat position: `Tone.Transport.scheduleOnce(() => columnC.start(), Tone.Transport.nextSubdivision("4n"))`. The gong enters on the next quarter note, making every layer addition feel musically intentional. If the current beat IS a quarter note, entry is nearly instant.

**Procedural channel pings:** Tone.js synthesizers generate the hash-to-sound pipeline natively. `const ping = new Tone.Synth({ oscillator: { type: hashWaveform }, envelope: { attack: hashAttack, decay: hashDecay } }); ping.triggerAttackRelease(hashNote, hashDuration);` — one line per channel ping, fully procedural, zero sample files.

**Strengths:**
- Tick-synchronized audio via Transport scheduling. The game clock and audio clock share a quantization grid.
- Procedural synthesis for channel identicons — no separate audio system needed.
- Built-in effects chain (reverb, compression, EQ) for adaptive mixing.
- Handles iOS AudioContext resume automatically.
- Rich community of music-web developers.

**Weaknesses:**
- **Bundle size.** Tone.js is ~150KB minified + gzipped. For a game targeting 355KB initial payload (per 8.04e), this is 42% of the budget on audio alone. Tree-shaking helps but Tone.js modules are tightly coupled — importing `Tone.Sampler` pulls in most of the framework.
- **CPU overhead.** Each `Tone.Synth` instance maintains an oscillator graph. 14 units × 2-4 hook slots × concurrent channel pings = potentially 20-30 active synthesizer voices during peak Sealed Watch. On a Snapdragon 680 (budget 2024 Android), this taxes the audio thread and may cause dropouts at 2x speed.
- **Transport drift risk.** Tone.Transport uses `AudioContext.currentTime` as its source of truth, but the game's deterministic tick scheduler uses `performance.now()` or a frame counter. These clocks can drift by 1-3ms per minute. Over a 60-tick battle, cumulative drift could reach 60-180ms — enough for the agung to hit noticeably before the board snaps. Mitigation: resync Transport to game clock every 10 ticks via `Tone.Transport.seconds = gameClockSeconds`.
- **No AudioWorklet.** Tone.js (as of v15) uses ScriptProcessorNode internally for some effects, which is deprecated and runs on the main thread. Custom AudioWorklet integration is possible but defeats the purpose of using the framework.

### Verdict

Tone.js is the strongest option for the Kulintang Machine. It solves tick synchronization, procedural synthesis, and adaptive mixing in a single framework. The bundle size concern is real but manageable via code-splitting (load Tone.js only when audio is first needed, not on initial page load). **Recommended as the primary audio framework with careful performance budgeting.**

---

## Option C: "The Bare Wire" — Raw Web Audio API with Custom Scheduler

### How It Works

Skip all frameworks. Build the audio engine directly on `AudioContext`, `OscillatorNode`, `GainNode`, `AudioBufferSourceNode`, and `AudioWorkletNode`.

**Architecture:**

```
AudioContext
  ├── TickScheduler (AudioWorkletNode — runs on audio thread)
  │     ├── Receives game tick events via MessagePort
  │     └── Schedules audio events at exact AudioContext.currentTime + offset
  ├── KulintangSampler (AudioBufferSourceNode pool)
  │     └── 8 pre-decoded AudioBuffers, gain-controlled per column
  ├── AgungSampler (AudioBufferSourceNode, one-shot per tick)
  ├── ChannelPingSynth (OscillatorNode + BiquadFilterNode per channel)
  │     └── Created on demand, pooled, parameters from hash
  ├── MixBus (GainNode tree)
  │     ├── MusicBus (drone + columns + agung)
  │     ├── SFXBus (combat + overflow + movement)
  │     ├── SignalBus (channel pings + babendil)
  │     └── AmbienceBus (EM hum + terrain)
  └── MasterCompressor (DynamicsCompressorNode)
        └── AudioContext.destination
```

**The TickScheduler AudioWorklet** is the key innovation. It runs on a dedicated audio thread, not the main thread. The game's deterministic scheduler sends tick events via `MessagePort.postMessage({ tick: 14, events: [...] })`. The AudioWorklet processes these in its `process()` callback — which runs every 128 samples (~2.9ms at 44.1kHz) — and schedules audio events using the audio clock directly. This eliminates the main-thread→audio-thread latency (~3-16ms via setTimeout/rAF) that plagues both Howler and Tone.js.

**Latency analysis:**
- Message from main thread to AudioWorklet: ~0-3ms (one process() cycle)
- AudioWorklet schedules `source.start(audioCtx.currentTime + 0.005)`: adds 5ms lookahead
- Total: 5-8ms from game event to audio output
- At 1 tick/second, this is imperceptible. At 2x speed (0.5s/tick), still well under human perception threshold (~20ms for synchronization).

**Gong column layering:** Eight `AudioBufferSourceNode` instances, each connected through a dedicated `GainNode`. Gain is 0.0 when no unit occupies the column, ramped to target volume over 150ms (`gainNode.gain.linearRampToValueAtTime(targetVol, audioCtx.currentTime + 0.15)`). No loop quantization needed because each gong voice is a continuously playing loop — it's always "in time" since all loops share the same start point and tempo.

**Strengths:**
- **Minimum latency.** AudioWorklet scheduling provides the tightest possible sync between game state and audio. No framework abstraction overhead.
- **Minimum bundle size.** Zero dependencies. The entire audio engine is ~8-12KB of custom JavaScript. Fits the 355KB initial payload budget trivially.
- **Maximum control.** Every node, every parameter, every timing is hand-tuned. No fighting framework opinions.
- **AudioWorklet enables advanced processing.** Real-time spatial panning per grid position, priority-based ducking, EM noise generation — all implementable as custom AudioWorklet processors.
- **Pooling and recycling.** Object pools for `OscillatorNode` and `AudioBufferSourceNode` instances avoid GC pressure during Sealed Watch when dozens of events fire per tick.

**Weaknesses:**
- **Implementation cost.** No free effects (reverb, compression, EQ must be hand-built or use ConvolverNode + DynamicsCompressorNode). Scheduling logic that Tone.js provides in one line requires ~200 lines of custom code.
- **AudioWorklet browser support.** Chrome 66+, Firefox 76+, Safari 14.1+. Edge cases: Safari's AudioWorklet had bugs until Safari 15.4 (2022). On iOS Safari < 14.1, falls back to ScriptProcessorNode (main thread, higher latency). As of 2026, this covers ~97% of browsers — acceptable.
- **iOS AudioContext ceremony.** Must handle `AudioContext.resume()` on first user gesture. No framework handles this automatically — need a manual touch/click handler.
- **No community examples for game audio specifically.** Most AudioWorklet examples are music production tools. Game-audio patterns (event-driven, pooled, state-synchronized) must be invented from scratch.
- **Debugging difficulty.** Chrome DevTools Web Audio inspector helps, but AudioWorklet code runs off-main-thread and is harder to debug than main-thread Tone.js code.

### Verdict

The Bare Wire approach delivers the best latency, smallest bundle, and most flexibility, at the cost of significant implementation effort. For a game where audio is a core mechanic (not background music), the investment is justified. **Recommended as the long-term architecture, with Tone.js as a prototyping tool to validate the musical design before porting to raw Web Audio.**

---

## Option D: "The Hybrid Ladder" — Tone.js Prototype → Bare Wire Ship

### How It Works

Use Tone.js during development (missions 1-5 prototyping) to iterate rapidly on the Kulintang Machine musical design — gong tunings, rhythmic patterns, transition timing, channel ping aesthetics. Once the musical design is locked, port the audio engine to raw Web Audio API + AudioWorklet for the shipped game.

**Porting scope:** The Tone.js prototype establishes exactly which nodes, parameters, and scheduling patterns are needed. The port becomes a well-scoped engineering task rather than an open-ended audio design problem.

**Milestones:**
1. **Prototype (Tone.js):** Plan phase ambient + column gong layering + agung tick + basic stingers. ~2 days.
2. **Sealed Watch (Tone.js):** Tempo acceleration + channel pings + combat sounds + overflow audio. ~2 days.
3. **Inspector (Tone.js):** Granular drone + scrubber sonification + buffer chord. ~1 day.
4. **Lock musical design.** Capture every parameter: pitches, timings, envelopes, effect settings.
5. **Port to Bare Wire.** AudioWorklet scheduler + AudioBuffer pool + OscillatorNode pool + DynamicsCompressor. ~4-5 days.
6. **Performance test on budget Android.** Target: zero audio dropouts at 2x speed with 14 units and 8 active channels.

### Verdict

**This is the recommended approach.** It eliminates the false tradeoff between creative iteration speed and shipped performance.

---

## Player Journeys

### Journey: Dante, 31, Audio Programmer at an Indie Studio in Manila

**Context:** Dante is evaluating Robot Uprising's audio implementation for a GDC talk on browser-based game audio. He's playing Mission 7 with Chrome DevTools Web Audio panel open alongside the game.

**Minute 0:00 — Plan Phase, Monitoring the Audio Graph**
Dante opens the game and the Web Audio inspector. He sees the AudioContext graph: a master DynamicsCompressorNode fed by four GainNode buses (Music, SFX, Signal, Ambience). The Music bus has eight parallel chains — each a looping AudioBufferSourceNode through a GainNode. Six of the eight gain values read non-zero; two columns are unoccupied. The sub-bass drone is a single OscillatorNode (sine wave, 55Hz) through a lowpass BiquadFilterNode. Total active nodes: 23. He nods — lean graph, no unnecessary complexity.

**Minute 0:45 — Blueprint Editing, Watching Node Creation**
He opens the Striker blueprint and toggles the "engage" skill. The audio inspector flashes — a new OscillatorNode appears, plays a 200ms ascending tone (C4→E4), then disconnects. It was created from a pool, used, returned. No garbage collection spike. He toggles a hook and watches the same pattern: OscillatorNode from pool, 300ms descending tone, returned. The pool size is 4 pre-allocated nodes. He writes in his notes: "Event-driven oscillator pool. Smart."

**Minute 2:00 — EXECUTE, Stress-Testing the Audio Thread**
He hits EXECUTE. The audio graph transforms: the eight column gains all ramp up over 150ms. A new AudioBufferSourceNode appears for the kick drum loop. The agung is a one-shot buffer, scheduled via the AudioWorklet message port — he can see the MessagePort traffic in the DevTools performance panel. Each tick fires exactly one message: `{ tick: N, events: [...] }`. The AudioWorklet processes it in the next 128-sample block.

Tick 5: three channel pings fire simultaneously. Three OscillatorNodes from the pool activate, play their 200ms motifs, return. Peak concurrent voices: 8 columns + 1 kick + 1 agung + 3 pings + 1 drone = 14 nodes. CPU audio thread usage: 3.2%. He's impressed — on his M2 MacBook this is nothing, but he mentally projects to a Snapdragon 680: probably 18-22%, well within budget.

Tick 12: buffer overflow event. A new OscillatorNode spawns with a rising frequency ramp (2kHz→6kHz over 500ms) — not a sample, pure synthesis. The DynamicsCompressorNode kicks in, ducking the music bus by 3dB to make room. He can see the compressor's gain reduction meter moving in real time. The overflow whine cuts through the mix without clipping. After 500ms, a one-shot sample plays (the "thud" of evicted data), and the compressor releases.

**Minute 4:00 — Inspector, Observing Granular Synthesis**
The seal breaks with the massive agung sample. Inspector loads and the audio graph simplifies: column loops fade to zero, kick stops, drone pitches down. New nodes appear: eight sustained OscillatorNodes at very low frequencies (0.5-2Hz LFO) modulating the amplitude of eight GainNodes that feed the reverb ConvolverNode. This is the granular drone — stretched gong timbres reimplemented as modulated reverb tails. Elegant. Total node count drops to 12. CPU: 1.8%.

**Minute 5:00 — Verdict**
Dante closes DevTools. The audio architecture is production-quality for a browser game. The AudioWorklet scheduler eliminates the latency problems he's seen in every Howler.js game. The oscillator pool prevents GC spikes during Sealed Watch. The compressor handles peak density without clipping. He titles his GDC slide: "The Kulintang Engine: Game-State-Driven Music in 12KB of Web Audio."

**UI Annotations:**
- AudioWorklet tick message: 128-sample processing cadence (~2.9ms at 44.1kHz)
- Oscillator pool: 4 pre-allocated, expandable to 8 under load
- Master compressor: threshold -18dB, ratio 4:1, attack 10ms, release 200ms
- Column gain ramp: 150ms linearRampToValueAtTime
- Peak concurrent nodes: ~14-18 during dense Sealed Watch


### Journey: Mika, 14, Student in Manila Playing on a Budget Redmi Phone

**Context:** Mission 5, first factory mission. Playing on mobile data during a jeepney ride. Phone: Redmi Note 12 (Snapdragon 685, 4GB RAM). Chrome Android.

**Minute 0:00 — Plan Phase, Audio Initializes**
Mika taps the game after a loading screen. The first tap triggers `audioContext.resume()` — a necessary gesture for mobile browsers. A soft kulintang melody starts. On her phone's single speaker, the sub-bass drone is barely audible (phone speakers roll off below ~200Hz), but the gong voices are bright and clear. She's placed units in columns A, C, and E — three gong voices layer in a consonant triad. The melody sounds simple and pleasant through the tiny speaker.

She opens the Striker blueprint. Config change sounds play cleanly — the ascending skill toggle, the descending hook wire. No crackling, no dropout. The audio engine is running at the "mobile" quality tier: sample rate 22.05kHz (not 44.1kHz), mono output (not stereo — no spatial panning on a single speaker), reverb ConvolverNode replaced with a simple delay+feedback chain (saving ~2MB of impulse response memory).

**Minute 1:30 — EXECUTE, Testing Mobile Audio Under Load**
She taps EXECUTE. The agung hits — through the phone speaker it sounds like a deep bell rather than a chest-vibrating gong, but still impactful. The kick drum loop starts. The phone vibrates on each tick (haptic integration from 6.06a). Even when audio is thin on the tiny speaker, the haptic pulse carries the rhythmic information.

Tick 8: five signals fire simultaneously. On desktop, five distinct channel pings would create a rich harmonic cluster. On mobile, the audio engine applies aggressive voice limiting: maximum 3 simultaneous oscillators for channel pings, prioritized by recency. Two of the five pings are dropped. She doesn't notice — the three that play create a sufficient "communication happening" impression. The dropped pings are logged for Inspector playback at full fidelity.

Tick 14: buffer overflow. The rising whine plays through the phone speaker as a sharp, attention-grabbing squeal. On phone speakers, the 2kHz-6kHz range is actually MORE prominent than on desktop monitors (phone speakers have peak sensitivity around 3-4kHz). The overflow event is louder on mobile than intended — the audio engine applies a -3dB mobile-specific gain offset on overflow sounds to compensate.

**Minute 3:00 — Audio Survives Interruption**
A LINE notification sound fires. Android briefly ducks the game audio. The AudioContext enters "interrupted" state. When the notification clears, `audioContext.resume()` fires automatically via the visibility change handler. The kulintang loops continue from their current position — they were looping in the AudioContext's timeline even while ducked. No audible glitch. The agung fires on the next tick as if nothing happened.

**Minute 4:00 — Inspector on Mobile**
The granular drone is thin on the phone speaker but the ceramic-pop unit inspection sounds are crisp and tactile. She scrubs the timeline — each tick boundary produces a light haptic buzz that substitutes for the desktop-only timeline scrub drone pitch variation. The buffer slot chord (occupied slots humming at different pitches) plays clearly; she can hear four distinct tones in the Scout's buffer at Tick 8.

**UI Annotations:**
- Mobile quality tier: 22.05kHz mono, simple delay reverb, 3-voice polyphony limit for pings
- AudioContext resume on first tap and on return from background
- Haptic substitution for bass frequencies below speaker capability
- Voice priority: most recent events win when polyphony limit exceeded
- Mobile gain offsets: +0dB for low frequencies (inaudible anyway), -3dB for 2-6kHz range (phone speaker peak)


### Journey: Dr. Keiko, 67, Retired Music Professor in Kyoto, First Strategy Game

**Context:** Mission 2, learning hooks. Hearing aids (bilateral, moderate high-frequency loss above 4kHz). Playing on a laptop with external speakers.

**Minute 0:00 — Plan Phase, Appreciating the Pentatonic Foundation**
Dr. Keiko hears the kulintang melody and recognizes the scale immediately — Indonesian slendro, or more precisely, Maguindanao kulintang tuning. The intervals are not equal-tempered; they sit between Western semitones in a way that sounds both familiar (she's studied gamelan) and alien (this is electronic, processed, reverberating in ways bronze gongs don't). She adjusts her hearing aid volume. The melody is centered in the 500Hz-3kHz range — comfortably within her aided hearing range. The high-frequency shimmer when she enters the blueprint editor is faint for her; she relies on the visual mode indicator (the workbench border glow) more than the audio cue.

She places a Scout. A new gong voice enters on the next quarter note — she perceives the quantized entry as musically correct, not delayed. "Good design," she murmurs. "The entry doesn't interrupt the phrase." She adds a Relay in column F. The two gong voices create an interval she identifies as approximately a perfect fourth — the most stable interval in pentatonic tuning. The harmony is inherently peaceful.

**Minute 1:00 — Configuring a Hook, Hearing the Channel Preview**
She types "patrol-report" as a channel name. The autocomplete plays a preview of the channel's sonic identicon — a 300ms motif at roughly A3, triangle waveform, moderate attack. She can hear it clearly. She tries a different name: "danger-alert." This one is higher, sharper, sine-wave based. She compares them, decides she prefers the first name partly because of its sound. "The name becomes the voice," she thinks. "Students would love this — function determining form."

**Minute 2:30 — EXECUTE, Experiencing the Three-Phase Audio Arc**
The agung strikes. Deep. Resonant. Her hearing aids handle the low frequencies well — the agung sits at ~110Hz, within her unaided range. The acceleration from 70 BPM to 120 BPM is dramatic. She recognizes the compositional technique: augmentation to diminution, a Baroque accelerando mapped to game state.

Each tick, the agung marks time. Between ticks, she hears the babendil pings of signal transmission — bright, metallic, at ~2kHz. These are at the edge of her aided range. She turns up her hearing aid volume by one click. The pings come through. She notices they have different timbres — her Scout's "patrol-report" channel has its triangle-wave motif. She can track which channel is transmitting by ear, though she relies equally on the colored signal lines on the board.

**Minute 4:00 — The Seal Break**
The massive agung strike. She closes her eyes. The 4-second decay is a masterclass in acoustic physics — she hears the fundamental, the second partial, the shimmer of the upper partials dying away at different rates. The transition from Sealed Watch energy to Inspector calm is carried entirely by this one sound. It works.

**Minute 4:30 — Inspector, Analytical Listening**
The granular drone is beautiful. She recognizes the technique — time-stretching individual gong strikes into sustained tones. The result sounds like a metallophone being bowed rather than struck. When she clicks a unit, the ceramic pop is satisfying — a clear UI feedback sound distinct from the musical layer. The buffer slots humming at different pitches creates a chord she can analyze: C-E-G-A. "The buffer is a chord," she says aloud. "Full buffer is a dense cluster. Empty buffer is silence. Overloaded buffer would be... dissonance?" She configures context filters with new intention — she's managing harmony, not just data.

**UI Annotations:**
- Hearing aid compatibility: primary audio content in 500Hz-3kHz range
- High-frequency cues (>4kHz) always have visual parallels
- Agung fundamental at ~110Hz — within unaided hearing range for most hearing loss profiles
- Pentatonic quantization recognized by trained musicians as culturally specific
- Buffer-as-chord metaphor emerges naturally for musically literate players

---

## Strengths and Weaknesses

### Strengths
- **Tick synchronization is solvable.** The AudioWorklet approach provides sub-5ms sync between game state and audio, well within perceptual thresholds.
- **Browser audio has matured.** AudioWorklet, AudioBuffer, DynamicsCompressorNode — the Web Audio API now provides everything needed for professional game audio without plugins.
- **The Hybrid Ladder eliminates the speed/quality tradeoff.** Tone.js for rapid iteration, raw Web Audio for shipped performance.
- **Mobile is viable with quality tiers.** Reduced sample rate, mono output, voice limiting, and haptic substitution make the audio engine run on budget hardware.
- **Bundle size is minimal.** The shipped Bare Wire engine is ~8-12KB. Even the Tone.js prototype only adds ~150KB (code-split, loaded on demand).

### Weaknesses
- **iOS Safari remains the weakest link.** AudioWorklet support is solid as of Safari 15.4+, but iOS audio session management (interruptions from calls, notifications, Siri) requires careful handling.
- **No browser-native spatial audio for grid positions.** Web Audio PannerNode exists but is designed for 3D environments, not 2D grid games. Mapping 8x8 positions to stereo panning requires manual math: `pannerNode.pan.value = (column - 3.5) / 3.5` for left-right spread. Vertical axis (rows) has no natural audio dimension.
- **AudioWorklet debugging is painful.** Errors in the audio thread don't propagate to the main thread console cleanly. Chrome's Web Audio inspector helps but doesn't show AudioWorklet internal state.
- **Real kulintang tuning is not equal-tempered.** Authentic Maguindanao kulintang uses a tuning system that varies between ensembles. Using equal-tempered pentatonic (C-D-E-G-A) is a compromise that loses cultural specificity. Using recorded samples preserves tuning but prevents procedural pitch manipulation. Tension between authenticity and implementation flexibility.

---

## Interaction Effects with Locked Decisions

- **Deterministic tick scheduler:** The tick scheduler fires events at exact intervals. The audio engine must schedule sounds at corresponding `AudioContext.currentTime` values. The AudioWorklet bridge converts game-tick timestamps to audio-thread timestamps deterministically — same game state always produces same audio events, enabling replay audio reconstruction in Inspector.
- **Sealed Watch no-skip/no-pause:** Audio must play continuously during Sealed Watch with no user control. The "quality signal" constraint means audio IS the experience during passive observation — any dropout or desync is unacceptable.
- **1-second tick default, 0.5x/1x/2x speed:** The audio BPM must scale with tick speed. At 0.5x (2s/tick), the kulintang plays at ~60 BPM — meditative, spacious. At 2x (0.5s/tick), it plays at ~240 BPM — frantic, compressed. Gong samples must sound natural across this range; very fast playback may require shorter sample variants to avoid overlap.
- **React + Pixi.js stack:** Audio engine lives entirely outside React's render cycle. Game events from the tick scheduler (Pixi.js layer) fire directly to the AudioWorklet. React components (Plan screen workbench) fire UI sounds via a lightweight event bus. No audio state in React state — audio is fire-and-forget.
- **Inspector timeline scrubber:** Scrubbing through ticks in Inspector must replay audio events at the scrubbed tick. The deterministic audio event log enables this: each tick's audio events are recorded as `[{ type, params, relativeTime }]` and replayed via the same scheduling pipeline.

---

## Comparable Games

- **Mini Metro / Mini Motorways (Dinosaur Polo Club):** Procedural music driven by game state. Each metro line is a musical voice; adding lines adds instruments. Tick-synchronized using Disasterpeace's custom audio engine built on FMOD. The closest precedent to the Kulintang Machine concept. Key lesson: the music must feel composed even though it's procedural — Disasterpeace achieved this by constraining procedural decisions to a curated harmonic palette. The pentatonic constraint in Robot Uprising serves the same function.
- **Rez (Tetsuya Mizuguchi, 2001):** Every player action generates a musical event quantized to the beat grid. The game IS a music-making tool disguised as a rail shooter. Key lesson: quantization to beat grid makes random player actions feel rhythmically intentional. Robot Uprising's gong-entry-on-quarter-note achieves the same effect.
- **Crypt of the NecroDancer:** All game actions must synchronize to a global beat. Uses FMOD Studio with tempo-locked event triggers. Key lesson: strict beat synchronization creates a distinctive gameplay feel that becomes addictive. The agung-as-metronome serves a similar function — every game event lands on a beat.
- **Outer Wilds:** Layered music that dynamically adds and removes instruments based on proximity to points of interest. Uses Wwise middleware. Key lesson: musical layers that enter and exit smoothly create a sense of living space. The column gong voices entering and leaving as units move across the board creates the same "living battlefield" feeling.
- **Into the Breach (Ben Prunty):** Energetic strategy game music that broke the "quiet background" convention. Not dynamically layered but tempo-matched to gameplay pacing. Key lesson: strategy game audio should energize, not sedate. The Sealed Watch acceleration from 70 to 120 BPM follows this principle.

---

## Sensory Description

**Plan phase, 3 units placed in columns A, D, G:**
Three gong voices, widely spaced across the stereo field (A panned left, D center, G right), create a spacious triad. The sub-bass drone hums below audibility on laptop speakers but pulses gently in headphones. A soft mechanical rhythm — the production queue conveyor belt — ticks at half the melody tempo, like a slow clock beneath bronze bells. Editing a blueprint replaces the melody with a high-frequency shimmer: crystalline, suspended, like holding a tuning fork near your ear. Each skill toggle produces a two-note ascending ping (different pitches per skill type). The workbench feels like a sound design studio — every interaction has a tactile audio response.

**Sealed Watch, 12 units across all 8 columns, Mission 7:**
The full kulintang ensemble. Eight gong voices in a dense, shimmering cluster — not a chord in the Western sense but an interlocking pattern of metallic tones, each with its own rhythmic offset, creating a wash of bronze that shifts and eddies like water through rice terraces. The kick drum anchors everything at 120 BPM. The agung hits on each tick — a deep BOOM that vibrates the desk if you have a subwoofer, felt as a haptic pulse on mobile. Between ticks, babendil pings flash across the stereo field: a high bright ping from the left (Scout broadcasting), a lower warmer tone from center (Relay compressing), a sharp metallic chirp from the right (Striker receiving). Each ping is the channel's unique sonic identicon, played at its grid position in the stereo panorama. Buffer overflow: a rising electronic whine, thin and insistent, cutting through the bronze wash like a smoke alarm through music. It resolves with a dull thud and the mix breathes again. Combat elimination: a sharp CRACK (dabakan) with a 200ms digital glitch tail — the sound of a connection severing. The dead unit's column gong fades over 2 ticks. The melody thins. You hear the gap.

**Inspector, post-battle analysis:**
Calm. The gong voices are stretched into drones — each one a sustained metallic shimmer, rotating slowly in stereo. The kick is gone. The agung is gone. The only rhythmic element is your interaction: clicking a unit produces a soft hollow POP (ceramic), scrubbing the timeline produces a subtle pitch shift in the drone (forward = rising, backward = falling). Buffer slots hum at individual pitches, creating a chord that changes as you scrub through ticks. At Tick 12 (the overflow moment), the chord clusters tightly and a faint echo of the overflow whine plays — a memory of the crisis, heard from the calm of retrospection. The Inspector sounds like a meditation room built inside a control room.

---

## The TikTok Clip

The 15-second clip: Plan phase with 2 units, sparse melody. Cut to EXECUTE — agung HITS, kick drops, 8 gong voices explode into full ensemble. Rapid cuts synced to babendil pings. Buffer overflow whine rising, combat CRACK, a gong voice drops from the mix. The music thins as units die. Final tick — massive agung, 4-second decay, transition to Inspector drone. Caption: "the battlefield IS the instrument." The audio alone sells the game — you can close your eyes and hear a story.
