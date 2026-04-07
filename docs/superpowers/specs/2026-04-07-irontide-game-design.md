# Iron Tide — Game Design Document

**Status:** Approved
**Date:** 2026-04-07

## Identity

**Iron Tide** — A browser-native real-time strategy game. Full base building, resource management, army control. Zero install, zero login. The pitch: "I can't believe this runs in a browser."

**Working title:** Iron Tide
**Genre:** Real-time strategy (classic RTS)
**Platform:** Desktop browser (Chrome, Edge, Safari 18+)
**Match format:** 1v1, 10-15 minute games
**Session model:** Anonymous (UUID stored in localStorage, no account required)
**Lobby:** Room codes or direct link — no matchmaking for V1

## Target Players

- **Lapsed RTS players** — Played SC2/Red Alert/AoE back in the day but don't want to install a 40GB client. Know what a control group is. Expect familiar hotkeys and mechanics.
- **Active competitive RTS players** — Currently playing SC2, AoE4, Stormgate. Higher bar for depth and polish. Will compare everything to SC2.
- **The developer and friends** — Passion project. Building the RTS we want to play.

**Assumption:** Every player knows what right-click-to-move means. No need to teach RTS basics. They'll judge the game against SC2/AoE quality even though it's browser-based.

## Art Style

- 2D isometric, classic sprite art
- Red Alert / Command & Conquer aesthetic
- 8-directional unit sprites with animation frames
- Isometric camera angle matching SC2's perspective (~55-60 degrees from horizontal, 3/4 top-down view)

## Factions

Two mirror factions for V1. Identical units, different team colors/skins. Depth comes from map control, economy management, and micro — not faction matchups. Asymmetric factions are a future addition.

## Resource Model

Single resource type: **Ore**.

- Workers harvest ore from nodes scattered across the map
- Workers deposit ore at the nearest Command Center
- Expanding economy means building additional Command Centers near remote ore nodes

**Supply cap:** Each player has a maximum unit count (supply cap). The starting CC provides base supply. Additional CCs increase the cap. If at max supply, no new units can be trained until supply is freed (units die) or increased (build another CC). Exact numbers are balance-tuning decisions for implementation.

## Units

3 unit types for V1:

| Unit | Role | Trained at | Cost | Notes |
|------|------|-----------|------|-------|
| **Worker** | Harvests ore, constructs buildings | Command Center | Cheap | Only economic unit. Cannot fight. Pulling workers to build = less income. Auto-re-gathers after depositing. |
| **Rifleman** | Basic combat infantry | Barracks | Cheap | Fast to produce. Effective in numbers. |
| **Tank** | Heavy combat vehicle | Barracks | Expensive | Slow to build. High damage, high armor. |

Workers are the only unit that both harvests AND builds (SC2 SCV model). The strategic tension: pulling a worker off ore to build means lost income.

## Buildings

3 building types for V1:

| Building | Role | Built by | Notes |
|----------|------|----------|-------|
| **Command Center** | Trains Workers, ore deposit point, **win condition** | Worker | Starting building. Each additional CC is an expansion AND a vulnerability. |
| **Barracks** | Trains Riflemen and Tanks | Worker | Combat unit production. |
| **Turret** | Static defense, auto-attacks nearby enemies | Worker | Defends key positions. Does not require manual targeting. |

## Win Condition

**Destroy all of your opponent's Command Centers.** Game ends immediately when one player has zero CCs.

This creates natural aggression: expansions (additional CCs) boost economy but are risky to defend. Every CC is simultaneously an economic asset and a liability.

## Match Pacing (10-15 minutes)

| Phase | Time | What happens |
|-------|------|-------------|
| **Early game** | 0-3 min | Build workers, start harvesting, build first barracks. Scout with a worker. First decision: fast expand (second CC) or early aggression? |
| **Mid game** | 3-8 min | Armies clash. Fight over map control and expansion CCs. Turrets defend key positions. Worker harass is viable (kill their economy). |
| **Late game** | 8-15 min | Tank-heavy armies. Decisive pushes on the opponent's CC. If both players expand, the map gets contested everywhere. |

## Map

Single hand-crafted map for V1, inspired by SC2's "Fighting Spirit."

**Properties:**
- 256x256 tile grid
- Mirror symmetry (180-degree rotational) for fairness
- Starting base in opposite corners with a natural choke (ramp or narrow passage)
- 2-3 ore node clusters per side: one safe near base, one semi-exposed natural expansion, one contested in the center
- Open central area for army fights
- Terrain features (cliffs, water) that block pathing and create strategic chokepoints

## Controls

Targeting RTS veterans — everything should feel immediately familiar to someone who's played StarCraft.

**Mouse:**
- Left-click: select unit/building
- Right-click: context-sensitive command (move to ground, attack enemy, gather ore node)
- Click-drag: box select multiple units

**Keyboard:**
- **WASD / edge scroll**: pan camera
- **Scroll wheel**: zoom in/out
- **A + click**: attack-move (move toward destination, engage any enemies along the way)
- **S**: stop (halt current action)
- **Ctrl+1-9**: assign control group
- **1-9**: recall control group
- **Double-tap 1-9**: center camera on control group
- **B**: build Barracks (with Worker selected)
- **C**: build Command Center (with Worker selected)
- **T**: build Turret (with Worker selected)
- **Tab**: cycle through buildings for production

## HUD

Plain DOM/CSS overlay on top of the game canvas.

- **Top of screen**: Ore count + supply/unit cap
- **Bottom left**: Minimap
- **Bottom right**: Command card (available actions for selected unit/building)
- **Bottom center**: Unit portrait / health bars when units selected
- **No chat for V1**

## What V1 Does NOT Include

- Matchmaking (friend-to-friend only via room codes)
- AI opponent
- Replay system
- Ranked ladder
- Sound effects or music
- WebGL2 fallback
- Asymmetric factions
- More than 3 unit types
- More than 1 map
- Chat
- Account system / persistence
