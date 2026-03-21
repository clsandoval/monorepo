# 1.09b — The Skip-as-Power Principle for Slot Allocation

## Overview

The most counterintuitive lesson in deckbuilding games: the best card is often the one you don't take. Slay the Spire's Skip button, Dominion's Chapel, and Zachtronics' instruction-count histograms all teach the same truth — restraint is mastery. In Robot Uprising, where blueprints have hard slot limits for skills, rules, hooks, and context config, the question becomes: how does the game communicate that leaving a slot empty is sometimes the strongest move? This analysis examines how comparable games reward minimalism, and what visual and mechanical language Robot Uprising needs to make "deliberate emptiness" feel powerful rather than incomplete.

## Slay the Spire: The Skip Button as the Best Card in the Game

### The Mechanical Truth

Slay the Spire presents the player with three card rewards after every combat encounter. A small, unassuming "Skip" button sits at the bottom. New players never press it — surely more cards means more power? Veterans press it constantly. At Ascension 20, top players skip 40-60% of card rewards in Acts 2 and 3.

The math is brutally simple. Your deck shuffles and you draw 5 cards per turn. A 15-card deck cycles every 3 turns. A 30-card deck cycles every 6. If your win condition is a specific 3-card combo (say, Catalyst + Noxious Fumes + Burst for the Silent), you see it twice as often in the thin deck. Every mediocre card you add is a turn where you draw that card instead of your win condition. The skip button is not declining power — it is preserving the concentration of power you already have.

### The Design Problem Slay the Spire Solved

The skip button is visually tiny, tucked at the bottom of the card reward screen below three gorgeously illustrated, color-coded cards fanning out with glow effects and rarity borders. The cards demand attention. The skip button whispers. This is intentional — the game WANTS new players to take cards. The learning journey from "always take" to "usually skip" is one of the deepest skill curves in the genre. The game never tells you to skip. No tooltip says "sometimes skipping is optimal." The lesson emerges from dozens of failed runs where bloated decks drew Strikes instead of Catalysts at the critical moment.

### Card Removal as Active Thinning

Beyond passive skipping, Slay the Spire offers active removal. Shops sell card removal for 75 gold (rising each purchase). Events like "The Bonfire" let you remove a card. The Pandora's Box relic replaces all Strikes with random cards. Peace Pipe lets you remove a card at campfires instead of resting or upgrading.

The community calls this "deck surgery." Removing a basic Strike is often more valuable than adding a rare card. The act of paying gold to make your deck smaller — to have LESS — feels transgressive the first time. Then revelatory. Then obvious.

### The Vulnerability of Thin Decks

Slay the Spire balances deck thinning with hard counters. Status cards (Wounds, Burns, Dazed, Void) get shuffled into your deck by certain enemies. A 12-card deck that receives 5 Wounds is now 30% garbage. The Chosen enemy shuffles Hexes into your deck. Ascension 15+ adds a curse to every boss reward. The game says: "Yes, thin decks are powerful. But the world will try to bloat you. How do you protect your discipline?"

This creates a secondary skill — building decks that are thin AND resilient. Exhaust mechanics (cards that remove themselves after playing) let you purge status cards. The Corruption power makes all skills cost 0 but exhausts them. Blue Candle lets you play curses to exhaust them at the cost of 1 HP. The game rewards not just restraint but *active maintenance of restraint* against entropy.

## Dominion: Chapel as the Most Powerful Card Ever Printed

Dominion invented modern deckbuilding. Its designer, Donald X. Vaccarino, has publicly stated that Chapel — a 2-cost card that lets you trash up to 4 cards from your hand — is "probably the most powerful card for its cost that will ever be printed." The Dominion community divides the entire game into "kingdoms with Chapel" and "kingdoms without Chapel."

Chapel turns Dominion into two phases: (1) Buy Chapel on turn 1 or 2, spend 3-4 turns trashing all your Coppers and Estates. (2) Now your 4-card deck is Chapel + Silver + whatever you buy next. Every draw is a good draw. You go from fumbling with 7 Coppers and 3 Estates to a razor-sharp engine in 5 turns.

The lesson for Robot Uprising: **the tool that removes things is often more powerful than the tool that adds things.** If Robot Uprising had a "remove skill" action that was as impactful as Chapel, players would learn the skip-as-power principle viscerally.

## Zachtronics: The Histogram as Shame Engine

Every Zachtronics game (SpaceChem, TIS-100, SHENZHEN I/O, Opus Magnum, EXAPUNKS) scores solutions on multiple axes: cycles (speed), symbols/lines of code (size), and cost/footprint (space). After solving a puzzle, you see a histogram showing where your solution ranks against all other players globally.

The histogram is a masterpiece of silent communication. Your 47-instruction solution works. It produces the correct output. But the histogram shows a fat cluster of solutions at 12-15 instructions, and your bar is out in the wasteland at 47. Nobody told you to optimize. Nobody said "use fewer instructions." The histogram said everything by showing you what's possible.

This creates the Zachtronics loop: solve → see histogram → feel the gap → re-solve with fewer instructions → see histogram shift left → feel pride. The empty space on the board — instructions you didn't use, cycles you didn't spend — becomes the achievement. In Opus Magnum, the most beautiful solutions use the least space, and the community shares GIFs of elegant, minimal machines that make complex solutions look clumsy.

**Robot Uprising parallel:** What if the Inspector phase showed a "blueprint efficiency" metric? Not just "did you win?" but "how lean was your configuration?" A histogram showing other players' slot utilization for the same mission would teach the skip principle without a single tutorial tooltip.

## Teamfight Tactics: The Interest Threshold as Restraint Reward

In auto-battlers like TFT, gold saved earns interest: 1 bonus gold per 10 saved, up to 5 bonus at 50 gold. Spending gold buys units and levels. The tension: spend now to get stronger, or save to earn interest and spend more later?

"Econ players" deliberately keep their bench sparse and their board weak in early rounds, banking gold to hit 50 and then rolling down in a power spike at level 7 or 8. They watch their health drop to 40, 30, even 20 — trusting that their delayed spending will produce a stronger board than someone who spent every gold piece as they earned it.

The empty bench slots aren't weakness. They're potential energy. The player who has 3 units on bench and 50 gold is in a stronger position than the player with 9 units on bench and 12 gold, even though the second player's bench looks "fuller."

**Robot Uprising parallel:** Empty hook slots on a blueprint could serve a similar function. A Scout with 2 hook slots and only 1 used isn't "unfinished" — it's running a minimal emissions profile. Fewer hooks mean less EM noise, meaning less detectability. The empty slot IS the optimization.

## Into the Breach: The Action You Didn't Take

Into the Breach's perfect information design creates situations where the optimal move is to do nothing with one of your three mechs. Moving the Artillery Mech to attack an enemy might save a building but push another Vek into a worse position. Sometimes the correct answer is: don't move it. Let it sit. The absence of action is the solution.

The game never explicitly teaches this. But the undo button (freely available before committing) lets players explore: "What if I just... don't move this one?" The moment a new player realizes that NOT acting with a mech can be optimal is a skill breakthrough equivalent to learning to skip in Slay the Spire.

## What This Means for Robot Uprising

### The Core Design Question

Robot Uprising's blueprint editor shows hard slot limits with dashed outlines for empty slots. The locked design says: "empty slots with dashed outlines invite filling but there aren't enough for everything." This is the right starting instinct — scarcity creates tension. But there's a deeper layer: sometimes you SHOULD leave slots empty even when you have unused options to fill them.

Three reasons empty slots are powerful in Robot Uprising:

1. **Emissions reduction.** Every hook slot used creates EM noise. An empty hook slot produces zero emissions. A Scout with 1 hook instead of 2 is 50% quieter. Against enemies that hunt by emissions, silence is survival.

2. **Context window discipline.** Every skill and hook generates context entries. A unit with 3 skills and 2 hooks floods its own 6-slot context window. A unit with 1 skill and 1 hook keeps its context clean, making its rule evaluation faster and more predictable. Less input means clearer thinking.

3. **Cognitive clarity for the player.** A blueprint with every slot filled is harder to debug in the Inspector. When something goes wrong, you're tracing through 4 skills, 3 rules, 2 hooks, and a full context config. A minimal blueprint has fewer moving parts — the decision trace is shorter, the failure mode is obvious.

### Visual Language: Deliberate Emptiness vs. Unfilled Potential

This is the critical UX challenge. The game needs two distinct visual states for empty slots:

**"Available but unused" (default state):**
- Dashed outline, neutral gray, gently pulsing — the slot is waiting. It whispers "you could put something here."
- This is the state before the player has made a deliberate choice.

**"Deliberately empty" (player-locked state):**
- The player right-clicks (or long-presses) an empty slot and selects "Lock Empty."
- The dashed outline transforms: the slot collapses to a thin horizontal line with a small lock icon. The color shifts from gray to a cool teal — the same color used for efficiency indicators elsewhere in the UI.
- A tooltip on hover reads: "Slot intentionally empty. Reduces emissions by X. Keeps context window cleaner."
- The slot no longer pulses. It is settled. Decided. Calm.

**The visual difference matters enormously.** A blueprint with 2 of 4 hook slots showing dashed gray outlines looks incomplete. The same blueprint with 2 slots showing teal lock lines looks *optimized*. The player's intent becomes visible in the blueprint itself.

**"Overfilled" warning state (teaching the inverse):**
- When all slots are filled AND the unit has been stunned by context overload in a previous run, the filled slots could show a subtle amber border — not an error, but a suggestion. "This unit has too much going on."
- The Inspector debrief could highlight: "This Scout was stunned 4 times. Its context window filled every 3 ticks. Consider: does it need both Patrol AND Evade? Would removing Evade and relying on positioning give it a cleaner context window?"

### The Emissions Bar as Skip Incentive

Each blueprint in the editor could show a small vertical bar on its right edge: the **emissions profile**. It fills from bottom to top based on how many hooks and skills are equipped. A fully loaded Command unit's emissions bar glows hot orange at the top. A minimal Scout with one hook barely registers — a thin cyan sliver at the bottom.

During the sealed watch, emissions translate to enemy detection range. The enemy AI prioritizes high-emission targets. The player who filled every slot watches their Command unit get swarmed because it was broadcasting like a lighthouse. The player who left slots empty watches their Scout slip through undetected.

The emissions bar teaches the skip principle through consequences, not tutorials.

---

## Player Journeys

### Journey: Maya, 16, Slay the Spire Veteran

**Context:** Mission 5 — first factory mission. Maya has played 400 hours of Slay the Spire at Ascension 18. She understands deck thinning intuitively. She's just unlocked blueprints and the production queue. Her instinct from previous missions (hand-placed units) is that more is better — she loaded every skill and hook she could onto her pre-placed Scouts.

**Minute 0:00 — The Blueprint Editor Opens**

Maya sees her first blank Scout blueprint. Four sections vertically stacked on the right panel: Skills (2 slots), Rules (2 slots), Hooks (2 slots), Context Config. Each skill slot shows a dashed gray outline with a faint pulse. Available skills listed below: Patrol, Evade, Tag. She can only equip 2 of 3.

She drags Patrol into slot 1. Drags Evade into slot 2. Both slots fill with solid-bordered skill cards showing the skill icon and a one-line description. The dashed outlines disappear, replaced by clean borders. The emissions bar on the blueprint's right edge ticks up slightly — two small orange segments appear.

She moves to Hooks. Two dashed slots. She wires hook 1 to channel "recon-net" (on-detect → broadcast position). She pauses at hook 2. She has another hook available: "on-damage → broadcast alert." She thinks about her Slay the Spire instinct. "Do I need both? The alert hook will fire if the Scout gets hit. But if I've built the Scout to evade, it shouldn't get hit. And every hook is emissions..."

**Minute 1:30 — The Skip Moment**

Maya right-clicks the empty hook slot 2. A small context menu appears: "Lock Empty | Cancel." She selects Lock Empty. The dashed outline collapses into a thin teal line with a tiny lock icon. The emissions bar drops — one orange segment disappears. A micro-animation: the bar smoothly shrinks, and a tiny "-1 EM" floats up and fades.

She feels it — the same feeling as skipping a card reward in Slay the Spire. The blueprint looks cleaner. She hasn't added clutter. Her Scout will be quieter on the field.

**Minute 3:00 — Building the Contrast**

Maya creates a second blueprint: a Relay. 4 hook slots. She fills all 4 — compress, filter, amplify, and a broadcast-all hook. The emissions bar climbs to the top, glowing hot amber. She places the Relay deep behind her line, hoping its emissions won't matter because it's far from enemies. The Scout goes on the front line with its lean profile.

She hits EXECUTE.

**Minute 5:00 — The Sealed Watch Payoff**

Tick 8. Enemy units sweep the left flank. Her lean Scout — one hook, minimal emissions — goes undetected. It slips past the enemy line and starts feeding positions back on "recon-net." Her overloaded Relay, meanwhile, draws an enemy Striker that bee-lines for the highest emission source on the board. The Relay dies on tick 12.

Maya grins. She's seen this movie before. In Slay the Spire, bloated decks die to the Heart. In Robot Uprising, bloated blueprints die to emissions hunters. The lesson is the same: restraint is power.

**Minute 7:00 — Inspector Confirmation**

In the Inspector, Maya clicks her dead Relay. The decision trace shows it was detected at tick 6 due to high EM output. She clicks her surviving Scout. Its context window chart is a smooth, low line — never above 50% capacity. Clean context, clean decisions, clean survival.

She goes back to the Plan screen. She strips the Relay down to 2 hooks. Locks the other 2 empty. The emissions bar drops to half. She runs the mission again.

**UI Annotations:**
- **Lock Empty context menu**: appears on right-click of empty slot, positioned adjacent to cursor, two options in a minimal dropdown
- **Emissions bar**: 4px wide vertical bar on right edge of blueprint card, segments colored by load (cyan < 25%, green < 50%, amber < 75%, orange-red > 75%)
- **Teal lock line**: replaces dashed slot outline, 1px height, lock icon is 8x8px, subtle but distinct from "available" state
- **"-1 EM" float text**: small sans-serif, teal color, floats up 20px and fades over 0.5 seconds

---

### Journey: Diego, 34, Factorio Engineer (First Strategy Game)

**Context:** Mission 3 — tutorial mission teaching hooks. Diego has never played Slay the Spire or any card game. He's a Factorio player. His instinct is to maximize throughput: fill every slot, use every resource, saturate every belt. Empty slots look like idle assemblers — waste.

**Minute 0:00 — The Fully Loaded Blueprint**

Diego opens the blueprint editor for a pre-placed Scout. He sees 2 skill slots, 2 hook slots, 2 rule slots. His Factorio brain screams: "FILL THEM ALL." He equips Patrol and Evade. He wires both hook slots — one to "recon-net" and one to "alert-channel." He writes 2 rules: "If enemy detected, broadcast" and "If health threatened, evade." Every slot is full. The emissions bar is maxed. The blueprint card looks dense, every slot occupied with a solid border and icon.

He hits EXECUTE feeling confident. Maximum utilization. No waste.

**Minute 2:00 — The Context Overload**

Tick 4. His Scout detects two enemies simultaneously. Its 6-slot context window fills: observation-enemy-1, observation-enemy-2, patrol-waypoint, recon-net-incoming-from-another-scout, alert-channel-incoming, and evade-trigger. Full. Tick 5: another enemy appears in perception range. New observation arrives. Context window is full. The Scout's tile flashes amber, then the unit jitters — sparking, frozen. **Context overload. Stunned for 1 tick.**

The enemy Striker, which was 2 tiles away, advances. Tick 6: the Scout is still stunned. Tick 7: the Scout recovers, but the Striker is adjacent. One-shot, one-kill. The Scout is destroyed.

Diego stares. His fully utilized blueprint killed itself. The Factorio equivalent: a factory that backed up because every inserter was feeding into a belt with no throughput room.

**Minute 4:00 — The Inspector Lesson**

Diego enters the Inspector. He clicks his dead Scout. The context window chart shows a spike to 100% at tick 4, then a red "STUNNED" bar at tick 5. The decision trace reads: "Tick 5 — Context overload. 7 entries competing for 6 slots. Eviction triggered but unit stunned during eviction. No action taken."

He scrolls down. A new panel he hasn't noticed before: **Blueprint Efficiency Analysis.** It shows a simple breakdown:

```
Slot Utilization:  6/6 (100%)
Context Events/Tick: 4.2 avg
Context Overloads:   1
Ticks Stunned:       1
Emissions Level:     HIGH
Times Detected:      3
```

Below it, a suggestion line in italicized gray text: *"This unit generated more context entries per tick than its window could hold. Consider: fewer hooks = fewer incoming signals = fewer overloads."*

**Minute 5:30 — The Reluctant Removal**

Diego goes back to the Plan screen. He stares at his Scout blueprint. Every slot filled. His finger hovers over hook slot 2 — the alert-channel hook. He drags it out. The slot returns to a dashed gray outline. The emissions bar drops one segment. He feels uncomfortable — in Factorio, removing a machine is admitting defeat. But the Inspector data was clear.

He right-clicks the empty slot. Sees "Lock Empty." He doesn't use it yet — he's not ready to commit to emptiness. He leaves it as a dashed outline. Available. But unused.

He hits EXECUTE. This time, the Scout survives to tick 20. Its context window peaks at 83% but never overloads. It detects 5 enemies and broadcasts all of them on recon-net. Diego's Strikers, receiving clean signal, eliminate 4.

**Minute 8:00 — The Conversion**

Diego goes back to Plan. He right-clicks the empty hook slot. Locks it. The teal line appears. He nods. This isn't an idle assembler. This is a throughput governor. In Factorio terms, it's the circuit condition that prevents belt backup. Empty by design.

Over the next three missions, Diego develops a philosophy: "Start maxed, strip to minimal." He fills every slot first, runs the mission, watches the Inspector, then removes whatever caused overload or detection. Each locked-empty slot is a lesson learned. By Mission 7, he's building lean blueprints from the start.

**UI Annotations:**
- **Blueprint Efficiency Analysis panel**: appears in Inspector sidebar below decision trace, light gray background, monospace font for the metrics, italicized suggestion text in a slightly darker gray
- **Context overload visual**: unit tile flashes amber border for 1 frame, then unit sprite jitters (2px random offset per frame) with white spark particles for the duration of stun
- **Drag-to-remove skill/hook**: dragging a equipped item out of its slot returns the slot to dashed state, the item card floats back to the available list with a 0.3s ease-out animation

---

### Journey: Priya, 28, Mobile Gamer / Auto-Chess Player

**Context:** Mission 6 — first Command agent mission. Priya plays TFT at Diamond rank. She understands economy and bench management intuitively. She's comfortable with the idea that not spending is sometimes optimal. But she's never seen it applied to unit configuration — in TFT, the units come pre-built; you just position them.

**Minute 0:00 — The Command Blueprint**

Priya opens the Command agent blueprint. 14-slot context window. 6 hook slots. 3 skill slots. This is the biggest blueprint she's seen. Her TFT instinct kicks in: this is the 5-cost legendary unit. It should be loaded.

She starts filling. Skill 1: Reassign (change subordinate skills mid-battle). Skill 2: Reroute (change subordinate hooks mid-battle). Skill 3: Prioritize (reorder subordinate rules mid-battle). All three skill slots full. She moves to hooks. Hook 1: listen on "recon-net." Hook 2: listen on "alert-channel." Hook 3: listen on "status-report." She's filling fast. Hook 4: broadcast on "command-orders." Hook 5: broadcast on "emergency-override." She pauses at hook 6.

The emissions bar is blazing. Five segments filled, glowing deep amber. One more hook and it'll hit red.

**Minute 1:30 — The Economy Instinct**

Priya thinks about TFT. In TFT, putting your 5-cost carry on the frontline gets it killed by assassins. You position it in the back corner. The Command unit is already stationary (speed: Static). It can't hide by positioning. The only way to reduce its detection profile is... emissions.

She looks at hook slot 6. Dashed outline, pulsing gently. She has one more hook available: "listen on damage-report." Useful information. But is it worth the emissions?

She right-clicks. Locks it empty. Teal line. The emissions bar drops one notch — still amber, but no longer threatening red. She considers further. Does she really need "emergency-override"? Her Command unit has Reassign and Reroute — it can already change subordinate behavior through regular channels. The override is redundant if her base architecture works.

She unlocks hook 5. Removes the emergency-override hook. Locks it empty. Two teal lines now. The emissions bar drops to yellow-green. The Command blueprint looks intentional — 3 skills, 4 hooks, 2 locked-empty. Not maxed out. Not incomplete. Designed.

**Minute 3:00 — The Comparative Blueprint**

Priya creates a second Command blueprint variant: "Command-Loud." Every slot filled. 6 hooks, 3 skills, full rules. She puts it in the production queue behind her lean "Command-Quiet" variant. Her plan: build the quiet one first. If it survives, never build the loud one. If it dies, the loud one is her backup — more capable but more detectable.

This is pure TFT thinking: pivot planning. Have a backup comp. Don't commit everything to one strategy.

**Minute 5:00 — The Sealed Watch**

EXECUTE. Command-Quiet spawns at tick 10 from the factory. It sits in the back line, listening on 4 channels, issuing reassignments through "command-orders." Enemy units sweep the board. A detection sweep passes over Command-Quiet — its emission profile is below the detection threshold. The sweep misses it.

Tick 18: an enemy Specialist runs a second sweep with higher sensitivity. It detects Command-Quiet, but the lean emissions profile means the detection was late — 8 ticks later than it would have been at full load. Those 8 ticks were enough for Command-Quiet to reroute two Scouts and reassign a Striker to intercept. The Specialist is eliminated before it can act on the detection.

Priya whispers: "Econ diff." The same phrase she uses in TFT when her patience with gold pays off.

**Minute 7:00 — The Inspector Efficiency Comparison**

In the Inspector, Priya discovers she can compare blueprints side by side. She looks at her hypothetical Command-Loud profile (the unbuilt backup) vs. Command-Quiet's actual performance:

| Metric | Command-Quiet | Command-Loud (projected) |
|--------|---------------|--------------------------|
| Hooks Active | 4/6 | 6/6 |
| Emissions Level | Medium | Critical |
| Detection Tick | T18 | T10 (projected) |
| Orders Issued | 12 | 14 (projected) |
| Survival | Alive at T30 | Destroyed T14 (projected) |

The 2 extra orders from the loud variant don't matter if the unit dies 16 ticks earlier. Less was more. Priya locks the insight: in Robot Uprising, empty slots are compound interest. They pay off in survival time, which pays off in total orders issued, which pays off in battle outcome.

**UI Annotations:**
- **Blueprint comparison panel**: side-by-side columns in Inspector, projected values shown in italic with "(projected)" suffix, survival row highlighted green for alive / red for destroyed
- **Emissions detection threshold**: shown on the sealed watch board as a faint expanding circle around enemy Specialists during detection sweeps — units below threshold are not highlighted, units above threshold flash with a red ping
- **Production queue backup blueprint**: shown in conveyor belt with a dimmer icon and a small "B" badge, indicating it's queued but may not be built

---

### Journey: Tomasz, 42, Software Architect (Zachtronics Veteran)

**Context:** Mission 8 — full factory vs. factory. Tomasz has completed every Zachtronics game. He chases optimal solutions. He's already beaten missions 1-7 with maximal configurations, but now he's replaying to optimize. He wants the leanest possible blueprints that still win.

**Minute 0:00 — The Optimization Pass**

Tomasz opens his winning Mission 8 blueprint set. Three blueprints: Scout (2 skills, 2 hooks), Striker (2 skills, 2 hooks), Relay (3 skills, 4 hooks). He won. But the Inspector showed his Relay was stunned twice and his Scout was detected on tick 6. He wants to do better.

He opens the Scout blueprint. Stares at it. Patrol is essential — the Scout needs to move. Evade? He checks the replay. His Scout used Evade once in 30 ticks. One evasion. It consumed a skill slot, generated a rule evaluation every tick ("should I evade?"), and contributed context entries when evasion opportunities were detected. All for one use.

He removes Evade. The skill slot returns to dashed gray. He locks it empty. The blueprint now has 1 skill, 2 hooks. The emissions bar drops. The context pressure drops — one fewer skill generating observations means ~1 fewer context entry per tick.

**Minute 2:00 — The Minimal Relay**

He moves to the Relay. 3 skills: Compress, Filter, Amplify. 4 hooks: listen-recon, listen-alert, broadcast-processed, broadcast-priority. He asks: "What's the minimum viable Relay?"

Compress is essential — it reduces signal size so downstream units don't overload. Filter is essential — it drops noise. Amplify? He checks the replay. Amplify boosted signal strength, which increased range. But his Relay is positioned centrally — everything is already in range. Amplify did nothing.

He removes Amplify. Locks the skill slot empty. Then he looks at hooks. Listen-alert: his Scouts rarely send alerts because he built them to evade, not report damage. The alert channel had 2 messages in 30 ticks. Two messages occupying a hook slot that generates emissions every tick.

He removes listen-alert. Locks it empty. The Relay is now: 2 skills, 3 hooks, 1 locked-empty skill slot, 1 locked-empty hook slot. Emissions drop from HIGH to MEDIUM.

**Minute 4:00 — The Histogram Fantasy**

Tomasz wishes for a Zachtronics-style histogram. After completing the mission, he wants to see: "Your Scout used 3 of 6 possible slots. Here's how other players configured their Scouts for this mission." A distribution curve showing slot utilization across all players, with his lean build sitting in the left tail — the efficient minority.

He doesn't get this (it doesn't exist yet), but the Inspector's Blueprint Efficiency Analysis gives him numbers he can optimize against. He sets personal targets: zero context overloads, zero unnecessary detections, maximum tick survival. Each locked-empty slot is a variable he's eliminated from the system. Fewer variables, cleaner behavior, easier debugging.

**Minute 6:00 — The Minimal Victory**

He runs Mission 8 with stripped-down blueprints. His Scout survives 28 ticks instead of 22. His Relay is never stunned. His Striker receives cleaner signals (compressed, filtered, no amplification noise) and eliminates enemies with better precision. He wins with a lower unit count and fewer resources spent.

The Inspector summary shows: 4 locked-empty slots across 3 blueprints. Zero context overloads. Zero early detections. Tomasz screenshots it. This is his Opus Magnum GIF — the elegant, minimal solution that outperforms the brute-force approach.

**UI Annotations:**
- **Blueprint Efficiency Analysis summary**: appears at end of Inspector debrief, aggregates across all blueprints, shows total locked-empty slots as a positive metric (not a deficit)
- **Per-skill usage counter**: shown in Inspector next to each equipped skill, format "Used: 1/30 ticks" — low-usage skills highlighted with amber to suggest removal
- **Historical comparison**: if player has completed mission before, shows delta arrows (green down for fewer overloads, green down for fewer detections, green up for longer survival)

---

## Strengths and Weaknesses

### Strengths

- **Teaches a real engineering skill.** In actual AI agent design, over-instrumented agents that listen to everything and process every signal perform worse than focused agents with clear roles. The skip-as-power principle is directly transferable.
- **Creates a mastery curve without explicit instruction.** Like Slay the Spire's skip button, the lesson emerges from play. The game doesn't lecture — it lets consequences teach.
- **Rewards replaying missions.** The optimization loop (win with max slots → strip to min slots → win cleaner) adds replayability without new content.
- **Differentiates player skill visibly.** Two players can beat the same mission, but the one with 4 locked-empty slots across their blueprints is demonstrably more skilled. The blueprints themselves become a skill artifact.

### Weaknesses

- **Risk of "empty slot meta."** If leaving slots empty is always optimal, the hard slot limits lose meaning — you'd never fill them all. The emissions/detection system must be tuned so that SOME missions punish empty slots (e.g., missions where you need maximum firepower or maximum communication bandwidth).
- **New player confusion.** The dashed-to-teal visual transition requires learning. If a player doesn't discover "Lock Empty," they might think empty slots are just unfinished blueprints.
- **Onboarding friction.** Teaching "fill all slots" in missions 1-4 and then teaching "actually, don't fill all slots" in missions 5+ risks whiplash. The transition must feel like growth, not contradiction.

## Interaction Effects

- **Emissions system (core mechanic):** The skip-as-power principle is mechanically grounded in emissions. Without emissions as a cost of slot utilization, empty slots would be pure waste. Emissions make emptiness strategic.
- **Context overload (core mechanic):** Every equipped skill and hook generates context entries. Fewer equipped items = lower context pressure = fewer overloads. This is the second mechanical pillar supporting skip-as-power.
- **Inspector (UI/UX):** The debrief must surface WHY empty slots helped. Per-skill usage counters, context overload counts, and detection timing make the abstract principle concrete and debuggable.
- **Tutorial arc (onboarding):** Missions 1-4 teach filling slots. Mission 5 should be the "Chapel moment" — the first time a player discovers that removing something makes them stronger. This is the same arc as Slay the Spire Act 1 (take everything) → Act 3 (skip everything).
- **Campaign difficulty (campaign):** Later missions should alternate between "lean is optimal" (stealth missions, detection-heavy enemies) and "loaded is optimal" (swarm missions, overwhelming firepower needed). This prevents the skip-as-power principle from collapsing into a single dominant strategy.

## Comparable Games Summary

| Game | Restraint Mechanic | Teaching Method | Robot Uprising Parallel |
|------|-------------------|-----------------|------------------------|
| Slay the Spire | Skip card rewards, remove cards | Consequence (bloated decks fail at bosses) | Empty slots reduce emissions/overload |
| Dominion | Chapel trashes cards | Immediate feedback (thin deck draws better) | "Lock Empty" as an active choice |
| Zachtronics | Fewer instructions = better histogram | Social comparison (global histogram) | Blueprint efficiency metrics in Inspector |
| TFT | Save gold for interest | Economic math (10:1 interest ratio) | Emissions as ongoing cost of filled slots |
| Into the Breach | Don't move a mech | Undo button enables exploration | Inspector replay enables "what if I removed this?" |

## Sensory Description

**The Lock Empty interaction:** Right-click an empty dashed slot. A minimal dropdown appears — dark background, two options in clean sans-serif: "Lock Empty" with a small teal lock icon, "Cancel" in gray. Click Lock Empty. The dashed outline doesn't just disappear — it contracts. The dashes pull inward like a closing iris, shrinking to a single horizontal line. The line shifts color from gray to teal over 0.3 seconds. A tiny lock icon (6x6px) fades in at the left end of the line. The emissions bar on the blueprint's right edge smoothly shrinks by one segment with a soft downward slide animation. A small floating text — "-1 EM" in teal — drifts upward and fades. The whole interaction takes under a second. It feels like closing a valve. Precise. Intentional. Clean.

**The full-vs-lean blueprint comparison:** Place two blueprint cards side by side. The loaded blueprint is visually dense — every slot occupied, solid borders, icons packed tight, emissions bar glowing amber. The lean blueprint breathes — teal lock lines where slots are empty create horizontal whitespace, the emissions bar sits low and cool cyan, the overall card has visual room. The loaded blueprint looks anxious. The lean blueprint looks confident. Players should be able to feel the difference before reading any metrics.

**The overload stun during sealed watch:** A Scout with all slots filled detects three enemies at once. Its context bar — a row of tiny colored pips at the bottom of its tile — fills completely. The sixth pip lights up. Then a seventh observation tries to enter. The unit's tile flashes amber. The sprite jitters — a 2-pixel random offset each frame, like a machine short-circuiting. Tiny white spark particles spray from the unit's edges. For one full tick (1 second at default speed), the unit does nothing. The context bar compacts — two oldest entries evict, their pips dim and slide off. The unit recovers. But the enemy Striker was 2 tiles away, and now it's 1 tile away, and the Scout has no actions left this tick. Next tick: elimination. The sound: a crackling electrical buzz during stun, then silence, then the sharp percussive snap of one-shot-one-kill.

## The TikTok Clip

Fifteen seconds. A split screen. Left side: a blueprint with every slot filled, emissions bar blazing red, labeled "MAXED." Right side: the same blueprint with half the slots locked empty, emissions bar cool teal, labeled "OPTIMIZED." Cut to sealed watch. The maxed unit gets detected on tick 3, swarmed, destroyed. The optimized unit glides through undetected, feeds perfect intel, wins the mission. Text overlay: "In Robot Uprising, less is more." Cut to the player locking an empty slot — the satisfying iris-close animation, the teal lock icon, the "-1 EM" float. End card: "Skip is the best power."

---

*Sources:*
- [Slay the Spire deck thinning discussion](https://steamcommunity.com/app/646570/discussions/0/1697168437880652849/)
- [Slay the Spire thin vs thick deck](https://steamcommunity.com/app/646570/discussions/0/4522262088834738768/)
- [Should I ever not take a card?](https://steamcommunity.com/app/646570/discussions/0/1499000547494400245/)
- [Dominion Chapel analysis](https://dominionstrategy.com/2010/11/17/dominion-chapel/)
- [Dominion Strategy Guide](https://www.meeplemountain.com/articles/dominion-strategy-guide/)
- [TFT Economy Guide](https://mobalytics.gg/blog/tft/how-to-manage-your-economy-in-teamfight-tactics-three-strategies/)
- [Slay the Spire 2 deck building guide](https://casualgameguides.com/walkthroughs/slay-the-spire-2/consistent-deck-and-skip-cards/)
- [Zachtronics SpaceChem postmortem](https://www.gamedeveloper.com/design/postmortem-zachtronics-industries-i-spacechem-i-)
- [Into the Breach strategy guide](https://videochums.com/article/into-the-breach-strategy-guide)
