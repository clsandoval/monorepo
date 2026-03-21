# 2.11 — Signal Fidelity: Signals Degrade as They Travel (Telephone Game Mechanic)

**Aspect:** 2.11 — Signal fidelity: signals degrade as they travel (telephone game mechanic)
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic
**Dependencies:** 2.10 (Signal Taxonomy), 2.01 (Fixed-Slot Buffer), 2.02b (Delivery Richness), 2.01b (Transit Eviction), 2.14 (Spatial Routing)

---

## The Design Question

A Scout spots an enemy Striker at grid position E4, moving west at speed 2. The Scout's hook fires, sending this observation to RELAY-A. RELAY-A compresses and forwards to RELAY-B. RELAY-B forwards to the Striker defending the western flank. By the time the Striker receives the intelligence — four ticks and three hops later — how much of the original observation is still accurate? How much is still *present*?

Signal fidelity degradation answers this question mechanically: **each hop a signal traverses reduces its information quality.** Not just its timeliness (that is latency, already locked at 1 tick per hop), but its *content accuracy and completeness*. The signal physically changes as it travels. Data drops out. Coordinates lose precision. Confidence values decay. What arrives at the end of a five-hop chain is a ghost of the original observation — enough to know *something* was there, not enough to know exactly what or where.

This is the telephone game made into a game mechanic. The kid at the end of the chain hears "purple elephant" when the kid at the start said "purposeful elegance." Every intermediary introduces noise.

The core tension: **network depth vs. information quality.** Deeper architectures (more relays, more processing stages, wider coverage) are smarter — they can synthesize, compress, and route with sophistication. But depth is the enemy of fidelity. Every hop shaves detail. The player must choose between shallow-but-accurate and deep-but-noisy information pipelines. The brilliance of the tradeoff: the very act of building a better brain makes that brain's inputs worse.

---

## The Mechanical Model: "The Fidelity Meter"

### Signal Fidelity as a Numeric Property

Every signal in the game carries a **fidelity score** — an integer from 0 to 100 representing how much of the original observation's information content survives. When a unit perceives the world directly (perception system), the observation enters the buffer at **fidelity 100** — ground truth, the raw pixel data of the game world translated into context entries. When a hook fires and transmits that observation to another unit, the signal arrives at **fidelity minus the degradation cost**.

**Base degradation per hop: 20 fidelity points.**

| Hops Traveled | Fidelity | What Survives |
|---------------|----------|---------------|
| 0 (self-perceived) | 100 | Full observation: unit type, exact position, movement direction, movement speed, threat assessment |
| 1 (direct transmission) | 80 | Unit type, exact position, movement direction, approximate speed |
| 2 (one relay) | 60 | Unit type, approximate position (±1 tile), movement direction |
| 3 (two relays) | 40 | Unit type, approximate position (±2 tiles), general heading (N/S/E/W only) |
| 4 (three relays) | 20 | Something exists in the general area, class uncertain |
| 5+ | 0 | Signal is static — no usable intelligence. Ghost noise. |

At fidelity 0, the signal still occupies a buffer slot but contains no actionable information. It is electromagnetic residue — proof that someone, somewhere, saw something. The buffer visualization shows it as a dim, flickering pip instead of a solid one. Rules that query the buffer treat fidelity-0 entries as empty: they match no conditions, trigger no actions. But they still take up space. **Dead signals clog the pipe.**

### What "Degradation" Looks Like Mechanically

Fidelity is not abstract. It determines which **data fields** survive on the signal:

**Fidelity 100-81 (pristine):** All fields present. Position is exact (E4). Movement is a vector (west, speed 2). Unit type is specific (enemy Striker). Threat assessment is calculated (will reach base in 4 ticks at current heading). The signal is a complete tactical picture.

**Fidelity 80-61 (good):** Position exact, movement direction preserved, speed approximated (fast/medium/slow instead of exact value). Threat assessment dropped — the receiving unit must calculate its own. The signal tells you where they are and which way they're going, but not how dangerous the trajectory is.

**Fidelity 60-41 (degraded):** Position fuzzy — the signal reports the target in a 3x3 area centered on the original position (the receiving unit sees "enemy Striker, somewhere in D3-F5, heading west"). Movement speed completely dropped. The signal is useful for strategic awareness but not tactical precision. A Striker receiving this cannot engage reliably — it knows the enemy is "over there, heading this way" but not whether to move to D4 or F4 to intercept.

**Fidelity 40-21 (garbled):** Position is a quadrant (NE/NW/SE/SW of the map). Unit type is a class (hostile, not Striker specifically). Direction is cardinal only (west). The signal reads like a war dispatch from the 1800s: "Hostile forces approaching from the east." Enough to reposition defensively. Not enough to mount a targeted intercept.

**Fidelity 20-1 (noise):** The signal contains a single datum: something exists. No position, no type, no direction. A premonition. A vibration in the wire. In the Inspector, these entries render as partially corrupted text — like a status readout with bit errors, characters replaced with unicode glitch blocks. The player can see that information *was* here but has decayed past usefulness.

**Fidelity 0 (dead):** Slot occupied, nothing readable. The buffer pip flickers between dim grey and black, like a dying fluorescent bulb. Eviction policy should prioritize these, but if the player hasn't configured weight-aware eviction, dead signals accumulate like sediment in a river — slowly choking capacity.

### The Compress Skill Interaction

The Relay's compress skill does not merely shrink signals — it **resets fidelity to 80** for the compressed output. Compression is a fidelity-restoring operation. The Relay reads three degraded signals (fidelity 60, 55, 40), synthesizes their overlapping information, resolves contradictions, and produces a new signal at fidelity 80 — because the compressed output is a *new observation* by the Relay itself, grounded in its own processing, not a copy of the originals.

This makes Relays into **fidelity laundering stations.** Raw signals degrade every hop. Compressed signals restart the degradation clock. The optimal architecture is not a flat chain (Scout → Relay → Relay → Relay → Striker) but a **compression cascade** (Scout → Relay-compress → Relay-compress → Striker), where each Relay reads degraded inputs, synthesizes fresh intelligence, and transmits at fidelity 80.

But compression is lossy. Three observations about three different enemies enter the Relay at fidelity 60. Compress produces one summary: "two hostiles in the northern quadrant, one heading west." The three originals had exact positions. The compressed output has a region. Fidelity is 80, but the *content* is less precise than the inputs were when they were fresh. The player faces a choice: **fidelity-high-but-summarized** (compress at every relay) vs. **fidelity-degrading-but-specific** (forward raw signals and accept the decay).

### The Amplify Skill Interaction

The Relay's amplify skill takes a different approach: it **boosts fidelity by 30 points** on a signal without changing its content. An amplified signal that arrived at fidelity 40 leaves at fidelity 70 — the same data fields, but the positional fuzzing tightens, the type classification sharpens, the directional precision recovers. Amplification is signal restoration, not synthesis.

The tradeoff: amplify doesn't reduce buffer slot cost (no compression), doesn't combine multiple signals (no synthesis), and doesn't produce a new observation (no fidelity reset). It just polishes what's already there. The signal still occupies the same number of slots. It's still the same age. But its data fields are now more readable.

**Amplify + compress is a powerful combo.** Amplify three degraded signals to readable fidelity → compress them into a dense, accurate summary → forward the result at fidelity 80 with the precision that the amplified inputs provided. The Relay needs four hook slots for this (receive, amplify-output, compress-input, forward) — exactly the number a Relay has. The blueprint is fully loaded. No room for additional hooks. The player has built a dedicated intelligence processing station that trades all flexibility for maximum signal quality.

### The Filter Skill Interaction

Filter can be configured to **drop signals below a fidelity threshold.** `IF fidelity < 30 → discard` prevents dead and garbled signals from clogging the buffer. This is defensive hygiene — the unit refuses to store junk. The buffer stays cleaner, eviction pressure decreases, and the remaining signals are all usable.

The danger: in a deep network where all signals arrive degraded, a strict fidelity filter drops everything. The unit goes deaf. It receives pings on its channels, evaluates their fidelity, and throws them away one by one. In the sealed watch, the player sees signal-delivery green flashes on the Relay's tile, but the buffer bar doesn't change — signals arriving and being immediately discarded. The unit looks active but is informationally dead. The Inspector reveals the truth: the event log shows `T14 threat-net → RECEIVED (fidelity 25) → FILTERED (below threshold 30)` for every incoming signal. The Relay is too picky for the network it's embedded in.

---

## Visual Language: What Fidelity Looks Like

### Buffer Bar Rendering

The tiny buffer bar at the bottom of each unit tile during sealed watch shows fidelity through **pip saturation.** High-fidelity entries render as bright, fully saturated pips — vivid green for observations, vivid blue for messages. As fidelity decreases, the pip color desaturates toward grey. A fidelity-60 observation is a muted olive-green. A fidelity-30 message is a washed-out steel blue. A fidelity-0 dead signal is a flickering grey-black pixel.

From the zoomed-out battle view, a unit with all high-fidelity signals has a crisp, colorful buffer bar — like a row of bright LEDs. A unit receiving mostly degraded signals has a muddy, grey-washed bar — like a status panel viewed through dirty glass. The visual difference is readable at a glance without clicking anything: vivid bars = good intel, muddy bars = degraded network.

### Signal Chain Visualization

During sealed watch, signal chains render as colored dashed lines between units. With fidelity degradation, the **line color fades with distance.** A signal leaving a Scout is a bright cyan dash. The same signal arriving at the first Relay is teal. At the second Relay, it's grey-green. At the Striker three hops away, it's barely visible — a ghost line, nearly transparent.

When a Relay compresses and retransmits, the outgoing line starts bright again — a fresh cyan dash emerging from the Relay, visually distinct from the fading input lines. The compression cascade is visible as a series of bright → fading → bright → fading segments, like signal repeater stations along an old telegraph line.

### Inspector Detail View

When clicking a unit in the Inspector, each buffer entry shows its fidelity as a **vertical bar on the left edge** of the entry card. Full green bar = fidelity 100. Half-amber bar = fidelity 50. Sliver of red = fidelity 10. The bar is a thermometer read left to right alongside the entry's content.

Content fields that have been lost to degradation show as **redacted blocks** — the field label is visible ("Position:") but the value is replaced by a horizontal bar of static, like a classified document with a black marker stripe. The player can see that position data *existed* at the point of origin but has decayed below the threshold where the game reports it. Hovering the redacted block shows a tooltip: "Degraded — original value lost after 3 hops."

Below the buffer state, the Inspector's decision trace shows fidelity-aware reasoning. If a Striker's rule says `IF buffer contains enemy position → move to intercept` and the only matching entry has fidelity 35 (position is a quadrant, not a coordinate), the decision trace highlights this: `Rule matched: INTERCEPT. Context entry: ENEMY (fidelity 35, position: NW quadrant). Action: move toward NW quadrant center.` The player sees exactly how degraded intelligence produced an imprecise response.

### Audio Design

High-fidelity signal delivery sounds crisp — a clean digital chirp, like a perfectly received packet. As fidelity decreases, the chirp acquires noise: a crackle underneath, a warble in the pitch, a delay in the attack. Fidelity-40 signals sound like a radio transmission through interference — you can hear the original tone, but it's buried under hiss. Fidelity-20 signals are almost entirely static — a brief burst of white noise with a ghost of the original chirp buried inside. Fidelity-0 signals are silent. The slot is occupied, but nothing arrived worth announcing.

During the sealed watch, a well-tuned network sounds like a clean digital orchestra — chirps arriving in sequence, crisp and distinct. A deep, degraded network sounds like shortwave radio — crackles, pops, half-heard transmissions fading in and out. The audio tells the story even when the player isn't watching the buffer bars.

---

## Strengths

**Creates a natural depth limit.** Without fidelity degradation, there's no cost to building arbitrarily deep networks. Add more Relays, add more processing stages, add more layers. Fidelity degradation imposes a natural ceiling: past three hops without compression, signals become useless. The player must design *efficient* architectures — short paths, strategic compression points, minimal unnecessary hops. This mirrors real network engineering where every router adds latency and every proxy adds overhead.

**Makes Relays genuinely valuable.** In the base game, a Relay is a stationary signal repeater. With fidelity degradation, a Relay with compress becomes a **fidelity restoration node** — the only way to extend the effective range of information networks. Without Relays, a Scout's observation degrades to uselessness in three hops. With strategically placed Relays, information can travel across the entire 8x8 board and arrive at actionable fidelity. The Relay upgrades from "signal repeater" to "intelligence processing station."

**Teaches signal processing fundamentals.** The distinction between raw signals (high-fidelity, high-bandwidth, context-window-expensive) and compressed signals (fidelity-reset, low-bandwidth, information-lossy) maps directly to concepts in digital communications: analog vs. digital, lossy vs. lossless compression, signal-to-noise ratio, repeater placement in fiber optic networks. Players learn these concepts through gameplay without jargon.

**Produces visible failure modes.** When a player's network is too deep and signals arrive degraded, the failure is viscerally legible — muddy buffer bars, fading signal lines, garbled entries in the Inspector. The player doesn't need a tutorial tooltip to explain that their information quality is low. They can SEE it. The visual language teaches faster than text.

**Makes spatial positioning matter.** If signals degrade per hop, the physical distance between units on the 8x8 grid has informational consequences. A Scout far from the Striker needs more relay hops, meaning worse fidelity. A Scout close to the Striker can transmit directly at fidelity 80. The player must balance spatial coverage (Scouts far out for early warning) against fidelity (Scouts close for accurate intel). This spatial tension adds a dimension to blueprint design that doesn't exist without fidelity mechanics.

---

## Weaknesses

**Complexity tax on an already complex system.** The game already has buffer management, eviction policies, signal latency, delivery richness, hook routing, channel naming, and rule priority ordering. Fidelity degradation adds another numeric axis to every signal — another thing to monitor, another configuration to tune, another failure mode to diagnose. For a game targeting accessibility alongside depth, this risks pushing the initial learning curve past the "first 10 minutes" threshold. The tutorial must teach fidelity without making Mission 1 feel like a systems engineering course.

**Potential for frustration when combined with latency.** A signal that takes three ticks to arrive (three hops) AND arrives at fidelity 40 is both stale and inaccurate. The player is punished twice for the same architectural decision (building a deep network). If latency alone creates sufficient pressure to build short paths, fidelity degradation is redundant punishment. The two mechanics must be carefully tuned so they create DIFFERENT pressures — latency pushes toward fewer hops for timeliness, fidelity pushes toward compression nodes for accuracy. If they push in the same direction, one of them is unnecessary weight.

**Risk of a single dominant strategy.** If compress resets fidelity to 80, the optimal play is always to compress at every hop. Every Relay runs compress. No Relay forwards raw signals. The amplify and filter skills become inferior alternatives. To prevent this, compression must have meaningful costs: it takes a tick (already locked), it's lossy (combines multiple signals into summaries), and it consumes a skill slot. But if compress is always the right answer to fidelity problems, the degradation mechanic collapses into "always compress" — reducing meaningful choice rather than expanding it.

**Inspector complexity.** The Inspector already shows buffer state, eviction history, decision traces, and signal events. Adding fidelity data to every entry (the vertical bar, the redacted fields, the fidelity-aware decision trace) increases the density of the debrief screen. Veterans will love the detail. Newcomers may drown in metrics. The Inspector's information hierarchy must put fidelity data in the second layer — visible when you inspect a specific entry, not splashed across the summary view.

---

## Interaction Effects

**With signal latency (locked: 1 tick per hop):** Fidelity degradation and latency are multiplicative costs. A three-hop signal is both three ticks old AND fidelity 40. The player faces a two-dimensional optimization problem: minimize hops for freshness AND for accuracy. Compression adds a tick of delay (the Relay processes on the next tick) but resets fidelity — trading time for quality. The optimal architecture depends on the mission's tempo: fast-moving enemies favor shallow-and-fresh (fewer hops, higher fidelity, lower latency), while slow siege scenarios favor deep-and-compressed (more analysis, fidelity-reset at each stage, acceptable delay).

**With delivery richness (2.02b):** Stripped signals (1 slot, minimal data) degrade less noticeably — they have fewer fields to lose. A stripped signal at fidelity 40 still reports "enemy exists, general area" because that's all it ever contained. Structured signals (3-4 slots, full data) degrade dramatically — they have position, vector, type, and assessment fields, each of which can be individually degraded. Rich signals have more to lose. This creates a secondary delivery richness calculation: send rich signals on short paths (where fidelity stays high), send stripped signals on long paths (where degradation doesn't matter because there was less data to begin with).

**With context overload (locked):** Dead signals (fidelity 0) still occupy buffer slots. If a unit receives many degraded signals and lacks a fidelity filter, its buffer fills with useless noise, pushing it toward overload. Overload causes a 1-tick stun — the unit can't act while its buffer compacts. Fidelity degradation becomes an indirect path to stun-locking: a deep network floods units with ghost signals that clog buffers and trigger overloads. The player's information architecture attacks itself.

**With emissions model (locked):** Hook transmissions emit detectable EM noise. Deeper architectures are louder. With fidelity degradation, deep architectures are also dumber — signals arrive garbled. The player who builds a five-Relay processing pipeline is both the loudest unit on the map AND the one receiving the worst intelligence. Depth is punished from both ends: enemy detection (emissions) and information quality (fidelity). This double punishment may be too harsh — playtesting must determine whether the emissions cost alone provides sufficient pressure or whether fidelity degradation tips the balance into "depth is never worth it."

**With the Specialist's extract skill:** The Specialist can extract data directly from enemies or map features. Extracted data enters the Specialist's buffer at fidelity 100 — fresh ground truth. If the Specialist then forwards this via hooks, it degrades normally. But a Specialist positioned close to the Striker can transmit at fidelity 80 in one hop — providing high-fidelity tactical intelligence that no Scout-Relay chain can match at range. This makes Specialists into "fidelity shortcuts" — expensive units that bypass the degradation tax by operating close to the action.

---

## Comparable Games

**Subterfuge (2015):** This real-time submarine strategy game features diplomacy and deception where information shared between players degrades through reinterpretation. Players share intelligence about opponent movements, but each player filters and reframes the data through their own strategic lens. The "telephone game" is social rather than mechanical, but the effect is identical: by the time intelligence reaches the player who needs it, it has been distorted by every intermediary's agenda. Robot Uprising mechanizes this social dynamic — the distortion is systemic rather than human, but the paranoia ("can I trust this signal?") is the same.

**Opus Magnum (Zachtronics, 2017):** The alchemical transmutation engine processes materials through sequences of operations. Each arm, track, and glyph adds a transformation step. Longer production chains are more powerful but harder to optimize. The "signal" (the marble being processed) doesn't degrade in fidelity, but the spatial cost increases per step. Robot Uprising's fidelity degradation adds an information-quality dimension to what Opus Magnum does with physical space — longer chains are more capable but costlier, and the player must find the shortest path that still achieves the goal.

**FTL: Faster Than Light (2012):** Weapons and drones degrade under damage. A weapons system at 50% health fires slower and less accurately. The visual feedback — sparking consoles, flickering displays — communicates degradation without numbers. Robot Uprising's fidelity visualization (desaturating pips, fading signal lines, static-filled Inspector entries) follows the same principle: degradation is felt before it's measured.

**Real-world TCP/IP networking:** The IP time-to-live (TTL) field is decremented by 1 at every router hop. When TTL reaches 0, the packet is dropped. This prevents packets from circulating forever in routing loops. Robot Uprising's fidelity score operates identically — each hop decrements fidelity, and at 0 the signal is functionally dead. The compress-resets-fidelity mechanic maps to NAT/proxy servers that create new packets with fresh TTL values. Players who understand fidelity degradation will recognize TTL instantly when they encounter it.

---

## The TikTok Clip

A Scout spots three enemies. The signal chain fires — bright cyan lines pulse from the Scout through two Relays to a Striker. But the lines fade as they travel. The first Relay's buffer bar shows vivid blue pips; the second Relay's shows washed-out grey-blue; the Striker's shows muddy almost-invisible pips. The Striker moves to intercept based on garbled intelligence — it goes to D4 when the enemy is actually at F4, two tiles off because the position degraded through three hops. The enemy walks right past the Striker's intercept point. The Striker stands there, acting on ghost data, while the enemy reaches the base.

Cut to: the player in the Inspector, scrubbing to the critical tick, clicking the Striker, seeing the buffer entry with "Position: NW quadrant" and a half-empty fidelity bar. They drag the timeline back to the Scout at the same tick — "Position: F4, heading W, speed 2." The full picture. They trace the signal through each hop, watching the fidelity bar shrink, watching fields redact themselves one by one. The "aha" moment: the information was there. It just didn't survive the journey.

Replay: same scenario, but now the player has placed a Relay with compress between the two hops. The Scout's signal arrives degraded, the Relay compresses and retransmits at fidelity 80 — the output line pulses bright again. The Striker receives actionable intel. It intercepts at F4. One-shot kill. The difference was one Relay, positioned correctly, running compress. Network architecture as the weapon.

---

## Player Journeys

#### Journey: Maya, 14, Minecraft redstone enthusiast, first strategy game

**Context:** Mission 3 — Maya has learned context windows and basic rules in Missions 1-2. Mission 3 introduces hooks and multi-unit communication. She has a Scout, a Relay, and a Striker. The mission objective is to defend the base from enemies approaching from the east side of the 8x8 board.

**Minute 0:00 — The Plan Screen**
Maya sees the workbench on the right, the small board preview on the left showing her three pre-placed units. The Scout is at position G3 on the eastern edge — maximum forward observation. The Relay is at D4, center of the board. The Striker is at B5, near the base on the western edge. The boot log introduces hooks: "SUBSYSTEM ONLINE: Hook primitives. Your agents can now transmit what they observe to other agents. Warning: signal fidelity decreases with distance. Each transmission hop introduces noise."

Maya reads "signal fidelity decreases with distance" but isn't sure what it means. She opens the Scout's blueprint. Two hook slots. She drags a hook into slot 1: `WHEN I see an enemy → SEND on channel "danger"`. The hook configuration panel shows a small signal preview: a bright cyan bar labeled "Fidelity: 100 at source, ~80 at first hop, ~60 at second hop." It's a simple bar chart showing the signal's journey, but Maya skips past it — she wants to get to the action.

She configures the Relay to listen on "danger" and forward on "danger-relay". The Striker listens on "danger-relay". The chain is Scout → Relay → Striker. Two hops.

**Minute 1:30 — First Execute**
Maya hits EXECUTE. The tick clock starts. Ticks 1-5, nothing happens. Scouts patrol, the board is quiet. Tick 6: two enemies appear at H4 and H5, entering from the east. The Scout's perception catches both. Two observations enter its buffer at fidelity 100 — bright, vivid green pips in the buffer bar.

The hook fires. Two signals transmit on "danger" — bright cyan dashed lines shoot from the Scout toward the Relay. Maya watches them travel. The lines are bright at the Scout, slightly dimmer as they reach the Relay. The Relay's buffer bar updates: two new pips appear, but they're a slightly muted green-blue. Not as vivid as the Scout's. Maya doesn't notice the color difference yet.

Tick 7: The Relay receives the signals. Its buffer bar shows the incoming data — visibly duller than the Scout's crisp pips. The Relay has no compress skill equipped in this tutorial mission — it just forwards. The hook fires on "danger-relay." Two more signal lines pulse from the Relay to the Striker. These lines are noticeably paler than the ones from the Scout.

Tick 8: The Striker receives two signals. Its buffer pips are washed-out — a muted grey-green instead of the vivid emerald the Scout had. The Striker's rule fires: `IF buffer contains enemy data → move toward enemy`. The Striker begins moving east. But instead of heading straight for H4 where enemy one actually is, the Striker moves toward G5. Close, but not quite right.

Maya frowns. "Why is it going to the wrong spot?"

Tick 10: The Striker arrives at G5. The enemy is at G4 — one tile away, not adjacent. The Striker can't engage (one-shot-one-kill requires adjacency). The enemy moves to F4 on the next tick, toward the base. The Striker chases, always one tile behind because its initial intercept was off.

Tick 14: The enemy reaches the base. Mission fails.

**Minute 3:00 — The Inspector**
Maya enters the Inspector, still confused. She clicks the Striker at tick 8 — the moment it received the signal and decided where to move. The buffer entry card appears:

```
[T8] ENEMY SIGHTING (via danger-relay)
Fidelity: ████░░░░░░ 58/100
Type: Enemy (confirmed)
Position: G4-H5 area (±1 tile)  ← [degraded]
Direction: West
Speed: [REDACTED — degraded below threshold]
```

The position field shows "G4-H5 area" instead of the exact "H4" the Scout saw. The fidelity bar is half-full, amber. Maya clicks the redacted speed field — a tooltip says: "Original value lost after 2 hops. Signal traveled Scout → Relay → Striker."

She scrubs back to the Scout at tick 6. The same observation in the Scout's buffer:

```
[T6] ENEMY SIGHTING (self-observed)
Fidelity: ██████████ 100/100
Type: Enemy Striker (confirmed)
Position: H4 (exact)
Direction: West
Speed: 2 tiles/tick
```

Every field is present. Vivid green fidelity bar, full. Maya drags the timeline slider between tick 6 and tick 8, watching the signal travel through the Relay. At each hop, the fidelity bar shrinks and fields grey out. The position goes from "H4" to "H4-H5 area" to "G4-H5 area" — widening uncertainty with each transmission.

Maya's face lights up. "OH. It's like... the game of telephone. Each time it gets passed, it gets worse." She looks at the board. The Scout is three hops from the Striker. If she put the Scout closer — or removed a hop — the signal would arrive clearer.

**Minute 5:00 — The Redesign**
Maya goes back to the Plan screen. She rethinks. What if the Scout sends directly to the Striker? One hop instead of two. Fidelity drops from 100 to 80 instead of 100 to 58. She removes the Relay from the communication chain. Scout → Striker directly on "danger."

She reruns. This time the Striker receives signals at fidelity 80. Position: "H4 (exact)." Direction: "West." Speed is approximated but present. The Striker moves directly to G4 — the correct intercept point. Tick 10: the enemy walks into adjacency. One-shot kill.

Maya pumps her fist. Then she looks at the Relay, sitting idle in the center of the board, unused. She realizes she'll need it later when the board gets bigger and direct transmission can't reach. But for now, shorter is better. She's learned that every hop costs quality — and sometimes the simplest network is the best one.

**UI Annotations:**
- **Buffer pips (sealed watch):** Color saturation correlates to fidelity — fidelity 100 is vivid emerald, fidelity 60 is muted olive, fidelity 20 is grey
- **Signal lines (sealed watch):** Cyan dashed lines between units fade from bright to pale across hops; compression restart re-brightens the line
- **Inspector fidelity bar:** Horizontal thermometer on each buffer entry card, green → amber → red as fidelity decreases
- **Redacted fields:** Field labels visible, values replaced by horizontal static-pattern bar; tooltip explains degradation cause
- **Signal preview (plan screen):** Small bar chart in hook configuration showing projected fidelity at each hop in the chain

---

#### Journey: Rafa, 32, mobile game designer, plays for design research

**Context:** Mission 6. Rafa has unlocked the factory, all five unit types, and all skills. He's building his first full information architecture from scratch. The mission has enemies approaching from all four map edges. He needs wide-area coverage with a central command hub.

**Minute 0:00 — The Architecture Problem**
Rafa opens the Plan screen and studies the board. Enemy spawners at all four edges. His factory is center-left at C4. He needs Scouts at the perimeter (minimum two hops from center) feeding intelligence to Strikers that defend the base. His first instinct: hub-and-spoke. One Relay at center, four Scouts at the corners, four Strikers near the base. Clean topology.

He does the math. Scout at H1 → Relay at D4 = well, the signal has to traverse multiple tiles but in game terms it's a single hop (hook transmission is not distance-limited on the 8x8 board, just hop-limited). Scout → Relay = 1 hop, fidelity 80. Relay → Striker = 1 hop, fidelity 60. Two hops total. Fidelity 60 means positions are fuzzy (±1 tile) and speed data is lost. Acceptable for rough awareness, bad for precise intercepts.

But Rafa wants the Relay to compress — creating summarized intelligence for the Strikers. Compress resets fidelity to 80. So the actual chain is: Scout (fidelity 100) → Relay receives at fidelity 80 → compress → outputs at fidelity 80 → Striker receives at fidelity 60. Wait — the compress output is a new signal at fidelity 80, and the Striker is one hop from the Relay, so it arrives at 80 - 20 = 60. Same as without compression? No: the compressed signal has LESS data (summary, not raw observations), but that data is accurate at fidelity 80 until the final hop drops it to 60. The positional data in the compressed output is fidelity 80 quality (exact position) that degrades one hop to fidelity 60 (±1 tile).

Rafa realizes: compress doesn't help fidelity on a two-hop chain. It resets to 80, but the next hop drops to 60 anyway. Compress helps on THREE-hop chains: without compress, Scout → Relay → Relay → Striker = fidelity 40 (quadrant only). With compress at the first Relay: Scout → Relay(compress) → Relay → Striker = 80 → 60 → 40... no, wait. The compressed output starts at 80 at the compressing Relay. Next hop to the second Relay: 60. Next hop to the Striker: 40. Still 40.

Unless the second Relay ALSO compresses. Scout → Relay(compress, outputs at 80) → Relay(compress, outputs at 80) → Striker (receives at 60). Now it's fidelity 60 at the Striker regardless of how many compression hops are in the middle. Each compress resets to 80, each subsequent hop drops 20. As long as the final link is one hop, the Striker always gets fidelity 60.

Rafa grabs a pen and starts sketching on paper. The fidelity math is a puzzle, and he loves puzzles.

**Minute 3:00 — The Amplify Breakthrough**
Rafa remembers the amplify skill. It boosts fidelity by 30 without compressing content. What if the last Relay before the Striker runs amplify instead of compress? The chain becomes: Scout → Relay-A (compress, outputs at 80) → Relay-B (amplify, boosts incoming fidelity-60 to 90) → Striker (receives at 90 - 20 = 70). Fidelity 70! Better than 60. Position is exact at fidelity 70 (the threshold for exact position is 61+). Speed is approximated but present. The Striker gets enough data for a precise intercept.

But Relay-B is running amplify, not compress. It forwards the signal with boosted fidelity but doesn't summarize. The Striker's buffer fills faster because the signals aren't compressed. Rafa checks the Striker's buffer: 8 slots. Four Scouts, each generating 2-3 signals per tick, amplified and forwarded individually through Relay-B. That's 8-12 signals per tick hitting an 8-slot buffer. Instant overload. The Striker stuns on tick 2.

Rafa groans. Amplify solves fidelity but creates an overload problem. Compress solves overload but caps fidelity at 60 for the final Striker. He needs BOTH — but a single Relay only has 4 hook slots. Receive, compress OR amplify, forward. Not both.

**Minute 5:00 — The Two-Relay Solution**
The answer: two Relays in parallel at the final stage. Relay-B runs compress (reducing 12 signals to 3 summaries). Relay-C runs amplify on Relay-B's compressed output (boosting fidelity from 60 to 90). Relay-C → Striker at fidelity 70. Three summaries, high fidelity, manageable buffer pressure.

But this uses two Relays to serve one Striker. Expensive. Rafa needs four Strikers (one per direction). Does he need eight Relays for the final stage? That's his entire budget. He can't afford Scouts.

He steps back. Maybe the answer isn't amplify at all. Maybe fidelity 60 is good enough. Position ±1 tile means the Striker might need one extra tick to reach the enemy — it moves to the wrong adjacent tile and has to correct. That's a one-tick delay, equivalent to one extra hop of latency. Is that acceptable?

Rafa runs the mission with fidelity 60 at the Strikers. The Strikers intercept successfully about 70% of the time. The 30% failures are cases where the ±1 tile error puts the Striker on the wrong side of a wall or moving away from the enemy. He decides this is a tuning problem, not a design problem. Fidelity 60 is the "good enough" tier. Amplify is for when you need precision — against fast enemies, in tight corridors, in the late game where every tick counts.

**Minute 8:00 — The Insight**
Rafa writes in his design journal: "Fidelity degradation creates a natural quality-of-service tier system. You can build cheap networks (fidelity 40-60) that give rough intelligence, or expensive networks (fidelity 70-80) with amplify stages that give precise intelligence. The game doesn't force you to solve the fidelity problem — it lets you choose how much accuracy you're willing to pay for. That's a real engineering tradeoff."

He runs the mission. His architecture works. Not perfectly — the southwest Striker misjudges an intercept because of a fidelity-55 position error — but the other three Strikers handle their quadrants cleanly. Final score: 87% intercept rate. Rafa knows he could get 95%+ with amplify stages but would need a bigger budget. He's satisfied with 87%. "Ship it," he mutters, and moves to Mission 7.

**UI Annotations:**
- **Hook config fidelity preview:** When wiring a hook, the panel shows a chain diagram: Source (100) → Hop 1 (80) → Hop 2 (60), with color-coded bars at each stage
- **Compress output indicator:** The Relay's compress skill card shows "Output fidelity: 80 (reset)" in gold text, distinguishing it from a simple forward
- **Amplify output indicator:** Shows "+30 fidelity" in green text with an upward arrow icon
- **Buffer overload preview (plan screen):** Estimated signal throughput vs. buffer capacity, warning icon when projected overflow exceeds 2x

---

#### Journey: Tomas, 45, retired software architect, plays for nostalgia and intellectual challenge

**Context:** Mission 9. Tomas has mastered the game's systems over eight missions. He builds elaborate multi-stage processing pipelines. This mission is a factory-vs-factory battle — the enemy has their own factory producing units. Tomas needs intelligence on enemy production patterns, not just unit positions.

**Minute 0:00 — The Deep Intelligence Problem**
Tomas studies the board. Enemy factory at H4. His factory at A4. The entire 8x8 grid is contested. He wants to build an intelligence pipeline that does more than report "enemy at E3 heading west." He wants to know what TYPE of enemies the enemy factory is producing, at what RATE, and predict where they'll be deployed. This requires signals that survive multiple processing stages with enough fidelity to be cross-referenced.

His architecture: Two forward Scouts at F2 and F6 — deep in enemy territory, observing the factory directly. These Scouts watch enemies emerge from the factory. Each emergence event generates a signal: enemy type, spawn position, initial heading. The signals travel back to his network through a three-stage pipeline:

- **Stage 1: RELAY-FORWARD at E4** — receives raw Scout signals (fidelity 80 after one hop), compresses into production summaries ("2 enemy Strikers spawned this tick, heading south"), forwards on `intel-raw`. Compress resets fidelity to 80.

- **Stage 2: RELAY-ANALYSIS at C4** — receives compressed summaries (fidelity 60 after one hop from Stage 1), runs a pattern-matching rule set that identifies production cadence ("enemy produces Strikers every 4 ticks"), compresses into strategic assessment, forwards on `intel-assessed`. Compress resets fidelity to 80.

- **Stage 3: COMMAND at B4** — receives strategic assessments (fidelity 60 after one hop from Stage 2), uses reassign and reroute skills to adjust Striker blueprints and production queue in response.

Total signal chain: Scout → Relay-Forward → Relay-Analysis → Command. Three hops. But with compression at each Relay, the Command receives signals at fidelity 60 — degraded but usable. The strategic assessment arrives with enough accuracy that the Command can adjust production (e.g., "enemy is producing Strikers, switch our production to more Scouts to maintain vision advantage").

**Minute 2:00 — The Counter-Intelligence Twist**
Tomas hits EXECUTE. The pipeline works beautifully for the first 15 ticks. Scouts observe, Relays compress and analyze, Command adjusts. His production pivots in response to enemy behavior. He's ahead.

Tick 16: the enemy deploys a new unit type — an enemy Relay positioned at G4, one tile from his forward Scout at F6. The enemy Relay starts broadcasting on a high-frequency channel. Not aimed at anything in particular — just noise. Loud, continuous, meaningless EM noise flooding the airwaves.

The noise arrives at Tomas's Scout. The Scout's buffer fills with junk signals — fidelity 80 (one hop from the enemy Relay), occupying real buffer slots. The Scout's hook still fires on observations, but now the outgoing signals compete with noise in the Scout's buffer. The Scout's eviction policy (FIFO) starts evicting real observations to make room for noise that arrived more recently.

The Scout transmits what's in its buffer — a mix of real observations and garbage noise. RELAY-FORWARD receives the mix at fidelity 80 (one hop). It compresses. But compress doesn't know which signals are real intelligence and which are noise — it summarizes everything. The compressed output is contaminated: "2 enemy Strikers and 7 unidentified signals detected near enemy factory." The noise has polluted the summary. Fidelity is 80 (compress reset), but the CONTENT is corrupted.

RELAY-ANALYSIS receives the corrupted summary at fidelity 60. Its pattern-matching rules try to extract production cadence from data that's 70% noise. The assessment becomes unreliable: "Enemy production rate: indeterminate. Multiple unidentified contacts." The Command receives this at fidelity 60 and cannot make a confident decision. It holds the current production queue — the safe default, but now the enemy is shifting strategy and Tomas isn't adapting.

**Minute 5:00 — Diagnosing in the Inspector**
Tomas pauses after the sealed watch. He noticed the muddy buffer bars on his forward Scout around tick 16 — pips that were bright green suddenly interspersed with dull grey entries. He enters the Inspector.

Scrubbing to tick 16, he clicks Scout-F6. The buffer shows 6 slots: 2 are real observations (fidelity 100, vivid green), 4 are noise signals (fidelity 80, blue pips but with a distinctive jittery animation — they're high-fidelity garbage). The noise arrived at fidelity 80 because the enemy Relay is only one hop away. The noise looks HEALTHY in the buffer. It has a bright blue pip. It occupies slots with authority. Only the Inspector's detail view reveals its true nature: expanding a noise entry shows `[T16] NOISE (channel: em-flood, source: ENEMY-RELAY-G4). Content: [random data]. Fidelity: 80.`

Tomas sees the problem immediately. The noise is high-fidelity because the enemy Relay is close. His own signals are high-fidelity too, but they're outnumbered. The FIFO eviction can't distinguish signal from noise. The compress skill can't distinguish signal from noise. The fidelity system grades noise the same as intelligence if it hasn't traveled far.

**Minute 7:00 — The Filter Counter-Play**
Tomas returns to the Plan screen. He needs the Scout's filter skill. He reconfigures Scout-F6: `Filter: IGNORE signals from channel em-flood`. But he doesn't know the enemy's channel name. He can't filter by channel without knowing it.

Alternative: `Filter: IGNORE signals where source = enemy unit`. But can the Scout identify the signal's source as hostile before it enters the buffer? The filter evaluates signals at the point of arrival. The source field shows the transmitting unit. If the Scout's filter rule is `IF source.allegiance = enemy → discard`, the noise never enters the buffer.

Tomas equips the filter configuration: allegiance-based filtering. Enemy-origin signals are discarded before buffer insertion. He reruns from Mission start.

Tick 16: the enemy Relay broadcasts noise. The noise arrives at Scout-F6. The filter evaluates: source = ENEMY-RELAY-G4, allegiance = enemy. Discarded. The buffer stays clean. Real observations at fidelity 100 fill the slots. The hook fires clean signals. The pipeline operates without contamination.

But Tomas has used a filter rule slot on "ignore enemy signals." He only has two rule slots on the Scout. One for filtering, one for observation behavior. If the enemy changes tactics — say, using a hacked allied unit to broadcast noise (source allegiance = friendly, but content = garbage) — the filter won't catch it. Tomas files this away as a potential Mission 10 concern.

**Minute 10:00 — The Reflection**
Tomas leans back. The fidelity system created a second-order effect he didn't anticipate: high-fidelity noise is more dangerous than low-fidelity noise. Noise from far away arrives degraded and is naturally deprioritized by weight-aware eviction (low fidelity = low weight). But noise from nearby arrives at fidelity 80, looks healthy in the buffer, and survives eviction. Proximity is a weapon — not just for combat (one-shot-one-kill adjacency) but for information warfare. The enemy placed its noise Relay close to his Scout specifically to generate high-fidelity garbage.

Tomas thinks about the system he's built: a three-stage intelligence pipeline that works perfectly against passive enemies but nearly collapsed against an active jammer. The fidelity system didn't just add signal quality mechanics — it created an attack surface. High-fidelity noise is an exploit, and filtering by source allegiance is a patch, not a fix. The real solution is building resilient architectures that can distinguish signal from noise at the content level, not just the metadata level.

He writes on his notepad: "In real distributed systems, high-bandwidth junk from a nearby source is harder to filter than low-bandwidth junk from far away. Same principle. The game gets this right."

**UI Annotations:**
- **Noise signal animation (sealed watch):** Enemy-origin noise signals render as jittery blue pips with a faint red outline — visually similar to legitimate signals but subtly wrong, like a counterfeit bill
- **Filter discard indicator:** When filter discards a signal at the point of arrival, the unit's tile shows a brief downward-facing red chevron (signal bounced), distinct from the upward green flash of signal delivery
- **Inspector noise identification:** Noise entries in the buffer detail view show a "NOISE" tag in red text next to the source field; the fidelity bar is blue (high fidelity) but the entry background is tinted with a faint red wash
- **Enemy Relay EM visualization:** During sealed watch, enemy Relays broadcasting noise show expanding concentric red rings (EM emission pulses) — the same visual as friendly transmissions but in red, making the noise source identifiable at a glance

---

## Design Recommendations

1. **Introduce fidelity gradually.** Mission 1-2: no degradation (signals arrive pristine). Mission 3: degradation introduced with the boot log explaining the concept. Mission 4: compress-as-fidelity-reset introduced. Mission 5+: full fidelity system with amplify and filter interactions. This prevents the first-touch complexity problem.

2. **Make the fidelity threshold for "exact position" generous (61+).** Two-hop chains (the most common architecture) produce fidelity 60, which is barely below the exact-position threshold. This means most players' natural architectures produce slightly fuzzy positions — noticeable but not crippling. The player learns through occasional intercept misses, not through total failure.

3. **Consider fidelity decay as a configurable difficulty modifier.** Easy mode: 10 fidelity per hop (signals survive 5+ hops). Normal: 20 per hop (the baseline). Hard: 30 per hop (signals die after 2 hops without compression). This lets the fidelity mechanic scale with player expertise without changing the core design.

4. **Dead signals (fidelity 0) should be auto-evicted.** Don't make the player configure "evict fidelity-0 entries" as a rule. It's never strategically interesting to keep dead signals. Auto-eviction of fidelity-0 entries is a quality-of-life baseline that prevents a frustrating degenerate case (buffer filling with ghosts).

5. **The compress fidelity reset should be 80, not 100.** This preserves the distinction between self-perceived observations (100) and processed intelligence (80). A unit trusting compressed signals is trusting another agent's judgment — which should always carry a fidelity tax. This teaches a real-world principle: secondhand information is never as reliable as firsthand observation, even when the intermediary is trustworthy.
