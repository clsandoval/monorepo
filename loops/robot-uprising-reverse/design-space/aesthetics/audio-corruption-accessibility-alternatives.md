# 6.10d — Accessibility Alternatives for Corruption Audio

## The Design Challenge

The corruption audio vocabulary (6.10, 6.10a, 6.10c) is one of Robot Uprising's richest feedback systems: a three-layer sonic architecture (ambient Wrongness Chord, interaction Geiger clicking, event Heartbeat Monitor) that teaches players to detect, locate, and diagnose integrity violations by ear alone. The Geiger sweep is a spatial debugging superpower. The heartbeat arrhythmia communicates severity without reading a single number. The all-clear chord delivers dopamine through harmony.

But what happens when the player cannot hear any of it?

Approximately 15% of the world population experiences some degree of hearing loss (WHO, 2021). Among gamers specifically, the Deaf and hard-of-hearing (DHH) community is substantial and vocal about audio-gated design. If corruption detection becomes a mechanic that *requires* hearing the Geiger clicks to locate problems efficiently, the game has built an accessibility wall into a core system that is otherwise structurally ideal for accessibility (turn-based, no twitch, discrete state — see 6.08).

This document explores five approaches to making corruption detection fully playable without audio, each providing equivalent gameplay information through alternative sensory channels. The goal is not "reduced-fidelity fallback" but "parallel-fidelity alternative" — a DHH player using the visual corruption mode should have the same detection speed, the same diagnostic precision, and the same resolution satisfaction as a hearing player using the full audio vocabulary.

Three design constraints frame the problem:

1. **The Audio-Gated Mechanic Test.** For every corruption audio cue (all 13 sounds from 6.10a), ask: "If this sound did not play, could the player still accomplish the same task in the same time?" If the answer is no, the cue is audio-gated and needs a visual/haptic parallel.
2. **The Redundancy Principle.** The best accessibility isn't "alternative mode" — it's "redundant channels by default." If corruption detection works through both audio AND visual simultaneously, no settings toggle is needed. The player's sensory capabilities self-select which channel they use.
3. **The Satisfaction Parity Requirement.** The all-clear chord is one of the most emotionally satisfying moments in the corruption system. Its visual equivalent must produce comparable emotional release — not just an "OK" indicator, but a moment that makes the player feel *clean.*

---

## The 13-Sound Equivalency Map

Every corruption sound from the 6.10a inventory needs a non-audio equivalent. Here is the complete mapping before exploring specific approaches:

| Sound | Audio Channel | Information Conveyed | Audio-Gated? |
|-------|--------------|---------------------|--------------|
| The Sour Note | Ambient | "Something is wrong" | Partially — integrity indicator exists, but audio cues *before* the player reads it |
| The Beetle Click | Interaction | "Corruption exists on this screen" | Yes — no visual equivalent of ambient low-rate clicking |
| The Proximity Buzz | Interaction | "You're getting warmer/colder relative to corruption" | Yes — the hot-cold sweep is purely sonic |
| The Heartbeat Fade-In | Event | "This specific element's corruption severity" | Yes — severity is communicated through BPM and arrhythmia |
| The Revert Tone | Event | "This element is now clean" | No — the element visually reverts to clean state |
| The Deceleration Cascade | Event | "Corruption is being resolved (process feedback)" | Yes — the slowing heartbeat is the satisfaction moment |
| The All-Clear Chord | Event | "Full integrity restored" | Partially — integrity indicator shows 100%, but emotional release is audio |
| The Flatline Interjection | Event | "Critical severity — patient crashing" | Yes — urgency escalation is purely sonic |
| The Deep Corruption Distortion | Interaction | "This is an enemy-injected hook (deepest corruption)" | Partially — visual styling differs, but the visceral "chest-resonant" warning is audio |
| The Whisper Fragment | Event | "An enemy AI presence lurks in this element" | Yes — narrative dread is exclusively audio |
| The Static Spectrum | Ambient | "Type identification: configs vs. buffers vs. hooks" | Yes — frequency-band type ID has no visual parallel |
| The Signal Jam Snap | Event | "Enemy hook purged — we jammed their signal" | Partially — hook removal is visible, but the "snap" resolution feel is audio |
| The Callsign Chime | Event | "Full restoration with all types present — maximum achievement" | Yes — the upgraded all-clear is audio-only |

**Result: 9 of 13 sounds are fully or partially audio-gated.** The corruption system as designed in 6.10/6.10c is heavily audio-dependent. Without alternatives, a DHH player loses spatial detection (Geiger sweep), severity assessment (heartbeat), type identification (static spectrum), urgency escalation (flatline), narrative dread (whispers), and emotional resolution (chord/chime).

---

## Approach A: "The Corruption Heatmap" — Spatial Visual Overlay as Geiger Equivalent

### What It Is

A persistent visual overlay on the Plan screen workbench that replicates the Geiger counter's spatial detection through color-gradient proximity rendering. Every UI element on the workbench radiates a corruption glow proportional to its corruption severity. The glow is not a highlight on the element itself (those already exist as amber indicators) — it is a *field* that extends outward from corrupted elements, creating a visual "heat" map across the entire workbench surface.

### Mechanical Specifics

**The Corruption Field:**
- Each corrupted element emits a radial gradient extending 200px outward from its bounds.
- Gradient color: transparent at 200px → faint amber at 100px → saturated amber at 50px → pulsing red-amber at 0px.
- Multiple overlapping fields blend additively, creating "hotspots" where several corruptions cluster.
- The field renders behind all workbench UI elements but in front of the workbench background texture — corrupted regions of the panel have a warm, sickly glow seeping through the interface.

**Severity Encoding (replacing heartbeat BPM):**
- Mild corruption (single field): static amber glow, no animation. Calm. "This is manageable."
- Moderate corruption (corrupted rule/hook): glow pulses at 1Hz (once per second). Slow breathing.
- Severe corruption (multiple corruptions): glow pulses at 2Hz with brightness oscillating 50-100%. The workbench surface under these elements appears to *throb.*
- Critical corruption (>3 corruptions, <50% integrity): glow pulses at 4Hz, and corruption field lines appear — thin animated radial lines sweeping outward from the corrupted element like sonar pings, 3 lines per second. The "field lines" are the visual equivalent of the flatline interjection — unmistakable urgency.

**Type Identification (replacing static spectrum frequency bands):**
- Corrupted configurations: amber glow with horizontal line pattern (like CRT scan lines). The "data corruption" aesthetic.
- Degraded buffers: amber glow with vertical bar pattern (matching the context bar visual language). The buffer *looks* degraded.
- Enemy-injected hooks: amber glow with diagonal crosshatch pattern, and the glow color shifts from amber to a sickly cyan-amber — a color that reads as "foreign" against the warm Filipino cyberpunk palette. The crosshatch says "wired by someone else."

**Cursor Interaction (replacing Geiger proximity):**
- When the player's cursor enters a corruption field, a "corruption proximity indicator" appears attached to the cursor: a small semicircular gauge (like a signal strength meter) showing 1-5 bars based on proximity to the nearest corruption source.
- At maximum proximity (direct hover), the gauge fills completely and the cursor itself acquires a faint amber halo.
- This is the visual hot-cold: moving the cursor across the workbench, the proximity gauge rises and falls, guiding the player toward corruption sources exactly as the clicking rate would.

**Resolution Animation (replacing deceleration cascade and all-clear chord):**
- When the player reverts a corruption, the field for that element doesn't simply vanish. It performs a "purification sweep": the amber glow rapidly shifts to cyan (the game's "clean signal" color) in a 500ms transition, then the cyan glow contracts from 200px radius to 0 over another 500ms, leaving the element visually pristine. This contraction IS the deceleration cascade — the visual equivalent of a heartbeat slowing to rest.
- When the last corruption is fixed and integrity reaches 100%, all remaining field remnants flash cyan simultaneously, hold for 500ms, then the entire workbench background performs a subtle brightness pulse — a momentary "deep breath" where the whole screen brightens by 10% for 300ms before settling back. This is "The Visual Chord" — the brightness pulse is the dopamine hit.

### Sensory Description

You open the workbench for Mission 9 and the panel glows. Not the normal UI glow — there is amber light bleeding through the interface, concentrated in two spots: a warm pool around the Striker blueprint's rules section (horizontal scan lines wavering in the glow — corrupted configuration) and a hotter, crosshatched splotch near the Relay's hook panel, pulsing twice per second, that sickly cyan-amber that means *someone else wired this.* You move your cursor slowly across the workbench. The tiny proximity gauge beside your cursor sits at zero bars as you cross the production queue. Two bars as you approach the Striker section. Four bars as you enter the amber pool. Five bars — full — as you hover the corrupted rule. The amber throbs directly under your cursor. You click REVERT. The amber snaps to cyan, then the cyan *contracts,* pulling inward like water circling a drain, until the element sits clean and the proximity gauge drops to zero. One corruption left — the crosshatched hook. You hunt it with your proximity gauge. Find it. Purge it. The cyan flash contracts. Then the whole workbench exhales — a single bright pulse that says: *clean.*

---

## Approach B: "The Tremor Protocol" — Haptic-Only Corruption Detection

### What It Is

A corruption detection mode that uses the controller's haptic motors (DualSense adaptive haptics, Joy-Con HD Rumble, or basic rumble on Xbox/generic) as the primary corruption feedback channel. This replaces audio with touch: the Geiger clicking becomes a vibration pulse in the player's hands, the heartbeat becomes a literal felt heartbeat in the controller, and the all-clear chord becomes a smooth warmth that spreads through both grips.

This approach is specifically designed for three overlapping audiences: DHH players on console, players who prefer playing without audio (TV muted, shared living space), and players using the DualSense haptic vocabulary already documented in 6.06a.

### Mechanical Specifics

**Corruption Presence Pulse (replacing Sour Note):**
- When entering a corrupted Plan screen, both controller grips produce a single low-frequency pulse every 4 seconds — slow, deep, like a distant heartbeat. Intensity: 15%. Below conscious attention threshold for most players, but their hands register "something is different about this session."
- This maps directly to the ambient layer: always-on, subconscious.

**Proximity Vibration (replacing Geiger clicks):**
- As the cursor (or D-pad focus ring) approaches corrupted elements, the controller produces tactile clicks in the grip nearest the corruption's screen position (left grip for left-side elements, right for right-side).
- Click rate follows the same curve as Geiger audio: 1/2s at far range, 8-20+/s at hover.
- Each click is a sharp 5ms impulse — perceptibly different from the UI Confirmation micro-pulses (which are symmetric and lighter at 3ms/15%). These corruption clicks are asymmetric (one grip) and harder (25-40%).

**Severity Heartbeat (replacing Heartbeat Monitor):**
- On inspecting a corrupted element, the controller produces a literal heartbeat: a dual-pulse pattern (lub-DUB) in both grips simultaneously.
- Rate maps identically to the audio heartbeat: 60 BPM (mild), 90 BPM (moderate), 120 BPM (severe), 160 BPM (critical).
- Arrhythmia: at severe+ severity, the controller occasionally skips the "lub" and delivers only the "DUB" — an unsettling gap in the expected rhythm that the player's hands notice even before their brain processes it.
- Critical severity adds a continuous low buzz between heartbeats — the haptic flatline.

**Type Identification (replacing static spectrum):**
- Corrupted configurations: smooth, rounded vibration profile (low-pass filtered rumble).
- Degraded buffers: staccato, choppy vibration (rapid on/off like a stuttering motor).
- Enemy-injected hooks: ragged, irregular vibration with random intensity spikes — the controller feels *unstable,* as if the motor itself has been corrupted.

**Resolution Haptics (replacing deceleration cascade and all-clear chord):**
- On revert: the heartbeat decelerates from its current tempo to a calm 60 BPM over 500ms, then a single strong, clean pulse in both grips — a definitive "thud" at 60% intensity. The strongest single haptic event in the Plan screen. The hands feel the element lock into health.
- On full integrity restoration: both grips produce a slow, warm sine-wave rumble — a 2-second swell from 10% to 30% intensity and back to 0%, spreading evenly across both grips. Not a sharp event — a *feeling.* The controller exhales. This is the haptic chord.

### Interaction with Existing Haptic Vocabulary (6.06a)

The corruption haptics must coexist with the UI Confirmation and Board Event haptic layers. Key differentiators:
- **Frequency:** Corruption proximity clicks are 80-120Hz (mid-range). UI Confirmation ticks are 200Hz+ (high, crisp). The player's hands learn to distinguish "crisp tick = I navigated" from "deeper click = corruption nearby."
- **Asymmetry:** UI events are symmetric (both grips). Corruption proximity is asymmetric (directional). This is the most important differentiator — if only one grip is clicking, it is corruption.
- **Continuity:** UI events are instantaneous (5-10ms). Corruption heartbeat is sustained (rhythmic pattern over seconds). Duration itself encodes "this is diagnostic, not confirmatory."

---

## Approach C: "The Corruption Captioner" — Screen Reader Integration for Blind Players

### What It Is

A screen-reader-compatible narration layer that translates the entire corruption audio vocabulary into structured text announcements compatible with NVDA, JAWS, VoiceOver, and built-in browser screen readers. This approach acknowledges that blind players already use screen readers for the React-based Plan screen (which is DOM-accessible), and extends that accessibility into corruption-specific announcements.

Robot Uprising's Plan screen is React DOM — intrinsically screen-reader-compatible. The board canvas requires a parallel accessible representation (established in 6.08). The corruption captioner adds a third layer: a live ARIA region that announces corruption state changes in real-time.

### Mechanical Specifics

**On entering a corrupted Plan screen:**
Screen reader announces: "[Mission name]. Workbench integrity: [X]%. [N] corruptions detected. [Type breakdown: N corrupted configurations, N degraded buffers, N enemy-injected hooks.]"

This single announcement replaces the Sour Note (ambient awareness) with explicit factual information. A blind player knows immediately what a hearing player would take 3-5 seconds of ambient unease to register.

**On focusing a corrupted element (Tab/D-pad navigation):**
Screen reader announces: "[Element name] — CORRUPTED. Type: [config/buffer/hook]. Severity: [mild/moderate/severe/critical]. [Specific description: 'Rule 3 condition changed from distance < 3 to distance < 8' / 'Buffer capacity reduced from 12 to 7 slots' / 'Unknown hook detected on channel recon-net, source: enemy']."

This replaces the Geiger proximity buzz AND heartbeat severity with precise textual information. The blind player actually gets *more* diagnostic information per interaction than the hearing player — they know the exact nature of the corruption, not just its location and severity.

**On reverting a corruption:**
Screen reader announces: "[Element name] restored. [N] corruptions remaining. Integrity: [X]%."

**On full integrity restoration:**
Screen reader announces: "All corruptions cleared. Integrity: 100%. Workbench clean." followed by a 500ms pause in the announcement queue — a moment of intentional silence. In screen reader interaction, silence is the equivalent of the all-clear chord: the absence of threat announcements IS the resolution.

**Corruption Navigation Shortcuts:**
- **Ctrl+Shift+C (or equivalent):** Jump focus to next corrupted element. Cycles through all corruptions in severity order (critical first). This replaces the Geiger sweep entirely — instead of moving a cursor and listening for clicks, the player jumps directly to each corruption in priority order.
- **Ctrl+Shift+X:** Describe all corruptions as a summary list. "3 corruptions: 1 critical enemy hook on Relay blueprint hook slot 2, 1 moderate corrupted config on Striker rule 3, 1 mild degraded buffer on Scout context config."

**The Sealed Watch Corruption Announcements:**
During battle, corruption-related events (EMP damage reducing buffers mid-fight — see 6.10f) are announced as ARIA live region updates: "Tick 14: Scout-Alpha buffer degraded by EMP. Capacity: 6 to 4. Context overload imminent." These slot into the existing sealed watch narration stream alongside movement and combat announcements.

### Sensory Description (Screen Reader User Experience)

You Tab into the Plan screen. Your screen reader speaks: "Mission 9 Workbench. Integrity 72 percent. 3 corruptions detected. 2 corrupted configurations. 1 enemy-injected hook." You press Ctrl+Shift+C. Focus jumps. "Relay-Bravo, hook slot 2. Corrupted. Type: enemy-injected hook. Severity: critical. Unknown hook detected on channel command-net. Source: enemy. Action: revert or inspect." You press Enter on Revert. "Relay-Bravo hook slot 2 restored. 2 corruptions remaining. Integrity 84 percent." You press Ctrl+Shift+C again. Focus jumps. "Striker-Alpha, rule 3. Corrupted. Type: configuration. Severity: moderate. Condition changed from distance less than 3 to distance less than 8." You revert. One left. Ctrl+Shift+C. "Scout-Charlie, context config. Corrupted. Type: configuration. Severity: mild. Eviction priority changed from oldest to newest." Revert. "All corruptions cleared. Integrity 100 percent. Workbench clean." Silence. The screen reader queue is empty. The absence of announcements is relief.

---

## Approach D: "The Corruption Subtitle Track" — Visual Caption System for Audio Cues

### What It Is

A closed-captioning system for game audio that renders corruption sounds as on-screen text annotations, following the film/TV captioning convention where non-speech sounds are described in brackets. This is distinct from Approach A (which replaces audio with a parallel visual system) — this approach literally *captions the audio,* preserving the audio design's vocabulary and naming while making it readable.

### Mechanical Specifics

**Caption Display:**
- A dedicated caption area at the bottom of the Plan screen (below the workbench panels, above the screen edge). Semi-transparent dark background, white text, configurable font size (Small/Medium/Large).
- Captions persist for 3 seconds or until replaced by a new caption.
- Maximum 2 lines visible simultaneously.

**Caption Vocabulary:**

| Audio Event | Caption Text | Visual Annotation |
|-------------|-------------|-------------------|
| Sour Note (ambient) | [dissonant tone] | Fades in over 2s, stays until integrity restored |
| Beetle Click (far) | [faint clicking] | Appears when cursor enters corruption field |
| Proximity Buzz (close) | [rapid clicking intensifies] | Text scales with proximity — font weight increases from light to bold |
| Heartbeat (mild) | [slow heartbeat — 60 BPM] | Accompanied by a small heart icon pulsing at the displayed rate |
| Heartbeat (critical) | [racing heartbeat — 160 BPM, irregular] | Heart icon pulses rapidly with occasional gaps |
| Flatline | [flatline tone] | Horizontal line graphic replaces heart icon |
| Deep Corruption Distortion | [low distortion crackle] | Caption text itself renders with a glitch effect — letter spacing jitters |
| Whisper Fragment | [whispered: "...they can't see us..."] | Caption in italic, smaller font, as if overheard |
| Revert Tone | [clean tone: 440Hz] | Caption in cyan instead of white |
| Deceleration Cascade | [heartbeat slowing... stabilizing...] | Ellipsis animates, heart icon decelerates |
| All-Clear Chord | [major chord blooms] | Caption in cyan, entire caption area briefly glows |
| Signal Jam Snap | [signal jammed — snap] | Caption appears with a sharp left-border line |
| Callsign Chime | [three ascending tones — all clear] | Three small ascending arrow icons beside text |

**The Caption-as-Emotion Design:**
Standard game subtitles are emotionally flat — white text describing sounds. The corruption captions are designed to carry emotional weight:
- The caption area's background tint shifts with corruption state: clean = transparent, corrupted = faint amber tint, critical = pulsing red-amber tint.
- Caption text for enemy whispers uses a different font style (narrower, slightly distorted) than player-side captions — the "voice" of the enemy AI is visually distinct from the game's narration.
- The all-clear caption doesn't just say "[major chord blooms]" — the entire caption area performs the Visual Chord from Approach A: a brightness pulse and cyan flash. The caption becomes the climax.

---

## Approach E: "The Multimodal Stack" — Redundant-by-Default Across All Channels

### What It Is

The recommended approach. Not a single alternative mode but a layered system where corruption detection information flows through *all* channels simultaneously — audio, visual overlay, haptic, and screen reader — by default. The player's settings control which channels are active, but the design principle is that every corruption event produces output on every available channel. No mode is "the accessibility mode." Every mode is just "a way to play."

### Layer Architecture

| Channel | Default State | Settings Toggle | Primary Audience |
|---------|--------------|----------------|-----------------|
| Audio (6.10/6.10c full vocabulary) | ON | Audio → Corruption Sounds: Off/Subtle/Full | Hearing players |
| Visual Overlay (Approach A Heatmap) | ON at reduced intensity | Visual → Corruption Overlay: Off/Subtle/Full | All players, essential for DHH |
| Haptic (Approach B Tremor Protocol) | ON when controller connected | Haptic → Corruption Feedback: Off/Subtle/Full | Console players, DHH, audio-muted |
| Captions (Approach D Subtitle Track) | OFF | Captions → Sound Captions: Off/On | DHH, preference players |
| Screen Reader (Approach C Captioner) | Auto-detected | Screen Reader → Corruption Narration: Auto/Off | Blind/low-vision players |

**The "Subtle" Default:**
The visual overlay and haptic channels default to "Subtle" rather than "Full" for hearing players, so they enhance without overwhelming. At Subtle:
- Visual overlay: corruption fields render at 30% opacity instead of 100%. Present but not dominant. The player's peripheral vision catches the amber glow without it competing with the UI.
- Haptic: corruption proximity clicks are at 15% intensity instead of 40%. A ghost of sensation that the player may not consciously notice but their hands register.

**The "Full" Option for DHH Players:**
When a DHH player sets Audio → Corruption Sounds: Off (or uses system-level audio settings that indicate hearing accessibility needs), the Visual Overlay and Haptic channels automatically switch from Subtle to Full. This is the "equivalent experience" — the visual heatmap at full intensity with the proximity indicator, combined with the haptic heartbeat, provides the same detection/diagnosis/resolution loop that audio provides for hearing players.

**The Preset Profiles:**
Settings → Accessibility Presets:
- **"Full Orchestra"** — all channels active at full. Maximum redundancy. Every corruption event fires on every channel.
- **"Eyes and Ears"** — audio full, visual subtle, haptic off, captions off. Default for PC with speakers.
- **"Eyes and Hands"** — audio off, visual full, haptic full, captions on. DHH console player.
- **"Hands and Voice"** — audio off, visual off, haptic full, screen reader on. Blind player on console.
- **"Eyes Only"** — audio off, visual full, haptic off, captions on. Laptop in a library.
- **Custom** — per-channel control.

---

## Player Journeys

### Journey: Reina, 27, Deaf Game Streamer

**Context:** Mission 9 (three corruptions, first enemy-injected hook). Reina has been deaf since birth. She plays on PC with a DualSense controller connected for haptics. Her accessibility preset is "Eyes and Hands" — visual overlay full, haptic full, captions on, audio off. She streams with a face cam and sign language interpreter for her DHH audience.

**Minute 0:00 — The Amber Warning**
The Plan screen loads. Reina's eyes go immediately to the integrity indicator: 72%. She has learned to check this first. But even before she reads the number, the workbench is *glowing* — two amber pools bleeding through the interface on the right panel, and a brighter crosshatched spot near the Relay section. Her DualSense begins its slow 4-second presence pulse. She holds up the controller to the camera and signs: "You feel that? That's the corruption heartbeat. Three of them."

The caption area at the bottom reads: [dissonant ambient tone — integrity compromised].

**Minute 0:15 — The Hunt**
Reina moves her cursor toward the Relay panel. The proximity gauge beside her cursor climbs: two bars, three bars. In her hands, the right grip starts clicking — sharp, asymmetric taps that feel nothing like the gentle navigation ticks. She narrates in sign: "Right side. Something in the Relay." Four bars. The clicking accelerates. She can feel the corruption pulling her hand toward it. Five bars. She hovers over hook slot 2.

The caption reads: [rapid clicking — direct hover on corrupted element]. Then: [heartbeat: 160 BPM, irregular — critical severity].

Her DualSense erupts into a racing heartbeat — lub-DUB-lub-DUB-lub—DUB — skipping beats, the rhythm janky and urgent. The crosshatch glow throbs at 4Hz with field lines sweeping outward. She signs to the camera: "Critical. Enemy hook. Feel how the heartbeat skips? That's the arrhythmia — means it's bad."

**Minute 0:40 — The Purge**
She clicks REVERT on the enemy hook. The crosshatch glow snaps to cyan — she watches it contract inward, pulling toward the element like water swirling down a drain. In her hands, the racing heartbeat decelerates: 160... 120... 90... 60... then a single strong THUD, both grips, definitive. The cyan glow vanishes. The caption reads: [heartbeat stabilizing... clean tone: 440Hz].

She signs: "Did you see the glow contract? And the heartbeat slowed down in my hands. That's the deceleration cascade. Best feeling in the game."

**Minute 1:30 — The All-Clear**
Two more corruptions found and reverted via the proximity gauge. The last purification sweep contracts. Then — the whole workbench background pulses bright for 300ms. Both grips produce the warm 2-second sine-wave swell. The caption area flashes cyan and reads: [major chord blooms — integrity 100%].

Reina holds both hands up, palms out, the sign for "clean" in ASL. She grins. "Perfect integrity. My controller just *sighed.* That's the visual chord. Same feeling as hearing players get from the audio chord — just through different senses."

**UI Annotations:**
- Corruption heatmap: two amber pools (scan-line pattern = config corruption) + one cyan-amber crosshatch pool (enemy hook), rendering behind UI elements at full opacity
- Proximity gauge: 5-bar semicircle attached to cursor, filling/emptying with distance to nearest corruption
- Caption area: bottom of screen, semi-transparent dark background, 2-line max, 3s persistence, cyan text for clean events, italic for whispers
- Purification sweep: amber-to-cyan color transition (500ms) followed by radial contraction (500ms)
- Visual chord: 300ms 10% brightness pulse across full workbench background
- DualSense: asymmetric grip clicks (corruption proximity), symmetric heartbeat (severity), warm swell (all-clear)

---

### Journey: Kaito, 34, Hard-of-Hearing Programmer

**Context:** Mission 8 (two corruptions, first encounter with heartbeat layer per 6.10a pacing). Kaito has moderate high-frequency hearing loss — he can hear low-frequency sounds but misses the higher Geiger clicks and heartbeat details. He plays on PC with headphones (which help somewhat) and has his settings at Audio: Subtle, Visual Overlay: Full, Haptic: Off (keyboard/mouse player), Captions: On.

**Minute 0:00 — The Partial Listen**
The Plan screen loads. Kaito can *faintly* hear the Sour Note — it is a low-frequency dissonance, within his hearing range. He thinks "something's off" before he reads the integrity indicator: 88%. The visual overlay confirms: a single amber pool in the Scout blueprint area, scan-line pattern. The caption reads: [dissonant tone — integrity compromised].

Kaito can hear the low end of the audio and see the heatmap simultaneously. The two channels reinforce each other — the audio is not giving him full information (he misses the higher harmonics that hearing players use for type identification), but the visual overlay fills the gap with its scan-line pattern.

**Minute 0:20 — The Proximity Gap**
He moves his cursor toward the amber pool. The Geiger clicking begins — but Kaito only hears the lower-pitched clicks (moderate/severe corruption at 800Hz and below). The highest-pitched "mild corruption" clicks at 2kHz are inaudible to him. Without the visual overlay, he would miss mild corruptions entirely.

But the proximity gauge climbs steadily: three bars, four bars, five bars. The caption reads: [clicking intensifies — approaching corrupted element]. He knows exactly where the corruption is through the visual channel, even though his audio channel is incomplete.

**Minute 0:35 — The Heartbeat Discovery**
This is Mission 8 — the first time the Heartbeat Monitor layer activates (per 6.10a pacing model E). Kaito hovers over the corrupted rule. He can hear a faint rhythmic thudding — the heartbeat's low-frequency component reaches him. But the arrhythmia details, the skipped beats, the subtle tempo shifts — these are in the higher frequency range he misses.

The caption becomes his diagnostic tool: [heartbeat: 90 BPM — moderate severity]. The number gives him what his ears cannot: precise severity data. He nods. "Moderate. Manageable."

He reverts the corruption. The deceleration is partially audible — he feels the low thuds slow down. The caption tracks: [heartbeat slowing... 90... 70... 60... stabilizing...]. The visual purification sweep confirms: amber to cyan, contraction to nothing.

**Minute 1:15 — The Reinforcement Loop**
Second corruption found and fixed. The brightness pulse fires. Kaito can faintly hear the low fundamental of the all-clear chord but misses the upper harmonics that make it shimmer. The caption reads: [major chord blooms — integrity 100%]. The brightness pulse provides the emotional release his ears partially miss.

Over successive missions, Kaito develops a hybrid perception: his partial hearing gives him ambient awareness and rough spatial detection, while the visual overlay provides precision and the captions provide data. He is not using an "accessibility mode" — he is using a multimodal system that self-adjusts to his hearing profile.

**UI Annotations:**
- Visual overlay: full opacity, scan-line pattern for config corruption
- Caption area: active, providing numeric heartbeat BPM that partial hearing cannot discern
- Proximity gauge: primary corruption-finding tool, supplementing partial Geiger hearing
- Audio: low-frequency components audible (Sour Note, heartbeat fundamental, all-clear root), high-frequency components missed (2kHz clicks, arrhythmia details, chord shimmer)

---

### Journey: Marcus, 52, Veteran Gamer with Age-Related Hearing Loss

**Context:** Mission 10 (seven corruptions, maximum intensity, full vocabulary). Marcus has age-related high-frequency hearing loss common in his demographic — he wears hearing aids that help in conversation but gaming audio is often problematic. He plays on PS5 with DualSense, using preset "Full Orchestra" (all channels active).

**Minute 0:00 — The Assault**
Mission 10 opens. Seven corruptions. Integrity: 41%. The workbench is a battlefield of amber glow — overlapping corruption fields creating bright hotspots across three blueprint panels. His DualSense pulses urgently (presence pulse shortened from 4s to 1s at critical integrity). The caption area scrolls: [multiple corruption alerts — integrity critical — dissonant ambient intensifying]. Through his hearing aids, Marcus catches the low rumble of the compromised ambient, but the specific frequency-band identification (which static band = which corruption type) is lost in the aids' compression.

He does not need it. The visual overlay's pattern encoding gives him type identification at a glance: scan lines (configs), vertical bars (buffers), crosshatch (enemy hooks). His eyes are faster than his ears ever were.

**Minute 0:30 — The Systematic Sweep**
Marcus uses the D-pad to navigate the workbench systematically, top to bottom. His DualSense provides the corruption proximity clicks — asymmetric, directional, felt rather than heard. He has internalized the haptic vocabulary across the campaign: "right grip clicking harder = corruption is on the right side of whatever panel I'm in." He does not look at the proximity gauge. His hands tell him.

At each corrupted element, the heartbeat kicks in. Through the DualSense, he feels the severity: the two mild configs have a calm 60 BPM pulse. The moderate buffer degradation is faster — 90 BPM. The critical enemy hook is frantic — 160 BPM with gaps that make his grip stutter. The caption confirms each severity level with a number. His hearing aids catch fragments of the audio heartbeat — enough to know it matches what his hands feel.

**Minute 1:45 — The Whisper**
Marcus hovers over an enemy-injected hook. Through the DualSense, the vibration turns ragged and irregular — the "unstable motor" feel of enemy hooks. The caption reads: [whispered: "...your relay listens to us now..."]. Through his hearing aids, he catches a ghostly murmur — the whisper fragment is in the vocal mid-range that his aids handle best. For a moment, audio and haptic and visual and caption all align: he hears the enemy, feels the instability, sees the crosshatch glow, reads the threat. Four channels, one message.

He signs to himself — not ASL, just a personal gesture of recognition. "Got you." REVERT. The crosshatch snaps to cyan and contracts. His DualSense decelerates. The caption reads: [signal jammed — snap]. The ragged vibration is replaced by the clean thud.

**Minute 3:00 — The Seventh Fix**
The last corruption — a mild config change — is found and reverted. The visual chord fires: full-screen brightness pulse, 300ms. The DualSense produces its warm 2-second swell. The caption area glows cyan: [three ascending tones — all clear — integrity 100%]. Through his hearing aids, Marcus catches the bottom note of the callsign chime — just one tone of three, but enough.

He leans back. Seven corruptions diagnosed and fixed through four simultaneous channels. None of them was "the accessibility mode." All of them were just... how the game works.

**UI Annotations:**
- All channels active at full intensity
- DualSense: presence pulse (1s interval at critical), asymmetric proximity clicks, heartbeat with arrhythmia, ragged vibration for enemy hooks, deceleration cascade, warm swell all-clear
- Visual overlay: overlapping amber fields with three pattern types, proximity gauge, purification sweeps, brightness pulse
- Captions: rolling corruption events, whisper text in italic, cyan text for clean events, ascending arrow icons for callsign chime
- Audio (through hearing aids): partial reception — low fundamentals audible, mid-range whispers partially audible, high-frequency details lost to aids' compression

---

## Strengths and Weaknesses

### Approach A (Corruption Heatmap)
**Strengths:** Works on every platform without special hardware. Provides spatial information (where is the corruption?) through a natural visual metaphor. The proximity gauge directly replaces the Geiger sweep. The purification sweep animation is viscerally satisfying.
**Weaknesses:** Adds visual complexity to an already dense workbench. Colorblind players need the amber/cyan palette to work in their mode (must integrate with 6.08 colorblind palettes — corruption fields could use brightness/pattern instead of hue). On small screens (mobile), the 200px field radius may be too large.

### Approach B (Tremor Protocol)
**Strengths:** Zero visual noise. Provides a genuinely new information channel that hearing players also benefit from. The asymmetric directional clicking is a powerful spatial tool. The felt heartbeat creates emotional connection.
**Weaknesses:** Requires a controller with at least basic rumble. Keyboard/mouse players get nothing. Joy-Con HD Rumble can do most of this; Xbox rumble is coarser and loses type identification nuance. Some players have haptic sensitivity issues (sensory processing disorders, hand tremors, neuropathy) and must be able to disable.

### Approach C (Screen Reader Captioner)
**Strengths:** Provides the most *precise* corruption information of any approach — exact descriptions, numeric severity, specific field changes. Blind players get more diagnostic data per interaction than hearing players. Integrates naturally with the React DOM.
**Weaknesses:** Purely text-based — no emotional satisfaction from resolution. The "absence of announcements" as all-clear is intellectually clean but emotionally flat compared to the audio chord. Screen reader voice quality varies wildly across platforms.

### Approach D (Subtitle Track)
**Strengths:** Familiar UX pattern — every streaming platform and modern game has subtitle support. Low implementation cost. Preserves the audio vocabulary's naming ("heartbeat," "Geiger," "flatline") which reinforces the game's terminology.
**Weaknesses:** Text is not spatial — the caption tells you "clicking intensifies" but doesn't tell you *where* to move. Must be paired with Approach A for spatial detection. Caption area takes screen real estate.

### Approach E (Multimodal Stack) — RECOMMENDED
**Strengths:** No mode is "the accessibility mode" — every player gets every channel, tuned to their preferences. Gradual default (Subtle) means hearing players benefit from visual/haptic reinforcement without being overwhelmed. DHH-specific presets switch to Full automatically. The redundancy principle means no single channel failure locks the player out.
**Weaknesses:** Highest implementation cost (all four approaches must be built). Risk of sensory overload at "Full Orchestra" — all channels at maximum is a LOT of simultaneous information. Must be carefully balanced so the channels reinforce rather than compete.

---

## Interaction Effects

**With 6.10 (Base Corruption Audio):** Approach E wraps the audio vocabulary as one channel among four. The audio design need not change — it gains parallel channels rather than being replaced.

**With 6.10a (Learning Curve):** The progressive audio introduction (one layer per mission) should apply to ALL channels. Mission 7 introduces ambient awareness on all channels (Sour Note + amber glow + presence pulse + caption). Mission 8 adds interaction detection on all channels (Geiger + proximity gauge + directional haptic clicks + proximity caption). The learning curve is multimodal, not audio-only.

**With 6.08 (Comprehensive Accessibility):** The Shape-First design principle (Option C recommended in 6.08) applies directly — corruption fields should use pattern/brightness encoding as primary differentiators, with color as redundant. The Multimodal Stack extends 6.08's vision into corruption-specific territory.

**With 6.06a (Haptic Vocabulary):** The Tremor Protocol's corruption haptics must occupy a clearly distinct frequency/pattern space from the UI Confirmation and Board Event haptic categories. The asymmetry rule (corruption = one grip, UI = both grips) is the key differentiator.

**With Inspector phase:** The Inspector's timeline scrubber replays corruption events. All alternative channels must replay as well: the visual overlay should reconstruct field states per tick, haptics should replay the proximity pattern as the player scrubs through the corruption's "lifetime," and captions should re-display their per-tick annotations.

---

## Comparable Games

**The Last of Us Part II** — Gold standard for game accessibility (2020 Game Awards Innovation in Accessibility). Offers audio descriptions, high-contrast modes, text-to-speech for all UI elements, customizable haptic intensity, and a "navigation assistance" system that gives directional audio cues a visual equivalent. Key lesson: accessibility options were designed *alongside* the game, not retrofitted. Robot Uprising should follow this model.

**Celeste** — "Assist Mode" lets players customize difficulty without framing it as "easy mode." The language matters: "Accessibility Options" not "Disability Settings." Robot Uprising's preset names ("Eyes and Hands," "Full Orchestra") follow this philosophy — they describe the experience, not the disability.

**Forza Horizon 5** — Comprehensive screen reader support for menus and HUD, with audio descriptions of visual events. Demonstrated that screen reader integration in AAA games is technically feasible and commercially valued.

**Hades** — God Mode (incrementally increasing damage resistance after each death) demonstrated that accessibility features can be destigmatized through design language. Robot Uprising's multimodal defaults (everyone gets all channels) follow the same principle: there is no "accessibility mode" to opt into.

**Dead Cells** — Offers extensive accessibility options including font size scaling, UI customization, input remapping, and assists. Their approach of granular per-feature toggles (rather than broad "easy/hard" modes) maps to Approach E's per-channel control.

---

## The TikTok Clip

A split-screen video. Left half: a hearing player experiencing Mission 9 corruption with full audio — the Geiger sweep, the racing heartbeat, the all-clear chord. Right half: a DHH player experiencing the same mission with visual overlay and haptic — the amber heatmap, the proximity gauge, the DualSense heartbeat, the purification sweep, the visual chord. Both players find the same corruptions in the same order. Both players react with the same satisfaction on resolution. The clip ends with both players' faces showing the same expression of relief at the all-clear moment. Title: "Same game. Same feeling. Different senses."

That is the thesis of this entire document. Accessibility alternatives for corruption audio are not about downgrading the experience for disabled players. They are about ensuring that the experience — the hunt, the diagnosis, the satisfaction of cleaning a compromised system — reaches every player through whatever channels their body can receive.
