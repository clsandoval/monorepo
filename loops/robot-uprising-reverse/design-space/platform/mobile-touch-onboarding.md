# 6.07c — Mobile-Specific Onboarding for Touch Controls

**Aspect ID:** 6.07c
**Wave:** 6 (Aesthetics & Platform)
**Category:** Platform / Onboarding
**Related aspects:** 6.07 (mobile touch adaptation), 6.07b (portrait-landscape orientation), 5.01 (tutorial as puzzle), 5.02 (tutorial as narrative), 5.03 (tutorial as sandbox), 5.04c (subsystem online micro-celebration), 1.17a (animated tooltip pattern), 3.14 (workbench layout), 6.08 (accessibility), 6.06e (controller-specific onboarding)

---

## The Core Problem

A player opens Robot Uprising on their phone for the first time. They have never seen this game. They don't know what a "context window" is. They don't know that rules have priority order, that hooks wire agents together, or that channels are named pipes. They are holding a 6.1" slab of glass in one hand, probably on the bus, probably willing to give the game exactly 90 seconds before deciding whether to keep playing or close it forever.

On desktop, the game has the luxury of hover states, generous screen real estate, visible tooltips, and a mouse pointer that can preview without committing. Mobile has **none of this**. Every piece of progressive disclosure that desktop takes for granted — hover a skill to see its tooltip, hover a rule to see its evaluation trace, hover a channel name to see its wiring — must be reinvented for touch.

This is not "the same tutorial but on a phone." This is a fundamentally different pedagogical problem: **how do you teach a complex system through a 375px viewport using only thumbs, when every touch is a commitment rather than an exploration?**

The fat finger problem (45×45px touch area occluding the target), the absence of hover, the soft keyboard friction, the bottom-sheet UI patterns from the mobile adaptation doc (6.07), the Flip tab pattern for portrait mode — all of these constrain and reshape what "learning the game" means on mobile.

---

## Six Mobile Onboarding Paradigms

### Paradigm A: "The Ghost Hand" — Animated Overlay Demonstrations

**What it is:** A translucent animated hand appears on screen and performs the exact gesture the player needs to execute. The hand moves with physics-based easing — it doesn't teleport, it glides from a resting position at the bottom of the screen to the target element, pauses, performs the gesture (tap, long-press, drag, swipe), then fades. The target element pulses with a soft glow (electric cyan ring, 2px, pulsing at 1Hz) while the ghost hand approaches.

**How it works mechanically:**

The ghost hand system triggers on a per-element basis the first time that element type appears in the player's view. It is not a scripted sequence — it's a **gesture dictionary** keyed to UI element types. Each entry specifies:

```
ElementType → {
  gesture: tap | long-press | drag-vertical | drag-horizontal | swipe-up | pinch,
  ghost_hand_start: {x, y} relative to element,
  ghost_hand_end: {x, y} relative to element,
  duration_ms: 1200-2000,
  repeat: 1-3,
  dismiss_on: first_successful_gesture | tap_anywhere | 5s_timeout
}
```

The hand itself is a stylized silhouette — not photorealistic, not cartoonish. A simple two-tone illustration: dark grey fill with a 1px lighter outline. The index finger is slightly extended for tap gestures; the full hand is shown for drag gestures. On drag, a dotted trail follows the finger path in the same electric cyan as other UI accents.

**Sensory description:** The ghost hand fades in over 200ms from 0% to 60% opacity. It hovers 12px above the target, casting no shadow (it's a ghost, not a physical object). When it "taps," the fingertip touches the target and the target ripples — a circular wave expanding from the touch point, 120px diameter, fading over 300ms. A soft haptic tick (10ms, light intensity) fires on the player's device simultaneously, teaching the player what haptic feedback to expect when they perform the gesture themselves. The pulsing cyan ring around the target dims slightly on each ghost-hand repetition, fading entirely after the player performs the gesture themselves — a visual "training wheels being removed" metaphor.

**Gesture dictionary for Mission 1 (mobile):**

| UI Element | Gesture | Ghost Hand Motion | When Triggered |
|-----------|---------|-------------------|----------------|
| Buffer slot (noise entry) | Drag-right to remove | Hand rests on leftmost noise slot, drags right off-screen; slot slides out, remaining slots collapse | First time buffer panel appears |
| Rule row (reorder) | Long-press + drag vertical | Hand presses and holds (300ms), row lifts with shadow, hand drags up one position | Mission 2, first rule panel appearance |
| Skill toggle | Tap | Hand approaches toggle, taps once, toggle slides to ON with green fill | Mission 1, first skill panel |
| Bottom sheet handle | Swipe up | Hand starts at handle bar, swipes up; sheet rises to half-height | First Plan screen load |
| Tab bar (Flip pattern) | Tap | Hand taps "Config" tab; screen flips | First board-to-config transition |
| EXECUTE FAB | Long-press (800ms) | Hand presses and holds; fill ring animates around button; hand releases on completion | First EXECUTE moment |
| Channel name field | Tap | Hand taps field; soft keyboard appears; ghost types "alert" letter by letter at 200ms/char | Mission 3, first hook configuration |
| Production queue item | Long-press + drag horizontal | Hand presses blueprint icon, drags left to reorder queue | Mission 5, first production queue |

**Strengths:**
- **Language-independent.** No text needed. Works in every locale without translation. Critical for a game with Philippine setting targeting global audiences.
- **Familiar pattern.** Clash Royale, Candy Crush, every major mobile game uses ghost hands. Players know what the translucent hand means. Zero explanation needed for the meta-pattern itself.
- **Precise.** Shows exactly where to touch and how to move. Eliminates ambiguity that text-based instructions create on touch ("drag the rule" — which direction? how far? from where?).
- **Non-blocking.** The ghost hand is an overlay. The game continues running beneath it. The player can ignore it and explore on their own if they want.

**Weaknesses:**
- **Teaches the HOW, not the WHY.** The ghost hand shows you how to drag a noise entry out of the buffer. It doesn't explain why that noise entry is bad. The mechanical gesture is taught; the strategic reasoning is not.
- **Patronizing for experienced players.** A Factorio veteran who downloads on mobile doesn't need a ghost hand to teach them what a tap is. They need to learn the GAME, not the GESTURES.
- **Combinatorial explosion.** Every new UI element needs a ghost hand entry. The gesture dictionary grows across the campaign. Authoring 40+ gesture animations is significant content work.
- **Passive learning.** Research on mobile game retention (Adrian Crook & Associates) shows that watching a demonstration produces weaker learning than performing a constrained action. The ghost hand shows; it doesn't require.

---

### Paradigm B: "The Spotlight Funnel" — Progressive Element Reveal

**What it is:** On the player's first encounter with any screen, most UI elements are dimmed to 20% opacity and non-interactive. Only the ONE element the player needs to interact with next is at full brightness, with a subtle spotlight effect (radial gradient, white center fading to transparent over 120px radius). As the player successfully interacts with that element, the next element illuminates, and the previous one settles to normal opacity. The screen progressively "turns on" as the player touches each element for the first time.

**How it works mechanically:**

Each screen has a **discovery graph** — a directed acyclic graph of UI elements ordered by pedagogical priority. The graph has parallel branches (some elements can be discovered in any order) and mandatory gates (certain elements must be touched before others become available).

```
Mission 1, Plan Screen discovery graph (portrait / Flip mode):
  Board tab (pre-lit, default view)
    → Ghost unit on board (spotlight, first tap)
      → Config tab (illuminates after unit selection)
        → Buffer panel (pre-expanded for Mission 1)
          → First noise slot (spotlight, drag-to-remove)
            → Second noise slot (illuminates)
              → [parallel: remaining noise slots]
        → EXECUTE FAB (illuminates after buffer cleaned)
```

When an element is dimmed, tapping it produces a gentle "not yet" shake animation (3px horizontal oscillation, 200ms, 2 cycles) and a low-pitched haptic buzz (distinct from the "success" haptic tick). The player feels the boundary — "I can't touch this yet" — without an error message.

**Sensory description:** The dimmed elements aren't invisible. They're present, textured, recognizable — like furniture in a dark room illuminated by a single flashlight beam. The spotlight has a warm color temperature (2700K feel, slight yellow-orange tint) compared to the game's cool cyan palette. When a new element illuminates, it doesn't pop — it blooms. The brightness increases over 400ms with a soft easing curve, and a barely-audible chime sounds (C5, 150ms, 30% volume). The cumulative effect across a minute of play is a screen that gradually fills with light and sound — each element the player discovers adds a voice to the growing chorus. By the end of Mission 1's Plan screen, every element is at full brightness and the screen feels alive. The player lit it up.

**Strengths:**
- **Prevents overwhelm.** The #1 mobile onboarding killer is "too many things on screen." The spotlight funnel ensures the player only ever sees one thing to do. Decision paralysis is impossible.
- **Creates momentum.** Each successful interaction reveals the next step. The player is always progressing, always discovering. The "screen lighting up" creates a tangible sense of progress that's independent of the game's actual progression.
- **Teaches order.** The discovery graph encodes the intended learning sequence. Buffer before rules. Rules before hooks. Hooks before channels. The graph IS the curriculum.
- **Into the Breach precedent.** The Netflix mobile port uses a similar "highlight the valid action" pattern during combat — valid move tiles glow, invalid tiles are dim. Players understood immediately.

**Weaknesses:**
- **Rails, not training wheels.** The player cannot explore freely. They must follow the discovery graph. A player who wants to look at the rules panel before cleaning the buffer is blocked. This violates the sandbox onboarding philosophy (5.03).
- **Replay friction.** On retry or replay, does the spotlight reset? If yes, it's tedious. If no, the player who failed because they missed a mechanic doesn't get re-guided.
- **False confidence.** The player completes the funnel and feels like they understand the screen. But they were guided through a single path in a high-dimensional space. They touched each element once, in one order, for one purpose. They haven't actually learned the combinatorial space.
- **Portrait vs. landscape divergence.** The Flip mode (portrait) and Drawer mode (landscape) have completely different element layouts. The discovery graph must be authored for each orientation — doubling the work.

---

### Paradigm C: "The Fingerprint" — First-Touch-Per-Element Instruction

**What it is:** Every interactive element in the game has a **first-touch response** — a unique, one-time reaction that plays the very first time the player touches that element. This isn't a separate tutorial layer. It's baked into the element itself. The first tap on a rule row doesn't just select it — it briefly expands to show a 2-line description of what rules do, then settles into its normal selected state. The first drag of a buffer slot doesn't just remove it — it plays a 1-second slow-motion animation of the slot sliding out with a trailing particle effect and a tooltip reading "Noise removed — context freed."

After the first touch, the element behaves normally forever. The teaching is embedded in the interaction, not wrapped around it.

**How it works mechanically:**

Each interactive element has a `firstTouchPlayed: boolean` flag persisted in localStorage. The first-touch response is defined per element type:

| Element | First-Touch Response | Duration | After First Touch |
|---------|---------------------|----------|-------------------|
| Buffer slot (noise) | Slow-mo drag-out with particle trail + "Noise cleared" tooltip at finger position | 1.2s | Normal speed drag, no tooltip |
| Buffer slot (signal) | Slow-mo drag-out with amber warning flash + "Signal lost — agent can't see this anymore" tooltip | 1.2s | Normal speed + amber flash only (persistent warning) |
| Rule row | Expands to 96px showing condition→action breakdown with labeled arrows | 800ms | Normal 64px row |
| Skill toggle | Toggle animates with a "power-on" electrical spark + skill name + 8-word description popover | 600ms | Normal toggle, no popover |
| Hook channel field | Keyboard rises with a "Channels are shared radio frequencies" banner above the keyboard, fading after first character typed | Until first char | Normal keyboard, no banner |
| EXECUTE FAB | Fill ring animates at 0.5x speed with "Hold to deploy your agents" tooltip | First hold only | Normal 1x fill ring |
| Tab bar (Flip) | Flip animation runs at 0.5x with "Board ↔ Config" label flying alongside | 600ms | Normal 300ms flip |
| Production queue slot | Slot lifts with "Build order: left builds first" arrow overlay | 800ms | Normal lift |
| Context config toggle | Toggle flips with "Listen: agent hears this channel / Ignore: agent filters it out" bifurcated tooltip | 1s | Normal toggle |

**Sensory description:** The first-touch response has a distinctive sensory signature that separates it from normal interaction. The animation runs in a slightly desaturated color palette — 80% saturation compared to the game's normal vivid palette — giving it a "memory" or "flashback" quality. A thin white vignette (8px, 10% opacity) appears at screen edges during the response, as if the camera is briefly shifting focus. The haptic feedback during first-touch is doubled — two quick ticks instead of one — teaching the player what the normal single-tick will feel like by contrast. After 3 successful normal interactions, a barely-visible "✓" badge appears on the element (8px, bottom-right corner, 40% opacity) — a completionist's crumb.

**Strengths:**
- **Zero additional UI.** No tutorial layer, no overlay, no ghost hand, no spotlight. The game IS the tutorial. Every element teaches itself on first contact.
- **Respects exploration.** The player can touch things in ANY order. There's no graph, no sequence, no rails. Every element is always interactive. First-touch responses adapt to whatever order the player chooses.
- **Memorable.** Slow-motion, particles, expanded views — these create micro-moments of wonder. "Oh, THAT'S what that does." Research on haptic-augmented touchscreen interactions (ResearchGate, Touchscreen Haptic Augmentation study) shows that haptic feedback during learning produces stronger memory encoding than visual-only instruction.
- **Self-pacing.** Fast learners blow through first-touch responses in 30 seconds. Careful learners can study the expanded tooltips. Neither is punished.
- **Elegant degradation.** If the player has already played on desktop and switches to mobile, first-touch responses teach the GESTURE without re-teaching the CONCEPT. The tooltip says "Noise removed" — a desktop player already knows why that matters, but now they know how to do it with their thumb.

**Weaknesses:**
- **No sequence guarantee.** The player might discover hooks before rules, or context config before skills. If the game's pedagogy depends on learning A before B, the fingerprint paradigm can't enforce it.
- **Blink-and-miss-it.** A 1.2-second slow-motion animation can be missed if the player is looking away, or can feel interruptive if they're trying to move quickly. No way to replay a first-touch response.
- **Tooltip real estate.** On a 375px-wide phone, a tooltip that says "Listen: agent hears this channel / Ignore: agent filters it out" is 55+ characters. At 14px font, that's multiple lines. Tooltips risk overflowing the element they're attached to, especially in portrait mode.
- **Doesn't teach multi-step workflows.** First-touch teaches individual elements. It doesn't teach "first clean the buffer, THEN adjust the rules, THEN hit EXECUTE." Workflows require sequencing that per-element responses can't provide.

---

### Paradigm D: "The Coach Mark Carousel" — Swipeable Instruction Cards

**What it is:** Before the player can interact with any screen for the first time, a carousel of 3-5 instruction cards appears as a modal overlay. Each card is a full-bleed illustration with a single headline and a one-sentence explanation. The player swipes through the cards (left-to-right, familiar gallery pattern), then taps "Got it" on the last card. The carousel is dismissible at any point by tapping a small "×" in the top-right corner.

**How it works mechanically:**

Each screen has an associated carousel:

**Plan Screen carousel (5 cards):**
1. **"This is your workbench"** — Full illustration of the Plan screen with callout arrows to major sections. Headline only, no body text.
2. **"Your agents have context windows"** — Close-up of a buffer visualization with signal/noise color-coded. "They can only remember what fits. Remove the noise."
3. **"Rules decide what agents do"** — Close-up of a rule row with condition→action. "Top rule = first priority."
4. **"Hooks wire agents together"** — Illustration of two agents with a colored line between them. "Signals travel through channels."
5. **"Hit EXECUTE when ready"** — Close-up of the EXECUTE FAB with the fill ring. "Hold to deploy. Then watch."

**Sealed Watch carousel (2 cards):**
1. **"Watch your agents fight"** — Battlefield illustration. "Each tick, all agents act simultaneously."
2. **"Can't pause. Can't skip."** — Clock illustration. "This is the moment of truth."

**Inspector carousel (3 cards):**
1. **"Now you can analyze"** — Timeline scrubber illustration. "Step through every tick."
2. **"Click any agent to inspect"** — Agent with expanded context panel. "See what they knew and why they acted."
3. **"Find what went wrong"** — Decision trace illustration. "Every action has a reason."

**Sensory description:** The carousel cards have a frosted-glass backdrop (blurs the game beneath at 12px radius). Each card has a 16:9 illustration at the top (stylized, same pixel art as the game but with exploded-view annotations), a bold 24px headline in the game's accent font, and a 16px body line in the system font. The dot indicators at the bottom show progress (filled = viewed, hollow = unseen). Swiping between cards has a gentle parallax — the illustration moves at 0.8x the swipe speed while the text moves at 1x, creating depth. The "Got it" button on the last card is electric cyan with a satisfying 200ms scale-up animation on tap. Haptic: a medium tick on each card transition, a strong tick on "Got it."

**Strengths:**
- **Front-loaded context.** The player knows what to expect before they touch anything. No confusion, no wrong-first-guesses.
- **Beautiful format.** Carousel cards are an opportunity for art direction. The illustrations can establish the game's visual identity while teaching mechanics. App Store screenshot energy.
- **Skippable.** The "×" button means experienced players can skip immediately. No forced tutorial.
- **Localizable.** Text-based, so it translates cleanly. The illustrations are language-independent, and the headlines are short enough for most languages without overflow.

**Weaknesses:**
- **"Nobody reads the tutorial."** Industry data: 70-90% of players skip optional tutorial carousels (Adrian Crook & Associates, "Best Practices for Mobile Game Onboarding"). Players swipe through as fast as possible to reach the game. The carousel becomes background noise.
- **Front-loaded = forgotten.** Reading about rules before touching a rule is like reading a manual before using a tool. The information has no anchor in experience. By the time the player encounters their first rule row 45 seconds later, the carousel card about rules is gone.
- **Interrupts flow.** Every new screen pause = a modal overlay = a flow break. The transition from Sealed Watch to Inspector already has a designed emotional beat (the "seal breaking" moment, 4.04b). Inserting a carousel before the Inspector undercuts that emotion.
- **One-size-fits-all.** A total beginner and a desktop veteran see the same carousel. No adaptation to player knowledge or behavior.

---

### Paradigm E: "The Breath" — Contextual Micro-Pauses

**What it is:** At designed moments during gameplay, the game introduces a 1.5-second **micro-pause** — the screen dims slightly (to 85% brightness), all animations freeze, and a single contextual instruction appears as floating text near the element the player is about to need. The instruction is 4-8 words. Then the screen un-dims, animations resume, and the player proceeds. No button to press, no carousel to swipe, no hand to follow. The game breathes.

**How it works mechanically:**

Micro-pauses are triggered by game state transitions, not by timer or UI element discovery:

| Trigger | Instruction Text | Position | Duration |
|---------|-----------------|----------|----------|
| First buffer panel opens | "Drag noise out →" | Centered on first noise slot | 1.5s |
| First rule panel opens | "Top = highest priority" | Above the rule list header | 1.5s |
| First hook field appears | "Type a channel name" | Below the empty channel field | 1.5s |
| EXECUTE button first enabled | "Hold to deploy" | Below the FAB | 1.5s |
| First sealed watch tick 1 | "Watch. No controls." | Center screen | 2s |
| First Inspector opens | "← → step through time" | Centered on timeline scrubber | 1.5s |
| First time unit clicked in Inspector | "Full context at this tick" | Above the context panel | 1.5s |
| Buffer hits 80% capacity (first time) | "Almost full..." | Adjacent to the context bar | 1.2s |
| First context overload | "Overloaded. 1 tick stunned." | Centered on stunned unit | 2s |

**Sensory description:** The dim is not a solid overlay — it's a vignette that deepens at the edges while keeping the center of the instruction text at full brightness. The floating text appears with a typewriter effect — characters materialize left-to-right at 40ms per character, giving a "system message" feel consistent with the boot log narrative. The text is rendered in the game's monospace accent font, electric cyan, 18px, with a 1px dark shadow for readability. No background box — the text floats directly over the dimmed game. The un-dim is a quick inhale — brightness snaps back in 150ms, slightly faster than the dim-in (300ms), creating an asymmetric breathing rhythm. A single low note (G2, sine wave, 400ms, 20% volume) plays during the dim. Haptic: one slow, deep pulse at the start of the pause (distinct from the sharp ticks of interaction feedback).

**Strengths:**
- **Minimal intrusion.** 1.5 seconds per instruction. Total tutorial time across Mission 1: ~15 seconds of pauses spread across 3-5 minutes of play. The game barely interrupts itself.
- **Contextual.** Each instruction appears at exactly the moment it's relevant. "Top = highest priority" appears when the player is looking at the rules panel, not 30 seconds earlier in a carousel.
- **Diegetic feel.** The typewriter text + system tone + dim feels like the AI (the player character) is pausing to process — a natural beat for a game where you ARE an AI booting up. It integrates with the boot log narrative (5.02) rather than breaking it.
- **Not skippable (by design).** 1.5 seconds is too short to need a skip button but long enough to read 6 words. The player can't accidentally dismiss it. They can't avoid seeing it. But it's brief enough that it doesn't feel coercive.

**Weaknesses:**
- **4-8 words isn't enough for complex concepts.** "Type a channel name" tells the player WHAT to do but not WHY channels exist or HOW they connect agents. The micro-pause can teach gestures but not systems.
- **Replay is impossible.** If the player missed the micro-pause (phone notification, looked away, child grabbed the phone), the instruction is gone forever. There's no way to recall it.
- **Pause fatigue.** In later missions with many new elements, micro-pauses could chain: open new panel → pause → start typing → pause → drag element → pause. Three pauses in 10 seconds breaks flow.
- **No gesture teaching.** The text says "Drag noise out →" but doesn't show HOW to drag on touch. A desktop player knows what "drag" means with a mouse. A mobile player who's never played a drag-interaction game (they exist — plenty of people only play Candy Crush tap games) might not know to long-press first.

---

### Paradigm F: "The Apprentice" — Adaptive Contextual Hybrid (RECOMMENDED)

**What it is:** A layered system that combines the strongest elements of paradigms A through E, gated by the player's demonstrated competence rather than a fixed script. The system has four tiers that activate or deactivate based on player behavior:

**Tier 1: The Breath (always active, first encounter only)**
Micro-pauses (Paradigm E) fire on every first encounter with a major UI element. These are the game's "inhale" moments — brief, diegetic, unavoidable, minimal. They establish WHAT each element is in 4-8 words.

**Tier 2: The Fingerprint (always active, first touch only)**
First-touch responses (Paradigm C) play on every element's initial interaction. These teach HOW each element works — the gesture, the feedback, the consequence. They layer on top of Tier 1: the micro-pause says "Drag noise out →", and then the first actual drag plays in slow-motion with particles and a tooltip.

**Tier 3: The Ghost Hand (conditional)**
Ghost hand overlays (Paradigm A) activate ONLY if the player fails to interact with a spotlighted element within 8 seconds of a micro-pause. The logic: the pause told them what to do, the fingerprint is waiting to teach them how — but they haven't touched anything. They might be confused. After 8 seconds of inaction, the ghost hand gently demonstrates the gesture. If the player taps elsewhere during those 8 seconds (exploring), the ghost hand never appears — the system infers they're investigating, not stuck.

**Tier 4: The Spotlight (conditional, mission-critical moments)**
The spotlight funnel (Paradigm B) activates ONLY for mission-critical actions that, if missed, would make the mission impossible to complete. In Mission 1, this means the EXECUTE button is spotlit after the buffer is cleaned (the player must hit EXECUTE to progress — if they don't find it, they're stuck). In Mission 4, the first hook channel field is spotlit because hooks are the new mechanic and the mission cannot be completed without creating a channel. The spotlight is rare — 1-2 moments per mission, never more.

**How the tiers interact:**

```
Player opens Plan screen for first time (portrait, Flip mode):
  → Tier 1: Micro-pause "This is your workbench" (1.5s)
  → Board tab is visible, Config tab dimmed
  → Player taps a ghost unit on the board
    → Tier 1: Micro-pause "Tap a unit to configure it" (1.5s)
    → Screen flips to Config tab
      → Tier 2: First-touch on the tab plays slow-mo flip animation
      → Buffer panel is visible with noise-filled slots
        → Tier 1: Micro-pause "Drag noise out →" (1.5s)
        → Player has 8 seconds...
          IF player drags a noise slot:
            → Tier 2: First-touch slow-mo drag with particle trail + tooltip
            → Player continues cleaning buffer
          IF player taps something else:
            → System infers exploration. No ghost hand. Tier 2 awaits first noise drag.
          IF 8 seconds pass with no interaction:
            → Tier 3: Ghost hand appears, demonstrates drag gesture
            → Player performs gesture (or ghost hand repeats 2x, then fades)
        → Buffer cleaned.
          → Tier 1: Micro-pause "Hold to deploy →" (1.5s) near EXECUTE
          → IF 10 seconds pass with no EXECUTE tap:
            → Tier 4: Spotlight dims entire screen except EXECUTE FAB
            → Player taps EXECUTE
              → Tier 2: First-touch slow-mo fill ring at 0.5x speed
```

**The competence tracker:**

Behind the scenes, the system tracks a simple per-gesture competence score:

| Gesture | Score +1 | Score -1 |
|---------|----------|----------|
| Tap | Successful tap on any element | Tap on non-interactive area |
| Long-press-drag | Successful reorder | Drag aborted (lifted finger without dropping in valid zone) |
| Swipe | Successful swipe gesture | Swipe in wrong direction |
| Text entry | Submitted a channel name | Opened keyboard, typed nothing, dismissed |

When the competence score for a gesture type reaches **3**, all Tier 3 (ghost hand) instances for that gesture type are permanently disabled. The player has demonstrated they know how to drag, so the game stops offering to show them. Tier 1 (micro-pauses) and Tier 2 (first-touch) still fire for NEW elements, but the ghost hand safety net is removed for known gestures.

When the competence score reaches **5**, Tier 2 (first-touch) responses shorten from their full duration to 50% speed. The player is practiced enough that the slow-motion teaching is more hindrance than help. The first-touch still plays, but briefer.

When the competence score reaches **8**, Tier 2 responses are fully disabled. The player is expert. All interactions behave normally. Only Tier 1 micro-pauses survive (because they're about WHAT, not HOW — even an expert needs to learn what a new element is).

**Sensory description for the full Tier 1→2→3 cascade on first noise drag:**

**Second 0.0:** Screen dims to 85%. Vignette deepens at edges. Low G2 sine tone. Slow haptic pulse. Text materializes character by character near the first noise slot: "Drag noise out →". The arrow character (→) glows slightly brighter than the other characters, pointing right.

**Second 1.5:** Screen un-dims in 150ms. The noise slot's border pulses cyan at 1Hz. Other buffer slots dim to 70% opacity — the noise slot is the obvious target.

**Second 2.0-9.5:** The player either interacts or doesn't. During this window, the noise slot's pulse rate gradually increases from 1Hz to 2Hz — a heartbeat quickening as the system "waits."

**If the player drags at second 3.0:** Their finger touches the noise slot. Double haptic tick (first-touch signature). The slot lifts 4px with shadow. The drag plays at 0.6x speed — the slot follows the finger but with a slight elastic lag, as if being pulled through honey. A particle trail of tiny cyan squares streams behind the slot. A tooltip appears 24px above the dragging finger: "Noise removed — 1 slot freed." The remaining slots slide down with a spring animation. A soft ascending tone (C4→E4, 200ms) plays. Haptic: medium tick on drop. The slot evaporates where the finger released it — a burst of cyan particles dissipating over 300ms.

**If the player does nothing by second 9.5:** The pulse rate is now 2Hz. A ghost hand fades in at the bottom-right of the screen. It glides to the noise slot (400ms travel). It long-presses (200ms, with the characteristic slight finger-curl animation). It drags right (600ms, smooth arc). The noise slot follows the ghost hand, playing the same particle trail. When the ghost hand releases, the slot evaporates. The ghost hand fades out. The system waits for the player to try it themselves on the next noise slot.

---

## Player Journeys

### Journey: Ria, 24, UX Designer from Manila

**Context:** Ria downloaded Robot Uprising from a friend's Instagram story link. She plays Wordle daily and has 200 hours in Stardew Valley on Switch but has never played a strategy game. She's on the MRT train heading to BGC, holding her phone in her right hand, AirPod in one ear.

**Minute 0:00 — First Load**
The game opens. Boot log text scrolls: "INITIALIZING ATTENTION SUBSYSTEM..." Ria recognizes the Ifugao rice terrace background from a college trip. She smiles. The boot log ends with "MISSION 1: WAKE — LOADING."

**Minute 0:15 — Plan Screen, Portrait Mode**
The board fills the top half of her screen. One ghost scout sits on tile D4. Three red enemy markers are visible at G6, G7, H7. The bottom sheet shows the production queue (empty — this is pre-placed). A tab bar at the top reads "🗺️ Board | 🔧 Config."

**Tier 1 fires:** Screen dims. "Tap your scout to configure it." Text materializes near the scout. Low tone. Ria's thumb was already moving toward the scout — she saw the pulsing glow. She taps before the micro-pause even finishes.

**Tier 2 fires:** The tap on the scout triggers the first-touch response on the tab bar. The screen flips to Config tab at 0.5x speed, with "Board ↔ Config" text flying alongside. Ria sees the scout's blueprint. Buffer panel at top: 6 slots, 3 filled with cyan-bordered signals ("threat_detected at G6", "terrain: rice_terrace", "patrol_waypoint: E5"), 3 filled with grey-bordered noise ("ambient_temperature: 28°C", "self_status: operational", "timestamp: tick_0").

**Minute 0:35 — Buffer Cleaning**

**Tier 1 fires:** Screen dims. "Drag noise out →" appears near the grey-bordered slots. 1.5 seconds. Un-dim.

Ria looks at the buffer. She reads the slot contents. She intuitively understands — the grey ones are irrelevant. "ambient_temperature" doesn't help a scout. She puts her thumb on the "ambient_temperature" slot and drags right.

**Tier 2 fires:** Slow-motion drag. Particle trail. Tooltip: "Noise removed — context freed." The slot evaporates. The remaining five slots compress. Ria's eyes widen — the buffer visualization is immediately more readable. She drags out "self_status: operational." Same slow-mo, but she's already moving faster. She drags out "timestamp: tick_0." The buffer now has 3 cyan signals and 3 empty slots (dashed outlines, inviting but not urgent).

The first-touch slow-mo is already feeling slightly unnecessary to Ria by the third drag. The system logged three successful drags. Competence score for drag: 3. Ghost hand for drag gestures is now permanently disabled.

**Minute 1:10 — EXECUTE**

**Tier 1 fires:** Screen dims. "Hold to deploy →" appears near the EXECUTE FAB at the bottom-right. Un-dim. Ria taps the FAB. Nothing happens — it requires a long-press. She tries again, holding this time.

**Tier 2 fires:** The fill ring animates at 0.5x speed. "Hold to deploy your agents." The ring completes. The screen transitions to Sealed Watch. Ria's phone vibrates with the commitment-ritual haptic (if on a device that supports the Vibration API).

**Minute 1:20 — Sealed Watch**

**Tier 1 fires:** "Watch. No controls." Center screen, 2 seconds. Ria watches. Tick 1: the scout moves to E5. Tick 2: it spots the enemy at G6 — cell flashes green. Tick 3-6: the scout patrols. The mission ends with the scout having detected all three enemies. "MISSION COMPLETE" with a soft chime. Ria grins. She cleaned three slots and won. The game made her feel competent in 80 seconds.

**Minute 1:50 — Inspector**

**Tier 1 fires:** "← → step through time" near the scrubber. Ria swipes through ticks. She taps the scout.

**Tier 2 fires:** First-touch on a unit in Inspector — the context panel expands to full-height with labeled slots: "At tick 3, the scout's context window contained: [threat_detected at G6] [terrain: rice_terrace] [patrol_waypoint: E5]." Ria reads the entries. She recognizes the signals she kept. She understands — her buffer cleaning directly determined what the scout knew.

**Minute 2:30 — Reflection**
Ria puts her phone in her pocket as the MRT approaches her stop. She learned: buffers hold info, noise hurts, dragging removes noise, agents act on what they know. She didn't read a single tutorial card. She didn't watch a ghost hand. The game taught itself through her hands.

**UI Annotations:**
- **Buffer slots:** 64px tall each, full-width, cyan border for signal / grey border for noise, 14px monospace content text, drag handle (three horizontal lines icon, 12px, left side)
- **Tab bar:** 48px tall, top of screen, two tabs with emoji + text labels, 3px cyan bottom border on active tab
- **EXECUTE FAB:** 56px diameter, bottom-right, electric cyan fill, white ⏵ icon, 800ms long-press with fill ring
- **Micro-pause text:** 18px monospace, electric cyan, 1px shadow, character-by-character animation at 40ms/char

---

### Journey: Datu, 38, Network Engineer from Cebu

**Context:** Datu has 800 hours in Factorio, completed all of Shenzhen I/O and TIS-100, and uses Screeps as his "programming relaxation." He heard about Robot Uprising from a Filipino game dev Discord. He's trying the game on his Samsung Galaxy S24 Ultra during a coffee break. He immediately rotated to landscape.

**Minute 0:00 — Boot Log Speed-Read**
Datu skims the boot log. He recognizes the vocabulary — context windows, hooks, channels. "This is agentic engineering," he thinks. He's excited. Boot log ends.

**Minute 0:10 — Plan Screen, Landscape (Tray Mode)**
Side panel from the right edge. Board on the left. Datu sees the ghost scout, three enemies, the buffer panel in the side panel.

**Tier 1 fires:** "Tap your scout to configure it." Datu is already tapping the scout. The micro-pause is 1.5 seconds — he finds it slightly annoying but tolerable.

**Tier 2 fires:** First-touch on the side panel opens with a subtle expand animation. He sees the buffer. He immediately starts dragging noise out.

**Tier 2 fires:** First-touch slow-mo on the drag. Datu's thumb is already moving to the next slot before the animation finishes. The 0.6x speed feels slow. He drags the second noise slot — still slow-mo (first touch per unique slot, but the system recognizes it as the same gesture type). By the third drag, competence score hits 3. No ghost hand will ever appear for drag gestures.

**Minute 0:30 — Already Bored with Mission 1**
Datu cleans the buffer in 15 seconds. He hits EXECUTE. The 0.5x first-touch on the fill ring makes him tap his foot impatiently. Sealed watch plays. Mission complete.

**He skips the Inspector entirely** — taps "Next Mission" immediately. He doesn't need the debrief for a filter puzzle. The system notes: Inspector was available for 0 seconds. Competence tracker logs this as high-confidence player behavior.

**Minute 1:00 — Mission 2**
New mechanic: rule reordering. Datu opens the rule panel.

**Tier 1 fires:** "Top = highest priority." Datu reads this in 0.3 seconds and is already looking at the rule rows.

**Tier 2 fires:** He long-presses a rule row. First-touch: row lifts with 105% scale and shadow, "Priority order: top fires first" tooltip. He reorders in 2 seconds.

By Mission 2's EXECUTE, Datu's competence scores are: tap=5, drag=4, long-press-drag=2. The system has already shortened Tier 2 responses for tap (50% duration). Datu barely notices — the game is getting out of his way.

**Minute 2:30 — Mission 3 (Hooks)**
This is where Datu perks up. Two agents. A hook field.

**Tier 1 fires:** "Type a channel name." The micro-pause is useful here — even Datu didn't know the exact input method. He taps the channel field.

**Tier 2 fires:** Keyboard rises with "Channels are shared radio frequencies" banner. Datu types "recon" — the banner fades after the first character. He wires the scout to the relay. He grins. "This is Screeps channels but visual."

He hits EXECUTE. This time he DOES open the Inspector — he wants to see the signal flow. He scrubs through ticks, finds the moment the scout's hook fires, watches the signal arrive at the relay one tick later.

**Minute 4:00 — Assessment**
Datu's first four missions take 4 minutes. A total beginner might take 15. The Apprentice system adapted — ghost hands never appeared (he was never stuck for 8 seconds), first-touch responses shortened by Mission 2, micro-pauses were the only consistent tier because even experts need to learn new UI elements. Datu felt respected, not patronized. He's ready for the factory.

**UI Annotations:**
- **Landscape tray:** 40% width side panel, swipe from right edge, board compresses to 60%
- **Rule rows:** 64px tall, numbered priority badges (1, 2, 3...) on left, long-press handle on right
- **Hook channel field:** 48px tall text input, autocomplete dropdown appears after 2 characters, recent channel names shown as chips below field
- **Competence score:** invisible to player, persisted in localStorage, per-gesture-type

---

### Journey: Tala, 17, Student from Batangas

**Context:** Tala plays Mobile Legends daily, has tried Clash Royale, and watches gaming TikToks. She's never played a strategy game or anything with "programming" in it. She found Robot Uprising through a TikTok clip of someone's relay network lighting up ("I didn't program this, I just wired them together"). She downloaded it on her Realme C55 (budget phone, 6.6" screen, older Helio G88 chip). She's lying in bed, holding her phone in portrait with both thumbs.

**Minute 0:00 — Boot Log**
"INITIALIZING ATTENTION SUBSYSTEM..." Tala reads the boot log with genuine curiosity. She doesn't know what "context window" means but the tone feels cool — like a hacker movie. "SUBSYSTEM: PERCEPTION — ONLINE." She whispers "online" to herself.

**Minute 0:20 — Plan Screen, Portrait (Flip Mode)**
Board fills the screen. Ghost scout at D4. Enemies visible.

**Tier 1 fires:** "Tap your scout to configure it." Tala looks at the scout. The tile is pulsing cyan. She taps it.

Screen flips to Config tab. **Tier 2:** First-touch slow-mo flip. "Board ↔ Config." She sees the buffer panel with 6 slots. She's never seen anything like this. What are these colored boxes? She stares for a moment.

**Tier 1 fires:** "Drag noise out →." She looks at the grey slots. She reads "ambient_temperature: 28°C." She thinks: "Why does a robot care about temperature?" She gets it. She puts her thumb on the slot.

She hesitates. She's not sure how to "drag out." She's used to tapping in Mobile Legends, not dragging.

**5 seconds pass. 6 seconds. 7 seconds.**

**Tier 3 fires:** The ghost hand materializes. It glides to the noise slot, presses, and drags right. The slot follows the ghost hand and evaporates. Tala watches with wide eyes. "Ohhh!" She immediately puts her thumb on the next grey slot and swipes right.

**Tier 2 fires:** Slow-mo drag with particle trail. "Noise removed — context freed." Tala pumps her fist. She drags the third noise slot — no more slow-mo for this one (competence score hit 3 counting the ghost hand's demonstration as an observed successful gesture). She's moving fast now.

**Minute 1:00 — EXECUTE**
Tala finds the EXECUTE button. She taps it. Nothing. She taps again, harder (as if force matters). Nothing.

**Tier 3 fires (after 8 seconds):** Ghost hand demonstrates the long-press. It presses and holds — the fill ring animates slowly. Tala imitates: she presses and holds. The ring fills. Her phone vibrates. The screen transitions to battle.

**Minute 1:15 — Sealed Watch**
"Watch. No controls." Tala is used to tapping madly during Mobile Legends team fights. The instruction to do NOTHING is strange. She watches. The scout moves. It spots enemies. Green flash. She gasps — it worked! Her cleaning worked!

**Minute 1:40 — Inspector**
She enters the Inspector. She's a bit lost — there's a timeline, panels, data.

**Tier 1 fires:** "← → step through time." She swipes the scrubber left and right. The board rewinds and fast-forwards. "That's so cool!"

She taps the scout. **Tier 2:** First-touch expansion shows the context window contents at the current tick. She sees the three signals she kept. She sees the decision trace: "Rule 1: IF threat_detected → patrol toward threat. Matched: [threat_detected at G6]."

She doesn't fully understand the trace, but she understands the connection: she removed the noise, the scout could see the threat, the scout moved toward it. Cause and effect through information.

**Minute 3:00 — Mission 2**
Tala fails Mission 2 on her first try — she removed a signal instead of noise (the signal/noise similarity mechanic). The debrief shows her: "Signal removed: threat_detected. The striker couldn't see the target."

She retries. This time she reads the slot contents more carefully. She succeeds. The ghost hand never appeared — she already knows how to drag.

**Minute 6:00 — Assessment**
Tala's first two missions took 6 minutes. She needed the ghost hand twice (first drag, first EXECUTE long-press). By Mission 2 retry, all ghost hands are disabled. She's playing with confidence. She doesn't know what "hooks" or "channels" are yet, but she'll learn them in Mission 3 with the same Tier 1→2→3 cascade. The system will show her.

**UI Annotations:**
- **Realme C55 constraints:** 6.6" screen at 1080×2400, slightly lower touch responsiveness than flagship phones. The system uses 500ms long-press threshold instead of 300ms (configurable per device performance tier)
- **Ghost hand on budget phone:** Rendered as a simple CSS animation (no canvas overlay) for performance. Opacity at 50% instead of 60% to reduce GPU load. No particles on the ghost hand's demo drag — particles only play on the player's own drag.
- **First-touch slow-mo:** At 0.6x speed instead of full particle effects on budget devices. Quality detection on first load sets a `performance_tier` flag (low/mid/high) that adjusts all tutorial animations.

---

### Journey: Marcus, 42, IT Manager from Singapore

**Context:** Marcus plays Into the Breach on his iPad Pro (12.9"). He heard about Robot Uprising from a podcast. He's trying it on the iPad during his lunch break at a hawker center, iPad propped up on its case in landscape mode.

**Minute 0:00 — Plan Screen, Landscape (Tray Mode on Tablet)**
On a 12.9" iPad, the Tray layout is essentially the desktop experience. Board left, side panel right. Everything is generously spaced. Touch targets are massive.

**Tier 1 fires:** "Tap your scout to configure it." Marcus taps immediately. The micro-pause text is small relative to the large screen — it's well-positioned but doesn't dominate. Good.

He opens the buffer. He's played Into the Breach — he understands the concept of "too much information." He drags noise out in rapid succession. **Tier 2** fires on each — but the slow-mo feels natural on the large screen. The tooltip text is readable without squinting. The particle trails are beautiful on the iPad's display.

**Minute 0:45 — EXECUTE**
Marcus finds EXECUTE. He knows to hold (Into the Breach uses a hold-to-confirm pattern for destructive actions). His first-touch fires, but he barely notices — he was already holding.

**Minute 1:00 — Sealed Watch**
"Watch. No controls." Marcus settles in. He's used to watching his mechs execute in Into the Breach. The tick-based resolution feels familiar. He reads the context bars on units — tiny colored pips he recognizes from the locked spec.

**Minute 2:00 — Inspector (where Marcus stays for 5 minutes)**
THIS is what hooks Marcus. The timeline scrubber, the decision traces, the context window state at each tick. He scrubs back and forth. He taps every unit. He reads every rule match.

The first-touch responses in Inspector are generous on the iPad — the expanded context panel takes up the full right side panel, showing every slot's content, source, age, and whether it influenced the decision. Marcus is in analytical heaven. He's already thinking about Mission 2.

**Minute 7:00 — Assessment**
Marcus spent 5 of 7 minutes in the Inspector. The adaptive system noticed: his competence scores are high across all gesture types, but his Inspector dwell time is extreme. The system doesn't add MORE teaching for the Inspector — it recognizes mastery-seeking behavior and stays out of the way. When new Inspector tools unlock in later missions (signal genealogy, counterfactual explorer), the micro-pauses will fire, but the ghost hand and slow-mo first-touches are long gone.

**UI Annotations:**
- **iPad 12.9" landscape:** Side panel is 480px wide — enough for full blueprint editor with comfortable spacing. Board tiles are 80px+ each — easily tappable, room for detail.
- **Touch targets on tablet:** All increased to 56px minimum (from 44px on phone). Rule rows are 72px tall. Drag handles are 24px grip icons.
- **Performance tier:** High. Full particle effects, smooth animations, no quality reductions.

---

## Interaction Effects

### × Tutorial as Puzzle (5.01)
The Apprentice system layers ON TOP of the filter puzzle tutorial design. Mission 1 is still a filter puzzle — the player still removes noise from buffers. The Apprentice system teaches the GESTURE of noise removal on mobile, while the filter puzzle teaches the CONCEPT. They're orthogonal: the puzzle provides the "what" and "why," the Apprentice provides the "how" (for touch).

### × Boot Log Narrative (5.02)
Tier 1 micro-pauses share the boot log's typewriter aesthetic. The instruction text uses the same monospace font, the same character-by-character reveal, the same low-tone audio. The player doesn't perceive the micro-pauses as a "tutorial system" — they perceive them as the AI (their character) processing new information. This is critical for immersion on mobile, where tutorial pop-ups feel especially intrusive because they cover precious screen real estate.

### × Animated Tooltip (1.17a)
On desktop, hovering a skill shows a micro-scenario tooltip. On mobile, there's no hover. The Apprentice system's Tier 2 first-touch response replaces the hover tooltip with a touch-triggered equivalent — the first tap on a skill shows the micro-scenario animation. After the first touch, subsequent taps on skills use a long-press to invoke the tooltip (since tap is now the standard toggle gesture). This preserves the animated tooltip's teaching value on mobile.

### × Portrait/Landscape Orientation (6.07b)
The Apprentice system must author its triggers for BOTH the Flip layout (portrait) and the Tray layout (landscape). The Tab bar in Flip mode gets a Tier 1 micro-pause and a Tier 2 first-touch. The side panel swipe in Tray mode gets a different Tier 1 micro-pause ("Swipe left for config →") and a different Tier 2 first-touch. The competence tracker is shared across orientations — a player who learned drag in portrait doesn't need to re-learn it in landscape.

### × Accessibility (6.08)
The ghost hand paradigm has an accessibility gap: blind players can't see it. In screen reader mode, the ghost hand is replaced by a spoken instruction: "Double-tap and drag right to remove this item." The micro-pause text is announced via ARIA live region. First-touch slow-mo is replaced by a longer VoiceOver announcement describing the consequence of the action. The competence tracker works the same way — successful gesture completion is detected regardless of whether it was visually or audibly guided.

### × Controller Onboarding (6.06e)
If a controller is connected to a mobile device (e.g., Backbone controller on iPhone), the Apprentice system switches its entire gesture dictionary: "tap" becomes "A button," "long-press" becomes "hold A," "drag" becomes "D-pad select + A to grab + D-pad to move + A to drop." The ghost hand is replaced by a ghost controller overlay showing button presses. The competence tracker resets for controller gestures — touch competence doesn't transfer.

### × Mobile Touch Adaptation (6.07)
The Apprentice system directly addresses the five brutal constraints from the mobile adaptation doc: (1) Fat finger problem → ghost hand shows exact touch point before the player's finger occludes it. (2) Split-view impossibility → micro-pauses explain the Flip/Tray patterns on first encounter. (3) Finger occlusion → first-touch tooltips appear ABOVE the touch point (24px offset), not below. (4) No hover → first-touch replaces hover-triggered teaching. (5) Text entry friction → the channel name field's first-touch shows a banner explaining channels AND activates autocomplete, reducing the need to type.

### × Workbench Layout Evolution (3.14)
The recommended "Evolving Workbench" paradigm (3.14) means the mobile Plan screen changes across missions — new panels appear, layout options unlock. Each layout change triggers fresh Tier 1 micro-pauses and Tier 2 first-touches for the new elements. The Apprentice system and the Evolving Workbench are symbiotic: the workbench grows, and the Apprentice teaches each new growth stage.

---

## Comparable Games / Patterns

### Into the Breach (Netflix Mobile Port)
The gold standard for complex strategy→mobile adaptation. Key lesson: they made every button large enough for touch and reconsidered every UI window specifically for touch controls. No ghost hands — Into the Breach relies on its structural clarity (valid tiles glow, consequences preview before commitment). The game's "highlight valid actions" IS the tutorial. Robot Uprising can learn from this: if the UI is clear enough, you need less explicit teaching.

### Clash Royale
The iconic ghost hand in mobile games. Clash Royale's first match shows a translucent hand dragging a troop card from the hand to the arena, demonstrating the core mechanic in 3 seconds without a single word of text. The ghost hand repeats twice, then disappears forever. Key lesson: the ghost hand works because Clash Royale's core mechanic IS a drag gesture. The gesture and the game concept are the same action. Robot Uprising's complexity means a ghost hand can only teach ONE gesture at a time, and there are many gestures to learn.

### Slay the Spire (Mobile)
StS mobile adapted from mouse/keyboard without a dedicated mobile tutorial. Touch controls are direct adaptations: tap to select card, drag to play. The community complained about the touch controls initially — double-tap confusion, cursor offset issues, drag-and-drop precision. Key lesson: "just make it work on touch" without mobile-specific onboarding creates friction. StS eventually patched improvements, but the launch experience was rough.

### Monument Valley
The master of wordless mobile teaching. The first level has exactly one element: a path with a break in it. You rotate a pillar to complete the path. No text. No ghost hand. No tutorial UI. The geometry teaches. Key lesson: if your first moment is simple enough, the UI IS the tutorial. Robot Uprising's Mission 1 filter puzzle (5.01) aspires to this — the buffer with obvious noise is the game's Monument Valley pillar.

### Alto's Odyssey
Teaches its full gesture vocabulary through a single long-press-to-snowboard-flip mechanic that the player discovers accidentally within the first 30 seconds. The game surface is continuous — there's no mode switch where you need a tutorial. Key lesson: continuous surfaces teach better than modal tutorials. Robot Uprising's three-screen loop (Plan→Watch→Inspector) is inherently modal, so seamless teaching is harder.

---

## Sensory Summary Table

| Tier | Visual | Audio | Haptic | Duration |
|------|--------|-------|--------|----------|
| Tier 1 (Micro-pause) | Vignette dim, typewriter text, monospace cyan | G2 sine tone, 400ms, 20% vol | Single slow deep pulse | 1.5-2s |
| Tier 2 (First-touch) | 80% saturation, white vignette, slow-mo, particles | Per-element (ascending tone on removal, spark on toggle) | Double quick tick (first-touch signature) | 0.6-1.2s per element |
| Tier 3 (Ghost hand) | 60% opacity silhouette, cyan dotted trail | None (silent — the ghost hand's authority comes from visual-only presence) | None (haptic is reserved for the player's own touch) | 1.2-2s per demo |
| Tier 4 (Spotlight) | Full-screen dim except target, warm spotlight | Faint sustained pad (Am, 30% vol) | None | Until interaction |

---

## The TikTok Clip

"She cleaned three boxes and WON." Split screen: left shows a 17-year-old's face lighting up as she drags noise slots out of a buffer on her phone. Right shows the phone screen — ghost hand demonstrates the first drag, then she takes over, swiping confidently. She hits EXECUTE. Sealed watch plays. Scout spots enemies. Green flashes. "MISSION COMPLETE." She pumps her fist. The entire clip is 12 seconds. The comment section: "wait this game teaches you AI engineering??" "downloading rn" "that scout is ME after my morning coffee clears the brain fog."

---

## New Aspects Discovered

- **6.07c-i — Ghost hand asset pipeline:** How many unique ghost hand animations need to be authored across all missions and UI elements? Cost estimation for the full gesture dictionary. Can ghost hands be procedurally generated from element metadata (position, gesture type, target position) or do they need hand-crafted animations?
- **6.07c-ii — Competence score persistence and reset policy:** What happens when a player returns after 6 months? Should competence scores decay over time, resetting ghost hands for gestures the player may have forgotten? A "returning player" detection system based on last-played timestamp.
- **6.07c-iii — First-touch response replay:** A "?" button on every element that replays the first-touch response on demand. Discoverable for players who missed the initial teaching. Interaction with Blueprint Codex as persistent reference.
- **6.07c-iv — Cross-device competence sync:** If a player learns on desktop and switches to mobile, should competence scores carry over? Desktop "drag" competence doesn't mean mobile "long-press-drag" competence. But concept knowledge (what rules do, what hooks are) does transfer. A "concept knowledge" vs. "gesture knowledge" split in the competence model.
- **6.07c-v — Adaptive performance tier detection:** How does the system detect low-end devices and adjust tutorial animation quality? First-load benchmark (render 100 particles, measure frame time) vs. device fingerprinting vs. user-facing quality toggle. Interaction with 6.07d battery/thermal budget.
