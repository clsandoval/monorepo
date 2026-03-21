# 6.10d — Corruption Audio Accessibility: Ensuring Corruption Detection Is Never Audio-Gated

## The Mechanic

Robot Uprising's corruption system communicates three distinct integrity threats through audio: **buffer degradation** (EMP damage reducing agent capacity mid-battle, sonified as stuttering ambient breakdowns), **enemy interference** (foreign hooks injected into your agent wiring between missions, sonified as alien whisper fragments and ragged distortion), and **config instability** (sabotaged rule parameters that shift your agents' behavior, sonified as sour harmonic intervals and proximity-based Geiger clicking). Together these form a 13-sound vocabulary (documented in 6.10, 6.10a, 6.10c) that teaches hearing players to detect, locate, diagnose, and resolve corruption by ear alone.

The problem: 9 of those 13 sounds are fully or partially audio-gated. A deaf player cannot perform a Geiger sweep. A hard-of-hearing player misses the heartbeat arrhythmia that communicates severity. A player with sensory processing disorder may need to disable audio entirely to manage cognitive load. If corruption detection requires hearing, the game has built an accessibility wall into a core strategic system.

This document analyzes three alternative modalities — visual-only, haptic-only, and screen-reader — through the lens of information parity, sensory richness, and interaction with Robot Uprising's broader systems. The goal is not "reduced-fidelity fallback" but "parallel-fidelity alternative": every modality must preserve the same information density as audio, including the emotional satisfaction of resolution.

---

### Visual-Only Mode: "The Corruption Heatmap"

The visual-only mode replaces audio with a spatial overlay system rendered directly on the Plan screen workbench. Every corrupted element emits a radial gradient field — a warm, sickly amber glow that extends 200 pixels outward from the element's bounding box, bleeding through the interface like heat through a wall. Multiple overlapping fields blend additively, creating bright hotspots where corruptions cluster.

**Screen overlays and color shifts.** The workbench background itself participates. At 100% integrity, the Plan screen has its normal cyberpunk palette — dark panels, cyan accents, Filipino-industrial texture. As integrity drops, the entire workbench acquires a color temperature shift: a faint amber warming at 90%, a perceptible amber cast at 75%, a throbbing red-amber tint at 50%, and at below 50% the workbench surface appears febrile — pulsing at 4Hz with corruption field lines sweeping outward like sonar pings from the most critically corrupted elements.

**Particle effects for severity.** Mild corruption emits no particles — just the static amber glow. Moderate corruption produces slow-drifting amber motes inside the glow field, rising like embers from a coal bed, 3-4 particles per second. Severe corruption escalates to rapid amber sparks that trace erratic paths outward from the corrupted element, 10-12 per second, leaving brief afterimage trails. Critical corruption (enemy-injected hooks) adds a secondary particle layer: thin cyan-amber crosshatch lines that flash across the glow field at irregular intervals, giving the impression that something foreign is *pulsing* inside the system.

**UI distortion for type identification.** Rather than relying solely on color (which fails for colorblind players), each corruption type warps the UI elements within its field differently:
- **Corrupted configurations** apply a CRT scan-line effect — horizontal lines shimmer through the affected panel, as if the data is being displayed through a degrading monitor.
- **Degraded buffers** apply a vertical bar pattern — the buffer capacity bars themselves stutter and fragment, their clean rectangles breaking into jittering vertical strips.
- **Enemy-injected hooks** apply a diagonal crosshatch distortion — the most visually alarming pattern, suggesting wiring that was done by *someone else*, at an angle that doesn't match the player's own clean orthogonal layout.

**The proximity gauge** replaces the Geiger sweep. A small semicircular meter (like a Wi-Fi signal indicator) attaches to the player's cursor, showing 1-5 bars based on proximity to the nearest corruption source. Moving the cursor across the workbench, the gauge rises and falls — the visual hot-cold that replicates the clicking rate's spatial information. At maximum proximity (direct hover), the gauge fills completely and the cursor acquires a faint amber halo.

**The purification sweep** replaces the all-clear chord's emotional release. When the player reverts a corruption, the amber field doesn't vanish instantly — it transitions through cyan (Robot Uprising's "clean" color) over 500ms, then the cyan glow contracts inward like water circling a drain over another 500ms, leaving the element visually pristine. On full integrity restoration, all remaining field remnants flash cyan simultaneously, and the entire workbench background performs a brightness pulse — a 300ms, 10% brightness swell that is the visual equivalent of the audio chord's dopamine hit. The screen *exhales*.

---

### Haptic Mode: "The Tremor Protocol"

The haptic mode translates corruption into controller vibration — DualSense adaptive haptics, Joy-Con HD Rumble, or basic rumble on Xbox/generic controllers. This serves three overlapping audiences: DHH console players, players in shared living spaces with TV muted, and players who process tactile information more readily than auditory.

**Vibration patterns for detection.** When entering a corrupted Plan screen, both controller grips produce a slow, deep pulse every 4 seconds — 15% intensity, below conscious attention for most players, but the hands register that this session feels different from a clean one. This is the haptic equivalent of the Sour Note: subconscious wrongness communicated through touch.

As the cursor or D-pad focus ring approaches corrupted elements, the controller produces asymmetric clicks in the grip nearest the corruption's screen position (left grip for left-side elements, right for right-side). Click rate follows the Geiger curve: one click per two seconds at far range, 8-20+ clicks per second at direct hover. Each click is a sharp 5ms impulse at 25-40% intensity — perceptibly different from the symmetric, lighter 3ms UI Confirmation ticks. The asymmetry is the key: if only one grip is clicking, it is corruption.

**Intensity curves for severity.** On inspecting a corrupted element, the controller produces a literal felt heartbeat — a dual-pulse pattern (lub-DUB) in both grips simultaneously. Rate maps to severity: 60 BPM (mild, calm resting pulse), 90 BPM (moderate, elevated concern), 120 BPM (severe, the heart is working hard), 160 BPM (critical, tachycardia). At severe and critical severity, the controller occasionally skips the "lub" and delivers only the "DUB" — an arrhythmia gap that the player's hands notice even before their brain processes it. Critical severity adds a continuous low buzz between heartbeats: the haptic flatline, a constant 15% vibration that feels like the controller itself is sick.

**Type identification through vibration texture:**
- **Corrupted configurations:** smooth, rounded vibration profile — a low-pass filtered rumble that feels like a purring machine.
- **Degraded buffers:** staccato, choppy vibration — rapid on/off cycles like a stuttering motor, each burst 20ms with 10ms silence.
- **Enemy-injected hooks:** ragged, irregular vibration with random intensity spikes — the controller feels *unstable*, as if its own motor has been compromised. This is the most unsettling haptic pattern in the game.

**Resolution haptics.** On revert, the heartbeat decelerates from its current tempo to a calm 60 BPM over 500ms, then a single strong, clean pulse at 60% intensity — the strongest single haptic event in the Plan screen, a definitive thud that says "locked into health." On full integrity restoration, both grips produce a slow, warm sine-wave rumble: a 2-second swell from 10% to 30% intensity and back to 0%, spreading evenly. Not a sharp event — a feeling. The controller exhales. This is "The Haptic Chord."

---

### Screen-Reader Mode: "The Corruption Captioner"

The screen-reader mode serves blind and low-vision players who navigate Robot Uprising's React-based Plan screen via NVDA, JAWS, VoiceOver, or built-in browser screen readers. Because the Plan screen is DOM-accessible, the corruption captioner adds a live ARIA region that announces corruption state changes in real-time.

**ARIA announcements and priority levels.** On entering a corrupted Plan screen, the screen reader announces: "[Mission name]. Workbench integrity: [X]%. [N] corruptions detected. [Type breakdown.]" This replaces the Sour Note's 3-5 seconds of ambient unease with immediate factual precision — the blind player knows exactly what a hearing player would take time to intuit.

On focusing a corrupted element via Tab or D-pad: "[Element name] — CORRUPTED. Type: [config/buffer/hook]. Severity: [mild/moderate/severe/critical]. [Specific description: 'Rule 3 condition changed from distance < 3 to distance < 8.']" The blind player receives *more* diagnostic information per interaction than the hearing player — exact field changes rather than just location and severity.

**Priority levels for announcement queuing:**
- **Critical (aria-live="assertive"):** Enemy-injected hooks, integrity below 50%, flatline events. These interrupt the current announcement queue.
- **Standard (aria-live="polite"):** Configuration corruptions, buffer degradations, revert confirmations. These queue behind the current announcement.
- **Background (aria-live="off" with manual query):** Ambient state descriptions, total corruption count, unchanged elements. Available via keyboard shortcut but not automatically spoken.

**Verbosity settings:**
- **Terse:** "[Element] corrupted. [Type]. [Severity]." Three words of essential data.
- **Standard:** Full description including specific field changes and recommended action.
- **Verbose:** Adds contextual information: "This corruption was likely introduced between Mission 7 and Mission 8. The original value was set during your initial configuration in Mission 3."

**Navigation shortcuts.** Ctrl+Shift+C jumps focus to the next corrupted element in severity order (critical first). Ctrl+Shift+X reads a full corruption summary list. These replace the Geiger sweep entirely — instead of moving a cursor and listening for clicks, the player jumps directly to each corruption in priority order. The screen reader provides *superior* navigation efficiency for corruption-finding compared to audio.

**The resolution moment.** On full integrity restoration: "All corruptions cleared. Integrity: 100%. Workbench clean." Followed by a 500ms pause in the announcement queue. In screen reader interaction, silence is sacred — the absence of threat announcements IS the resolution. The queue emptiness is the equivalent of the all-clear chord.

---

### Information Density Parity

Each modality must convey the same five information categories that audio provides:

| Information | Audio Channel | Visual Equivalent | Haptic Equivalent | Screen Reader Equivalent |
|-------------|--------------|-------------------|-------------------|--------------------------|
| Something is wrong (ambient) | Sour Note | Amber workbench shift | 4-second presence pulse | Entry announcement with % |
| Where is the corruption (spatial) | Geiger click rate | Proximity gauge 1-5 bars | Asymmetric grip clicking | Ctrl+Shift+C jump navigation |
| How bad is it (severity) | Heartbeat BPM + arrhythmia | Glow pulse rate + particle density | Heartbeat BPM + skipped beats | Numeric severity + description |
| What type is it (diagnosis) | Frequency band / static spectrum | UI distortion pattern | Vibration texture | Explicit type name |
| It is fixed (resolution) | Deceleration cascade + chord | Purification sweep + brightness pulse | Heartbeat deceleration + warm swell | "Workbench clean" + queue silence |

The screen reader mode actually exceeds audio's information density — it provides exact field values and type names. The visual mode matches audio's spatial resolution through the proximity gauge. The haptic mode matches audio's emotional intensity through the felt heartbeat. No modality is "lesser."

---

## Player Journeys

#### Journey: Reina, 27, Deaf Competitive Player

**Context:** Ranked match, Mission 9 variant with three corruptions including her first enemy-injected hook. Reina has been deaf since birth. She plays on PC with a DualSense connected for haptics. Her accessibility preset is "Eyes and Hands" — visual overlay full, haptic full, captions on, audio off. She is ranked Diamond and streams to a DHH audience. Her average corruption-clear time is faster than the median hearing player because the proximity gauge provides more precise spatial data than Geiger clicking.

**Minute 0:00 — The Amber Warning**
The Plan screen loads. Before Reina reads the integrity indicator (72%), she sees it: two amber pools bleeding through the right panel, one with scan-line shimmer (config corruption) and one brighter pool near the Relay section with diagonal crosshatch lines flashing through it — cyan-amber, pulsing at 4Hz, with field lines sweeping outward. Enemy hook. Her DualSense begins its slow 4-second presence pulse. She signs to camera: "Three corruptions. See the crosshatch? That is foreign wiring." The caption area at screen bottom reads: [dissonant ambient tone — integrity compromised].

**Minute 0:08 — The Competitive Sweep**
In ranked play, corruption-clear speed affects your setup timer. Reina has optimized her sweep pattern. She moves her cursor directly to the brightest hotspot — the crosshatched enemy hook. The proximity gauge jumps from zero to five bars in under a second. Her right DualSense grip erupts into rapid asymmetric clicking — sharp, hard, 20 clicks per second at direct hover, nothing like the gentle navigation ticks. The heartbeat kicks in at 160 BPM with arrhythmia gaps — lub-DUB-lub—DUB — the controller stuttering in her palm. She does not need the caption to confirm severity; her hands already know this is critical.

**Minute 0:14 — The Purge**
She clicks REVERT. The crosshatch glow snaps from cyan-amber to pure cyan in 500ms. The cyan contracts inward, pulling toward the element like water circling a drain. In her hands, the racing heartbeat decelerates: 160... 120... 90... 60... then a single THUD at 60% intensity, both grips, definitive. The element sits clean. Time elapsed: 6 seconds from first hover. She signs: "The deceleration is the best part. You feel the system calming down under your fingers."

**Minute 0:22 — The Scan-Line Configs**
Two config corruptions remain. Reina sweeps the proximity gauge across the workbench — two bars near the Scout panel, climbing to four as she enters the scan-line amber pool. The scan-line shimmer makes the panel text look like it is being displayed through a failing CRT. She hovers the corrupted rule: proximity gauge maxes at five bars, DualSense delivers a smooth rounded vibration (config type), heartbeat at 60 BPM — mild. Quick revert. Cyan flash, contraction, clean thud. She finds the second config corruption 8 seconds later. Same pattern. Revert.

**Minute 0:38 — The Visual Chord**
The last purification sweep contracts. Then — the entire workbench background pulses bright for 300ms. Both DualSense grips produce the warm 2-second sine-wave swell. The caption area flashes cyan: [major chord blooms — integrity 100%]. Reina holds both hands up, palms open — the ASL sign for "clean." Total corruption-clear time: 38 seconds. Her personal best is 31. She signs: "Hearing players listen for the chord. I feel the swell and see the flash. Same game."

**UI Annotations:**
- Visual overlay: full opacity, two scan-line pools (config) + one crosshatch pool (enemy hook) with 4Hz pulse and field lines
- Proximity gauge: 5-bar semicircle on cursor, primary spatial detection tool
- DualSense: asymmetric directional clicks (proximity), heartbeat with arrhythmia (severity), smooth/staccato/ragged vibration (type ID), deceleration + thud (revert), warm swell (all-clear)
- Caption area: dark semi-transparent background, 2-line max, cyan text for clean events, italic for whispers, 3-second persistence

---

#### Journey: Dr. Kasem, 41, Blind Screen-Reader User and Systems Architect

**Context:** Mission 8, first encounter with the heartbeat layer. Dr. Kasem lost his vision at age 12. He navigates with NVDA on Windows, using keyboard shortcuts exclusively. His preset is "Hands and Voice" — audio off, haptic full (DualSense connected), screen reader on. He has configured verbosity to Standard. He is methodical, patient, and treats corruption-finding as a systems debugging exercise.

**Minute 0:00 — The Spoken Briefing**
The Plan screen loads. NVDA speaks: "Mission 8 Workbench. Integrity 88 percent. 2 corruptions detected. 2 corrupted configurations. 0 degraded buffers. 0 enemy-injected hooks." Dr. Kasem's DualSense produces a slow presence pulse — one deep throb every 4 seconds. He nods. Two configs. No hooks. Manageable. He presses Ctrl+Shift+X for the full summary. NVDA reads: "Corruption 1: Scout-Alpha, rule 3. Type: configuration. Severity: moderate. Condition changed from distance less than 3 to distance less than 8. Corruption 2: Striker-Bravo, context config. Type: configuration. Severity: mild. Eviction priority changed from oldest to newest."

He already knows what both corruptions are, where they are, and how severe they are. A hearing player at this point has only registered that "something sounds off" from the Sour Note ambient perturbation. The screen reader has given Dr. Kasem a 10-second head start.

**Minute 0:12 — The Priority Jump**
He presses Ctrl+Shift+C. Focus jumps to the higher-severity corruption first. NVDA: "Scout-Alpha, rule 3. Corrupted. Type: configuration. Severity: moderate. Condition changed from distance less than 3 to distance less than 8. Press Enter to revert." His DualSense delivers the heartbeat — this is Mission 8, the first time the heartbeat layer activates. He feels it: 90 BPM, smooth rounded vibration texture (config type), a calm but present rhythm in both grips. He pauses, learning the new sensation. "So this is what 'moderate' feels like," he murmurs.

**Minute 0:18 — The Revert**
He presses Enter. NVDA: "Scout-Alpha rule 3 restored. 1 corruption remaining. Integrity 94 percent." The heartbeat in his DualSense decelerates: 90... 70... 60... then the clean thud. The smooth vibration stops. He presses Ctrl+Shift+C again. Focus jumps. NVDA: "Striker-Bravo, context config. Corrupted. Type: configuration. Severity: mild. Eviction priority changed from oldest to newest." The heartbeat starts at 60 BPM — calm, almost reassuring. Mild.

**Minute 0:24 — The Clean Silence**
He presses Enter. NVDA: "Striker-Bravo context config restored. All corruptions cleared. Integrity 100 percent. Workbench clean." Then — silence. The announcement queue is empty. The DualSense presence pulse stops. Both grips produce the warm 2-second sine-wave swell. For Dr. Kasem, the silence in his headset and the warmth in his hands together form the resolution moment. No more threat announcements. No more heartbeat vibration. Just emptiness where urgency used to be. He takes a breath. "Clean."

**UI Annotations:**
- Screen reader: NVDA with Standard verbosity, live ARIA region for state changes, Ctrl+Shift+C priority navigation, Ctrl+Shift+X summary list
- DualSense: presence pulse (4s interval), heartbeat at 90 BPM (moderate) and 60 BPM (mild), smooth rounded vibration (config type), deceleration + thud (revert), warm swell (all-clear)
- No visual overlay active (player is blind; visual channel would be wasted rendering)
- Audio: off by preference (Dr. Kasem finds game audio distracting when using NVDA)

---

#### Journey: Yuki, 19, Player with Sensory Processing Disorder

**Context:** Mission 7, first corruption encounter. Yuki has sensory processing disorder (SPD) — auditory processing variant. Multiple simultaneous sound sources cause cognitive overload, manifesting as anxiety and inability to parse individual audio streams. She plays on PC with headphones, but uses a custom accessibility profile: Audio off, Visual Overlay: Subtle (30% opacity), Haptic: Off (sensory defensiveness means controller vibration is aversive), Captions: On. She processes visual information well when it is structured and predictable. She cannot process audio or haptic input under load.

**Minute 0:00 — The Gentle Entry**
Mission 7 loads. With audio off and haptic off, the Plan screen is quiet — no ambient hum, no controller pulse. The workbench appears with its normal cyberpunk palette, dark panels and cyan accents. But there is a faint amber warmth in the lower-left panel — the visual overlay at Subtle, 30% opacity, just enough to notice without commanding attention. The caption area reads: [ambient integrity note — 1 corruption detected]. Yuki reads it calmly. One corruption. The overlay is not pulsing, not flashing, not demanding — just a gentle warm presence in her peripheral vision.

For Yuki, this is critical: the information arrives through a single, low-intensity visual channel. No competing sensory streams. No audio she must parse alongside visuals. No haptic input her body must simultaneously process. She can focus.

**Minute 0:10 — The Quiet Hunt**
She moves her cursor toward the amber warmth. The proximity gauge appears beside her cursor — a small, clean UI element with clear bar segments. One bar. Two bars. Three bars. The gauge is silent, still, purely geometric. It does not pulse or flash. For Yuki, this structured visual feedback is ideal: discrete increments (1-5 bars) rather than continuous variation, clean edges rather than organic glow, predictable rather than surprising.

She enters the amber field. At Subtle opacity, it is barely there — a hint of warmth behind the panel elements. She follows the proximity gauge to four bars, then five. She hovers over the corrupted rule. The caption reads: [corruption detected — configuration type — moderate severity]. The scan-line pattern in the overlay is faint but visible — horizontal lines shimmering through the panel at 30% opacity.

**Minute 0:22 — The Predictable Resolution**
She clicks REVERT. The amber glow transitions to cyan — but at 30% opacity, this is a gentle color shift, not a dramatic flash. The cyan contracts inward smoothly over 500ms. No sudden brightness changes. No sharp transitions. The caption reads: [corruption resolved — integrity 100% — workbench clean]. The faint cyan remnant fades to nothing. The workbench returns to its normal palette.

There is no brightness pulse. Yuki has disabled the Visual Chord in her settings (it is a sub-option under Visual → Corruption Overlay → Resolution Effect: Off/Subtle/Full). For her, the absence of the amber warmth IS the resolution. The workbench looks normal again. Clean means quiet means calm.

**Minute 0:30 — The Debrief**
Yuki reviews her config. The workbench is serene — dark panels, cyan accents, no amber anywhere. She notes in her stream chat: "I play with everything turned way down. One channel, low intensity. The game lets me do that. I still found the corruption in 22 seconds." She is not competing on speed. She is competing on comfort. The accessibility system's granular per-channel control (Off/Subtle/Full per modality, with sub-options for resolution effects) means she can titrate her sensory exposure to her tolerance.

**UI Annotations:**
- Visual overlay: Subtle (30% opacity), scan-line pattern barely visible, no particle effects at Subtle
- Proximity gauge: standard 5-bar display, no pulsing or animation, clean geometric rendering
- Caption area: standard dark background, white text, 3-second persistence, no cyan flash (resolution effect disabled)
- Audio: off — Yuki's primary accessibility requirement
- Haptic: off — sensory defensiveness to vibration
- Visual Chord (brightness pulse): disabled via sub-option
- Total active channels: 1.5 (visual overlay at 30% + captions)

---

## Strengths and Weaknesses

### Visual-Only Mode

**Strengths:**
- Platform-universal. Works on PC, console, mobile, browser — no special hardware required.
- Spatial precision. The proximity gauge provides more quantized (1-5 bar) spatial data than the continuous Geiger clicking, which some players find easier to parse.
- Aesthetic integration. The amber glow fields, scan-line distortion, and purification sweeps reinforce the cyberpunk aesthetic rather than feeling like an accessibility overlay.
- Scalable intensity. The Subtle/Full toggle means it can serve as a gentle reinforcement for hearing players or a primary channel for DHH players.

**Weaknesses:**
- Visual noise. At Full opacity, the corruption heatmap adds significant visual complexity to an already dense workbench. Players with cognitive load sensitivity may find it overwhelming.
- Colorblind dependency. The amber-to-cyan transition relies on color discrimination. Must integrate with the colorblind palette system (6.08) — pattern and brightness encoding must be primary, color redundant.
- Small screens. The 200px radial field is designed for desktop monitors. On mobile or handheld (Steam Deck), fields may overlap excessively, reducing spatial discrimination.
- No eyes-free play. A player who looks away from the screen loses all corruption information. Audio and haptic can persist through divided attention.

### Haptic Mode

**Strengths:**
- Zero visual noise. Adds no screen clutter. The workbench looks identical to a non-accessibility session.
- Emotional immediacy. The felt heartbeat creates a visceral, embodied connection to corruption severity that some players report as more intense than audio.
- Directional encoding. Asymmetric grip clicking provides spatial information without eye movement — the player's hands orient them before their eyes do.
- Coexists with all other modes. Haptic does not compete for the same sensory bandwidth as visual or audio.

**Weaknesses:**
- Hardware-dependent. Requires a controller with rumble motors. Keyboard/mouse players receive nothing. Joy-Con HD Rumble handles the full vocabulary; Xbox basic rumble loses type-identification nuance.
- Sensory defensiveness. Players with SPD, neuropathy, hand tremors, or tactile hypersensitivity may find vibration aversive. Must always be disableable.
- Learning curve. Distinguishing "smooth rounded" from "staccato choppy" from "ragged irregular" vibration requires several missions of exposure. The haptic vocabulary is less immediately legible than visual patterns.
- No shared experience. A spectator or stream viewer cannot perceive what the player's hands feel. This limits haptic-only play's streaming and TikTok clip value.

### Screen-Reader Mode

**Strengths:**
- Highest information density. Provides exact field values, specific type names, numeric severity — more diagnostic precision per interaction than audio or visual.
- Superior navigation efficiency. Ctrl+Shift+C jumps directly to corruptions in priority order, bypassing the spatial sweep entirely. Blind players can clear corruption faster than sighted players who must visually scan.
- Standards-compliant. ARIA live regions work with NVDA, JAWS, VoiceOver, and browser-native readers. No custom accessibility middleware needed.
- Verbosity control. Terse/Standard/Verbose lets the player match announcement depth to their expertise level.

**Weaknesses:**
- Emotionally flat resolution. "Workbench clean" followed by queue silence is intellectually satisfying but lacks the sensory release of the audio chord, visual pulse, or haptic swell. Pairing with haptic (the "Hands and Voice" preset) mitigates this.
- Screen reader voice quality varies. NVDA with a good voice (e.g., Eloquence, OneCore) is clear and fast. A default SAPI voice on Windows is stilted. The experience is partially dependent on the player's screen reader setup.
- Announcement queue congestion. In high-corruption scenarios (7 corruptions, Mission 10), rapid state changes can flood the ARIA live region. Priority levels and the assertive/polite distinction help, but queue management must be carefully tuned.
- No ambient awareness. Audio's Sour Note and haptic's presence pulse create subconscious wrongness detection. Screen reader announcements are conscious and discrete — there is no "background unease" equivalent.

---

## Interaction Effects

### With the Sealed Watch (No-Tools Mode)

During the sealed watch battle phase, the player cannot interact with the workbench. Corruption-related events (EMP buffer degradation, mid-battle config instability) must be communicated passively.

- **Visual mode:** The board canvas displays corruption effects as tile-level amber shimmer on affected units. Buffer degradation renders as the unit's buffer bar flickering and fragmenting. Config instability renders as the unit's sprite developing a brief scan-line glitch every few seconds.
- **Haptic mode:** EMP damage produces a sharp asymmetric pulse in the grip corresponding to the affected unit's board position. Buffer degradation produces a stuttering vibration. The player's hands track the battle's corruption events without looking away from the board.
- **Screen reader mode:** Battle events include corruption narration in the existing sealed watch announcement stream: "Tick 14: Scout-Alpha buffer degraded by EMP. Capacity: 6 to 4. Context overload imminent." These slot alongside movement and combat announcements at standard priority.

### With the Inspector

The Inspector's timeline scrubber replays past ticks. All alternative channels must support scrubbing:

- **Visual mode:** The corruption heatmap reconstructs per-tick field states. Scrubbing backward through a corruption event shows the purification sweep in reverse — cyan expanding outward, then snapping to amber.
- **Haptic mode:** Scrubbing replays the haptic pattern for each tick. Landing on a tick where corruption was detected delivers the proximity click pattern at the cursor's position relative to the corrupted element's location on that tick.
- **Screen reader mode:** Each tick in the Inspector timeline has an accessible label that includes corruption state: "Tick 14. Scout-Alpha integrity stable. Tick 15. Scout-Alpha buffer hit by EMP — capacity 8 to 5."

### With the Plan Screen

The Plan screen is where corruption is primarily detected and resolved. All three modalities are designed Plan-screen-first:

- **Visual mode:** The heatmap renders behind Plan screen UI elements but in front of the workbench background, ensuring corrupted regions glow without obscuring interactive controls. At Subtle opacity, it coexists with the existing UI without competition.
- **Haptic mode:** The asymmetric directional clicking uses the Plan screen's spatial layout — left/right grip mapping corresponds to the element's horizontal position on screen.
- **Screen reader mode:** The Plan screen's React DOM is the foundation for ARIA annotations. Every interactive element has an `aria-label` that includes corruption state when applicable.

### With the Boot Log

The boot log (pre-mission narrative screen) foreshadows corruption. Accessibility alternatives must preserve this foreshadowing:

- **Visual mode:** Boot log text lines referencing integrity threats render with a faint amber background highlight — the same amber used in the corruption heatmap, creating visual continuity.
- **Haptic mode:** Boot log lines about incoming corruption produce a single gentle pulse as the player reads past them — a premonition in the hands.
- **Screen reader mode:** Boot log lines are read aloud with ARIA role annotations: "Warning: intelligence reports suggest enemy interference on this mission."

### With the Cyberpunk Aesthetic

The accessibility alternatives must feel native to Robot Uprising's SE Asian cyberpunk world, not like clinical accessibility overlays:

- **Visual mode:** The amber glow, scan-line distortion, and crosshatch patterns are explicitly cyberpunk visual language — CRT artifacts, heat signatures, electronic interference rendered as aesthetic elements. The corruption heatmap looks like it *belongs* in a Filipino cyberpunk interface.
- **Haptic mode:** The controller vibrations are diegetically justifiable — the player's "terminal" (their controller) is physically reacting to the compromised system. The DualSense is the player's interface to the game world; corruption makes the interface itself feel unstable.
- **Screen reader mode:** Announcements use in-world terminology ("enemy-injected hook," "buffer degradation," "integrity") rather than clinical accessibility language. The screen reader speaks as if it is the workbench's own diagnostic system.

---

## Comparable Games

### The Last of Us Part II (Naughty Dog, 2020)

The gold standard for AAA accessibility. Over 60 accessibility options at launch, including audio descriptions for cutscenes, high-contrast gameplay mode, text-to-speech for all menus, navigation assistance for blind players, and customizable haptic intensity. The key lesson for Robot Uprising: accessibility was designed *alongside* the game from pre-production, not retrofitted. Naughty Dog's approach of hiring blind and deaf consultants during development — not just for QA testing — produced features that felt native rather than bolted on. The corruption heatmap should undergo the same co-design process with DHH players.

TLOU2's "Enhanced Listen Mode" is particularly relevant: it provides audio cues for object locations (a scan-and-ping system) that is conceptually identical to Robot Uprising's Geiger sweep. Their visual equivalent (high-contrast outlines with directional indicators) demonstrates that spatial audio detection systems CAN be translated to visual with full parity.

### Celeste (Maddy Makes Games, 2018)

Celeste's Assist Mode lets players customize individual parameters (game speed, number of dashes, invincibility) without framing any combination as "easy mode." The language design is the lesson: the settings screen says "Assist Mode is not the way Celeste is meant to be played, but we understand that every player is different." Robot Uprising should adopt this philosophy but go further — the multimodal stack means there is no "meant to be played" sensory channel. The names "Eyes and Hands," "Full Orchestra," and "Eyes Only" describe experiences, not disabilities. No preset is labeled "Deaf Mode."

### Forza Horizon 5 (Playground Games, 2021)

Comprehensive screen reader support for menus, HUD elements, and race results. Sign language interpretation for cutscenes in American, British, French, and German sign languages. High-contrast mode for racing HUD. The lesson: Forza demonstrated that screen reader integration is technically feasible in a high-performance real-time game engine. Robot Uprising's turn-based, React-DOM Plan screen is orders of magnitude easier to make screen-reader-accessible than Forza's 60fps racing HUD.

### God of War Ragnarok (Santa Monica Studio, 2022)

Introduced directional audio cues with visual indicators — when a threat approaches from off-screen, both an audio sweep and a UI arrow indicate the direction. The dual-channel (audio + visual) approach is the same principle as Robot Uprising's multimodal stack: redundant channels by default, not alternative channels by opt-in. Ragnarok's sprint accessibility option (automatic sprint, toggle sprint, hold sprint) demonstrates granular per-mechanic customization that maps to Robot Uprising's per-channel Off/Subtle/Full control.

### Hades (Supergiant Games, 2020)

God Mode increases damage resistance by 2% per death, eventually making the game completable by any player without labeling them as using "easy mode." The destigmatization is the lesson. Robot Uprising's approach extends this: there is no accessibility mode to opt into. All channels are always available. The player's settings reflect their sensory preferences, not their disability status. A hearing player might choose "Eyes and Hands" because they play late at night with the TV muted. A deaf player might choose the same preset for entirely different reasons. The system does not distinguish between them, and it should not.

---

## Sensory Descriptions

### What the Visual Corruption LOOKS Like

Open the workbench for Mission 9. The Plan screen's dark panels and cyan trim are unchanged, but beneath the interface — bleeding through like heat through a wall — there is amber. Two pools of warm, sickly light in the right panel. The nearer pool shimmers with horizontal scan lines, three lines sweeping downward per second through the corrupted configuration panel, as if the data is being displayed through a monitor that is losing its hold on the signal. The scan lines are thin, 1-pixel, faintly brighter than the surrounding glow — the CRT artifact of a cyberpunk world where even your tools are degrading.

The farther pool is different. Brighter. Hotter. Its glow is crosshatched — diagonal lines flashing through at irregular intervals, cyan-amber, alien against the warm Filipino palette. This is the enemy hook. The crosshatch pattern says "wired by someone else" — the angles are wrong, the rhythm is wrong, it does not match your clean orthogonal architecture. The pool pulses at 4Hz, and from its center, thin field lines sweep outward like sonar pings, fading at 200 pixels. Amber motes drift upward from the crosshatch center — slow, erratic, like embers from a foreign fire burning inside your Relay's hook panel.

You move your cursor. The proximity gauge beside it sits at zero bars as you cross the production queue. One bar near the Striker section — ambient field warmth. Two bars. The gauge climbs silently, steadily, its bar segments filling left to right. Three bars as you enter the scan-line pool. Four. The cursor acquires a faint amber halo. Five bars at direct hover — the gauge is full, the halo bright, the scan lines rippling directly under your pointer.

You click REVERT. The scan-line glow snaps from amber to cyan — a cold, clean color that reads as "system restored." The cyan contracts inward: 200 pixels, 150, 100, the glow pulling toward the element like water spiraling down a drain. At 50 pixels the contraction accelerates. At 0 it vanishes. The panel is clean. The proximity gauge drops to zero. You feel nothing in your hands (haptic is off in your profile). You hear nothing (audio is off). But you see it: one amber pool remaining, the crosshatched one, still pulsing, still alien. And then you hunt it.

### What the Haptic Patterns FEEL Like

You hold the DualSense in your hands. The Plan screen loads. Before you look at the monitor, your right grip produces a single low throb — deep, 15% intensity, like a heartbeat heard through a wall. Four seconds later, another. It is not alarming. It is not even demanding. It is a presence — something in the system that was not there last mission.

You move the D-pad toward the Relay panel. Your right grip starts clicking. Not the gentle symmetric ticks you feel when navigating menus — those are light, 3ms, both grips, friendly. These are harder. 5ms impulses, 25% intensity, one grip only. Asymmetric. Your left hand is still. Your right hand is being tapped by something that wants your attention. One click per second. Two. Four. The clicks accelerate as you approach. Eight per second as you focus the corrupted hook. They almost blur together at this rate — not quite a buzz, but a rapid staccato that makes your right hand feel like it is touching a live wire.

You inspect the hook. The clicking stops. In its place: a heartbeat. Both grips now, synchronized, a dual-pulse — lub-DUB — at 160 BPM. Fast. Urgent. Your hands are holding a panicking heart. Then the skip — lub—DUB — the "lub" drops out and your grips stutter, the expected pulse absent, the "DUB" arriving too soon and too hard. The arrhythmia. Your body knows this is wrong before your brain labels it "critical severity." Between the heartbeats, a continuous low buzz — 15% intensity, the haptic flatline — an undercurrent of vibration that says this element is actively failing.

The vibration texture is ragged. Not the smooth rounded purr of a config corruption or the staccato chop of a buffer degradation. This is irregular: random intensity spikes, the motor seeming to catch and release, the controller feeling *unstable* in your grip. Enemy hook. Something foreign in the wiring.

You press REVERT. The ragged heartbeat changes. 160 BPM... 120... 90... 60... the deceleration is physical — your hands feel the panic draining out, the rhythm finding its resting state. Then: a single THUD. Both grips, 60% intensity, the strongest single pulse in the Plan screen. Clean. Definitive. The absence of vibration that follows is exquisite. Your hands were holding alarm. Now they hold nothing. The controller is just a controller again.

When the last corruption is fixed, both grips produce something new: a slow, warm swell. Not a pulse, not a thud — a sine wave of gentle vibration, growing from 10% to 30% intensity over one second, holding for a beat, then receding to nothing over another second. It spreads evenly through both grips, symmetric, warm, like the controller is exhaling. This is the Haptic Chord. Your hands feel clean.

### What the Screen Reader SAYS

You press Enter to open the Plan screen. Your headphones speak in NVDA's crisp, synthetic voice:

"Mission 9 Workbench. Integrity 72 percent. 3 corruptions detected. 2 corrupted configurations. 1 enemy-injected hook."

Silence. You press Ctrl+Shift+C. Focus jumps. The voice returns:

"Relay-Bravo, hook slot 2. Corrupted. Type: enemy-injected hook. Severity: critical. Unknown hook detected on channel command-net. Source: enemy. Action: press Enter to revert, or Tab to inspect."

You press Enter. The voice: "Relay-Bravo hook slot 2 restored. 2 corruptions remaining. Integrity 84 percent."

You press Ctrl+Shift+C again. Focus jumps. "Striker-Alpha, rule 3. Corrupted. Type: configuration. Severity: moderate. Condition changed from distance less than 3 to distance less than 8." Enter. "Striker-Alpha rule 3 restored. 1 corruption remaining. Integrity 94 percent."

Ctrl+Shift+C. "Scout-Charlie, context config. Corrupted. Type: configuration. Severity: mild. Eviction priority changed from oldest to newest." Enter. A pause — 200ms longer than usual, as if the system is confirming something:

"All corruptions cleared. Integrity 100 percent. Workbench clean."

Then: nothing. The ARIA live region has no pending announcements. The queue is empty. Your DualSense — if connected — delivers the warm swell. But in your headphones, the silence itself is the resolution. Where there were threat announcements, there is now absence. Where there was urgency, there is now patience. The screen reader has nothing left to say. Your workbench is clean. The silence says so.
