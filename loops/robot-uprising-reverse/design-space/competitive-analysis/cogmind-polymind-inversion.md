# 1.20e — The Polymind Inversion as Robot Uprising Variant Mode

**Aspect:** 1.20e — A variant where the player directly controls one unit while the rest run autonomously — the "field commander" mode testing whether blueprints work without intervention
**Category:** Competitive Analysis / Variant Mode Design
**Dependencies:** 1.20 (Cogmind), 1.20c (Inventory as Build), 1.06 (Gladiabots), 1.06a (Debugging Sub-AI), 2.01 (Fixed-Slot Buffer), 3.01 (Unit Types), 5.01 (Factory/Blueprints), 4.04b (Two-Act Debrief)

---

## The Inversion

Cogmind's Polymind mode inverts the game's fundamental relationship between player and machine. In standard Cogmind, you ARE the robot — one body, one inventory, one persistent identity moving through floors. In Polymind, you are a disembodied intelligence possessing other robots, hopping between hosts, never building, only inhabiting. The player's identity detaches from any single chassis and becomes the act of choosing which chassis to occupy next.

Robot Uprising's core loop already has the player one level removed: you design attention systems, hit execute, and watch. You never touch a unit during combat. Field Commander mode inverts this by pulling the player DOWN one abstraction layer — you take direct control of one unit on the 8x8 grid while the rest of your squad runs on the blueprints you designed. Where Cogmind's Polymind lifts the player OUT of a body, Field Commander mode shoves the player INTO one.

The inversion is precise. Normal Robot Uprising: design all five, control none. Field Commander mode: design four, control one. The question the mode asks is not "can you play a tactical game?" — Into the Breach already answers that. The question is: **do your blueprints actually work when you are not watching?** You are too busy piloting your chosen unit to babysit the others. Your peripheral vision catches your Relay doing something unexpected in column 6. You cannot pause. You cannot intervene. You designed those rules. Now live with them.

This is the Polymind inversion applied to Robot Uprising's specific design thesis. Cogmind's Polymind asks "what if your identity was not your body?" Robot Uprising's Field Commander asks "what if your trust in your own designs was tested by distraction?"

---

## Core Mechanics

### Unit Selection

Before deployment, the player chooses which of their five units to pilot. The remaining four run entirely on their blueprints. The choice matters enormously:

- **Piloting the Scout** gives superior information (you see what it sees, control where it looks) but low combat impact. You become the team's eyes while trusting the Striker and Specialist to fight autonomously.
- **Piloting the Striker** gives direct kill power but sacrifices scouting intelligence. Your autonomous Scout feeds data into buffers you cannot read in real-time. You hope its attention config catches what matters.
- **Piloting the Command unit** is the "officer on the ground" fantasy. You issue signals manually — but you must physically be in relay range, and your autonomous Relay must be positioned correctly to propagate them. Your signal architecture is tested under pressure you designed for but never experienced from inside.

### Control Model

The piloted unit uses discrete, tick-based input. Each tick, the player chooses one action: move to an adjacent cell, attack a target in range, send a signal, or wait. This matches the game's existing tick resolution — no real-time reflexes, pure tactical decision-making per tick. The piloted unit ignores its blueprint entirely. Its buffer still fills with observations (the player needs to see them), but rule evaluation is replaced by player input.

### The Attention Split

The 8x8 grid is rendered at full fidelity, but the player's piloted unit has a visibility highlight — a soft halo showing the cells it can observe. The four autonomous units have smaller status pips: green (acting on plan), amber (evicting data / buffer pressure), red (stunned or taking fire). The player must parse these pips in peripheral vision while making their own tactical decisions.

This is the mode's central mechanic: **divided attention as a forcing function for blueprint confidence.** If you trust your Scout's attention config, the amber pip on it barely registers. If you do not trust it, every amber flash pulls your eye away from your own tactical situation. The mode turns blueprint quality into a felt experience rather than an observed one.

### Victory and Defeat

Same win/loss conditions as standard mode. The piloted unit dying does NOT end the match — it removes the player's direct agency and returns the match to full-autonomous for remaining ticks. This creates a late-game emotional arc: the player who dies at tick 40 of 60 must watch their squad finish (or fail) without them, experiencing the standard Robot Uprising "sealed watch" feeling but with the added weight of knowing they were just there, on the ground, three ticks ago.

---

## Player Journeys

### Journey 1: The Overconfident Striker Pilot

**Context:** Marcus has played 30 hours of standard Robot Uprising. His configs are decent — 60% win rate in PvE wave missions. He enters Field Commander mode for the first time and selects his Striker, because he wants to "carry the team."

**TICK 0 — Deployment**
The 8x8 grid fades in. Five blue units materialize on the left edge. Marcus's Striker has a white diamond outline — the pilot indicator. The other four units have small circular pips above them: Scout (green), Relay (green), Specialist (green), Command (green). A soft mechanical hum plays as autonomous units begin their first tick of rule evaluation. The camera is centered on the Striker. The grid cells in the Striker's weapon range glow with a faint red wash — the targeting overlay.

Marcus feels powerful. He has a gun.

**TICK 3 — First Contact**
An enemy unit appears at E6. Marcus's autonomous Scout spots it — the Scout's pip flashes white briefly (new observation acquired), then returns to green. The Scout's buffer now contains {enemy_at_E6}. Marcus does not know this. He is looking at cell D4, where he is moving his Striker to get a flanking angle. He sees the Scout's pip go white and back to green. He assumes things are fine.

**TICK 5 — The Gap**
Marcus's Striker reaches D4 and fires at the enemy at E6. One-shot kill. Satisfying. A sharp metallic crack, the enemy unit's sprite fragmenting into grey debris particles that scatter across E6 and F6. But while Marcus was lining up this shot, a second enemy spawned at B7. His autonomous Scout observed it — pip flashed white — but the Scout's attention config prioritizes the nearest enemy. The Scout is at C2. The enemy at B7 is closer than the now-dead enemy at E6 was. The Scout has rotated to face B7 and is retreating south per its "evade when outnumbered" rule. This is correct behavior. But Marcus's Relay is at C5, and the Scout's retreat path moves it out of relay range.

Marcus does not notice any of this. His Striker just got a kill. He is moving toward E7 to press the advantage.

**TICK 8 — Cascade**
The Scout is now at C1, out of relay range. Its buffer contains {enemy_at_B7, no_relay_signal}, but the "no relay signal" observation means its fallback behavior activates: patrol mode. It begins moving east. Marcus's Relay, still at C5, has lost the Scout from its relay network. The Relay's pip turns amber — it is receiving observations it cannot propagate because the intended recipient (the Scout) is out of range. Marcus sees the amber pip from the corner of his eye. He is at E7. He does not know why the Relay is amber. He does not have time to figure it out — a third enemy has appeared at F8.

**TICK 12 — Realization**
Marcus kills the F8 enemy but takes a hit. His Striker's health bar (a thin bar beneath the white diamond) drops by a third. He glances at the team. Scout pip: green (patrolling happily, oblivious). Relay pip: amber. Specialist pip: green (waiting for a signal that will never come, because the Relay chain is broken). Command pip: green (broadcasting to nobody in range).

The autonomous squad is technically functioning. Every unit is following its rules. But the emergent behavior is a team that has fragmented into isolated individuals. Marcus realizes with a sinking feeling that his Relay's range was a bottleneck he never tested. In standard mode, the Relay being slightly out of position was a minor inefficiency — the system still worked well enough. Here, with Marcus's attention consumed by piloting the Striker, "well enough" has become "silently broken."

**POST-MATCH DEBRIEF**
Marcus lost. His Striker died at tick 18. The remaining squad, disconnected and running on fallback behaviors, was picked apart. The debrief timeline shows the moment the Scout left relay range at tick 7 with a yellow marker. Marcus stares at it. He goes back to the workbench and adds a "maintain relay range" rule to the Scout's config. He has learned something that 30 hours of standard play never taught him.

---

### Journey 2: The Scout Pilot Who Becomes the Eyes

**Context:** Priya is a blueprint-focused player. Her configs are elegant — tight attention rules, well-tuned eviction policies. She enters Field Commander mode and chooses the Scout, reasoning that information is the bottleneck and she can solve it with human perception.

**TICK 0 — Deployment**
Priya's Scout has the white diamond. It is small and fast — 2 cells of movement per tick instead of the Striker's 1. The visibility halo around it is wide: a 3-cell radius soft blue glow showing everything the Scout can observe. The autonomous Striker, Relay, Specialist, and Command pips are all green. Priya moves the Scout northeast immediately, toward the center of the grid. She wants vision.

**TICK 2 — Human Advantage**
Priya spots two enemies at G3 and G5 before any autonomous unit could have detected them. She manually sends a signal: {enemy_positions: [G3, G5]}. The signal propagates through the Relay to the Striker and Specialist. Their pips flash white (new data received). The Striker begins moving toward G3. The Specialist begins moving toward G5. The Command unit broadcasts a coordination signal.

Priya feels like an intelligence officer feeding targeting data to a well-oiled machine. The autonomous units are performing exactly as designed. Her blueprints are good. She just made them better by providing earlier, more accurate data.

**TICK 6 — The Temptation**
The Striker engages G3. The Specialist engages G5. Both fights are going well — green pips, no amber. But Priya sees something from her elevated scouting position: an enemy flanking through H2, heading toward the Relay at D4. None of the autonomous units have detected this yet. Priya could send a signal warning about H2. Or she could move her Scout to intercept — Scouts have no weapons, but they can occupy a cell and block movement.

She sends the signal. The Relay receives it, propagates it. The Command unit adjusts its broadcast. But the Striker is mid-combat at G3 and its rules prioritize "finish current engagement" over "respond to new threat signal." The Specialist is similarly engaged. Nobody is moving to protect the Relay.

**TICK 9 — The Agonizing Watch**
Priya is three cells away from the Relay. The flanking enemy is two cells away. She cannot reach it in time. She watches, from her Scout's perspective, as the enemy closes on the Relay. The Relay's pip turns amber — it has detected the threat in its own buffer now. Its rules say "move away from threats" but its position at D4 means moving away puts it further from the Striker and Specialist. The Relay retreats to C3. The enemy follows.

Priya is experiencing the core Robot Uprising emotion — watching your designs play out — but from inside the battlefield. She is not in the sealed-watch chair. She is on the ground, two cells away, unable to intervene because her unit type has no combat capability. The signal she sent was correct. The blueprints processed it correctly. The Striker's priority hierarchy made a reasonable choice. And the Relay is still going to die.

**TICK 11 — Aftermath**
The Relay is destroyed. A brief burst of orange sparks, the unit's sprite collapsing inward like a crumpled signal tower. The relay network severs. Priya's remaining signals go nowhere. The Striker and Specialist finish their fights but are now isolated — green pips, but operating on stale buffer data with no fresh signals incoming.

Priya wins the match anyway — her blueprints' fallback behaviors are robust enough to handle isolation. But she now understands viscerally that her Relay has no self-preservation rules. She had never noticed because in standard mode, the Relay dying was just a stat in the debrief. Here, she watched it happen from thirty feet away, helpless. She adds a "flee when health below 50% and threat within 2 cells" rule to the Relay's config.

---

### Journey 3: The Command Unit Conductor

**Context:** Wei is an experienced player who has cleared all PvE content. He enters Field Commander mode and chooses the Command unit — the unit that broadcasts coordination signals to the whole team. His theory: if he can be a better broadcaster than his config, the whole squad benefits.

**TICK 0 — Deployment**
Wei's Command unit has the white diamond, positioned at center-grid B4. The Command unit does not move fast and has no weapons. Its power is the signal it broadcasts each tick — a coordination directive that every unit within range receives and factors into its rule evaluation. In standard mode, this signal is generated by the Command unit's blueprint rules. Now Wei types it himself.

The interface shift is significant. A small signal-composition panel appears at the bottom of the screen — a text field showing the current broadcast payload. Wei can modify it each tick. The panel has a faint cyan border matching the Command unit's color coding. The autonomous units' pips have a second indicator: a small antenna icon that lights up when they are within broadcast range.

**TICK 3 — Orchestration**
Wei sees the full board from his central position. His Scout (autonomous, green pip, antenna lit) has detected an enemy at F6. The Scout's observation propagated through the Relay to Wei's Command unit buffer. Wei reads it in his signal-composition panel: `{scout_report: enemy_at_F6, confidence: high}`. He composes a broadcast: `{priority_target: F6, formation: pincer, striker_approach: east, specialist_approach: south}`.

The broadcast propagates. The Striker and Specialist both receive it. Their rule configs have a "respond to command broadcast" hook that is normally evaluated against the autonomous Command unit's formulaic broadcasts. Wei's hand-crafted signal is richer — it specifies approach vectors. But here is the catch: the Striker's config does not have a rule for `striker_approach: east`. That field is not in its attention schema. The Striker ignores the approach vector and just processes `priority_target: F6`, moving directly toward it.

Wei's ambitious orchestration degrades to the same behavior his autonomous Command config would have produced. The blueprints do not understand signals they were not designed to parse.

**TICK 7 — Learning the Language**
Wei realizes he must speak the language his blueprints already understand. He stops trying to compose novel signals and instead focuses on TIMING — sending the standard coordination signal earlier than the autonomous Command would have, because he can read the board faster than the buffer-mediated perception chain. He sends `{priority_target: G2}` two ticks before the autonomous Command would have generated it. The Striker redirects earlier. The engagement starts with positional advantage.

This is the mode's deepest insight for experienced players: **you cannot be smarter than your blueprints' vocabulary. You can only be faster.** The human advantage is not richer signals — it is earlier signals. The autonomous system is not limited by intelligence. It is limited by latency. The buffer-mediated perception chain (observe, propagate, evaluate, act) takes ticks. The human eye takes one.

**TICK 14 — The Ego Death**
Wei's Command unit is in the back line, safe, broadcasting. His squad is winning. And Wei realizes, with a mix of pride and deflation, that his manual broadcasts are only marginally better than what his autonomous Command config produces. His config's timing is 1-2 ticks slower, but its signal content is identical to what Wei composes under pressure. His blueprints are... good. They do not need him.

He finishes the match with a win. The debrief shows his "manual signal advantage" metric: +2 ticks average signal lead over projected autonomous timing. A modest improvement. Wei exits Field Commander mode with a new understanding: his Command config is his best work, and Field Commander mode proved it by making his own presence nearly redundant.

---

## Strengths

### 1. Blueprint Confidence as Felt Experience

Standard Robot Uprising shows you whether your blueprints work through outcomes — win/loss, debrief stats, timeline analysis. Field Commander mode makes blueprint quality into something you FEEL during play. The amber pip you see from the corner of your eye while dodging an enemy. The moment your Relay dies and you realize you never gave it self-preservation rules. The pride of watching your Striker execute a perfect engagement while you handle scouting. These are emotional data points that debrief numbers cannot provide.

### 2. Teaches by Subtraction

The mode isolates what the player's blueprints handle well and what they handle poorly by removing the player's ability to compensate. In standard mode, the player never knows whether a win came from good design or from lucky execution timing. In Field Commander mode, the four autonomous units are a pure test of design quality — and the one piloted unit reveals what the player believes needs human intervention. The choice of which unit to pilot is itself diagnostic: "I pilot the Scout because I don't trust my scouting config."

### 3. Replayability Through Unit Selection

Five unit types means five fundamentally different Field Commander experiences per mission. Piloting the Scout is an information game. Piloting the Striker is a combat game. Piloting the Command unit is a coordination game. The same mission, the same blueprints, played five times with five different piloted units, teaches five different lessons about the same config. This is multiplicative content from zero new mission design.

---

## Weaknesses

### 1. Divided Attention May Produce Frustration, Not Learning

The mode asks the player to make tactical decisions for their piloted unit while monitoring four autonomous units' status pips. Some players will experience this as productive tension (the designed experience). Others will experience it as being punished for not having eyes on everything — especially when an autonomous unit fails due to a blueprint gap the player could not have noticed during combat. The failure mode is "I lost because I was busy" rather than "I lost because my config is bad," and the player may blame the mode rather than their design.

### 2. Tick-Based Direct Control Is an Acquired Taste

The piloted unit uses discrete tick input. Players accustomed to real-time tactical games (XCOM's free-aim, Into the Breach's drag-and-drop) may find tick-by-tick movement clunky. The mode must be careful not to make the direct-control experience feel like a downgrade from the standard sealed-watch, where at least the entire squad moves fluidly.

### 3. Balance Tension with Standard Mode

If Field Commander mode is significantly easier than standard mode (because human piloting compensates for blueprint weaknesses), it undermines the design thesis — players will use it as a crutch instead of fixing configs. If it is significantly harder (because divided attention degrades both piloting and monitoring), players will avoid it. The mode must land in a narrow band where it is roughly equivalent in difficulty but different in what it teaches.

---

## Interaction Effects

### With the Sealed Watch (4.04b)
Field Commander mode creates a "semi-sealed" experience. Four units are sealed (autonomous). One is open (player-controlled). When the piloted unit dies, the match transitions to a full sealed watch for remaining ticks. This is a natural two-act structure: Act 1 is the field commander experience. Act 2 is the standard sealed watch, now charged with the emotional context of "I was just there." The debrief (Act 3) has richer data because it includes both autonomous performance metrics and the player's piloting decisions for comparison.

### With the Debugging Sub-AI (1.06a)
The autonomous units' status pips are a simplified version of the always-on diagnostics sidebar. In standard mode, the sidebar shows buffer state for all units simultaneously. In Field Commander mode, the sidebar contracts to show full detail only for the piloted unit's buffer, with the other four showing pip-level summaries. This forces the player to trust the pips — or to glance at the sidebar and lose tactical focus. A late-game unlock could expand the sidebar to show full autonomous unit buffers, but this should be gated behind proving you can handle the mode without it.

### With Gauntlet PvP (1.06c)
Field Commander mode in async PvP creates an asymmetric format: one player's squad is fully autonomous, the other has a field commander. Or both have field commanders but piloting different unit types. The matchmaking implications are significant — a human-piloted Striker vs. an autonomous Striker is not a fair comparison, and the mode would need to either be PvE-only or have its own Gauntlet bracket with separate Elo.

### With the Factory/Blueprint System (5.01)
The mode surfaces a specific blueprint failure class: "works in standard but fails in Field Commander." If a config relies on all five units operating in tight coordination, removing one from autonomous control and replacing it with human input may break the coordination timing. This is a feature, not a bug — it reveals configs that are brittle to timing variation. But it means some players will need Field Commander-specific blueprint variants, which increases workbench complexity.

### With Signal Architecture
When the player pilots the Command unit and manually composes signals, the mode becomes a live test of signal schema design. Signals the player wants to send but cannot — because the listening units have no rules for those fields — surface schema gaps that standard play never reveals. This is the richest diagnostic interaction: "I want to tell my Striker to approach from the east, but my Striker's config does not understand 'approach direction.'" The mode becomes a signal vocabulary audit.

---

## Comparable Games

### Cogmind — Polymind Mode
The direct ancestor of this design idea. Polymind inverts Cogmind by making the player a disembodied mind hopping between robot hosts. The key mechanical details: possession costs "Protomatter" (a mode-specific resource), allied hosts cost 66% less than hostile ones, each host class has fixed capabilities the player cannot modify, and stealth is primary (44.4% of Polymind runs achieved Pacifist bonuses vs. 4.5% in standard Cogmind). The mode required 5,000+ lines of new code and over 100 hours of development. The deepest lesson from Polymind is that **inverting the player's relationship to the game's core noun (your body, your blueprints) produces a fundamentally different game that still teaches the original game's lessons.** Polymind players returned to standard Cogmind with better understanding of enemy robot capabilities because they had inhabited those robots. Field Commander players should return to standard Robot Uprising with better understanding of their own blueprints because they experienced their consequences from the inside.

Source: [Polymind Part 1: Architecture, Features, and Balance](https://www.gridsagegames.com/blog/2023/01/special-mode-design-polymind-part-1-architecture-features-and-balance/), [Polymind Part 2: Players, Stats, and the Future](https://www.gridsagegames.com/blog/2023/02/special-mode-design-polymind-part-2-players-stats-and-the-future/)

### Dungeon Keeper — Possess Creature
Bullfrog's 1997 god game lets you possess any creature in your dungeon, switching from top-down management to first-person view. Creatures work faster while possessed. The mode is a toy — a fun diversion, not a core loop — but it established the "drop into your own system" pattern. The key difference: in Dungeon Keeper, the rest of your dungeon runs fine without you. Possessing a creature is tourism, not testing. Field Commander mode must be testing, not tourism. The Dungeon Keeper lesson: possession as spectacle is insufficient; there must be a diagnostic purpose.

### Natural Selection 2 — Commander Mode
The FPS/RTS hybrid where one player per team plays top-down RTS commander while teammates play first-person shooter. The asymmetry is multiplayer — different human players in different roles — rather than single-player asymmetry between human and AI. But it demonstrates that hybrid control (one entity directed, others autonomous-ish) produces emergent coordination failures that are productive rather than frustrating when the feedback loop is tight. The lesson for Field Commander mode: the piloted unit must have tight feedback (immediate tactical consequences) even when the autonomous squad's feedback is delayed (debrief stats).

### Gladiabots — Tournament Replay vs. Manual Play
Gladiabots does not have a field commander mode, but the community has long requested one — the ability to take manual control of one bot during a tournament match to test configs. The developer declined, correctly reasoning that it would undermine the "your AI must stand alone" thesis. Robot Uprising's Field Commander mode can afford this because it is a variant, not the competitive mode. The Gladiabots lesson: keep Field Commander out of ranked Gauntlet.

---

## Sensory Design

### Visual Language

The piloted unit's white diamond outline pulses softly on each tick — a heartbeat rhythm, 60bpm, visible but not distracting. The pulse is the player's presence made visible. Autonomous units have no pulse; they are steady, mechanical, inhuman.

The four autonomous units' pips use traffic-light coding: **green** (muted forest, #4a7c59) for nominal operation, **amber** (#d4a843) for buffer pressure or suboptimal behavior, **red** (#c4443a) for taking damage or stunned. The pips are small — 6x6 pixels at 1080p — forcing the player to notice them in peripheral vision rather than stare at them directly. This is intentional: the mode rewards peripheral awareness, not focused monitoring.

When the piloted unit dies, the white diamond outline shatters — six triangular fragments spinning outward with a 400ms decay animation, fading from white to grey. The camera zooms out by 20% over 800ms, widening the view from "field commander" to "observer." The transition is the player being pulled out of their body and back to the command chair.

### Audio Design

The piloted unit's actions have full audio: footstep clinks on grid movement, weapon discharge cracks, signal transmission chimes (a two-note ascending tone for successful send, a flat buzz for out-of-range). Autonomous units have attenuated audio — their combat sounds are at 30% volume, spatially positioned on the grid. The player hears distant fighting from the autonomous Striker's engagement as a muffled crackle in the direction of its grid position.

The critical audio cue: when an autonomous unit's pip transitions from green to amber, a soft discordant tone plays — a single plucked string, slightly out of tune, positioned spatially at the unit's grid location. The player hears where the problem is before they see it. This is the "something is wrong in sector 3" experience. When a pip goes red, the tone sharpens to a metallic ping — urgent, short, unmistakable.

When the piloted unit dies, all audio drops to 20% volume for 500ms (the "ears ringing" moment), then fades back to the standard sealed-watch audio mix where all units are equally audible. The audio transition mirrors the visual one: from embodied participant to detached observer.

### The Signal Composition Interface (Command Unit Only)

When piloting the Command unit, the signal panel at screen bottom has a dark background (#1a1d1f) with cyan text (#5cb8c4) matching the Command unit's color identity. The broadcast payload updates each tick with a soft typewriter-click sound per character. When the broadcast reaches allied units (their antenna icons light up), a faint harmonic chord plays — the sound of connection, of being heard. When a broadcast reaches no one (all allies out of range), the panel border briefly flashes from cyan to a dull grey, and a hollow reverb tone plays — the sound of a signal dying in empty space.

This audio-visual feedback for the signal system is the mode's most distinctive sensory element. It transforms the abstract "signal propagation" mechanic into something the player hears and feels: the warmth of a received broadcast, the emptiness of a signal that goes nowhere.
