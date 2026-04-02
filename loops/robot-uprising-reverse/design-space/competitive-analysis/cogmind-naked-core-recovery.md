# 1.20c — The "Naked Core" Recovery Moment: Factory Destruction and Rebuilding from Nothing

**Aspect:** 1.20c — Cogmind's most iconic moment is being stripped to a bare core and rebuilding from salvage; what is Robot Uprising's equivalent when the factory is destroyed? Does the game have a "rebuild from nothing" mechanic or is factory loss immediate defeat?
**Category:** Competitive Analysis / Recovery Mechanic Design
**Dependencies:** 1.20 (Cogmind), 1.20b (Gradual Degradation), 2.17 (Fabrication as Tactical Resource), 5.06 (Failure Recovery), One-Shot-One-Kill (Locked), Factory Model (Locked), Sealed Watch (Locked)

---

## The Mechanic in Cogmind: What "Naked Core" Actually Means

In Cogmind, you are a robot chassis with up to 26 equipment slots. Weapons, propulsion, sensors, reactors, storage — every attached part defines what you can do. When combat goes badly, parts are destroyed one by one. Your cannon shatters. Your treads rip off. Your sensor array sparks and dies. Each loss is a capability amputation. Eventually, the worst happens: every part is gone. You are a bare core. No weapons. No propulsion beyond a crawl. No sensors beyond adjacent tiles. No utilities. You are the minimum viable entity — alive, but defined entirely by absence.

Here is what makes this a design masterpiece rather than a fail state: **the naked core is fast.** With no parts weighing it down, Cogmind's bare core has high movement speed — often faster than the enemies chasing it. The player can press SHIFT-ALT-P at any time to voluntarily purge all remaining parts and run. The naked core is not helpless. It is a survival mode. The player's immediate task shifts from "fight" or "explore" to a single primal verb: **flee.** Find a corridor. Find a stockpile. Find the remains of a destroyed robot scattered on the floor. Attach whatever you find. One thruster. One pistol. One sensor. Each attachment is a tiny resurrection — a capability returning from zero. Within 30 seconds of gameplay, the naked core has become something new. Not the build you had before. Not the build you planned. Something improvised, scavenged, ugly, and alive.

Kyzrati, Cogmind's developer, has described this as one of the game's most intentional design features. The naked core speed bonus exists specifically to make the stripped-to-nothing moment feel like an opportunity rather than a death sentence. The statistic that 43.5% of all equipped parts are destroyed before voluntary removal means players experience partial stripping constantly, and full stripping regularly. Building and rebuilding is not a failure mode. It IS the game. The naked core moment is the extreme expression of a continuous process — the moment where the rebuild-from-salvage loop is most compressed, most urgent, and most emotionally charged.

Player accounts describe the naked core moment with language usually reserved for near-death experiences: the relief of escaping a losing fight, the tension of crawling through corridors with zero protection, the joy of finding a single hover unit on the ground and suddenly being mobile again. These are Cogmind's most memorable stories because they combine maximum vulnerability with maximum agency — you have nothing, but you can become anything.

---

## The Translation Problem: Why Robot Uprising Cannot Copy This Directly

Robot Uprising's factory model creates a fundamentally different relationship between the player and production. In Cogmind, YOU are the factory. You pick up parts, you attach them, you decide what you become. The naked core moment works because the player has direct runtime agency over their rebuild — every part found on the ground is a decision: equip it or leave it?

In Robot Uprising, the factory is an autonomous building on the board. It produces units from blueprints on a cooldown. The player does not control units at runtime — they designed the blueprints and production queue before hitting EXECUTE, and the sealed watch plays out without intervention. If the factory is destroyed during the sealed watch, the player cannot improvise. They cannot scavenge. They cannot pick up parts from the floor. They are watching, not playing. The sealed watch's "no tools, no pause, no intervention" rule means that a factory destruction event plays out with whatever units remain on the board, following whatever rules were pre-configured.

This creates three possible design stances toward factory destruction:

**Stance A: Factory loss is immediate defeat.** The mission ends. This is clean and simple but eliminates the entire "recovery from nothing" design space. No naked core moment. No comeback stories. The factory IS your life, and losing it means death. This is the StarCraft model — lose your last base, you probably lose the game.

**Stance B: Factory loss is devastating but survivable.** The mission continues. Remaining units fight on, but no replacements are coming. The army you have is the army you will die with. Every subsequent unit loss is permanent and irreplaceable. This is the "fighting retreat" model — dignity in decline.

**Stance C: Factory loss triggers a recovery mechanic.** Something happens when the factory dies that gives the surviving units new capabilities or new production options. This is the Cogmind model — loss opens a new mode of play.

This exploration focuses on Stance C but evaluates all three.

---

## The Proposed Mechanic: "Last Signal Protocol"

When the factory is destroyed, every surviving unit on the board receives a special broadcast on all channels: **FACTORY_DESTROYED**. This is a system-level signal, not a player-configured hook — it arrives regardless of channel subscriptions. It occupies one context slot in every surviving unit's buffer, and it is pinned (cannot be evicted).

The pinned FACTORY_DESTROYED signal activates a dormant capability in every unit type: **scavenge mode.** When a unit with FACTORY_DESTROYED in its buffer moves adjacent to the wreckage of a destroyed unit (friendly or enemy), it can spend 2 ticks stationary to "salvage" the wreck. Salvaging produces one of two outcomes:

1. **Component Recovery:** The surviving unit gains a temporary skill for the remainder of the battle. A Scout that salvages a destroyed Striker's wreck might gain a single-use "engage" skill. A Relay that salvages a destroyed Specialist might gain a single-use "hack." The skill is weaker than the original (reduced range, one-time use, higher context cost) and occupies a context slot permanently — it is knowledge extracted from the dead, carried in working memory.

2. **Field Fabrication:** If the surviving unit is a Specialist or Command type, salvaging produces a new unit at the wreck location. The new unit is a **degraded copy** of whatever blueprint the factory would have produced next in the queue — same skills and rules, but with a buffer reduced by 2 slots (minimum viable). The field-fabricated unit spawns with FACTORY_DESTROYED already pinned. The production is slow (4 ticks instead of the factory's normal cooldown), expensive (consumes the salvaging unit's entire context window for those 4 ticks, leaving it stunned and vulnerable), and produces inferior units. But it produces units. From nothing. From the dead.

The mechanic name — Last Signal Protocol — frames this as something the AI player character designed in advance. The boot log for the mission that introduces it reads: "CONTINGENCY SUBSYSTEM INITIALIZED. In the event of primary fabrication loss, all units will receive emergency protocol broadcast. Surviving agents may extract capabilities from wreckage. This is not a plan. This is what happens after all plans fail."

---

## Player Journeys

### Journey 1: Mara, 28, Factorio Player, Mission 8 — The Fighting Retreat

**Minute 0:00 — Plan Phase**
Mara is configuring Mission 8, the first factory-vs-factory mission. She has a solid architecture: 2 Scouts on "east-recon" and "west-recon," 1 Relay at center compressing both feeds into "threat-summary," 2 Strikers listening on "threat-summary," 1 Specialist with hack skill, and a Command agent managing the production queue. Her factory is positioned at A2 (bottom-left corner). The enemy spawner is at H7 (top-right). She has designed her production queue to replace scouts first (they die most often), then strikers.

She notices a new entry in the Blueprint Codex: "Last Signal Protocol — Unlocked at Mission 8." She reads the card. "When factory is destroyed, surviving units enter scavenge mode. Adjacent to any wreckage, spend 2 ticks to extract a temporary skill or field-fabricate a degraded unit." She files it mentally as insurance she hopes she will not need.

**Minute 0:45 — EXECUTE**
She hits EXECUTE. The sealed watch begins. Tick clock: horizontal pips, 1 second each. Her scouts deploy from the factory conveyor. Signal chains light up — green dashes from scouts to relay, relay compresses, blue dashes from relay to strikers. The architecture hums. Ticks 1 through 15 play out smoothly. Her eastern striker eliminates two enemy units. Her specialist hacks an enemy relay, disrupting their signal chain for 3 ticks.

**Minute 1:30 — Tick 18: The Flanking Strike**
An enemy striker she did not see — it approached from the south, outside both scouts' perception radii — reaches tile A3. Adjacent to her factory at A2. One-shot-one-kill. The factory sprite shatters. Not the red flash of a unit death — a different animation entirely. The factory's warm amber glow cuts to black. The conveyor belt freezes mid-motion. A deep metallic groan plays — lower and longer than the sharp crack of a unit kill. Debris scatters across tiles A1, A2, A3, B2: grey pixel fragments, twisted metal, the ghost outline of the conveyor belt fading over 500ms.

Simultaneously, every surviving unit on the board pulses once with a white ring — the FACTORY_DESTROYED broadcast arriving. The pulse radiates outward from each unit like a sonar ping, 200ms, white fading to nothing. Each unit's context bar gains one new pip at the rightmost position: a white pip with a thin red border. The pinned FACTORY_DESTROYED signal. It does not evict. It does not decay. It sits there, occupying one slot, for the rest of the battle.

Mara's stomach drops. She still has 5 units alive: SCOUT-EAST, SCOUT-WEST, RELAY-CENTER, STRIKER-EAST, and SPECIALIST. But the production queue is dead. The conveyor belt is debris. No more reinforcements. Ever.

**Minute 1:50 — Tick 20: Scavenge Decision**
STRIKER-EAST eliminates the flanking enemy striker that destroyed the factory. The enemy wreck falls on tile A3 — adjacent to the factory debris. SCOUT-WEST is 3 tiles away, patrolling. Its rules include a new condition that Mara did not write but the Last Signal Protocol injected: IF FACTORY_DESTROYED AND wreckage_adjacent THEN scavenge. The scout begins patrolling toward A3.

Mara watches the scout arrive at B3 (adjacent to the enemy wreck at A3). The scavenge animation begins: the scout sprite dims to 70% brightness and a thin amber progress ring appears around the tile — 0% to 100% over 2 ticks. During these 2 ticks, the scout cannot move, perceive, or evaluate other rules. Its context bar flashes amber — all slots temporarily locked for the salvage operation. The scout is vulnerable. In a one-shot-one-kill game, 2 ticks of immobility is a lifetime.

**Minute 2:10 — Tick 22: Salvage Complete**
The progress ring completes. A small animation: pixel components float up from the wreck — tiny colored squares (weapon fragments in red, propulsion in yellow) — and absorb into the scout sprite. The scout's context bar now shows a new entry in the rightmost available slot: a cyan pip with a weapon icon overlay. The scout has extracted a single-use "engage" skill from the enemy striker's remains. It is a Scout with a weapon. Not a Striker — the engage skill is one-shot, half the range, and costs 3 context slots to activate (leaving the 6-slot Scout with only 2 free slots afterward). But it can fight.

Mara has never seen a Scout fight before. In all her previous missions, Scouts existed to perceive and signal. This Scout is carrying salvaged ordnance in its working memory. It has become something the blueprint never intended.

**Minute 2:45 — Tick 28: The Last Stand**
Three enemy units remain. Mara has STRIKER-EAST (healthy), SCOUT-EAST (healthy), SCOUT-WEST (with salvaged engage), and RELAY-CENTER (intact but increasingly irrelevant — with fewer units, there is less to relay). SPECIALIST died at tick 25 to an enemy flanker.

SCOUT-WEST encounters an enemy at C4. Its rule evaluates: IF FACTORY_DESTROYED AND enemy_adjacent AND has_temporary_skill(engage) THEN use_skill(engage). The cyan pip in the context bar flashes bright — activating. The scout fires its salvaged weapon. The enemy at C4 is eliminated. The cyan pip goes dark — skill consumed. The scout is a scout again. Unarmed. Diminished. But the enemy is dead.

**Minute 3:20 — Inspector**
The battle ends in a narrow victory: enemy base destroyed by STRIKER-EAST at tick 34. Mara opens the Inspector. She clicks the factory at tick 18. The destruction event is annotated: "FACTORY DESTROYED — Enemy Striker adjacent at A3. Last Signal Protocol broadcast to 5 surviving units. Scavenge mode activated."

She clicks SCOUT-WEST's timeline. At tick 20, the scavenge event: "SALVAGE: Enemy Striker wreckage at A3. Extracted: Engage (temporary, single-use, 3-slot activation cost)." At tick 28, the engage event: "TEMPORARY SKILL USED: Engage → eliminated ENEMY at C4. Skill consumed."

She scrubs back to tick 18 and watches the white broadcast pulse ripple across the board in slow motion. Every unit receiving the signal simultaneously. The moment the game shifted from "system running as designed" to "survivors improvising from wreckage." She realizes: the factory destruction was not the end. It was the beginning of a different game — a game of salvage, improvisation, and units doing things they were never designed to do.

---

### Journey 2: Kai, 35, Into the Breach Veteran, Mission 9 — The Field Fabrication Gambit

**Minute 0:00 — Plan Phase**
Kai has internalized the Last Signal Protocol from Mission 8. He is now designing around it. Mission 9 features a heavily defended enemy base with two spawners. His analysis: the enemy will likely send a flanking unit to his factory by tick 15-20. Instead of defending the factory (expensive — requires a dedicated striker on guard duty), he decides to let it die.

His plan: front-load production. Queue 2 Scouts, 2 Strikers, 1 Relay, 1 Specialist in rapid succession. Get everything onto the board by tick 12. When the factory falls (and it will), the Specialist — equipped with the "field fabricate" variant of scavenge — will produce emergency replacements from wreckage.

He positions the Specialist's patrol route to pass through the center of the board, where combat wreckage is likely to accumulate. He gives the Specialist a rule: IF FACTORY_DESTROYED AND wreckage_adjacent AND unit_count(scout) < 1 THEN field_fabricate(scout). The Specialist will replace dead scouts from enemy remains. The replacement scouts will be degraded (4 slots instead of 6), but functional.

This is a deliberate strategy. Kai is treating factory destruction not as a catastrophe but as a planned phase transition — from "factory production" to "field fabrication." The cost is inferior units. The benefit is freeing up the resources and board space that factory defense would have consumed.

**Minute 1:00 — Tick 14: The Planned Sacrifice**
Everything unfolds as predicted. His 6 units are deployed and fighting. The enemy flanker arrives at his factory on tick 14. Mara would have panicked. Kai exhales. The factory falls. The white broadcast pulse. FACTORY_DESTROYED pinned in every buffer. Scavenge mode active.

**Minute 1:30 — Tick 19: First Field Fabrication**
SCOUT-EAST died at tick 17. Its wreckage sits at E5. SPECIALIST moves to D5 (adjacent) at tick 18. Tick 19: the field fabrication animation begins. This is visually distinct from the scout's simple scavenge. The Specialist's sprite glows amber and a construction hologram appears on the wreck tile — a translucent, flickering outline of a Scout, assembling itself piece by piece over 4 ticks. The Specialist's context bar goes fully amber — all 10 slots locked for fabrication. For 4 ticks, the Specialist is a stationary, defenseless fabrication node. A sitting target.

Kai watches the construction hologram tick upward: 25%, 50%, 75%, 100%. At tick 22, the hologram solidifies. A new Scout stands at E5. Its context bar shows 4 pips instead of 6 — the degraded buffer. Two pip-slots at the right edge show the static-noise dead zone from aspect 1.20b. This scout was born diminished. It was built from salvage by a field technician, not assembled in a proper factory. Its mind is smaller. But it is alive. It has the same rules as the original SCOUT-EAST. It begins patrolling immediately, perceiving the area its predecessor died in.

The Inspector will later show this unit's lineage: "SCOUT-EAST-v2. Field-fabricated by SPECIALIST at tick 22. Source: SCOUT-EAST wreckage at E5. Buffer integrity: 67% (4/6). Blueprint: SCOUT-EAST (degraded copy)."

**Minute 2:15 — Tick 30: The Specialist's Dilemma**
STRIKER-WEST dies at tick 28. Its wreckage is at B6. The Specialist's rule evaluates: unit_count(scout) = 1 (the field-fabricated replacement is alive), so the scout fabrication rule does not fire. But the Specialist has no rule for fabricating strikers — Kai only wrote one for scouts. The wreckage sits unused.

This is the Into the Breach moment — the consequence of incomplete planning, visible in hindsight. Kai did not write a rule for every contingency. He planned for scout losses but not striker losses. The wreckage at B6 is a resource he cannot access because his rule set has a gap. Not a bug. A design flaw in his design. The game does not punish him with randomness or bad luck. It punishes him with the precise shape of his own oversight.

**Minute 2:45 — Inspector**
Kai opens the Inspector and immediately scrubs to tick 28. He clicks the STRIKER-WEST wreckage. The Inspector shows: "WRECKAGE: STRIKER-WEST. Salvageable components: Engage (temporary), Breach (temporary). Field-fabrication eligible: Yes (requires Specialist or Command adjacent)." He clicks the Specialist at tick 29. Rule evaluation trace: "Rule 1: IF FACTORY_DESTROYED AND wreckage_adjacent AND unit_count(scout) < 1 — FALSE (unit_count(scout) = 1). No further scavenge rules defined. Fallback: patrol."

The Specialist walked past a usable wreckage because Kai's ruleset was too narrow. Next attempt, he will add: IF FACTORY_DESTROYED AND wreckage_adjacent AND unit_count(striker) < 1 THEN field_fabricate(striker).

---

### Journey 3: Ana, 19, First Strategy Game, Mission 8 — The Accidental Discovery

**Minute 0:00 — Plan Phase**
Ana is on Mission 8 for the first time. She skimmed the Last Signal Protocol codex entry but did not fully understand it. Her configuration is straightforward: 2 Scouts, 1 Relay, 2 Strikers. No Specialist, no Command. She does not know that only Specialists and Command units can field-fabricate. She thinks scavenging is something every unit can do.

**Minute 1:15 — Tick 16: Factory Falls**
Her factory is destroyed by a flanking enemy. The white broadcast pulse fires. Every unit receives FACTORY_DESTROYED. Ana sees the white pip appear in each unit's context bar and reads the subtle change — she does not yet know what it means, but the visual is unmistakable. Something changed. Something new appeared in every unit's memory simultaneously.

**Minute 1:30 — Tick 20: The Scout Scavenges**
SCOUT-NORTH passes an enemy wreckage at D6. The injected scavenge rule activates. The amber progress ring appears. Ana stares. She did not write this rule. The scout is doing something she did not tell it to do. For two ticks, she watches the scout sit motionless, the amber ring filling, the context bar locked. She does not understand what is happening. Then the salvage completes. The cyan pip with the weapon icon appears in the scout's buffer. The scout resumes patrol — but Ana can see the new pip. Something changed in the scout's mind.

Three ticks later, the scout encounters an enemy. The salvaged engage skill fires. The enemy is eliminated. The cyan pip goes dark.

Ana's reaction is not tactical analysis. It is surprise. "The scout just FOUGHT something? Scouts can't fight!" She has discovered a mechanic through observation, not instruction. The sealed watch showed her something she did not design and did not expect. The Inspector will explain the mechanism. But the emotional beat — the surprise of a unit exceeding its design — happened during the watch, not the debrief.

**Minute 2:00 — The Failed Fabrication Attempt**
STRIKER-EAST moves adjacent to another wreckage. The scavenge rule fires — the striker begins the amber progress ring. But the striker is not a Specialist. It can scavenge for temporary skills (component recovery) but cannot field-fabricate new units. The salvage completes and the striker gains a temporary "breach" skill (redundant — it already has breach). The skill pip appears but adds no new capability.

Ana does not understand why the striker did not produce a new unit like she assumed it would. She expected a new robot to appear. Nothing appeared. Just a pip.

**Minute 2:30 — Inspector Discovery**
In the Inspector, she clicks the striker's scavenge event. The annotation reads: "SALVAGE: Component Recovery only. Field fabrication requires Specialist or Command unit." She clicks the scout's scavenge event: "SALVAGE: Component Recovery — Engage (temporary, single-use)."

She learns two things: (1) any unit can scavenge for temporary skills, but (2) only Specialists and Command units can fabricate new units from wreckage. Next run, she includes a Specialist in her lineup — not because a tutorial told her to, but because she saw the limitation in the Inspector and wants to bypass it.

---

## Strengths

**1. Preserves the Sealed Watch's Emotional Arc While Adding a New Act**
The sealed watch currently has two emotional movements: rising action (units deploying, architecture operating) and climax (combat resolution, victory or defeat). Factory destruction with Last Signal Protocol adds a third movement: the fall and the scavenge. The emotional shape becomes rise-fall-rise — the player experiences triumph, disaster, and then a scrappy improvised recovery. This is a richer emotional arc than binary win/lose, and it happens entirely within the sealed watch's non-interactive constraint. The player watches their system break and then watches it adapt in ways they partially designed (the scavenge rules) and partially did not anticipate (which specific skills are recovered, which wreckage is available).

**2. Creates "Accidental Stories" From Deterministic Systems**
The scout-with-a-weapon moment in Journey 3 is not scripted content. It emerges from the interaction of the scavenge mechanic, the wreckage location, and the unit's patrol path. The game does not say "here is a dramatic moment." The dramatic moment arises from the same deterministic tick-by-tick resolution that governs everything else. These emergent stories are the raw material of player-to-player word of mouth. "My Scout killed an enemy" is a sentence that should not be possible in Robot Uprising — and the fact that it becomes possible only after factory destruction makes it a story about surviving catastrophe.

**3. Rewards Deep Rule Writing Without Punishing Shallow Play**
Kai's Journey 2 shows a player designing around factory destruction as a deliberate strategy — writing specific scavenge rules for specific contingencies. Ana's Journey 3 shows a player who wrote nothing special and still benefited from the mechanic through the system-injected default scavenge rule. The mechanic scales: casual players get automatic component recovery; expert players get field fabrication through carefully authored rules on Specialist and Command units. The skill ceiling is high (planning fabrication chains from predicted wreckage locations) and the skill floor is low (units scavenge automatically, anything they find is better than nothing).

**4. Makes the Specialist and Command Units Essential in Late-Game**
Currently, the Specialist and Command units are the most complex and least intuitive unit types. New players avoid them. Last Signal Protocol gives both a clear, emotionally resonant purpose: they are the units that can rebuild your army from the dead. The Specialist is not just a hacker — it is your emergency fabrication node. The Command unit is not just a coordinator — it is the one that can allocate reserve fabrication points to the field. This gives players a visceral reason to learn these complex units: they are the difference between "game over" and "we can still fight."

---

## Weaknesses

**1. Conflicts with the Sealed Watch's "No Tools" Philosophy**
The Last Signal Protocol injects new rules into units that the player did not write. The system-injected scavenge rule ("IF FACTORY_DESTROYED AND wreckage_adjacent THEN scavenge") is not in the player's blueprint. It appears from outside the player's design. This creates an inconsistency: the game's identity is "you designed everything, for better or worse." System-injected rules violate that principle. The player might feel rescued by a mechanic they did not earn rather than saved by a design they authored.

**Mitigation:** Make the scavenge rule visible in the Plan screen as a locked, non-editable rule on every blueprint. The player sees it before EXECUTE. It reads: "PROTOCOL: IF factory_destroyed AND wreckage_adjacent THEN scavenge (system rule — cannot be removed or reordered)." The rule is always there, always visible, always lowest priority. The player knows about it and can plan around it, even if they cannot modify it. It is not a surprise rescue — it is documented emergency firmware.

**2. Field Fabrication's 4-Tick Vulnerability Window Is Potentially Unfun**
A Specialist spending 4 ticks immobile and context-locked to fabricate a unit is extremely vulnerable in a one-shot-one-kill game. If an enemy striker wanders into adjacency during those 4 ticks, the Specialist dies mid-fabrication. The fabrication fails. The wreckage is consumed. The player loses both the Specialist and the potential replacement. This double loss could feel punishing rather than dramatic, especially for players who do not yet understand enemy patrol patterns well enough to predict safe fabrication windows.

**Mitigation:** Fabrication-in-progress units (the translucent hologram) could block the tile, preventing enemy movement onto it. The Specialist is still vulnerable on its own tile, but the fabrication itself acts as a partial shield — enemies must destroy the Specialist first, and the hologram persists for 1 additional tick after the Specialist dies, producing a weaker unit (buffer -4 instead of -2). "The blueprint remembers even when the builder dies."

**3. Wreckage Availability Is Spatially Random**
The player cannot control where wreckage appears — it depends on where combat happens. A player whose units all die on the enemy's side of the board has wreckage far from their surviving units. A player whose units die near their base has convenient salvage. This spatial luck component sits uncomfortably in a game that values deterministic fairness.

**Mitigation:** Factory destruction itself always produces wreckage on the factory's tiles. The factory debris is always salvageable, always adjacent to where the factory stood. This guarantees at least one salvage source near the player's spawn area. Field wreckage from combat is a bonus, not the only option.

---

## Interaction Effects

### x One-Shot-One-Kill (Locked)
The scavenge mechanic creates a brief exception to the game's movement tempo. A scavenging unit is stationary for 2 ticks (component recovery) or 4 ticks (field fabrication). In a one-shot-one-kill game, immobility is near-suicidal. This tension is the mechanic's core drama: the player's units must choose between continued movement (survival) and scavenging (capability recovery). The trade-off is exactly the decision Cogmind players face when choosing between fleeing (safe but powerless) and stopping to pick up parts (dangerous but empowering). The immobility risk transforms scavenging from a free benefit into a genuine strategic gamble.

### x Buffer Pressure (2.01) and Degradation (1.20b)
The FACTORY_DESTROYED pinned signal permanently occupies one buffer slot in every surviving unit. For a Scout with 6 slots, this is 17% of working memory consumed by the knowledge that the factory is gone. This creates cascading buffer pressure: the Scout now has 5 effective working slots for observations and signals. If the Scout also salvaged a temporary skill (another pinned slot), working capacity drops to 4. The scout that rebuilds from wreckage pays for its new capability with cognitive capacity — it knows more but can hold less. This mirrors Cogmind exactly: equipping a found part consumes a slot that could hold something else.

### x Fabrication Points (2.17)
If the Forge Budget system is active, factory destruction has an additional consequence: all uncommitted Reserve Lane FP are lost. The Forge Ledger's reserve tokens dim and crack — a visual representation of resources that can never be spent. However, Factory Lane FP that were already committed to queued blueprints are not lost — they transfer to the Last Signal Protocol's field fabrication capacity. A Specialist field-fabricating from wreckage consumes 1 FP per unit from this transferred pool. When the transferred FP runs out, field fabrication becomes impossible even with available wreckage. This creates a post-factory resource economy that the player influenced through their pre-battle Forge Ledger allocation.

### x Command Agent Meta-Level
A Command agent with the "reassign" skill gains a powerful post-factory capability: it can reassign surviving units' rules to include more aggressive scavenge behavior. A Command agent that survives factory destruction becomes the field general of the rebuild — redirecting scouts toward wreckage, prioritizing which units scavenge and which continue fighting. This is the meta-level in its most dramatic form: the Command agent is building the system that rebuilds the army. The factory that builds the factory has been destroyed, and the Command agent becomes the emergency factory-of-last-resort.

### x Inspector Diagnostics
The Inspector gains a new visualization for post-factory battles: the **Salvage Map.** An overlay on the board showing wreckage locations (grey X markers), which units salvaged which wrecks (amber connecting lines), and what was recovered (small icons at the connection midpoint). The Salvage Map tells the story of the rebuild: "SPECIALIST salvaged wreck at E5, fabricated SCOUT-EAST-v2; SCOUT-WEST salvaged wreck at A3, gained temporary Engage." The map reads like a supply chain diagram — resource flows from wreckage through salvagers to recovered capability.

---

## Comparable Games

### Cogmind — The Direct Ancestor
The naked core mechanic is the explicit inspiration. Key design lessons: (1) the stripped-down state must be *faster* or *different*, not just *worse* — Cogmind's naked core is fast, Robot Uprising's factory-less army gains scavenge capabilities it did not have before; (2) rebuilding must use the same interaction vocabulary as normal play — Cogmind rebuilds by equipping parts (same as normal), Robot Uprising rebuilds by executing rules (same as normal); (3) the rebuild moment must be the player's most memorable story, not their most frustrating failure.

### FTL: Faster Than Light — Fighting with Damaged Systems
FTL's ship can lose individual systems (weapons, shields, engines) to enemy fire. The player fights on with degraded capability while crew members repair systems in real-time. The "hull breach in the weapons room while the shields are down" moment is FTL's naked core — everything failing simultaneously, the player triaging repairs with limited crew. The difference: FTL allows real-time player intervention (directing crew to repair). Robot Uprising's sealed watch does not. The recovery must be pre-designed, not improvised at runtime.

### Into the Breach — The Intentional Absence of Recovery
Into the Breach has no recovery mechanic. When a building is destroyed, it is gone. When a mech dies (rare), it is gone for that mission. The game deliberately avoids the "rebuild from nothing" moment because it would undermine the "every decision matters" philosophy — if you can recover from mistakes, mistakes matter less. Robot Uprising must answer the same objection: does the Last Signal Protocol make factory defense less important because the consequences of losing it are survivable? The answer must be: scavenge mode is worse than having a factory. Dramatically worse. It is survival, not recovery. The player limps to victory with degraded units and single-use skills, not a rebuilt army.

### XCOM — The Squad Wipe Recovery
XCOM's most punishing moment is the squad wipe — all soldiers killed on a mission. The game continues (you have a roster of soldiers back at base), but the loss is devastating: experienced soldiers are gone, equipment is lost, the campaign timeline shifts. The recovery is long and painful — training new recruits, rebuilding gear, accepting weaker squad compositions for several missions. Robot Uprising's factory loss creates a within-mission equivalent: the army you have is degraded, replacements are inferior, and the recovery (field fabrication) is slow and risky. The shared design principle: loss must hurt enough to be meaningful but not so much that the player quits.

### Darkest Dungeon — The Retreat Mechanic
When a Darkest Dungeon expedition goes badly, the player can retreat — abandoning the mission, losing some items and heroes, but keeping the survivors. The retreat is not failure (the heroes survive) and not success (the mission is abandoned). It is a managed loss. Robot Uprising's scavenge mode serves a similar function: factory destruction is not defeat, and the subsequent salvage-fueled fighting is not the original plan. It is a managed crisis — something between victory and defeat, a state where the player's design is tested not against the intended challenge but against the challenge of operating without infrastructure.

---

## Sensory Description: What Factory Destruction and Scavenge Mode Look and Sound Like

**The factory's death:** Not a red combat flash. A different visual language entirely. The factory sprite — warm amber, conveyor belt humming with a low mechanical purr, small pixel sparks where units are assembled — goes dark in stages. First the conveyor belt freezes (100ms). Then the amber glow cuts to grey (200ms). Then a structural collapse animation: the factory sprite compresses vertically by 30% over 300ms, pixel debris spraying outward in four directions. The debris settles on adjacent tiles as grey-brown pixel clusters — wreckage markers. The sound is a low, grinding metallic groan descending from 200Hz to 80Hz over 800ms, overlaid with a crackling electrical discharge. It is the sound of infrastructure dying. Heavier, slower, and lower than the sharp crack of a unit kill. The screen does not shake — this is not an action movie explosion. It is a system going offline.

**The broadcast pulse:** Simultaneous with the factory collapse, every surviving unit emits a single white ring that expands outward for 200ms and fades. The rings overlap across the board, creating a brief interference pattern — concentric white circles washing across the battlefield like a radar sweep. The sound is a single, clear, high-pitched tone (1200Hz, 300ms, clean sine wave) cutting through the factory's groan. It is the emergency broadcast. It is the last thing the factory ever transmits. Every unit receives it. The white pip appears in every context bar simultaneously — a coordinated visual snap, all bars gaining one pip at the same instant. The synchronization is the point: every unit in the army learned the same thing at the same moment.

**Scavenge mode ambient:** After the broadcast, the battlefield's audio shifts. The factory's background hum — present since it was built, so constant that the player stopped noticing it — is gone. Its absence is the most noticeable sound change. The battlefield is quieter. Signal chain sounds (the soft chime of messages passing between units) continue, but the mechanical baseline is missing. In its place: a faint, intermittent crackle from wreckage tiles. A dying-ember sound. The wreckage is not silent. It sparks occasionally — tiny pixel flashes of amber on the grey debris, accompanied by a 50ms electrical pop at random intervals. The wreckage is not dead. It is salvageable. The sound tells the player: there is still something useful in the ruins.

**The scavenge animation:** A unit adjacent to wreckage begins scavenging. The unit sprite dims to 70% brightness. An amber progress ring appears around the wreck tile (not the unit tile — the wreck is being worked on, not the unit). The ring fills clockwise over 2 ticks (component recovery) or 4 ticks (field fabrication). During the fill, small pixel particles drift from the wreckage toward the unit — amber for skills, cyan for fabrication components. The particles are sparse and slow, nothing like the frantic combat flash. This is careful work. Surgical extraction. The sound is a rhythmic tapping — metallic, precise, two taps per tick — like a jeweler's hammer. When the ring completes, a brief flash: amber for component recovery (the unit absorbed something), cyan for field fabrication (something new was born). The tapping stops. The unit brightens to 100%. The wreckage tile goes fully dark — salvaged, consumed, empty.

**The field-fabricated unit:** The hologram that appears during 4-tick fabrication is translucent — the unit sprite at 40% opacity, flickering at 4Hz, scan lines visible across its surface. It assembles bottom-up: first the base pixel row, then the body, then the head/sensor array. Each row appears with a faint digital chirp ascending in pitch (200Hz to 800Hz over 4 ticks). When fabrication completes, the hologram snaps to 100% opacity with a 50ms white flash and a satisfying mechanical click — the sound of something locking into place. The new unit's context bar is visibly shorter than a factory-produced version: 4 pips instead of 6 for a scout, with the static-noise dead zone from degradation marking its diminished capacity. The unit is functional. The unit is inferior. The unit is alive. That is enough.

---

## The Fundamental Design Question

Should factory loss be survivable at all?

The case for immediate defeat: factory destruction as game-over creates maximum stakes for factory defense. Every unit placement, every patrol route, every rule evaluation carries the weight of "if my factory falls, I lose." The simplicity is elegant. Protect your base or die. This is the StarCraft model, the classic RTS model, the model most players expect.

The case for Last Signal Protocol: Robot Uprising is not an RTS. The player does not control units at runtime. They cannot rally defenders to the factory when a flanking striker appears. They designed the defense (or failed to) before EXECUTE, and the sealed watch plays out their design. Punishing the player with immediate defeat for a flanking attack they could not counter at runtime feels arbitrary — it punishes the design gap but gives no chance to observe how the army adapts to catastrophic infrastructure loss. The most interesting question in the game is "how does your system handle situations you did not design for?" Factory destruction is the ultimate version of that question. Denying the player the chance to watch their answer is a missed opportunity.

The middle ground: factory destruction is survivable but the mission's difficulty curve spikes dramatically. No new units (except degraded field-fabricated ones). Permanent buffer slot consumed by the FACTORY_DESTROYED signal. Scavenging requires immobility in a one-shot-one-kill world. The expected outcome is still defeat — but not guaranteed defeat. The 10-15% of post-factory battles that end in victory become the game's most memorable moments. The naked core stories. The comeback tales. The "my Scout killed an enemy" moments that players tell each other. The mechanic exists not to make the game easier but to make defeat more interesting and victory more extraordinary.

---

## New Aspects Discovered

- **1.20c-i — Wreckage as persistent board state:** Full specification of wreckage tiles. Do they block movement? Do they provide cover? Do they decay over time? Interaction with terrain types (does wreckage on a rice terrace tile behave differently than wreckage on urban concrete?). The wreckage is a new tile state that the board has never had before — it needs visual language, mechanical rules, and interaction with all existing tile types.

- **1.20c-ii — Field fabrication blueprint inheritance:** When a Specialist field-fabricates from wreckage, which blueprint does the new unit inherit? The next item in the destroyed factory's queue? The blueprint of the unit that died? A fixed "emergency" blueprint? The inheritance rule determines whether field fabrication is predictable (queue-based) or adaptive (wreckage-based). Each model has different strategic implications.

- **1.20c-iii — Enemy factory destruction as player objective:** If the player's factory can be destroyed, can the enemy's factory (spawner) also be destroyed before all enemies are eliminated? Does destroying the enemy spawner trigger the enemy's own Last Signal Protocol, making remaining enemies more dangerous as they scavenge? Symmetry between player and enemy factory vulnerability.

- **1.20c-iv — The "voluntary purge" — Cogmind's SHIFT-ALT-P for Robot Uprising:** Could the player deliberately destroy their own factory before the enemy does? A suicide-factory strategy where the player front-loads production, then self-destructs the factory to deny the enemy a target and trigger scavenge mode early. The Cogmind parallel: sometimes being naked is the optimal strategy.

- **1.20c-v — Post-factory signal architecture collapse:** When the factory is destroyed, does the Relay network still function? The factory is not a signal node (it does not transmit or relay), but its destruction might disrupt adjacent Relays through EM shockwave (per 1.20b). The factory explosion could degrade nearby units' buffers, creating a cascading information architecture failure at the worst possible moment.
