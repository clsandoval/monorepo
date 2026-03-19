# 4.07 — The "Oh No" Moment: How Information Overload Is Visualized on Units

## The Locked Context

Context overload → 1 tick stunned. When a unit's context window is full and new entries arrive, it enters a "stunned" state for 1 tick — cannot act, sparking/jittering visual, context compacts (evicts low-priority entries to make room). Survivable but costly. In a one-shot-one-kill game, 1 lost tick can be fatal. Prevention (proper context filters, compress skill) is better than recovery. Enemy flooding noise to force stun-locks is a viable tactic.

Context bars on each unit are tiny colored pips at the bottom of the tile showing context window fill. The locked spec says cool blue when healthy, amber at 75%, pulsing red when full.

The design space question: **how does the game communicate the escalating danger of information overload?** Not just the stun moment itself (locked: jittering + sparking) but the entire arc from healthy → filling → danger → critical → stun → recovery. This is the emotional equivalent of a health bar in other games, except it represents *cognitive capacity* rather than physical resilience. The player needs to FEEL their agents drowning in information before they actually go down.

---

## The Emotional Arc of Overload

Most games communicate damage through a simple bar depleting. Hit → bar goes down → dead. Robot Uprising inverts this: the bar FILLS. More information = more danger. This is counterintuitive — fullness usually means abundance, health, success. Here, fullness means paralysis. The visualization must make "full" feel **wrong** — not abundant, but suffocating.

The arc has five phases:

1. **Healthy (0-50%):** The unit is fine. Plenty of room. No urgency.
2. **Working (50-75%):** The unit is busy. Context is accumulating. Normal operation.
3. **Stressed (75-90%):** The unit is starting to struggle. Decisions are being made with crowded context. Accuracy may degrade (stale data mixed with fresh).
4. **Critical (90-99%):** One more entry and it stuns. Every tick is a held breath.
5. **Overloaded (100% → stun):** The context window is full, new data arrives, eviction fires, unit freezes for 1 tick.

Each phase needs a distinct visual language that is:
- Readable at battle speed (1 second per tick)
- Distinguishable at a glance (no tooltip required)
- Viscerally communicative (you FEEL the danger)
- Consistent with the SE Asian cyberpunk aesthetic

---

## Approach A: "The Thermometer" — Progressive Color Shift with Physical Distortion

### The Mechanic

The context bar (locked: tiny colored pips at bottom of tile) is the primary indicator. But in this approach, overload affects the **entire unit sprite**, not just the bar. As context fills, the unit's visual appearance degrades — subtly at first, dramatically at critical.

**Phase-by-phase visual escalation:**

**Phase 1: Healthy (0-50%)**
The unit sprite is clean and sharp. Crisp pixel outlines. The context bar is a horizontal strip (24px wide, 3px tall) at the bottom of the tile. Each slot is a tiny segment (2px wide) — bright teal (#4ECDC4) when occupied, dim dark (#1A2A3A) when empty. At 0-50% fill, the bar is mostly dark with a few teal segments. The unit moves with standard snap-animation. No distortion.

**Phase 2: Working (50-75%)**
Teal segments shift toward cyan-green as they accumulate. The bar is now half-lit. A barely perceptible change: the unit sprite's outline gets 1 pixel of cyan bloom on the side closest to signal sources — as if the incoming data is physically illuminating the agent from the direction it's arriving. Not alarming. Just ambient. A player who watches carefully sees the unit "warming up" with data.

**Phase 3: Stressed (75-90%)**
The context bar shifts amber (#F0A500). The bar segments now pulse — each occupied segment gently breathes (opacity cycles 80%-100% over 800ms, staggered so the bar appears to shimmer). The unit sprite develops **static lines** — thin horizontal interference lines (1px, semi-transparent white) that flicker across the sprite every 2-3 seconds. Like a television losing signal. The unit is still functional but visibly strained.

A subtle audio cue layers in: a faint high-pitched whine, like an electronic capacitor under load. It's quiet enough to be subliminal in the mix of the kulintang soundtrack — a player won't consciously hear it, but they'll feel tension when a stressed unit is on screen.

**Phase 4: Critical (90-99%)**
The context bar turns red (#FF3B3B). Bar segments pulse faster (400ms cycle). The unit sprite is now visibly degraded: static lines are constant (not intermittent), the sprite's color palette shifts toward desaturation (as if the unit's screen is losing power), and a **tremor** begins — the sprite oscillates ±1px on the horizontal axis every 200ms. Not the full jitter of overload, but a precursor. A warning tremor before the earthquake.

The audio whine increases in pitch and volume. Now the player CAN hear it — it cuts through the kulintang. Other units near the critical one are unaffected — the whine is spatialized (louder when hovering near the critical unit, fading at the board's edges). The player's eye is drawn to the source of distress.

The tile itself develops a **vignette** — the edges of the tile darken slightly, as if the unit's visual field is narrowing under information load. The board is still fully visible, but the critical unit's tile looks like it's straining under the weight of data.

**Phase 5: Overloaded (100% → stun)**
BANG. The moment overload hits:
- The unit sprite **glitches**: the sprite tears horizontally (top half offsets 4px left, bottom half offsets 4px right) for 100ms, then snaps back. This repeats 3 times in rapid succession.
- **Lightning particles**: 4-6 tiny pixel-lightning bolts (3px each) spray from the unit in random directions, fading over 400ms. Color: white with cyan afterimage.
- **Tile flash**: the entire tile flashes white for 50ms, then settles to a deep red tint (20% opacity red overlay) for the duration of the stun.
- **Context bar**: all segments flash white simultaneously for 100ms, then rapidly drain (from right to left, 50ms per segment) as low-priority entries are evicted. The bar settles at ~60% fill, amber, as the unit recovers from the compact.
- **Audio**: a sharp electronic **CRACK** — like a circuit breaker tripping. Then a descending tone (a "powering down" sweep from 2kHz to 200Hz over 300ms). During the stun tick, the unit's tile emits a low buzz — a grounding hum that replaces the tick's normal activity for this unit.

**Recovery (stun tick → next tick):**
On the tick after the stun, the unit comes back. A **reboot animation**: the sprite rebuilds from bottom to top (scan-line restore, 200ms). The context bar is now amber (post-compact fill). The tremor stops. Static lines clear. The unit snaps to its new action. A brief cyan ring contracts inward around the unit (the buffer clearing, visualized as space being reclaimed).

### Sensory Description

Tick 18. The relay at D4 has been receiving compressed data from two scouts for the last 8 ticks. Its context bar is a bright amber strip, pulsing. Static lines flicker across the relay's satellite-dish sprite every few seconds. The high-pitched whine is there — barely — underneath the kulintang.

Tick 19. A third scout fires a massive data burst (enemy wave detected, 4 units). The relay's context bar jumps from 85% to 95%. The bar turns red. The sprite begins trembling — ±1px side-to-side, fast enough to see, slow enough to be queasy rather than violent. The whine sharpens. The tile's edges darken. The player's stomach tightens. They know what's coming. They can't stop it. This is the sealed watch. No intervention.

Tick 20. Two more signals arrive simultaneously. Overload.

CRACK. The relay sprite tears — top and bottom halves split for 100ms, revealing a flash of white underneath, as if the unit's interior is exposed. Lightning bolts spray. The tile flashes white, then settles into red. The context bar blazes white and then drains — segments vanishing right-to-left like a fuel gauge emptying. The electronic descent tone sweeps through the speakers. For one tick, the relay does nothing. Its signal chain is broken. Downstream strikers, waiting for compressed intel, receive nothing. They patrol aimlessly. An enemy slips through the gap.

Tick 21. Recovery. The relay sprite rebuilds from the bottom up — scan lines sweeping vertically, restoring the dish sprite. A cyan ring contracts around the tile. The bar settles at 60%, amber. The tremor is gone. The relay is back. But the damage is done — the gap in the signal chain cost a striker its positioning. The enemy is now adjacent to the base.

The player learned something without a single word: **context management matters as much as tactical placement.** The relay wasn't destroyed by combat. It was destroyed by information.

### Player Journeys

#### Journey: Aya, 22, Psychology Student, Mission 4

**Context:** Mission 4 introduces the full context window mechanic. Missions 1-3 had pre-configured units with generous buffer sizes. Now she's hand-configuring buffer sizes for the first time. She gave her relay a 6-slot context window (minimum) because she thought "smaller = faster."

**Minute 0:00 — Deployment**
Aya places her scout, relay, and striker. The relay has 6 context slots. She doesn't realize this is tight for a relay receiving signals from two scouts.

**Minute 0:30 — The Warning Signs**
Tick 5: scout spots enemies. Signal reaches relay. Context bar shows 2/6 filled — teal, no distress. Normal.
Tick 8: second scout reports from the other flank. Relay now at 4/6. Still teal, but more than half full. The barely-perceptible cyan bloom appears on the relay's left side (the direction of the incoming signal). Aya doesn't notice.
Tick 10: first scout sends updated position data. Relay at 5/6. Context bar shifts amber. The bar segments begin pulsing. Static lines flicker across the relay sprite for the first time.

"Wait, what's happening to my relay?" Aya leans forward. She sees the amber bar. She remembers the boot log: "Context utilization above 75% indicates processing strain. Consider configuring eviction priorities or adding compression capacity." She hadn't configured eviction at all — the relay is using default FIFO (oldest first).

**Minute 1:00 — The Dread**
Tick 12: relay at 6/6. Every slot full. Bar turns red. The pulsing accelerates. Static lines are constant. The tremor begins. The high-pitched whine cuts through the audio. Aya's hands grip the desk edge. She KNOWS a stun is coming — the boot log explained it. But knowing and feeling are different. The relay sprite is shaking, desaturating, its tile edges darkening. It looks like a computer about to crash.

Tick 13: the scout sends another signal. The relay has no room.

CRACK.

The sprite tears. Lightning bolts spray. The tile flashes white, then red. The bar drains. The relay freezes for one tick. And in that tick, the striker that was waiting for relay data gets nothing. It defaults to patrol. It walks away from the enemy. An enemy reaches the base.

**Minute 1:30 — The Lesson**
The match ends (base damaged but survived). In the Inspector, Aya clicks the relay at tick 13. The context window display shows all 6 slots: old scout data in slots 1-3 (ticks 5, 8, 10 — ancient), fresh enemy data in slots 4-5, and the fatal incoming signal that had nowhere to go. She sees it clearly: the old data should have been evicted. She needs an eviction policy that drops stale terrain data.

She goes back to the workbench. Opens context config. Adds an eviction rule: "Evict oldest non-threat entry first." She increases the relay's buffer to 8 slots (spending more resources, a trade-off). She redeploys.

**Minute 3:00 — The Second Try**
This time, the relay handles the same signal volume without breaking 70%. The context bar stays teal. No static lines. No tremor. The absence of the distress visuals feels like relief — she's watching the SAME tactical scenario play out, but the relay is calm. The contrast between the two runs teaches the lesson: buffer management is the game.

**UI Annotations:**
- Context bar phases: teal (0-75%), amber (75-90%), red (90-100%), white flash (overload)
- Static lines: 1px white horizontal lines, 30% opacity, flickering at random y-positions within sprite bounds
- Tremor: ±1px horizontal oscillation, 200ms period, applied to sprite transform
- Whine audio: synthesized high-frequency sine wave, volume scaled to fill percentage (0% at 75%, 30% at 95%, 100% at overload)
- Overload CRACK: white noise burst, 50ms, -6dB
- Recovery scan-line: bottom-to-top sprite restoration, 200ms, pixel rows appearing sequentially

#### Journey: Renzo, 29, SRE at a Cloud Company, Mission 7

**Context:** Renzo has been building complex relay networks. His mental model maps perfectly to his day job: relays are message brokers, context windows are queue depths, overload is backpressure failure. He's designed an architecture with three relays in a chain — each compresses data before forwarding. He thinks this is optimal. He's about to discover cascade failure.

**Minute 0:00 — Confidence**
His architecture: Scout → Relay-A (compress) → Relay-B (filter) → Relay-C (amplify) → Strikers. A three-relay pipeline. Each relay has a 12-slot context window. He's confident.

**Minute 1:00 — The Cascade**
Tick 15: enemy wave. Scout floods data. Relay-A compresses — works fine, bar at 60%. But the compressed output is still 3 signals per tick (one per enemy). Relay-B receives 3 compressed signals from Relay-A plus 2 raw signals from a second scout it was also configured to listen to. 5 inputs in one tick. Relay-B's bar jumps from 40% to 80%.

Tick 16: Relay-B processes and forwards to Relay-C. But Relay-B's filter didn't drop enough — it forwarded 4 signals. Relay-C receives 4 signals + its own previous outputs (it's configured with a feedback hook for quality monitoring). Relay-C hits 95%. Red bar. Tremor. Whine.

Tick 17: Relay-A sends another compressed batch. It arrives at Relay-B, which is already stressed. Relay-B hits 100%.

CRACK. Relay-B stuns.

Relay-B's output chain breaks. Relay-C receives nothing this tick — its bar drops slightly (entries age out). But Relay-A doesn't know B is stunned — it keeps sending. When Relay-B recovers at tick 18, it has a BACKLOG — 3 ticks of Relay-A output arrive at once (signals were queued). Relay-B immediately overloads AGAIN.

CRACK. Second stun.

And now Relay-C, which received nothing for 2 ticks, suddenly receives a flood when Relay-B's backlog clears. Relay-C hits 100%.

CRACK. Cascade complete. All three relays stunned in sequence.

On the board, the visual is devastating. Three units in a diagonal line — D3, E4, F5 — all jittering simultaneously. Lightning particles from each overlap, creating a storm of sparks. The red tile tints form a diagonal slash across the board. The audio: three overlapping CRACKs, pitched slightly differently (Relay-A deepest, Relay-C highest), creating a descending chord of failure. The whine builds to a peak and then cuts to silence as all three units freeze.

The strikers at the end of the chain receive nothing. They patrol. Enemies advance unopposed.

Renzo sits back. "That's a cascading circuit breaker failure," he says. He's seen this in production — one service goes down, backpressure floods the upstream, cascading failure. The game just reproduced a real distributed systems failure mode using only context windows and signal chains. He grabs his phone to screenshot the board: three stunned relays in a diagonal line of red tiles and lightning.

**Minute 3:00 — The Post-Mortem**
In the Inspector, the signal genealogy graph tells the story. Relay-A → Relay-B → Relay-C, with buffer fill charts stacked below. The charts show a wave pattern: each relay's fill spikes 1 tick after the previous one's. Classic cascade. The fix is obvious to an SRE: add backpressure — a hook on each relay that stops accepting input when buffer exceeds 80%. Or better: circuit breaker rules that shed load before overload.

Renzo implements the fix and re-runs. This time, when Relay-B hits 80%, it fires a "backpressure" hook to Relay-A, which pauses its output for 2 ticks. The cascade never forms. All three relays stay below 85%. The board is calm. The absence of the cascade IS the victory.

**UI Annotations:**
- Cascade visual: multiple simultaneous stuns create overlapping lightning particle fields
- Cascade audio: multiple CRACKs at different pitches create a chord (minor third interval for 2 simultaneous stuns, diminished for 3)
- Signal genealogy cascade view: stacked buffer charts showing wave propagation pattern, each chart time-aligned
- Backpressure hook: visualized as a signal traveling BACKWARD along the chain (orange dashed line, reverse direction), teaching the concept of feedback control

#### Journey: Luna, 8, plays Pokémon and Animal Crossing, first strategy game

**Context:** Mission 2. She has one scout and one striker. The scout has a 6-slot context window. She hasn't touched the context config at all — it's default.

**Minute 0:00 — The Nice Blue Bar**
Luna likes the little blue bar under her scout. "It's like a battery!" she tells her dad, who's watching. The bar has a few teal segments. The scout patrols. Everything is blue and calm.

**Minute 0:30 — The Orange**
Tick 6: the scout enters a busy area. Three enemies and a terrain feature generate signals. The bar jumps to amber. Luna notices immediately: "It turned orange! Is it bad?"

The static lines appear on the scout — faint flickering. "It's glitchy!" she says. She's not sure why but she associates glitchy with bad. She watches more carefully.

**Minute 0:45 — The Red**
Tick 8: more signals. The bar turns red. The tremor starts. "Dad, it's shaking! Is it going to break?"

Her dad doesn't know. They watch together. The whine is audible — even Luna, who has the volume at 60%, hears it. It sounds like when her laptop fan gets loud. "Something's wrong with it."

**Minute 1:00 — The CRACK**
CRACK. The scout stuns. Lightning bolts spray. Luna gasps. "It broke! It broke!" The red tile. The frozen sprite. The descending tone.

Her dad asks: "Why did it break?" Luna: "Too much stuff in it? The bar was full."

She's 8 years old and she just described a context window overflow in her own words. No tutorial needed. The visual escalation taught her: blue = ok, orange = careful, red = danger, CRACK = broken. The entire arc was intuitive because it borrowed from universal visual language — temperature colors, shaking = instability, lightning = electrical failure.

**Minute 1:30 — The Fix Attempt**
In the workbench after the match, Luna finds the context config. She doesn't fully understand eviction policies, but she sees a slider labeled "Context Window Size" and drags it from 6 to 10. She thinks: "bigger battery = more room." She's right. She redeploys. The scout handles the same area without hitting red. Luna pumps her fist.

(Later, she'll learn that bigger buffers cost more resources and that eviction policies are better than raw size. But for now, "bigger battery" is a perfectly valid mental model that the game will refine over time.)

**UI Annotations:**
- Color progression must be discoverable without text: blue→orange→red is universally understood
- Shaking/static adds secondary channel for colorblind accessibility
- CRACK audio must be surprising but not scary (child audience) — more "pop" than "explosion"
- Context window size slider: accessible at any age, immediate feedback (bar extends/contracts)

---

## Interaction Effects

**× Combo Discovery (4.05):** A resonance cascade signal chain that terminates at a unit ALREADY at 90% context creates the most dramatic moment in the game: the celebration glow (something beautiful is happening) immediately followed by the overload stun (the beautiful thing broke the recipient). The emotional arc — excitement → horror — teaches a deep lesson: **more signal isn't always better.** Architecture quality isn't about maximizing communication; it's about managing it.

**× Signal Chains (locked):** Colored dashed signal lines should visually interact with the overload effect. A signal arriving at a critical unit (red bar) should flash the signal line briefly red at the terminus — the last 2 tiles of the line shift from the channel's normal color to red, signaling "this delivery is pushing the recipient toward overload."

**× Enemy Tactics (locked):** Enemy flooding noise to force stun-locks means the player will see their own units being overloaded by hostile data. The overload visual should distinguish between "overloaded by too much good data" (player's own signal chain was too dense) and "overloaded by enemy noise" (the unit is under information attack). One option: enemy-sourced context entries show as corrupted/glitched segments in the context bar (static-filled rather than solid teal), making it visually obvious that the overload is adversarial.

**× The Inspector (locked):** After a stun event, the Inspector's context window view should show the overload tick in vivid detail — all slots filled, with the fatal incoming signal highlighted in red, and the evicted entries greyed out with strikethrough. The stun is one of the most inspectable moments in the game.

**× Buffer Visualization (4.01):** The context bar at tile level is the summary. The Inspector's buffer view is the detail. Both must use consistent color language (teal/amber/red) and consistent slot representation. The tile-level bar is a lossy compression of the Inspector's full context window — which is itself a metaphor for what the game is about.

**× Audio Design (locked — kulintang):** The overload whine should harmonize with the kulintang tick clock. The whine's pitch should be based on the agung's fundamental frequency — a distant harmonic that gradually approaches dissonance as overload nears. At the CRACK, the dissonance resolves into silence. The contrast between the kulintang's warm metallic timbre and the overload's cold electronic whine creates emotional contrast that teaches "organic system under mechanical stress."

## Comparable Games

- **Oxygen Not Included:** Duplicants under stress show visual and behavioral degradation — stress vomiting, ugly crying, destructive tantrums. The visual escalation (happy → stressed → breakdown) is directly comparable to Robot Uprising's context overload arc. ONI's genius: stress is caused by too many demands and not enough infrastructure, exactly like context overload.
- **FTL:** Ship systems on fire. The fire spreads visually, crew health drops, systems degrade. The "oh no" moment when a missile hits the oxygen system and three rooms ignite simultaneously — this is the cascade failure feeling Robot Uprising needs for relay chains.
- **Factorio:** Belt backup. When a belt is full and items have nowhere to go, the visual feedback is immediate: items stop moving, inserters pause, the entire production line visibly freezes. The "backed up belt" is Factorio's information overload equivalent. Players learn to diagnose backup by looking at belt fullness, just as Robot Uprising players learn to diagnose overload by watching context bars.
- **Into the Breach:** Damage to grid buildings. The 2×2 buildings flash when hit, showing cracks. But Into the Breach doesn't have escalation — it's binary (intact vs. destroyed with HP threshold). Robot Uprising's progressive degradation is more nuanced.
- **Darkest Dungeon:** Stress mechanics with visible character deterioration. The Affliction system (hero breaks down at 100 stress) is the closest parallel — a non-HP resource that, when maxed, causes a breakdown state. Robot Uprising's context overload is Darkest Dungeon's stress system applied to agents instead of characters.

## The TikTok Clip

A 15-second clip: three relays in a line, all with amber bars. Enemy wave arrives. The bars turn red in sequence — left to right, one per tick. The tremor cascades. Then three CRACKs in rapid succession — CRACK-CRACK-CRACK — lightning storms on three tiles simultaneously. The whole board goes silent for one tick. Then the relays reboot, scan-lines sweeping up. Caption: "When you forget to set eviction policies." Or: "My relay chain had a Thursday at 3am."
