# 6.06b-iii — Cross-Platform EXECUTE Ritual Equivalents

## Overview

The DualSense adaptive trigger EXECUTE ritual (6.06b) is the game's single most consequential physical interaction — a progressive resistance gate that transforms "I'm done configuring" into a somatic commitment. But DualSense is one controller on one platform. The majority of players will never touch an adaptive trigger. **The commitment ritual must exist everywhere, and it must feel equally weighty on every input device.**

This document explores five platform-specific EXECUTE ritual designs: Xbox (impulse triggers), Switch (Joy-Con HD Rumble), keyboard/mouse, mobile touch, and generic/fallback controller. Each must answer the same design question: *how do you make a player's body participate in the decision to commit their information architecture to battle?*

The core principle: **the ritual is not the resistance. The ritual is the duration.** What makes the DualSense EXECUTE work is not that R2 is hard to press — it's that the press takes ~800ms of deliberate, continuous physical effort. Any input device can create an 800ms commitment window. The question is what fills that window with meaning on each platform.

---

## The EXECUTE Ritual Design Contract

Every platform's EXECUTE ritual must satisfy these five properties:

1. **Duration:** ≥600ms of continuous, deliberate player input. No accidental single-tap execution.
2. **Abort:** The player can cancel at any point during the ritual by releasing/stopping. The system resets visually and haptically.
3. **Progressive feedback:** The ritual communicates progress through at least two sensory channels (visual + one of: haptic, audio, or both).
4. **Culmination:** A distinct "commit moment" — a felt transition from "in progress" to "done" — with sensory punctuation.
5. **Rarity respect:** The ritual is performed once per mission attempt (every 3-8 minutes). It must feel special every time. No fatigue.

---

## Variant A: Xbox Controller — "The Impulse Ramp"

### Hardware Capabilities

The Xbox One/Series controller has four independent vibration motors: two traditional rumble motors in the grips (left heavy, right lighter) and two **impulse trigger motors** — small linear resonant actuators embedded directly in the left and right triggers. These can't create resistance (the trigger travels freely), but they can vibrate the trigger itself independently of the grip motors, creating a sensation localized to the player's index finger.

The Xbox impulse triggers are underexploited in most games. Forza Motorsport uses them for ABS and terrain feedback. Halo uses them for weapon recoil asymmetry. Most strategy games ignore them entirely.

### The Ritual

**Input:** Hold RT (right trigger) fully depressed for 800ms.

**Phase 1 — Engagement (0-200ms):**
The moment RT passes 50% travel, the right impulse trigger motor begins a slow, rising vibration — starting at 10% intensity, climbing linearly. The screen shows the EXECUTE button's fill ring beginning to trace clockwise. A low sub-bass tone (60Hz) fades in through the audio system, synchronized to the motor's frequency. The left grip motor pulses once — a single heartbeat thud — marking the start of the ritual.

**Phase 2 — Commitment (200-600ms):**
The right impulse trigger vibration reaches 40% intensity and holds. The left grip motor begins a slow heartbeat pulse (1.2Hz, matching Phase 1). The fill ring continues tracing. At 400ms, the left trigger impulse motor joins — a quieter echo of the right trigger's vibration. Both index fingers now feel the building energy. The sub-bass tone rises in pitch from 60Hz to 120Hz. The EXECUTE button's glow intensifies, casting a faint cyan bloom on surrounding UI elements.

**Phase 3 — Culmination (600-800ms):**
At 600ms, all four motors ramp simultaneously to 70% for 100ms — a surge. At 700ms, the motors drop to 20% — a breath. At 800ms: **all motors fire simultaneously at 90% for a single 15ms impulse** — a sharp, clean *crack* felt in both triggers and both grips. The fill ring completes. The screen flashes white for a single frame (16ms). The sub-bass tone cuts to silence. The Sealed Watch begins.

**Abort behavior:** Releasing RT at any point causes all motors to immediately cut to zero. The fill ring rewinds with a 200ms ease-out animation. A soft descending tone (three notes, 150ms total) plays — the "stand down" motif. No penalty, no judgment. The button returns to its ready state.

**Why this works on Xbox:** The impulse triggers can't simulate resistance, but they can create *escalating urgency in the fingertip*. The vibration-in-the-trigger is physiologically distinct from grip rumble — it's more intimate, more precise, more like touching a live wire. By engaging both triggers, the player's hands mirror each other, creating a symmetrical embodiment of "I am committing with my whole body."

### Comparable: Forza Motorsport's ABS feedback

Forza uses impulse triggers to simulate anti-lock braking — rapid stuttering in the trigger when wheels lock. It's informational, not ritual. But the key insight transfers: **players learn to read impulse trigger vibration unconsciously.** After 10 hours of Forza, the player's finger "knows" the difference between grip and slip before their eyes process the visual. Robot Uprising's EXECUTE impulse ramp trains the same unconscious recognition — after 20 executions, the player's fingers *know* what commitment feels like.

### Sensory Description

You've spent four minutes wiring your relay chain. The production queue is set. You navigate to the EXECUTE button — it pulses gently, waiting. You pull RT and hold. Your right index finger begins to buzz — a tiny, precise vibration growing under the pad of your finger. Your left palm receives a single deep thud: *one heartbeat.* The screen's fill ring traces clockwise. The buzz climbs. Your left index finger joins — both triggers humming now, synchronized, building. A low tone rises beneath everything, almost below hearing. Your palms pulse together. Then — a surge, a breath, and a single sharp *crack* across all four motors simultaneously. Silence. The screen flashes. Battle begins.

---

## Variant B: Nintendo Switch Joy-Con — "The HD Rumble Crescendo"

### Hardware Capabilities

The Joy-Con's HD Rumble uses linear resonant actuators with a wider frequency range than traditional eccentric mass motors. They can simulate specific frequencies (160-320Hz fundamental, with harmonics), creating distinct "textures" — the famous ice-cube-in-a-glass demo. Critically, each Joy-Con vibrates independently, and in separated mode, the player holds one in each hand.

HD Rumble's strength is **tonal specificity** — it can produce sounds you feel rather than hear. Its weakness is intensity: it's subtler than DualSense grip motors or Xbox rumble. The ritual must lean into precision over power.

### The Ritual

**Input:** Hold ZR (right shoulder button) for 800ms. (Note: Joy-Con triggers are digital, not analog. There is no trigger travel to modulate. The ritual is purely time-based with HD Rumble feedback.)

**Phase 1 — The Tone (0-300ms):**
The right Joy-Con begins a low-frequency HD Rumble tone at 160Hz — the player feels a warm, steady hum in their right palm. It's the "engine idling" sensation. The fill ring begins. On screen, the EXECUTE button's border traces clockwise in cyan. A single kulintang gong tone sounds — soft, distant, resonant.

**Phase 2 — The Chord (300-600ms):**
At 300ms, the left Joy-Con activates at 200Hz — a different pitch. The two Joy-Cons are now producing a felt **interval** — a harmonic relationship between the hands. The player is holding a chord. The visual fill ring passes halfway. A second gong layer enters, higher in pitch. The two haptic frequencies create a subtle beat frequency (~40Hz) that the player perceives as a gentle wavering between the hands — the system is "alive" and building.

**Phase 3 — The Resolution (600-800ms):**
At 600ms, both Joy-Cons shift upward: right to 240Hz, left to 320Hz — a wider interval, more tension. The beat frequency increases to ~80Hz — the wavering quickens. The fill ring approaches completion. At 750ms, both frequencies converge toward 260Hz — the chord "resolving." At 800ms: both Joy-Cons fire a sharp 320Hz burst for 20ms, then silence. A third gong — the deepest, loudest — rings through the speakers. The fill ring completes. Sealed Watch begins.

**Abort behavior:** Releasing ZR causes both Joy-Cons to descend in frequency over 200ms (a "winding down" tone) before cutting out. The fill ring rewinds. A wooden percussion *tok* sound — the "not yet" cue.

**Why this works on Switch:** HD Rumble's tonal precision means the Joy-Cons can literally play music through the player's hands. The ritual is a three-note harmonic progression: tension, building, resolution. The convergence of two independent frequencies into a unison creates a felt analogy for "everything coming together" — which is exactly what EXECUTE represents. The player's scattered configuration converges into a committed architecture.

### The Separated Joy-Con Advantage

When each Joy-Con is in a separate hand (tabletop or TV mode), the left-right haptic split becomes more perceptible. The player feels two distinct tones converging across the space between their hands. This spatial dimension is unique to Switch — DualSense and Xbox put all haptics in one held object. Two separate vibrating objects create a **stereophonic haptic field** that no other controller matches.

### Comparable: Thumper's Rhythm Haptics

Thumper on Switch uses HD Rumble to make the player feel rhythmic impacts that synchronize with the visual beetle-on-rail. The haptic rhythm becomes inseparable from the gameplay rhythm. Robot Uprising's EXECUTE harmonic progression is a similar principle: the feel and the game state are one.

### Sensory Description

You hold ZR. The right Joy-Con hums — a warm, low vibration that fills your right palm like cupping a purring cat. Two seconds later, your left hand joins — a different tone, slightly higher. You're holding a chord between your hands. The two vibrations waver against each other, a gentle oscillation passing back and forth across the gap between your palms. The pitch rises. The wavering quickens. Then — both hands converge into a single sharp buzz, a deep gong rings, and silence. Your architecture is deployed.

---

## Variant C: Keyboard/Mouse — "The Long Press & Screen Shake"

### Hardware Capabilities

Keyboard and mouse provide zero haptic feedback. No vibration, no resistance, no tactile channel whatsoever. The ritual must be constructed entirely from **visual and audio feedback** responding to a sustained input. This is the hardest platform to design for — and the most common one, since the game is web-based.

### The Ritual

**Input:** Click and hold the EXECUTE button (left mouse button) for 800ms. Alternatively, hold Enter/Space for 800ms when the EXECUTE button is focused.

**Phase 1 — The Grip (0-300ms):**
On mouse-down / key-down, the EXECUTE button depresses visually — it sinks 3px (a pressed state, like a physical button being held). The fill ring begins tracing. The screen begins a **micro-tremor** — the entire game canvas shifts ±0.5px at 30Hz. This is barely perceptible consciously but creates an unconscious sense of tension, like standing on a platform that's about to move. A low rumble tone (80Hz, 15% volume) fades in. The EXECUTE button's text shifts from "EXECUTE" to a progress indicator: a row of pips lighting up left-to-right.

**Phase 2 — The Build (300-600ms):**
The micro-tremor intensifies to ±1.5px at 20Hz — now visible, a controlled vibration. The rumble tone climbs to 120Hz, 25% volume. The EXECUTE button's glow radius expands — a soft cyan bloom spreads outward, illuminating nearby UI panels as if the button is radiating energy. The fill ring passes 50%. Additional visual: the production queue strip at the bottom begins a subtle left-to-right "loading" animation — each blueprint icon briefly highlights in sequence, as if the factory is spinning up.

**Phase 3 — The Commit (600-800ms):**
At 600ms, the screen shake becomes **directional** — a single strong pull toward the EXECUTE button, 4px, then release. The entire UI "breathes in" toward the button. The rumble tone peaks at 160Hz, 35% volume. At 700ms, the shake reverses — a 2px push outward, the exhale. At 800ms: the screen **snaps** to stillness. A single sharp audio transient — a metallic *clack* reminiscent of a breaker switch being thrown. The button releases (rises 3px back to normal), the fill ring completes, and for exactly 1 frame (16ms), the EXECUTE button flashes pure white before the screen transitions to Sealed Watch.

**Abort behavior:** Releasing the mouse button at any point causes the screen shake to dampen over 150ms (exponential decay). The rumble tone descends and cuts. The fill ring rewinds. A soft "ssshh" sound — air escaping, pressure released.

**Why this works on KB/M:** Without haptics, screen shake becomes the somatic channel. The micro-tremor creates a physical quality — the monitor doesn't literally vibrate, but the visual tremor activates the same neural pathways that process physical instability. The player's body unconsciously braces against it. The "breathe in" at 600ms is the commitment moment — the screen pulling toward the button mirrors the player's attention narrowing to a single point. The final snap to stillness is the resolution: all energy collapses to zero, and the architecture is locked.

### The Cursor Lock Option

An optional enhancement: during the hold, the cursor smoothly drifts toward the center of the EXECUTE button (1px/frame) and a subtle radial blur appears around the cursor. This creates a "gravity well" feel — the action is pulling you in. If the player moves the mouse more than 40px from the button center during the hold, the ritual aborts (the cursor escapes the gravity well). This adds a spatial commitment dimension: you must keep your hand still.

### Comparable: Celeste's Screen Shake Design

Celeste uses screen shake as emotional punctuation — it accompanies deaths, dashes, and boss attacks. Crucially, Celeste also provides a screen shake intensity slider (0-100%) in accessibility options. Robot Uprising should follow this pattern: the EXECUTE screen shake should have an intensity option (None / Subtle / Standard / Dramatic) in Settings, ensuring photosensitive players and motion-sensitive players can reduce or eliminate it without losing the visual fill ring and audio cues.

### Comparable: Nuclear Launch Keys

The "two-key simultaneous turn" trope from nuclear launch scenes (and games like DEFCON) creates weight through cooperative physicality. For single-player KB/M, the equivalent is **sustained deliberate stillness** — holding a key while the screen tells you something important is happening. The player's contribution is patience and resolve, not dexterity.

### Sensory Description

You click EXECUTE and hold. The button sinks under your cursor. The screen begins to tremble — barely, like a train passing in the distance. A low growl rises beneath the music. Your cursor sits motionless on the depressed button. The tremor builds — visible now, the whole workbench vibrating. Pips light up across the button face. A cyan glow spreads from under the button like light through a crack. Then the screen pulls inward — everything tilts toward the button for a fraction of a second — and snaps flat. *Clack.* Stillness. White flash. Battle.

---

## Variant D: Mobile Touch — "The Swipe-to-Launch"

### Hardware Capabilities

Mobile devices have a single vibration motor (most Android phones) or a Taptic Engine (iPhones). iOS provides structured haptic patterns through UIImpactFeedbackGenerator (light/medium/heavy/rigid/soft) and UINotificationFeedbackGenerator (success/warning/error). Android provides VibrationEffect with customizable waveforms. Neither platform provides trigger resistance or sustained modulated vibration comparable to console controllers.

Touch screens provide one unique capability: **gesture as ritual.** The player's finger traces a path across glass. The path can have length, direction, speed, and shape. No other platform offers this spatial dimension to the commitment action.

### The Ritual

**Input:** Swipe the EXECUTE handle rightward across a 200px track (approximately 50% of screen width on a standard phone).

**Layout:** At the bottom of the Plan screen (above the production queue), a **launch rail** appears when the player has at least one blueprint configured. The rail is a horizontal track, 200px wide, 56px tall, with a circular handle (48px diameter) on the left side. The handle glows cyan with a subtle pulse. The track interior shows a gradient from dark (left) to bright cyan (right). Etched into the track: chevrons pointing rightward — >>>>> — as directional affordance.

**Phase 1 — Grip (Touch down on handle):**
The handle scales up 10% on touch (a "picked up" feel). A single medium haptic tap fires. The track illuminates slightly. All other UI elements dim to 70% opacity — the rail is the only interactive element. The production queue strip below the rail begins its sequential highlight animation.

**Phase 2 — Slide (Dragging rightward, 0-200px):**
As the player drags rightward, the handle follows their finger. The track fills behind the handle with solid cyan — a liquid-fill effect, as if pouring energy into the rail. Haptic feedback fires as **rhythmic taps** that accelerate with distance:
- 0-50px: taps every 40ms (slow heartbeat)
- 50-100px: taps every 25ms (quickening)
- 100-150px: taps every 15ms (racing)
- 150-200px: continuous buzz (commitment zone)

The chevrons in the unfilled portion of the track animate rightward, encouraging continued motion. A low tone rises in pitch proportional to handle position. At 75% travel (150px), the handle enters a "commitment zone" — the track edge glows gold, and the haptic shifts to continuous vibration.

**Phase 3 — Release in commitment zone (≥150px):**
When the player lifts their finger within the commitment zone: a single **heavy** haptic impact (iOS: .heavy, Android: 200ms amplitude 255). The handle snaps to the right end of the rail with a spring animation (overshoot + settle, 200ms). The filled track flashes white. The "breaker switch" *clack* sound fires. The screen transitions to Sealed Watch.

**Abort behavior (release before 150px):** The handle snaps back to the left with a spring animation. The fill drains rightward (a liquid "emptying" effect). A soft descending tone plays. A light haptic tap confirms the abort. No penalty.

**Abort behavior (drag vertically off track):** If the finger moves more than 60px above or below the track center, the handle grays out and the fill pauses. A "stretch" visual connects the handle to the finger position, rubberband-style. Releasing while off-track aborts.

### Why This Works on Mobile

The swipe-to-launch borrows from two deeply learned mobile patterns:

1. **Slide to unlock (iOS pre-2017):** The most universally understood mobile gesture. "Slide to do the important thing." The mental model is already trained into a billion users.
2. **Slide to confirm (banking apps, deletion confirmations):** High-stakes mobile actions already use sliding tracks. Players understand that a swipe across a track means "I really mean this."

The spatial dimension — physically dragging your finger 200 pixels — creates duration (600-800ms at natural speed) and effort (gross motor movement, not a micro-tap). The accelerating haptic heartbeat creates a rising tension arc that mirrors the console controller experiences. The commitment zone at 75% travel mirrors the DualSense snap-through: most of the journey is "building," and the final quarter is "committing."

### The No-Haptic Fallback (Older Android)

Some budget Android phones have no vibration motor or only a basic ERM motor that can't produce structured patterns. For these devices:
- Visual feedback carries the entire ritual: the liquid fill, the accelerating chevrons, the commitment zone glow
- Audio feedback compensates: the rising tone becomes more prominent, and the rhythmic "taps" become audible clicks (like a ratchet mechanism)
- The ritual is still effective — the spatial gesture and visual fill create sufficient commitment weight

### Comparable: Tinder's Swipe

Tinder's core mechanic is a swipe that commits. Right-swipe = "I choose this." The gesture is fast, disposable, low-stakes — the opposite of what EXECUTE needs. But the *principle* is the same: lateral finger movement as decision expression. Robot Uprising's longer track, accelerating haptics, and commitment zone transform Tinder's casual flick into a deliberate launch sequence.

### Comparable: iOS "Slide to Power Off"

Apple's shutdown gesture requires a full-width swipe with a labeled track. It's deliberately slow and deliberate — you can't accidentally power off your phone. The design language says "this is irreversible." EXECUTE borrows this gravity.

### Sensory Description

You've finished your Command agent config on the train. The launch rail sits at the bottom of the screen — a dark track with glowing chevrons pointing right and a cyan circle handle. You press your thumb on the handle. It swells slightly under your touch. Everything else dims. You drag right. Your phone begins to tap against your thumb — *tick... tick... tick-tick-tick-ticktickticktick* — heartbeats accelerating as the track fills with liquid cyan light behind your thumb. The chevrons race ahead. The edge of the track turns gold. You're in the zone. You lift your thumb. *THUNK.* The handle snaps to the end. White flash. Battle.

---

## Variant E: Generic Controller / Fallback — "The Hold & Heartbeat"

### Hardware Capabilities

Generic USB gamepads, Steam Controller in non-Steam mode, accessibility devices (switch controllers, Xbox Adaptive Controller), and any unrecognized controller that the Web Gamepad API reports. These typically have 0-2 basic ERM rumble motors with no frequency control — just on/off and intensity (0-100%). Some have no rumble at all.

### The Ritual

**Input:** Hold the designated EXECUTE button (typically A/Cross/South face button) for 800ms.

**Phase 1 — Start (0-300ms):**
If rumble is available: a low-intensity continuous buzz (20%) in both motors. Visual: the standard fill ring traces clockwise. Audio: the rising sub-bass tone. The EXECUTE button depresses visually.

**Phase 2 — Build (300-600ms):**
Rumble intensity increases to 50%. The motors begin a pulse pattern at 1.5Hz — *buzz-silence-buzz-silence* — a heartbeat. Visual: fill ring continues, glow expands. Audio: tone rises, production queue animates.

**Phase 3 — Commit (600-800ms):**
At 600ms, the heartbeat accelerates to 3Hz. At 700ms, continuous 80% rumble. At 800ms: full 100% rumble for 20ms, then silence. *Clack.* Visual flash. Sealed Watch begins.

**No-rumble fallback:** If the Gamepad API reports no haptic actuators, the ritual relies entirely on visual (fill ring, screen bloom, micro-tremor from KB/M variant) and audio (tone, clack). The hold-to-confirm timing and visual feedback are sufficient — the ritual is degraded but functional.

**Why this works as fallback:** The heartbeat metaphor (which also appears in the DualSense EXECUTE button highlight) is the universal through-line. Every platform variant contains a rising heartbeat pattern in at least one sensory channel. On generic controllers, the heartbeat is the *only* haptic expression — but because it's the simplest and most universal, it's also the most recognizable.

### Accessibility: Switch/Button Controller Adaptation

For players using adaptive switches or eye-tracking with dwell-to-select: the 800ms hold requirement IS the commitment window, identical to the standard dwell time for selection (typically 500-1500ms). For these players, EXECUTE is not a special gesture — it's the same deliberate dwell they use for everything, but the visual/audio feedback (fill ring, rising tone, heartbeat) communicates that this particular dwell is consequential. The accessibility principle: **the ritual's weight comes from its sensory feedback, not from physical difficulty.**

---

## Cross-Platform Comparison Matrix

| Dimension | DualSense (6.06b) | Xbox Impulse | Joy-Con HD Rumble | KB/Mouse | Mobile Touch | Generic/Fallback |
|-----------|-------------------|-------------|-------------------|----------|-------------|-----------------|
| **Primary channel** | Trigger resistance | Trigger vibration | Tonal frequency | Screen shake | Spatial gesture | Visual fill ring |
| **Secondary channel** | Grip rumble | Grip heartbeat | Harmonic convergence | Audio tone | Accelerating haptic taps | Heartbeat rumble |
| **Duration** | 800ms | 800ms | 800ms | 800ms | 600-800ms (swipe speed) | 800ms |
| **Abort method** | Release R2 | Release RT | Release ZR | Release mouse/key | Release before zone / drag off | Release button |
| **Unique quality** | Physical resistance | Fingertip intimacy | Stereo haptic chord | Visual gravitation | Spatial commitment path | Universal baseline |
| **Fatigue risk** | None (1/attempt) | None | None | Mild (screen shake) | Low (natural gesture) | None |
| **Culmination feel** | Snap-through + clack | 4-motor crack | Harmonic resolution + gong | Screen snap + clack | Handle snap + thunk | Silence after heartbeat |
| **Without haptics** | N/A (hardware req) | Fill ring + audio only | Fill ring + audio only | Full experience unchanged | Ratchet clicks + visual fill | Fill ring + audio only |
| **Emotional register** | Weight / resistance | Electricity / energy | Harmony / convergence | Tension / stillness | Momentum / velocity | Heartbeat / patience |

---

## The Universal Through-Line: Five Invariants

Across all six platform variants, these elements are **identical**:

1. **The fill ring.** A circular progress indicator on the EXECUTE button traces clockwise over ~800ms. Same speed, same cyan color, same completion flash. This is the visual constant that unifies the experience across platforms.

2. **The *clack*.** Every platform culminates in the same audio transient — a metallic breaker-switch sound. Whether you felt trigger resistance, finger vibration, screen shake, or a swipe, the *clack* is always the same. It becomes the Pavlovian marker: clack = committed.

3. **The production queue spin-up.** During every EXECUTE hold, the production queue strip shows a left-to-right sequential highlight of blueprint icons. This visual animation is platform-independent and communicates "the factory is preparing to build what you've designed."

4. **The stand-down motif.** Every abort plays the same descending three-note audio cue. Regardless of platform, aborting an EXECUTE sounds the same. The player's auditory vocabulary for "not yet" is universal.

5. **The white flash.** One frame (16ms) of white overlay on the EXECUTE button at the moment of commitment. Universal across all platforms. Brief enough to be subliminal, bright enough to mark the boundary between Plan and Sealed Watch.

---

## Interaction Effects

### × DualSense Adaptive Triggers (6.06b)
This document explicitly designs what the parent document deferred. The five DualSense variations (Fixed Gate, Confidence Meter, Escalating Stakes, Ratchet, Breath) each get a distinct cross-platform translation. The Confidence Meter (resistance scales with config completeness) translates to: **fill ring speed** scaling with config completeness (faster fill = lighter commitment for complete configs, slower fill = heavier commitment for incomplete ones) across ALL platforms. This is the one variation that can be universal.

### × Haptic Vocabulary (6.06a)
The EXECUTE ritual sits at the apex of the haptic vocabulary hierarchy — Category 5 (highest urgency, highest significance). Every other haptic event (UI confirmation, board events, signal delivery) is calibrated BELOW the EXECUTE culmination intensity. The 90-100% intensity of the final EXECUTE burst is reserved exclusively for this moment. On platforms without haptics (KB/M), the equivalent is that the screen shake intensity during EXECUTE exceeds any other screen shake in the game.

### × Sealed Watch Purity (Locked)
The sealed watch is "no skip, no pause, no tools." The EXECUTE ritual is the gateway — the last moment of player agency before control is surrendered. The ritual's duration (800ms) creates a natural buffer between active planning and passive observation. The emotional transition is: *doing → committing → watching.* The commitment window IS the transition.

### × Accessibility (6.08)
Every platform variant has a no-haptic fallback. The visual fill ring + audio tone are always present. For photosensitive players: the white flash is governed by the reduced-motion accessibility setting (replaced with a soft fade). For motor-impaired players using switch controllers: the 800ms dwell-to-confirm is within standard dwell time ranges (configurable from 500-1500ms in accessibility settings). For mobile players with motor difficulties: a tap-and-hold alternative replaces the swipe (same timing, same fill ring, no spatial gesture required — activated in accessibility settings).

### × Streaming/Content Creation (6.04)
The EXECUTE ritual is one of the game's key "clip moments." The 800ms duration is perfectly timed for a streamer to say "okay chat, here we go—" before the commit. The rising audio tone, visual bloom, and culmination *clack* all register clearly on stream audio/video compression. The screen shake (KB/M) is visible even at 720p stream quality. The mobile swipe gesture produces dramatic thumb movement visible on phone-screen streams (common on TikTok/YouTube Shorts).

### × Two-Act Debrief (Locked)
The EXECUTE ritual is Act 0 — the prelude to the two-act structure. Its emotional weight primes the sealed watch (Act 1) by establishing stakes. A weightless, instant EXECUTE would diminish the sealed watch's tension. The ritual says: "what you're about to see cost you something to initiate."

### × Confidence Meter Variant (6.06b Variation B)
The config-completeness-scaled fill speed is the only DualSense variation that translates to ALL platforms without hardware-specific features. On DualSense, it's resistance; everywhere else, it's time. An incomplete config takes 1200ms to fill (heavier commitment). A complete config takes 600ms (lighter, more confident). This creates a universal "the game knows whether you're ready" feeling. The fill ring speed becomes the config-completeness signal that every player reads, regardless of platform.

---

## Player Journeys

#### Journey: Mika, 14, Manila — First EXECUTE on Mobile

**Context:** Mission 1, first time playing. Has configured a single Scout with patrol skill. Phone: Realme C55 (budget Android, basic vibration motor).

**Minute 5:30 — The Launch Rail**
Mika has been staring at her Scout's blueprint for two minutes, unsure if it's "right." The launch rail sits at the bottom of the screen — a dark track with glowing chevrons. She's noticed it but hasn't interacted with it. The EXECUTE button on desktop would be a button to press. This is different — it looks like something you *slide.*

She presses her thumb on the handle. It swells. Everything else dims. *Oh.* This is the moment. She can feel the phone's motor give a single tap — not aggressive, just a "hello, I'm here."

**Minute 5:35 — The Slide**
She drags right. The phone starts tapping against her thumb — slow, steady, like a heartbeat. The track fills with cyan behind her thumb. The chevrons race ahead. The heartbeat quickens. She's committed two centimeters of thumb movement — more than a tap, less than a swipe. She feels the tempo increase: *tick-tick-tick-tick-tickticktick.*

Her instinct is to slow down. The accelerating heartbeat makes her second-guess — *is this right? Should I go back and change something?* This is the design working. The ritual creates a decision point that a tap never would.

**Minute 5:38 — Commit**
The track edge turns gold. She's in the commitment zone. She lifts her thumb. *THUNK.* The handle snaps to the end. White flash. The phone gives a single strong vibration.

She gasps. Not because anything scary happened — but because she *chose* that. The slide felt like pulling a lever. The sound felt like a machine engaging. Her Scout is on the board, patrolling. She can't change anything now. She leans forward to watch.

**Minute 5:39 — Reflection**
The Sealed Watch begins. Mika watches her Scout patrol. She has no idea if she configured it well. But she remembers how the launch felt — the accelerating heartbeat, the gold zone, the snap. Next time, she'll configure more carefully before pulling that rail. The ritual has already taught her that EXECUTE is consequential.

**UI Annotations:**
- Launch rail: 200px wide, 56px tall, bottom of Plan screen above production queue
- Handle: 48px diameter cyan circle, 10% scale on touch
- Fill: liquid cyan behind handle, left-to-right
- Commitment zone: rightmost 25% of track, gold border glow
- Haptic: basic ERM buzz pattern (no structured haptics on budget Android), audible ratchet clicks compensate

---

#### Journey: Derek, 31, Portland — First EXECUTE on Keyboard/Mouse after Console

**Context:** Mission 5, factory introduction. Has been playing on PS5 (DualSense) and is now at his desk continuing on PC via web browser. Same account, cloud-synced progress. Expects the trigger pull.

**Minute 2:15 — The Missing Trigger**
Derek navigates to EXECUTE with his mouse. No trigger in his hand. No resistance to push through. For a moment, the ritual feels *absent* — like reaching for a light switch that isn't there.

He clicks and holds. The button depresses. The screen begins to tremble.

*Oh.* It's not the trigger. But it's *something.*

**Minute 2:17 — The Screen Shake**
The micro-tremor is subtle at first — he's not sure if his monitor is vibrating or if the game is doing it. Then it grows. The whole workbench vibrates. He can see his carefully placed blueprint cards jittering in their slots. A low rumble rises from his headphones. The fill ring traces clockwise.

He's holding his mouse completely still. His left hand rests on the desk. His whole body is motionless while the screen moves around him. It's a different kind of commitment than the trigger pull — on PS5, his finger pushed through resistance. Here, his body holds still against instability. The *stillness* is the ritual.

**Minute 2:19 — The Breathe-In**
At 600ms, the screen pulls toward the EXECUTE button. Everything slides 4 pixels inward for a fraction of a second. Derek's eyes widen — the UI just *inhaled.* Then it releases. Then silence. *Clack.* White flash. Sealed Watch.

Derek grins. It's not the DualSense — nothing is — but the screen shake created a different kind of gravity. On console, his body committed through effort. On PC, his body committed through stillness. Both work. Both feel like the architecture matters.

**Minute 2:20 — The Realization**
As the Sealed Watch begins, Derek realizes he heard the same *clack* as on PS5. The same white flash. The same production queue spin-up. The ritual has platform-specific texture but universal landmarks. He doesn't feel like he's playing a "lesser" version — he's playing the same game through a different physical language.

**UI Annotations:**
- Screen shake: ±0.5px → ±1.5px → directional 4px pull
- EXECUTE button: 3px visual depression on hold, cyan glow bloom expanding during hold
- Fill ring: identical to console (360° trace, 800ms, cyan)
- Audio: 80Hz → 160Hz sub-bass rise, same breaker-switch *clack* at commit
- Cursor lock option: disabled by default, available in Settings → Controls

---

#### Journey: Sana, 28, Blind Software Engineer — EXECUTE via Screen Reader + Switch Controller

**Context:** Mission 3, playing with Xbox Adaptive Controller and switch inputs. Screen reader (NVDA) active. Uses dwell-to-select (1000ms) for all actions. Display is on but she doesn't look at it.

**Minute 4:00 — Navigating to EXECUTE**
Sana tabs through the Plan screen. NVDA announces each element. She reaches EXECUTE. NVDA: *"EXECUTE button. Hold to deploy. 1 blueprint configured. Scout with patrol, evade."* The announcement includes her config summary — she doesn't need to remember what she configured.

Her adaptive controller's single switch is mapped to the A button. She presses and holds.

**Minute 4:02 — The Audio Ritual**
With no haptics (her adaptive controller has no rumble), the ritual is entirely audio + screen reader. The sub-bass tone rises. At 300ms, NVDA announces: *"Committing... 30%."* At 600ms: *"Committing... 75%."* The percentage announcements are timed to not interrupt the rising tone. They're brief, factual, ARIA live-region updates.

The production queue spin-up is announced: *"Factory preparing: Scout."*

**Minute 4:04 — Commit**
At 1000ms (her configured dwell time, slightly longer than default 800ms), the *clack* fires. NVDA: *"Deployed. Sealed Watch beginning. Tick 1."*

For Sana, the ritual's weight comes from the **audio arc** — the rising tone, the percentage progress, and the definitive *clack.* The tone is her haptic channel. She's trained over three missions to associate the rising pitch with "this is the point of no return." The *clack* is her universal landmark — the same sound Derek hears, the same sound Mika hears. The game sounds the same everywhere, even when it feels different.

**Minute 4:05 — The Sound of Commitment**
The Sealed Watch begins. NVDA shifts to a different announcement cadence — board events, signal deliveries, combat outcomes. Sana leans back. The transition from "rising tone → clack → tick announcements" has become her personal rhythm for commit-and-observe. She doesn't miss the screen shake she can't see. The *clack* is enough.

**UI Annotations:**
- NVDA announcement: config summary on EXECUTE focus, percentage progress during hold, "Deployed" on commit
- ARIA: role="button", aria-label includes config summary, aria-live="polite" region for progress
- Dwell time: configurable 500-1500ms in Accessibility → Motor settings
- Audio: identical sub-bass tone + clack (no haptic compensation needed — audio IS the primary channel)
- Reduced motion: white flash replaced with soft fade (Sana's settings, though she can't see it — set by default for screen reader users to avoid photosensitive co-viewers)

---

## Strengths

- **Platform parity without platform uniformity.** Each variant exploits what its hardware does best rather than simulating what another platform does. Xbox gets fingertip electricity. Switch gets stereo harmony. KB/M gets visual gravity. Mobile gets spatial gesture. The emotional arc is the same; the physical language differs.
- **Graceful degradation.** Every variant has a no-haptic fallback. The fill ring + audio tone + *clack* are always present. A player on a controller with no rumble still experiences a meaningful commitment ritual — just a quieter one.
- **Universal landmarks.** The *clack*, the fill ring, the white flash, the production queue spin-up, and the stand-down motif are identical everywhere. Cross-platform players (PC at desk, phone on commute) recognize the same moments.
- **The Confidence Meter translates.** Fill-speed-as-config-completeness works on every platform, no hardware dependency. This is the one DualSense variation that should ship as the default across all platforms.

## Weaknesses

- **KB/M is inherently the weakest.** No haptic channel means the ritual relies on screen shake — which some players will disable. With screen shake off AND audio muted, the ritual is just a fill ring on a held click. This is functional but not visceral. Mitigation: the cursor gravity well option adds spatial commitment.
- **Mobile swipe may feel casual.** The "slide to unlock" association is deeply trained but also *fast* and *disposable*. The accelerating haptic heartbeat must counteract this — the ritual must feel heavier than unlocking a phone. If the haptic fails (budget device), the audible ratchet clicks must carry the weight alone.
- **Switch digital triggers limit expression.** ZR is a binary button — press or don't. No analog travel to modulate. The entire Switch ritual is HD Rumble + time, with no finger-as-input-device capability. This is the platform where the ritual is most "passive" — hold and wait, vs. push through (DualSense) or slide across (mobile).
- **800ms is a design bet.** Too short and the ritual is trivial. Too long and it's tedious on attempt #47 of a hard mission. The DualSense parent document notes this: "after 30+ executions, the novelty is gone." Cross-platform, 800ms is the tuning target — but it should be internally A/B tested at 600ms, 800ms, and 1000ms.

---

## Comparable Games/Media

### Returnal — Cross-Platform Absence
Returnal was PS5-exclusive at launch, designed entirely around DualSense. When it ported to PC, the adaptive trigger mechanics were replaced with... nothing. Mouse clicks have no equivalent to the half-press alt-fire wall. This is the cautionary tale: **design the cross-platform ritual from day one, not as a port afterthought.**

### DEFCON — The Breaker Switch
DEFCON's nuclear launch uses a simple UI button, but the *context* creates the ritual — the countdown, the radar screen showing incoming missiles, the sound of sirens. Weight comes from meaning, not mechanics. Robot Uprising's KB/M variant follows this principle: the screen shake and audio tone aren't mechanically complex, but they're contextualized by everything the player has built.

### Slay the Spire — The "End Turn" Tap
End Turn in Slay the Spire is a single click with no ritual. This is intentional — turns are frequent (every 15-30 seconds), so any friction would be maddening. Robot Uprising's EXECUTE happens every 3-8 minutes. The ritual is justified by rarity. If EXECUTE happened every 30 seconds, the 800ms hold would be intolerable.

### Nuclear Throne — The Start Run Simplicity
Nuclear Throne's run-start is instantaneous. No commitment. No ritual. You're in. This works for a game where runs last 5 minutes and death is expected every time. Robot Uprising's configuration investment (3-8 minutes of careful design) demands more ceremonial weight at the commit point.

### iOS "Slide to Power Off"
Apple's shutdown gesture is the gold standard for "irreversible mobile action." Full-width swipe, slow and deliberate, clear label, snap-to-complete. Robot Uprising's mobile swipe is a game-context adaptation of this OS-level pattern.

---

## The TikTok Clip

**"Five Ways to Launch a Robot Army"** — Split-screen showing the same EXECUTE moment on five devices simultaneously:

- Top-left: DualSense close-up, finger pushing through visible trigger resistance
- Top-right: Phone screen, thumb sliding across glowing rail, phone vibrating audibly
- Center: Desktop monitor, screen shaking, cursor locked on glowing button
- Bottom-left: Joy-Con pair, one in each hand, held apart, visibly vibrating in harmony
- Bottom-right: Xbox controller close-up, trigger finger with visible vibration blur

All five screens show the fill ring at the same progress. All five fire the *clack* at the same moment. All five flash white simultaneously. Cut to: all five Sealed Watch screens showing the same battle beginning from the same configuration.

Caption: *"Same game. Same moment. Different hands."*

The clip demonstrates platform parity — Robot Uprising isn't a "best on PlayStation" game. It's a game that respects whatever hardware you own. The simultaneous *clack* across five devices is the hook.

---

## Discovered Sub-Aspects

- **6.06b-iii-a — Fill ring as universal progress language:** The fill ring is the one visual constant across all platforms. Its speed, color, animation timing, and completion flash deserve their own design spec. Should it be a ring, a bar, a radial wipe? How does it respond to the Confidence Meter variant? What does "paused" look like during an abort?
- **6.06b-iii-b — A/B testing the 800ms duration across platforms:** The optimal hold duration may differ by platform. Mobile swipes have natural velocity (600ms feels right). KB/M holds in featureless screen shake may feel long at 800ms. Controller hold-with-haptics may warrant 1000ms to let the feedback breathe. Per-platform duration tuning as a design variable.
- **6.06b-iii-c — The repeat-attempt fatigue curve:** On mission attempts 1-3, the ritual feels weighty. By attempt 10, it might feel like friction. Should the ritual shorten on retries (e.g., 800ms first attempt → 500ms on retry)? Or does consistent duration reinforce that every attempt matters equally? The "liturgical constancy" vs. "respect my time" tension.
- **6.06b-iii-d — The audio *clack* as Pavlovian anchor:** The breaker-switch sound is the game's most important audio cue. Its design — frequency, duration, reverb, spatial positioning — deserves exhaustive specification. It must be recognizable at any volume, through any speakers, on any platform. It is the sonic brand of commitment.
- **6.06b-iii-e — Streamer hand-cam synchronization:** Content creators often show hand-cams alongside gameplay. The DualSense trigger pull, mobile swipe, and Joy-Con vibration all produce visible hand movements. KB/M produces... stillness. Design for the hand-cam: should the cursor gravity well create visible mouse micro-movements? Should keyboard users see a key-depression animation on-screen to compensate for invisible hands?
