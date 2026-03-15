# The "Phase Shift" Mission Structure

**Aspect:** 5.08a — Missions that change TYPE mid-battle (relay network → siege → infiltration); multi-phase sealed watch pacing
**Category:** Campaign / Mission Design
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

The locked sealed watch is a hands-off viewing experience — the player watches their architecture execute. In a single-type mission, the emotional arc is relatively flat: tension builds, things go well or badly, the mission ends. But what happens when the **nature of the challenge changes mid-execution?**

A Phase Shift mission starts as one type — say, a relay network construction problem — and partway through, the board state transforms. New enemies spawn, terrain changes, objectives shift. Suddenly the architecture that was winning is wrong for the new problem. The player's scouts were perfectly configured for wide-area coverage, but the phase shift introduces a stealth assassin that requires tight perimeter defense. The relay network they built is now a liability — too many open channels broadcasting their positions.

This is the sealed watch's highest-drama potential. The player can't intervene. They can only watch their architecture adapt — or fail to adapt — to a problem it wasn't designed for. The question isn't "did you build the right thing?" It's **"did you build something resilient enough to survive being wrong?"**

This maps directly to real agentic AI engineering: production systems face distribution shifts, unexpected inputs, adversarial conditions. The agent configuration that handles the training distribution perfectly may collapse when the world changes. Phase Shift missions test the architectural quality the game most wants to teach: **robustness under changing conditions.**

---

## Core Mechanic: How Phase Shifts Work

### The Trigger

At a predetermined tick (or when a condition is met — all enemies in wave 1 eliminated, a timer expires, a unit reaches a map position), the board transforms:

1. **New enemy spawner activates** — a second spawner on the opposite side of the 8×8 grid begins producing different enemy types
2. **Terrain mutation** — tiles change properties (open ground becomes obstructed, relay-friendly positions become exposed)
3. **Objective shift** — the win condition changes (from "eliminate all enemies" to "survive 20 ticks" or "get a unit to tile H8")
4. **Information environment change** — enemy emission patterns shift, new signal types appear on channels, noise floor increases

### The Visual Moment

The phase shift is the sealed watch's centerpiece spectacle. The tick clock pauses for 0.5 seconds. A bass-frequency pulse shakes the screen — not a camera shake, but a ripple that distorts tile edges outward from the trigger point, like dropping a stone in water. The board's ambient color temperature shifts: warm gold for a relay-network phase might snap to cold teal for a siege phase, or blood-red for an assault phase. New enemy spawner ports glow and crack open with ember particles. Changed terrain tiles flip like cards, old surface dissolving into pixel dust, new surface materializing underneath with a crystallization animation.

**Audio:** A deep sub-bass hit (felt more than heard) followed by a rising synth tone — the frequency of the tone indicates the new phase type. Relay phases: warm analog hum. Siege phases: metallic percussion loop. Infiltration phases: whispered static. The ambient soundtrack crossfades over 3 seconds, old theme ducking under the new theme. If the player's architecture is already struggling (units stunned, context bars amber/red), the phase shift audio carries a minor-key dissonance — a musical "oh no."

**The TikTok Clip:** A player's perfectly humming relay network — green signals flowing like water, all units calm blue — gets hit by the phase shift. Bass drop. Screen ripple. Enemy assassins materialize from the new spawner. Three relays simultaneously overload, sparking red. The carefully built information highway turns into a panic broadcast. The scout that was patrolling wide suddenly has an assassin adjacent. One-shot-one-kill. Dead. The clip is 12 seconds. Caption: "my architecture survived 30 ticks of perfection and 2 ticks of chaos."

---

## Six Phase Shift Models

### Model A: "The Ambush" — Hard Cut

**How it works:** At a fixed tick (announced in the mission brief as "enemy reinforcements arrive at tick 30"), the board state changes abruptly. No warning signals. No gradual transition. One tick the board is Phase 1, next tick it's Phase 2. The player knows it's coming — the mission briefing said so — but they have to design an architecture that handles both phases with zero transition time.

**Mechanical signature:**
- Phase transition: instantaneous (1 tick)
- Player foreknowledge: full (tick number and phase type revealed in briefing)
- Design challenge: build one architecture that serves two masters
- Failure mode: over-specialization for Phase 1 leaves Phase 2 undefended

**Sensory description:** The tick clock's pip for tick 30 is visually different — gold instead of white, slightly larger, pulsing gently throughout the battle. As the clock approaches tick 30, the pip grows brighter. On the transition tick: hard cut. No crossfade. The board snaps to its new state in a single frame — new enemies already in position, terrain already changed. The effect is jarring by design, like a jump scare. The sound is a single metallic CLANG — the steel door of a trap closing.

**Strengths:**
- Maximum drama — the hard cut creates a genuine "oh shit" moment even on replay
- Clean design — the player knows exactly what they're building for
- Tests dual-purpose architecture — can your scout patrol pattern work for both wide coverage AND perimeter defense?
- Rewards hooks that react to new signal types (Phase 2 enemies emit different signatures)

**Weaknesses:**
- Binary outcome — architecture either handles the transition or it doesn't; less gradient of "almost made it"
- Fixed tick makes it gameable — the player can over-invest in Phase 2 readiness at the cost of Phase 1 efficiency
- No emergent narrative — the phase shift happens the same way every retry

**Comparable games:**
- **Into the Breach** emerging Vek: enemies emerge from marked tiles with one turn of warning, but the tactical challenge is fully known. The Ambush is this but with architectural rather than tactical preparation.
- **FTL** flagship phases: each phase of the final boss has different mechanics, but you get a brief respite between them. The Ambush has no respite.
- **Dark Souls** boss phase transitions: hard HP thresholds trigger new attack patterns. The telegraph is the HP bar itself.

---

### Model B: "The Rising Tide" — Gradual Escalation

**How it works:** Phase 2 doesn't arrive as a single event — it bleeds in over 5-10 ticks. New enemy types appear one at a time. Terrain changes tile by tile. The noise floor rises gradually. The player's architecture has time to react, but only if it has the right hooks and rules to detect the change.

**Mechanical signature:**
- Phase transition: gradual (5-10 ticks of increasing Phase 2 presence)
- Player foreknowledge: partial (mission brief says "conditions will change" but not how)
- Design challenge: build detection systems that recognize the shift AND adaptation rules that respond
- Failure mode: architecture fails to detect the gradual change, boils like a frog

**Sensory description:** The board's ambient lighting shifts hue by 2% per tick during the transition period. Most players won't consciously notice until tick 4-5 of the transition. Enemy units of the new type appear at the edge of the board with a soft glow — initially just one, easy to mistake for a regular enemy at a glance. Context bars on the player's units begin filling with new signal types — amber entries mixed in with the familiar green. The transition's visual language is *camouflage* — it's trying to sneak past both the player's attention AND their architecture's attention. The audio transition is a barely perceptible frequency shift in the ambient drone — the key changes from major to minor over 10 seconds. Players who replay and use the Inspector will retroactively notice "oh, the music was telling me."

**Strengths:**
- Tests the game's core thesis: information detection is the real skill
- Creates "frog in boiling water" moments that are deeply instructive
- Rewards architectures with ON_SILENCE hooks (detecting when expected signals stop arriving) and anomaly-detection rules
- Inspector replay is revelatory — players can scrub back and see exactly when the tide started and how long their architecture took to notice

**Weaknesses:**
- Harder to communicate in mission briefing without spoiling the lesson
- Risk of feeling "unfair" if the gradual change is too subtle — players may not understand what killed them
- Requires sophisticated enemy AI or scripting to make the gradual transition feel organic
- Less dramatic than The Ambush — no single "holy shit" moment

**Comparable games:**
- **Papers, Please**: rule complexity increases incrementally each day. You don't notice you're overwhelmed until you are.
- **Obra Dinn**: the mystery shifts as you gather evidence. What you thought was happening turns out to be wrong.
- **Civilization fog of war**: the world changes while you're not looking. The barbarian camp that was harmless 20 turns ago now has cavalry.

---

### Model C: "The Fork" — Player-Triggered Phase

**How it works:** Phase 2 activates when a player unit performs a specific action — a Specialist uses extract on a specific tile, a Scout reaches a particular map position, a tagged target is eliminated. The player doesn't control WHEN it happens (they can't intervene during sealed watch), but their architecture design determines the timing. A well-designed information pipeline might trigger Phase 2 at tick 15; a poorly wired one might not trigger it until tick 35, leaving less time for Phase 2's objective.

**Mechanical signature:**
- Phase transition: player-architecture-triggered
- Player foreknowledge: full (briefing specifies the trigger condition)
- Design challenge: optimize for WHEN Phase 2 starts — too early and Phase 1 isn't secured, too late and Phase 2 is impossible
- Failure mode: architecture never triggers Phase 2 at all (mission timeout), or triggers it at the worst possible moment

**Sensory description:** The trigger tile glows with a subtle beacon pattern — a rotating diamond of amber light that pulses once per tick. When a unit steps on it (or performs the trigger action), the diamond collapses inward, compresses to a point, then explodes outward as the phase shift ripple. The triggering unit gets a brief golden highlight — a crown-shaped halo that fades over 2 ticks — marking it as "the one who changed everything." If the trigger is Extract, the specialist's extraction animation gets an extended version: the normal data-siphon spiral stretches upward into a column of light that cracks the sky. The board's border changes color. It's unmistakable.

**Strengths:**
- The player's architecture determines the timing — maximum agency within the sealed watch constraint
- Creates natural optimization puzzles: "how do I get a Scout to tile F7 by tick 12?"
- Enables "speed run" strategies where optimal Phase 2 timing is a core challenge
- The trigger moment is highly photogenic — great for clips and replays
- Tests Scout patrol path optimization and Specialist deployment timing

**Weaknesses:**
- Risk of phase shift feeling accidental if the player didn't understand the trigger
- The "never triggers" failure state is anticlimactic
- More complex to design — the mission must work across a wide range of trigger timings
- Can create a degenerate strategy: "delay Phase 2 as long as possible" if Phase 1 has no time pressure

**Comparable games:**
- **XCOM 2** reinforcement timers vs. objective timers: the tension between exploring and rushing toward objectives
- **Into the Breach** grid abilities: player-triggered environmental effects (lightning, tsunami) that reshape the board
- **Slay the Spire** event choices: the player's actions determine which future they face

---

### Model D: "The Echo" — Reversal Phase

**How it works:** Phase 2 is the mirror of Phase 1 — roles reverse. In Phase 1, the player is on offense (destroying enemy spawners). Phase 2 begins when the enemy's counter-attack launches, and now the player is on defense (protecting their own factory). Or: Phase 1 is about building a wide sensor network, Phase 2 is about the enemy using that same network against you (your hook channels become attack vectors for enemy signal injection).

**Mechanical signature:**
- Phase transition: triggered by Phase 1 success (destroying a target, reaching a position)
- Player foreknowledge: known thematically ("the enemy will counter-attack") but not mechanically ("they'll use your own channels")
- Design challenge: build an architecture that doesn't become a liability when its purpose reverses
- Failure mode: the very features that won Phase 1 are exploited in Phase 2

**Sensory description:** When Phase 2 triggers, the camera (if isometric view has any parallax) briefly zooms out to show both sides of the board. The player's factory, which has been a static backdrop in the corner, suddenly pulses with a warning heartbeat — red ripples emanating from it. Enemy units that were fleeing or defending now turn and advance. Signal lines that were carrying intelligence TO the player's strikers now carry enemy signals the other direction — the colored dashed lines reverse their animation direction, green arrows flipping to red. The player's own relay network, which was a beautiful web of information, is now a vulnerability map. The audio: Phase 1's triumphant rising theme inverts — the same melody plays in reverse, transposed down a minor third. Victory music becoming threat music.

**Strengths:**
- Teaches the single most important lesson: your architecture is both weapon and vulnerability
- Directly models the EM emission mechanic — deep architectures are louder, and Phase 2 makes loudness dangerous
- Creates "irony" moments that make great stories: "my relay network was so good it guided the enemy straight to my base"
- Maps perfectly to real security engineering: every interface is an attack surface

**Weaknesses:**
- Can feel punishing — "I won Phase 1 too well and that's why I lost Phase 2?"
- Requires very careful difficulty tuning so Phase 2 isn't impossible for players who dominated Phase 1
- The "your success is your weakness" message can be demoralizing without careful framing
- Complex to communicate: the reversal mechanic needs the mission briefing to foreshadow it without spoiling it

**Comparable games:**
- **Baba Is You**: rules you set up for yourself can trap you. "WALL IS PUSH" helps until you push a wall onto your exit.
- **Inscryption**: the game itself turns against you. Mechanics you trusted become unreliable.
- **StarCraft Brood War**: aggressive expansions that create vulnerabilities. The more map control you have, the more you have to defend.

---

### Model E: "The Cascading Crisis" — Multi-Phase Chain

**How it works:** The mission has 3-4 phases, each triggered by resolving the previous phase's crisis. Phase 1: normal engagement. Phase 2: relay network failure (a key relay is destroyed). Phase 3: factory under siege (with degraded information). Phase 4: desperation push with whatever survives. Each phase removes a capability the player was relying on, forcing the surviving architecture to adapt.

**Mechanical signature:**
- Phase transitions: multiple (3-4), each triggered by loss of a specific unit or structure
- Player foreknowledge: minimal (only "this mission is long and dangerous")
- Design challenge: build redundancy and graceful degradation into every system
- Failure mode: single-point-of-failure architecture collapses entirely when one component dies

**Sensory description:** Each phase shift is marked by the destruction of a key unit — and the game makes that death MATTER. When the central relay dies (Phase 1→2 transition), time slows to 0.25x for 2 seconds. The relay's destruction animation plays in agonizing detail: the unit's tile cracks, cyan data-light hemorrhages upward like a geyser, all signal lines connected to it snap one by one (each snap a distinct "twang" sound, slightly pitch-shifted), and the lines retract back to their source units like severed rubber bands. The connected units' buffer bars stutter — entries that were being relayed go dark, replaced by [NO SIGNAL] grey slots. The remaining units that depended on that relay must now re-route or go blind. If they have rules that handle signal loss, they adapt. If they don't — they stun, jitter, and become sitting ducks.

Phase 2→3: the Scout dies in the field. The information pipeline from enemy territory goes dark. The board's fog-of-war equivalent returns — enemy positions are no longer updated. The last known positions fade from bright to dim over 3 ticks, then ghost out entirely. The player's strikers, now blind, either hold position (if they have rules for lost-signal scenarios) or advance into ambush (if their default rule is "engage nearest").

Phase 3→4: the factory takes a hit. Production queue stops. No more reinforcements. The surviving units are all that's left. The conveyor belt animation in the factory freezes mid-motion, a red X overlaying it. The desperation phase begins.

**Audio:** Each phase shift drops the soundtrack down a notch — literally removing one instrument layer. Phase 1: full ensemble (synths, percussion, bassline, melody). Phase 2: melody drops out (the relay was the melody). Phase 3: percussion drops (the scout was the rhythm). Phase 4: only the bassline remains — a low, throbbing drone. If the player wins, the instruments return one by one in the final ticks, building back to full ensemble. If they lose, the bassline itself fades to silence.

**Strengths:**
- The highest drama potential of any mission structure — a survival story with escalating stakes
- Tests graceful degradation, which is the MOST transferable skill to real engineering
- Each phase loss is specific and instructive: "your relay was a single point of failure"
- The progressive audio stripping is unforgettable — players will describe this mission by its sound
- Perfect for the campaign's climactic missions (8-10)

**Weaknesses:**
- Very long missions (40-60+ ticks) may test player patience during sealed watch
- Difficult to balance — if Phase 1 loss is random, Phase 2-4 difficulty varies wildly
- Can create "death spiral" feel where the player knows they've lost but has to watch 20 more ticks
- The Inspector debrief for a 4-phase mission is extremely complex — needs phase markers on the timeline

**Comparable games:**
- **FTL** final boss: 3-phase fight where each phase requires different ship configurations
- **XCOM**: squad missions where soldiers die and the remaining squad has to adapt with reduced capability
- **Darkest Dungeon**: party degradation through stress and afflictions — the cascade of compounding failures
- **Dwarf Fortress**: fortress collapse cascades where one failure (flooded workshop) triggers downstream failures (no tools → no repairs → more flooding)

---

### Model F: "The Branching Crisis" — Choice Point Phase

**How it works:** At the phase shift moment, two (or three) simultaneous crises emerge. The player's architecture can only address one at a time. Whichever crisis is handled first determines the mission's Phase 2 trajectory. A scout detecting threat A before threat B (based on patrol path and perception cone) funnels the architecture toward the "A-first" Phase 2. This means the same architecture produces different missions on different runs due to invisible randomization.

**Mechanical signature:**
- Phase transition: simultaneous dual-crisis, architecture's detection order determines branch
- Player foreknowledge: knows "a crisis will emerge" but not that it's branching
- Design challenge: build architecture that either (a) can handle both branches, or (b) consistently detects the preferred crisis first
- Failure mode: architecture detects crises in the worst order, handling the easy problem while the hard problem escalates

**Sensory description:** The dual-crisis moment is visually bifurcated. Two warning indicators appear simultaneously on opposite sides of the board — one pulsing amber (northern spawner activation), one pulsing crimson (eastern flanking force). The player's architecture's reaction determines everything. If the scout on patrol route A detects the northern threat first and broadcasts it, signal lines flow toward the northern response — the ambient lighting shifts toward amber. If the eastern scout detects the flank first, signal lines flow east — crimson shift. The "losing" crisis (the one not addressed first) continues escalating. Its indicator grows larger, pulses faster, and its audio warning increases in pitch and urgency. After 5 ticks without response, the neglected crisis enters "critical" — the indicator fills its quadrant of the board with a dim wash of its color, and a low alarm tone joins the soundtrack.

On the Inspector timeline, the branching moment is marked with a diamond symbol — a decision point. The Inspector shows both branches as ghost traces: "if your scout had detected east first, this would have happened..." rendered as transparent alternate-timeline units overlaid on the board. This ghost visualization is the Inspector's most powerful teaching tool for this mission type.

**Strengths:**
- Invisible randomization creates genuine replayability — the same architecture may succeed or fail on different runs
- Tests architectural robustness across multiple threat vectors
- The Inspector's branch visualization teaches causal reasoning powerfully
- Creates natural "what if" discussions in the community: "I handled north first, what if I'd gone east?"
- Models real production system behavior: multiple alerts fire simultaneously, triage order matters

**Weaknesses:**
- Risk of feeling random/unfair if the player doesn't understand why their architecture chose branch A over B
- Difficult to balance both branches to be equally viable paths
- The "ghost trace" Inspector feature is complex to implement and explain
- Players who want deterministic solutions will be frustrated by the branching

**Comparable games:**
- **Into the Breach** simultaneous attack patterns: multiple Vek attacking different objectives, player must prioritize
- **FTL** event choices: encounter forks that lead to different outcomes
- **Slay the Spire** map branching: choosing your path through the dungeon determines your encounters
- **This War of Mine**: simultaneous needs (food, medicine, security) that can't all be addressed — triage as gameplay

---

## Interaction Effects

### With Sealed Watch Pacing

Phase Shifts are the sealed watch's dramatic backbone. A single-phase mission has one emotional arc. A Phase Shift mission has multiple arcs with crisis transitions between them. The "no skip, no pause" rule becomes most meaningful here — the player MUST sit through the phase transition, feeling the moment their architecture faces a new world. Skipping would destroy the teaching moment.

**Specific tension:** The 1-second-per-tick default may be too slow for a 4-phase Cascading Crisis (50+ ticks = nearly a minute of watching). But 2x speed undermines the drama. Solution: the phase shift moment itself always plays at 1x regardless of speed setting, with a 0.5-second hold. Inter-phase ticks can be at player-selected speed.

### With Inspector

Phase Shifts create the Inspector's most valuable replay content. The timeline scrubber gets **phase markers** — colored vertical bars dividing the timeline into labeled sections (Phase 1: Relay Network, Phase 2: Siege, etc.). Click-to-inspect at any tick shows which phase rules were active and which units had adapted to the new conditions. The decision trace becomes most instructive at phase boundaries: "this unit continued its Phase 1 behavior for 3 ticks into Phase 2 because it hadn't received the new signal type — its listen filter was blocking Phase 2 signals."

For The Branching Crisis specifically, the Inspector needs a **fork visualization** — a branching timeline showing the path taken and ghost paths not taken.

### With Context Overload

Phase Shifts are the primary context overload trigger. When Phase 2 begins, new signal types flood the board. Units configured for Phase 1's signal vocabulary suddenly receive unknown entries. If their context config doesn't have space or eviction rules for new signal types, they overload. This creates the most visceral overload cascade in the game — not because the player built badly, but because the world changed. The lesson: leave headroom in your context windows. Don't fill every slot with Phase 1 signals.

### With Production Queue (Missions 5+)

In factory missions, Phase Shifts create production pivots. The player's production queue was optimized for Phase 1's needs (scouts for a relay network mission). Phase 2 demands different units (strikers for a siege defense). If the production queue is deep and committed to scout production, the factory can't pivot fast enough. This tests production queue design: should the queue be short and reactive, or long and efficient? The answer depends on whether Phase Shifts are expected.

### With Command Agent (Missions 6-7+)

Command agents are the Phase Shift answer unit. A Command agent with `reassign` and `reroute` skills can detect the phase shift (through hooks listening for new signal types) and dynamically reassign subordinate skills and reroute hooks to adapt. Without a Command agent, the architecture is frozen in its Phase 1 configuration. With one, it can evolve mid-battle. Phase Shift missions are where Command agents prove their value — they're the architecture's immune system.

### With EM Emissions

Phase Shift missions create an EM tension. Detecting the phase shift early requires wide-open channels and active hooks — which generate EM emissions. But Phase 2 might involve stealth enemies that home in on EM signatures. The player must choose: detect the shift early (loud) or detect it late but remain hidden (quiet). This is the game's deepest strategic tension expressed through mission structure.

### With Campaign Progression (Mission Arc)

Phase Shift missions should appear after the player has mastered single-type missions. The recommended placement:

| Mission | Phase Shift Model | Rationale |
|---------|-------------------|-----------|
| 1-4 | None | Tutorial. One phase, one lesson. |
| 5 | None | Factory introduction is enough cognitive load |
| 6 | **The Rising Tide** (B) | First Phase Shift. Gradual, detectable. Teaches detection. |
| 7 | **The Ambush** (A) | Known phase shift. Player designs for two phases. Tests dual-purpose architecture. |
| 8 | **The Echo** (D) | Reversal. "Your architecture is your vulnerability." Peak lesson. |
| 9 | **The Cascading Crisis** (E) | Multi-phase endurance. Everything learned applied to survival. |
| 10 | **The Fork** (C) + **Branching Crisis** (F) | Player-triggered phase shift into branching crisis. Maximum complexity. The final exam. |

---

## Player Journeys

### Journey: Tomás, 16, First Strategy Game (Mission 6: First Phase Shift — The Rising Tide)

**Context:** Tomás has completed Missions 1-5. He's comfortable with context config, rules, hooks, and just learned the factory in Mission 5. His relay networks are clean but simple — hub-and-spoke with one central relay. He's never seen a phase shift.

**Minute 0:00 — The Briefing**
Tomás opens Mission 6 (Cebu urban cyberpunk). The campaign map zooms into Cebu province — neon-lit vertical slums replace the rice terrace background. The briefing reads: "Establish a relay network to coordinate district defense. Conditions may change." He notices the vague warning but focuses on the board: 8×8 grid with two enemy spawners (north and east), his factory in the southwest corner. Urban terrain — some tiles are buildings (block line of sight), some are open streets.

He opens the workbench. Familiar by now. He creates a Scout blueprint with patrol + wide perception, a Relay blueprint with compress + amplify, and a Striker blueprint with engage. Production queue: Scout, Relay, Scout, Striker, Striker. Standard setup.

**Minute 1:30 — Planning Phase**
He wires the hooks: scouts broadcast on `threat-north` and `threat-east` channels. The relay listens to both, compresses, and rebroadcasts on `strike-target`. Strikers listen to `strike-target`. Clean pipeline. He checks the ghost preview — perception cones cover most of the board. Channel map shows a simple tree topology. He's satisfied.

He doesn't notice the briefing's "conditions may change" warning. He's built for exactly one problem: detect enemies, relay coordinates, strike.

He hits EXECUTE.

**Minute 2:00 — Sealed Watch, Phase 1 (Ticks 1-20)**
The factory hums. Scout deploys at tick 3, begins patrol. Second scout at tick 6. Relay planted at tick 9 — the information hub connects both scouts to the strike force. By tick 12, he has two strikers in position. Enemy scouts appear from the north spawner. His scout detects, relay compresses, striker engages. One-shot-one-kill. Clean. Beautiful.

Tomás leans back. This is going well. Buffer bars are calm blue on all units. Signal lines flow smoothly — green dashes pulsing from scouts to relay to strikers.

**Minute 2:30 — The Rising Tide Begins (Ticks 21-25)**
Tick 21: the board's ambient lighting shifts 2% warmer. Tomás doesn't notice. A new enemy type appears from the east spawner — slightly different icon (angular, red-tinted). One unit. His eastern scout detects it and broadcasts on `threat-east`. The relay receives and compresses. But the compressed signal includes a new field: `type: infiltrator`. His striker's rules don't have a condition for this type. The signal arrives in the striker's context window but doesn't trigger any rule. The striker ignores it.

Tick 22: another infiltrator from the east. The scout broadcasts again. Now there are two new-type entries in the striker's context window, taking up slots. The context bar shifts from blue to a blue-green.

Tick 24: three more infiltrators. The scout is broadcasting constantly. The relay is compressing but the new signal type is bulky — it doesn't compress as well as the familiar `threat-north` format. The relay's buffer bar ticks up to amber. The striker now has 4 slots occupied by infiltrator signals it can't act on.

Tick 25: the board lighting has shifted noticeably — warmer, more amber. Tomás notices. "Wait, what's happening over there?" He sees the cluster of angular red units on the east side. His scout is detecting them but his strikers aren't responding. The eastern front is undefended.

**Minute 3:00 — The Boil (Ticks 26-32)**
Tick 26: the eastern infiltrators advance. They move faster than standard enemies — 2 tiles per tick. Tomás's scout is in their path. The scout has `evade` but its rules prioritize `patrol` — it doesn't evade infiltrators because the rule condition is `IF threat-distance < 2 AND type = standard THEN evade`. Infiltrators aren't `standard`.

Tick 28: infiltrator reaches the scout. One-shot-one-kill. The scout's tile flashes red. All signal lines from that scout snap. The relay's buffer drops — two channels go dark simultaneously. The `threat-east` channel goes silent.

Tick 30: the infiltrators reach the relay's perimeter. The relay has no perception — it's stationary and blind. An infiltrator moves adjacent. One-shot-one-kill. The relay explodes — ALL signal lines snap. The entire information network collapses. Both strikers lose all incoming data. Their buffer bars crater from green to empty grey. They stand motionless, stunned, context overloaded by the sudden absence of everything.

Tick 32: the infiltrators reach the stunned strikers. Two kills in one tick. Mission failure.

**Minute 3:20 — Debrief**
Tomás sits forward. "What the HELL was that?" The sealed watch ends. The Inspector opens.

He scrubs back to tick 21. Clicks the first infiltrator signal in the relay's buffer. The Inspector shows: `signal type: infiltrator_detected, source: scout-east, tick: 21`. He follows the trace to the striker — the signal arrived at tick 22 but no rule matched. The decision trace reads: "No matching condition for context entry [infiltrator_detected]. Entry remained in buffer. No action taken."

He scrubs forward slowly. He watches the buffer bars fill with ignored signals. He sees the tipping point — tick 26, when the scout's evade rule failed because it only matched `type = standard`. He watches the cascade: scout dies → relay loses input → relay dies → everything dies.

He opens the context window chart. The relay's utilization sparkline is a hill that peaks at tick 25 (amber) and then drops to zero at tick 30 (relay destroyed). The striker's sparkline shows a weird pattern — full of ignored entries, then completely empty.

**Minute 5:00 — The Lesson**
Tomás goes back to the workbench. He realizes three things:
1. His rules need to handle unknown enemy types (wildcards, not hardcoded `type = standard`)
2. His scout's evade rule needs to trigger on ANY adjacent enemy, not just standard ones
3. His context config needs eviction rules that prioritize unmatched signals for removal instead of letting them accumulate

He adds a new rule to the striker: `IF threat-distance < 3 AND type != standard THEN engage`. He changes the scout's evade condition to `IF threat-distance < 2 THEN evade` (removing the type filter). He sets the context eviction priority to remove entries older than 5 ticks.

He hits EXECUTE again.

---

### Journey: Dr. Priya, 38, ML Infrastructure Lead (Mission 8: The Echo)

**Context:** Priya has completed Missions 1-7 cleanly. She's an experienced engineer who immediately recognized the context window mechanic as an attention system. Her architectures are sophisticated — multi-relay mesh networks with Command agent coordination. She designs for robustness. Mission 8 is Bohol (Chocolate Hills terrain — bumpy, irregular sight lines).

**Minute 0:00 — The Briefing**
The briefing reads: "Destroy the enemy command node. Warning: the enemy will not surrender quietly." Priya reads "will not surrender quietly" and immediately thinks "counter-attack after I destroy the target." She's right, but the briefing doesn't tell her HOW the counter-attack works.

She opens the board. The enemy command node is at H8 (northeast corner). Her factory is at A1 (southwest). The Chocolate Hills terrain creates a maze of hills that block sight lines and signal propagation. She needs relays to route signals around the hills.

**Minute 1:00 — Planning Phase**
Priya builds a deep architecture:
- 2 Scouts with wide patrol arcs and `threat-detect` hooks
- 3 Relays in a chain from factory to the northeast, each with compress + amplify
- 2 Strikers following the relay chain's coverage toward the enemy command node
- 1 Command agent at the factory with `reroute` and `reassign` skills

Her hook topology: scouts → `recon-raw` → relay chain compresses and amplifies → `strike-cmd` → strikers. The Command agent monitors all channels and has rules to `reroute` if any relay goes offline.

She's proud of this. It's a deep, well-wired information pipeline. EM emissions will be high — 3 relays + command agent = significant broadcast footprint. But she needs the depth for the terrain.

She hits EXECUTE.

**Minute 2:30 — Phase 1 (Ticks 1-35): The Advance**
Her architecture executes beautifully. Scouts map the terrain, relay chain propagates intelligence, strikers advance through the hills toward the enemy command node. She watches signal lines flowing northeast — green dashes navigating the hill gaps via relay hops. By tick 25, her strikers are within engagement range of the enemy command node's defenders. By tick 30, the defenders are eliminated.

Tick 35: her striker reaches H8 and destroys the enemy command node. The tile flashes red. A brief victory animation — the command node crumbles.

Then: the Echo.

**Minute 3:10 — Phase 2: The Reversal**
The camera zooms out 0.5 seconds. Both ends of the board are visible. Her factory at A1 pulses with a red heartbeat warning. New enemy units — elite infiltrators — spawn from three positions surrounding her factory. They don't approach from the destroyed command node. They were HIDDEN on the board, dormant, activated by their command node's destruction.

And they know where everything is. Priya's deep relay chain has been broadcasting EM signatures for 35 ticks. The infiltrators have a map of every relay position, every active channel, every signal route. Her architecture, drawn as glowing signal lines across the board, is an attack guide.

The signal line animation reverses. Green dashes that were flowing northeast now carry red enemy signals flowing southwest — the same channels, the same routes, but the enemy is using them as a directional guide. The ambient lighting shifts from gold to cold crimson.

Priya's eyes widen. "They're following my signals."

**Minute 3:30 — The Collapse (Ticks 36-45)**
The infiltrators are fast and they target relays first — cutting the information pipeline from the extremities inward. Relay 3 (nearest the destroyed command) dies first. Two signal lines snap. The Command agent detects the loss (it has an ON_SILENCE hook for relay heartbeats) and triggers `reroute` — redirecting traffic through Relay 2. But Relay 2 is the next target. Tick 39: Relay 2 destroyed. The Command agent reroutes again — now everything goes through Relay 1. Single point of failure.

Tick 41: Relay 1 destroyed. The entire information network goes dark. The Command agent is now blind — no incoming signals. It can't `reroute` what doesn't exist. The strikers in the northeast, still standing by the destroyed enemy command node, are orphaned — connected to nothing. Their buffer bars go grey. They stand in place, useless.

Tick 43: infiltrators reach the factory. Priya's command agent, stationary and defenseless, is destroyed. The factory falls. Mission failure.

**Minute 4:00 — Debrief**
Priya opens the Inspector. She goes straight to the emission overlay. She sees her entire relay chain drawn as a bright EM heat map — a highway of emissions pointing directly from the target back to her factory. She zooms in on the infiltrators' first tick. Their "context window" (visible via click-to-inspect) contains a single entry: `EM_SOURCE_MAP` — a complete list of emission coordinates and signal strengths.

She mutters: "I built them a map."

She scrubs through the relay destruction cascade. Each relay death removes a layer from the soundtrack (she notices this on replay). By the time Relay 1 dies, the audio is a single bass drone. She watches her Command agent's decision trace: `reroute successful... reroute successful... reroute impossible: no remaining relay targets. Status: IDLE. Status: IDLE. Status: DESTROYED.`

**Minute 6:00 — The Redesign**
Priya realizes the lesson: deep architectures are powerful but emit a signal footprint proportional to their depth. She needs to either:
1. Build a quieter architecture (fewer relays, shorter signal chain) that's less visible but less capable
2. Add "dark mode" rules — hooks that go silent after Phase 1's objective is achieved, reducing EM emissions before the counter-attack
3. Include defensive units near the factory — not just an offensive strike force

She redesigns: adds a rule to the Command agent that triggers on `target-destroyed` signal — when received, it `reroutes` all channels to a new `defend-home` channel and `reassigns` the strikers from `engage` to `patrol` near the factory. She also adds a Specialist with `hack` near the factory as a stationary defender.

The second attempt: she wins, but barely. Two strikers make it back in time because the Command agent pivoted them at tick 36. The factory survives with one unit between it and the infiltrators.

---

### Journey: Marcus, 52, History Teacher and Casual Player (Mission 9: The Cascading Crisis)

**Context:** Marcus plays slowly and carefully. He replays each mission 2-3 times before moving on. He's reached Mission 9 (Mindanao jungle terrain — dense cover, limited sight lines, ambush-friendly). He has a reliable but simple architecture: one of each unit type, conservative hooks, wide safety margins in buffer sizes.

**Minute 0:00 — The Briefing**
Mission 9's briefing is the longest yet. Marcus reads it carefully. "Deep jungle reconnaissance operation. Expect sustained enemy presence. Maintain operational integrity." No mention of phase shifts — just ominous warnings. The board is dense with jungle tiles (block perception beyond 2 tiles). Two enemy spawners, one his factory.

**Minute 2:00 — Planning Phase**
Marcus builds conservatively:
- 1 Scout with tight patrol loop near the factory (he's learned not to overextend)
- 1 Relay at the center of the board with compress + filter
- 1 Striker on a short leash (rules prevent engaging beyond 3 tiles from relay)
- 1 Specialist with hack + extract (his favorite — hacking enemy scouts to read their buffer)
- 1 Command with reassign + reroute (his safety net)

His context configs are generous — every unit has 2-3 empty buffer slots as headroom. Eviction priorities are set to dump entries older than 8 ticks. He's learned from Phase Shift missions.

He sets the production queue to alternate scout and striker — a steady trickle of replacements.

**Minute 3:00 — Sealed Watch: Phase 1 (Ticks 1-20) — Recon**
His architecture deploys cautiously. The scout creeps through jungle tiles, broadcasting enemy positions. The relay compresses and forwards to the striker. The specialist hacks an enemy scout on tick 15, reading its buffer for intelligence. All buffer bars calm blue. Signal lines flowing cleanly. Marcus nods. Controlled.

**Minute 3:30 — Phase 1→2 Transition (Tick 22): Relay Destroyed**
An enemy striker ambushes through dense jungle — only 2-tile perception means the scout didn't see it until it was adjacent to the relay. One-shot-one-kill. The relay's destruction animation plays in slow motion — the 0.25x time dilation kicks in. Marcus watches every signal line connected to the relay snap, each one making a distinct "twang." The bass instrument drops from the soundtrack. The relay's tile flickers with residual data sparks, then goes dark.

Marcus inhales sharply. His entire information pipeline just lost its central node.

**Phase 2 (Ticks 23-35) — Degraded Network**
Without the relay, scouts can still broadcast directly to the striker, but the signal is uncompressed — it fills 3 buffer slots instead of 1. The striker's buffer fills rapidly. Buffer bar shifts from blue to amber over 4 ticks. The Command agent detects the relay loss (ON_SILENCE hook for relay heartbeat) and triggers `reroute` — it reassigns the scout's hook to broadcast on a direct channel to the striker, bypassing the dead relay. This works, but the uncompressed signals are bulky.

Marcus watches the striker's buffer bar climb. Amber. Amber-red. Red. Tick 30: the striker's buffer overflows. Context overload. The stunned animation plays — the striker sparks and jitters in place for 1 tick. An enemy unit moves adjacent during the stun tick. The striker is eliminated on tick 31.

The percussion layer drops from the soundtrack. Two instruments gone.

**Phase 2→3 Transition (Tick 32): Factory Under Siege**
Without a striker, the enemy advance is uncontested. They push toward the factory. The scout, now alone in the field, broadcasts frantically — but nobody is listening except the Command agent, which has no offensive capability. Marcus watches his scout detect threats and broadcast to an empty channel. The signal lines pulse green into the void.

Tick 35: enemy units reach the factory perimeter. The factory's border flashes red. The conveyor belt continues producing — a new striker emerges at tick 36 (production queue cycle). But it spawns directly into an enemy's engagement range. One-shot-one-kill. The fresh striker dies before taking a single action.

Marcus groans.

**Phase 3→4 Transition (Tick 38): Specialist Lost**
The specialist, positioned near the factory, uses `hack` on an approaching enemy — successfully converting it for 3 ticks. The hacked enemy blocks one avenue of approach. But a second enemy flanks. The specialist has no combat skills. Adjacent enemy. One-shot-one-kill.

The melody drops. Only the bassline remains.

**Phase 4 (Ticks 39-45) — The Remnant**
Marcus has: one scout (in the field, useless offensively), one Command agent (stationary, by the factory), and the factory itself (still producing, but units die on spawn). The Command agent's decision trace reads: `reassign: no eligible subordinates. reroute: no active channels. prioritize: nothing to prioritize. Status: IDLE.`

Tick 45: an enemy reaches the factory. Mission failure.

The soundtrack is silence. Literal silence. The last bass note faded at tick 42.

**Minute 5:00 — Debrief**
Marcus opens the Inspector and spends 10 minutes with it — his longest debrief yet. He replays the relay destruction at tick 22, moment by moment. He sees that the enemy striker was visible at tick 20 (within the scout's perception range) but the scout's rule was `IF enemy detected AND NOT adjacent THEN broadcast position`. The enemy was 2 tiles away at detection — not adjacent, so the scout broadcasted. But the broadcast went to the relay, which compressed it and forwarded to the striker — the striker was 4 tiles away from the threat. By the time the compressed signal arrived (2-tick latency), the enemy had already reached the relay.

The lesson: signal latency + relay proximity = vulnerability. His relay was too close to the front. He needed either (a) the relay further back, or (b) a defensive rule on the relay itself, or (c) a second relay for redundancy.

He opens the context window chart for the striker. The utilization sparkline shows the Phase 2 spike — uncompressed signals flooding the buffer. He counts: 3 slots per uncompressed signal × 4 signals = 12 slots. The striker only has 8. Inevitable overflow.

Marcus redesigns with redundancy: two relays (one backup), production queue with relay replacement prioritized, and a defensive Striker stationed near the factory as a guard.

His third attempt takes 47 ticks but he wins. The soundtrack builds back to full ensemble by tick 44. Marcus pumps his fist.

---

## Comparable Games Across All Models

| Game | Phase Shift Mechanic | What Robot Uprising Can Learn |
|------|---------------------|-------------------------------|
| **Into the Breach** | Emerging Vek each turn + Alpha Vek spawning | Telegraphed threats that demand architectural (not tactical) response |
| **FTL** | Boss fight phases (3 phases, different weapons/drones) | Each phase demands different ship configuration; no respite between phases |
| **XCOM 2** | Reinforcement timers + objective reveals | Time pressure forcing commitment before full information |
| **Dark Souls** | Boss HP-threshold phase transitions | Hard-cut transitions with new attack patterns; the player's muscle memory (architecture) must adapt |
| **Slay the Spire** | Boss abilities that punish specific strategies (e.g., Time Eater punishing many-card turns) | Phase shifts that specifically counter the architecture type that won Phase 1 |
| **Factorio** | Biter evolution scaling with pollution | Gradual environmental shift (Rising Tide model) that punishes over-expansion |
| **Darkest Dungeon** | Party stress + affliction cascade | Cascading Crisis model — each loss compounds the next; survival despite degradation |
| **StarCraft Brood War** | Mid-game tech switches (Mutalisk → Lurker pivot) | The opponent adapting to your strategy is the phase shift; architecture must handle meta-shifts |

---

## Design Recommendations for Implementation

### Phase Shift Budget Per Mission
Not every mission needs a phase shift. The locked 10-mission arc should use phase shifts sparingly:
- **Missions 1-5:** Zero phase shifts. Single-type missions teach individual primitives.
- **Missions 6-7:** One phase shift each (The Rising Tide, then The Ambush). Teach the concept.
- **Missions 8:** The Echo. The game's signature mission — "your architecture fights itself."
- **Mission 9:** Cascading Crisis. The endurance test.
- **Mission 10:** The Fork + Branching Crisis. Maximum complexity. The player's architecture determines which final boss they face.

### Inspector Phase Markers
The Inspector timeline MUST have clear phase markers — vertical colored bars with labels ("Phase 1: Recon", "Phase 2: Siege"). Without these, a 50-tick multi-phase mission becomes unnavigable in the debrief.

### Phase Shift Moment: Always 1x Speed
Regardless of the player's speed setting, the phase transition always plays at 1x speed with a 0.5-second hold. This ensures the dramatic moment lands. The player can speed through normal ticks but MUST experience the transition in real time.

### Retry Knowledge
On retry, the player knows about the phase shift. This is by design. The game isn't testing whether you can discover the shift — it's testing whether you can build an architecture that handles it. Knowing the shift is coming and still failing because your architecture can't adapt is the lesson.

---

## New Aspects Discovered

1. **5.08a-i — Phase transition visual language specification:** Full pixel-level spec for the phase shift moment — screen ripple radius, color temperature shift values, spawner crack-open animation keyframes, terrain tile-flip timing, audio hit frequencies. The transition needs to be consistent across all missions so players learn to recognize it instantly.

2. **5.08a-ii — Phase-aware Command agent rule design:** How should the Command agent's `reroute` and `reassign` skills interact with phase shifts? Can players write rules like "IF phase_shift_detected THEN reroute all channels to defend-home"? Does the game need a formal "phase detection" signal type, or should Command agents infer phase shifts from signal pattern changes?

3. **5.08a-iii — Multi-phase Inspector timeline UX:** The Inspector's timeline scrubber needs phase markers, branch visualization (for The Fork model), and ghost-trace alternate timelines. Detailed UX spec for how these elements layer onto the existing scrubber without overwhelming it.

4. **5.08a-iv — Phase-shift-as-difficulty-dial:** Can the number and severity of phase shifts serve as a difficulty multiplier? "Normal: 1 phase shift. Hard: 2 phase shifts. Nightmare: continuous phase shifts every 10 ticks." Phase shift frequency as a Gauntlet mutator.

5. **5.08a-v — The "Earthquake" model — terrain-only phase shifts:** Phase shifts that change ONLY the terrain (hills collapse, rivers flood, buildings crumble) without introducing new enemies. The architecture faces the same enemies in a changed landscape. Tests whether the information routing is terrain-dependent or terrain-agnostic. The minimalist phase shift.
