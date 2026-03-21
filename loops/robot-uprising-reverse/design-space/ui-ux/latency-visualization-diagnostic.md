# 4.13 — Latency Visualization as Primary Diagnostic

## The Option: Signal Age Overlay in the Inspector

The Inspector's debrief overlay annotates every agent action with the **age of the most recent signal that influenced it**. Fresh intelligence glows bright and saturated; stale intelligence dims and desaturates. This single visual layer teaches the deepest lesson in the game: **deeper architectures carry older intelligence**. A Scout→Relay→Command→Striker chain produces smarter behavior — but by the time the Striker acts, the signal that started it all is 4 ticks old. The battlefield has moved on. The player sees this not through numbers or tooltips, but through the progressive dimming of the entire decision trace.

### How It Works Mechanically

Every signal in the system carries a **birth tick** — the tick at which the originating observation was made. When a unit acts, its decision trace references one or more context window entries, each of which has a signal age: `current_tick - birth_tick`. The Inspector overlays this age as a brightness/saturation modifier on everything connected to the action:

| Signal Age | Visual Treatment | Name |
|-----------|-----------------|------|
| 0 ticks (this tick) | Full brightness, white glow halo | **Live** |
| 1 tick | 90% brightness, subtle warm glow | **Fresh** |
| 2 ticks | 70% brightness, slight amber tint | **Warm** |
| 3 ticks | 50% brightness, amber-to-sepia shift | **Aging** |
| 4+ ticks | 30% brightness, desaturated grey-sepia | **Stale** |
| 6+ ticks | 15% brightness, ghostly dim, slight static grain | **Fossil** |

The overlay applies to:
- **Action icons** on the unit's tile (the sword icon for "engage", the eye icon for "patrol")
- **Decision trace lines** connecting the acting unit back to signal sources
- **Context window slots** in the click-to-inspect panel
- **Signal chain dashed lines** between units on the board

The result: a battlefield that literally glows where intelligence is fresh and fades to grey where it's stale. A tight Scout→Striker pair operating on 1-tick-old data blazes with bright lines. A deep Scout→Relay→Relay→Command→Striker chain produces a faint, ghostly thread — smart behavior operating on ancient intel.

### The "Fog of Latency" Effect

When the latency overlay is active, the entire board takes on a temporal quality. Units whose most recent action was driven by fresh signals appear crisp and vivid. Units operating on stale data appear washed out, as if they're living in the past — because they are. The board becomes a **temporal heatmap**: bright regions have fresh intelligence loops, dim regions are flying blind on old data.

This is not the same as fog of war. Every tile is visible. But the *quality of decisions* being made at each position is rendered viscerally. A Striker in the corner operating on 5-tick-old reconnaissance data looks like it's underwater — present but disconnected from reality.

---

## Player Journeys

#### Journey: Kenji, 28, QA Engineer and Factorio Veteran

**Context:** Mission 6. Kenji has just unlocked the Command agent. He built an ambitious architecture: Scout→Relay→Command→Striker, where the Command agent processes scout data, prioritizes threats, and issues targeting orders to Strikers via a dedicated channel. In the sealed watch, his Strikers kept engaging enemies that had already moved. He's frustrated and opens the Inspector.

**Minute 0:00 — The Dim Revelation**

Kenji sees the board frozen at tick 14, where his Striker "Fang" engaged an empty tile. The Striker's action icon — a small sword — is rendered in washed-out sepia, barely visible against the tile. A thin, dim dashed line traces backward from Fang through the Command agent "Nexus," through the Relay "Tower-1," all the way to Scout "Whisper." Every segment of this chain is progressively dimmer. The sword icon practically whispers.

He clicks the Striker. The context window panel slides open on the right. Six slots, each a horizontal bar. The slot that triggered the engage action is labeled `threat_at_D4 [age: 4]`. The bar is painted in faded amber-grey. Below it, a tiny annotation: `born T10 · acted T14`. Four ticks old. The enemy was at D4 four ticks ago. It left two ticks ago.

Kenji's eyes track the decision trace line backward. Scout "Whisper" spotted the enemy at T10 (the originating observation glows bright green in Whisper's timeline). The signal traveled to Relay "Tower-1" at T11 (slightly dimmer). Tower-1 forwarded to Command "Nexus" at T12 (amber now). Nexus issued targeting at T13 (dim). Fang received and acted at T14 (near-ghost). The entire chain is a gradient from bright to dim, left to right, like a photograph fading in real time.

He hovers over the chain. A tooltip reads: **Signal age at action: 4 ticks. Recommended max for combat targeting: 1-2 ticks.**

**Minute 1:30 — The Comparison**

Kenji clicks his other Striker, "Claw," which successfully killed an enemy at tick 14. Claw's action icon blazes — a bright, saturated sword with a faint white halo. The decision trace line runs directly from Scout "Ghost" to Claw, one hop, bright green fading to warm yellow. The context window shows `threat_at_F6 [age: 1]`. Born T13, acted T14. One tick old. The enemy was still there.

The contrast is immediate. Fang's dim ghost-trace versus Claw's bright direct line. Same tick, same type of action, radically different outcomes — and the brightness tells the whole story without reading a single number.

**Minute 3:00 — The Architecture Insight**

Kenji scrubs backward and forward through the timeline using arrow keys. He watches the latency overlay pulse across the board. Early ticks, when enemies are distant: Fang's chain is dim but the Strikers aren't engaging yet, so staleness doesn't matter — Command is gathering intel, making smart decisions about positioning. Late ticks, when combat starts: the 4-tick latency becomes fatal. The overlay makes this temporal phase shift visible. Early game = dim is fine (planning doesn't need freshness). Late game = dim means death.

He realizes: the Command architecture is perfect for strategic positioning but terrible for combat targeting. He needs to add a **direct Scout→Striker hook** for immediate threat data, bypassing the Command chain for urgent signals. The Command chain handles strategy; the direct hook handles combat. Two channels, two latencies, visible as two lines of different brightness on the same Striker.

**Minute 4:30 — Return to Plan**

Kenji exits Inspector, opens Plan screen. He adds a second hook to Scout "Whisper": `on_threat → combat-urgent` channel, listened to by both Strikers. The Command chain stays for strategic orders. He now has a dual-latency architecture — and he knows exactly what it will look like in the Inspector because the brightness encoding has become his mental model.

**UI Annotations:**
- **Action icon brightness**: Sword/eye/move icons on unit tiles rendered at brightness proportional to signal freshness. SVG icons with CSS `opacity` and `filter: saturate()` driven by signal age.
- **Decision trace gradient**: Dashed lines between units use a CSS gradient from source brightness to destination brightness. Each hop dims the line by ~20%.
- **Context window age bars**: Each slot in the click-to-inspect panel shows a horizontal bar. Left edge = bright (born), right edge = current brightness (acted). The bar itself is a gradient showing how the signal aged in transit.
- **Tooltip on hover**: Any dimmed element shows `Signal age: N ticks · Born T{x} · Acted T{y}` plus a qualitative assessment ("stale — enemy likely moved").

---

#### Journey: Maria, 34, Product Designer, First Strategy Game

**Context:** Mission 3. Maria is learning hooks for the first time. She has a Scout and a Striker, and the tutorial just taught her to wire a hook: Scout sends `enemy-spotted` on the `recon` channel, Striker listens. She ran the battle and won, but she noticed the Striker seemed to react a tick late. She's curious and opens Inspector.

**Minute 0:00 — Everything is Bright (Almost)**

The board shows tick 8, where her Striker "Rex" moved toward an enemy. The move icon on Rex's tile glows warm yellow — not blazing white, not dim. The dashed line from Scout "Pip" to Rex is a short, mostly-bright line. She clicks Rex. The context window shows `enemy_at_C3 [age: 1]`. The horizontal bar is painted in warm yellow-green. A small label says `born T7 · acted T8`.

Maria doesn't fully understand yet, but the color catches her eye. She scrubs back to tick 7. Pip's observation icon at C3 is blazing white — full brightness, white glow. It was born this tick. She scrubs forward to tick 8. Rex's action is warm yellow. One tick dimmer. She scrubs to tick 9. Rex is now at C3. The enemy, if it hadn't been killed, would have moved. But with only 1-tick latency, Rex arrived in time.

She notices a faint pulsing animation on the age label — a slow heartbeat that beats faster when the signal is fresh and slower when it's stale. At age 1, it pulses steadily. She's learning to read freshness without thinking about it.

**Minute 1:30 — The Tutorial Nudge**

A small tutorial callout appears at the bottom of the screen (diegetic boot-log style, monospaced cyan text on dark):

```
> DIAGNOSTIC: signal latency = 1 tick (Scout→Striker direct)
> bright = fresh intelligence · dim = stale intelligence
> deeper architectures = smarter but older signals
> [dismiss]
```

Maria reads it and nods. The brightness is freshness. Bright = recent = reliable. Dim = old = risky. She gets it intuitively because she already noticed the color difference. The tutorial confirms what the visual already taught.

**Minute 2:30 — Experimenting with the Scrubber**

Maria uses the arrow keys to step through all 12 ticks of the battle. She watches the brightness of signals cascade across the board. At tick 3, Pip spots the first enemy — a blazing white flash at Pip's position. At tick 4, Rex's action icon glows warm yellow as he moves toward the reported position. At tick 5, Pip spots a second enemy — another white flash. At tick 6, Rex pivots. The overlay shows a living, breathing intelligence network, pulsing with fresh observations that dim as they travel.

She realizes the brightness is showing her the "metabolism" of her system. How fast does her network think? How quickly does perception become action? For her simple two-unit setup, the answer is "one tick" — and everything glows warm and healthy.

**Minute 3:30 — Looking Ahead**

Maria wonders: what happens when she adds a Relay in Mission 4? The signals will travel Scout→Relay→Striker — two hops, two ticks of latency. Will Rex's actions get dimmer? She's already forming hypotheses about latency, and she hasn't read a single tutorial about it. The visualization taught her by showing, not telling.

**UI Annotations:**
- **Pulsing heartbeat**: Signal age drives a subtle CSS animation on action icons. Fresh (0-1 ticks) = fast pulse (1Hz). Warm (2-3 ticks) = slow pulse (0.5Hz). Stale (4+) = no pulse, static dim. This gives a "vitality" feeling — fresh intelligence feels alive.
- **Tutorial callout**: Monospaced cyan-on-dark box, bottom-center, appears once when the player first opens Inspector with the latency overlay active. Diegetic boot-log style. Dismissible.
- **Scrubber integration**: As the player steps through ticks with arrow keys, the brightness overlay updates instantly. Signal birth flashes appear as brief white pulses at the originating unit's position. The player can "watch" intelligence propagate by stepping tick-by-tick and seeing brightness cascade outward from scouts.

---

#### Journey: Diego, 41, Software Architect, Zachtronics Completionist

**Context:** Mission 9. Diego is building a three-tier architecture: front-line Scouts feeding Relays that compress and filter, a Command agent that synthesizes filtered data and issues strategic orders, and Strikers that receive both direct Scout alerts (for immediate threats) and Command orders (for coordinated maneuvers). He's optimizing for minimum-latency-at-all-depths — the architecture should be smart AND fast. The Inspector is his primary tuning tool.

**Minute 0:00 — The Latency Heatmap**

Diego enables the latency overlay and sees the board at tick 22. The battlefield is a gradient. The front line, where Scouts are operating, blazes white and bright green — their own observations are age 0, and their direct hooks to nearby Strikers produce age-1 actions that glow warm yellow. The mid-field, where Relays sit, shows amber lines — signals arriving at age 1, being compressed and forwarded, arriving at Strikers at age 2-3. The rear, where Command sits, is a dim sepia web — signals arriving at age 2-3, being synthesized, orders going out at age 3-4, arriving at Strikers at age 4-5.

The board literally shows the temporal topology of his architecture. Front = bright. Middle = amber. Rear = dim. He can see the latency gradient in the spatial layout.

**Minute 1:00 — Diagnosing the Bottleneck**

Diego clicks on Striker "Hammer," which executed a coordinated flanking maneuver at tick 22. The action icon is dim amber — age 4. The decision trace shows: Scout "Alpha" spotted enemy cluster at T18 (bright), forwarded to Relay "Hub-1" at T19 (warm), compressed and forwarded to Command "Architect" at T20 (amber), Architect issued flanking order at T21 (dim), Hammer received at T22 (dim amber).

But the flanking worked. The enemy cluster was slow-moving, and the 4-tick delay didn't matter because the strategic assessment was still valid. Diego notes this: **latency tolerance depends on what the signal is about.** Enemy positions change fast (low latency tolerance). Enemy cluster formations change slowly (high latency tolerance). Strategic assessments age gracefully; tactical targeting does not.

He checks Striker "Razor," which missed an engage at tick 22. Razor's action icon is dim sepia — age 5. The decision trace goes through an extra Relay hop. That one extra hop — one extra tick — made the difference between a stale-but-valid strategic order and a stale-and-wrong targeting command.

**Minute 2:30 — The Dual-Channel Audit**

Diego opens the **channel metrics panel** in the Inspector sidebar. It shows two channels: `recon-direct` (Scout→Striker, avg latency 1.2 ticks, rendered in bright green) and `command-strategic` (Scout→Relay→Command→Striker, avg latency 4.1 ticks, rendered in dim amber). The channel names are color-coded to match their latency brightness. At a glance, he can see which channels are "fast lanes" and which are "slow lanes."

He toggles between showing only `recon-direct` signals and only `command-strategic` signals on the board overlay. With `recon-direct` active: the board is mostly bright, with warm yellow action icons on Strikers near Scouts. With `command-strategic` active: the board is mostly dim, with amber-sepia action icons on Strikers executing Command orders. The two channels paint completely different temporal pictures of the same battle.

**Minute 4:00 — Optimizing the Relay Compression**

Diego notices that Relay "Hub-2" is adding 2 ticks of latency instead of 1. He clicks Hub-2 and checks its context window. It's at 11/12 slots — nearly full. The compress skill is taking an extra tick because it has too much data to process. The context window chart shows Hub-2 hovering in the amber zone (75%+ utilization) for most of the battle. Its actions are all dim — not because of signal age, but because it's running behind, adding processing latency on top of transit latency.

The latency overlay reveals a distinction between **transit latency** (inherent 1-tick-per-hop) and **processing latency** (extra ticks when a unit's context window is overloaded). Hub-2's actions dim faster than they should because it's bottlenecked. Diego needs to either reduce Hub-2's listen channels (so fewer signals arrive) or increase its buffer size (so compression doesn't stall). The brightness encoding makes the bottleneck visible without requiring him to calculate throughput numbers manually.

**Minute 6:00 — The Architecture Revision**

Diego returns to Plan screen with a precise diagnosis: Hub-2 needs its listen filter adjusted to ignore low-priority channels, reducing context window pressure and eliminating the extra processing tick. He also adds a `priority: urgent` tag to the `recon-direct` channel so that Strikers process direct Scout alerts before Command strategic orders — ensuring that the bright, fresh intelligence always gets read first, even if dimmer strategic orders are also in the buffer.

He's thinking in brightness now. "I want Hammer's engage actions to be at least warm yellow, not amber. That means max 2-tick latency on targeting signals." The visualization has become his optimization metric.

**UI Annotations:**
- **Latency heatmap mode**: Toggle button in Inspector toolbar (icon: a gradient bar from bright to dim). When active, all action icons, decision traces, and signal chain lines are brightness-modulated by signal age. When inactive, everything renders at full brightness (default Inspector view).
- **Channel-filtered overlay**: Dropdown in the channel metrics panel lets the player show signals from only one channel at a time. The board overlay updates to show only that channel's signal chains, with latency brightness applied. Useful for comparing fast vs. slow channels on the same board.
- **Processing latency indicator**: When a unit adds extra latency beyond the expected 1-tick-per-hop (due to context overload or compression stalling), its tile shows a tiny hourglass icon in amber. Hovering shows `+1 processing tick (context at 92%)`.
- **Channel metrics latency bars**: Each channel in the metrics panel shows a horizontal bar with average latency. The bar is brightness-coded: bright green (1 tick avg), warm yellow (2 ticks), amber (3 ticks), dim sepia (4+ ticks). The channel name text is also dimmed to match — a subtle but powerful cue.

---

## Strengths

1. **Teaches the deepest lesson intuitively.** The relationship between architecture depth and signal staleness is the most important strategic insight in the game. Making it a visual brightness gradient means players learn it through their eyes, not through text explanations. Bright = fresh = reliable. Dim = stale = risky. The encoding is universal and requires zero gaming literacy.

2. **Creates a single visual metric for optimization.** Veterans like Diego can optimize their architectures by "making things brighter" — reducing latency until action icons glow at acceptable brightness levels. This replaces abstract throughput calculations with a visceral, glanceable quality check.

3. **Distinguishes transit latency from processing latency.** The overlay reveals when a Relay or Command unit is adding extra ticks due to overload (processing latency) versus the inherent 1-tick-per-hop cost (transit latency). This distinction is critical for optimization and the visualization surfaces it without dedicated metrics.

4. **Scales from beginner to expert.** Maria's 2-unit setup produces mostly-bright signals and she barely notices the overlay — it's just confirmation that things are working. Diego's 15-unit three-tier architecture produces a rich gradient that becomes his primary diagnostic. The same visualization serves both.

5. **The TikTok clip writes itself.** A time-lapse of the Inspector scrubber showing intelligence cascading outward from a Scout — blazing white at the origin, dimming through Relays, arriving as a ghost-dim impulse at a distant Striker — is visually stunning and immediately communicates what the game is about.

## Weaknesses

1. **Brightness overload in complex architectures.** With 15+ units and multiple channels, the board could become a soup of dim overlapping lines. Needs careful visual layering: only the selected unit's full trace at high opacity, other traces at very low opacity. Channel filtering (Diego's journey) mitigates this.

2. **Colorblind accessibility.** The brightness-only encoding (no hue change) is actually more accessible than a red-green gradient, but the warm→amber→sepia hue shift could be invisible to some players. Alternative: offer a "high contrast latency" mode that uses sharp brightness steps (100%/60%/30%/10%) instead of smooth gradients, plus optional numeric age labels on every element.

3. **Risk of over-penalizing deep architectures.** If the visualization makes deep chains look "bad" (because they're dim), players might avoid building them entirely. The game needs to also show the *quality* of deep-chain decisions — the Command agent's order was smarter even though it was staler. Brightness shows freshness but not intelligence quality. A complementary overlay (decision quality/outcome) would balance this.

4. **Performance cost of tracing.** Every action needs to carry the full provenance chain (which signal, which unit, what birth tick) for the overlay to work. This is a data model requirement — each context window entry must store `birth_tick` and `source_unit_id`, and each action must record which entries it referenced. Not complex, but it must be designed into the core simulation from the start.

## Interaction Effects

- **Context window visualization (buffer bars)**: The latency overlay complements context bars. Context bars show *how full* the buffer is. Latency brightness shows *how old* the contents are. A full buffer of stale signals is worse than a half-full buffer of fresh ones. Together, the two overlays give a complete picture of information health.

- **Signal chain dashed lines (sealed watch)**: During sealed watch, signal chains are shown as colored dashed lines at full brightness. In the Inspector, the same lines get latency-modulated. The player recognizes the same visual element but now sees its temporal dimension. The sealed watch shows the network topology; the Inspector shows the network's temporal metabolism.

- **Decision trace (Inspector)**: The decision trace already shows "which rule matched and why." Adding latency brightness to the trace adds a temporal dimension: was the matching rule working with fresh data or fossil data? This makes the decision trace not just a logical chain but a temporal one.

- **Hook design (Plan screen)**: Players who internalize the latency overlay will design hooks with latency in mind. Direct hooks for time-sensitive targeting (stay bright). Indirect chains through Command for strategic planning (acceptable dimness). The overlay in Inspector directly informs architecture decisions in the Plan screen.

- **Context overload mechanic**: A unit that stuns due to context overload loses 1 tick, adding 1 tick of latency to all outgoing signals. The latency overlay makes this visible: post-stun actions are dimmer than pre-stun actions. The cost of overload is not just "lost a turn" but "degraded freshness of every downstream decision."

- **Emissions model**: Deep architectures produce more EM noise (more hooks firing). The latency overlay adds a second cost: they also carry older intelligence. Players face a double tradeoff — smarter but louder AND smarter but staler. Both costs are visually legible (emissions as noise clouds, latency as dimness).

## Comparable Games / Media

**Into the Breach — Damage Preview**: Into the Breach shows you exactly what will happen next turn with bright red damage indicators. The latency overlay is the inverse — it shows you how *old* the information was that caused what already happened. Both use visual salience (brightness, color) to communicate information quality. Into the Breach's preview is prospective; the latency overlay is retrospective.

**Factorio — Throughput Visualization**: Factorio lets you see belt throughput as items-per-second. Full belts look different from half-full belts. The latency overlay is similar but temporal — it shows information throughput not as quantity but as freshness. Both serve the same purpose: making an invisible system property (throughput, latency) visible at a glance.

**Network Monitoring Tools (Grafana, Datadog)**: Real-world latency dashboards use color-coded heatmaps to show service response times. Green = fast, red = slow. The latency overlay translates this professional tool into a game mechanic. Players who use Grafana at work will immediately recognize the pattern.

**Film Photography / Instagram Filters**: The bright→sepia→dim progression mimics how old photographs look. Fresh = vivid color. Old = faded sepia. This cultural association is universal — everyone understands that faded things are old. The game leverages this existing mental model rather than inventing a new one.

**StarCraft II — Replay Analysis**: SC2's replay system lets you step through games tick by tick, but it doesn't annotate decisions with information age. The latency overlay adds a dimension that SC2 replays lack — the ability to see not just what happened but how old the intelligence was that drove it. This is the "what SC2 would look like if it were about information architecture."

## Sensory Description

**The bright pulse of fresh intelligence.** When a Scout spots an enemy, the observation icon on the Scout's tile flares brilliant white — a clean, sharp glow with a soft halo that extends one pixel beyond the icon boundary. The glow lasts for exactly one tick. On the next tick, the action icons of units that received this signal via direct hooks glow warm yellow-green, like sunlight through leaves. Two ticks later, units acting on relayed versions of the signal show amber — the color of aged paper, warm but clearly not fresh. Four ticks on, Command-routed orders arrive at distant Strikers as sepia whispers — visible but ghostly, like writing on parchment left in the sun.

**The decision trace as a fading thread.** Lines connecting units in the overlay are not uniform. They are gradients — bright at the source, dim at the destination. A Scout→Relay→Striker trace starts as a crisp green line at the Scout, blurs slightly as it passes through the Relay (a subtle gaussian bloom at the relay node), and arrives at the Striker as a thin amber thread. Multiple overlapping traces create a web where you can instantly see which connections are fresh (bright, sharp) and which are stale (dim, soft-edged).

**The heartbeat of freshness.** Action icons pulse. Fresh signals drive a quick, confident pulse — 1Hz, a sharp brightening and gentle fade like a heartbeat monitor. Warm signals pulse slower — 0.5Hz, a lazy throb. Stale signals don't pulse at all — they sit static and dim, like a monitor showing a flatline. The transition from pulsing to static happens at age 4. When it stops pulsing, it feels like something died. That feeling teaches: this signal is too old to trust.

**The scrubber cascade.** When the player steps through ticks with arrow keys, each tick produces a tiny wave of brightness changes across the board. Step forward: observations flash white at scout positions, then on the next step the warmth cascades outward to connected units, then on the next step the amber reaches further. It's like watching a stone dropped in a pond — ripples of brightness expanding outward from perception events, dimming as they travel. Step backward: the ripples reverse, brightness flowing backward, re-brightening as you rewind toward the moment of observation. The temporal topology of the architecture is rendered as a wave propagation pattern. Deep architectures produce slow, wide ripples. Shallow architectures produce fast, tight ripples.

**Audio.** When the player clicks a unit with a stale signal, a soft low-frequency hum plays — the sound of old data, like tape hiss on an aging recording. When they click a unit with a fresh signal, a crisp digital chirp plays — clean, present, immediate. The audio reinforces the visual: fresh = crisp, stale = degraded. When scrubbing through ticks and watching brightness cascade, each hop produces a subtle tick sound that decreases in pitch and volume with distance — a diminishing echo that sonifies the latency gradient.
