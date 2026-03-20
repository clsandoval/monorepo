# 6.02b — Audio Accessibility: Ensuring Every Player Experiences the Sonic Game

## The Design Challenge

The Kulintang Machine (6.02) and its extensions — channel sonic identicons (6.02d), topology chord (1.08c-ii), corruption audio (6.10) — make audio a **load-bearing gameplay channel**. Signal delivery pings tell you hooks fired. Buffer overflow whines warn of context overload. The agung tick clock creates Sealed Watch rhythm. Channel-specific motifs let you track information flow by ear. For hearing players, the audio isn't decoration — it's a parallel information stream running alongside the visual.

This creates an accessibility obligation: **every piece of gameplay-relevant information communicated via audio must have a non-audio equivalent that carries the same information density and timing.** Not a diminished experience. Not "visual mode for people who can't hear." A fully parallel information channel that hearing players might choose too.

This is "The Equal Channel" — ensuring deaf/HoH players, players in noisy environments, players with audio processing disorders, and players who simply prefer silence can play at the same competitive level as players with full audio.

---

## The Audio Dependency Audit

Before designing alternatives, inventory every gameplay-relevant audio event:

| Audio Event | Information Conveyed | Timing Criticality | Visual Parallel Exists? |
|-------------|---------------------|--------------------|-----------------------|
| Agung tick strike | Tick boundary, time passage | High — marks discrete state changes | YES — tick clock pips |
| Babendil channel ping | Signal transmitted on specific channel | Medium — confirms hook fired | PARTIAL — green cell flash, but no channel ID |
| Channel sonic identicon | WHICH channel transmitted | High for competitive — channel tracking | NO — only colored signal lines |
| Kulintang column gongs | Units occupying columns, army density | Low — ambient awareness | YES — units visible on board |
| Buffer overflow whine | Context window full, stun imminent | HIGH — emergency warning | YES — buffer bar turns red + stunned jitter |
| Dabakan combat crack | Unit eliminated | HIGH — immediate state change | YES — sprite shatters + red flash |
| EM hum | Architecture loudness, detection risk | Medium — stealth awareness | PARTIAL — EM overlay in Inspector only |
| Compression "squish" | Relay compressed a signal | Low — chain confirmation | NO — no visual for compression action |
| Inspector buffer chord | Buffer contents as harmony | Low — aesthetic/analytical | YES — slot contents visible |
| Topology chord health | Network stress level | Medium — subconscious early warning | NO — only individual buffer bars |
| Seal-break agung | Emotional transition marker | Low — aesthetic | YES — screen transition |
| Plan config change tones | Skill/rule/hook/context edit confirmation | Low — UI feedback | YES — visual state change |

**Findings:** Three audio events have NO visual parallel and carry gameplay-relevant information:
1. **Channel sonic identicon** — which channel transmitted
2. **Compression action** — relay compressed a signal
3. **Topology chord health** — overall network stress

These three are the accessibility gaps. Everything else has at least a partial visual equivalent.

---

## Option A: "The Subtitle Track" — Closed Captions for Game Audio

### How It Works

A persistent, togglable caption region displays text descriptions of audio events in real time. Positioned at the bottom of the screen (Sealed Watch) or beside the workbench (Plan phase), using a semi-transparent dark background with high-contrast text.

**Caption format:**
```
[T12] 📡 patrol-report → SENT (Scout A3 → Relay D5)
[T12] 🔧 compress → patrol-report (Relay D5, 2 slots → 1)
[T13] 📡 compressed-alert → SENT (Relay D5 → Striker G7)
[T13] ⚠ CONTEXT OVERLOAD — Relay D5 (12/12 slots)
[T14] ⚔ ELIMINATED — Enemy Scout F4 (by Striker G7)
```

Each line includes tick number, event icon, channel name, action, and involved units with grid positions. Lines scroll upward, with most recent at the bottom. Configurable font size (12-24px). Configurable persistence (fade after 2s / 5s / permanent). Configurable verbosity (Minimal: combat+overflow only / Standard: +signals / Verbose: +compression+movement+EM).

**Channel identicon replacement:** Since captions include the channel NAME in text, the sonic identicon's function (identifying which channel fired) is preserved — the name is arguably MORE informative than a sound motif. The text caption carries strictly more information than the audio event.

**Topology chord replacement:** A small "Network Health" indicator — a single icon that shifts from green-circle to amber-triangle to red-diamond based on aggregate network stress. Positioned near the tick clock. Updates every tick.

**Strengths:**
- Carries MORE information than audio (exact channel names, grid positions, slot counts).
- Familiar pattern — gamers know closed captions from dialogue-heavy games.
- Low implementation cost — a React component reading the same event log that drives the audio engine.
- Useful for hearing players in noisy environments (commute, shared spaces).
- Screen reader accessible — ARIA live region announces captions.

**Weaknesses:**
- **Visual clutter during dense combat.** At tick 12 with 14 units, a single tick might generate 8+ events. Eight caption lines appearing simultaneously creates a wall of text that obscures the board.
- **Reading competes with watching.** During Sealed Watch, the player should be WATCHING the board, not reading text. Captions pull attention downward, breaking the emotional engagement.
- **Timing resolution is discrete, not continuous.** Audio events have sub-tick timing — the rising overflow whine builds over 500ms WITHIN a tick. Captions can only report at tick boundaries.
- **No spatial information.** Audio panning tells you WHERE on the board an event occurred. Captions include grid coordinates but require parsing text, not spatial intuition.

---

## Option B: "The Light Board" — Visual-Only Mode with Enhanced Animations

### How It Works

Every audio event triggers an enhanced visual effect on the board that communicates the same information without sound. This isn't "the same visual effects but louder" — it's a redesigned visual vocabulary specifically optimized for players who will never hear the audio.

**Visual replacements:**

| Audio Event | Visual Replacement |
|-------------|-------------------|
| Agung tick strike | Tick clock pips PULSE with a bright flash ripple across the board (200ms cyan wave from center outward) — "The Heartbeat Flash" |
| Channel ping | Signal line between sender/receiver GLOWS the channel color, thickens to 3px for 400ms, and shows a moving particle along the line. Channel NAME appears as floating text above the midpoint of the line for 800ms. |
| Channel identicon | Each channel gets a unique ICON (procedurally generated from the same hash: star/circle/diamond/triangle/square × rotation × fill pattern). The icon travels along the signal line as the particle. |
| Kulintang column gongs | Column headers (A-H labels) gain a subtle glow when occupied, brighter with more units in the column. |
| Buffer overflow whine | Unit tile SHAKES (2px random offset, 4Hz) for the duration of overflow. Buffer bar gains animated "sparks" — small white pixels ejecting upward. The tile border flashes WHITE at 2Hz. |
| Combat elimination | Enhanced explosion: the red flash expands to 2-tile radius, fading over 400ms. The eliminated sprite shatters into 8 pixel fragments that drift outward. A brief INVERT of the target tile (all colors swap for 100ms) creates a visual "crack." |
| EM hum | For units transmitting: a faint circular "ripple" emanates from the unit every 2 seconds, with radius proportional to emission level. Subtle — background awareness, not alarm. |
| Compression squish | Relay unit briefly shows a small ARROW animation: signal enters from one side (wide fan of particles), exits the other side (narrow focused beam). The "wide→narrow" visual IS compression. |
| Topology chord health | A horizontal bar at the top of the Sealed Watch screen — "Network Health Bar." Green at 0% stress, transitioning through amber to red. Width is fixed; fill color shifts. Positioned beside the tick clock. |

**Inspector additions:**
- Buffer slot hover shows not just content but a "Sound would be: [channel identicon icon + name]" tooltip, acknowledging that hearing players would have heard this.
- Decision trace includes "[audio cue: overflow whine at T12]" annotations so deaf players understand what hearing players perceived.

**Strengths:**
- Zero reading required — all information is spatial and animated.
- Spatial information preserved — channel icons travel along signal lines, overflow shakes happen AT the overloaded unit.
- No visual clutter problem — animations occupy the same spatial real estate as the events they represent.
- "Light Board" mode looks SPECTACULAR — the board becomes a denser light show with more particle effects. Some hearing players may prefer it.
- The channel identicon icons are potentially BETTER than sonic identicons for tracking — visual icons persist on-screen longer (800ms text + icon) than audio pings (200ms).

**Weaknesses:**
- **Photosensitivity risk.** The enhanced animations — tick flash ripples, overflow shaking, combat inversions — could trigger photosensitive epilepsy at high density. Must include a reduced-intensity sub-option within this mode.
- **Sealed Watch visual density ceiling.** At 14 units with overlapping signals, particle lines, overflow shakes, and EM ripples, the board could become visually overwhelming — trading audio cacophony for visual cacophony. Priority-based visual intensity (major events bright, minor events dim) is essential.
- **Animation budget.** Each enhanced visual effect requires Pixi.js particles/tweens. Budget phones may struggle with 20+ simultaneous particle effects. Performance tier gating needed.

---

## Option C: "The Vibration Channel" — Haptic-Only Mode for Mobile

### How It Works

All gameplay-relevant audio events are mapped to haptic patterns on mobile devices. This mode targets deaf/HoH players on phones/tablets, and leverages the haptic vocabulary established in 6.06a.

**Haptic event mapping:**

| Audio Event | Haptic Pattern |
|-------------|---------------|
| Agung tick | Single strong pulse (100ms, full intensity) — "The Heartbeat" |
| Channel ping (own units) | Quick double-tap (50ms-gap-50ms) — "The Handshake" |
| Channel ping (enemy detected) | Triple rapid buzz (30ms × 3) — "The Alert" |
| Buffer at 75% | Continuous low vibration (200ms, 30% intensity) — "The Warning Hum" |
| Buffer overflow | Escalating rapid pulses increasing in frequency (100ms→50ms→25ms over 500ms) — "The Cascade" |
| Combat (own unit eliminated) | Single sharp jolt + 500ms silence — "The Cut" |
| Combat (enemy eliminated) | Two sharp jolts 100ms apart — "The Strike" |
| EM emission threshold | Sustained gentle vibration, intensity proportional to emission level — "The Radiation" |
| Compression | Squeeze pattern: strong→weak→strong (100ms each) — "The Squeeze" |
| Topology stress | Background vibration frequency: 0.5Hz healthy → 2Hz stressed → 4Hz critical |

**Per-hand differentiation (Joy-Con, DualSense):**
- Left controller: architecture events (signals, compression, EM)
- Right controller: battlefield events (combat, movement, overflow)
- Both simultaneously: tick boundary pulse

**Strengths:**
- Works in ANY environment — noisy, quiet, public, private.
- Spatial awareness through hand differentiation on controllers.
- Subconscious processing — players learn haptic vocabulary faster than they learn caption vocabulary.
- The Cascade (overflow warning) is viscerally alarming — your phone literally vibrates faster and faster, demanding attention.

**Weaknesses:**
- **iOS has no Vibration API.** As of iOS 18, Safari does not support `navigator.vibrate()`. This mode is Android/controller only. iPhone players get nothing.
- **Limited pattern vocabulary.** Vibration motors can distinguish maybe 8-12 distinct patterns before they blur together. The 10 haptic events above are near the ceiling.
- **No channel identity.** Haptics can't distinguish WHICH channel fired — all pings feel the same "double-tap." This is a genuine information loss vs. audio.
- **Haptic fatigue.** Continuous vibration during a 40-tick battle drains battery and numbs the hand. Must auto-reduce background vibrations after 20 ticks.

---

## Option D: "The Screen Reader Bridge" — Full Accessibility for Blind Players

### How It Works

A parallel DOM layer (invisible visually, readable by screen readers) provides a complete textual model of the game state. This goes beyond deaf/HoH accessibility into full blind player support — a separate and more ambitious challenge.

**Plan Screen for Blind Players:**
- The workbench is a series of ARIA-labeled form controls. Blueprint name as heading, skills as checkbox group, rules as ordered list with drag (keyboard arrow keys), hooks as text inputs with channel autocomplete (ARIA combobox), context config as toggle switches.
- The board is a table: `<table aria-label="Battlefield, 8 by 8 grid">` with cells describing contents: "A1: empty, jungle terrain" / "C3: Scout, your unit, idle, buffer 4 of 6."
- Tab navigation follows a logical order: Blueprint list → selected blueprint details → production queue → board summary.

**Sealed Watch for Blind Players:**
- The screen reader narrates each tick as it resolves: "Tick 12. Scout at A3 moves to B3. Scout broadcasts on patrol-report to Relay at D5. Relay compresses patrol-report, 2 slots to 1. Relay broadcasts on compressed-alert to Striker at G7. Striker at G7 moves to F6. Enemy Scout at F4 eliminated by Striker at G7."
- Narration is generated from the tick event log — the same data that drives visual rendering and audio events.
- Speed control: at 1x, narration plays between ticks (1 second window). At 2x, narration is truncated to essential events only (combat, overflow, major signals). At 0.5x, narration includes detail (context slot changes, EM levels).
- The kulintang audio still plays alongside narration — blind players who CAN hear get both audio AND narration.

**Inspector for Blind Players:**
- Timeline navigation via arrow keys with spoken tick numbers.
- Unit inspection via Tab key cycling through units, with each unit's full state read aloud.
- Decision trace as bulleted spoken list: "Rule 3 matched: IF tagged enemy in perception range THEN move toward tagged. Context evaluated: slot 1 patrol-report from Scout, slot 3 enemy tag at F4. Action: move to F6."
- Buffer state as spoken list: "Context window: 5 of 8 slots occupied. Slot 1: patrol-report, age 3 ticks, used in decision. Slot 2: terrain observation, age 7 ticks, not used. Slot 3: enemy tag, age 1 tick, used in decision."

**Strengths:**
- **Complete game access for blind players.** Not a reduced experience — full decision-making, full analysis, full competitive play.
- **Leverages existing screen reader technology.** VoiceOver, NVDA, JAWS all work with ARIA live regions.
- **The game's text-heavy nature helps.** Robot Uprising is about information architecture, not visual reaction speed. A blind player configuring hooks and rules is doing the same cognitive work as a sighted player.
- **Inspector is arguably BETTER for blind players.** The decision trace read aloud is a more complete representation than the visual panel — hearing "Rule 3 matched because slot 3 had enemy tag" is faster than parsing a visual trace with connecting lines.

**Weaknesses:**
- **Sealed Watch is the hard problem.** Narrating 14 units' actions within a 1-second tick window is impossible at normal speech rate (~150 words/min = ~2.5 words/sec). At 2x speed, each tick has 0.5 seconds — maybe 5-6 words. Truncation to essential events is mandatory, meaning blind players get a lower-resolution view of Sealed Watch than sighted players.
- **Board spatial reasoning.** Sighted players see unit positions at a glance. Blind players must build a mental model from "Scout at A3, Relay at D5, Striker at G7." Grid coordinates are precise but slow to spatialize. A 14-unit army requires memorizing 14 positions.
- **Implementation cost is very high.** The parallel DOM layer must be maintained in sync with the Pixi.js canvas — every game state change must update both the visual renderer AND the accessibility DOM.
- **Testing requires blind player involvement.** No amount of sighted developer testing can validate the screen reader experience. Must recruit blind playtesters.

---

## Option E: "The Multimodal Stack" — RECOMMENDED

### How It Works

All four options above are layers that can be independently enabled:

| Layer | Default State | Target Audience |
|-------|--------------|-----------------|
| Subtitle Track | OFF (togglable) | Deaf/HoH, noisy environments |
| Light Board | PARTIAL (signal line enhancements always on, extras togglable) | Deaf/HoH, visual preference |
| Vibration Channel | AUTO (enabled on mobile, controller) | Mobile players, deaf/HoH |
| Screen Reader Bridge | AUTO (enabled when screen reader detected) | Blind/low-vision players |

**Auto-detection:**
- If `window.matchMedia('(prefers-reduced-motion)').matches` → Light Board reduced intensity.
- If screen reader detected (via `MutationObserver` on ARIA live region consumption) → Screen Reader Bridge activated.
- If `navigator.vibrate` available → Vibration Channel auto-enabled at low intensity.
- User can override all auto-detection in Settings.

**Settings Panel: "Audio Accessibility"**
```
┌─────────────────────────────────────────┐
│ AUDIO ACCESSIBILITY                     │
│                                         │
│ Subtitle Track          [OFF] [ON]      │
│   Verbosity:  ○ Minimal ● Standard ○ Full│
│   Font size:  [14px ▼]                  │
│   Persist:    ○ 2s  ● 5s  ○ Permanent  │
│                                         │
│ Visual Enhancements     [PARTIAL] [FULL]│
│   Signal line names     [ON]            │
│   Channel icons         [ON]            │
│   Overflow shake        [ON]            │
│   Tick flash            [OFF]           │
│   Reduced intensity     [OFF]           │
│                                         │
│ Haptic Feedback         [AUTO]          │
│   Intensity:  ████████░░ 80%            │
│   Tick pulse            [ON]            │
│   Signal buzz           [ON]            │
│   Combat jolt           [ON]            │
│   Overflow cascade      [ON]            │
│                                         │
│ Screen Reader           [AUTO]          │
│   Narration speed:      [1.0x ▼]        │
│   Detail level:         ○ Essential ● Standard ○ Verbose│
│   Board navigation:     ○ Row-first ● Column-first│
│                                         │
│ Presets:                                │
│   [Full Audio] [Eyes Only] [Eyes+Hands] │
│   [Ears+Hands] [Screen Reader] [Custom] │
└─────────────────────────────────────────┘
```

**The "No Audio Channel Is THE Accessibility Mode" Principle:**
From 6.10d — no single channel is marked as "the accessible option." All channels are equal presentation modes. A hearing player who enables subtitles is not using an accessibility feature — they're using a caption feature. A deaf player who enables Light Board is not using a substitute — they're using a visual enhancement. The language and UX treatment communicates this.

---

## Player Journeys

### Journey: Reina, 27, Deaf Software Engineer in Cebu

**Context:** Mission 6, just unlocked Command units. Born deaf, lip-reads and uses Filipino Sign Language. Plays on a desktop with a 27" monitor. Has never heard kulintang or any game audio.

**Minute 0:00 — Settings, First Launch**
Reina launched the game last week with default settings. The visual-only experience was good but she felt she was missing something — signal lines flashed but she couldn't tell which channel fired. She opens Settings > Audio Accessibility. She enables: Subtitle Track (Standard verbosity, 5s persist, 16px font), Visual Enhancements (Full — all options ON), and leaves Haptic OFF (no controller). She notices the presets and taps "Eyes Only" — it auto-configures everything. The label says "Eyes Only" not "Deaf Mode." She appreciates this.

**Minute 0:30 — Plan Phase, Enhanced Channel Visualization**
She opens her Relay blueprint and configures a hook on "threat-relay." As she types the channel name, a small procedural icon appears beside the autocomplete — a rotated diamond with a filled center, generated from the name hash. This is the channel's visual identicon. She remembers that "patrol-report" had a star icon. The channel wiring on the board now shows these icons at the connection endpoints — star at the Scout end, diamond at the Relay end, with a labeled line between them reading "threat-relay" in floating text.

She configures three more channels. The channel map panel (read-only) now shows four entries, each with its unique icon, name, and unit connections. She can visually distinguish her channels by icon shape alone, without color — critical since two channels might share similar colors.

**Minute 2:00 — EXECUTE, Full Light Board Experience**
She taps EXECUTE. The tick clock at the top lights up — each pip fills with cyan light as the tick resolves, and a PULSE ripple radiates outward across the board from the tick counter, a subtle blue wave that reaches the edges in 200ms. This is her tick boundary — she SEES the rhythm.

Tick 3: Her Scout broadcasts. The signal line from A3 to D5 THICKENS and GLOWS green, and a small star particle (the patrol-report channel icon) travels along the line from Scout to Relay. Floating text "patrol-report" appears above the line midpoint for 800ms. She can see exactly which channel fired, where the signal went, and what unit received it.

Tick 4: The Relay compresses the signal. A brief animation plays on the Relay tile — five small particles enter from the left (wide fan), three particles exit the right (narrow beam). The "wide→narrow" visual IS compression. Then the Relay broadcasts: the diamond particle travels along the threat-relay line to the Striker.

Tick 8: Buffer overflow on the Relay. The tile SHAKES — 2px displacement at 4Hz. The buffer bar shoots to full red with animated white sparks ejecting upward, like a fuse burning. The subtitle track at the bottom reads: `[T8] ⚠ CONTEXT OVERLOAD — Relay D5 (12/12 slots, 1 tick stunned)`. She sees both the spatial information (the shaking tile) and the precise information (the caption). Together, they exceed what audio alone would communicate.

Tick 9: Combat. The enemy Scout at F4 is eliminated. The red flash expands to 2-tile radius. The sprite shatters into pixel fragments. The brief tile color-inversion (100ms) creates a visual "crack." The subtitle reads: `[T9] ⚔ ELIMINATED — Enemy Scout F4 (by Striker G7)`.

**Minute 4:00 — Network Health Bar**
She glances at the Network Health Bar beside the tick clock. It's been amber for the last 3 ticks — her Relay is stressed. After the overflow at T8, it dips toward red. After the Relay recovers at T10 (stun cleared), it eases back to green-amber. She's reading network topology health at a glance, without audio.

**Minute 5:00 — Inspector with Captions**
The Inspector loads. She scrubs to Tick 4 (the compression event). The decision trace shows: "Relay D5 — compress activated. Input: patrol-report (2 context slots). Output: compressed-patrol (1 slot). Reason: compress skill prioritized over filter." Below, a note: `[Audio cue: "squish" sound effect at this tick]`. She appreciates the annotation — it tells her what hearing players experienced, building her understanding of the full game design even though she'll never hear it.

**UI Annotations:**
- Channel visual identicons: procedural icons from same hash as sonic identicons (6.02d)
- Signal line particles: icon shape travels along line, 800ms float text
- Tick flash: cyan ripple from tick counter, 200ms propagation to board edge
- Network Health Bar: beside tick clock, green→amber→red, updates per tick
- Subtitle track: bottom of Sealed Watch, semi-transparent dark background, scrolling
- Inspector audio cue annotations: italicized notes in decision trace describing what audio event would play


### Journey: Marcus, 52, Veteran Gamer with Progressive Hearing Loss

**Context:** Mission 8, competitive player. Moderate high-frequency hearing loss (4kHz+). Hearing aids help but he turns them off for gaming (feedback with headphones). Plays with headphones + subtitles + vibration on DualSense controller.

**Minute 0:00 — Hybrid Setup**
Marcus plays with audio ON but at reduced volume, subtitles ON at Minimal verbosity (combat + overflow only — he doesn't need signal captions because he can hear the louder pings), and DualSense haptics at 100%. His setup: headphones carry the kulintang melody and low-frequency agung (he hears these clearly without aids), the DualSense carries the tick pulse and combat jolts (he FEELS the rhythm), and subtitles catch the high-frequency events he might miss (overflow whines are at 2-6kHz, above his hearing range).

**Minute 1:00 — Sealed Watch, The Hybrid Channel**
The agung hits — deep, resonant, he hears it clearly in headphones. The DualSense pulses — he feels it in his palms. The kulintang melody plays in his comfortable frequency range (500Hz-3kHz). He can hear the overall musical shape — the army sounds dense and active.

Tick 7: A buffer overflow begins. The rising whine starts at 2kHz (he can hear this) and climbs to 6kHz (he loses it above 4kHz). But the DualSense begins the "Cascade" haptic — escalating rapid pulses in his right hand. The combination of fading audio whine + escalating vibration creates a multi-sensory warning that's MORE alarming than either channel alone. His eyes snap to the board, looking for the shaking tile.

Tick 8: The subtitle appears: `[T8] ⚠ OVERLOAD — Command B4`. His eyes were on the wrong unit. The subtitle told him WHERE. He'll check the Command unit in Inspector.

**Minute 3:00 — Inspector, Confirming What He Felt**
He scrubs to T7-T8. The Command unit's buffer chart shows the spike. The decision trace shows six signals arriving simultaneously — all six hook slots receiving on the same tick. He felt the cascade in his hands before he saw it on screen, and the caption told him which unit when his eyes couldn't find it fast enough. Three channels, one event, full information.

**UI Annotations:**
- Hybrid audio+haptic+subtitle mode: each channel carries different information density
- DualSense Cascade haptic: right hand only (battlefield events), escalating 100ms→25ms pulses
- Subtitle Minimal mode: combat + overflow only, positioned bottom-left (out of board center)


### Journey: Aisha, 14, Autistic Student Who Prefers Silence

**Context:** Mission 4, learning hooks. Not deaf — she has excellent hearing — but finds game audio overstimulating. She plays all games muted. School in Manila, plays on a laptop during study breaks.

**Minute 0:00 — Muted Setup**
Aisha muted the game on first launch. The kulintang melody, beautiful as it might be, was too much sensory input alongside visual learning. She opens Settings and discovers Audio Accessibility. She selects "Eyes Only" preset, which enables all visual enhancements without any audio. She also disables "Tick flash" (the board ripple is too much visual motion for her) and enables "Reduced intensity" (particle effects at 50% brightness). She leaves haptics off.

The game boot log appears: `AUDIO SUBSYSTEM: Standby. Visual telemetry: Active. Note: All acoustic intelligence is mirrored visually. This system operates at full capacity in any sensory configuration.` The diegetic framing reassures her that she's not missing content — the AI acknowledges her setup as a valid operating mode.

**Minute 1:00 — Plan Phase, Calm Configuration**
Without audio, the plan phase is serene. No kulintang, no config-change pings. The visual feedback is sufficient — skill toggles flash briefly, hook connections draw lines on the board, rule reordering shows position changes. She finds she can concentrate MORE on the rule logic without audio competing for attention.

She configures a hook on "enemy-spotted." The channel visual identicon (a small triangle icon) appears. She notes it, recognizing that this icon will help her track this channel's signals during Sealed Watch.

**Minute 2:30 — EXECUTE, Visual-Only Sealed Watch**
No agung, no kick, no melody. The Sealed Watch is QUIET — just the hum of her laptop fan. She watches the board. The tick clock pips light up one by one (no ripple — she disabled that). Units snap to positions. Signal lines glow and particles travel along them. She reads the floating channel names as they appear: "enemy-spotted" from Scout, "compressed-intel" from Relay.

She notices something: without audio competing for attention, she's tracking signal lines MORE carefully. She spots a signal that goes from Relay to Striker but the Striker doesn't act on the next tick. In a noisy, musical Sealed Watch, she might have missed this — the visual was one of many stimuli. In silence, it stands out. She makes a mental note to check the Striker's rules in Inspector.

**Minute 4:00 — Inspector, Pure Analysis**
The Inspector is her favorite screen. Quiet, analytical, click-to-explore. She clicks the Striker at Tick 8. The decision trace shows: Rule 1 (engage if enemy adjacent) — no match. Rule 2 (move toward tagged enemy) — no match. Rule 3 (move toward signal source) — matched but overridden by Rule 1's implicit priority. Wait — Rule 1 didn't match, but it blocked Rule 3? She re-reads. No — Rule 3 matched and the Striker moved, but toward the signal SOURCE (the Relay) not the enemy. She misconfigured the rule: "move toward signal source" when she meant "move toward reported enemy position." The silence helped her catch this in Sealed Watch; Inspector confirmed it.

**UI Annotations:**
- "Eyes Only" preset: all audio OFF, all visual enhancements ON
- Reduced intensity sub-option: particle effects at 50% brightness, no tick flash
- Boot log diegetic framing: AI acknowledges sensory configuration as valid
- Silence as cognitive advantage: visual-only mode can enhance analytical focus

---

## Strengths and Weaknesses

### Strengths
- **No information loss.** Every audio event has a visual/haptic/text equivalent that carries the same or MORE information.
- **Preset system is fast.** One tap on "Eyes Only" / "Ears+Hands" / "Screen Reader" configures everything. No need to understand 15 individual toggles.
- **Hearing players benefit too.** Subtitles on commutes, visual enhancements for streaming (viewers see more), haptics for emotional engagement.
- **The diegetic framing prevents "lesser experience" feeling.** The boot log treats every sensory configuration as a valid system mode, not a disability accommodation.
- **Channel visual identicons solve the biggest gap.** The procedural icon system (same hash as sonic identicons) provides channel tracking for deaf players that's arguably superior to audio — icons persist on screen, sounds are transient.

### Weaknesses
- **Sealed Watch narration for blind players is genuinely lower-resolution.** 14 units acting in 1 second cannot be narrated in 1 second. This is a real information loss that no design can fully overcome — audio (parallel processing) is inherently higher-bandwidth than speech (serial processing).
- **Testing matrix is enormous.** 4 layers × 3+ sub-options each × 3 game screens = 36+ configurations to test. Combinatorial explosion in QA.
- **iOS Vibration API gap.** iPhone users get no haptic feedback in the browser. PWA on iOS inherits this limitation.
- **Visual enhancement performance cost.** Light Board mode at full intensity adds particle effects that may strain budget phones already at their rendering budget for Pixi.js.

---

## Interaction Effects with Locked Decisions

- **Sealed Watch no-skip, no-pause:** Accessibility modes must work within this constraint. Subtitles scroll in real time. Screen reader narrates in real time. No "pause to read" option. This is harsh for blind players at 2x speed but preserves the sealed watch design.
- **Inspector two-act debrief:** Accessibility information not absorbed during Sealed Watch can be fully explored in Inspector. The Inspector IS the accessibility equalization layer — every event is inspectable at any pace.
- **One-shot one-kill:** The dabakan combat crack and its visual/haptic equivalents must be UNMISSABLE. A missed elimination notice could cause strategic confusion. The multi-channel approach (visual + caption + haptic) ensures redundancy.
- **React + Pixi.js:** The subtitle track and settings panel are React components (DOM, screen reader accessible). The Light Board enhancements are Pixi.js effects. The screen reader bridge is a parallel React DOM tree. This maps cleanly to the locked tech stack — DOM for accessible content, Canvas for visual content.

---

## Comparable Games

- **The Last of Us Part II (Naughty Dog, 2020):** 60+ accessibility options, BAFTA award. Key lesson: accessibility is not a toggle but a spectrum of independently configurable options. Robot Uprising's layer system follows this principle.
- **Celeste (Matt Thorson, 2018):** Assist Mode with zero judgment — no achievements disabled, no narrative changes. Key lesson: accessibility options should never feel like "easy mode." The boot log framing in Robot Uprising ("valid system configuration") follows Celeste's respectful approach.
- **Forza Horizon 5 (Playground Games, 2021):** Screen reader support for a racing game — an audio-described visual experience. Key lesson: even genres that seem inherently visual can be made accessible. Robot Uprising's information-architecture focus is MORE accessible than visual-reaction games.
- **Hades (Supergiant, 2020):** "God Mode" as diegetic difficulty assist. Key lesson: diegetic framing transforms accessibility from clinical accommodation to narrative-consistent feature. The boot log acknowledging sensory configuration is the Robot Uprising equivalent.
- **Dead Cells (Motion Twin, 2018):** Customizable visual cues for audio events, developed in collaboration with deaf community. Key lesson: involve deaf players in design, not just testing. The Light Board mode should be co-designed with deaf gamers.

---

## Sensory Description

**Eyes Only mode, Sealed Watch, 10 units active:**
The board is alive with light. No sound at all — just your laptop humming. The tick clock pips illuminate one by one, a steady visual metronome. Signal lines glow: a star particle races from Scout at A2 to Relay at D4, the floating text "patrol-report" appearing and fading like a breath. The Relay pulses once — five small dots enter from the left edge, three exit the right edge, the compression animation as clear as a diagram. A diamond particle launches from Relay toward Striker. The Striker moves. The whole chain — perception, compression, transmission, action — played out in 2 seconds of pure visual narrative. No sound needed.

The buffer overflow is visual drama: Relay at D4 begins shaking, tiny white sparks rising from its tile like a fuse burning. The buffer bar, already amber, shoots to crimson. The subtitle at the bottom prints: `[T12] OVERLOAD — Relay D4 (12/12)`. You SEE the crisis, READ the crisis, and understand it before the next tick fires.

Combat is a flash of red expanding outward, a sprite shattering into pixel dust, a brief tile color inversion — white-to-black-to-normal in 100ms — that looks like a reality glitch. The Network Health Bar at the top dips from green to amber. Everything you need to know, in light and motion and text.

---

## The TikTok Clip

Split screen: left side is full audio with the Kulintang Machine in all its glory, right side is Eyes Only mode with enhanced visuals and subtitles. Same mission, same tick, same events. The audio side has the agung BOOM and babendil pings. The visual side has the pulse ripple and traveling particles. Both players see the same strategic information. Caption: "same game, same depth, zero sound." Closes on the settings screen showing preset buttons. The message: accessibility is not compromise.
