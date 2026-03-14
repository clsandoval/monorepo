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

### Core Mechanic Variations

| File | Aspect | Status |
|------|--------|--------|
| [core-mechanic/spawn-semantics.md](core-mechanic/spawn-semantics.md) | 1.04c — REPL semantics for agent spawning: EXAPUNKS REPL as reference (explicit fork instruction with X/T inheritance); four Robot Uprising spawn models (explicit skill, implicit condition, hook-triggered, hybrid); inheritance mask design; spawn storm as designed failure; 3 full player journeys; comparable games (Factorio Roboport, Rimworld, ONI, StarCraft production queues); 4 new aspects discovered | ✅ Complete |
| [core-mechanic/hook-semantics-blocking-vs-queued.md](core-mechanic/hook-semantics-blocking-vs-queued.md) | 1.04d — Blocking vs. queued hook semantics: five models (fire-and-forget, blocking rendezvous, bounded queue, priority queue, hybrid); EXAPUNKS M register as reference; locked design recommendation (A→C→B teaching progression across 7 missions); 3 full player journeys (backend engineer, Minecraft builder, network engineer); sensory vocabulary for blocked/queued/dropped states; 4 new aspects discovered | ✅ Complete |

### First Playable Decisions (Brainstorm Output)

| File | Description | Status |
|------|-------------|--------|
| [first-playable-decisions.md](first-playable-decisions.md) | Locked preferences from brainstorming: 7-mission arc, tick system (1 action/tick, 1 tick/hop, receive-is-free), lossy compress (X/2 random), 5 unit types, 6 feeling checkpoints. Full spec at `docs/superpowers/specs/2026-03-13-robot-uprising-first-playable-design.md` | ✅ Locked |
