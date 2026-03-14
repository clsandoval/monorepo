# Competitive Analysis: Screeps

**Category:** Persistent-World Programming RTS / MMO Sandbox
**Developer:** Screeps LLC (Artem Loginovskikh, originally)
**Released:** November 16, 2016 (Early Access ~2014)
**Platform:** PC (Windows/Mac/Linux), Steam, Web browser; Screeps Arena is a separate title
**Price:** World: $19.99 base (CPU above 20ms/tick requires subscription or one-time unlock ~$19.99/mo or $7/mo); Arena: $19.99 flat
**Reception:** Very Positive on Steam — 87/100 score, ~2,036 reviews; ~200,000–500,000 estimated owners; "probably one of the best online communities I've been part of" (community member)
**Note on dev trajectory:** Active development stalled ~2021–2022 as team pivoted to Screeps Arena. Core game hasn't received significant updates; community self-maintains via private servers and open-source mods. Classic case of "sequel abandonment" of original game.

---

## What It Is

Screeps is the extreme endpoint of a design axis that begins at Shenzhen I/O ("program a microcontroller for fixed puzzles") and ends at "program an autonomous empire that fights other empires for real, forever, without your intervention."

The word "Screeps" means "scripting creeps." You are not given a puzzle. You are given a persistent colony in an MMO world — think a cell on a shared Google map that runs 24/7 — and the only way you affect it is by writing JavaScript. When you log off, your colony keeps running. When you sleep, your bots mine, build, fight, and expand (or die). Your score is your territory. Your territory is a function of how good your code is.

The fundamental design premise: **your colony is a software system, not a game character.** You are not an in-game commander. You are the author of the system. The colony is the system in production.

---

## Core Loop

### Every 3 seconds (one real-world tick)

The game server processes one tick. Every active player's JavaScript `main()` function runs against a frozen snapshot of the previous tick's world state. Your function issues commands. At the tick boundary, all commands resolve simultaneously.

Each tick, your code typically:
- Iterates over your creeps, checking their current task
- Issues movement, harvest, build, attack, or transfer commands
- Reads room memory for cached decisions

**This is the atomic unit of play.** You never see the world in motion — you see tick-snapshots. Your code issues commands, the server simulates, the result is a new snapshot. The feeling is less "realtime RTS" and more "sequential program that manifests in a simulated world."

### Every 5–100 ticks (batched computation)

Because the game charges you CPU time per tick, players quickly learn to stagger expensive operations. A typical veteran Screeps bot:
- Re-evaluates hostile creep positions every 5 ticks (they move; stale data is worse than no data after ~10 ticks)
- Re-evaluates structure health every 20 ticks (towers fire; walls degrade more slowly)
- Rebuilds territory influence maps every 100 ticks (room ownership shifts slowly)
- Never recalculates terrain (it never changes)

This creates a **natural information staleness hierarchy** embedded in the code itself. Veterans are defined by whether they understand WHEN to update different categories of information, not just HOW.

### Every session (human-scale: 15 minutes to 2 hours)

A typical session looks like:
- Check the overnight report: did anything die? Did the expansion succeed? Is CPU usage within budget?
- Diagnose any failures: why did the harvester stop? Find the bug.
- Add one new behavior: write the soldier spawn logic, or the tower defense reaction
- Deploy, watch a few ticks execute, observe behavior
- Log off, let it run

This is **not** a gaming session — it's closer to deploying code to production and watching logs. The game does not demand your attention. It rewards the quality of your engineering.

### Replayability: What Brings Players Back

- Scripting a new behavioral capability and watching it work for the first time (the "first auto-miner" moment, the "first successful raid" moment)
- Territory expansion pressure: neighboring players encroach on your rooms, requiring defensive scripting
- Seasonal worlds: fresh start, equal footing, time-boxed competition
- Open-source AI comparison: many players publish their bots (like Overmind); reading others' architectures is a metagame
- The "okay but what if I just refactored this whole thing" itch

---

## The CPU Budget: The Real Scarcity

Screeps has a mechanic more interesting than any of its units: **CPU is the actual resource you manage.**

Each account gets a CPU budget per tick (20ms free; up to 500ms with subscription/unlock). Every API call consumes fractional CPU. Reading a list of creeps costs CPU. Pathfinding costs CPU. Accessing Memory (which is serialized/deserialized from JSON each tick) costs CPU proportional to its size.

The result is that **architectural decisions are optimization decisions.** Two bots that behave identically on the battlefield can have wildly different CPU profiles. The veteran who caches pathfinding results and staggers lookups can run 10 rooms on 20ms CPU. The beginner recalculating paths every tick for every creep can't run 1 room without overrunning budget.

**The CPU Bucket** is a rollover mechanism: unused CPU accumulates (up to 10,000ms). This allows bursts — spending 300ms on one tick for a heavy computation — amortized against ticks where you spend only 5ms. The design teaches: not all computation is urgent. Defer what you can. Batch heavy operations.

This is the most direct design parallel to Robot Uprising. In Robot Uprising, **the context buffer is the analogous scarcity.** Both force the same question: "What information is actually worth keeping?" Both reward architectural thinking over raw behavior specification. Both punish naive "just check everything every tick/event" approaches.

---

## Information Management: The Stale World Problem

Screeps embeds a fundamental information constraint in its execution model that players don't immediately understand: **your code runs on last tick's reality.**

A game object retrieved this tick is technically from this tick's frozen snapshot — but the world it describes is already one simulation step old by the time you issue commands. Commands you issue won't manifest until next tick. So every action your code takes is a prediction: "I believe the creep is still at X, so I command it to harvest from Y nearby."

This creates **information lag as a first-class game mechanic**, even though most beginners don't notice it for weeks.

Veteran Screeps architecture (exemplified by the open-source Overmind AI) handles this through a layered caching model:

1. **Raw world state** — direct API reads (creep positions, structure HP, room objects). Never cached; always from current tick.
2. **Computed state** — derived analytics (influence maps, threat levels, franchise routes). Cached with explicit invalidation conditions.
3. **Persistent memory** — decisions that should survive ticks (pathfinding caches, role assignments, territory intents). Stored in `Memory` object; costs CPU to serialize.
4. **Selectors** — meaningful groupings that aggregate (all my harvesters in Room 5; all enemies within 5 squares of my spawn). Recomputed on demand, cached for the tick.

The **Boardroom Analyst pattern** (documented in the Field Journal blog series) captures this cleanly: a specialist module that computes one class of information once per tick, memoizes it, and returns cached results to any system that asks during the same tick. The analyst knows when its source data is dirty; when dirty, it recomputes; otherwise it serves from cache.

**Translation to Robot Uprising:** The latency visualization (aspect 4.13) is essentially the Screeps stale-world problem made visible. An agent acting on 3-hop-old intelligence should look different from an agent acting on fresh data. The debrief's "signal age at time of action" overlay is the equivalent of Screeps' implicit information lag — but made explicit, learnable, legible.

---

## The Hierarchy of Command: Overmind Architecture

The most sophisticated publicly-released Screeps bot is Overmind (github.com/bencbartlett/Overmind), which implements a three-tier hierarchy inspired by StarCraft's Zerg:

- **Overlords** — manage individual creeps within a single room. Assign tasks, issue tick-level commands.
- **Overseers** — monitor colony state and place Directives (named goals) in response to environmental stimuli.
- **Assimilator** — enables collective hivemind behavior: Overmind players can share creeps and resources as a coordinated faction.

The **Directive** abstraction is particularly relevant. An Overseer doesn't say "creep A, go mine room B." It places a Directive object in a room: "MINE_SOURCE: priority 7, source at [25, 14]." Overlords watch for Directives in their domain, spin up appropriately-typed creeps to fulfill them, and clear the Directive when complete. This decouples "what needs to happen" from "which unit does it."

This is exactly the command-agent architecture from Robot Uprising's Wave 3 meta-level (aspects 3.17–3.19). The Overseer IS a command agent. Directives are the signals it injects into subordinate agents' contexts. The Overlord-managed creeps are the leaf agents.

**The design lesson:** Command hierarchies in Screeps emerge from the CPU budget constraint. You can't run a sophisticated per-creep AI for 50 creeps within 20ms. You need a commander that allocates roles cheaply, and simple role-executors that run efficiently. The hierarchy is forced by the constraint.

**Translation to Robot Uprising:** The context buffer constraint should force the same emergent hierarchicalization. An army of 8 full-AI agents will overflow their buffers. An army of 1 smart commander + 7 role-executors — where the commander manages information flow and the executors only carry what they need for their role — is more efficient. The game should teach this by making the naive approach visibly inefficient.

---

## Screeps Arena: The Match-Based Variant

Screeps released a separate game, Screeps Arena, in late 2021. Design differences that are directly relevant:

| Feature | Screeps World | Screeps Arena |
|---------|--------------|---------------|
| Session type | Persistent MMO (months-long empire) | 1v1 match (1,000 ticks ≈ <1 minute) |
| Code runs when? | 24/7, even offline | Only during match |
| Player interaction | Write → deploy → check logs tomorrow | Write → watch immediately |
| Pressure model | Slow territorial attrition | Fast tactical execution |
| CPU cost | Subscription for competitive play | One-time purchase |
| Emotional register | Production system ownership | Tournament nerves |
| Matchmaking | None (organic territory conflict) | ELO, async queue |

Arena is essentially what Robot Uprising already is: self-contained scenarios, your code vs. the scenario, fast execution, immediate feedback. It solved the core accessibility problem of World (the 24/7 commitment, the "you were attacked while sleeping" anxiety, the months-long time horizon) by sacrificing the persistent ownership fantasy.

Arena has significantly fewer reviews (92 vs 2,036 for World), despite being cheaper and arguably more accessible. This is counterintuitive — it suggests that Screeps' audience valued the persistent world aspect, not just the programming puzzle aspect. The MMO ownership fantasy was the draw. The match-based version lost that even while gaining accessibility.

**Design implication for Robot Uprising:** If Robot Uprising goes full match-based (self-contained missions), it loses the "your empire, running right now, growing while you work" feeling. But it gains the ability to be completed, to have a campaign arc, to not require 24/7 server costs. This is probably the right trade — but designers should consciously compensate for the loss of "ownership feeling" through other means (campaign persistence, cosmetics, named units that survive across missions, etc.).

---

## What Players Love (Positive Reviews)

- The moment when the colony first runs autonomously: *"I wake up and check my phone — we've expanded to three rooms overnight"*
- Discovering an elegant architectural pattern that dramatically reduces CPU usage
- The genuine JavaScript skills that transfer to the job: *"I used techniques I learned in Screeps in my actual codebase"*
- Community: unusually helpful, collaborative, knowledge-sharing (many publish full bots open-source)
- The depth ceiling: no matter how good your bot, there's always a better architecture

## What Players Hate (Negative Reviews)

- The subscription/CPU paywall: the game is effectively pay-to-win above a certain scale
- **The 24/7 anxiety**: *"I got invaded and lost 3 weeks of work because I was on vacation"*
- Onboarding cliff: tutorial ends, and then you're dropped into a fully competitive MMO with nothing
- Stale tech: the game expects Node 8 from 2019; the client is laggy; the dev team moved on
- Endgame monotony: high-GCL play becomes micromanagement of an empire that mostly runs itself, with occasional crisis

---

## Player Journeys

#### Journey: Marco, 28, Junior Software Developer

**Context:** Week 1 of Screeps World. Has just finished the in-game tutorial. Has 2 rooms claimed, 3 creeps running. Never built a game bot before.

**Minute 0:00 — The Tutorial Ends**
Marco stares at the console. The tutorial told him to create a harvester, a builder, and an upgrader. He did. They're running. But he notices: the harvesters aren't filling up and going back. They're circling. Something is wrong in the movement logic.

He opens his code. There's a condition: `if (harvester.store.getFreeCapacity() > 0)`. He stares at it for two minutes. Then notices: the condition fires when there's *free* capacity, but he's checking it in the "go harvest" branch, not the "go deposit" branch. He has the logic inverted.

He fixes it. Clicks "Save & Commit" in the web editor. Watches the next tick. The harvester turns and heads to the source. He pumps his fist.

*This is the core Screeps feeling: debugging a distributed system in production. It's frustrating. It's satisfying. It's real.*

**Minute 45:00 — CPU Warning**
An hour of adding behaviors later, a red banner: "CPU LIMIT EXCEEDED." Marco's creeps stop executing. He's written code that recalculates the full room scan every tick, and he now has 6 creeps all doing it. 60 ms used vs. 20 ms allowed.

He reads the docs. Learns about `Memory` as persistent storage. Learns about the bucket. Learns that `Game.rooms[name].find()` is expensive and should be cached.

He rewrites the harvester to save its target's ID to memory on first assignment, only recalculate if the ID is missing or the target is dead. CPU drops from 60ms to 12ms.

*First exposure to the "information caching is performance" lesson that will define the next 100 hours.*

**UI Annotations:**
- Web editor: code panel on left (Monaco editor, dark theme), visualization panel on right (2D map with creep icons)
- Creeps shown as colored squares with role letters (H for harvester, B for builder)
- Console output below map: real-time tick output, errors, your `console.log` calls
- Memory viewer: JSON tree showing the current state of `Memory` object, updated each tick
- CPU bar in top right: green→yellow→red as usage approaches limit

---

#### Journey: Priya, 34, Experienced Backend Engineer

**Context:** Month 2. Has 5 rooms, ~20 creeps, solid but messy codebase. Has hit the "my code is a mess of special cases" wall. Starting fresh with a modular architecture.

**Minute 0:00 — The Refactor Decision**
Priya opens her codebase. It's 2,000 lines in a single file. There are 15 `if` statements checking whether a creep is a "special defender" because she kept adding exceptions to the harvester logic. She knows this pattern from work. It's the same spaghetti she's seen in production codebases.

She writes a new architecture: a `CreepManager` base class, role subclasses (Harvester, Builder, Soldier, Relayer), a `ColonyDirector` that surveys the room each tick and issues tasks to the manager pool.

This will take 3 sessions. She starts with the Harvester class.

**Minute 30:00 — The Information Staleness Discovery**
The new Harvester logic looks correct, but her harvesters keep moving to already-depleted energy sources. She adds logging: the source ID she saved to memory is correct, but the source's energy reading from memory shows 300 while the actual source is empty.

The bug: she's reading `source.energy` from the cached memory object rather than the live API. Memory is one tick old — she stored the energy value *last tick*. The source was harvested to zero *this tick*. Her cache is stale.

She restructures: cache only the source's ID (permanent), never cache its current energy (volatile). Read live data from the API for anything that changes tick-by-tick.

*The information staleness lesson: not all data has the same freshness requirements. ID = stable. Position = mostly stable. Energy level = volatile. The architecture must encode this distinction.*

**Minute 60:00 — The Stagger Pattern Discovery**
Her ColonyDirector was scanning all rooms every tick. That's expensive. She adds a `if (Game.time % 20 === 0)` guard — refresh the full room scan only every 20 ticks.

But now there's a lag: she places a new construction site manually, and it takes 20 ticks before a builder gets assigned. The tradeoff: freshness costs CPU, staleness creates lag.

She adds a priority interrupt: if a new construction site appears (detected via a room event listener), force an immediate rescan regardless of the 20-tick schedule.

*This is the "notification vs. polling" architecture pattern. Most intermediate programmers know it from web dev. Screeps teaches it via the cost of getting it wrong.*

**UI Annotations:**
- Tick counter in top bar: `Game.time: 3,841,202` — the game has been running for millions of ticks since server launch
- Room view: heatmap overlay toggleable showing CPU usage per room
- Profiler (third-party tool): per-function CPU time breakdown over last 100 ticks
- Memory segment view: Priya has started using the Memory segments API for larger caches, bypassing the JSON parse cost

---

#### Journey: Reiner, 42, Staff Software Engineer, Has Played Screeps for 3 Years

**Context:** Top-500 player. 15 rooms across two sectors. Runs a heavily optimized custom bot. Has contributed to the Screeps community wiki. Checks in 15 minutes daily.

**Minute 0:00 — The Morning Report**
Reiner opens the web client on his phone during commute. His bot automatically logs a digest to the console every 100 ticks:
```
[T:4,982,301] DIGEST: 15 rooms | 84 creeps | CPU: 18.3ms avg |
  Energy: 142k stored | ALERT: Room W4N12 under attack (3 hostile creeps) |
  Expansion probe: W5N13 scouted, neutral, recommend claim
```

Three hostile creeps in W4N12. His `ThreatResponder` has already activated the room's towers (automatic). His `Overseer` has flagged a Defender spawn request. Two ticks later, a defender spawns.

He doesn't intervene. He watches the combat in the replay viewer. The defender takes out two of the three hostiles; the third retreats. Reiner adds a note to review whether the defender loadout needs upgrading for this hostility level.

*This is the endgame Screeps fantasy: your empire runs itself, you only tune it.*

**Minute 5:00 — The Expansion Decision**
W5N13 is neutral. The scout report shows a Source Keeper room (high-value but defended by powerful NPCs). Reiner's bot can't claim it directly; it needs a specialized harvester loadout with TOUGH parts and a Ranged Attacker escort.

He doesn't write this capability. He searches the community wiki. There's a documented "Source Keeper Harvesting" architectural pattern. He adapts it to his bot's class structure.

The implementation: a new `SourceKeeperHarvester` role that spawns with [TOUGH, TOUGH, WORK, WORK, MOVE, MOVE, HEAL] body parts, maintains 4-square distance from the SK while harvesting, runs when HP < 60%, returns when energy full.

He deploys. Watches the scout enter W5N13. Correct behavior. Starts the expansion queue.

*The meta-skill: knowing where to find solutions, how to adapt them, and how to evaluate whether they fit your architecture.*

**Minute 15:00 — CPU Budget Audit**
Reiner runs his profiler for the day. One module is creeping up: `InfluenceMap.recalculate()` is taking 4.2ms and it's running every 50 ticks. That's ~8ms/tick amortized. He can make it more efficient by only recalculating sectors where room ownership has changed.

He adds a dirty-flag system: rooms that haven't changed ownership skip the recalculate. Drops to 1.1ms amortized.

*The endgame Screeps grind: performance engineering on a system that's already working. Finding the last 10% of efficiency.*

**UI Annotations:**
- Reiner uses the standalone web client, not Steam, because it's less laggy
- Room viewport: toggleable overlays for territory influence (blue heat), threat level (red heat), CPU allocation (yellow heat)
- He has built a custom dashboard that aggregates console output and visualizes key metrics in a browser tab
- Most of his gameplay happens in VS Code with the Screeps API TypeScript types installed, not in the in-game editor

---

## Strengths

- **The only game where software architecture is the gameplay.** Nothing else gets this close to real-world distributed systems engineering.
- **Genuine skill transfer.** Players demonstrably become better programmers. Companies use it as an interview tool.
- **Depth ceiling is nearly infinite.** A 10-year Screeps veteran still hasn't exhausted the optimization space.
- **Community quality.** Unusually collaborative, knowledge-sharing, open-source-first.
- **The ownership feeling.** Your empire, running right now, while you work. The persistent world creates a relationship to the colony that mission-based games can't replicate.

## Weaknesses

- **The commitment problem.** "My base got destroyed while I slept" is not fun. The persistent world punishes absence.
- **Onboarding cliff.** Tutorial ends; competitive MMO begins. Many players quit here.
- **The subscription paywall.** Competitive play above 20ms CPU requires ongoing payment. Feels extractive for a $20 game.
- **No narrative.** Pure mechanics. No story, no characters, no reason to care beyond code excellence.
- **Stalled development.** Core game is abandonware. Community self-maintains.
- **The real-language paradox.** Screeps claims "learn real programming" but is so opinionated about its JavaScript API that skills transfer imperfectly. You learn Screeps JavaScript, not general programming.

---

## Interaction Effects with Robot Uprising Design Space

### CPU-as-Context-Buffer Analogy (Very Strong)

Screeps' CPU budget is Robot Uprising's context buffer. Both:
- Force architectural decisions about what information to keep
- Punish naive "check everything every event" approaches
- Reward caching, staggering, and scoping to role
- Have burst mechanisms (CPU bucket ↔ fabrication reserves)
- Create an efficiency dimension that exists alongside correctness

The pedagogical implication: context buffer pressure in Robot Uprising should feel like CPU pressure in Screeps — not as punishment, but as a constraint that rewards thinking harder about information architecture.

### The Stale-World Problem ↔ Latency as Mechanic (Direct Mapping)

Screeps' "you act on last tick's world" is Robot Uprising's "1-hop-1-tick latency." In Screeps, this is implicit and causes many bugs. In Robot Uprising, it should be made explicit, visible, and teachable. The debrief's latency visualization (aspect 4.13) is the design answer.

### Overmind Hierarchy ↔ Command Agent Architecture (Direct Mapping)

Overlords → Overseers → Assimilator in Screeps maps to:
- Leaf agents (role executors) → Command agents (task dispatchers) → Meta-commander (architecture manager)

The insight: the hierarchy doesn't emerge from game rules — it emerges from CPU/context scarcity. This should be true in Robot Uprising too. The game should make brute-force flat architectures visibly inefficient, making hierarchy feel like the natural emergent solution.

### Screeps Arena ↔ Robot Uprising Mission Structure (Relevant Warning)

Arena is more accessible than World but had dramatically fewer players. This suggests that match-based programming games lose something essential when they drop persistence. Robot Uprising's mission structure should compensate: named units that persist (even if missions don't), campaign narrative, cosmetic rewards, leaderboard persistence.

### The "Open Source Your Bot" Culture ↔ Robot Uprising Community Sharing

Screeps' culture of publishing full AI bots on GitHub and writing architectural blog posts is a community mechanic worth designing toward. Opus Magnum's GIF export creates a different but analogous mechanic. Robot Uprising should design explicit export/share hooks: exportable agent configs, shareable combo blueprints, replay links.

---

## The TikTok Clip

Screeps' TikTok clip doesn't exist, because the game has no TikTok clip — it's slow, text-heavy, and requires programming knowledge to appreciate.

The closest viral moment Screeps has: time-lapse videos of territory expansion, where a single dot grows into a sprawling empire over weeks. These circulate on YouTube and Reddit as "look what my code built while I was at work." They work because the emotional core ("my creation is alive") overrides the technical gap.

**For Robot Uprising**, the lesson is: the viral clip must communicate "look what my system did" without requiring explanation. A hook cascade that creates an emergent flanking maneuver — visible, legible, beautiful — is the answer. 15 seconds of units doing something unexpected and clever that emerged from the wiring the player set up. No text required.

---

## New Aspects Discovered

Five new aspects added to the frontier from this analysis:

1. **"The asynchronous observation gap" as core design pattern** — Screeps' agents act on frozen past state; Robot Uprising's 1-hop-1-tick latency is the same thing made architectural. Deep dive on how this gap is communicated to players during onboarding, made viscerally legible in the execute phase, and taught explicitly in the debrief. What does "acting on stale intelligence" *look* like?

2. **The always-on anxiety vs. self-contained missions tradeoff** — Screeps World's 24/7 persistence creates ownership feeling but also "vacation death" anxiety. Robot Uprising's mission structure eliminates anxiety but loses persistence fantasy. What design choices compensate for the loss? Named units? Campaign memory? Between-mission "camp" state?

3. **Open-source architecture as community mechanic** — Screeps' culture of publishing full bot code on GitHub is a community mechanic, not an accident. What's the Robot Uprising equivalent? Exportable agent configs? Shareable hook wiring diagrams? "Build shared" button in the workbench?

4. **The real-language paradox** — Screeps claims to teach "real programming" but the skills transfer imperfectly. Robot Uprising's primitives (skills/rules/hooks/context) are claimed to map 1:1 to real agentic AI engineering. Is this claim actually true? Design exercise: take a real Claude Code ralph loop and map every component to a Robot Uprising primitive. Does the vocabulary hold?

5. **CPU asymmetry vs. context asymmetry** — In Screeps, using TypeScript+WebAssembly gives a performance advantage over JavaScript players. Does Robot Uprising want analogous asymmetry? Should a player who designs a tight, efficient context architecture actually outperform a player who just maxes buffer size on every agent? The "budget players" vs. "big spenders" balance question.
