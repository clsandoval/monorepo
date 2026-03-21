# 1.09d — Near-Miss Visibility as Retention Engine

## The Core Insight: "You Lost Because Rule 3 Evaluated Stale Data from Tick 12"

The difference between a player who quits after a loss and a player who immediately hits retry lives in a single psychological hinge: **did the game show them the one thing they could have changed?** Not "you lost" — that teaches nothing. Not a wall of statistics — that overwhelms. The magic sentence is: "your Striker at D4 died on tick 14 because its context window still held a scout report from tick 6, and it moved toward a position the enemy had already vacated 8 ticks ago. If you had set eviction priority to age-first instead of type-first, the stale report would have been flushed at tick 10, and the Striker would have seen the updated threat at E7 in time."

That sentence converts "I lost" into "I lost because of ONE decision I made in the Plan screen, and I know exactly which one." The near-miss effect — extensively documented in gambling psychology research — shows that outcomes perceived as "almost winning" activate the same dopaminergic reward pathways as actual wins. A 2009 study published in *Neuron* found that near-misses triggered identical brain reward systems as real victories. But Robot Uprising has an advantage over slot machines and even over Slay the Spire: because the game is deterministic and fully replayable in the Inspector, the near-miss isn't an illusion — it's a provable counterfactual. The player really WAS one configuration change away from winning.

## How Comparable Games Handle Failure Feedback

### Slay the Spire: The Implicit Near-Miss

Slay the Spire never explicitly tells you what went wrong. There is no "you died because you took Corruption without Dead Branch" screen. Instead, it creates near-miss psychology through **transparency of state**: you can see your HP dropping across the run history, you can see exactly which fight killed you, you can see your final deck and relics. The near-miss is reconstructed in the player's mind: "If I had skipped that card at the Act 2 shop..." "If I had taken the elite path for one more relic..." The community even built tools like Spirescope that perform "card regret analysis" — showing cards you pick in losses but skip in wins.

The limitation: this reconstruction is entirely manual. New players often don't know WHY they lost. They see "I died to the Heart with 47 HP remaining on the boss" but can't trace the causal chain back to the Act 1 decision that doomed them. Slay the Spire's near-miss works for experienced players who have internalized the decision tree. For newcomers, a loss is just a loss.

**What Robot Uprising can steal:** The emotional weight of seeing your exact moment of death. What it must ADD: the causal chain that Slay the Spire leaves to the player's imagination.

### Balatro: The Intellectual Near-Miss

Balatro — the poker roguelike that sold millions in 2024 — perfects what game psychology researchers call "the intellectual near-miss." As one analysis puts it: "A loss in Balatro never feels unfair because players can trace exactly which decisions led to failure." The player thinks: "If I had just bought that Hologram Joker in the second shop instead of forcing the Flush build, I could have scaled into the late game." The near-miss is about *insight* — the brain craving the closure of the "Eureka!" moment — rather than about chance. The game masters "the art of the near-miss, a classic slot machine trick, but here the near-miss is intellectual. You almost understood the combinatorial chaos. You almost built the perpetual motion machine."

Balatro's retention comes from the fact that the player can identify the specific pivot point where the run diverged from success. But like Slay the Spire, the game doesn't SHOW this — the player must reconstruct it mentally.

**What Robot Uprising can steal:** The feeling that failure is an intellectual puzzle you almost solved. What it must ADD: automated surfacing of the pivot point rather than relying on player expertise to identify it.

### Hades: Failure as Narrative Progress

Hades takes a different approach entirely. Death isn't a near-miss — it's progress. The Mirror of Night upgrades persist between runs. NPCs advance their storylines only when you die. The game's philosophy: "You should never feel like you just wasted your whole run for nothing." This works brilliantly for narrative roguelikes but sidesteps the actual near-miss question. Hades doesn't tell you why you lost mechanically — it tells you why dying was WORTH IT narratively.

**What Robot Uprising can steal:** The emotional cushion of "even failure taught you something." The Inspector's analytical phase serves this role. What it should NOT copy: replacing mechanical feedback with narrative progress. Robot Uprising is an engineering game; players need to understand WHY their systems failed, not just feel okay about it.

### Into the Breach: Perfect Information Eliminates Near-Misses

Into the Breach shows you exactly what every enemy will do before you act. Every loss is clearly the player's fault — there is no information gap. The single undo-per-battle ("Reset Turn") creates micro near-misses: "If I had positioned the Artillery mech one tile to the left, I could have blocked that Vek AND protected the building." But the game provides no post-battle analysis. You simply see the grid state, process your failure, and start the next island or timeline.

**What Robot Uprising can steal:** The clarity that comes from deterministic, fully-transparent systems. Into the Breach proves that players accept failure graciously when they can clearly trace cause and effect. What it must ADD: the Inspector is Robot Uprising's answer to what Into the Breach lacks — a post-battle tool for tracing cause and effect across time.

### Zachtronics: The Debugging Mindset

SpaceChem, TIS-100, and Shenzhen I/O never tell you why your solution failed — they show you it failing in real-time. You watch your assembly line jam, your registers overflow, your packets collide. The near-miss is visual and immediate: you can SEE the moment where your design breaks down. Zachtronics games turn failure analysis into the core gameplay loop — you don't need a separate debrief because the execution IS the debrief.

**What Robot Uprising can steal:** The visceral quality of watching your system break down in real-time (the Sealed Watch does this). What the Inspector must add: Zachtronics players can pause and step through execution. The Inspector's timeline scrubber serves this exact function, but it must go further by HIGHLIGHTING the critical failure point rather than making the player scrub through 30 ticks of execution hunting for it.

## The Counterfactual Engine: Robot Uprising's Unique Advantage

Robot Uprising has something none of these games have: **a deterministic tick-based simulation with full state capture at every step.** The Inspector already has a timeline scrubber. The design question is: how does the Inspector surface the critical near-miss without the player needing to be an expert?

### The "One Change Away" Algorithm

After each failed run, the Inspector should compute lightweight counterfactuals:

1. **Stale Data Detection.** For each unit that died or failed to act effectively, check: did its context window contain entries older than N ticks? If so, flag: "Scout report from tick 6 was still in Striker-Alpha's context at tick 14 when it made its fatal move. Eviction policy: type-first. If eviction were age-first, this entry would have been flushed at tick 10."

2. **Rule Evaluation Trace.** For each critical decision (the tick before a unit died, the tick when a flanking maneuver failed), show which rule matched and which rules were evaluated but skipped. Flag: "Rule 3 (engage nearest threat) matched because context slot 2 held stale data about an enemy at B3 that had moved to E7 at tick 9. Rule 5 (retreat if outnumbered) would have matched if slot 2 had been updated."

3. **Signal Latency Chains.** For failed coordinated actions, trace the signal path and highlight delays: "Scout-Bravo spotted the enemy at tick 8. Signal traveled Scout→Relay→Striker (4 ticks latency). Striker received at tick 12. Enemy moved at tick 10. The 4-tick latency made the signal 2 ticks too late. A direct Scout→Striker hook (2-tick latency) would have arrived at tick 10 — just in time."

4. **Context Overflow Moments.** If a unit was stunned by context overload at a critical moment, show: "Relay-Charlie overloaded at tick 11 (12/12 slots full, 3 new signals arrived). It was stunned for tick 12. During that tick, it would have forwarded the compress signal that Striker-Alpha needed to avoid the ambush at E4."

### The Presentation: "The Smoking Gun"

The Inspector's sidebar should have a dedicated panel — call it **The Smoking Gun** — that surfaces the single highest-impact counterfactual after each failed run. Not a list of everything that went wrong. ONE thing. The most impactful configuration change that would have altered the outcome.

Visual treatment: A single card-sized panel at the top of the Inspector sidebar. Matte black background with a thin amber border. An icon of the affected unit. The headline in amber text: **"Striker-Alpha died because of stale data."** Below, in cooler gray text, the 2-3 sentence explanation. Below that, a cyan button: **"Show me"** — which scrubs the timeline to the exact tick and highlights the relevant context window entry, the rule that matched, and the unit's fatal movement.

If the player clicks "Show me," the board scrubs to the tick, the affected unit pulses with an amber glow, and a ghosted overlay shows the ALTERNATIVE path — where the unit would have moved if the configuration had been different. A dotted cyan line traces the path-not-taken. The enemy that killed the unit has a red pulse. The gap between them — the one tile, the one tick — is viscerally visible.

## Player Journeys

### Journey: Mika, 28, Frontend Developer, First-Time Strategy Gamer

**Context:** Mission 5, first time using the factory. Just lost her second attempt. Her units keep running into enemies they should have avoided. She doesn't understand why her scout reports aren't helping.

**Minute 0:00 — The Sealed Watch Ends**
The final tick plays out. Mika watches her last Striker walk directly into two enemy units at D5. The red flash. The crunch sound. "MISSION FAILED" fades in over the darkened board, white text on translucent black. Mika's stomach drops — she spent ten minutes configuring blueprints. A beat of silence. Then the board brightens slightly and the Inspector sidebar slides in from the right.

**Minute 0:08 — The Smoking Gun Appears**
At the top of the Inspector sidebar, a card-sized panel fades in with a subtle amber glow. The unit icon for Striker-Alpha. The headline: **"Striker-Alpha walked into a trap using 8-tick-old intel."** Below: "At tick 14, Striker-Alpha moved to D5 based on a scout report from tick 6 that placed enemies at B3. Those enemies moved to D5 at tick 10. Your context eviction is set to type-first — the old report was never flushed." A cyan "Show me" button pulses gently at the bottom.

Mika's eyebrows go up. She didn't even know context eviction was a setting she could change. She taps "Show me."

**Minute 0:15 — The Counterfactual Replay**
The timeline scrubs to tick 14. The board shows Striker-Alpha at C5, one tile from the enemies at D5. The unit's context window panel opens below — six slots, and slot 3 glows amber, showing the entry: "Enemy spotted B3 — source: Scout-Bravo, tick 6." The entry's age indicator shows a faded orange "8 ticks old." Next to it, a ghosted annotation: "If eviction were age-first, this entry would have been flushed at tick 10."

A dotted cyan line appears on the board showing where Striker-Alpha WOULD have moved — south to C6, away from the threat — if it hadn't been acting on stale data. The cyan ghost-path and the red death-path form a clear fork. One tile apart. One configuration choice apart.

Mika exhales. "Oh. OH." She hits the Plan button. She goes straight to the Striker blueprint's Context Config section and changes eviction from type-first to age-first. She doesn't change anything else. She hits Execute.

**Minute 8:00 — The Retry**
Striker-Alpha reaches tick 14. It does not have the stale scout report. It receives fresh data from tick 12 showing enemies at D5. Rule 5 (retreat if outnumbered) activates. Striker-Alpha moves to C6. It survives. Two ticks later, a second Striker catches the enemy in a pincer. Mika pumps her fist.

**UI Annotations:**
- **Smoking Gun panel:** 180×120px card at top of Inspector sidebar. Matte black bg, 1px amber border, unit icon (24×24) top-left, headline in 14px amber semibold, body in 12px gray regular, "Show me" button in cyan with subtle pulse animation
- **Stale data highlight:** Context window slot with amber background instead of default dark, age indicator in orange with "X ticks old" label
- **Counterfactual path:** Dotted cyan line (2px, 50% opacity) showing alternative movement, contrasted with solid red line showing actual fatal path
- **Ghost unit:** Semi-transparent cyan silhouette of the unit at its alternative position

### Journey: Kwame, 35, DevOps Engineer, Zachtronics Veteran

**Context:** Mission 8, factory-vs-factory. Lost a close match — he eliminated 6 of 8 enemy units but his relay network collapsed under signal load. He knows something went wrong with his communication architecture but can't pinpoint it.

**Minute 0:00 — Post-Sealed-Watch Stillness**
The defeat screen lingers. Kwame watches his last Relay spark and die, overwhelmed by 4 simultaneous signal inputs. He's annoyed — he DESIGNED the relay network carefully. He had compress skills, filter rules, the works. He waits for the Inspector, arms crossed.

**Minute 0:05 — The Smoking Gun: Context Overload Chain**
The Smoking Gun panel reads: **"Relay-Echo overloaded at tick 19, causing a 3-unit cascade failure."** Body text: "Relay-Echo received 4 signals simultaneously at tick 19 (context: 12/12 slots full). It was stunned for tick 20. During tick 20, it would have forwarded compressed intel to Striker-Delta and Striker-Gamma. Without that intel, both Strikers used stale movement rules and walked into enemy fire at tick 21."

Kwame leans in. He taps "Show me."

**Minute 0:12 — The Cascade Visualization**
The Inspector scrubs to tick 19. The board shows Relay-Echo at F3 with its context bar fully red — all 12 slots occupied. Four incoming signal lines converge on it, drawn as dashed colored lines from four different scouts. The context window detail panel shows every slot occupied: three scout reports, two compressed forwards, four hook acknowledgments, three channel noise entries.

Below the context window, a cascade diagram appears — a vertical timeline showing:
- Tick 19: Relay-Echo receives 4 signals → context overload → stunned
- Tick 20: Relay-Echo cannot forward compressed intel → Striker-Delta receives nothing → Striker-Gamma receives nothing
- Tick 21: Striker-Delta acts on last known intel (tick 15) → moves to E6 → enemy at E6 → eliminated. Striker-Gamma acts on last known intel (tick 16) → moves to F7 → enemy at F7 → eliminated.

The cascade diagram uses red connecting lines between events, each one a domino. At the bottom, in amber: "If Relay-Echo had listen-filters set to ignore hook-acknowledgment signals (4 of 12 slots were ack noise), it would have had 4 free slots at tick 19. No overload. No cascade."

**Minute 0:20 — Deep Dive: The Signal Archaeology**
Kwame isn't satisfied with the summary. He clicks on Relay-Echo's context window at tick 18 — one tick before the overload. He sees that 4 of 12 slots contain "hook-ack" entries — confirmation signals that a downstream unit received a hook transmission. These are technically data, but for Relay-Echo's role as a pure forwarder, they're noise. Kwame clicks on one of the ack entries and sees its provenance: "Source: Striker-Delta, Tick 16, Channel: strike-orders, Type: hook-acknowledgment."

He nods slowly. He didn't configure listen-filters on the Relay because he wanted it to hear everything. But "everything" includes the acknowledgments flowing back UP the chain, which are useful for Command units but pure waste for a Relay. The fix: toggle "hook-acknowledgment" to IGNORE in the Relay's context config.

**Minute 0:30 — The Architecture Insight**
Kwame goes to Plan. He opens Relay-Echo's blueprint. Context Config section. Under "Listen Filters," he finds the signal type toggles. He switches "hook-acknowledgment" from LISTEN to IGNORE. The context preview immediately shows projected utilization dropping from 100% to 67%. He also notices he could set eviction to prioritize low-source-freshness entries. He makes both changes.

He doesn't just retry — he opens his second Relay blueprint and makes the same change. Then he reconsiders his entire relay topology, wondering if he should split the 4-scout-to-1-relay bottleneck into two relay clusters. The near-miss didn't just teach him one fix — it revealed a CATEGORY of architectural vulnerability.

**UI Annotations:**
- **Cascade diagram:** Vertical timeline with unit icons as nodes, red lines connecting causal events, each node showing tick number and event summary. Rendered in the Inspector sidebar below the Smoking Gun panel
- **Context window detail:** Full-width panel showing all 12 slots as horizontal bars. Each bar shows: content type icon, source unit name, source tick, channel name. Ack entries highlighted in dim orange. Scout reports in green. Compressed forwards in cyan.
- **Listen filter toggles:** In Plan screen, each signal type is a horizontal row with LISTEN (green) / IGNORE (red dim) toggle. Changing to IGNORE immediately grays out the signal type in the context preview

### Journey: Anika, 16, High School Student, Plays Mobile Games Mostly

**Context:** Mission 3, the hooks tutorial. She just lost because her Scout's hook didn't trigger when she expected it to. She has played 4 runs total and doesn't fully understand hooks yet.

**Minute 0:00 — Confusion, Not Frustration**
The defeat screen appears. Anika's Scout was supposed to broadcast an enemy sighting on the "alert" channel, triggering her Striker to move toward the threat. But the Striker never moved. The Scout saw the enemy, she's sure of it — the perception radius lit up during the sealed watch. But nothing happened.

**Minute 0:06 — The Smoking Gun: Simple Language**
The Smoking Gun panel appears with Scout-Alpha's icon: **"Scout-Alpha saw the enemy but couldn't tell anyone."** Body text: "Scout-Alpha's hook is set to broadcast on channel 'alert' when it spots an enemy. At tick 8, it spotted the enemy at C3. But Scout-Alpha's context window was full (6/6 slots). The hook tried to add a 'broadcast intent' to the context window, but there was no room. The broadcast never fired."

This is crucial: the language is simple. Not "hook execution failed due to context saturation." Instead: "It saw the enemy but couldn't tell anyone." The metaphor is social, not technical.

**Minute 0:12 — Show Me: The Silent Moment**
Anika taps "Show me." The timeline scrubs to tick 8. The board shows Scout-Alpha at B4 with an enemy unit appearing at C3 within its wide perception radius (shown as a translucent blue circle). The Scout's context bar is solid red — full. In the context window detail, all 6 slots are occupied: two old patrol waypoints, one terrain observation, one previous enemy sighting (now gone), one environmental noise entry, one channel message from a previous relay test.

A small animation plays: a speech bubble icon tries to appear above the Scout, with the word "alert!" inside — but it pops like a soap bubble, accompanied by a soft, sad "plink" sound. The speech bubble fragments scatter and fade. The Striker, two tiles away, shows no reaction — it never heard the alert.

Below the context window, the Smoking Gun suggests: "Try changing Scout-Alpha's eviction priority to flush old patrol waypoints first. Or reduce what Scout-Alpha listens to — it's hearing channel noise it doesn't need."

**Minute 0:18 — The Aha Moment**
Anika goes to Plan. She opens Scout-Alpha's Context Config. She sees 6 slots, and she realizes for the first time that the context window is a REAL CONSTRAINT — not just a stat on the blueprint card. She drags "patrol-waypoint" to the bottom of the eviction priority list (meaning it gets flushed first when new data arrives). She also toggles off listening to the "relay-test" channel, which she set up in Mission 2 and forgot about.

She hits Execute. At tick 8, the Scout's context window has 2 free slots. The hook fires. "Alert!" appears as a tiny green speech bubble. The Striker turns and moves toward C3. The enemy is eliminated at tick 10.

Anika grins. She just learned what a context window is — not from a tutorial popup, but from a near-miss that showed her the exact cost of ignoring it.

**Minute 0:25 — The Retention Hook**
She doesn't quit. She wonders: "What if I gave the Scout a compress skill so it could fit MORE in its context window? What if I added a second hook on a different channel?" She's not just retrying — she's theorycrafting. The near-miss converted her from "following the tutorial" to "experimenting with the system."

**UI Annotations:**
- **Speech bubble pop animation:** Small (24×24) speech bubble icon rises from unit, shows channel name, then pops with particle scatter effect. Accompanied by soft descending tone ("plink"). Duration: 0.5 seconds
- **Context window full state:** All 6 slots rendered as horizontal bars with red tint. A "FULL" indicator pulses once in the corner of the unit's context bar on the board
- **Eviction priority drag list:** In Plan screen Context Config, entries listed vertically. Drag handle on left side. Bottom = first to evict. Top = last to evict. Dragging an entry shows a ghost preview of projected context utilization

### Journey: Rafael, 42, Data Scientist, Into the Breach Fan

**Context:** Mission 9, deep factory-vs-factory. Lost by one tick — his command agent issued a reroute order that arrived too late because signal latency through his 3-hop relay chain was 6 ticks, and the enemy completed its flanking maneuver at tick 24 while his reroute arrived at tick 25.

**Minute 0:00 — The One-Tick Loss**
The sealed watch ends with Rafael's base being breached. He can see it was close — his Strikers were converging but arrived one tick too late. The MISSION FAILED text appears. He's already mentally replaying the battle.

**Minute 0:05 — The Smoking Gun: Latency Math**
**"Your reroute order arrived 1 tick too late."** Body: "Command-Prime detected the flanking threat at tick 18 and issued a reroute on 'emergency-redirect.' Signal path: Command-Prime → Relay-Alpha → Relay-Beta → Relay-Gamma → Striker-Delta. Total latency: 6 ticks (1 per hop × 4 hops + 2 ticks processing). Reroute arrived at tick 25. Enemy breached base at tick 24. A direct Command→Striker hook (2-tick latency) would have delivered the reroute at tick 20 — 4 ticks before the breach."

The math is right there. 6 ticks vs 2 ticks. The difference between victory and defeat.

**Minute 0:10 — The Architecture Dilemma**
Rafael clicks "Show me." The Inspector scrubs to tick 18 and draws the signal path as a glowing cyan line hopping through three relays. Each hop is annotated with "+1 tick." At each relay, a small clock icon shows the processing delay. The total path: Command (T18) → Alpha (T19) → processing (T20) → Beta (T21) → processing (T22) → Gamma (T23) → processing (T24) → Striker (T25). The enemy breach timestamp (T24) is shown as a red vertical line on the timeline. The signal arrives one pip AFTER the red line.

But Rafael knows WHY he built the 3-hop chain: his relays have compress and filter skills that reduce signal noise. A direct Command→Striker hook would be faster but would send raw, uncompressed data — potentially overloading the Striker's small 8-slot context window. The near-miss reveals a fundamental engineering tradeoff: **latency vs. signal quality.** More hops = cleaner data but slower delivery. Fewer hops = faster but noisier.

**Minute 0:18 — The Optimization Puzzle**
Rafael doesn't just add a direct hook. Instead, he redesigns his relay topology: he removes one relay from the chain (reducing latency from 6 to 4 ticks) and gives the remaining relays more aggressive compress skills to compensate for the lost filtering stage. He also adds an "emergency" channel that bypasses the relay chain entirely for critical reroutes — accepting the noise penalty for time-critical orders.

He's now designing a dual-path communication architecture: a high-quality slow path for routine intel, and a low-latency noisy path for emergencies. He didn't learn this from a tutorial. He learned it from losing by one tick.

**UI Annotations:**
- **Signal path visualization:** Cyan dashed line connecting unit icons on the board, with "+1 tick" labels at each hop. Total latency shown as "6 ticks" in amber at the end of the path
- **Timeline breach marker:** Red vertical line on the timeline scrubber labeled "Base breached T24." Signal arrival shown as cyan vertical line labeled "Reroute received T25." The gap between them — one tick — highlighted with an amber bracket
- **Latency comparison:** Small overlay showing "Current: 6 ticks / Direct: 2 ticks / Needed: ≤5 ticks" in the Smoking Gun panel

## Strengths of the Near-Miss Visibility System

1. **Converts frustration to curiosity.** The most dangerous moment in any game's retention is the 5 seconds after "MISSION FAILED." If the player feels confused or cheated, they quit. If they feel "I know exactly what to fix," they retry immediately. The Smoking Gun panel fills those 5 seconds with actionable insight.

2. **Teaches the game's systems organically.** Mika learned about eviction policies. Anika learned about context window constraints. Neither needed a tutorial popup. The near-miss IS the tutorial — it teaches the concept at the exact moment the player needs to understand it. This is what learning scientists call the "productive failure" pattern.

3. **Creates the "one more run" loop at every skill level.** Newcomers get simple language ("It saw the enemy but couldn't tell anyone"). Veterans get architectural insights ("Your 3-hop chain adds 4 ticks of latency vs. direct routing"). The Smoking Gun scales with the player.

4. **Leverages determinism.** Because the simulation is tick-based and deterministic, counterfactuals aren't guesses — they're provable. The game can actually simulate the alternative and show the result. This gives the near-miss a weight that probabilistic games (Slay the Spire, Balatro) can never achieve.

5. **Makes the Inspector essential, not optional.** Without the Smoking Gun, some players might skip the Inspector entirely — "I lost, whatever, retry." With it, the Inspector becomes the most addictive part of the game: the place where you understand your own systems better than you did before.

## Weaknesses and Risks

1. **Computational cost of counterfactuals.** Running alternative simulations to verify "what would have happened" requires re-executing the tick simulation with modified parameters. For simple changes (eviction policy swap), this is cheap. For complex changes (different relay topology), it may be expensive or intractable. The system should limit itself to single-variable counterfactuals: "If THIS ONE SETTING were different, holding everything else constant."

2. **False precision.** A counterfactual might show "if you changed eviction to age-first, the Striker would have survived tick 14" — but fail to mention that the Striker would then die at tick 18 from a different cause. The Smoking Gun must be honest: "This change would have changed the outcome at tick 14" is safe. "This change would have won you the mission" is a stronger claim that requires full re-simulation.

3. **Overwhelming expert players.** Kwame doesn't need the system to tell him his relay overloaded — he saw it happen. For expert players, the Smoking Gun might feel patronizing. Solution: make it collapsible and let players go directly to manual timeline scrubbing if they prefer. The Smoking Gun is a default-open panel, not a forced tutorial.

4. **Single-cause fallacy.** Real failures are usually multi-causal. If three things went wrong, showing only the "biggest" one might mislead the player into thinking one fix solves everything. Mitigation: the Smoking Gun shows ONE primary cause with a small "2 other issues detected" link that expands to secondary causes.

## Interaction Effects

- **Sealed Watch (emotional) → Inspector (analytical):** The two-act debrief structure is ESSENTIAL for near-miss psychology. The sealed watch creates the emotional investment ("I was so close!"). The Inspector converts that emotion into understanding ("Here's exactly why"). Reversing the order would kill the effect — analytical first drains the emotional energy that drives retry motivation.

- **Blueprint Editor slots:** The near-miss system reinforces the slot-limit tension. When the Smoking Gun says "if you had a compress skill on this Relay," the player feels the constraint of limited skill slots — they need to REMOVE something to ADD compress. The near-miss makes the slot tradeoff visceral.

- **Campaign progression:** Near-miss feedback should become more sophisticated across missions. Mission 3: "Your Scout's context was full." Mission 8: "Your 3-hop relay chain added 4 ticks of latency to an emergency reroute, and the stale data in Relay-Beta's context window delayed forwarding by an additional tick because its filter rule prioritized channel noise over scout reports." The complexity of the Smoking Gun grows with the player's understanding.

- **Context overload mechanic:** The near-miss system makes context overload MEANINGFUL rather than punishing. Without the Smoking Gun, a stunned relay is just annoying. With it, the player understands exactly which entries caused the overflow and how to prevent it — transforming punishment into a puzzle.

## Sensory Description

**The Smoking Gun panel** fades in 2 seconds after the sealed watch ends. Matte black background, 1px amber border, slight drop shadow. The unit's icon sits in the top-left corner at 24×24px, with a faint amber glow behind it. The headline text is 14px, amber (#d4a843), semibold. Body text is 12px, cool gray (#a0a4a8), regular weight. The "Show me" button is a rounded rectangle with a 1px cyan border, the text "Show me" in cyan, with a slow pulse animation (opacity 0.7→1.0→0.7 over 2 seconds). When tapped, the button sends a ripple of cyan light across the panel border before the timeline scrubs.

**The counterfactual path overlay** renders as a dotted line in cyan (#4fc3f7), 2px width, 50% opacity, with small directional arrows. The actual fatal path renders as a solid red (#ef5350) line. Where they diverge, a small diamond marker appears at the fork point. The alternative unit position shows as a ghosted silhouette — the unit's sprite at 30% opacity with a cyan tint, gently bobbing up and down (1px, 0.5s cycle).

**The speech bubble pop** (for failed hooks) uses a comic-style speech bubble that inflates from the unit over 0.3 seconds, holds for 0.2 seconds showing the channel name, then pops with 6-8 small white particles scattering outward while the bubble skin wrinkles inward. Sound: a soft, descending three-note chime (G→E→C) lasting 0.4 seconds. The emotional register is gentle disappointment, not harsh failure.

**The cascade diagram** draws itself line by line, each connection appearing with a soft "tick" sound (like a clock), creating a domino-fall rhythm. Red lines pulse once when they appear. The final event (unit death or base breach) arrives with a deeper tone and a brief screen-edge vignette in dark red, lasting 0.5 seconds.

## The TikTok Clip

Fifteen seconds. The sealed watch ends — a Striker walks into an ambush, red flash, eliminated. Cut to: the Smoking Gun appears. "Striker-Alpha died because of 8-tick-old intel." The player taps "Show me." The board rewinds. A cyan ghost-line shows where the Striker WOULD have gone. One tile apart. One setting apart. Cut to: the player in the Plan screen, dragging one toggle from "type-first" to "age-first." Cut to: the retry. Same tick. Same moment. The Striker turns south instead of east. Survives. Flanks the enemy. Victory. Text overlay: "One setting. One tile. One tick." The clip sells the game's thesis: your systems are one configuration change away from brilliance.

## Comparable Games Summary

| Game | Near-Miss Approach | What It Shows | What It Doesn't |
|------|-------------------|---------------|-----------------|
| Slay the Spire | Implicit — player reconstructs from run history | Final deck, HP curve, death fight | Causal chain from decision to death |
| Balatro | Intellectual — "I almost solved it" | Joker synergies, score math | Automated pivot-point identification |
| Hades | Narrative — death IS progress | Story advancement, permanent upgrades | Mechanical failure analysis |
| Into the Breach | Perfect information — your fault, clearly | Enemy intent, reset undo | Post-battle analysis tools |
| Zachtronics | Visual debugging — watch it break | Real-time execution failure | Highlighted critical failure point |
| **Robot Uprising** | **Automated counterfactual** | **The one change, the one tick, the one tile** | — |

Robot Uprising's Inspector with the Smoking Gun system occupies a unique position: it combines Zachtronics' visual debugging with Slay the Spire's post-run analysis, adds automated counterfactual computation that no comparable game offers, and wraps it in the emotional two-act structure (sealed watch THEN inspector) that gives the near-miss its psychological weight. The key insight: deterministic simulation + full state capture + automated counterfactual analysis = provable near-misses, not just perceived ones.
