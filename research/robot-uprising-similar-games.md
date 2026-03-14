# Robot Uprising — 5 Most Similar Games

**Date:** 2026-03-14
**Context:** Competitive landscape research based on Robot Uprising's core design: indirect control via attention/context systems, sealed execution, composable behavior primitives, debrief/iterate loop.

---

## 1. Gladiabots (GFX47, 2019)

**Similarity: 95% — The closest existing game to Robot Uprising.**

- Visual behavior tree programming for robot squads — you design AI logic, not direct control
- Async multiplayer where you deploy configs and watch sealed replays
- Core loop is design → deploy → watch → iterate — identical to Robot Uprising's Plan/Execute/Debrief/Iterate
- Target-type + filter + selector system is a declarative attention specification
- Community culture around config sharing, debugging, and optimization

**Key differences from Robot Uprising:** Gladiabots uses behavior trees (branching if/then), not attention buffers. No concept of information pressure, context overflow, or memory eviction. Units don't have limited working memory — they evaluate the full tree every tick. No meta-level (you program individual units, not systems that produce units).

**Already in reverse loop analysis:** Yes (1.06 + 8 sub-aspects)

---

## 2. Carnage Heart (Artdink, 1995 — PS1)

**Similarity: 85% — The original "program the robot, watch it fight" game.**

- Flowchart-based visual programming of autonomous mechs (Overkill Engines)
- **Completely sealed execution** — zero player control during battle. You program beforehand, then watch.
- Hardware design (body, engine, weapons, CPU, armor) + software design (behavior flowcharts)
- Condition checks, counters, radio communication between units, movement/attack icons
- Packaged with 58-page strategy guide + tutorial disc — recognized the learning curve problem
- IGN called it "one of the most ambitious console releases of all time"
- Directly inspired Gladiabots' developer

**Key differences from Robot Uprising:** Flowcharts are sequential (not composable primitives). No buffer/attention mechanic. No debrief tooling — you just watch and infer what went wrong. Hardware design is a major axis that Robot Uprising doesn't have. Single-player focused.

**NOT in reverse loop analysis — strong candidate for addition.**

---

## 3. Screeps (Screeps LLC, 2017)

**Similarity: 75% — The "real programming" endpoint of the design space.**

- Write JavaScript to control autonomous units (creeps) in a persistent MMO world
- Units execute your code 24/7 — true autonomous agents
- Emergent behavior from code interactions across hundreds of units
- Information constraints: units have limited vision range, communication costs energy
- Persistent world = your code must handle all possible situations (robustness testing)
- Community culture of code sharing, optimization, and competitive strategy

**Key differences from Robot Uprising:** Real programming (JavaScript), not visual/composable primitives. No sealed execution — your code runs live and you can hotfix. No structured debrief. Skill floor is "know JavaScript." The game IS programming, not a game that teaches programming thinking.

**Already in reverse loop analysis:** Yes (1.05 + 1 sub-aspect)

---

## 4. Battlecode (MIT, annual since 2000)

**Similarity: 70% — Competitive autonomous robot army programming.**

- Write autonomous AI players that control robot armies in an RTS environment
- Robots must operate independently — no global omniscient control
- **Communication constraints:** robots have limited broadcast range and bandwidth (maps directly to Robot Uprising's attention/context management)
- **Fog of war:** robots can only see nearby tiles (information architecture under constraint)
- Competitive tournament format with Elo ratings
- Annual redesign means fresh meta each year
- Teaches pathfinding, distributed algorithms, communication protocols

**Key differences from Robot Uprising:** Real Java/Python programming. Academic competition format, not a commercial game. Synchronous RTS execution, not sealed. No visual behavior design. High skill floor (CS students).

**NOT in reverse loop analysis — worth adding for communication constraint design.**

---

## 5. Colobot (Epsitec, 2001 / open-source 2014+)

**Similarity: 65% — Robot programming RTS with educational framing.**

- Program robots using a simplified C-like language to colonize planets
- Robots execute programs autonomously — you watch them work (or fail)
- Multiple robot types with different capabilities (similar to Robot Uprising's unit types)
- Educational framing: explicitly designed to teach programming concepts
- 3D RTS environment with resource gathering, construction, combat
- Open-sourced as Colobot: Gold Edition — active community

**Key differences from Robot Uprising:** Text-based programming, not visual primitives. Direct control is also possible (you can switch to manual). No sealed execution constraint. No attention/buffer mechanic. Teaches syntax, not systems thinking.

**NOT in reverse loop analysis — relevant for educational game design patterns.**

---

## Honorable Mentions

| Game | Why Similar | Why Not Top 5 |
|------|-----------|---------------|
| **Final Fantasy XII** (Gambit system) | If/then behavior rules for party members | Not a programming game; direct control available |
| **Dominions 3** | Sealed battle execution, pre-battle orders | Grand strategy, not programming/AI design |
| **Majesty** | Indirect unit control via incentives | No programming; control is economic, not behavioral |
| **Autonauts** | Visual bot programming, automation | Colony sim, not combat/strategy; no sealed execution |
| **Mindustry** (Logic system) | MLog programming for unit/block control | Factory game first, programming is optional layer |
| **Robocode** | Program tank AI in Java, competitive | Pure programming exercise, no game design wrapper |

---

## Key Insight

Robot Uprising occupies a unique intersection that no existing game fully covers:

1. **Gladiabots** has the sealed execution + iterate loop but lacks attention/buffer mechanics
2. **Carnage Heart** pioneered sealed robot programming but has no debrief tooling or meta-level
3. **Screeps/Battlecode** have information constraints but require real programming
4. **Colobot** has the educational framing but teaches syntax, not systems thinking

The gap Robot Uprising fills: **a visual, composable system for designing autonomous agent attention architectures, with structured debrief tooling, that teaches information architecture thinking without requiring programming knowledge.**
