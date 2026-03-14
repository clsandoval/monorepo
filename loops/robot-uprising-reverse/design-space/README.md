# Robot Uprising — Design Space Catalog

An exhaustive exploration of every possible version of Robot Uprising. Each file explores one region of the design space with detailed player journeys, UI annotations, and interaction analysis.

## Index

### Onboarding

| File | Aspect | Status |
|------|--------|--------|
| [onboarding/diegetic-tutorial-documents.md](onboarding/diegetic-tutorial-documents.md) | 1.04b — Diegetic tutorial documents as game artifact: full taxonomy (printable artifact, accreting log, database interface, corporate spoof manual, mechanics-as-characters), 3 detailed player journeys, 11 comparable games, Robot Uprising application (4 voice candidates, hybrid architecture, document-as-corrupted-surface); 4 new aspects discovered | ✅ Complete |

### Competitive Analysis

| File | Aspect | Status |
|------|--------|--------|
| [competitive-analysis/zachtronics-shenzhen-io.md](competitive-analysis/zachtronics-shenzhen-io.md) | 1.01 — Shenzhen I/O: constraint-based puzzle design, limited instruction space, multiple valid solutions | ✅ Complete |
| [competitive-analysis/zachtronics-tis-100.md](competitive-analysis/zachtronics-tis-100.md) | 1.02 — TIS-100: minimal instruction set (13 opcodes), 4×3 spatial node grid, parallel execution visualization, blocking port communication | ✅ Complete |
| [competitive-analysis/zachtronics-opus-magnum.md](competitive-analysis/zachtronics-opus-magnum.md) | 1.03 — Opus Magnum: three antagonistic metrics, histogram democracy, open-ended no-intended-solution design, infinite canvas, GIF virality, aesthetic satisfaction of clockwork elegance | ✅ Complete |
| [competitive-analysis/zachtronics-exapunks.md](competitive-analysis/zachtronics-exapunks.md) | 1.04 — EXAPUNKS: multi-agent EXA programming model, REPL/messaging, Trash World News diegetic zine tutorial, hacker fantasy aesthetic, battle mode PvP, phage body horror narrative, direct parallels to Robot Uprising attention systems | ✅ Complete |
| [competitive-analysis/exapunks-narrative-mechanical-integration.md](competitive-analysis/exapunks-narrative-mechanical-integration.md) | 1.04a — Narrative-mechanical integration: closing the EXAPUNKS body horror gap via corrupted configs, degraded buffers, and enemy-injected hooks; three design options (Sabotage Problem / Entropy Problem / Trojan Horse Problem) with 3 player journeys; comparable games (Hacknet, FTL, Dead Space); 5 new aspects discovered | ✅ Complete |
| [competitive-analysis/screeps.md](competitive-analysis/screeps.md) | 1.05 — Screeps: persistent-world programming RTS, JavaScript API, MMO dynamics; CPU-as-context-budget analogy; stale world problem and information freshness hierarchy; Overmind hierarchical architecture; Arena vs World split (match-based vs persistent); 3 player journeys (junior dev Marco, senior engineer Priya, 3-year veteran Reiner); 5 new aspects discovered | ✅ Complete |
| [competitive-analysis/screeps-live-test-suite-endpoint.md](competitive-analysis/screeps-live-test-suite-endpoint.md) | 1.04f — Screeps as the live test suite endpoint: the ∞-case robustness axis; four Robot Uprising adaptation options (The Gauntlet / The Arena League / The Simulation Farm / The Persistent War); comparable games (Gladiabots, Robocode, Chess.com correspondence, fantasy sports); 3 player journeys (Nadia meta-tracker, James casual proxy-learner, Chen Zachtronics vet); sensory design for digest notification and season reset; TikTok clip; 5 new aspects discovered | ✅ Complete |
| [competitive-analysis/live-winrate-persistent-identity.md](competitive-analysis/live-winrate-persistent-identity.md) | 1.04g — The live win-rate as persistent identity metric: 5 design options for Elo-as-identity (Tier Badge / Colored Handle / Win-Rate Display / Multi-Axis Triangle / Config-First); Codeforces colored-handle culture and rating anxiety documented; Screeps Arena seasonal Elo; Gladiabots async match notification; Robocode RoboWiki 20-year institutional memory; 4 player journeys (Zara discovering aspiration, Marcus grinding Operative plateau, Vera watching before playing, Dev confronting the imposter problem); sensory description of 5-tier circuit-glyph badge system; authenticity pressure as self-regulating community norm | ✅ Complete |
| [competitive-analysis/gladiabots.md](competitive-analysis/gladiabots.md) | 1.06 — Gladiabots: the only commercial-scale visual-programming PvP AI game; depth-first counterclockwise behavior tree (0.25s/tick); declarative query model (target type + filters + selector → human-readable sentence); tags+counters as thin working memory; full determinism with last-turn delay; async ELO ranked across 3 game modes; rock-paper-scissors non-transitive meta; developer removed loadout building to keep AI-building as primary expression; 3 player journeys (Kenji engineer discovering priority stack and tag coordination, Priya casual parent anthropomorphizing bots, Marcus competitive player building counter-meta with counter nodes); 88% Very Positive, ~200k–500k owners; multiplayer effectively dead; Robot Uprising key differences: no fog of war vs. attention-as-scarce-resource; tags too thin vs. structured buffer; no hooks vs. reactive wiring; no command agents vs. meta-level; 5 new aspects discovered (1.06a–e) | ✅ Complete |

### Core Mechanic Variations

| File | Aspect | Status |
|------|--------|--------|
| [core-mechanic/spawn-semantics.md](core-mechanic/spawn-semantics.md) | 1.04c — REPL semantics for agent spawning: EXAPUNKS REPL as reference (explicit fork instruction with X/T inheritance); four Robot Uprising spawn models (explicit skill, implicit condition, hook-triggered, hybrid); inheritance mask design; spawn storm as designed failure; 3 full player journeys; comparable games (Factorio Roboport, Rimworld, ONI, StarCraft production queues); 4 new aspects discovered | ✅ Complete |
| [core-mechanic/hook-semantics-blocking-vs-queued.md](core-mechanic/hook-semantics-blocking-vs-queued.md) | 1.04d — Blocking vs. queued hook semantics: five models (fire-and-forget, blocking rendezvous, bounded queue, priority queue, hybrid); EXAPUNKS M register as reference; locked design recommendation (A→C→B teaching progression across 7 missions); 3 full player journeys (backend engineer, Minecraft builder, network engineer); sensory vocabulary for blocked/queued/dropped states; 4 new aspects discovered | ✅ Complete |

### Campaign / Mission Design

| File | Aspect | Status |
|------|--------|--------|
| [campaign/mission-design-robustness-scenarios.md](campaign/mission-design-robustness-scenarios.md) | 1.04e — The 100-test-case robustness pattern: three tiers of randomization (data/structural/constraint), six named failure archetypes (Invariant Trap, Count Problem, Timing Ambush, False Positive, Order Reversal, Orphaned Chain), campaign ramp (10→100 cases), debrief as robustness teacher (pass/fail grid, failure cluster annotations, comparative replay), 3 player journeys (Maya/David/Keiko), sensory design; 5 new aspects discovered | ✅ Complete |

### First Playable Decisions (Brainstorm Output)

| File | Description | Status |
|------|-------------|--------|
| [first-playable-decisions.md](first-playable-decisions.md) | Locked preferences from brainstorming: 7-mission arc, tick system (1 action/tick, 1 tick/hop, receive-is-free), lossy compress (X/2 random), 5 unit types, 6 feeling checkpoints. Full spec at `docs/superpowers/specs/2026-03-13-robot-uprising-first-playable-design.md` | ✅ Locked |
