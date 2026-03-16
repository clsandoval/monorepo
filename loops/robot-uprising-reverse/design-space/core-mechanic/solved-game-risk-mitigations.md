# 2.00h — The Solved-Game Risk and Its Mitigations

**Aspect:** 2.00h — The solved-game risk and its mitigations: when a veteran finds a universal config that beats most missions; the Gauntlet as the unsolvable endgame; how campaign missions use 100-variant test cases to resist dominant strategies; at what skill level does the campaign "run out"?
**Category:** Core Mechanic / Information Warfare
**Wave:** 2 (Core Mechanic Variations)

---

## The Problem

Every strategy game with a finite campaign faces a terminal question: **what happens when someone figures it out?**

A veteran player — call her Zara, 800 hours, Diamond-ranked in the Gauntlet — boots up Mission 7 again. She's seen this mission 40 times. She knows the enemy spawner positions, the terrain layout, the timing of the reinforcement wave. She has a blueprint configuration she calls "Swiss Army Knife" — a relay-heavy signal chain with adaptive command rules that handles almost anything Missions 1-8 can throw at her. She pastes it in, hits EXECUTE, and wins on the first variant. And the second. And the sixth. The invisible randomization shuffles enemy positions and timing, but her architecture is robust enough to absorb the variation.

The campaign, which took her 6 hours the first time, now takes 45 minutes. The missions that taught her about context windows, hooks, signal latency, and information architecture are now trivial execution. The game feels **solved**.

This is the Factorio Blueprint Problem. Factorio veterans with a library of optimized blueprints can stamp down a factory from iron ore to rocket silo in a fraction of the time it took on their first playthrough. The discovery — the creative design process — is a one-time event. After that, the game becomes "pasting blueprints and scaling throughput." The Factorio community's response is telling: the majority of experienced players eventually migrate to overhaul mods (Krastorio, Space Exploration, Seablock) specifically because the base game's design space has been exhausted. The Space Age DLC was partly a response to this — introducing new planets with different resource chains to force new factory designs.

Robot Uprising's version of this problem has unique characteristics:

1. **Determinism amplifies solvability.** Because the game is fully deterministic (with invisible randomization on top), a sufficiently robust config will produce consistent wins. There's no "bad RNG run" to blame. If your architecture handles the variance, it handles it forever.

2. **10 fixed missions.** Unlike roguelikes with infinite procedural variation, the content is finite and pedagogical. Every mission has a known structure, known terrain, known objectives.

3. **Skills transfer, not unlock.** The player's advantage on replay is understanding, not unlocked powers. This is the Zachtronics pattern — play once, admire, never touch again. Shenzhen I/O's median completion rate is famously low because the game gets hard, but the players who DO complete it rarely replay. The puzzle is solved. The elegance is appreciated. The game is closed.

4. **The Gauntlet exists.** The infinite adversarial endgame provides unlimited replayability — but only if the player transitions to it. If the campaign feels "solved" before the player reaches the Gauntlet, the transition might not happen. They might just leave.

5. **Blueprints are portable.** A config that works on Mission 7 variant 14 probably works on variants 1-99. The invisible randomization varies execution, not the fundamental challenge.

The question isn't whether the campaign can be solved — it can, by definition, because it's finite. The question is: **how long does the campaign resist being solved, and what happens to the player when it finally gives way?**

---

## Why This Matters More Than It Seems

A "solved" campaign isn't just a content exhaustion problem. It's a **teaching failure.** Robot Uprising's campaign exists to teach agentic AI engineering concepts through lived experience. If a player can solve most missions with a single universal config, they've learned one thing: "this config works." They haven't learned *why* it works, what its failure modes are, or how to build something different when it stops working.

The campaign needs to produce players who can think architecturally — who understand context windows, signal latency, hook topology, EM tradeoffs, and meta-level management not as abstract concepts but as design tools they reach for instinctively. A solved campaign produces players who know one good design. An unsolvable campaign produces players who know the design space.

This is the difference between a chess player who memorized one opening and a chess player who understands positional play.

---

## Mitigation Strategy Catalog

### Strategy 1: "The 100-Variant Stress Test"

**How it works:** Each mission doesn't have one enemy configuration — it has 100. When the player hits EXECUTE, the game runs the player's config against all 100 variants and reports a **pass rate**: "Your architecture survived 73 of 100 scenarios." The player sees one randomly-selected execution in the sealed watch, but the debrief shows aggregate performance across all variants.

**Mechanical details:**
- Variants modify: enemy spawn positions (within the grid), enemy timing (±3 ticks), enemy composition (ratio of scouts to strikers), enemy signal behavior (which channels they use), terrain obstacles (1-2 tiles shifted), resource node positions
- Variants do NOT modify: fundamental mission structure, player spawn position, core objective, available terrain types, enemy unit types present
- Pass rate thresholds: Bronze (50/100), Silver (75/100), Gold (90/100), Platinum (100/100)
- The sealed watch shows ONE variant. The player experiences the emotional arc (sealed → debrief) with one specific execution. But the Inspector reveals aggregate data.

**Why it resists solving:** A config that wins 73/100 isn't "solved." It has failure modes. The 27 failed variants represent specific architectural weaknesses — maybe the config can't handle north-spawn enemies, or it breaks when the enemy scout timing shifts by 2 ticks, or it overloads when 3 enemy signals arrive on the same tick. Each failed variant is a diagnostic puzzle.

**The "Swiss Army Knife" counter:** Zara's universal config might hit 85/100 on Mission 7. Comfortable. But to reach 95/100, she needs to diagnose the 15 failing variants. The Inspector shows her: "In variants where enemy scouts spawn in the NE quadrant, your relay's signal chain arrives 2 ticks late because the scout's patrol path doesn't intersect the relay's range until tick 8." Now she needs a variant-aware architecture — one that handles NE spawns differently. This requires *more* hooks, *more* conditional rules, *more* context entries. Which means more buffer pressure, more EM emissions, more complexity. The game pushes back against universal solutions by making the long tail of variants demand increasingly specialized responses.

**The diminishing returns curve:** Going from 73/100 to 85/100 might take one redesign session. Going from 85/100 to 95/100 takes three. Going from 95/100 to 100/100 might require an entirely different architecture. This is the Zachtronics histogram pattern applied to mission variants: the last 5% is where mastery lives.

**Sensory description:** The pass rate display is a horizontal bar divided into 100 thin vertical segments. Each segment lights cyan (pass) or dims to dark steel (fail). Failures cluster visually — you can see "oh, the failures are all in the 60-80 range, those are the late-spawn variants." Hovering a segment shows a tooltip: "Variant 73: Enemy scout NE spawn, reinforcement at tick 14." Clicking loads that variant into the Inspector for full replay. The bar fills left-to-right with a soft ascending chime per pass, silence per fail. When the final count resolves, a resonant chord (major for >90, minor for <75) and the pass rate number animates in — large, centered, unmissable. Gold shimmer on Platinum. Muted steel on Bronze.

**Comparable:** Exapunks' 100-test-case system (aspect 1.04e) is the direct precedent. Each puzzle must handle N randomized inputs. Players learn quickly that solutions must be general, not case-specific. The difference: Robot Uprising variants modify the *environment* (enemy positions, timing), not the *input* — so the player is building robust architectures, not general algorithms.

---

### Strategy 2: "The Gauntlet as the Unsolvable Endgame"

**How it works:** The campaign is explicitly framed as a tutorial. The Gauntlet is the real game. Campaign missions teach vocabulary; the Gauntlet demands fluency. No human opponent uses the same strategy twice — or if they do, the meta shifts around them.

**Mechanical details:**
- The campaign ends with a clear invitation: "Your education is complete. The Gauntlet awaits."
- Gauntlet matches use the same mechanics, same primitives, same UI — but the opponent is a human (or an AI trained on human configs)
- Gauntlet ratings are visible, providing infinite ladder-climbing motivation
- Weekly Gauntlet bounties (community-set challenges) provide novel constraints
- Seasonal modifiers (aspect 7.09a) rotate every 2-4 weeks, invalidating dominant configs

**Why it resists solving:** You can't solve a human opponent. Even if Zara perfects a config that beats most campaign variants, a Diamond-ranked Gauntlet opponent will exploit its specific weaknesses. The adversarial pressure constantly invalidates dominant strategies. If relay-chain architectures become dominant in the meta, opponents develop anti-relay tactics (EM scanning to locate relays, noise flooding to overload them, striker rushes to destroy them before the chain is established). The meta oscillates. Nothing stays dominant.

**The transition design:** The critical moment is the transition from "I've solved the campaign" to "I'm a Gauntlet player now." If this transition is smooth, the solved campaign is a feature, not a bug. If it's jarring, the player churns.

The transition should feel like graduation, not abandonment. The campaign's final debrief (after Mission 10) should show the player's architectural evolution across all 10 missions — a visual timeline of their config complexity growing from "one scout with default rules" to "multi-blueprint factory with command agent and adaptive relay chain." Then: "You built an intelligence architecture from scratch. Now build one that can beat someone who did the same thing."

**The risk:** Some players don't want PvP. They bought a single-player puzzle game. For them, "the real game is the Gauntlet" is a non-answer. These players need campaign-side mitigations (strategies 1, 3, 4, 5 below).

**Comparable:** StarCraft's campaign-to-ladder transition is notoriously rough — the campaign teaches bad habits (hero units, scripted defenses) that don't transfer. Into the Breach's custom squad challenges provide infinite single-player replayability without PvP. Robot Uprising should learn from both: campaign skills DO transfer to Gauntlet (same mechanics), AND single-player endgame exists for PvP-averse players.

---

### Strategy 3: "The Constraint Ratchet" — Doctrines as Self-Imposed Difficulty

**How it works:** After completing a mission at Silver (75/100), the player unlocks **Doctrines** — named rule sets that constrain their options. Replaying Mission 7 under "The Whisperer" Doctrine means: maximum 2 hook slots per blueprint, all signals must use compress before transmission, no relay amplify skill. This forces entirely different architectures.

**Mechanical details:**
- Doctrines are unlocked per-mission at Silver threshold
- Each mission has 3-5 Doctrines, each targeting a different architectural constraint
- Doctrine examples:
  - **"The Whisperer"**: Hook slot limit −2, no amplify skill. Forces local-only information architectures.
  - **"The Swarm"**: No command agent, no relay. Only scouts and strikers. Forces emergent coordination.
  - **"The Minimalist"**: Rule limit 3 per blueprint. Forces elegant rule ordering.
  - **"The Blind"**: Scout perception range −2. Forces relay-dependent information gathering.
  - **"The Luddite"**: No compress skill, no filter skill. Raw signals only. Forces buffer management mastery.
  - **"The Economist"**: Resource income −50%. Forces efficiency over redundancy.
  - **"The Speed Runner"**: Must achieve objective within N ticks. Forces aggressive timing.
- Completing a mission under a Doctrine at Gold (90/100) earns a **Doctrine Badge** (visible in profile, shareable)
- Completing ALL Doctrines for a mission earns a **Mastery Badge** with a unique icon

**Why it resists solving:** Each Doctrine forces a fundamentally different architecture. "Swiss Army Knife" breaks under "The Swarm" because it relies on relay chains. It breaks under "The Minimalist" because it uses 7 rules per blueprint. It breaks under "The Economist" because it builds 6 units when only 3 are affordable. The player can't reuse their solution — they must build something new for each Doctrine.

**The Ascension parallel:** This is Slay the Spire's Ascension system (cumulative difficulty modifiers per character) meets Into the Breach's custom squads (different unit loadouts forcing different playstyles). Slay the Spire's genius is that Ascension levels don't just make enemies harder — they change the rules (less healing, more elite encounters, weaker starting deck) so that strategies that worked at A0 fail at A15. Into the Breach's genius is that each squad has fundamentally different capabilities, so a strategy that works with Zenith Guard is irrelevant for Blitzkrieg.

**Sensory description:** Doctrine selection screen: the mission card sits center-screen. Around it, 3-5 Doctrine icons orbit slowly — small golden circuit-board medallions, each with a distinctive glyph. Hovering one dims the others and expands it: the glyph fills the medallion, the constraint text appears below in amber monospace, and the player's best pass rate under this Doctrine (if attempted) shows as a cyan number. Selecting one snaps it to the top of the mission card with a magnetic *click*. The workbench then shows the Doctrine's constraints as permanent amber overlays — disabled skill slots have golden X marks, reduced hook slots show amber dashed outlines where full slots used to be. The whole workbench shifts color temperature slightly warm, a constant reminder: "you're playing under constraints."

---

### Strategy 4: "The Anti-Universal Missions" — Missions That Punish Generalists

**How it works:** Specific campaign missions are explicitly designed to defeat universal configs. Not through raw difficulty, but through structural incompatibility.

**Mission design patterns:**

**"The Silent Run" (potential Mission 9):** Enemy EM detection is maximally sensitive. Any hook transmission risks detection and immediate striker response. The player must build an architecture that barely communicates — scouts that make local decisions, strikers that act on only their own observations, relays used sparingly if at all. A relay-heavy "Swiss Army Knife" config triggers EM detection constantly and gets annihilated. The mission teaches: sometimes the architecture that's best for information flow is worst for survival.

**"The Overload" (potential Mission 8):** Enemy floods the player's units with noise signals — fake alerts, false positions, meaningless data. Any config with generous listen filters gets overloaded (context windows fill with garbage, causing stun-locks). The player must build architectures with aggressive filtering and strict context management. A config designed for "listen to everything" fails catastrophically. The mission teaches: more information isn't always better.

**"The Race" (potential Mission 10):** Time pressure. The enemy base must be destroyed within 30 ticks. No time for the slow relay-chain-compress-forward-strike cycle. The player needs fast, aggressive, locally-decisive units — scouts that transition to strikers, minimal signal processing, direct action. A methodical information-architecture config times out. The mission teaches: sometimes the best architecture is the simplest one.

**"The Fog" (potential Mission 6):** Reduced perception ranges across the board. Scouts see only 2 tiles instead of 5. Information is scarce. The player must build architectures that make decisions with incomplete data — heavy use of the ? (uncertainty) prefix, graceful degradation, speculative action. A config that assumes good intelligence fails because the intelligence never arrives. The mission teaches: robust architectures handle missing data, not just present data.

**Why it resists solving:** No single architecture excels in all four environments. The Silent Run punishes communication. The Overload punishes openness. The Race punishes deliberation. The Fog punishes intelligence-dependency. To beat all four, the player needs four different architectures — or one so sophisticated it adapts to all four, which requires mastery of every system simultaneously.

**The curriculum implication:** These missions must appear in the right order. The Fog (incomplete information) before The Overload (too much information) — because the player needs to understand uncertainty before understanding noise. The Race (time pressure) last — because it requires the player to know which parts of their architecture are essential and which are luxury.

---

### Strategy 5: "The Invisible Randomization Envelope" — How Wide Is Wide Enough?

**How it works:** The "invisible randomization" built into each EXECUTE determines how much variation exists within a single mission. The wider the envelope, the harder it is to build a universal config.

**Randomization dimensions:**

| Dimension | Narrow Envelope | Wide Envelope | Impact on Solvability |
|-----------|----------------|---------------|----------------------|
| Enemy spawn positions | ±1 tile from fixed points | Any valid tile in enemy half | High — different spawn positions require different response architectures |
| Enemy spawn timing | ±1 tick | ±5 ticks | Medium — affects signal chain timing requirements |
| Enemy composition | Fixed ratio | Variable within range (30-70% scouts) | High — scout-heavy vs. striker-heavy demands different responses |
| Enemy channel behavior | Same channels always | 3-5 random channel names | Low — names don't matter, but if enemies switch BETWEEN channels mid-battle, high impact |
| Resource node positions | Fixed | ±2 tiles | Medium — affects patrol paths and tagging routes |
| Terrain obstacles | Fixed | 2-4 tiles randomized | High — affects line-of-sight, movement paths, relay coverage |

**The tuning dial:** The game designers control difficulty-of-solving by adjusting these envelopes per mission:

- **Missions 1-3:** Narrow envelopes. The tutorial should be consistent — the player is learning mechanics, not fighting randomness. The same config should produce similar results.
- **Missions 4-6:** Medium envelopes. Some variation in enemy spawns and timing. The player starts needing conditional rules ("if enemy NE, do X; if enemy SW, do Y").
- **Missions 7-8:** Wide envelopes. Significant variation in composition and terrain. Universal configs start failing on edge variants. The player needs architecturally robust designs.
- **Missions 9-10:** Maximum envelopes. Everything varies. The only configs that achieve Platinum (100/100) are masterworks of adaptive architecture — command agents that reroute dynamically, scouts that adapt patrol paths, relays that adjust compression based on signal load. These missions are designed to be imperfectly solvable. 95/100 is an achievement. 100/100 is a trophy.

**The "Solved At What Level?" question:** The campaign "runs out" at different points for different players, depending on their ambition:

| Player Type | Campaign "Solved" At | Time | What's Next |
|-------------|---------------------|------|------------|
| Casual (completes all missions at Bronze) | ~8 hours | After Mission 10 Bronze clear | Gauntlet or exit |
| Dedicated (all missions Silver) | ~15 hours | After optimizing to Silver threshold | Doctrines or Gauntlet |
| Completionist (all missions Gold) | ~30 hours | After reaching Gold on every mission | Doctrine badges or Gauntlet |
| Perfectionist (all Platinum + all Doctrines) | ~80 hours | Never? The last 5% of each mission variant set is exponentially hard | Still grinding specific variants at 100 hours |
| Speedrunner (fastest possible campaign clear) | ~4 hours (eventually) | After optimizing run time | Speedrun leaderboards or Gauntlet |

The "solved" threshold is a function of the player's own ambition. The game doesn't run out — the player decides when to stop.

---

### Strategy 6: "The Hostile Meta" — Missions That Adapt to Player History

**How it works:** Later campaign missions (M8-M10) read the player's blueprints and generate variants specifically designed to challenge their architectural patterns.

**Mechanical details:**
- After the player hits EXECUTE, the 100-variant generator examines the player's config:
  - Heavy relay usage → more variants with EM-sensitive enemies
  - Few conditional rules → more variants with high variance spawns
  - No compress skill → more variants with signal-heavy enemy behavior
  - High hook count → more variants with noise-flooding enemies
- The player sees this as "some variants are harder than others" — they don't know the game is targeting their weaknesses
- This is NOT cheating AI — the enemy configs are preset. The VARIANT SELECTION is weighted toward the player's weak spots.

**Why it resists solving:** The game literally adapts to your dominant strategy. If Zara's "Swiss Army Knife" relies on relay chains, the later missions generate more EM-hunting variants. She can't solve the campaign with one config because the campaign is solving *her*.

**The ethical design question:** Is this fair? The player might feel punished for having a style. The key is that the adaptation should feel like a difficulty curve, not a personal attack. The game should surface the pattern: "Your architecture was tested against 100 scenarios, with emphasis on EM-exposure variants based on your signal-heavy design." Transparency transforms "unfair" into "challenging."

**Comparable:** Slay the Spire's boss selection indirectly counters dominant strategies (Time Eater punishes small-card decks, Heart of the Spire punishes slow setups). Into the Breach's random maps and enemy compositions naturally create variant pressure. But neither game explicitly reads the player's strategy and generates counter-scenarios. This is more like a dynamic difficulty system — Resident Evil 4's adaptive difficulty, but for architecture robustness rather than combat skill.

**Risk:** If implemented poorly, this feels adversarial and demoralizing. "No matter what I do, the game counters it." The solution: the adaptation should be gentle (weighting, not exclusion) and transparent (surfaced in the Inspector). The player should feel "the game is pushing me to grow," not "the game is cheating."

---

### Strategy 7: "The Community Grindstone" — Player-Created Variant Packs

**How it works:** Players can create and share custom variant packs for campaign missions. A community member designs a set of 100 variants for Mission 7 that are specifically crafted to test unusual architectures — variants where the enemy uses Command agents, variants with minimal resources, variants with terrain mazes.

**Mechanical details:**
- Variant Editor unlocks after completing the campaign
- Players design enemy configs, spawn positions, timing, terrain layouts
- Variants are packaged into "Challenge Packs" (sets of 100)
- Challenge Packs are shared via Config Codes (compact serialization)
- Community rating system: packs rated by difficulty, fairness, creativity
- Weekly "Featured Challenge Pack" appears on the campaign map as a gold-bordered mission

**Why it resists solving:** The community generates content faster than any player can solve it. A veteran who's mastered the base campaign's 100 variants now faces community packs designed by other veterans — packs that exploit architectural blind spots the base campaign never tested.

**The content flywheel:** Creating variant packs requires deep understanding of the game's mechanics — which enemy configs punish which player strategies, how spawn timing affects signal chains, what terrain layouts create novel challenges. The act of designing variants IS mastery. The community becomes self-teaching.

---

## Interaction Effects

### × 100-Variant System ↔ Inspector
The Inspector must support aggregate analysis across variants. Not just "what happened in this one run" but "what patterns appear across the 27 failed variants?" Cluster analysis (aspect 4.69) becomes essential: "15 of your 27 failures share a common cause: relay overload at tick 12-14 when NE-spawn enemies send simultaneous signals."

### × Doctrines ↔ Seasonal Modifiers (7.09a)
Doctrines constrain the player's options. Seasonal modifiers constrain the environment. They should stack: playing under "The Whisperer" Doctrine during "The Quiet War" season (all EM ranges doubled) creates a doubly-constrained environment that demands entirely novel solutions.

### × Anti-Universal Missions ↔ Campaign Arc
The anti-universal missions must appear AFTER the player has built their first "universal" config. If Mission 5 is when most players first create a reusable blueprint, Missions 6-8 should break it. The curriculum: build a system (M5) → watch it fail in a new way (M6: overload) → fix it for that failure (M6 debrief) → watch it fail differently (M7: stealth) → understand that no one system handles everything (M8: time pressure). This is the real teaching: **versatility is a design skill, not a property of any single design.**

### × Pass Rate ↔ Zachtronics Histograms
The pass rate (73/100, 85/100, 95/100) IS the histogram — but for robustness, not efficiency. Zachtronics histograms compare your solution's speed/cost/size against other players. Robot Uprising's pass rate compares your solution's robustness against environmental variation. Both create the same pull: "I'm at 85. I could be at 90. What would I need to change?"

### × Solved Campaign ↔ Educational Transfer
If the campaign is "solved" too easily, the player hasn't learned the design space — they've learned one design. The mitigations above all serve a pedagogical purpose: force the player to explore multiple architectural paradigms, not optimize a single one. The 100-variant system teaches robustness. Doctrines teach constraint-driven design. Anti-universal missions teach context-dependent architecture. The Gauntlet teaches adversarial thinking. Together, they produce a player who understands the *space*, not just a point in it.

### × Blueprint Portability ↔ Factorio Blueprint Problem
Factorio's blueprint system lets players copy-paste optimized designs across saves. Robot Uprising's blueprint system lets players reuse configs across missions. The key difference: Factorio's environments are homogeneous (iron ore is iron ore), so blueprints transfer perfectly. Robot Uprising's missions should be heterogeneous enough (different enemy behaviors, terrain, objectives, constraint environments) that no blueprint transfers perfectly. The blueprint is a starting point, not a solution.

---

## Player Journeys

#### Journey: Zara, 28, Data Scientist, Diamond Gauntlet Rank

**Context:** Zara completed the campaign months ago. She's replaying Mission 7 (Palawan jungle) to warm up before a Gauntlet session. She has a Gauntlet-optimized config called "Hydra Net" — relay chain with command agent, adaptive hook routing, 6 blueprints.

**Minute 0:00 — The Paste**
Zara opens Mission 7. The workbench loads. She doesn't even look at the terrain preview — she knows this map. She opens her saved configs, selects "Hydra Net," and pastes it into the workbench. Six blueprint icons populate the conveyor belt. Hook wires auto-connect on the channel map. She glances at the blueprint editor — everything's green. She reaches for EXECUTE.

The fill ring begins. The *clack* fires. Sealed watch.

**Minute 0:15 — The Comfortable Win**
Tick 1. Her factory begins producing. By tick 8, three scouts are deployed, patrol paths covering the SW and center. By tick 12, the relay chain is operational — signals compressing and forwarding to two strikers entering from the east. Enemy scouts appear NE. Her architecture routes intelligence through the relay, the command agent reprioritizes, strikers converge. Tick 18: first enemy down. Tick 25: second enemy down. Tick 32: enemy base breached. Clean.

She feels — nothing. No tension. No surprise. The sealed watch was a formality. She already knew the outcome.

**Minute 0:50 — The Pass Rate**
Inspector loads. Timeline scrubber shows 32 ticks of smooth operation. But the pass rate bar draws her attention: **82/100**. Eighteen failures. She expected 90+.

The bar shows clusters: failures at variants 61-68 (NE heavy-spawn group) and variants 88-94 (late-reinforcement group). She clicks variant 63. The Inspector reloads — same mission, different spawns. Enemies appear NE and NW simultaneously. Her relay chain, positioned for the center, can't cover both flanks. The NW striker arrives at the base by tick 22, undetected. Loss.

**Minute 1:30 — The Diagnosis**
Zara examines variant 63 in the Inspector. Decision trace on the command agent: it received NE intelligence at tick 10, routed strikers east. NW intelligence arrived at tick 14 — 4 ticks late because the scout patrol path doesn't reach NW until tick 12, then signal traverses scout → relay → command → striker = 4 hops. The striker would have needed to move west by tick 18 to intercept. It received the order at tick 14 + 4 ticks latency = tick 18. Too late.

She opens the latency ruler. Scout NW range → relay → command → striker W: 4 hops. Enemy NW base → player base: 22 ticks at enemy speed. Signal must arrive by tick 18 to allow 4-tick interception window. Signal generated at tick 12 (scout contact) + 4 hops = tick 16. Two ticks of margin. But the scout doesn't reach NW patrol point until tick 12 — if enemy spawns 2 ticks early (variant parameter), signal generates at tick 12 but scout was at wrong position at tick 10, missing the enemy entirely.

The diagnosis: her architecture has a 2-tick blind spot for NW early spawns.

**Minute 3:00 — The Fix**
Zara adds a second scout with a NW-biased patrol path. This costs 3 minerals and 1 energy/tick. She adjusts the production queue, delaying the second striker by 2 ticks to fund the scout. The scout's hooks wire to the same relay on channel `threat-nw`. The command agent gets a new rule: "IF threat-nw AND threat-ne THEN split strikers." She hits EXECUTE again.

Pass rate: **91/100**. The NW failures are mostly resolved. Nine remaining failures cluster around a different pattern — late-game resource exhaustion from the extra scout's energy drain. She now faces a resource management puzzle.

**Minute 5:00 — The Realization**
Zara pauses. She's been optimizing Mission 7 for 5 minutes and learned something she didn't know about her own Gauntlet config: it has a dual-flank blind spot. If a Gauntlet opponent opens with a simultaneous NE/NW scout rush, "Hydra Net" might lose the first 2 ticks of intelligence. She opens her Gauntlet config and makes the same adjustment.

The campaign mission, ostensibly "solved," just taught her something.

**UI Annotations:**
- Pass rate bar: 100 vertical segments, 2px wide each, 200px total width. Cyan fill = pass, dark steel = fail. Clustered failures visible as dark bands. Hover tooltip shows variant parameters. Click loads variant into Inspector.
- Latency ruler: Click scout, click striker. Concentric wavefront rings appear on board. T+1 blue, T+2 green, T+3 amber, T+4 red. Hop count displayed on each wire segment.
- Dual-flank split: Command agent rule editor shows new rule 4 of 12: `IF [threat-nw] AND [threat-ne] → SPLIT-ASSIGN strikers`. Amber prefix pills. Green action token.

---

#### Journey: Tomás, 16, First Strategy Game, Just Completed Mission 7

**Context:** Tomás beat Mission 7 for the first time last session. He used a relay-heavy config the boot log guided him toward. He got Bronze (52/100) and wants to improve.

**Minute 0:00 — The Dashboard**
Tomás opens Mission 7. The campaign map shows his Bronze badge — a dull copper color against Palawan's jungle green. The pass rate reads "52/100" in small text beneath. He knows Silver is 75. He opens the workbench.

His config from last time is still loaded. The conveyor belt shows: Scout, Scout, Relay, Striker, Striker. The channel map shows two channels: `enemy-spotted` and `strike-target`. Simple architecture. He stares at it, wondering where to start.

**Minute 0:30 — The Failure Analysis**
He clicks the pass rate bar from his last attempt. 48 failures. They're spread across the bar — not clustered like Zara's. He clicks a few. Variant 12: enemy scouts flanked his relay and destroyed it at tick 15. Variant 34: enemy noise signals filled his scouts' buffers, causing stun-lock at tick 11. Variant 71: enemy strikers arrived before his scouts completed their patrol, catching them in the open.

Three different failure modes. He doesn't know which to fix first. The Inspector shows a subtle prompt: "Your most common failure pattern: relay destruction (23 variants). Your relay was eliminated before tick 20 in 23 of 48 failed variants."

**Minute 1:00 — The Relay Problem**
Tomás clicks into the cluster. The Inspector shows a heat map overlay: his relay, placed at D4, was in direct line-of-sight of the enemy striker path in 23 variants. His relay has no movement, no evasion. It's a sitting target.

He considers options. Move the relay? But he placed it at D4 for central coverage. Add a striker to guard it? That costs resources and delays his offensive. Give the relay an evade skill? Relays can't equip evade — they're stationary.

He reads the Blueprint Codex entry for relays: "Stationary. High buffer (12 slots). 4 hook slots. Skills: compress, filter, amplify. Cannot move. Consider placement carefully." He reads the entry for scouts: "Fast. 2 hook slots. Skills: patrol, evade. Can reposition dynamically."

**Minute 2:00 — The Discovery**
An idea: what if a scout acts as an early-warning system specifically for the relay? A scout with a hook on channel `relay-danger` that fires when an enemy is within 2 tiles of D4. The relay listens on `relay-danger` and... can't move. But a striker could listen on `relay-danger` with a rule: "IF relay-danger THEN move toward D4."

He builds it. Scout 1 patrols the east. Scout 2 patrols the west and has a hook: `ON enemy_near(D4, 2) → SEND relay-danger`. Striker 1 has a rule: `#1: IF relay-danger THEN move-to(D4)`. This means the striker abandons its offensive to protect the relay when threatened.

He hits EXECUTE. Sealed watch: tick 12, an enemy scout approaches the relay. Scout 2 detects it, fires `relay-danger`. Tick 13: signal arrives at striker 1. Tick 14: striker 1 abandons its eastern advance and moves toward D4. Tick 16: striker 1 intercepts the enemy scout. Relay survives.

But the eastern front is now undefended. Enemy strikers advance unopposed. Tick 22: they reach the base. Loss.

**Minute 3:30 — The Trade-off**
Pass rate: **61/100**. Up from 52. The relay protection works — relay destruction dropped from 23 failures to 8. But new failures appeared: 15 variants where the striker's retreat from the eastern front left the base vulnerable.

Tomás is learning something the campaign is designed to teach: **protecting one thing means exposing another. Information architecture is about trade-offs, not solutions.** He needs either a third striker (expensive), a command agent that dynamically reassigns based on threat priority (complex), or a more aggressive offense that destroys enemies before they threaten the relay (risky).

He's no longer "using the config the boot log gave him." He's designing. The campaign isn't solved — it's teaching.

**Minute 5:00 — The Session End**
Tomás saves his config and closes the game. Pass rate: 61/100, up from 52. He's thinking about the command agent — Mission 6 introduced it, but he only used the default config. Maybe the command agent is the answer to the "protect the relay OR protect the base" dilemma. He opens the Blueprint Codex to read about `reassign` and `prioritize` skills.

He'll be back tomorrow.

**UI Annotations:**
- Failure cluster prompt: Amber text beneath pass rate bar: "Most common pattern: relay destruction (23 variants)." Clicking opens filtered Inspector view showing only relay-destruction variants overlaid on the board.
- Scout hook config: Hook panel shows `ON enemy_near(D4, 2) → SEND relay-danger`. The `D4` is a board-reference token — clicking it highlights D4 on the tactical preview. The `2` is a range parameter shown as a radius circle on the board.
- Trade-off visualization: After the 61/100 attempt, the failure breakdown shows two bars: "relay destruction: 8" (down from 23, green arrow) and "base exposed: 15" (new, amber arrow). The visual makes the trade-off explicit: fixing one problem created another.

---

#### Journey: Marcus, 45, Chess Player, Plays Once Per Week

**Context:** Marcus bought Robot Uprising because it was compared to Into the Breach. He's on Mission 5, plays one 30-minute session per week, and hasn't thought about the game between sessions. He doesn't know what the Gauntlet is.

**Minute 0:00 — The Reconnection**
Marcus opens Mission 5. The workbench loads his config from last week. He doesn't remember what half of it does. The conveyor belt shows three blueprints he designed — Scout, Relay, Striker — but the hook wiring looks like something he set up in a hurry.

He hovers over the scout's hook: a tooltip micro-scenario plays, showing the scout detecting an enemy and sending a signal on channel `eyes-east`. He remembers now. "Eyes-east" was his naming scheme. East side. The relay forwards it. The striker receives and moves to intercept.

He hits EXECUTE without changing anything. Just to see.

**Minute 0:30 — The Bronze**
Pass rate: **41/100**. He got 41 last week too. Same config, same result. He vaguely remembers that he should be improving this, but he doesn't remember how the Inspector works.

He clicks the pass rate bar. The Inspector loads variant 1 — a failure. He sees his scouts patrolling, the relay forwarding, the striker... sitting still. Why isn't it moving? He clicks the striker. Decision trace: "No matching rule. Context window: [eyes-east: T12, eyes-east: T14, eyes-east: T16, eyes-east: T18, eyes-east: T20, eyes-east: T22]. Rule #1: IF enemy-spotted THEN engage." The striker is listening on `enemy-spotted`, but the scout is sending on `eyes-east`. The channel names don't match.

Marcus stares. He made a naming error last week and never caught it because the one variant he watched happened to have enemies approach the striker directly (no relay needed). But in 59 other variants, the striker relies on relayed intelligence — which never arrives because the channel names don't match.

**Minute 1:30 — The Fix**
He changes the scout's hook channel from `eyes-east` to `enemy-spotted`. Or — wait. He could change the striker's rule to listen for `eyes-east`. Both work. He picks the simpler one: rename the scout's channel.

EXECUTE. Pass rate: **63/100**. Twenty-two more variants pass now that the signal chain actually connects.

Marcus exhales. That was satisfying. A simple naming error, caught by the variant system, producing a 22-point improvement. He has 25 minutes left in his session. He clicks the remaining failures.

**Minute 2:30 — The Deeper Pattern**
The remaining 37 failures have a different pattern. In these variants, the enemy sends multiple scouts. His relay receives two `enemy-spotted` signals on the same tick. Its buffer fills to 10/12. Then a third signal arrives. 11/12. Then a fourth. 12/12. Then a fifth — buffer full. **Context overload. Relay stunned for 1 tick.** During that tick, the enemy striker advances. The relay recovers, but the striker's response is delayed by 1 tick. In a one-shot-one-kill game, that tick is fatal.

Marcus realizes: his relay has no filter. It's receiving every signal from every scout and trying to hold them all. He needs the `compress` skill — combine multiple `enemy-spotted` signals into one summary signal. Or the `filter` skill — ignore duplicate signals about the same enemy.

He opens the Blueprint Codex. Reads about compress. Reads about filter. Both are available. He equips compress on the relay, replacing amplify (which he never understood anyway).

EXECUTE. Pass rate: **71/100**. Six points from Silver. He'll get there next week.

**Minute 4:00 — The Weekly Rhythm**
Marcus closes the game. He's played for 10 minutes. He improved by 30 points (41 → 71). He learned three things: channel naming matters, buffer overload is real, and compress exists. He didn't need to remember any of this from last week — the variant system surfaced the problems, and the Inspector explained them.

This is the "once a week" player pattern. The 100-variant system acts as a persistent diagnostic. The player doesn't need to remember their strategy — they just hit EXECUTE and read the results. The game remembers what's broken.

**UI Annotations:**
- Channel mismatch: Inspector decision trace shows `eyes-east` in the context window but rule expects `enemy-spotted`. The mismatch is highlighted with a red underline on the rule's condition — subtle but unmissable when the player reads the trace.
- Buffer overload: Context window visualization shows 12 horizontal slots filling left-to-right. Slots 1-10: blue. Slot 11: amber. Slot 12: amber. The 13th signal arrives — the bar flashes red, a spark effect plays, and the unit's tile shows a 1-tick stun indicator (yellow lightning bolt). The word "OVERLOAD" appears above the unit in the Inspector.
- Compress skill equip: The relay's skill panel shows three slots. Slot 1: compress (newly equipped, gold border glow). Slot 2: filter (available, dashed outline). Slot 3: amplify (just removed, fading ghost icon for 2 seconds before the slot empties). The micro-scenario tooltip on compress shows three incoming signals merging into one compressed signal — the relay's buffer receives 1 slot instead of 3.

---

## At What Skill Level Does the Campaign "Run Out"?

The honest answer: **it depends on what "run out" means to the player.**

| Definition of "Run Out" | Skill Level | Approx. Hours | Mitigation |
|--------------------------|-------------|---------------|------------|
| "I completed all 10 missions" | Intermediate | 6-10 hours | Doctrines, pass rate optimization |
| "I have Silver on all missions" | Advanced | 15-25 hours | Doctrines, anti-universal missions |
| "I have Gold on all missions" | Expert | 30-50 hours | Platinum push, Doctrine badges |
| "I have Platinum on all missions" | Master | 60-100 hours | All Doctrines + Platinum |
| "I have every Doctrine badge on every mission" | Grandmaster | 150+ hours | Community challenge packs, Gauntlet |
| "My pass rate cannot improve further" | Theoretical maximum | Effectively never | The last 1-2 variants on M9-M10 may require architectures that don't exist yet |

The key insight: **the campaign doesn't "run out" — the player's definition of completion determines the endpoint.** A casual player who considers Bronze completion "done" runs out at 8 hours. A perfectionist chasing all-Platinum-all-Doctrines runs out at 150+ hours — or never, if community challenge packs keep coming.

The Gauntlet provides infinite replayability for competitive players. The 100-variant system provides dozens of hours for single-player optimizers. Doctrines provide structural variety for players who want novel constraints. Community challenge packs provide infinite content for completionists.

The "solved-game" problem doesn't have one solution. It has a **portfolio of solutions**, each targeting a different player type and a different definition of "solved."

---

## Comparable Games Summary

| Game | Solved-Game Problem | Mitigation | What Robot Uprising Learns |
|------|---------------------|------------|---------------------------|
| **Slay the Spire** | Dominant deck archetypes | Boss RNG counters dominance; card offerings force adaptation; Ascension modifiers change rules | Cards that only partially solve problems; no single "best" approach |
| **Into the Breach** | Optimal squad strategies | Custom squads force different approaches; hand-designed maps create unique puzzles each battle; perfect information means every failure is solvable | Anti-universal missions; constraint-driven variety; the puzzle is the environment, not the tools |
| **Factorio** | Blueprint copy-paste | Mods (community); Space Age DLC (new resource chains); self-set goals (sandbox) | Blueprints must not transfer perfectly; environment heterogeneity resists copy-paste |
| **Zachtronics (Shenzhen, TIS-100)** | One-time puzzle completion | Histograms for optimization replayability; antagonistic metrics (speed vs. size vs. cost) | Pass rate as a histogram-like metric; optimization replayability beyond completion |
| **Exapunks** | 100-test-case robustness | Solutions must handle all variants; edge cases reveal architectural weaknesses | 100-variant stress test; edge variants as diagnostic puzzles |
| **Chess** | Solved openings (at human level) | Infinite opponent variety; no two games identical | The Gauntlet as adversarial infinity; PvP is unsolvable by definition |

---

## New Aspects Discovered

- **2.00h-i — Pass rate display design:** Full UX specification for the 100-variant pass rate bar — segment rendering, hover behavior, click-to-load, cluster highlighting, animation timing, sound design, accessibility (screen reader narration of pass/fail counts, high-contrast mode)
- **2.00h-ii — Variant-weighted generation in late campaign:** Design details for the hostile meta system — which player config signals trigger which variant weights, transparency design, fairness perception testing, interaction with Doctrine constraints
- **2.00h-iii — Doctrine as competitive modifier in Gauntlet:** Can Doctrines be used as voluntary handicaps in Gauntlet matches? "I challenge you to a Whisperer match" as a competitive format; Doctrine-specific leaderboards; interaction with seasonal modifiers (7.09a)
- **2.00h-iv — The "95% Wall" as designed content cliff:** The last 5% of pass rate as intentionally exponential difficulty; variant 96-100 as near-impossible edge cases that reward creative breakthroughs; the "impossible variant" as community puzzle; interaction with community challenge packs
- **2.00h-v — Cross-mission pass rate dashboard:** A campaign overview screen showing all 10 missions' pass rates simultaneously; visual identification of architectural weaknesses that span missions (e.g., "your NW coverage is weak across missions 5, 7, and 9"); cross-mission architectural health as a meta-diagnostic
