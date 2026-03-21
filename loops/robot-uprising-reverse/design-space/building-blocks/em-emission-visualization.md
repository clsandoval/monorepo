# 3.10e — EM Emission Visualization: Making Detectable Noise Visible

## Overview

Every hook chain in Robot Uprising emits electromagnetic noise. Deeper architectures — more hooks, longer chains, higher range — are smarter but louder. Enemy units detect EM emissions and converge on the source. This is the game's central stealth/power tradeoff: the intelligence network that makes your robots brilliant is the same signal that gets them killed.

But the player faces a perceptual gap. During the plan phase, they see **signal chains** — colored dashed lines connecting units along named channels, traveling dots showing data flow, the beautiful nervous system they designed. What they do NOT see is what the enemy sees: **aggregate EM noise**, a formless haze of electromagnetic radiation leaking from every hook fire, every chain relay, every amplified broadcast. The signal chains are precise, architectural, directed. The EM emissions are diffuse, omnidirectional, cumulative. The player's view of their own network and the enemy's view of that same network are fundamentally different representations of the same underlying activity.

This is the core visualization problem. The player must understand two things simultaneously:

1. **"What is my network doing?"** — the signal chain view they already have (colored wires, traveling dots, channel topology).
2. **"What can the enemy hear?"** — the EM emission footprint, which aggregates all hook activity into a noise floor that enemy units detect as a scalar intensity at each tile.

If the player can only see (1), they build beautiful architectures that scream. If they can only see (2), they cannot debug signal flow. The design challenge is showing both without overwhelming an already information-dense 8x8 isometric grid — and making the relationship between them intuitively legible.

The locked spec establishes:
- **Hooks emit detectable EM noise** — deeper architectures are louder
- **Enemy units detect EM emissions** — convergence on noise sources
- **Signal chains visible** during sealed watch as colored dashed lines
- **EM scales with range** (per 3.10a — quadratic scaling on configurable-range hooks)
- **Hook chaining depth increases emission** (per 3.09 — hot chains emit 2x)
- **Plan screen** for configuration, **Sealed Watch** for execution, **Inspector** for debrief

---

## The Perceptual Gap: Signals vs. Noise

Consider a simple three-unit chain: Scout (range 3) fires on `recon-net`, Relay receives and compresses, Relay fires on `intel-net` (range 5) to Striker. The player sees two colored wires and two traveling dots. Clean, legible, purposeful.

The enemy sees something entirely different. At the Scout's tile: a burst of EM from the hook fire, intensity proportional to range (3^2 = 9 EM units). At the Relay's tile: another burst from the outbound hook (5^2 = 25 EM units), plus residual processing noise. The EM radiates outward from both tiles, attenuating with distance. An enemy scout three tiles from the Relay detects a combined EM reading of ~30 units. It does not know there are two separate signals on two separate channels. It does not know the Relay is a relay. It knows only: *something loud is over there*.

This distinction — directed architecture vs. diffuse noise — is what the visualization must communicate. The player needs to think in both frames simultaneously, shifting between "architect" mode (signal chains) and "adversary" mode (EM footprint).

---

## The Four Visualization Options

### Option A: "The Aura" — Integrated Glow Around Units

**Philosophy:** Each unit glows with EM intensity proportional to its cumulative hook activity. Brighter glow = louder unit. The EM visualization is integrated directly into the unit's on-board representation — no separate layer, no toggle, no overlay. Noise is always visible as part of the unit itself.

**How it works:** Every unit on the 8x8 grid has a soft radial glow extending 1-2 tiles from its position. The glow's brightness scales linearly with the unit's total EM output over the last N ticks (configurable lookback window, default 5 ticks). A silent unit — no hooks fired recently — has zero glow: the tile is clean, the unit sprite sits dark against the grid. A unit that just fired a range-3 hook gains a faint amber halo, barely visible, like a candle behind frosted glass. A Relay that fired a range-6 amplified broadcast blazes with a hot amber corona that spills two tiles outward, washing adjacent tiles in warm light. A Command unit running 6 hooks per tick on high-range channels becomes a small sun — the glow saturates its tile and bleeds into neighbors, impossible to ignore.

**Sensory description:** The plan screen shows your architecture at rest. Five units sit on the grid, connected by colored dashed wires. No glow — nothing has fired yet. You hit EXECUTE. The sealed watch begins. Tick 1: the Scout spots an enemy. Its tile flickers — a soft amber pulse, like a match struck in darkness, barely there, fading over half a second. The cyan signal dot departs along the wire toward the Relay. Tick 2: the Relay receives, processes, fires outbound. Its tile flares brighter — a warm, steady amber glow that persists for a full second, illuminating the two adjacent tiles like a desk lamp switched on in a dark room. The gold signal dot races toward the Striker. Tick 3: the Striker receives and acts. Its glow is minimal — it consumed data but didn't broadcast.

Now look at the board from the enemy's perspective. The Scout's tile: a faint warm smudge, easy to miss. The Relay's tile: a visible beacon. If the enemy has a Scout within detection range, that beacon registers. The player can see *why* — the Relay's glow is bright because it fired a high-range hook. The cause (hook activity) and the consequence (visible EM) are unified in a single visual element.

At scale, with 8+ units running multiple hooks, the board develops hot spots and cold spots. Stealth architectures — short range, minimal chaining — are dark constellations: faint, dispersed glows that barely register. Aggressive architectures — long range, deep chains, frequent broadcasts — are bonfire clusters, tiles blazing amber, enemy scouts turning to investigate. The player learns to read their own board's luminosity as a threat indicator.

**Strengths:**
- Zero UI overhead. No toggle, no overlay, no separate mode. The glow is always present, always proportional, always legible. The player absorbs EM awareness passively.
- Cause and effect are visually co-located. The unit that glows is the unit that emitted. No abstraction layer between "who broadcast" and "who is loud."
- Scales naturally. One unit glowing is a detail. Eight units glowing creates a heat map without the player requesting one.
- Teaches the stealth/power tradeoff through ambient visual feedback. The player doesn't need to understand EM mechanics intellectually — they see bright = loud = dangerous.

**Weaknesses:**
- No spatial precision. The glow shows *which unit* is loud but not *where the enemy can detect it from*. A unit glowing amber at intensity 25 — can the enemy hear it from 3 tiles away? 5? The aura doesn't answer.
- Conflicts with channel color wires. The amber glow competes for visual bandwidth with the colored dashed signal lines already on the board. On a busy tick, amber glow + cyan wire + gold wire + traveling dots = visual soup.
- No plan-phase preview. During the plan screen, nothing has fired, so nothing glows. The player cannot preview their EM footprint before executing. They learn EM only through post-execution observation.
- Binary information: glowing vs. not glowing. The gradient between "barely glowing" and "blazing" is legible, but the player can't extract a numeric EM value without hovering for a tooltip.

---

### Option B: "The Heat Map" — Separate EM Overlay Toggle

**Philosophy:** A dedicated overlay mode transforms the entire grid into a heat map of EM intensity. Toggle it on: the board shows noise contours. Toggle it off: the board shows signal chains. The two views are separate lenses on the same reality.

**How it works:** A toggle button in the plan screen toolbar — labeled with a small waveform icon — switches between "Signal View" (default, showing colored wires and channel topology) and "EM View" (showing a tile-by-tile heat map of cumulative EM emission). In EM View, each tile is tinted on a cold-to-hot gradient: deep navy (zero EM), teal (low), amber (medium), hot orange (high), white-hot (extreme). The tinting is calculated per-tile by summing all EM contributions from all units, attenuated by distance. Tiles near high-emission units glow hot. Tiles far from all units stay cold navy. The result is a thermal satellite image of your communication network's noise footprint.

During the plan phase, the heat map is **predictive** — it calculates expected EM based on configured hook ranges, chain depths, and firing frequencies (estimated from trigger types: ON_OBSERVE fires ~every 3 ticks, ON_TICK fires every N ticks, ON_RECEIVE fires proportionally to inbound traffic). This is an estimate, not a simulation, but it gives the player a pre-execution sense of their noise floor.

During sealed watch, the heat map updates live — each tick recalculates tile EM based on actual hook fires. The map pulses and shifts as signals propagate, hot spots flaring and cooling.

**Sensory description:** You have finished configuring your five-unit architecture. Colored wires criss-cross the board — cyan recon-net, gold command-net, magenta alarm-net. Everything looks clean, purposeful, elegant. You tap the EM toggle.

The board transforms. The colored wires fade to 10% opacity, barely visible ghosts. In their place, a thermal landscape emerges. Your Relay's tile — center board, running four hooks at range 5-6 — burns white-hot, a bright island in a sea of cooler tones. The amber heat radiates outward in concentric bands, reaching four tiles before fading to teal. Your two Scouts, running range-3 hooks, show as moderate teal-amber spots — warm but not alarming. Your Striker, configured to receive only, is a cool navy dot. Your Command unit, range 7, broadcasting on three channels, is a second white-hot island in the opposite corner.

Between the two hot spots — Relay and Command — runs a warm amber corridor. Any enemy unit crossing that corridor would detect your network. The flanks of the board, where no unit broadcasts, are deep navy: silent, invisible, safe corridors for enemy movement.

You see, immediately, the problem. Your Relay and Command are both broadcasting at high range. The board has no quiet zone larger than two tiles. An enemy scout entering from any edge would detect your network within three tiles. You drag the Relay one tile south. The heat map shifts in real-time — the warm corridor narrows. You reduce one of the Command unit's hook ranges from 7 to 4. The heat around it contracts, pulling inward like a cooling ember. The navy quiet zones expand. You toggle back to Signal View: the wires now look slightly different (the shortened-range hook's wire is shorter), but the topological intent is the same. Toggle to EM View: the noise floor is lower. You have traded reach for stealth without changing your architecture's logic.

**Strengths:**
- Spatial precision. Every tile has a visible EM value. The player can identify exactly where the enemy will detect them and where silence reigns.
- Pre-execution prediction. The plan-phase heat map lets the player optimize EM footprint before committing to EXECUTE. This is the Into the Breach consequence-preview principle applied to stealth.
- Clean separation of concerns. Signal View for architecture design, EM View for stealth assessment. Neither interferes with the other.
- The thermal aesthetic is universally legible. Hot = dangerous, cold = safe. No learning curve for the color mapping.

**Weaknesses:**
- Context switching cost. The player must toggle between views, holding the signal architecture in memory while reading the EM map. This bifurcated attention increases cognitive load.
- Prediction accuracy. The plan-phase heat map is an estimate based on expected firing rates. Actual execution may differ dramatically (a rule that rarely triggers produces less EM than predicted). The prediction creates a false confidence: "I optimized this in EM View" may not hold during sealed watch.
- Hides the cause. In EM View, the player sees hot tiles but may not immediately connect "this tile is hot because the Relay's range-6 hook fires every tick." The abstraction from signal-chain-cause to EM-effect requires toggling back and forth.
- UI real estate. A toggle button + two view modes adds complexity to the plan screen toolbar. For a game already managing workbench, channel map, ghost preview, and tactical view, another mode is a cognitive cost.

---

### Option C: "The Sonar Ring" — Enemy Detection Range Circles

**Philosophy:** Forget what your units emit. Show what the enemy can *hear*. Each enemy unit has a visible detection radius — a circle on the grid showing the area where it can sense EM emissions above its detection threshold. If your unit's EM falls inside an enemy's detection circle, you've been heard.

**How it works:** During sealed watch, each enemy unit projects a translucent red circle representing its EM detection range. The circle's radius scales with the enemy's detection sensitivity (a stat: enemy scouts have wide detection, enemy strikers have narrow). The circle is always visible — it shows where the enemy is "listening," regardless of whether your units are emitting.

When your unit fires a hook and emits EM, the game checks: does the emission intensity at the enemy's tile exceed the enemy's detection threshold? If yes, the enemy's detection circle flashes brighter — it has "heard" you. The circle contracts to point at the detected source, briefly forming an amber wedge aimed at your noisy unit. The enemy turns to investigate.

During the plan phase, the detection circles of pre-placed enemy units (visible in the tactical preview for most missions) are shown as faint red outlines. The player can position units outside these circles — or accept the risk of being inside them.

**Sensory description:** The sealed watch opens. Your five units sit on the left half of the board, connected by colored signal wires. On the right half: three enemy units, each surrounded by a translucent red circle. The enemy Scout's circle is wide — five tiles radius, a pale crimson disc covering nearly a quarter of the board. The enemy Strikers' circles are small — two tiles, tight red halos hugging their positions.

Tick 1: your Scout fires on `recon-net`, range 3. A faint amber pulse at your Scout's tile. The enemy Scout's red circle, four tiles away, does not react — the emission was too weak at that distance. Safe. Tick 3: your Relay fires on `intel-net`, range 6. A bright amber flare at the Relay's tile. The enemy Scout's circle, three tiles from the Relay, pulses sharply — the red disc brightens to scarlet for a half-second, and a thin amber wedge extends from the enemy toward your Relay, like a searchlight beam swinging to face the noise. The enemy Scout begins moving toward the Relay.

You watch, helpless during the sealed watch, as the enemy Scout closes the gap. Your architecture was too loud at the Relay node. Next iteration, you will shorten the Relay's hook range or reposition it farther from the enemy's detection perimeter.

The critical moment: at tick 8, three of your units fire simultaneously. The enemy Scout's circle flashes three times in rapid succession — three detection events from three sources. The wedge swings between targets, unable to settle. The enemy Scout moves toward the strongest source. You can read the enemy's decision-making through the behavior of its detection circle.

**Strengths:**
- Shows the consequence, not the cause. The player doesn't need to understand EM math — they see "enemy heard me" as a visual event. Binary, immediate, actionable.
- Enemy-centric framing teaches threat assessment. The player learns to read the enemy's sensory capabilities and position accordingly. This is Metal Gear Solid's noise indicator philosophy: show the detection state, not the emission physics.
- Detection circles during the plan phase enable spatial stealth planning. "Stay outside this circle" is a simpler instruction than "keep your EM below threshold X at distance Y."
- Natural integration with stealth gameplay. The circles ARE the stealth mechanic's visualization — if you're inside the circle and loud, you're detected.

**Weaknesses:**
- Requires visible enemy units. In fog-of-war missions where enemy positions are unknown, the detection circles don't exist until the enemy is spotted — but by then, mutual detection has already occurred.
- Doesn't show emission intensity. The player knows "the enemy heard me" but not "how loud was I?" The circle is binary (detected / not detected) rather than graduated. A barely-detected signal and a screaming broadcast look the same.
- No plan-phase self-assessment. The circles show enemy sensitivity, not your emission level. Without toggling to a heat map or glow view, the player can't evaluate their own noise floor independently of enemy placement.
- Mission-specific. The utility of detection circles depends entirely on how many enemies are on the board and whether their positions are known. In missions with hidden enemies or late-spawning waves, the circles appear too late to inform architecture design.

---

### Option D: "The Contrail" — EM Trail Particles Following Signal Paths

**Philosophy:** Every signal that travels along a wire leaves behind an EM residue — visible particles that linger along the path, slowly dissipating. The more signals that travel a path, the denser the particle trail. Busy channels leave thick, bright contrails. Quiet channels leave thin wisps. The contrails ARE the EM emission — they show both where signals went and how much noise accumulated along the way.

**How it works:** When a signal dot travels along a wire during sealed watch, it sheds tiny amber particles in its wake — 2-3px soft circles that float gently off the wire path, like sparks from a welding torch, before fading over 3-5 ticks. A single signal leaves a thin, ephemeral trail that vanishes quickly. But a busy channel — a relay forwarding compressed data every tick — accumulates particles faster than they decay. The contrail thickens, brightens, becomes a persistent amber cloud along the wire path.

The particle density at any point is the EM intensity at that tile. Enemy units detect these particles. A tile with a thick contrail reads as high-EM to the enemy detection system.

**Sensory description:** Early in the sealed watch, the board is clean. Your signal chains are faint colored dashes — the static topology. Tick 1: the first signal fires. A cyan dot departs the Scout, and behind it, a faint trail of amber motes — tiny, barely visible, like dust motes caught in a sunbeam. They drift slightly off the wire path, one pixel up, one pixel left, randomized. By the time the dot reaches the Relay, the trail behind it is already fading. Three ticks later, the motes dissolve. Clean.

But the Scout fires again at tick 4. And tick 7. And tick 10. Each signal deposits fresh particles along the same wire. By tick 12, the Scout-to-Relay wire is haloed in a persistent amber mist — the old particles haven't fully decayed before new ones arrive. The wire looks like it is smoking. The Relay's outbound wire, firing every other tick with compressed data, develops its own contrail — denser, because the Relay's range-5 hooks produce more energetic particles. The two contrails overlap at the Relay's tile, creating a bright amber knot — a visual hotspot where noise concentrates.

By tick 20, the board tells a story through its contrails. The busy Scout-Relay-Striker pipeline is wreathed in amber haze. The quiet backup channel — an emergency hook that has never fired — shows zero particles, its wire pristine. The board's EM footprint is an emergent painting, drawn by the signal traffic itself, beautiful and damning.

At 2x playback speed, the particles accumulate faster and the contrails thicken more aggressively — the player sees the noise build up in compressed time, a time-lapse of electromagnetic pollution.

**Strengths:**
- Emergent and honest. The contrails reflect actual signal traffic, not predictions or estimates. What you see IS what happened. No abstraction, no estimation error.
- Spatial AND temporal. The contrails show not just where noise is but how it accumulated over time. A thick trail means sustained activity. A thin trail means a single burst. The enemy's detection logic mirrors this — sustained noise is more detectable than a single pulse.
- Aesthetically stunning. The amber particle clouds, drifting and accumulating, create a visual signature unique to each architecture. Stealth builds are clean and dark. Aggressive builds are wreathed in glowing fog. Streamers will pause to admire the particle art.
- Bridges the perceptual gap. The particles attach to signal wires (the player's architectural view) but accumulate into a haze (the enemy's detection view). The single visualization serves both perspectives.

**Weaknesses:**
- Performance cost. Rendering hundreds of floating particles on an 8x8 grid, each with decay timers and drift physics, may be expensive on lower-end hardware. Mobile platforms especially.
- No plan-phase preview. Like Option A, contrails only appear during execution. The player cannot assess their EM footprint before hitting EXECUTE.
- Visual noise at scale. With 6+ active channels, particles from different wires overlap and merge. The player can no longer tell which channel is contributing to a hotspot — the contrails blend into undifferentiated amber fog.
- Decay timing is arbitrary. Do particles linger 3 ticks or 10? The choice dramatically affects the visual density. Too short and the board stays clean (undermining the teaching). Too long and the board drowns in particles (overwhelming the signal chain view).

---

## The Key Insight: Plan Screen Preview vs. Sealed Watch Reality

The four options split along a critical axis: **when does the player learn their EM footprint?**

| Option | Plan Phase (Before EXECUTE) | Sealed Watch (During Battle) | Inspector (After Battle) |
|--------|----------------------------|------------------------------|--------------------------|
| A: Aura | Nothing (no hooks have fired) | Live glow per unit | Retrospective glow replay |
| B: Heat Map | Predictive estimate (valuable but imprecise) | Live tile-by-tile thermal | Full replay with EM timeline |
| C: Sonar Ring | Enemy detection zones visible (if enemy positions known) | Detection events (flash + wedge) | Detection event log |
| D: Contrail | Nothing | Emergent particle accumulation | Particle replay at scrub speed |

The plan screen is where the player makes decisions. The sealed watch is where consequences play out. If the player can only see EM during the sealed watch (Options A, D), they are learning from failure — effective but slow. If they can see EM during the plan phase (Option B, partially C), they are planning for stealth — faster iteration, lower frustration.

The recommended approach is **layered**: a plan-phase preview (B's heat map) paired with a sealed-watch visualization (A's glow or D's contrails) paired with a post-battle diagnostic (C's detection event log in the Inspector). No single option covers all three temporal frames. The player needs different visual languages at different stages of the design-execute-debug loop.

---

## Recommended Hybrid: "The EM Language"

**Plan Screen:** Toggle-able heat map overlay (Option B) showing predicted EM footprint. Cold navy = silent. Hot amber = loud. The toggle shares the toolbar with the existing channel map panel. A small waveform icon with a tooltip: "EM Preview — estimated noise floor based on hook configuration." The heat map updates in real-time as the player adjusts hook ranges, repositions units, or changes chain depth. This is the primary stealth planning tool.

**Sealed Watch:** Integrated unit aura (Option A) for at-a-glance noise awareness, plus contrail particles (Option D) on high-traffic wires for cumulative effect. The aura tells the player which unit is loud right now. The contrails show which pathways have been loud over time. Together they create a rich, ambient EM aesthetic without requiring any toggle. Enemy detection events (Option C's sonar ring flash) appear when an enemy unit actually detects your emission — a scarlet pulse on the enemy's tile with a brief directional wedge. This is the consequence indicator: your EM was high enough, in the right place, at the wrong time.

**Inspector:** Full EM timeline. The player can scrub to any tick and see the tile-by-tile heat map at that moment. Detection events are logged as red markers on the timeline. Clicking a detection event shows: which enemy detected which EM source, at what intensity, and what action the enemy took in response. The Inspector also overlays the Specialist's hack skill interactions — a successful hack that masks EM emission shows as a blue "dampening field" around the hacking unit, visibly shrinking the EM footprint.

---

## Player Journeys

#### Journey: Datu, 32, Network Engineer (Manila)

**Context:** Mission 7. Datu has mastered signal chains and relay positioning. His architectures are efficient — minimal hops, clean channel topology, good use of compress. He has not yet played a mission where enemy detection is a primary threat. The mission briefing mentions "EM-sensitive enemy patrols" for the first time.

**Minute 0:00 — The Brief**
The boot log scrolls:

```
WARNING: Enemy patrol units in this sector are equipped with
EM detection arrays. Hook activity generates electromagnetic
noise proportional to broadcast range and chain depth. Enemy
patrols will converge on detected EM sources.
RECOMMENDATION: Minimize emission. Use short-range hooks.
Keep architectures shallow. Consider silence as a weapon.
SUBSYSTEM ONLINE: EM Preview overlay (Plan screen toolbar, waveform icon).
```

Datu taps the waveform icon. The board transforms — his familiar grid of colored wires fades, replaced by a thermal landscape. His Relay, center-board with four range-5 hooks, burns white-hot. The heat radiates outward in concentric rings. His two Scouts, range 3, show as moderate warm spots. His Striker is cool. His Command unit, three hooks at range 7, is a second blazing node.

"That's... a lot of heat," he mutters.

**Minute 2:00 — The Redesign**
Datu reduces his Relay's hook ranges from 5 to 3, repositioning it one tile closer to the Scouts to compensate. The heat map updates instantly — the Relay's hot spot contracts from a four-tile radius to a two-tile glow. He reduces Command's broadcast range from 7 to 4, accepting that the Striker must be repositioned within range. The board cools. Navy tiles expand. A quiet corridor opens along the eastern edge.

He toggles back to Signal View. The wire topology has changed — shorter wires, tighter clustering. He toggles to EM View again: the footprint is half its original size. "Like tuning down the MTU to avoid detection on a network segment," he says, satisfied.

**Minute 4:00 — EXECUTE**
Sealed watch. His Scout spots an enemy patrol at tick 3 and fires on `recon-net`. A soft amber pulse at the Scout's tile — the aura flickers, faint. A thin contrail of amber motes follows the signal dot toward the Relay. The Relay receives, compresses, fires toward the Striker. The Relay's aura flares brighter — two hooks fired — but the short range keeps the glow contained. No contrail buildup yet; too early, too few signals.

Tick 8: the enemy patrol passes three tiles from the Relay. No detection. The enemy's detection circle — a faint red halo — doesn't reach the Relay's EM footprint. Datu exhales.

Tick 14: his Scout fires again. The contrail on the Scout-Relay wire thickens slightly — two signals now, the older particles not yet fully decayed. The Relay fires outbound. A faint amber haze begins forming at the Relay's tile, where inbound and outbound contrails intersect. Tick 18: a second enemy patrol approaches from the north, closer to the Scout. Its red detection circle brushes the edge of the Scout's position. The circle pulses — a faint detection event. The enemy turns. Datu's Scout has been heard.

But the Striker is already in position. The enemy patrol walks into an ambush. Mission complete.

**Minute 6:00 — Inspector**
Datu scrubs to tick 18. The EM heat map at that moment shows the Scout's tile at moderate intensity — two hook fires over 18 ticks. He clicks the detection event: "Enemy Scout detected EM emission from SCOUT-A at distance 3, intensity 12 (threshold: 10). Action: investigate." Barely over threshold. If he had used range 2 instead of 3, the intensity would have been 4 — undetectable. He notes the tradeoff: range 2 wouldn't reach his repositioned Relay.

"I need a relay chain to close that gap at lower emission," Datu concludes. The engineering problem is familiar. The medium is new.

---

#### Journey: Aisha, 14, First-Timer (Cebu)

**Context:** Mission 8. Aisha has played through the first seven missions relying on intuition and the visual spectacle of the sealed watch. She builds architectures that work but doesn't optimize deeply. She has never toggled the EM overlay. This mission's enemies are aggressive and EM-sensitive.

**Minute 0:00 — The Loud Architecture**
Aisha configures her usual setup: two Scouts on long-range hooks (range 6), a Relay amplifying everything on range 7, two Strikers. She likes big, bright signal chains. She hits EXECUTE.

Tick 2: Both Scouts fire simultaneously. Two bright amber flares — the auras are vivid, almost alarming. Thick contrails stream from both Scouts toward the Relay. The Relay receives both, amplifies, broadcasts on three channels at range 7. Its aura blazes white-amber, a miniature star on the grid. The contrails from its three outbound hooks overlap and merge into a dense amber cloud covering the Relay's tile and two neighbors. The board's center is wreathed in glowing fog.

Tick 4: Three enemy units detect the emission simultaneously. Their red detection circles flash scarlet. Three amber wedges point at the Relay, converging. Aisha watches the enemy close in from three directions.

Tick 8: The Relay is destroyed. With the communication backbone gone, Scouts broadcast into void — their signals reach no one. Strikers, receiving nothing, stand idle. The remaining units fall one by one.

**Minute 2:00 — "Why did they all come for my Relay?"**
Aisha has seen her units die before, but not like this — not targeted, not converged. She opens the Inspector and scrubs to tick 2. She notices the EM heat map for the first time — the replay shows her Relay's tile as a blazing hot spot, visible from across the board. She toggles the detection event overlay: three red markers at tick 4, all pointing at the Relay.

She returns to the plan screen and, for the first time, taps the waveform icon. The EM preview renders her architecture's predicted noise floor. The center of the board — where her Relay sits — is white-hot. "Oh," she says. She drags the Relay toward the edge. The hot spot moves. She reduces a hook range from 7 to 4. The heat contracts. She reduces another. Cooler still.

She hits EXECUTE again. This time, the Relay's aura is gentler — a warm amber glow instead of a blazing corona. The contrails are thinner. At tick 6, an enemy patrol passes four tiles from the Relay. Its detection circle reaches... but doesn't quite touch the EM footprint. The enemy continues past. Aisha's Strikers engage from ambush positions. Victory.

**Minute 5:00 — The Lesson**
Aisha doesn't verbalize "EM emission scales quadratically with range." She feels it: big hooks = bright glow = dead Relay. Small hooks = faint glow = invisible. The heat map becomes her pre-flight checklist. She will toggle it before every EXECUTE from now on.

---

#### Journey: Kwame, 28, Competitive Streamer (Accra)

**Context:** Gauntlet ranked match, Diamond tier. Kwame is building a "dark network" — an architecture designed to minimize EM emission while maintaining functional intelligence. His opponent's army includes EM-sensitive hunter-killers. Kwame's viewers (1,200 watching) have been asking about stealth builds for weeks.

**Minute 0:00 — "Welcome to the Dark Architecture Masterclass"**
Kwame opens the plan screen. He places three Scouts in a tight triangle — adjacent tiles, range 2 hooks only. "Range 2 is 4 EM units. Range 6 would be 36. Nine times louder. We don't do that here." He toggles the EM preview: three faint warm spots, barely visible against the navy background. "See that? Whisper quiet."

He places two Relays one tile behind the Scout triangle. Range 3 hooks. "The Relays can hear the Scouts because they're adjacent. The Relays talk to each other at range 2 — basically whispering across the desk." EM preview: the Relay tiles are slightly warmer than the Scouts — they fire more hooks — but the total footprint is still compact, a small warm cluster no more than three tiles across.

"Now the hack." Kwame configures his Specialist unit — the one with the hack skill. "The Specialist sits adjacent to the Relay cluster. When it hacks an enemy, it jams EM detection for 3 ticks. Watch the EM preview." He activates the hack skill's dampening field simulation in the plan-phase preview. A cool blue circle appears around the Specialist's tile, overlapping the Relay cluster. Within the blue circle, the heat map dims — the dampening field reduces apparent EM by 50%. The cluster that was a faint warm spot becomes barely detectable.

"Dark network plus hack dampening. The enemy can't hear us until we're already inside their perimeter." Chat erupts with fire emojis.

**Minute 3:00 — EXECUTE**
The sealed watch is a study in restraint. Kwame's Scouts creep forward, firing short-range hooks. The auras are dim — match-light flickers that decay almost instantly. Contrails are gossamer-thin, vanishing within two ticks. The board stays dark. His opponent's hunter-killers patrol the center, their red detection circles sweeping wide. The circles pass over Kwame's cluster twice — no detection. The EM is below threshold at that distance.

At tick 12, the Specialist activates hack on a passing enemy Scout. A blue pulse radiates from the Specialist — the dampening field visible as a cool blue overlay on the adjacent tiles. For three ticks, Kwame's cluster is virtually invisible. During those three ticks, his Scouts reposition one tile forward, and his Striker receives the kill order via the Relay chain. The Striker engages. One enemy down. The hack fades at tick 15. The EM footprint returns to its baseline whisper. The opponent's hunter-killers detect the brief combat EM spike at the Striker's tile — but the Striker has already moved.

"That," Kwame says, "is how you run a dark network. Quiet hooks, tight positioning, hack dampening for burst operations."

---

## Strengths and Weaknesses Summary

| Dimension | Integrated (A+D Hybrid) | Separate Overlay (B) | Enemy-Centric (C) |
|-----------|------------------------|----------------------|--------------------|
| **Plan-phase utility** | None (post-execution only) | High (predictive heat map) | Partial (needs known enemy positions) |
| **Sealed-watch clarity** | High (ambient, no toggle) | Medium (requires toggle during action) | High (detection events are clear) |
| **Causal legibility** | High (glow at source unit) | Medium (tile-level, not unit-level) | Low (shows effect, not cause) |
| **Stealth teaching** | Gradual (learn by watching) | Immediate (pre-execute prediction) | Consequence-driven (learn from detection) |
| **Visual bandwidth cost** | Medium (amber glow competes with channel colors) | Low (separate mode, no overlap) | Low (only during detection events) |
| **Performance cost** | Medium-High (particles + glow) | Low (pre-computed tile tinting) | Low (detection circles are simple) |

---

## Interaction Effects

**Hook range (3.10a):** EM emission scales quadratically with range. The EM visualization must make this scaling viscerally obvious. In the heat map (B), a range-3 hook produces a 9-unit warm spot; a range-6 hook on the same tile produces a 36-unit blazing zone — four times the radius of detectable emission. In the aura (A), the brightness difference between range 3 and range 6 should feel like the difference between a candle and a floodlight. The range dial (from 3.10a Approach C) gains a second feedback loop: drag the range higher and the EM preview heats up in parallel.

**Channel colors (3.10c):** EM emission is channel-agnostic — the enemy doesn't see colors, it sees aggregate noise. This means the amber EM visualization must be visually distinct from all eight channel palette colors (cyan, magenta, gold, lime, coral, violet, teal, rose). Amber was chosen deliberately — it sits between gold and coral in hue but with a warm, desaturated quality that reads as "heat" rather than "data." During sealed watch, the colored signal dots (data flow) and the amber contrails/glow (EM noise) occupy the same wires but are perceptually separable: the dots are bright and saturated, the particles are soft and desaturated.

**Signal chains (3.09, 3.10b):** Longer chains produce more total EM because each hop fires a new hook. A 4-hop chain emits at every node. The contrail visualization (D) makes this beautifully explicit — every hop deposits fresh particles along its segment, and the chain's total contrail is the sum of four segments' trails. The plan-phase heat map shows this as cumulative heat along the chain's path: a 4-hop chain from corner to corner paints a warm streak across the board, while a direct 1-hop connection shows a single warm spot at the sender.

**Stealth gameplay:** The EM visualization is the interface to the stealth mechanic. Without it, stealth is invisible math: the player knows hooks make noise, but can't see how much or where. With the hybrid visualization, stealth becomes a visual design discipline — "make the heat map cold, keep the auras dim, avoid enemy circles." Dark network strategies (short range, tight positioning, minimal chaining) become visually distinctive: the board stays dark. The player can see their stealth, not just calculate it.

**The Specialist's hack skill:** The hack skill's EM dampening effect needs a clear visualization. In the heat map (B), the dampening field appears as a blue-tinted zone that reduces tile heat by 50% — a cool island in the thermal landscape. In the aura (A), units within the dampening field have their amber glow muted, shifted toward a cooler blue-amber. In the sonar ring (C), enemy detection circles that overlap the dampening field show a "jammed" visual — the circle's edge becomes dashed and flickering where it intersects the field, indicating degraded detection capability. The hack creates a mobile dead zone in the EM landscape — a portable pocket of silence that the player can deploy tactically.

---

## Comparable Games

**Metal Gear Solid — Noise Indicators:** Metal Gear's Soliton radar system shows enemy vision cones and alert states. When the player makes noise (gunfire, footsteps on metal), the nearest guard's "!" indicator triggers. The player never sees a "noise map" — they see the consequence (guard alert). This is Option C's philosophy: show the detection event, not the emission physics. Robot Uprising can learn from MGS's binary clarity (detected/not detected) while adding the graduated intensity that MGS lacks — in MGS, all noise triggers the same "!" regardless of volume.

**Invisible Inc. — Sound Propagation:** Invisible Inc. shows sound as expanding circles that travel through rooms and corridors. A guard hears sound, and the game shows exactly which tiles the sound reached and which guard was affected. This is the closest comparable to Option B's heat map + Option C's detection rings. The key lesson: Invisible Inc. shows sound propagation on the *player's turn*, before consequences resolve, enabling planning. Robot Uprising's plan-phase EM preview serves the same function — show the noise before it costs you.

**Alien: Isolation — Motion Tracker:** The motion tracker in Alien: Isolation shows proximity and direction of the xenomorph through a diegetic in-world device — the handheld tracker with its sweeping arc and intermittent pings. The player reads intensity (how close) and bearing (which direction) from an analog instrument. Robot Uprising's EM overlay is the strategic equivalent: a tool the player consults to read the electromagnetic "presence" of their own architecture. The motion tracker also creates a tension between using the device (looking down at the tracker screen, vulnerable) and looking at the environment (seeing threats, unable to read the tracker). The EM toggle creates an analogous tension: checking EM View means not seeing your signal architecture.

**Heat Maps in Strategy Games (Civilization, XCOM, Total War):** Many strategy games use heat map overlays to display territorial control, threat levels, or resource density. Civilization's "strategic view" mode replaces the 3D map with a flat, information-dense overlay. XCOM's threat indicators show alien activity zones. These overlays share a design principle with Option B: a separate information layer that transforms the visual representation of the same map. The lesson: overlays work best when they are fast to toggle (one keypress), visually distinct from the default view (different color palette entirely), and optional (expert players use them, beginners ignore them).

---

## Sensory Summary Table

| Option | Visual | Audio | Tactile (Controller Haptic) |
|--------|--------|-------|-----------------------------|
| A: Aura | Soft amber radial glow, brightest at unit, fading with distance; pulsing on hook fire | Low hum proportional to glow intensity; multiple loud units create harmonic drone | Light vibration on hook fire, stronger with range |
| B: Heat Map | Navy-to-white thermal gradient per tile; cool-to-hot color ramp | Ambient white noise floor rises with average board temperature; quiet board = silence, loud board = gentle static | N/A (plan screen, no haptic) |
| C: Sonar Ring | Translucent red circles on enemy units; scarlet flash + amber directional wedge on detection | Sharp ping on detection event, pitch scales with emission intensity; close detection = low ping, far detection = high ping | Sharp buzz on detection event |
| D: Contrail | 2-3px amber particles drifting off wire paths; accumulation into persistent haze on busy channels | Soft crackling along active contrails, like distant electrical arcing; dense contrails crackle louder | Gentle sustained vibration during heavy traffic ticks |
