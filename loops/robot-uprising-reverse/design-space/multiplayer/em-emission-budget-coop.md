# 7.02e — Cross-Boundary EM Emission Budget as Cooperative Resource

## The Option

In Divided Front co-op mode, two players each control half of the board — Player A manages the western 4 columns (A-D), Player B manages the eastern 4 columns (E-H). Each player designs their own blueprints, manages their own factory, and watches their own units execute. But one resource crosses the boundary: **electromagnetic emissions**.

Every hook transmission emits detectable EM noise. In single-player, this is a personal stealth-vs-intelligence tradeoff. In Divided Front co-op, it becomes a **shared detection budget** that neither player fully controls. Player A's chatty relay network raises the EM floor for *both* players. Player B's stealth architecture is undermined by their partner's signal storms. The emission budget is the cooperative equivalent of shared radio frequency allocation — a tragedy of the commons that must be negotiated.

### The Emission Budget Mechanic

**Combined EM Floor**: The enemy's detection algorithm reads the *total* EM emissions across the entire 8x8 board, not per-player. When combined emissions exceed a threshold, enemy units gain enhanced perception (wider detection radius, faster response times, more aggressive patrol patterns). The threshold is displayed as a shared meter at the top of the screen — a horizontal bar divided into teal (Player A's contribution) and crimson (Player B's contribution), with a red danger zone marking the detection threshold.

**Three Budget Models:**

**Model A: "The Shared Pool"**
A single numeric EM budget shared equally. Each hook transmission costs 1 EM point. The pool regenerates slowly (1 point per 2 ticks). When the pool hits zero, ALL hook transmissions are blocked for both players until regeneration provides capacity. Simple, dramatic, but punishing — one player's burst communication can silence both.

The shared pool creates visceral moments: Player A needs to send a critical scout report but the pool shows 0/40. Player B's relay chain just consumed the last 8 points with a compression cascade. Player A's scout sees an enemy flanking formation and can't report it. The unit sits there, watching, silent.

**Model B: "The Noise Floor"**
No hard cap. Instead, combined EM emissions raise a persistent "noise floor" that affects enemy behavior on a gradient. At low combined EM (0-20 units), enemies patrol normally. At medium (20-40), enemies gain +1 perception radius. At high (40-60), enemies actively converge on the loudest EM source. At critical (60+), enemies gain the ability to trace signals back to their source relay — targeted strikes on infrastructure.

This model is more forgiving than the pool (no hard lockout) but creates escalating consequences. The noise floor decays naturally (losing 2 EM units per tick when below threshold), so brief spikes are survivable but sustained loud architectures attract relentless pressure.

**Model C: "The Frequency Band" (Recommended)**
Each player operates on a designated frequency band. Player A's emissions occupy the low band; Player B's occupy the high band. Enemy detection has separate thresholds per band BUT also a *cross-band* resonance threshold — when BOTH bands are active simultaneously, the combined signal is louder than the sum of parts (1.5x multiplier on combined detection). Players can avoid cross-band resonance by timing their communications to alternate: A transmits on even ticks, B on odd ticks. This transforms emission budgeting from a simple "use less" constraint into a **temporal coordination puzzle** — both players can be loud, but not at the same time.

The frequency band model teaches **time-division multiplexing** — a real telecommunications concept where multiple users share a channel by taking turns. The visual representation: two waveforms on the EM meter, oscillating out of phase when coordinated (clean alternating peaks) or stacking when uncoordinated (combined peaks breaching the resonance threshold).

### The Emission Negotiation Interface: "The Radio Room"

During Plan phase, both players see a shared "Radio Room" panel — a split view showing each player's projected EM footprint based on their current blueprint configurations. The projection shows:

- **Per-tick emission estimate**: calculated from hook count x expected trigger frequency x signal payload size
- **Peak emission windows**: predicted ticks where emission spikes are likely (e.g., "Tick 5-8: factory spin-up, all hooks firing")
- **Frequency band occupancy**: under Model C, a visual timeline showing when each player's band will be active
- **Resonance prediction**: amber warnings where both players' projected peak windows overlap
- **"Quiet Window" requests**: a player can mark tick ranges as "please be quiet here" — green shaded regions on the shared timeline where they need low EM for a stealth operation

The Radio Room does NOT allow players to modify each other's configurations — only to see projections and make requests. The actual coordination must happen through communication (voice chat, text, or in-game signals). This preserves player autonomy while making the shared resource visible.

### Cross-Boundary Signal Relay

Units near the boundary (columns D and E) can relay signals across the player boundary. This creates a cooperation opportunity AND an emission cost. A Player A scout in column D can send a report through a Player B relay in column E, but the signal crosses the boundary and contributes to BOTH players' EM footprints. Cross-boundary signals cost 1.5x normal EM (the signal must bridge frequency bands).

This mechanic creates a natural negotiation point: "Can I route my scout reports through your relay? It'll cost us both EM but I need the range." The player whose relay is used bears context window cost; both players bear EM cost. The cross-boundary relay becomes the most contested cooperative resource in the game.

## Player Journeys

#### Journey: Reyna, 27, Manila backend engineer and Gold II Gauntlet player

**Context:** First Divided Front co-op mission with her friend Diego (Gold III). Mission 7 variant: clear a fortified enemy position on the eastern half while defending a resource node on the western half. Reyna takes the western defense; Diego takes the eastern assault.

**Minute 0:00 — The Radio Room**
Plan phase. Reyna opens the Radio Room panel and immediately sees the problem. Diego's assault architecture — three scouts, two strikers, a relay, all connected through a dense 4-channel hook network — projects a massive EM spike at ticks 8-15 when his scouts reach enemy territory and start broadcasting positions. Her own defensive architecture is quieter (2 channels, periodic heartbeat pings), but her projected EM adds to Diego's.

The combined projection shows the resonance threshold breached at tick 10. Amber warning: "Cross-band resonance predicted ticks 8-15. Enemy detection enhancement likely."

"Dude, your EM footprint is enormous," Reyna says over voice chat. "Can you delay your scout push by 3 ticks? I need quiet on tick 8-10 because that's when my perimeter scouts are most exposed."

**Minute 1:00 — The Negotiation**
Diego pulls up the frequency band view. He sees that Reyna's defensive pings happen on ticks 5, 10, 15, 20 (every 5 ticks). His assault push starts at tick 8 with continuous communication through tick 20. The overlap window is massive.

"What if I switch my scouts to a compressed burst every 3 ticks instead of continuous reporting?" Diego suggests. He modifies his hook configuration — changing ON_PERCEIVE (fires every tick a scout sees something) to ON_PERCEIVE with a 3-tick cooldown. The Radio Room projection updates in real-time: his EM spikes become discrete pulses instead of a sustained wave. Resonance warnings drop from 8 ticks to 2 ticks.

Reyna marks ticks 10 and 15 as "quiet windows" — green shaded regions on the shared timeline. Diego adjusts his burst timing to fire on ticks 8, 11, 14, 17 — avoiding Reyna's ping ticks. The resonance prediction clears entirely. Both players see clean alternating waveforms on the frequency band display.

"That's textbook time-division multiplexing," Diego mutters, realizing he's implementing a concept from his networking class.

**Minute 3:00 — The Crisis**
Tick 12. An unexpected enemy scout appears in the western half — Reyna's territory. She needs to transmit an emergency alert to Diego (his striker is closer to intercept). She hits the cross-boundary relay button. Her scout in D3 sends an urgent signal to Diego's relay in E4. The signal crosses the boundary — 1.5x EM cost. The shared meter jumps. Diego's relay receives the signal, routes it to his striker.

But the EM spike from the cross-boundary signal, combined with Diego's normal tick-11 burst, triggers a mini-resonance. The enemy detection enhancement activates for 2 ticks. Two enemy units adjust course toward Diego's loudest relay. Diego's relay, which was also processing his own scout data, fills its context window and overloads — 1 tick stunned.

"Your emergency signal cost me my relay for a tick!" Diego says, not angry but analyzing. "We need to build a cross-boundary handshake protocol — maybe a dedicated low-EM channel just for emergencies."

**Minute 4:00 — The Resolution**
In debrief, the Inspector shows both players' EM contributions overlaid on the same timeline. The tick-12 cross-boundary spike is clearly visible — a combined peak that could have been avoided if Reyna had waited one tick (Diego's tick-11 burst would have decayed). The Radio Room's prediction was accurate for planned communication but couldn't predict the emergency.

Both players redesign their architectures for the retry. Reyna adds a dedicated "emergency" channel with a 1-signal-per-5-ticks rate limiter. Diego adds a cross-boundary relay with a larger context window (12 slots instead of 8) specifically for receiving Reyna's signals. The emission budget for the emergency channel: 1 EM point per 5 ticks — affordable, reliable, and resonance-safe if timed to odd ticks.

**UI Annotations:**
- Radio Room panel: 300px wide, shared between both players, split into two frequency band waveforms (teal top, crimson bottom)
- Resonance warning: amber pulsing region where both waveforms overlap, with "RESONANCE RISK" label
- Quiet window request: green shaded region placed by drag-select on the timeline, visible to both players
- Cross-boundary relay indicator: dotted line at the D/E column boundary, glowing when a cross-boundary signal is in transit
- EM meter: top-center, 400px wide, teal/crimson split with red zone at 75%+

#### Journey: Sofia, 15, first-time strategy gamer paired with her uncle Marcus (42, DevOps engineer)

**Context:** Sofia has completed the solo campaign through Mission 6. Marcus is Gold I. They're trying their first co-op mission — the introductory Divided Front tutorial mission, designed to teach emission budgeting with forgiving thresholds.

**Minute 0:00 — The Confusion**
Sofia opens the Radio Room and sees... two waveforms she doesn't understand. She's used to managing her own EM in single-player (the emission overlay in the Inspector showed her personal footprint), but the shared meter with two colors is new. "Uncle, what does the red part mean?"

Marcus explains: "The teal part is yours, the crimson is mine. Together they can't go above that red line or the enemies get smarter." He points at the resonance threshold. "Think of it like... two people sharing a phone plan. If we both make calls at the same time, the network gets congested."

Sofia nods — she understands phone plans. She looks at her architecture. Three hooks, moderate emission. Marcus's architecture has six hooks with a Command agent. His crimson waveform dominates the meter.

**Minute 1:00 — The Discovery**
Marcus intentionally builds a loud architecture for the first run to demonstrate the problem. "Watch what happens when I don't coordinate," he says. They execute.

During sealed watch, Sofia sees the shared EM meter climb rapidly. Her thermometer (teal) sits at 30% — comfortable. Marcus's (crimson) hits 70% and keeps climbing. The combined bar breaches the red zone at tick 8. Immediately, the enemy units on the board shift — their perception radius circles visually expand (Sofia can see the translucent radius circles grow by one tile). An enemy scout that was patrolling the eastern boundary now detects Marcus's relay and pivots toward it.

"Oh no," Sofia says. She watches as the enhanced enemies systematically hunt Marcus's loudest units. His relay goes down at tick 14. Without the relay, his striker loses coordination and walks into two enemies. By tick 20, Marcus has lost 3 units. Sofia's side is fine — her quiet architecture didn't attract attention.

"See?" Marcus says. "My noise got MY units killed, not yours. But if they'd pushed west after my units were gone..."

**Minute 2:30 — The Lesson**
On retry, Marcus rebuilds with a quieter architecture — fewer hooks, longer cooldowns, the same burst-timing strategy Diego used. Sofia, emboldened by seeing the consequences of noise, experiments with a "dark" scout configuration — no hooks at all, relying on line-of-sight observation and returning to the relay manually (movement, not signal). Her EM contribution drops to near zero.

In the Radio Room, the combined projection stays well below the threshold. They execute. This time, the enemies patrol normally. Marcus's coordinated architecture works — timed bursts avoid resonance. Sofia's dark scouts move silently through enemy territory, tagging positions that Marcus's striker can act on based on proximity rather than signal.

"I built a stealth network," Sofia says, surprised at herself. "Like a spy movie where they use hand signals instead of radios."

Marcus, who manages Kubernetes clusters for a living, has a different reaction: "You just implemented sidecar observability without the logging overhead. I'm going to use this in my next architecture review."

**UI Annotations:**
- Enemy perception radius: translucent circles around enemy units, 40% opacity, expanding visibly when EM threshold breached (200ms animation)
- EM breach flash: the red zone pulses once with a low-frequency thrum when threshold crossed
- "Dark" scout indicator: scout unit with no hook connections shows a small "radio silence" icon (crossed-out antenna) on its tile

#### Journey: Zara, 28, data scientist, and Kai, 11, first-time gamer — mother and son

**Context:** Kai has never played a strategy game. Zara is Diamond I and bought the game specifically for co-op with her son. They're on the introductory co-op mission with extra-forgiving emission thresholds.

**Minute 0:00 — The Split**
Zara takes the eastern (assault) half, intentionally leaving the simpler defensive western half for Kai. She opens the Radio Room and talks him through it: "See these two wavy lines? The blue one is yours, the red one is mine. We want them to take turns going up, not both go up at the same time."

Kai stares at the waveforms. "Like a see-saw?"

"Exactly like a see-saw."

Kai has built a simple architecture — one scout, one striker, one hook connecting them. His projected EM is tiny — a small teal blip every few ticks. Zara's architecture is more complex but she's deliberately kept it moderate.

**Minute 0:45 — The Teaching Moment**
Zara asks Kai to add a second hook to his scout. He drags a new hook connection from his scout to a channel called "help." The Radio Room projection updates — his teal waveform gets a second peak per cycle. It now overlaps with one of Zara's crimson peaks. An amber warning appears: "Resonance predicted at tick 6."

"See the orange?" Zara says. "That means we're both talking at the same time. Can you change your hook to fire on different ticks?"

Kai opens his hook configuration. He sees the cooldown setting — currently "every tick." He changes it to "every 2 ticks, starting on odd ticks." The amber warning disappears. The two waveforms shift into clean alternation.

"I made the see-saw work!" Kai says. He doesn't know he just learned time-division multiplexing. He's eleven.

**Minute 2:00 — The Emergent Cooperation**
During sealed watch, Kai notices his scout has detected an enemy cluster near the boundary — columns D-E. He wants to tell Zara's units but his scout has no cross-boundary hook. The signal can't reach.

After the match (a near-miss victory), Kai asks: "Mom, can my scout talk to your relay?"

Zara shows him the cross-boundary relay option. They set it up — Kai's scout broadcasts to "boundary-alert," Zara's relay in E4 listens on "boundary-alert" and re-broadcasts to her striker. The cross-boundary signal costs 1.5x EM. The Radio Room shows the increased cost.

"It costs more to talk across the line," Kai observes. "Like long distance calls." (He's heard Zara talk about old phone plans.)

On the next execution, Kai's scout spots the enemy cluster at tick 8, broadcasts across the boundary, Zara's relay receives and forwards, her striker intercepts. The cross-boundary cooperation costs 3 EM points (1.5x the normal 2) and creates a brief resonance blip — but the enemy cluster is eliminated before the enhanced detection matters.

"WE DID IT TOGETHER!" Kai shouts.

**UI Annotations:**
- Cross-boundary hook setup: when dragging a hook wire from a unit in columns A-D to a unit in E-H, a gold dotted line appears at the boundary with "1.5x EM cost" tooltip
- Resonance resolution animation: when alternating-tick timing is configured correctly, the two waveforms in the Radio Room animate into a satisfying interlocking pattern, accompanied by a soft two-tone chime (one note per player)

## Strengths and Weaknesses

**Strengths:**
- Directly teaches real telecommunications concepts (time-division multiplexing, frequency allocation, noise floor) through cooperative gameplay
- Creates genuine negotiation moments between co-op partners — not just "play your half independently"
- The Radio Room provides pre-execution visibility into the shared resource, enabling planning rather than just reacting
- Cross-boundary relay mechanics create a natural cooperation point that requires deliberate design, not just proximity

**Weaknesses:**
- The Frequency Band model (recommended) adds significant complexity to an already complex game — may overwhelm players who haven't mastered single-player emission management
- Voice chat is essentially required for meaningful emission negotiation — text-only players are at a significant disadvantage
- The cross-boundary 1.5x cost feels arbitrary — needs strong thematic justification (signal conversion between frequency bands)
- Balancing emission thresholds for two players is harder than single-player — too tight feels punishing, too loose makes the mechanic irrelevant

## Interaction Effects

- **EM emission model (locked)**: The co-op emission budget extends the existing EM system. Single-player EM management is prerequisite knowledge.
- **Context overload (locked)**: Cross-boundary signals add to receiver context window pressure. A player's relay can be overloaded by their partner's emergency broadcasts.
- **Hook taxonomy (3.08)**: The hook cooldown and burst-timing mechanics interact directly with emission budgeting — cooldown configuration becomes a cooperative resource allocation decision.
- **Signal acknowledgment (2.18)**: Ping-backs across the player boundary cost 1.5x EM each direction — acknowledgment protocol design is doubly expensive in co-op.
- **Spectator mode (7.01e)**: The dual-waveform EM display is inherently spectator-friendly — viewers can see cooperation quality at a glance from the waveform phase alignment.
- **Co-op Inspector (7.02d)**: Post-match emission analysis shows both players' contributions, enabling cooperative debugging of resonance events.

## Comparable Games

- **Keep Talking and Nobody Explodes**: Shared information under time pressure. One player sees the bomb, the other reads the manual. Robot Uprising's Radio Room serves a similar function — shared visibility into a resource that both players affect but neither fully controls.
- **Overcooked**: Shared workspace where one player's mess affects the other's efficiency. Emission budget is the "dirty counter" of Robot Uprising co-op — your noise is my problem.
- **It Takes Two**: Asymmetric co-op where each player has different tools but must coordinate on shared objectives. The Divided Front model extends this to shared *resources* as well as shared objectives.
- **Real-world radio frequency allocation**: The Frequency Band model is a direct gameplay analog of how the electromagnetic spectrum is divided between users. Players are literally learning spectrum management.
- **Slay the Spire 2 co-op**: Shared deck with individual hands. The emission budget is the "shared deck" — both players draw from the same EM capacity.

## Sensory Description

The Radio Room in Plan phase: a dark panel with two oscilloscope waveforms — teal above, crimson below. The waveforms breathe gently, projecting estimated EM output per tick based on current configurations. Where they overlap temporally, the intersection region glows amber with a soft pulse. When a player adjusts a hook cooldown, their waveform reshapes in real-time — peaks shift left or right, amplitude changes, and the amber intersections slide or vanish. When the waveforms achieve clean alternation (zero overlap), a faint two-tone chime sounds — a low note for one player, a high note for the other — and the background of the panel shifts from dark grey to a subtle deep blue, signaling "safe."

During sealed watch: the shared EM meter at the top of the screen is a horizontal bar, left-to-right, with teal filling from the left and crimson filling from the right. They meet somewhere in the middle. The red zone is a translucent red overlay at the rightmost 25% of the bar. When a burst of hook transmissions fires, the corresponding color surges forward — a wave of teal washing right or crimson washing left. If both surge simultaneously, the bar flashes white at their meeting point and a low resonant thrum sounds, like two guitar strings played slightly out of tune creating a beat frequency. The enemies on the board react — perception radius circles pulse outward, expanding by one tile, the expansion accompanied by a radar sweep sound effect.

The TikTok clip: split-screen of two players' Radio Room waveforms — first chaotic (overlapping, amber everywhere, enemies enhanced) — then coordinated (clean alternation, no amber, enemies normal). Same architecture, same hooks, just different timing. Caption: "We didn't change what we said. We changed WHEN we said it."
