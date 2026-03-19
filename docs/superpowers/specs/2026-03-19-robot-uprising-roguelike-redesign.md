# Robot Uprising — Roguelike Campaign Redesign

**Date:** 2026-03-19
**Status:** Draft
**Supersedes:** Campaign structure from `2026-03-13-robot-uprising-game-design.md` and `2026-03-13-robot-uprising-first-playable-design.md`

## Summary

Robot Uprising shifts from a fixed 10-mission campaign to a Slay the Spire-style roguelike structure. The original 10 missions become a one-time tutorial. The real game is infinitely replayable runs through procedurally branching maps with reward choices, doctrine modifiers, and escalating enemy variety.

## What This Spec Changes

### Replaced

| Previous Design | New Design |
|---|---|
| Fixed 10-mission campaign as the whole game | 10-mission tutorial + roguelike runs |
| Robustness testing (100-variant pattern) | Each mission is one encounter; variety comes from branching path and enemy mix |
| Post-campaign Gauntlet as separate mode | Ascension levels on roguelike runs (same mode, harder modifiers) |
| Categorized buffer graduating across fixed missions | Buffer model upgrades are blueprint mutations found during runs |
| Philippine archipelago campaign map (fixed provinces) | Procedural branching map per run (StS style); Philippine biome art on individual missions |
| Cross-run career analytics in Inspector | Per-mission Inspector only; no cross-run career stats |
| 3-resource model (Material, Energy, Bandwidth) as campaign-long economy | Resources are per-mission only; Black Market uses a run currency (compute cycles) earned per mission |
| Tagging for persistent map control across campaign | Tagging still works per-mission for resource income; no cross-mission territory persistence |

### Unchanged

- Three-screen loop (Plan → Sealed Watch → Inspector)
- Core mechanic (buffer/context window, 4 primitives: skills, rules, hooks, context config)
- 5 unit types (Scout, Striker, Relay, Specialist, Command) with locked stats
- One-shot-one-kill combat (no HP, no damage math)
- 8x8 grid, discrete tick-based, isometric
- Kulintang Machine audio design
- Boot log narrative for tutorial
- Tech stack (React + Pixi.js + Vite, no backend)
- Channels emerge from hooks (type a name, it exists)
- Signal latency (1 tick per hop)
- EM emissions model
- Context overload → 1 tick stunned

---

## Tutorial (10 Missions, Linear, One-Time)

The tutorial teaches the game's vocabulary. It is played once; after completion it can be replayed from the main menu but is skippable on subsequent playthroughs. The boot log narrative frames each mission as the player-AI discovering a new subsystem.

### Mission Arc

| Mission | Concept Taught | Unit Access |
|---|---|---|
| 1 | Buffer — what a context window is, how slots fill | Pre-placed Scout |
| 2 | Rules — IF-THEN decision logic, priority ordering | Pre-placed Scout + Striker |
| 3 | Hooks — inter-unit communication, channels, signal latency | Pre-placed Scout + Relay |
| 4 | Skills — equipping capabilities into limited slots | Pre-placed Scout + Striker + Relay |
| 5 | Factory — production queue, spawning, blueprints, resource income | Factory + blueprints |
| 6 | Channels — multi-channel architectures, signal routing | Factory + expanded blueprints |
| 7 | Command agent — meta-level management, reassign/reroute/prioritize | Factory + Command unit |
| 8 | Context config — buffer filters, eviction priorities, listen/ignore | Full toolkit |
| 9 | Integration — combining all systems against mixed opposition | Full toolkit |
| 10 | Graduation — full complexity mission, unlocks roguelike mode | Full toolkit |

### Tutorial Principles

- No text boxes. Mechanics revealed through animation and visual feedback.
- 1 new vocabulary term per mission, never more. ~12 core terms by mission 10.
- Boot log narrative: "You are an AI reading your own spec sheet as it writes itself."
- Pre-placed units in missions 1-4 (player configures but doesn't build). Factory from mission 5.

---

## Roguelike Runs

### Structure

- **5 acts** per run
- **6-8 nodes** per act on a branching map
- **Boss** at the end of each act
- **~60-120 minutes** per run, with save and resume between sessions
- **3 reboot tokens** per run — losing a mission spends a token; out of tokens ends the run
- **Save state:** Full run state serialized to localStorage/IndexedDB (map, current node, accumulated rewards, all blueprint configs, reboot tokens, doctrine modifiers)

### Map Nodes

| Node Type | Description | Reward |
|---|---|---|
| **Mission** | Standard battlefield encounter | Choose 1 of 3 skills/hooks/rules |
| **Elite** | Harder encounter, tougher enemy compositions | Blueprint mutation |
| **Relay Station** | No combat. Full plan-phase access: swap skills, reorganize rules, rewire hooks, adjust context config, reorder production queue. Same UI as pre-mission Plan screen. | None (optimization time) |
| **Black Market** | Spend compute cycles to buy specific skills/hooks/doctrines | Player's choice from inventory |
| **Anomaly** | Risk/reward event choice (e.g., "tap an open enemy channel for intel or ignore it") | Varies — doctrine, resource, reboot token, or penalty |
| **Boss** | Act-ending challenge embodying one enemy faction's pinnacle | Doctrine modifier + blueprint mutation |

### Run Start

Each run begins with:
- Starting blueprints (depends on selected Starting Doctrine — see Meta-Progression)
- A starting doctrine modifier
- 3 reboot tokens
- A procedurally generated branching map for Act 1

**Blueprint availability:** All 5 unit type blueprints (Scout, Striker, Relay, Specialist, Command) are available from the start of every run with their base stats. Starting Doctrines determine which blueprints come pre-equipped with skills/hooks/rules vs. which start empty. Empty blueprints are usable but have no configured behavior — the player must find and equip rewards to make them functional.

**Per-mission systems:** Each mission node uses the full base/factory/production-queue system from the original spec. Passive resource income per tick, tagging for map node control, production queue as build order. Invisible randomization varies each mission within constraints (enemy count, patrol routes, spawn timing).

The player starts simple and accumulates capabilities mission by mission. By Act 5, they have a complex multi-unit architecture built from the rewards they chose along the way.

---

## Rewards & Progression

### Per-Mission Rewards (Common)

After winning a standard mission, choose 1 of 3 offered:
- **Skills** — new capabilities to equip on blueprints (e.g., compress, filter, amplify, hack, extract)
- **Hooks** — new reactive triggers to wire between units
- **Rules** — new condition→action pairs to add to blueprints

These accumulate across the run. Like picking a card in Slay the Spire.

### Elite Rewards (Rare)

Blueprint mutations — permanent upgrades to a specific blueprint for the rest of the run:
- Extra buffer slot (+1 context window capacity)
- New hook slot (+1 wiring point)
- Upgraded skill variant (compress → deep compress)
- Expanded context categories (add a new compartment type)
- Increased perception range

Like upgrading a card at a campfire in Slay the Spire.

### Doctrine Modifiers (Relics)

Global passives that warp strategy for the entire run. Collected from bosses, anomaly events, and the black market.

**Example doctrines:**
- "All signals travel 1 tick faster"
- "Scouts have +2 buffer slots"
- "Hooks fire twice"
- "Relays can move 1 tile per 3 ticks"
- "Context overload stuns for 2 ticks instead of 1" (double-edged)
- "EM emissions are halved"
- "Units spawn with 2 random context slots pre-filled"
- "Eliminated units drop their context contents onto adjacent tiles"

Doctrines define the run's identity. "I got fast-signals and extra-hooks early, so I built deep relay chain architectures."

**Stacking:** Doctrines stack with no cap. A run might accumulate 6-8 doctrines by Act 5 (1 starting + 5 boss drops + anomalies/market). Synergies and anti-synergies between doctrines are intentional — discovering powerful doctrine combinations is part of the replayability.

---

## Enemy Factions

All 5 factions can appear from Act 1. Early acts are Sentinel-heavy with other factions appearing rarely; later acts mix all types densely. Bosses embody one faction's pinnacle.

| Faction | Behavior | Architectural Weakness Punished |
|---|---|---|
| **Sentinels** | Predictable patrol patterns, basic combat | None — baseline opponents for learning |
| **Jammers** | Flood channels with noise, fill buffers with garbage | Unfiltered architectures; no compress/filter skills |
| **Ghosts** | Stealth until adjacent to your units | Over-reliance on early warning; single-scout architectures |
| **Mimics** | Inject false signals into your channels | Blind trust in incoming data; no authentication/validation |
| **Architects** | Adapt their own configuration mid-battle | Static architectures; inability to handle changing enemy behavior |

### Act Mix Progression

| Act | Primary Threats | Boss Faction |
|---|---|---|
| 1 | Sentinel-heavy, rare Jammers/Ghosts | Sentinel pinnacle |
| 2 | Jammers and Ghosts common, rare Mimics | Jammer pinnacle |
| 3 | Mimics common, mixed squads, rare Architects | Ghost pinnacle |
| 4 | All types common, Architects appear regularly | Mimic pinnacle |
| 5 | Dense mixed compositions, every mission is a cocktail | Architect pinnacle |

---

## Meta-Progression (Persists Across Runs)

### Starting Doctrines

Unlocked after first clear. Each gives a fundamentally different starting blueprint set and first doctrine modifier, forcing different architectural approaches per run.

| Doctrine | Starting Blueprints | Starting Modifier |
|---|---|---|
| **Swarm** | 3 Scouts, 1 Striker (pre-equipped). Relay/Specialist/Command empty. | "Scout hooks cost 0 EM" |
| **Fortress** | 1 Scout, 2 Relays, 1 Command (pre-equipped). Striker/Specialist empty. | "Relays have +2 buffer slots" |
| **Blade** | 3 Strikers, 1 Scout (pre-equipped). Relay/Specialist/Command empty. | "Strikers gain +1 perception range" |
| **Signal** | 1 of each unit type (pre-equipped with basic loadout). | "All blueprints have +1 hook slot" |

### Ascension (1-20)

After clearing a run, unlock the next Ascension level. Each level adds a cumulative modifier:

**Example Ascension modifiers:**
1. Enemies have +1 buffer slot
2. Elite missions have fog of war
3. Black Market prices +25%
4. Enemy Jammers start with pre-loaded noise signals
5. Reboot tokens reduced to 2
6. Ghost stealth range increased to 2 tiles
7. Signal latency +1 tick
8. Boss missions have EM detection
9. Anomaly events have worse odds
10. Mimic false signals are harder to distinguish
11. Context overload stuns for 2 ticks
12. Shops offer fewer items
13. Architect enemies adapt every 3 ticks instead of 5
14. Starting buffer slots -1
15. Elite rewards are random (no choice)
16. Enemy hook slots +1
17. Reboot tokens reduced to 1
18. All enemies have +1 perception
19. Mission rewards offer 2 choices instead of 3
20. Architect boss in every act

### Blueprint Codex

Persistent collection screen showing every skill, hook, rule, doctrine, and blueprint mutation discovered across all runs. No gameplay advantage — purely a trophy case and reference. Shows silhouettes for undiscovered items.

---

## Inspector (Simplified)

The Inspector remains per-mission only. After each Sealed Watch, the player enters the two-act debrief:

1. **Sealed Watch** (emotional) — watch the battle unfold with no control
2. **Inspector** (analytical) — timeline scrubber, click-to-inspect units, decision trace, buffer state charts

### Kept Inspector Features
- Timeline scrubber (step through any tick)
- Click-to-inspect (full context window state at each tick)
- Decision trace (which rule matched, what context it evaluated)
- Context window chart (fill over time)
- Event log (signal events)

### Dropped Inspector Features
- Cross-run career analysis
- Career stats dashboards
- Multi-match pattern detection
- Diagnostic efficiency metrics
- Agree-to-disagree systems
- Pre-ranking heuristics
- Combined coverage analysis
- All Wave 4 debrief sub-aspects (4.69+)

The Inspector's job in the roguelike is: help the player understand what happened THIS mission so they can make better reward choices and blueprint reconfiguration at the next Relay Station.

---

## Resolved Design Decisions

### Resource Currency

**Compute cycles** — earned per mission (base amount + bonus for tagging nodes during battle). Spent at Black Market. Thematic and maps to the game's AI-engineering vocabulary.

### Map Generation

Template-based with random node type assignment. Each act has 3-4 map templates (hand-designed branching structures ensuring every path has a minimum of 1 Elite, 1 Relay Station, and 1 non-combat node). Node types within the template are randomly assigned per run. The full act map is visible from the start (like StS) so the player can plan their route.

### Biomes

Biome varies per act (matching Philippine geography: rice terraces, jungle, coastal, urban, volcanic). Biome is cosmetic only in v1 — no gameplay effect. Gameplay-affecting biome modifiers are a future expansion option.

## Open Questions

1. **Anomaly event design** — What's the pool of events? How many are needed for variety? (Can be designed iteratively post-launch.)
2. **Balance** — How many total skills/hooks/rules/doctrines/mutations need to exist for sufficient run variety? StS has ~75 cards per character + ~150 relics. Target: ~50 skills/hooks/rules, ~30 doctrines, ~20 mutations as MVP.
