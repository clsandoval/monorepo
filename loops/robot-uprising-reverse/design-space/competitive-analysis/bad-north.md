# Bad North — Competitive Analysis

**Aspect:** 1.23 — Bad North: minimalist RTS, positioning-only control, island defense
**Wave:** 1
**Date:** 2026-03-20

---

## Overview

Bad North is a minimalist real-time tactics roguelite developed by Plausible Concept (Oskar Stalberg and Richard Meredith) and published by Raw Fury, released August 2018 with a free "Jotunn Edition" update in November 2019. You defend procedurally generated islands from Viking invaders by positioning squad commanders — your soldiers fight autonomously once placed. Bad North sits precisely at the intersection of "positioning as only input" and "real-time execution you can only nudge," making it one of the most relevant reference points for Robot Uprising's sealed watch design.

**Developer:** Plausible Concept (3-person team). **Publisher:** Raw Fury. **Release:** August 2018. **Price:** $14.99. **Platforms:** PC, Switch, PS4, Xbox One, iOS, Android. **Steam Reviews:** 93% positive from ~5,200 reviews. **Estimated Steam owners:** 500K-1M. **Metacritic:** 73 (PC), 81 (Switch).

---

## Core Loop

### The 30-Second Loop (Island Defense Tick)
Vikings approach from the sea in longboats. You see them coming. You position your 1-4 squad commanders on the island's terrain features (cliffs, chokepoints, building rooftops). When Vikings land, your soldiers fight automatically. You reposition commanders to respond to new landing points. This is a real-time "nudge" loop — your primary input is where units stand, not how they fight.

### The 3-Minute Loop (Single Island)
Each island is a procedurally generated micro-map with 4-8 buildings (houses that generate gold if they survive). Multiple waves of Vikings land from different directions. You must defend all sides with limited squads. Victory = survive all waves. Gold earned funds upgrades between islands.

### The 10-Minute Loop (Island Chain)
After each island, you choose the next from a branching path (2-3 options). Some offer items, some offer new commander recruits, some are harder but more rewarding. This is the meta-strategic layer — the roguelike "route selection" that Slay the Spire popularized.

### The 45-Minute Loop (Full Campaign Run)
A complete run through the island chain takes 30-60 minutes. Permadeath applies: lost commanders are gone forever. If all commanders die, the run ends. Between islands, you upgrade commanders with one of three weapon types: swords (versatile), pikes (anti-charge, formation-dependent), and bows (ranged, vulnerable in melee).

---

## Information Management Mechanics

Bad North's information model is remarkably clean:

**Perfect Spatial Information.** You see the entire island at all times. No fog of war. Enemy boats are visible approaching from the sea with several seconds of warning. The question is never "what is happening?" but "where should I be?"

**Enemy Type Legibility.** Viking types are visually distinct: basic infantry, shielded infantry, archers, and brutes. Each requires different counter-positioning. Shield Vikings block frontal archer fire; brutes smash through pike formations. Reading the incoming wave composition and positioning accordingly is the core skill.

**Temporal Information Pressure.** Although you have perfect spatial information, the real-time execution creates information pressure: multiple landing points happen simultaneously, forcing you to triage. You can see everything but can't respond to everything. This is attention scarcity, not information scarcity — a crucial distinction from Robot Uprising's information scarcity model.

**The 90/10 Rule.** Oskar Stalberg described Bad North's design as "90% positioning, 10% abilities." The special abilities (shield wall for swords, brace for pikes, aimed volley for bows) exist to punctuate the positioning game, not replace it. This ratio is instructive: Robot Uprising's skill system should similarly be secondary to the positioning and configuration game.

**Key Insight for Robot Uprising:** Bad North proves that positioning-only control can create genuine strategic tension even in real-time. The sealed watch is a further abstraction — you can't even reposition during execution. But Bad North validates the core premise that "where units stand" is a rich enough decision space to carry an entire game.

---

## Complexity Ramp

Bad North has one of the most elegant complexity ramps in the tactics genre:

**Phase 1 (Islands 1-3): Single Squad.** One commander, one weapon type, basic Vikings. The game teaches positioning through a single unit on a small island. "Stand here, they die. Stand there, you die."

**Phase 2 (Islands 4-8): Multi-Squad Coordination.** Two or three commanders. Different weapon types create tactical roles (pikes hold chokepoints, archers on elevation, swords mobile response). The player learns that unit cooperation is more powerful than individual unit strength.

**Phase 3 (Islands 8-15): Triage Under Pressure.** Simultaneous landings on multiple sides of larger islands. Not enough squads to cover everything. The player must sacrifice buildings (income) to protect commanders (survival). This is the game's central tension: accept losses or risk everything.

**Phase 4 (Islands 15+): Permadeath Pressure.** Commander loss is permanent. Items (found on islands) provide power spikes but are lost with the commander. The player starts making conservative positioning choices — retreat becomes a strategic tool, not a failure state.

**Phase 5 (Jotunn Edition Hard Mode): Compositional Mastery.** Hard mode removes item replenishment and increases enemy variety. Players must develop refined positioning patterns for each island shape and enemy composition combination.

**The Minimalism Virtue.** Bad North's complexity ramp works because there are so few variables: 3 weapon types, 4 enemy types, procedural island shapes. The combinatorial space is manageable — a player can "see" the entire possibility space within 10 hours. Robot Uprising's 12 skills and rule system create a much larger space, but Bad North proves that a small, clean variable set produces more elegant gameplay than a large, muddy one.

---

## UI/UX

**The Isometric Miniature Aesthetic.** Bad North's visual design is its most celebrated feature. Tiny billboarded sprites on 3D procedural islands create a "diorama" feel — like playing with miniatures on a tabletop. The art style is simultaneously adorable and brutal (tiny soldiers die in sprays of red against pristine white snow). This tonal contrast is powerful.

**The One-Touch Control Scheme.** Select commander, tap destination. That's it. On mobile, this is a single touch-and-drag. On PC, click-click. The interaction model is so simple that the game works identically on every platform — a feat most strategy games fail at.

**The Camera.** Freely rotatable around the island. The isometric view means all terrain features are always visible. No "hidden" angles. This spatial legibility is critical: you never die because you couldn't see what was happening.

**The Minimal HUD.** Almost no on-screen UI during battle. Commander icons appear at the bottom. Incoming boats are visible on the water. Building status is shown through damage states (intact → damaged → destroyed → burning). The game communicates entirely through its visual simulation, not through numbers or icons.

**The Between-Island Screen.** Simple map showing branching island paths. Commander roster with upgrade options. Items shown as icons on commander cards. The entire metagame UI fits on a single screen — no tabs, no deep menus, no configuration complexity.

**Key UI Lesson:** Bad North's "everything visible, nothing hidden" approach is the purest expression of the Into the Breach UI philosophy applied to real-time tactics. Robot Uprising's workbench, by contrast, must manage much more information (rules, hooks, context config, skills). But Bad North proves that when you can minimize the variables, minimizing the UI follows naturally. The progressive workbench unlock (3.14) that starts simple and grows is directly inspired by this kind of minimalism.

---

## Replayability

Bad North's replayability is moderate, driven by:

1. **Procedural Islands.** Each run generates different island shapes and enemy compositions. No two runs are identical in geometry.
2. **Roguelike Permadeath.** Commander loss creates run-defining consequences. "My best pike commander died on island 12" creates narrative.
3. **Branching Island Paths.** Route selection creates strategic metagame decisions.
4. **Jotunn Edition Hard Mode.** Adds genuine difficulty for players who mastered normal mode.

**Replayability Ceiling.** Bad North's replayability is ultimately limited by its small variable space. After 20-30 hours, most players have seen every enemy type, every terrain feature, and every weapon upgrade. The procedural islands create geometric variety but not strategic variety. Community consensus is that the game is "a perfect 15-20 hour experience" — high praise for value, but a clear ceiling.

**Comparison to Robot Uprising:** Robot Uprising's 12 skills, rule system, hook architecture, and competitive multiplayer should create a much higher replayability ceiling. But Bad North's lesson is that even a 15-hour game can be beloved if those 15 hours are tight and polished. Better a short perfect game than a long mediocre one.

---

## Community Reception

**Strongly Positive (93% Steam).** Community praise centers on:
- Visual beauty and minimalist aesthetic
- Satisfying positioning gameplay
- Roguelike run variety
- Mobile-perfect control scheme
- "One more island" addictive loop

**Community Criticism:**
- Late-game difficulty spikes feel unfair (too many simultaneous landings, not enough squads)
- Lack of strategic depth beyond 15-20 hours
- RNG in commander recruits and item drops can create unwinnable situations
- Real-time execution means that skilled players can "micro" their way through situations that should require better positioning — the game rewards APM more than pure planning in the late game

**The "Micro Creep" Problem.** Bad North was designed as a positioning game, but expert players discovered that rapid repositioning during combat (moving squads frame-by-frame to dodge arrows, retreating mid-engagement to reset enemy targeting) converts it into a micro-management game. This undermines the design intent. Robot Uprising's sealed watch completely prevents this — once execution begins, no repositioning is possible. This is a direct design response to the Bad North problem.

---

## Mechanics Translatable to Robot Uprising

**1. Positioning as Complete Expression.** Bad North's entire strategic vocabulary is "where does this unit stand?" Robot Uprising inherits this with unit placement on the 8x8 grid, but enriches it with what the unit knows (buffer config), how it communicates (hooks), and what it can do (skills). The spatial game becomes one dimension of a multi-dimensional configuration space.

**2. The Procedural Terrain as Strategic Constraint.** Bad North's procedural islands create natural chokepoints, elevation advantages, and exposed flanks. Robot Uprising's grid-based terrain (from the Philippine island settings) should create similar spatial constraints that make positioning non-trivial. The root network topology analysis (3.19a-ii) maps directly to Bad North's "which terrain features create defensive advantages?"

**3. Autonomous Unit Combat.** Bad North soldiers fight on their own once positioned. Robot Uprising agents execute their configured behavior on their own once the sealed watch begins. The emotional experience is identical: pride when your units do the right thing, frustration when they don't. The difference is legibility — Bad North's autonomous behavior is simple enough to predict visually (pikes brace, archers shoot, swords charge), while Robot Uprising's agent behavior is complex enough to require the Inspector to understand.

**4. The Multi-Front Triage Problem.** Bad North's simultaneous landings force you to choose: which threats to address, which to accept losses on. This maps directly to Robot Uprising's attention allocation problem — agents with limited context windows can't track everything, and deciding what to pay attention to (context config) is the equivalent of deciding which island face to defend.

**5. Minimalism as Accessibility Gateway.** Bad North's 3-unit-type, 4-enemy-type design proves that minimalism enables broad audience appeal. Robot Uprising's progressive workbench unlock (starting with skills-only, growing to full rules+hooks+context) follows the same principle: start minimal, grow complex. Mission 1-2 should feel like Bad North in simplicity.

**6. The Permadeath Emotional Engine.** Bad North's commander permadeath creates attachment and loss. Robot Uprising's one-shot-one-kill lethality and potential commander loss create similar stakes. The anthropomorphization system (1.06e) — named units with behavioral signatures — amplifies this emotional investment beyond what Bad North's generic commanders achieve.

**7. The Real-Time vs. Sealed Distinction.** Bad North allows repositioning during combat. Robot Uprising does not. This is the single most important design distinction. Bad North rewards fast hands; Robot Uprising rewards deep thinking. Bad North's late-game "micro creep" problem validates Robot Uprising's sealed watch as a deliberate anti-micro design choice. Planning should be the entire game, not just the first 90%.
