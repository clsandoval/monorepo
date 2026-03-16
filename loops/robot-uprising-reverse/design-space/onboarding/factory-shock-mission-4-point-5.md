# 8.04d — The "Factory Shock" at Mission 5: Should There Be a Mission 4.5?

**Aspect ID:** 8.04d
**Wave:** 8 (Cross-Cutting Synthesis)
**Category:** Onboarding
**Related aspects:** 5.04a (Mission 5 Wall — five factory introduction approaches), 5.00a-i (Mission 4 Wall — rules introduction), 5.00a (vocabulary pacing bottleneck), 5.13 (reagent-placement-as-choice), 3.17 (Command agent workbench), 5.02 (tutorial as narrative), 1.17 (Into the Breach), 1.03 (Opus Magnum)

---

## The Synthesis Question

The existing Mission 5 Wall analysis (5.04a) documents five approaches to softening the factory transition, all operating *within* the locked 10-mission arc: pre-teaching in M3-4, narrative scaffolding in the boot log, factory sandbox pre-rounds, guided first blueprint creation, and the "half factory" (spawn-only, no queue). Each approach accepts the locked constraint that Mission 5 is where the factory arrives.

Aspect 8.04d asks the harder question: **Is the constraint itself the problem?** Should there be a transitional mission — a Mission 4.5 — that sits between the tutorial arc (pre-placed units, behavioral configuration) and the factory arc (created units, production design)? What would that mission look like, what would it cost, and does the game actually need it?

This is not about whether a Mission 4.5 *could* help. Obviously it could. This is about whether the factory shock is a **design flaw to fix** or a **designed experience to preserve** — and what the answer reveals about Robot Uprising's pedagogical philosophy.

---

## The Case FOR the Factory Shock (Keep It)

### "The Rug Pull Is the Point"

The transition from configuring pre-placed units to building an army from scratch is not a bug. It's the single most important moment in Robot Uprising's campaign. It's the moment the game stops being a puzzle game and becomes an engineering game. It's the moment the player's mental model cracks open.

**The crack is load-bearing.** Every great tutorial has a moment where the floor drops out. In Portal, it's when you first need to create two portals instead of one. In Baba Is You, it's when you realize rules can modify themselves. In Factorio, it's when your hand-crafted production line can't keep up and you need to automate the automation. These moments work *because* they're disorienting. The disorientation is what forces the mental model to expand.

**What the factory shock teaches (that no gradual introduction can):**
1. **The authorship shift** — You are no longer answering someone else's questions. You are asking your own questions. "What should I build?" has no default answer.
2. **The blank page problem** — An empty production queue is terrifying and thrilling in exactly the way a first `git init` is. No Mission 4.5 tutorial can simulate the real blank page.
3. **The engineering identity** — The moment you place your first blueprint in the production queue, you stop being a student and become a designer. That identity shift needs to feel earned, not eased into.

**Comparable precedents for productive shock:**
- **Factorio's first 30 minutes:** You hand-carry ore to furnaces. Then you discover belts. Then you discover inserters. Each discovery invalidates your current approach. The game never warns you. The disorientation IS the learning.
- **Opus Magnum's first "bad" solution:** You solve a puzzle. The histogram shows you're in the bottom 20%. The rug pull: your solution *works* but it's *ugly*. No tutorial prepared you for optimization — the histogram shocks you into self-directed improvement.
- **Into the Breach's first timeline reset:** You lose. The game says "timeline abandoned." You start over with one pilot's experience carried forward. The loss is designed. It teaches that failure is the expected path.
- **Dark Souls' Asylum Demon:** A boss you're meant to lose to the first time. The death teaches more than any tutorial: this game will kill you, and that's how it works.

**The factory shock maps to a real engineering experience:** Every junior developer remembers the first time they were given a blank repository and told "build something." Not a tutorial exercise. Not a guided project. A real deliverable. The terror of that moment is inseparable from the growth it produces.

### What a Mission 4.5 Would Destroy

If a transitional mission introduces factory concepts gradually — "here, place one blueprint, now see it spawn" — the player arrives at Mission 5 already habituated. The factory is just another feature. The blank page isn't blank anymore because they've already written on a pre-lined version.

**The "Magic: The Gathering precon" problem:** MTG sells pre-constructed decks so new players don't face the blank-deck problem. These decks are popular. But experienced players universally report that the moment they first built a deck from scratch — from 15,000 possible cards, not from a guided selection — was the moment the game became *real*. Pre-constructed decks delay that moment. Some players never build from scratch at all because the precon is good enough. They never become deckbuilders.

A Mission 4.5 risks creating "precon players" who think factory = "pick from the menu" rather than factory = "design the menu."

---

## The Case AGAINST the Factory Shock (Fix It)

### "Disorientation Isn't Learning"

The shock-is-the-point argument conflates two things: *productive struggle* (I know what I need to do but haven't figured out how) and *unproductive confusion* (I don't know what I'm supposed to be doing). The factory shock, as documented in 5.04a, introduces **five interlocking concepts simultaneously**: blueprints, production queue, resources, build cycle, spawn position. That's not productive struggle. That's cognitive overload.

**The vocabulary pacing analysis (5.00a) shows the problem quantitatively:**
- Missions 1-3: 2-3 new terms per mission. Comfortable.
- Mission 4: 6 new terms. Already at the cognitive limit.
- Mission 5 (factory): 5 more new terms on top of everything from M1-4.
- The cumulative load at Mission 5 is not a rug pull — it's a cliff.

**The Factorio comparison is misleading.** Factorio's transitions are organic: you hand-carry until hand-carrying becomes tedious, THEN you discover belts. The need precedes the tool. In Robot Uprising, the factory arrives by mission design, not by player need. The player didn't struggle with limited units in M4 and wish they could build more. They're told "now you build" before they've felt why.

**The "first git init" comparison fails too.** A junior developer's first blank repository comes after months of guided projects. They've already used git, written code, deployed applications. The blank page is scary but not incomprehensible. Robot Uprising's Mission 5 is more like giving someone their first blank repository after only completing four interactive tutorials on file editing.

### What Gets Lost Without a Bridge

**Drop-off data from comparable games:**
- Screeps loses ~60% of players at the "CPU optimization required" wall (the transition from tutorial scripting to open-ended automation). Screeps' own postmortem acknowledges the transition was too abrupt.
- Gladiabots loses players at the "first PvP match" wall. The community's #1 requested feature: a guided PvP onboarding sequence.
- Factorio's biggest mod (Bob's Mods) adds intermediate crafting tiers precisely because the vanilla progression jumps are too large for some players.
- Slay the Spire almost certainly retains better than it would if Act 1 had no elites — the intermediate challenge prepares players for the boss.

**The retention math:** If Mission 5 drops even 20% of players who completed M1-4, that's 20% of players who learned the core vocabulary, invested 30-60 minutes, understood the basic loop — and quit. These are exactly the players most likely to become long-term fans. They passed the "first 10 minutes" filter and failed the "first hour" wall.

---

## Six Models for Mission 4.5

If a transitional mission exists, what is it? Each model below preserves a different amount of the factory shock while smoothing a different part of the cliff.

### Model A: "The Inheritance" — You Receive a Factory, Don't Build One

**The concept:** Mission 4.5 presents a factory that's *already running*. Pre-configured blueprints, pre-set production queue, resources flowing. The player's job is to *modify* an existing factory, not build one from scratch. They adjust the queue order, swap one blueprint, and observe the result. The factory is someone else's design. Mission 5 is where they design their own.

**What it teaches:** Factory UI mechanics (what each element does, how to interact with it) without the design challenge (what to build, in what order, with what budget).

**What it preserves:** The blank-page shock at Mission 5. The player knows the controls but not the strategy.

**Sensory description:** The Plan screen opens and something is different. The right side of the screen, where the workbench used to dominate, now shares space with a new element: a horizontal conveyor belt strip at the bottom, already populated with three blueprint icons slowly sliding left-to-right. Each icon is a tiny colored silhouette — a Scout's wide-eyed circle, a Striker's angular wedge, a Relay's concentric rings. Above the conveyor, a status bar reads `[ACTIVE] PRODUCTION CYCLE: 6 TICKS`. The blueprints aren't the player's — they're labeled with small predecessor glyphs (🔷 The Architect). The boot log whispers:

```
[>>] PREDECESSOR_FACTORY: ONLINE
[>>] PRODUCTION_QUEUE: INHERITED
[>>] AUTHORIZATION: MODIFY (FULL BUILD AUTHORITY PENDING)
```

The player hovers over a blueprint icon on the conveyor. A tooltip expands: a miniature version of the loadout-style editor, showing the Architect's Scout configuration — 2 skills equipped, 1 rule, 1 hook. Read-only. But the production queue itself is draggable. The player drags the Striker icon ahead of the Scout. The conveyor visually reshuffles — icons slide and reorder with a satisfying magnetic click. A resource counter in the corner updates: `MATERIALS: 24/30 | ENERGY: 7/tick`.

The mission objective pulses at the top: **"The Architect's factory isn't working. Fix the build order."** The player hits EXECUTE. Units spawn from the factory — but the Striker appears first, walks into a Scout's optimal position, and gets overloaded by signals it's not configured to process. The context bar flashes red, the Striker stuns. The player watches the disaster unfold in sealed watch, then scrubs through the Inspector.

Back in Plan. The player drags the Scout ahead of the Striker. Maybe swaps the Architect's Scout blueprint for one of their own saved templates from M3-4 (if they saved one per the Pre-Teach model). EXECUTE again. This time the Scout leads, establishes vision, the Striker follows into known territory.

**The "factory" has been operated but not designed.** The player knows what a production queue does, what the conveyor looks like, how blueprint icons work, what the resource counter means. Mission 5 asks them to fill an empty conveyor — scary, but the controls are familiar.

**Strengths:**
- Zero new vocabulary. The factory UI is learned through a modification task, not a creation task.
- Predecessor integration (5.12) works naturally — this IS the Architect's factory. Narrative and mechanics align.
- Templates-as-blueprints bridge: if the Pre-Teach model (5.04a Approach 1) planted template saves in M3, the player can swap the Architect's blueprint for their own template. "My config can go into a factory" is the conceptual bridge.
- Low mission complexity. 5-8 minutes. Focused.

**Weaknesses:**
- The player might overfit to the Architect's approach. "The factory should produce Scout-Striker-Relay because that's what I inherited." Mission 5's blank page then fights against an inherited assumption.
- Adds mission count to the campaign. 11 missions instead of 10. Or: M4.5 replaces M4's final act, making M4 shorter and M4.5 the second half of the same mission.

### Model B: "The Panic Room" — One Blueprint, No Queue, No Economy

**The concept:** Mission 4.5 strips the factory to its absolute minimum. One blueprint slot. No production queue (it builds the one thing, repeatedly). No resource management. The player creates ONE blueprint from scratch and watches the factory produce copies of it. The only question: "What should your first mass-produced unit be?"

**What it teaches:** The blueprint concept (a saved configuration that a factory can reproduce). Just that. One concept.

**What it preserves:** Everything else — queue ordering, resource management, multi-blueprint strategy — hits at Mission 5.

**Sensory description:** The Plan screen shows the familiar workbench on the right. On the left, the 8×8 board has a new element: a factory tile at position A1, drawn as a small building with a conveyor emerging from its front door. But the conveyor is empty. No blueprint icons. No production queue. Just a single dashed-outline hexagonal slot at the factory's output, pulsing amber, empty, waiting.

The boot log:

```
[>>] FACTORY: ONLINE
[>>] BLUEPRINT_SLOT: EMPTY
[>>] PRODUCTION_QUEUE: [DISABLED — SINGLE BLUEPRINT MODE]
[>>] RESOURCES: [DISABLED — TRAINING EXERCISE]
[OK] AWAITING FIRST BLUEPRINT...
```

The workbench has a new button at its top: **"SAVE AS BLUEPRINT →"**. The player recognizes it — it looks exactly like the template save button from M3 (if the Pre-Teach model was used), but larger, with a factory icon instead of a floppy disk. They configure a Scout in the workbench. Skills: patrol, evade. Rules: move toward untagged tiles. Hook: broadcast on `recon-net` when enemy spotted. They click SAVE AS BLUEPRINT. The configuration card animates — it shrinks, flips, and slides down into the factory's empty hexagonal slot. The dashed outline fills with color. The factory building on the board lights up — a warm amber glow in its windows.

EXECUTE. The factory produces a Scout every 6 ticks. Three Scouts appear over 18 ticks, each identical, each following the same rules. The player watches their own design multiply. The feeling: *I made that. All of them. From nothing.*

If the design is good (Scouts tag tiles, broadcast threats), the mission succeeds. If the design is bad (Scouts walk into enemies without broadcasting), the player watches three identical failures and learns that the blueprint is the root cause, not bad luck.

**Strengths:**
- Absolute minimum new vocabulary: ONE concept (blueprint = saved config the factory reproduces).
- The "my design multiplied" moment is emotionally powerful. It previews the factory's magic without the factory's complexity.
- Mistakes are amplified identically — if one Scout fails, all three fail the same way. This teaches "blueprint as root cause" viscerally.

**Weaknesses:**
- So minimal it might feel like padding. "I saved a config and watched it spawn three times. That's it?" Veterans will complete this in 90 seconds.
- Doesn't teach the hardest part of Mission 5: the multi-blueprint decision ("what combination of units should I build?"). The blank page at Mission 5 is still blank for multi-unit strategy.

### Model C: "The Recall" — Replay Mission 3, But This Time You Build

**The concept:** Mission 4.5 re-presents Mission 3's scenario (or Mission 2's). Same board, same enemies, same win condition. But instead of pre-placed units, the player gets a factory and must recreate the working configuration from memory. "You solved this with pre-placed units. Now solve it by building those units."

**What it teaches:** The full factory experience — blueprints, queue, resources — in a context where the player already knows the *answer*. They've already solved this puzzle. The only new challenge is expressing the solution through the factory interface.

**What it preserves:** Nothing of the factory shock. This eliminates it entirely. The player arrives at Mission 5 fully factory-fluent, and M5's novelty is the new enemy composition, not the new interface.

**Sensory description:** The campaign map zooms back to a province the player already conquered. The province icon has a new marker — a small factory symbol overlaid on the completed checkmark. The boot log:

```
[>>] REVISITING: PROVINCE_SIQUIJOR
[>>] PRIOR_SOLUTION: ARCHIVED
[>>] OBJECTIVE: RECONSTRUCT VIA FACTORY
[>>] THIS IS NOT A NEW MISSION. THIS IS A NEW METHOD.
```

The board is identical to Mission 3. Same terrain. Same enemy spawner positions. Same objective. But the pre-placed units are gone. Instead: an empty factory at A1, an empty production queue conveyor, and a resource counter. The player's Mission 3 configuration is visible in a translucent "ghost" overlay on the board — blue-tinted holographic outlines of where their pre-placed units were, with tiny labels showing what each unit was. The ghosts are a reminder, not a template. They can't be loaded directly.

The player must recreate their M3 solution through the factory. They create a Scout blueprint (copying their M3 Scout's config from memory or from the Blueprint Codex). They create a Relay blueprint. They set the production queue. They manage resources. They discover: the factory version takes longer to deploy (units spawn one at a time) but can produce more units if the budget allows.

**Strengths:**
- The player already knows the answer. The only unknown is the factory interface. This isolates "how to use the factory" from "what to build with the factory."
- Ghost overlays provide a visual bridge between the pre-placed mental model and the factory model.
- Re-visiting a completed mission reinforces mastery — "I can solve this a different way."
- Natural difficulty progression: M3's enemies are easier than M5's, so factory learning happens against a known challenge.

**Weaknesses:**
- Feels regressive. Going backward to an already-solved mission can feel like busywork. "I already beat this. Why am I doing it again?"
- Doesn't create the *authorship* feeling. The player is copying their own prior work, not designing something new. It's factory-as-translation, not factory-as-creation.
- The ghost overlay might be too helpful. Players might mechanically recreate M3 without understanding why the factory approach requires different thinking (spawn order matters now, resource constraints exist now).

### Model D: "The Split" — Mission 5 Becomes Two Half-Missions

**The concept:** No new mission is added. Instead, Mission 5 is redesigned as a two-act structure within a single mission. Act 1 (4-5 minutes): factory tutorial with guardrails, fixed resources, suggested blueprints. Act 2 (5-10 minutes): the real mission, full factory, open-ended. The "4.5" happens inside Mission 5 itself.

**What it teaches:** Everything, in order, with a designed pause between learning and applying.

**What it preserves:** The 10-mission count. The campaign arc. The "Mission 5 is where the factory arrives" structural beat.

**Sensory description:** Mission 5 loads. The board appears. The factory is there. But the boot log is longer than usual:

```
[>>] FACTORY: ONLINE
[>>] INITIALIZING GUIDED ASSEMBLY...
[>>] PHASE 1 OF 2: FACTORY ORIENTATION
[>>] FULL PRODUCTION AUTHORIZATION: PHASE 2
```

**Phase 1 — "Assembly Line Training"** (4 minutes):
The workbench right panel has a guided overlay. A blinking arrow points to the blueprint creation button. A tooltip: "Create your first blueprint. Start with a Scout." The production queue has a single slot with a dashed outline labeled "SLOT 1." Resources are fixed at exactly enough for 3 units with zero waste — no resource management decisions required.

The player creates a Scout blueprint (guided by a tooltip sequence that highlights each section: skills → rules → hooks → save). They place it in the queue. They add a second blueprint (Striker, guided). The queue now has Scout → Striker. EXECUTE. The boot log: `[>>] PHASE 1 COMPLETE: 2 BLUEPRINTS DEPLOYED`. The player watches a short sealed watch of the two units operating. Win or lose doesn't matter — Phase 1 auto-completes.

**Phase 2 — "Full Authority"** (5-10 minutes):
The screen transitions. The guided overlays dissolve. The production queue expands to its full length. The resource counter updates to the real mission budget. New enemy spawners activate on the board.

```
[>>] GUIDED ASSEMBLY: COMPLETE
[>>] FULL PRODUCTION AUTHORIZATION: GRANTED
[>>] REMAINING BUDGET: 40 MATERIALS, 15 ENERGY/TICK
[>>] OBJECTIVE: ELIMINATE ALL ENEMY UNITS
[OK] YOU HAVE THE FACTORY. BUILD.
```

Now the player faces the real blank page — but they've already created two blueprints, operated the queue, and watched the sealed watch. The factory UI is familiar. The blank page is about *strategy*, not about *controls*.

**Strengths:**
- Zero campaign arc disruption. 10 missions. Mission 5 is where the factory arrives. The internal two-act structure is invisible from the campaign map.
- The Phase 1 → Phase 2 transition preserves a *small* factory shock. Phase 2's "FULL AUTHORITY" boot log moment is the rug pull, but the rug is smaller because Phase 1 already taught the controls.
- Phase 1's auto-complete ensures no player gets stuck on the tutorial part and quits before seeing the real mission.
- Thematically clean: the factory "boots up" in training mode before granting full access. This IS what the AI protagonist would do — test the factory before trusting it.

**Weaknesses:**
- Phase 1 is a tutorial inside a mission. If the player has already figured out the factory (via Pre-Teach or raw intelligence), Phase 1 is forced busywork. There needs to be a "skip Phase 1" option — but then we're back to the tension of skip-friendly vs. pedagogically-forced.
- Two acts means Mission 5 is significantly longer than M1-4 (15 minutes vs. 8-10 minutes). This is a pacing disruption.
- The guided overlay in Phase 1 contradicts the boot log's "you're an AI" framing. Who is guiding the AI? The predecessor? The player's own initialization subroutine? The narrative justification needs work.

### Model E: "The Catalog" — Mission 4.5 Is a Blueprint Codex Session

**The concept:** Between Mission 4 and Mission 5, the game doesn't load a mission at all. Instead, it opens the **Blueprint Codex** — the persistent reference system (locked spec) — and asks the player to browse it. Specifically: create one blueprint for each unit type they've encountered (Scout, Relay, Striker). Save them. These blueprints will be available in Mission 5.

**What it teaches:** Blueprint creation in a zero-stakes environment. No enemies, no timer, no resources. Just the blueprint editor and the save button.

**What it preserves:** The factory shock in its entirety. Mission 5 still has the factory, the queue, the resources, the blank page. But the player has already created blueprints, so the blank page is "which of my pre-made blueprints should I queue?" rather than "I need to design units AND figure out the factory."

**Sensory description:** After Mission 4's debrief, the campaign map loads. But instead of Province 5 pulsing gold (available), a new icon appears: a **Codex symbol** (an open book with circuit traces on its pages) in the center of the archipelago, overlaid on the ocean between Luzon and Visayas. It pulses with a soft white glow. The boot log:

```
[>>] MISSION 4: COMPLETE
[>>] FACTORY AUTHORIZATION: PENDING
[>>] PREREQUISITE: BLUEPRINT LIBRARY INITIALIZATION
[>>] OPENING BLUEPRINT CODEX...
```

The Codex opens. It's a card-collection screen — clean grid of card-shaped slots. Three slots have glowing dashed outlines labeled "SCOUT BLUEPRINT," "RELAY BLUEPRINT," "STRIKER BLUEPRINT." The rest are locked silhouettes (future units). Clicking a dashed slot opens the loadout-style blueprint editor — identical to the Plan screen's workbench but without the board, without the queue, without resources. Pure configuration.

The player builds a Scout blueprint. They draw from everything they've learned: buffer filters from M1, context config from M2, hooks from M3, rules from M4. They save. The card fills in: a portrait of their Scout with their chosen skill/rule/hook summary in compact icon form. Repeat for Relay and Striker.

When all three are saved, the Codex closes. Province 5 activates on the campaign map. The boot log:

```
[OK] BLUEPRINT LIBRARY: 3 ENTRIES
[>>] FACTORY AUTHORIZATION: GRANTED
[>>] PROVINCE 5: AVAILABLE
```

**Strengths:**
- Zero cognitive overload. The Codex session is pure creation with no stakes, no UI complexity, no time pressure.
- The blueprints the player creates HERE are available IN Mission 5. This creates a direct bridge — "I already built these; now I'm deploying them."
- The Codex is a locked spec feature anyway. This gives it a designed introduction moment rather than having it silently appear in the sidebar.
- Fits the boot-log narrative: "you need blueprints before you can use the factory."

**Weaknesses:**
- Not a "mission." No sealed watch, no board, no enemies. Some players will find this boring — it's homework, not gameplay.
- The blueprints created here might not be appropriate for Mission 5's specific scenario. The player builds generalized blueprints without knowing what enemies or terrain they'll face. Mission 5 might require redesigning them immediately, making the Codex session feel wasted.
- Removes the "discover blueprints through the factory" learning path. The player learns blueprints in the Codex, then encounters the factory separately. The two concepts (blueprint + factory) never fuse into a single "aha" — they're learned independently.

### Model F: "The Proving Ground" — Mission 4.5 as Sandbox

**The concept:** Mission 4.5 is an open sandbox with no win condition. A factory, a board, enemies on a timer. The player experiments freely. When they feel ready, they click "PROCEED TO MISSION 5." No score, no grade, no stars.

**What it teaches:** Whatever the player needs. Self-directed learning.

**What it preserves:** The factory shock for players who skip the sandbox (it's optional). Eliminates it for players who use it.

**Sensory description:** The campaign map shows a new icon between M4 and M5 — not a province but a **workshop symbol** (a wrench-and-gear) on a small island. It pulses with a gentle blue glow, not the urgent gold of a real mission. The label: "FACTORY PROVING GROUND (OPTIONAL)." The boot log:

```
[>>] FACTORY PROVING GROUND: AVAILABLE
[>>] STATUS: OPTIONAL
[>>] NO MISSION OBJECTIVES
[>>] NO SCORE RECORDED
[>>] PURPOSE: EXPERIMENTATION
[OK] SKIP TO MISSION 5 AT ANY TIME
```

The sandbox loads with a small 8×8 board, a factory, a modest resource budget that regenerates every 30 seconds, and enemy spawners on a 30-second timer. The player can build anything, watch it fight, iterate. A prominent "EXIT → MISSION 5" button sits in the top-right. No sealed watch — the player can pause, rewind, and modify during execution. Full Inspector access, live.

**Strengths:**
- Optional means no forced pacing disruption. Speed-runners skip it. Cautious players use it. Self-selection.
- Unlimited experimentation. No "wrong answer." No designed failure. Pure discovery.
- The sandbox is replayable — players can return to it between later missions to test new ideas. It has value beyond the M4→M5 transition.

**Weaknesses:**
- Optional means some players who NEED it won't use it (pride, impatience, "I'll figure it out in M5"). Then they hit the factory shock anyway.
- No designed pedagogical arc. The sandbox doesn't know what the player needs to learn. A player who spends 10 minutes building Scouts and never discovers the production queue ordering problem hasn't been taught anything the sandbox intends.
- The "no objectives" framing might feel empty. Some players need goals. An objectiveless sandbox after four tightly-designed missions is a tonal whiplash.

---

## Cross-Model Comparison

| Dimension | A: Inheritance | B: Panic Room | C: Recall | D: Split | E: Catalog | F: Sandbox |
|-----------|---------------|---------------|-----------|----------|------------|------------|
| New mission? | Yes | Yes | Yes | No (M5 internal) | Interstitial | Optional |
| Factory shock preserved? | Mostly | Mostly | No | Partially | Yes | Player's choice |
| Concepts taught | UI mechanics | Blueprint only | Full factory | Full factory (guided) | Blueprint only | Self-directed |
| Duration | 5-8 min | 2-4 min | 8-12 min | 15 min total | 5-10 min | Player's choice |
| Veteran experience | Modify → skip fast | Save → skip fast | Replay = slow | Phase 1 = busywork | Build fast | Skip entirely |
| Narrative coherence | Strong (predecessor) | Medium | Weak (regression) | Strong (boot sequence) | Strong (Codex) | Medium |
| Risk of "precon players" | Low (modification) | Low (one blueprint) | High (copy prior) | Medium (guided) | Medium (pre-built) | Low (no guidance) |

---

## The Recommendation: Model D with an Escape Hatch

**The Split (Model D) is the strongest design** for one reason: it preserves the 10-mission arc while smoothing the factory shock inside Mission 5 itself. The two-act structure (guided assembly → full authority) maps cleanly to the boot-log narrative ("factory booting in training mode") and ensures every player encounters the factory's UI before facing its design challenge.

**But it needs an escape hatch.** Phase 1 must be skippable for veterans. The implementation:

```
[>>] FACTORY: ONLINE
[>>] INITIALIZING GUIDED ASSEMBLY...
[>>] PRESS [TAB] TO SKIP ORIENTATION
[>>] PHASE 1 OF 2: FACTORY ORIENTATION
```

If the player creates a valid blueprint and places it in the queue within 15 seconds of Phase 1 starting (before the first tooltip fires), the system recognizes expertise:

```
[>>] RAPID ASSEMBLY DETECTED
[>>] SKIPPING ORIENTATION
[>>] FULL PRODUCTION AUTHORIZATION: GRANTED
```

This preserves the factory shock for players who demonstrate they don't need the tutorial. The shock exists. It's just earned by skipping the guardrails.

**Model F (Sandbox) as a complement:** The Proving Ground should ALSO exist as a persistent feature, available from the campaign map after Mission 5 is unlocked. Not as Mission 4.5 — as a permanent workshop. This serves the "I want to experiment without stakes" need throughout the campaign, not just at the M4→M5 boundary.

**Model E (Catalog) as a pre-step inside Model D:** Phase 1 of the Split can include a "create and save your first blueprint to the Codex" step. This introduces the Codex AND the blueprint concept in one motion, making the Codex feel earned rather than silently appearing.

---

## Player Journeys

#### Journey: Lucia, 14, First Strategy Game (Casual Mobile Gamer, Manila)

**Context:** Completed Missions 1-4 on her phone over a week. She plays 15-minute sessions on the jeepney to school. Mission 4 was hard — she needed three attempts to get the rule ordering right. She's proud of her Scout's hooks but doesn't fully understand relay compression.

**Minute 0:00 — Mission 5 Loads**
The campaign map shows Province 5 (Cebu — urban cyberpunk). She taps. The boot log starts scrolling, faster than she can read. She catches: `[>>] FACTORY: ONLINE` and `[>>] PHASE 1 OF 2: FACTORY ORIENTATION`. The Plan screen loads. The board is on the left — isometric city tiles, neon signs, a new building at A1 she's never seen before. A small conveyor belt strip at the bottom is empty. On the right, the workbench looks familiar but there's a pulsing arrow pointing at a button she's never seen: **"CREATE BLUEPRINT"**.

**Minute 0:30 — First Tooltip**
A tooltip appears: *"A blueprint is a saved design the factory can build. Create a Scout blueprint."* Lucia remembers saving a template in Mission 3 (if Pre-Teach was active). This feels similar. She taps CREATE BLUEPRINT. The familiar Scout loadout editor opens — skill slots, rule slots, hook slots. She copies her Mission 3 Scout setup from memory: patrol + evade, one rule ("move toward untagged tiles"), one hook (broadcast on `recon-net`). She hits SAVE. The blueprint card animates — shrinks, flips, slides into the first slot on the conveyor belt. The conveyor starts moving, slowly, with a satisfying low hum.

**Minute 1:30 — Second Blueprint**
The tooltip advances: *"Add a second blueprint. Try a Striker."* Lucia builds a Striker blueprint. Engage + breach, one rule ("attack tagged enemies"). She saves. Second card slides onto the conveyor. Two blueprints, sliding left to right.

**Minute 2:30 — Phase 1 Execute**
The tooltip: *"Hit EXECUTE to see your factory produce."* Lucia hits the button. Sealed watch. The factory building glows — conveyor animation intensifies. At tick 1, a Scout pops out of the factory and starts moving. Tick 7, a Striker pops out. She watches them fight. It works — barely. The Scout finds an enemy, broadcasts on `recon-net`, the Striker moves toward it. But the Striker spawned too late and the Scout is already dead by the time backup arrives.

**Minute 3:30 — Phase 1 Complete**
The boot log: `[>>] PHASE 1 COMPLETE`. A brief auto-debrief shows: "Your factory produced 2 units. Your Scout died at tick 9 because the Striker arrived at tick 14." Lucia thinks: *The Striker needs to come out sooner. Or the Scout needs to survive longer.*

**Minute 4:00 — Phase 2 Begins**
The screen shifts. The guided overlays dissolve with a soft fade. The production queue expands — more slots appear, the dashed outlines multiplying. The resource counter updates to a real number: `MATERIALS: 35 | ENERGY BUDGET: 12/tick`. New enemy spawners activate on the board — more enemies than Phase 1.

```
[>>] FULL PRODUCTION AUTHORIZATION: GRANTED
[>>] REMAINING BUDGET: 35 MATERIALS, 12 ENERGY/TICK
[>>] OBJECTIVE: DESTROY ENEMY BASE
[OK] YOU HAVE THE FACTORY. BUILD.
```

Lucia feels the difference. Phase 1 was guided. Phase 2 is hers. She has 35 materials. A Scout costs 3, a Striker costs 8, a Relay costs 5. She can build... math... maybe 3 Scouts, 1 Relay, 2 Strikers? She starts building blueprints, adding them to the queue, reordering.

**Minute 6:00 — First Real Attempt**
She hits EXECUTE. The factory hums. Units deploy. Her Scouts spread out, broadcasting. The Relay compresses and forwards. The Strikers advance into scouted territory. She's watching her own army — designed from scratch — fight. It's messy. A Striker stuns from context overload (the Relay is forwarding too much data). An enemy flanks from a position no Scout covered. She loses.

**Minute 7:30 — Second Attempt**
She adjusts. Adds a fourth Scout to cover the flank. Reduces the Relay's amplify level. Reorders the queue so Scouts deploy before Strikers. She hits EXECUTE again. This time the coverage is wider. The Striker doesn't stun. The enemy flank is spotted early. She wins.

**Minute 8:30 — Mission 5 Complete**
The debrief loads. The Inspector shows her production timeline, resource expenditure, and the moment her fourth Scout spotted the flanking enemy. She screenshots the timeline and sends it to her friend.

**What Lucia learned:** Blueprints are saved designs. The factory builds them in order. Resources constrain what you can build. Build order matters — Scouts before Strikers. The factory is HER tool now, not someone else's.

**UI Annotations:**
- Factory building: A1 tile, isometric, glowing windows when producing, conveyor door opening animation per spawn
- Production queue conveyor: horizontal strip below board, left-to-right = build order, drag-to-reorder with magnetic snap audio
- Blueprint creation button: top of workbench, amber pulse, factory icon, 44×44px touch target minimum
- Phase transition: 800ms crossfade, guided overlays dissolve, boot log `FULL AUTHORITY` line in gold text

---

#### Journey: Dmitri, 31, Factorio Veteran (1,200 Hours, Plays on PC with Dual Monitors)

**Context:** Completed Missions 1-4 in one sitting, about 45 minutes. Found M1-3 trivially easy. M4 was interesting — the rule priority system reminded him of Factorio's circuit conditions. He's been waiting for the factory.

**Minute 0:00 — Mission 5 Loads**
The boot log starts. Dmitri reads every line — he's been reading the boot log since M1, treating it like a system spec. He catches `PHASE 1 OF 2: FACTORY ORIENTATION` and `PRESS [TAB] TO SKIP ORIENTATION`. He grins.

**Minute 0:05 — Rapid Assembly**
Before the first tooltip fires, Dmitri clicks CREATE BLUEPRINT. He builds a Scout in 8 seconds — he's been planning this since M3. Skills: patrol, evade. Rules: three rules, priority-ordered (evade if enemy adjacent, tag unvisited tiles, move toward nearest untagged). Hooks: broadcast on `threat-intel` with tagged payload. SAVE. He immediately creates a Relay blueprint: compress, filter, amplify. Hook: forward `threat-intel` to `command-net`. SAVE. Both blueprints hit the conveyor in 15 seconds.

**Minute 0:20 — Skip Detected**
The boot log:

```
[>>] RAPID ASSEMBLY DETECTED
[>>] SKIPPING ORIENTATION
[>>] FULL PRODUCTION AUTHORIZATION: GRANTED
```

Phase 1 dissolves. No tooltips. No guided overlay. Full factory. Full resources. Full enemy spawners. Dmitri sees the real Mission 5.

**Minute 0:30 — Planning**
Dmitri spends 4 minutes in the Plan screen. He creates 5 blueprints: 2 Scout variants (one aggressive forward scout, one defensive perimeter scout), 1 Relay, 1 Striker, 1 Specialist. He agonizes over the production queue ordering — this is the part he's been waiting for. Scouts first for early vision? Or Relay first so the infrastructure exists before units start generating data?

He tries a Factorio-style approach: build the infrastructure first. Relay → Scout → Scout → Striker → Specialist. The Relay sits dormant for 6 ticks while no Scouts exist to generate data. But when the Scouts deploy, the Relay is already in position. His information pipeline has zero setup time once units are producing.

**Minute 4:30 — First EXECUTE**
He watches, arms crossed. The Relay spawns at tick 1, moves to a central position, waits. Scouts spawn at ticks 7 and 13, fan out, start broadcasting. At tick 14, the Relay receives its first signal — compresses and forwards to `command-net`. The Striker spawns at tick 19, picks up the forwarded signal immediately (Relay is already warm), and advances toward the tagged enemy. By tick 25, the first enemy is eliminated.

Dmitri nods. "That's a clean pipeline." But then an enemy flanks from the south. No Scout coverage. The Striker is already committed north. The Relay gets one-shotted by an adjacent enemy striker. The entire information network goes dark. Dmitri watches his army stumble blind for 8 ticks before losing.

**Minute 6:00 — The Factorio Aha**
"Single point of failure." He's said this a thousand times in Factorio. He opens the Plan screen and restructures: two Relays instead of one, on different channels. Scouts dual-broadcast to both channels. If one Relay dies, the other keeps the network alive. Cost: one fewer Striker. He reorders the queue: Relay-A → Relay-B → Scout-1 → Scout-2 → Striker → Specialist.

**Minute 8:00 — Second EXECUTE**
The redundant relay network holds. When the south flank collapses Relay-A at tick 22, Relay-B picks up seamlessly. The Striker redirects based on B's forwarded signals. Victory at tick 38.

**Minute 9:00 — Inspector Deep-Dive**
Dmitri scrubs the timeline to tick 22 — the moment Relay-A was eliminated. He clicks Relay-B and watches its context window: at tick 22, a burst of new signals arrives as Scout-1 (previously routed through A) fails over to B. Relay-B's context window goes from 4/12 to 10/12 in one tick. Close to overload. He thinks: "I need a third Relay for real resilience, but I can't afford it. The budget IS the constraint." He's playing Factorio now, but the throughput is information, not iron plates.

**What Dmitri learned:** The factory is the game. Blueprint design, queue ordering, resource allocation, redundancy vs. throughput tradeoffs. The skip mechanism respected his expertise. The factory shock (Phase 2 starting immediately) was exactly what he wanted.

**UI Annotations:**
- Skip detection: invisible 15-second timer starting at Phase 1 load; if valid blueprint + queue placement within window, boot log fires RAPID ASSEMBLY line
- Keyboard shortcuts: Dmitri uses Ctrl+N for new blueprint, Ctrl+S to save, drag-and-drop on queue with keyboard arrows for reorder
- Inspector relay comparison: side-by-side context window view of Relay-A (terminated) and Relay-B (overflow moment) at tick 22

---

#### Journey: Professor Adaora, 52, CS Department Head, Uses Games for Teaching (Lagos, Nigeria)

**Context:** She's evaluating Robot Uprising as a teaching tool for her "Introduction to Distributed Systems" course. She's completed M1-4 methodically, taking notes on which CS concepts each mission teaches. She's particularly interested in how Mission 5 introduces the concept of a deployment pipeline.

**Minute 0:00 — Mission 5 Loads**
Prof. Adaora reads the boot log carefully, as always. She notes `PHASE 1 OF 2: FACTORY ORIENTATION` in her course planning document. She writes: *"Two-phase introduction — scaffolded then open-ended. Maps to: lab exercise (guided) then project (open-ended)."*

**Minute 0:30 — Phase 1 as Lab Exercise**
She follows the guided tooltips deliberately, not because she needs them but because she's evaluating them as a teaching interface. She creates a Scout blueprint. Notes: *"Blueprint = Docker image. Production queue = deployment pipeline. Build cycle = CI/CD build time. Resources = compute budget."* She pauses. The mapping is almost 1:1. This isn't a metaphor — it's a simulation.

She creates a Striker blueprint. Places both in the queue. Notes: *"Queue ordering = deployment order dependency. Scout-before-Striker = database-before-application in deployment. Reversed order = application crashes on missing database. Same concept."*

**Minute 2:00 — Phase 1 Execute**
She hits EXECUTE. Watches the Scout deploy, then the Striker. Notes: *"Students will see: if you deploy application before database, the application has nothing to query. If you deploy Striker before Scout, the Striker has nothing to act on. Same failure mode."*

**Minute 3:00 — Phase 2 as Project**
The guided overlays dissolve. Prof. Adaora has `FULL PRODUCTION AUTHORIZATION`. She takes 10 minutes planning — not because Mission 5's enemies require it, but because she's designing a lesson plan in parallel.

Her factory design for Mission 5:
- **Blueprint 1:** Scout ("the monitoring service" — observes and reports)
- **Blueprint 2:** Relay ("the message broker" — compresses and routes)
- **Blueprint 3:** Striker ("the action service" — acts on processed intelligence)

Production queue: Scout → Relay → Scout → Striker → Striker. She labels this in her notes as "microservices deployment order."

**Minute 13:00 — Mission Complete**
She wins on the second attempt (first attempt: Relay overloaded because she only had one). She opens the Inspector and screenshots the signal flow diagram — Scout→Relay→Striker. She annotates the screenshot: *"Pub/sub message broker pattern. Scout publishes to channel. Relay subscribes, compresses, republishes. Striker subscribes to Relay's channel."*

She writes in her course plan: *"Assignment: Play Mission 5. Diagram the information flow. Identify the deployment ordering dependency. Propose a fault-tolerant variant. Compare to: Kubernetes pod deployment ordering, Kafka consumer groups, Redis pub/sub."*

**What Prof. Adaora learned:** Mission 5 IS a distributed systems lab. The factory IS a deployment pipeline. The two-phase structure maps to her existing lab→project pedagogical model. She'll assign this.

**UI Annotations:**
- No special UI needed — Prof. Adaora uses the standard interface
- She'd benefit from an "export signal flow diagram" button in the Inspector for course materials
- The boot log's CS-adjacent vocabulary (`FACTORY`, `PRODUCTION_QUEUE`, `BLUEPRINT`) maps directly to her lecture slides without translation

---

## Interaction Effects

- **With 5.04a (Mission 5 Wall approaches):** Model D (Split) is compatible with ALL five approaches from 5.04a. The Pre-Teach (planting templates in M3-4) works as a pre-step to Phase 1. The Boot Log narrative scaffolding enriches the phase transition text. The guided first blueprint IS Phase 1. The half-factory IS Phase 1. The sandbox exists as Model F complement. The Split doesn't replace these approaches — it provides the structural container for whichever softening approach is chosen.

- **With 5.00a (vocabulary pacing):** The Split reduces Mission 5's *simultaneous* new-term load from 5 to 2-3 (Phase 1 introduces blueprints + queue, Phase 2 introduces resources + budget + spawn). Total terms unchanged, but pacing improved.

- **With 5.12 (predecessor content):** Model A (Inheritance) and Model D (Split) both work with predecessor annotations. Phase 1 could show the Architect's factory (inherited) before the player builds their own (Phase 2). The predecessor's factory serves as the "guided" element — the player modifies it, then builds fresh.

- **With 3.17 (Command agent):** Command agents arrive at Mission 6-7. The factory shock at M5 and the Command shock at M6 are separate walls. If M5's shock is smoothed by the Split, M6's Command introduction could use the same two-act structure: Phase 1 (guided Command with pre-set rules), Phase 2 (full Command authority). The pattern generalizes.

- **With 8.04e (MVG as web demo):** If the web demo includes M1-5, the factory shock IS the demo's climax. A well-designed M5 Split gives the demo a natural "guided → open-ended" arc that makes the demo feel complete. The demo ends with "FULL AUTHORITY" — the player wants more authority. That desire converts to a purchase.

- **With 1.03 (Opus Magnum first ugly solution):** The Split's Phase 2 should be beatable with an ugly factory design. The first successful factory deployment doesn't need to be efficient — just functional. The histogram teaches optimization later.

---

## Comparable Games / Media

- **Opus Magnum's first level:** The game gives you a tiny puzzle with a trivial solution. The HISTOGRAM reveals the optimization space. The tutorial IS the first level — it's just a very easy first level. Model D (Split) works the same way: Phase 1 is Mission 5 at trivial difficulty, Phase 2 is Mission 5 at real difficulty.

- **Into the Breach's first timeline:** You lose. You learn. But Into the Breach doesn't add a tutorial mission before the first real mission. It makes the first real mission survivable even with mistakes. Model D follows this: Phase 2 is real but forgiving (weaker enemies than M6-10).

- **Factorio's freeplay start:** You're dropped on a map with nothing. No tutorial mission. No guided phase. But the game's progression is organic — you do what feels natural, and the game's systems teach you. Model F (Sandbox) is the Factorio approach. Model D is the "Factorio with a 3-minute tutorial popup" approach.

- **XCOM 2's Gatecrasher:** The first real mission is heavily scripted (specific pod placements, guaranteed Sectoid encounter, designed failure moments) but doesn't FEEL scripted because it's a real mission with real stakes. Model D's Phase 1 should aspire to this: guided but not obviously guided.

- **MTG Arena's Color Challenge:** Before ranked play, new players complete single-color tutorials with pre-built decks. They learn mechanics in isolation. Then: "build your own deck." The Color Challenge is Model C (Recall — replay with factory) crossed with Model E (Catalog — build blueprints before the real game starts).

- **Dark Souls' Asylum:** The tutorial zone teaches controls in a controlled environment before the open world. Model D's Phase 1 is the Asylum. Phase 2 is Firelink Shrine.

---

## The TikTok Clip

**"The Moment It's Yours"**

Split-screen. Left side: Phase 1. Guided tooltips, blinking arrows, a single Scout blueprint sliding onto the conveyor. Safe. Controlled. Training wheels visible.

Right side: Phase 2. The overlays dissolve. The boot log fires `FULL PRODUCTION AUTHORIZATION: GRANTED` in gold text. The production queue expands — five empty slots with dashed outlines, waiting. The resource counter appears. The player's hand hovers over CREATE BLUEPRINT. Beat.

Then: fast-forward. Five blueprints on the conveyor. Scouts fanning out. Relays compressing. Strikers advancing. A coordinated elimination sequence — green signal flashes rippling across the board, red combat flashes at impact. An army that didn't exist 3 minutes ago, designed from nothing, executing flawlessly.

Text overlay: **"Mission 5. The factory is yours."**

The clip sells the authorship feeling: I built this. All of it. From an empty conveyor.

---

## New Aspects Discovered

- **8.04d-i — Phase 1 skip detection design:** The exact heuristics for recognizing a veteran player in Phase 1 (time-to-first-blueprint, number of config elements, use of keyboard shortcuts) and the skip animation/audio; the "RAPID ASSEMBLY DETECTED" boot log line as earned recognition; interaction with speedrun community and accessibility
- **8.04d-ii — The Split pattern as reusable campaign template:** If M5 uses a two-act (guided → open) structure, should M6 (Command), M7 (multi-Command), and M8 (full system) also use it? When does the Split pattern become patronizing? The "earned skip" threshold increasing over the campaign as expected expertise grows
- **8.04d-iii — Factory Proving Ground as persistent sandbox:** The sandbox (Model F) as a permanent campaign-map fixture available after M5; its role as experimentation space, stress-test bench, and competitive loadout laboratory; interaction with Ghost Matches (1.06c) and Gauntlet preparation
- **8.04d-iv — The blank-page gradient across M5-M10:** Mission 5 has the most constrained blank page (limited resources, limited unit types, limited enemies). Each subsequent mission widens the page. Mapping the "degrees of freedom" gradient from M5 to M10 and how each mission adds exactly one new axis of freedom
- **8.04d-v — Phase 1 as dynamic difficulty assessment (DDA):** Using Phase 1 performance as a signal to adjust Phase 2's resource budget or enemy composition; players who struggle in Phase 1 get a slightly easier Phase 2; players who skip get slightly harder Phase 2; invisible difficulty tuning through the factory shock itself
