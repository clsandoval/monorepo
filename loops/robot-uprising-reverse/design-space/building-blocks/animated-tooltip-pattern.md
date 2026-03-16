# 1.17a — The Animated Tooltip Pattern as Universal Design Principle

## Overview

Into the Breach's single most important UI innovation was animated weapon tooltips — miniature simulations that play on hover, demonstrating in 2-3 seconds what three sentences of text could never communicate. Justin Ma called it "the most important decision we made" and noted that "showing that little animation of them moving is a thousand times more effective" than written descriptions.

This document explores how Robot Uprising applies that principle — **show, don't describe** — as a universal design language across all four building block primitives (skills, rules, hooks, context config). Each primitive type presents different animation challenges: skills are self-contained (easiest), rules are conditional (medium), hooks are relational and cross-agent (hard), and context config is abstract and temporal (hardest). The animated tooltip must work for all four without the player ever needing to read a multi-sentence text explanation.

The design name for this system: **The Micro-Scenario Engine.** Every tooltip spawns a tiny, self-contained simulation that runs on the board preview — a 3-second deterministic scenario that demonstrates the building block in action.

---

## The Core Mechanic: Micro-Scenario Previews

### How It Works

When the player hovers over (or long-presses on mobile) any building block element in the workbench — a skill toggle, a rule strip, a hook slot, or a context config parameter — the board preview in the Plan screen's corner animates a **micro-scenario**: a scripted 3-5 tick miniature battle showing exactly what this building block does.

The micro-scenario is NOT a simulation of the player's actual configuration. It is a **canned teaching animation** — a pre-authored scenario designed to demonstrate one concept clearly. Think of it as a GIF embedded in a tooltip, except it plays on the actual game board with actual game units.

### The Visual Grammar

| Element | Treatment |
|---------|-----------|
| **Board preview** | Dims to 40% brightness. Only the relevant tiles light up at full brightness — a 3x3 or 4x4 spotlight around the action. |
| **Micro-scenario units** | Rendered as holographic outlines (the ghost treatment from the locked spec) rather than solid sprites. Cyan for friendly units, orange for enemy. |
| **Active primitive highlight** | The building block being demonstrated glows with a pulsing gold border in the workbench panel. A thin gold line connects it to the board preview — a visual tether saying "this is what THAT does." |
| **Tick counter** | A tiny "T1 → T2 → T3" strip appears above the board preview, pips lighting up as each micro-tick fires. The scenario auto-plays at 0.5 seconds per tick. |
| **Annotation callouts** | Floating labels appear briefly at key moments: "SIGNAL SENT", "RULE MATCHED", "CONTEXT FULL", "EVICTED". White text on semi-transparent dark pill, 12px monospace, fades after 0.8s. |
| **Loop behavior** | The micro-scenario loops after completion with a 1-second pause showing the end state. A subtle rewind swoosh plays before the loop restarts. |

### Audio Signature

Each micro-scenario plays a distinctive soft audio cue:
- **Start:** A gentle ascending two-note chime (C5→E5, 100ms each, sine wave, 30% volume) — the "lesson starting" sound.
- **Key moment:** A soft "ping" when the demonstrated mechanic fires (the rule matches, the hook transmits, the skill activates). Different pitch per primitive type: skills = major third, rules = perfect fourth, hooks = perfect fifth, context = minor second (slightly dissonant — context is the complex one).
- **Loop reset:** A quiet tape-rewind swoosh (200ms, 20% volume).

---

## Primitive Type 1: Skill Tooltips

### The Challenge

Skills are the easiest to animate because they're self-contained verbs. "Patrol" means the unit moves in a pattern. "Compress" means the unit shrinks data. The micro-scenario just needs to show the skill in action.

### Micro-Scenario Catalog

| Skill | Micro-Scenario | Duration |
|-------|----------------|----------|
| **Patrol** | Ghost Scout appears at C4. Over 3 ticks, it moves C4→D4→D5→C5, tracing a patrol loop. Perception radius (cyan dotted circle, r=5) sweeps across tiles. Enemy ghost appears at E5 on T2 — perception radius flashes brighter when it overlaps the enemy, and a floating "DETECTED" callout appears. | 3 ticks |
| **Evade** | Ghost Scout at D4. Enemy Striker approaches from E4→D4 on T1 (orange arrow). Instead of being eliminated, the Scout slides to C4 (cyan arrow, 150ms slide) on T2. A small "EVADE" callout in green. The tile the Scout vacated flashes red briefly — "you would have died there." | 2 ticks |
| **Engage** | Ghost Striker at E3, enemy at E4. On T1, Striker moves to E4 (adjacent). On T2, combat flash — red cell, enemy sprite shatters into pixel fragments. "ONE-SHOT" callout. Clean, fast, lethal. | 2 ticks |
| **Breach** | Ghost Striker at C3, wall tile at D3, enemy behind wall at E3. On T1, Striker moves to D3. On T2, breach animation — wall tile cracks, spider-web fracture pattern in white. On T3, Striker at E3, enemy destroyed. "BREACH → ENGAGE" callout showing the two-step combo. | 3 ticks |
| **Compress** | Ghost Relay at center. Three signal arrows arrive from different directions (green dashed lines), each carrying a floating data icon (📊📍⚠). Relay's context bar fills from 3/12 to 6/12. On T2, compress fires — the three icons merge into one compact icon (📦), context bar drops from 6/12 to 4/12. "6 SLOTS → 4 SLOTS" callout. | 2 ticks |
| **Filter** | Ghost Relay at center. Four signal arrows arrive. Three are green (useful data), one is red-tinted (noise). On T1, all four hit the context window — bar fills from 0/12 to 4/12. On T2, filter fires — the red-tinted entry ejects upward with a small "poof" particle, context bar drops to 3/12. "NOISE FILTERED" callout. The ejected entry dissolves into faint red sparkles. | 2 ticks |
| **Amplify** | Ghost Relay at center, two listening units on either side (a Scout at B4, a Striker at F4). Relay receives a signal (small icon arrives). On T1, amplify fires — the signal icon duplicates and broadcasts outward as two expanding rings. The rings reach both listeners simultaneously, their context bars each gain one pip. "SIGNAL × 2" callout. | 2 ticks |
| **Hack** | Ghost Specialist adjacent to enemy. On T1, a thin purple beam connects them (like a tractor beam, pulsing). On T2, the enemy's icon flickers — color shifts from orange to confused purple-orange. The enemy's next action arrow rotates 90 degrees. "HACKED: ACTION REDIRECTED" callout. | 2 ticks |
| **Extract** | Ghost Specialist at a tagged resource node (cyan diamond marker). On T1, thin data streams (animated dots flowing along lines) pull from the node toward the Specialist. On T2, the Specialist's context bar gains 2 slots of intel. "INTEL EXTRACTED" callout. The node's glow dims slightly. | 2 ticks |
| **Reassign** | Ghost Command unit at center. A Striker is nearby. On T1, Command emits a pulse toward Striker. On T2, the Striker's skill icon changes — its "engage" icon crossfades to "breach" icon with a subtle shimmer. "SKILL REASSIGNED: ENGAGE → BREACH" callout. The Striker's silhouette subtly shifts posture. | 2 ticks |
| **Reroute** | Ghost Command at center. A signal chain is visible: Scout→Relay→Striker (dashed line path). On T1, Command emits a reroute pulse. On T2, the dashed line redraws: Scout→Striker directly, bypassing Relay. The Relay's hook indicator dims. "ROUTE SHORTENED: 4 TICKS → 2 TICKS" callout. | 2 ticks |
| **Prioritize** | Ghost Command at center. A unit nearby has a full context bar (12/12, angry red pulse). On T1, Command sends a priority pulse. On T2, three entries in the unit's context bar dim and eject (low-priority items cleared). Bar drops to 9/12 (amber). "PRIORITY OVERRIDE: 3 EVICTED" callout. | 2 ticks |

### Sensory Detail: The Patrol Tooltip in Full

The player hovers over the `patrol` skill toggle for Scout ALPHA in the workbench. Within 300ms (the tooltip delay — long enough to avoid flicker on accidental passes, short enough to feel responsive):

1. **Board dims.** The 8x8 board preview, which normally shows spawn points and terrain at full brightness, desaturates to 40% luminosity. The effect is a soft fade, not a hard cut — 200ms ease-out.

2. **Spotlight appears.** A 4x4 region (C3-F6) fades back to full brightness. The edges of the spotlight are feathered, not hard — the tiles at the border are at 70% brightness, creating a natural vignette.

3. **Ghost unit spawns.** A holographic Scout appears at C4 — the same ghost treatment used for plan-phase unit previews. It shimmers into existence over 150ms with a soft "crystallization" particle effect (tiny cyan hexagons coalescing into the unit shape). A quiet electronic hum accompanies the spawn (a filtered white noise burst at 20% volume, 200ms, fading to silence).

4. **Tick 1 fires.** The mini tick indicator above the preview lights its first pip (gold). The ghost Scout moves to D4 — a snap-to-grid movement, not smooth, matching the locked tick-based aesthetic. Simultaneously, the cyan dotted circle representing the Scout's perception radius (r=5) becomes visible. The circle is drawn as animated dashes that "flow" clockwise — a subtle indication that perception is an active, continuous process, not a static zone.

5. **Tick 2 fires.** Second pip lights. Scout snaps to D5. An enemy ghost (holographic, orange-tinted) materializes at E5. The Scout's perception radius now overlaps the enemy's position. The overlap zone briefly flashes brighter cyan — like a sonar ping detecting a contact. A "DETECTED" callout appears above the enemy in white-on-dark pill format. A soft "blip" sound (1200Hz sine, 80ms, 25% volume) plays — the classic radar contact sound.

6. **Tick 3 fires.** Third pip lights. Scout snaps to C5, completing the loop. The enemy fades. The patrol path is now visible as a faint cyan dotted line tracing the C4→D4→D5→C5 rectangle.

7. **End state holds.** The scenario freezes for 1 second. The patrol path pulses gently. The ghost Scout idles at C5 with a subtle breathing animation (0.5px vertical bob, 2-second cycle).

8. **Rewind.** A quick tape-rewind swoosh plays. The scenario resets — ghost dissolves, board spotlight fades, then immediately restarts from step 3. The loop continues until the player moves their cursor away.

9. **Exit.** When the cursor leaves the skill toggle, the board fades back to full brightness over 200ms. The ghost dissolves in reverse — cyan hexagons dispersing outward. The skill toggle returns to its normal un-highlighted state.

---

## Primitive Type 2: Rule Tooltips

### The Challenge

Rules are conditional: "WHEN X → DO Y." The micro-scenario must show both the condition triggering AND the resulting action — a two-beat animation. More critically, it must show **why priority order matters** — the same situation with rules in different order produces different outcomes.

### The Two-Beat Structure

Every rule tooltip micro-scenario has exactly two beats:

1. **Setup Beat (T1):** The condition is established. The board shows the situation that would trigger this rule. Floating callout: "CONDITION: [condition text]" in amber.
2. **Action Beat (T2):** The rule fires. The board shows the resulting action. Floating callout: "ACTION: [action text]" in cyan.

### Micro-Scenario Examples

**Rule: "WHEN enemy_spotted within 3 → DO engage nearest"**

Setup Beat (T1): Ghost Scout at D4, perception radius visible. Enemy ghost materializes at F4 (within 3 tiles of the Scout's position). The distance "2" appears between them as a faint white number. The Scout's context bar gains one entry (📍 enemy position data). Callout: "CONDITION MET: Enemy within 3 tiles" in amber pill, positioned at screen top.

Action Beat (T2): The Scout's rule strip in the workbench panel flashes gold briefly (200ms pulse). The ghost Scout snaps from D4 to E4, closing distance. Then E4→F4 — adjacent to enemy. Combat flash. Enemy destroyed. Callout: "ACTION: Engage nearest" in cyan pill. The rule strip's gold pulse fades.

**Rule: "WHEN buffer_above 75% → DO compress"**

Setup Beat (T1): Ghost Relay at center. Multiple signals arrive over T1 — the context bar fills from 4/12 to 10/12. The bar color transitions from cool blue through amber to hot orange as it approaches 75% (9/12). When it hits 10/12, the 75% threshold line (a faint horizontal line marked on the context bar) flashes. Callout: "CONDITION MET: Context window > 75%" in amber.

Action Beat (T2): The rule fires. The compress animation plays — context entries merge and consolidate. Bar drops from 10/12 to 7/12. Color eases back from orange to blue. Callout: "ACTION: Compress triggered" in cyan. The compression sound plays (a data-crunch sound, like a digital zipper).

### Priority Order Demonstration

When the player hovers over a rule that is NOT the highest-priority rule in the list, the micro-scenario gains a **third beat** — the "preemption beat":

**Setup:** Same as normal.
**Preemption Beat (T1.5):** A ghost copy of a higher-priority rule's animation briefly overlays, then fades with an "X" mark — showing "this HIGHER rule would fire first IF its condition was also met." The higher-priority rule strip pulses faintly in the workbench. Callout: "RULE #1 CHECKED FIRST — condition NOT met, skipping."
**Action Beat:** The hovered rule fires as normal.

This teaches priority ordering implicitly: the player sees that the game checks rules from top to bottom and fires the first match.

### The "Conflicting Rules" Easter Egg

If the player has two rules whose conditions could overlap (e.g., "WHEN enemy_spotted → engage" at priority 1 and "WHEN enemy_spotted → evade" at priority 2), hovering over rule #2 shows a micro-scenario where:
- T1: Enemy appears. Both rules highlight in the workbench panel.
- T1.5: Rule #1 checks first — condition met — rule #1 fires (engage). Rule #2 dims. Callout: "RULE #1 MATCHED FIRST — Rule #2 never reached."
- The player sees that rule #2 is effectively dead code. This is the animated tooltip doing conflict detection — a concept from the rules conflict model (3.06) made visceral.

---

## Primitive Type 3: Hook Tooltips

### The Challenge

Hooks are relational — they connect agents across the board. The micro-scenario must show:
1. The trigger event on the sending unit
2. The signal traveling through the channel
3. The signal arriving at listening units' context windows
4. The latency cost (1 tick per hop)

This is the hardest primitive to animate because it involves multiple units, spatial distance, temporal delay, and the invisible concept of "channels."

### The Cross-Board Animation

Hook tooltips commandeer more of the board preview than skill or rule tooltips. Instead of a 4x4 spotlight, they illuminate the **full signal path** — the sending unit, the receiving unit(s), and the tiles between them. Everything else dims.

**Hook: "WHEN enemy_spotted → SEND position ON recon-net"**

**T1 — Trigger:** Ghost Scout at B4. Ghost enemy appears at C5. Scout's perception radius overlaps. Context bar gains one entry. The hook strip in the workbench pulses gold. Callout on Scout: "TRIGGER: enemy_spotted."

**T2 — Transmission:** From the Scout, a signal pulse (animated green dot) launches upward — a brief vertical emission (the EM noise from the locked emissions model). The dot then travels along a dashed green line toward the channel name "recon-net" which appears as a floating label at the top of the board preview in a small translucent badge. The signal dot reaches the badge. A small broadcast ripple emanates from the badge — concentric circles expanding outward. Callout at channel badge: "CHANNEL: recon-net."

**T3 — Delivery:** The broadcast ripple reaches two listening units — a Relay at E4 and a Striker at G4. The green dashed lines fork from the channel badge downward to each listener. A green dot travels each fork. On arrival, each listener's context bar gains one pip (the new entry glows green briefly). Callout on each: "+1 CONTEXT: position data." The tick counter shows T3 — demonstrating the 2-tick latency from Scout detection (T1) to Striker receipt (T3).

**T4 — Consequence:** The Striker, now holding the enemy position in context, has a rule that fires: "WHEN enemy_position in context → move toward." The Striker begins moving toward C5. Callout: "DOWNSTREAM: Striker acts on intel." This beat shows the CONSEQUENCE of the hook — the information architecture creating emergent behavior.

### The "No Listeners" Warning Animation

If the player configures a hook on channel "recon-net" but no other blueprint is configured to listen on that channel, the micro-scenario changes:

- T1-T2 play normally (trigger, transmission).
- T3: The broadcast ripple expands... and dissipates into nothing. No listeners light up. The signal dot reaches the channel badge, the ripple goes out, and... silence. The board feels empty. Callout: "⚠ NO LISTENERS on recon-net." The callout is amber, not green. A subtle minor-chord sting plays (two descending notes, Eb4→D4, 100ms each) — the "warning" sound.
- The channel badge in the workbench also shows "(0 listeners)" in amber text.

This is the animated tooltip functioning as a **linter** — catching misconfiguration before battle. The player hasn't made a syntax error; they've made an architecture error. And they discovered it by hovering, not by reading.

### The "Overloaded Listener" Warning Animation

If a listening unit's context config has a small buffer and many channels listened to, the micro-scenario shows:

- T1-T3: Normal trigger, transmission, delivery.
- T4: The Relay's context bar is already at 10/12 (orange). The new signal entry arrives, pushing it to 11/12. On the next tick, two more signals arrive from other channels (briefly animated), pushing to 13/12 — the bar flashes red and the unit enters stunned state. Sparking/jittering visual. Callout: "⚠ CONTEXT OVERLOAD — 1 tick stunned."

The player sees the cost of listening to too many channels without enough buffer or filtering configured. The tooltip just taught a lesson that would take a paragraph of text.

---

## Primitive Type 4: Context Config Tooltips

### The Challenge

Context config is the most abstract primitive: buffer size, listen/ignore filters, eviction priority. There's nothing to "show in action" in the same way skills have visible effects. The micro-scenario must make the invisible visible — turning memory management into a physical, watchable process.

### The Context Window as Protagonist

For context config tooltips, the micro-scenario puts the **context window itself** center-stage. Instead of the board preview showing unit movement, it shows a zoomed-in, enlarged version of a single unit's context bar — blown up from the tiny per-unit visualization to a large, detailed view occupying the full board preview space.

The enlarged context window shows:
- **Each slot as a horizontal row** (like the Inspector's click-to-inspect view, but animated)
- **Slot content** as a small icon + text label: `📍 enemy @ E4`, `⚠ threat: HIGH`, `📡 recon-net signal`, `👁 patrol observation`
- **Slot age** as a faint timestamp: `T3`, `T5`, `T8` — how many ticks ago this entry arrived
- **Slot priority** as a colored left-edge accent: bright = high priority, dim = low priority (per eviction config)

### Micro-Scenario: Listen/Ignore Toggle

**Hovering the "Listen: recon-net" toggle (currently ON):**

T1: The enlarged context window has 8/12 slots filled. A green signal arrives from the left, labeled "📡 recon-net: enemy @ D5". It slides into slot 9 smoothly. Context bar ticks from 8/12 to 9/12. The new slot glows green briefly. Callout: "LISTENING — signal accepted."

**Hovering the same toggle but imagining it OFF (displayed as a comparison):**

T2: The same green signal arrives. But this time it hits an invisible barrier at the edge of the context window — the signal icon bounces off with a small "deflect" particle effect (tiny sparks, like a force field). The signal fades and dissolves. The context bar stays at 8/12. Callout: "IGNORING — signal rejected, slot saved."

The two-state comparison teaches the toggle's effect more powerfully than any text label could.

### Micro-Scenario: Eviction Priority

**Hovering the eviction priority setting (currently: "evict oldest first"):**

T1: The enlarged context window is full — 12/12, all slots occupied. The oldest entries (T1, T2, T3) are at the top, slightly dimmer. The newest entries (T10, T11, T12) are at the bottom, brighter.

T2: A new signal arrives (a 13th entry). It pushes against the full buffer. The oldest entry (T1, the dimmest row) flashes red briefly, then slides out to the left — evicted. The row dissolves into faint red particles. All remaining rows shift up by one. The new entry slides in at the bottom. Context bar still shows 12/12, but the color stays stable blue — no overload. Callout: "EVICTION: oldest entry removed."

T3: For comparison, a brief ghost-overlay shows what would happen with "evict lowest priority" — the same full buffer, but this time a different row (a low-priority patrol observation from T8, not the oldest entry from T1) gets evicted. The evicted row has a dim priority accent, showing WHY it was chosen. Callout: "ALT: priority-based eviction."

### Micro-Scenario: Buffer Size

**Hovering the buffer size indicator ("Context Window: 6 slots" on a Scout):**

T1: The enlarged context window shows 6 slots — small, compact. Entries arrive over 3 ticks: patrol observation, patrol observation, enemy spotted, channel signal, channel signal, channel signal. By T3, all 6 slots are full. Bar glows amber.

T2: A 7th entry arrives. The unit enters stunned state — the entire context window frame jitters (2px random offset, 100ms cycle), sparks fly from the corners, a brief electrical buzzing sound plays. One tick passes. Eviction fires. One entry ejects. Bar returns to 5/6. Callout: "OVERLOAD → STUNNED 1 TICK → EVICTION."

T3: A ghosted comparison briefly shows a Relay's 12-slot context window receiving the same signals — comfortably filling to 6/12, no overload, no stun. Callout: "RELAY: 12 slots — same signals, no overload." This teaches why unit type selection matters for different roles.

---

## Player Journeys

### Journey: Mika, 14, First-time strategy player

**Context:** Mission 1. Mika has just completed the boot log sequence and is seeing the Plan screen for the first time. She has one pre-placed Scout with patrol and evade skills. She hasn't played any strategy game before — her gaming experience is Minecraft, Roblox, and mobile games.

**Minute 0:00 — First Encounter with the Workbench**
Mika sees the Plan screen. The board is on the left — an 8x8 grid with a single Scout icon (👁) at position C4. On the right, the workbench panel shows the Scout's blueprint. The skills section has two toggles: `patrol` (ON, cyan) and `evade` (OFF, gray).

Mika doesn't know what "patrol" means in this context. She sees the cyan toggle and a `[?]` icon next to it. She hovers her cursor over the word "patrol."

**Minute 0:05 — The First Micro-Scenario Fires**
The board dims. A spotlight appears around C4-F6. A holographic Scout materializes at C4 — translucent, cyan-tinted, shimmering like a hologram in a sci-fi movie. The tiny tick counter lights up: "T1."

Mika watches the ghost Scout snap from C4 to D4. She sees the dotted cyan perception circle sweep across tiles. On T2, a holographic enemy appears — the circle overlaps it, flashes brighter, and "DETECTED" pops up in a floating label. She gets it immediately: patrol means the unit moves around and spots enemies.

She doesn't read any text. She doesn't need to. The animation told her everything in 3 seconds.

**Minute 0:15 — Experimenting with Evade**
Mika hovers over `evade` (currently OFF). The board dims again. This time the micro-scenario shows an enemy Striker bearing down on the Scout — orange arrow, menacing. Mika tenses. But on T2, the Scout slides sideways, dodging. "EVADE" pops up in green. The empty tile where the Scout was flashes red. Mika gets it: evade means the unit dodges when attacked.

She clicks the evade toggle ON. The circle fills with red, a satisfying click sound plays, and the Scout's ghost on the board gains a faint red threat-awareness ring. She hovers back over patrol — the micro-scenario plays again, but now it includes a beat showing the evade skill triggering when the enemy closes in. The combined animation shows both skills working together.

**Minute 0:30 — Confidence Building**
Mika hasn't read a single tooltip text description. She's learned both skills through 3-second animations. She feels confident enough to hit EXECUTE. She doesn't know it yet, but the animated tooltip pattern just compressed what would have been 2 minutes of reading into 15 seconds of watching.

**UI Annotations:**
- Tooltip hover delay: 300ms before micro-scenario starts (prevents flicker on accidental passes)
- Board dim: 200ms ease-out to 40% brightness
- Ghost unit spawn: 150ms crystallization particle effect
- Tick advance: 500ms per tick in micro-scenarios (half the speed of actual battle)
- Callout labels: 12px monospace, white on dark translucent pill, positioned above relevant unit, fade after 800ms
- Loop pause: 1000ms at end state, then 200ms rewind swoosh, then restart

---

### Journey: Dev, 32, Software Engineer and Factorio Veteran

**Context:** Mission 6. Dev has unlocked the factory, the Relay unit, and the Command unit. He's configuring a complex architecture: Scout → recon-net channel → Relay (compress + filter) → threat-bus channel → Striker. He's in the workbench editing the Relay's hook configuration.

**Minute 0:00 — Hook Tooltip as Architecture Validator**
Dev is editing the Relay's second hook: `WHEN signal_received → SEND compressed_intel ON threat-bus`. He's not sure if the Striker is configured to listen on `threat-bus`. Instead of tabbing to the Striker's blueprint to check, he hovers over the hook's channel name field where it says "threat-bus."

The board preview lights up. Ghost Relay at center. Ghost Scout to the left sends a signal on `recon-net` — green dashed line, animated dot. The signal arrives at the Relay. The Relay processes (compress animation — data crunching). Then the Relay transmits on `threat-bus` — a second animated dot launches rightward. It hits the `threat-bus` channel badge.

The broadcast ripple expands... and reaches a Ghost Striker at the right. The Striker's context bar gains a pip. Callout: "threat-bus: 1 listener (STRIKER-A)."

Dev exhales. The Striker IS listening. He didn't have to check manually. The tooltip told him the full subscriber graph of the channel in a 4-tick animation.

**Minute 0:20 — Discovering a Dead Channel**
Dev adds a third hook to the Relay: `WHEN compress_completed → SEND status ON relay-status`. He hovers over it. The micro-scenario plays: signal triggers, compression runs, status signal emits on `relay-status`...

The broadcast ripple expands and dissipates. Nothing receives it. The amber warning appears: "⚠ NO LISTENERS on relay-status." The minor-chord sting plays.

Dev smirks. He doesn't need that hook. He deletes it before it wastes a precious hook slot. The animated tooltip just saved him a failed battle and a confused debrief session — the signal would have gone nowhere, and he'd have spent 5 minutes in the Inspector wondering why the Striker never received status updates.

**Minute 0:45 — Context Config as Information Triage**
Dev switches to the Relay's context config. It has 12 slots and listens on `recon-net`. He hovers over the eviction priority selector (currently "evict oldest first").

The enlarged context window appears on the board preview — 12 horizontal rows, each representing a slot. The micro-scenario fills them over 3 ticks: patrol observations, enemy positions, channel signals. When the 13th entry arrives, the oldest entry (a stale patrol observation from T1) slides out and dissolves. Dev nods — that's fine for most cases. But he's thinking about high-value signals getting evicted if they're old.

He changes the eviction priority to "evict lowest priority." Hovers again. Now the micro-scenario shows the same overflow, but this time a low-priority patrol observation from T8 gets evicted instead of the old-but-high-priority enemy position from T1. The evicted entry has a visibly dim priority accent compared to the retained T1 entry's bright accent.

Dev sees the difference immediately. He keeps "evict lowest priority" — it protects high-value intel even when the buffer is churning.

**UI Annotations:**
- Channel subscriber count displayed in channel badge during hook micro-scenarios
- "No listeners" warning: amber callout, minor-chord sting (Eb4→D4), channel badge shows "(0 listeners)"
- Eviction priority comparison: ghost overlay showing alternative eviction outcome, 50% opacity, 2-second display
- Full signal path illumination: all tiles between sender and receiver lit, intermediate tiles at 60% brightness

---

### Journey: Aria, 45, Twitch Streamer and Into the Breach Speedrunner

**Context:** Mission 8. Aria is streaming Robot Uprising to her 2,000 viewers. She's configuring a Command agent for the first time. Chat is suggesting different rule orderings. She's exploring the Command's `reassign` skill before deciding where to place it in her priority list.

**Minute 0:00 — Tooltip as Stream Content**
Aria hovers over the `reassign` skill toggle on the Command unit. The board preview dims and the micro-scenario starts. Chat sees the holographic Command unit pulse. A nearby Striker's skill icon visibly changes from `engage` to `breach` with a shimmer effect. "SKILL REASSIGNED: ENGAGE → BREACH" callout.

"Oh WHAT," Aria says. Chat explodes: `PogChamp`, `WAIT WHAT`, `you can CHANGE other units' skills??`, `thats like a manager reassigning tasks`. The 3-second animation just communicated a mechanic that would take 30 seconds to explain verbally. And it's visually dramatic enough to be clip-worthy.

**Minute 0:15 — Rule Tooltip as Teaching Moment**
Aria creates a rule for the Command unit: "WHEN ally_stunned → DO prioritize." She hovers over the rule strip to preview it. The micro-scenario plays the two-beat structure:

Beat 1 (Setup): A nearby Relay enters stunned state — sparking, jittering, context bar red at 12/12. Callout: "CONDITION: Ally stunned."

Beat 2 (Action): The Command sends a priority pulse. The Relay's context bar drops from 12/12 to 9/12 — three low-priority entries ejected. The stun clears. Callout: "ACTION: Priority override cleared stun."

Chat: `the COMMAND can un-stun units??`, `wait no it cleared the overload that CAUSED the stun`, `big brain play`. The two-beat animation communicated cause, effect, and mechanical nuance in 4 seconds.

**Minute 0:45 — The Clip Moment**
Aria discovers that hovering over a rule at priority #3 shows the preemption beat — rules #1 and #2 are checked first. She sees rule #2 match and fire, preempting #3. She drags rule #3 to position #1, hovers again. Now rule #3 (in its new position) fires first. The other rules dim.

"Chat, the tooltip SHOWS YOU the priority order. It's not just telling you the rules are ordered — it's SIMULATING which one fires based on position. This is insane UX." She clips it. 15 seconds of footage that communicates the entire rule priority system.

**UI Annotations:**
- Stream-friendly scale: all callout text is 14px minimum (readable at 720p stream resolution)
- Micro-scenario auto-loops with 1-second pause — long enough for viewers to parse
- The preemption beat uses a red "X" overlay on the preempted rule strip, clearly visible on stream
- Hook signal paths use thick (3px) dashed lines, not thin (1px), for stream readability

---

### Journey: Tomás, 68, Retired Electrical Engineer

**Context:** Mission 3. Tomás has been playing slowly and methodically. He is partially colorblind (deuteranopia — red-green deficiency). He's configuring hooks for the first time, connecting a Scout to a Relay via the `recon-net` channel.

**Minute 0:00 — Accessibility-First Animation**
Tomás hovers over the Scout's hook: `WHEN enemy_spotted → SEND position ON recon-net`. The micro-scenario fires. Crucially, the signal path uses **shape-coded** indicators in addition to color:

- The signal dot traveling along the channel line is a **circle** (send signal = circles)
- The channel badge at the top has a distinct **broadcast icon** shape (concentric arcs)
- The arrival at the Relay uses a **diamond** indicator at the context bar

Tomás can't distinguish the green signal from certain amber tones, but the shape coding makes every step of the signal path unambiguous. The circle launches, travels to the broadcast arcs, delivers as a diamond.

**Minute 0:15 — Latency Made Physical**
The tick counter is what captures Tomás's attention. As an electrical engineer, he thinks in terms of signal propagation delay. The micro-scenario shows:

- T1: Scout detects enemy. Tick pip 1 lights up.
- T2: Signal reaches channel. Tick pip 2 lights.
- T3: Signal reaches Relay. Tick pip 3 lights.

Tomás counts the pips. "Two ticks latency from detection to receipt," he murmurs. He's mapping this to signal propagation in a circuit — and the metaphor holds perfectly. The tooltip just confirmed what the game spec says about 1-tick-per-hop latency, but Tomás didn't read the spec. He watched the pips.

**Minute 0:30 — The "Aha" Moment**
Tomás adds a second hop: Relay → threat-bus → Striker. He hovers over the Relay's hook. The micro-scenario now shows the full chain: Scout→recon-net→Relay→threat-bus→Striker.

- T1: Scout detects.
- T2: Signal reaches Relay.
- T3: Relay compresses and retransmits.
- T4: Signal reaches Striker.

"Four ticks total," Tomás says. "By the time the Striker knows, the enemy has moved three times." He's discovering the latency cost of deep architectures — the fundamental tension in Robot Uprising's information design — through a 4-second animated tooltip. No text explanation needed. The tick pips told the whole story.

He starts considering whether to place the Striker closer to the Scout, or to remove the Relay from the chain entirely — accepting noisier (uncompressed) signals in exchange for faster response time. The animated tooltip created a design decision.

**UI Annotations:**
- Shape coding: circles (send), diamonds (receive), arcs (channel broadcast), squares (context slots) — all meaningful independent of color
- Tick pip counter: 6px diameter circles, gold fill with black outline (high contrast), spaced 12px apart
- Latency number overlaid on signal path: "2 ticks" displayed mid-path in 14px bold, white with black stroke for universal readability
- Context bar uses brightness gradient (bright = recent, dim = old) rather than hue to communicate age — colorblind-safe

---

### Journey: Sam, 10, Playing with Older Sibling's Account

**Context:** Mission 1. Sam is watching over their older sibling Jess's shoulder. Jess is in the bathroom. Sam decides to poke around the workbench.

**Minute 0:00 — Discovery Through Hovering**
Sam doesn't know what any of the words mean. "Patrol"? "Evade"? "Hook"? They move the mouse randomly across the workbench, hovering over different elements.

Every hover triggers a micro-scenario on the board. Sam is transfixed. The holographic Scout moves around. An enemy appears and the Scout dodges. Signals fly across the board with glowing dots. The context bar fills and empties.

Sam doesn't understand the game systems yet. But they understand what they're *seeing*: a little robot moving, dodging, and talking to other robots. The animated tooltips are functioning as **interactive cartoons** — Sam is being entertained by hovering, not frustrated by walls of text.

**Minute 1:00 — Accidental Learning**
Sam hovers over a rule strip. The two-beat animation plays. They notice that the workbench panel flashes when the board animation fires. They start to connect: "the thing on the right makes the thing on the left happen." This is the foundational conceptual link — workbench configuration → battlefield behavior — being transmitted through animation without a single word of explanation.

When Jess returns, Sam says, "The little robot moves around and spots bad guys!" Jess asks how they know. "I just watched it do it!" Jess checks the tutorial progress — Sam hasn't completed any tutorial steps. They learned the Scout's core behavior purely from animated tooltips.

**Minute 2:00 — The Desire to Change**
Sam accidentally clicks the `evade` toggle (switching it ON). The board ghost changes — now the Scout has a red threat ring. Sam hovers over evade again and sees the dodge animation. Then they toggle it OFF. The threat ring disappears. They toggle ON again. It appears.

Sam is learning that the workbench controls the unit's behavior — the most important concept in the game — through toggle+tooltip feedback loops. The animated tooltip pattern has turned the workbench into a toy that teaches itself.

**UI Annotations:**
- All micro-scenarios are self-explanatory without reading text labels
- Toggle feedback is immediate: toggle ON → board ghost changes → tooltip confirms
- No micro-scenario requires prior knowledge to parse visually
- Animation style (holographic, colorful, bouncy) is inherently engaging for young players

---

## Interaction Effects

### With the Sealed Watch (Screen 2)
The micro-scenario animations use the SAME visual vocabulary as the sealed watch: snap-to-grid movement, signal chain dashed lines, context bars, combat flashes. When the player enters the sealed watch for the first time, everything they saw in tooltips reappears — but now it's real, not a demo. The tooltip vocabulary pre-loads the sealed watch visual language.

### With the Inspector (Screen 3)
The Inspector shows decision traces: "unit did X because rule Y matched because signal Z arrived." The tooltip micro-scenarios preview exactly these causal chains — just compressed into 3 seconds. The Inspector is the tooltip unrolled into full detail. Players who internalized the tooltip animations will parse Inspector data faster.

### With the Boot Log (Narrative)
The boot log is text-based diegetic narration. The animated tooltip is its visual complement. The boot log says "PATROL subroutine initialized — waypoint acquisition enabled." The tooltip SHOWS the patrol in action. The two systems reinforce each other: text introduces the vocabulary, animation demonstrates the behavior.

### With the Blueprint Codex
The Blueprint Codex is described as a "collection-style card screen" for reference. Each Codex card should embed the same micro-scenario as the workbench tooltip — a looping animation on the card demonstrating the skill/rule/hook in action. The player opens the Codex to look up "how does compress work?" and sees the same 3-second compression animation they first encountered in the workbench tooltip.

### With Mobile/Touch Platforms
On touch devices, hover doesn't exist. The animated tooltip triggers on **long-press** (500ms hold) instead. The micro-scenario plays in a larger overlay panel (not constrained to the board preview corner) since mobile screens have less space for simultaneous board + workbench display. A "close" button (X in top-right corner of overlay) dismisses it. The animation is identical; only the trigger and container change.

### With Accessibility
- **Screen readers:** Each micro-scenario has an aria-label describing the animation: "Patrol skill: Scout moves in a 4-tile loop and detects enemies within 5 tiles."
- **Reduced motion mode:** Micro-scenarios play as a slideshow (3 static frames, 1 second each) instead of animated transitions. Same information, no motion.
- **High contrast mode:** Ghost units rendered with solid outlines (3px white border) instead of translucent holographic effect.
- **Colorblind modes:** Shape-coded indicators (circle/diamond/square/arc) carry all meaning independent of hue.

---

## Comparable Games

### Into the Breach — The Origin
The weapon tooltip shows a miniature 3x3 grid with ghost units, animating the weapon's push/damage pattern. Robot Uprising scales this from "show one weapon effect" to "show one building block across a full architectural chain." The Into the Breach tooltip is 1-2 seconds and affects 1 unit. The Robot Uprising micro-scenario is 2-4 seconds and can involve 3-4 units across the board — especially for hook and command tooltips.

### Tactical Breach Wizards — The Rewind Complement
TBW lets you freely test abilities and rewind. Its preview system shows consequences before commitment. Robot Uprising's tooltips serve a different need — they're not previewing an action you're about to take, they're teaching you what a building block *does* so you can decide whether to include it in a design you'll execute later. TBW previews are "what will happen." Robot Uprising tooltips are "what could happen."

### Slay the Spire — Card Hover Context
StS shows detailed card effects on hover with dynamic values based on current state. Robot Uprising's skill tooltips at their simplest (the Toggle Panel paradigm from 3.04) are closest to this — hover to see what a skill does. But StS tooltips are static text. Robot Uprising animates them.

### Factorio — Recipe Tooltip as Architecture Preview
Factorio's recipe tooltips show inputs→outputs with icons and quantities. The multi-tooltip system (splitting complex recipes into separate product tooltips) is analogous to Robot Uprising's hook tooltip showing the full signal chain — multiple connected elements previewed from a single hover point.

### Baba Is You — Rule Visualization
Baba Is You's rules are visible on the game board itself — you literally see "WALL IS STOP" written in tiles. Robot Uprising's rule tooltips perform a similar function: making the invisible rules visible, but through animation rather than spatial arrangement.

---

## Strengths

1. **Eliminates the "what does this do?" problem** — every building block is self-documenting through animation
2. **Teaches cross-primitive interactions** — hook tooltips demonstrate how skills, rules, and channels interact
3. **Functions as a linter** — "no listeners" and "overloaded buffer" warnings surface misconfigurations before battle
4. **Scales from child to expert** — a 10-year-old learns by watching; a veteran uses it to validate architecture
5. **Pre-loads sealed watch vocabulary** — players enter battle already knowing the visual language
6. **Stream-friendly** — dramatic 3-second animations that communicate mechanics visually are inherently clip-worthy
7. **Reduces text dependency** — players who don't read English (or don't read at all) can learn through animation

## Weaknesses

1. **Authoring cost** — every skill, rule condition, rule action, hook trigger, hook payload, context config option, and their combinations need authored micro-scenarios. With 12 skills, ~8 rule conditions, ~8 rule actions, ~6 hook triggers, ~5 hook payloads, and ~4 context config parameters, that's potentially 40-50+ unique micro-scenarios to script, animate, and test.
2. **Board preview space** — the locked Plan Screen has a "small tactical map preview in the corner." Micro-scenarios need enough board space to be readable. If the board preview is too small, complex hook chain animations become illegible.
3. **Hover conflict with editing** — players actively editing a rule strip (clicking tokens, typing channel names) may accidentally trigger tooltips on adjacent elements. The 300ms delay mitigates but doesn't eliminate this.
4. **Combinatorial explosion** — the micro-scenario for a rule depends on the condition AND action. If there are 8 conditions × 8 actions = 64 possible rules, authoring 64 unique scenarios is expensive. A fallback is to decompose: show condition animation + action animation sequentially, mixing and matching from pools.
5. **Mobile performance** — animating micro-scenarios while the player is long-pressing requires real-time rendering. Low-end mobile devices may struggle with ghost unit rendering + particle effects + signal path animations simultaneously.

---

## The TikTok Clip

A 15-second screen recording: a player hovers over a hook on the Command unit. The board erupts with holographic ghosts — a Scout detects an enemy, a signal dot races across the board through a Relay, the Striker receives it and charges. The player drags the hook to a different position. Hovers again. Now the signal goes directly to the Striker, skipping the Relay. The tick counter shows "2 ticks" instead of "4 ticks." The player nods, hits EXECUTE. Caption: "The tooltip doesn't describe what your agents do. It SHOWS you. Every hover is a 3-second simulation."

---

## Discovered Aspects

During this analysis, the following new aspects emerged for future exploration:

- **1.17a-i — Micro-scenario authoring pipeline:** How to systematically author, test, and maintain 50+ micro-scenarios as the game evolves; decomposed vs. holistic scenario design; combinatorial scenario generation from condition+action pools
- **1.17a-ii — Board preview sizing tension:** The locked "small tactical map preview" vs. the animated tooltip's need for readable board space; when should the board preview expand during tooltip display; responsive board preview sizing
- **1.17a-iii — Tooltip-to-Inspector continuity:** How the 3-second tooltip micro-scenario maps to the full Inspector decision trace; "expand this tooltip" as a shortcut to the Inspector view of the same causal chain; the tooltip as compressed Inspector
- **1.17a-iv — Combined primitive tooltips:** When the player has configured a skill + rule + hook that form a combo, hovering over any one of them should show the full combo chain; how far does the "radius" of a tooltip micro-scenario extend across connected primitives?
- **1.17a-v — Tooltip as competitive coaching tool:** In multiplayer, hovering over an opponent's shared config to see how their hooks and rules work; the tooltip as scouting tool for competitive play
