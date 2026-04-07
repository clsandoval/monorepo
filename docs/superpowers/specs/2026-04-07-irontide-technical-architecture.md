# Iron Tide — Technical Architecture

**Status:** Approved
**Date:** 2026-04-07
**Companion doc:** `2026-04-07-irontide-game-design.md`

## End-to-End Stack

```
Player's Browser                          Fly.io
┌─────────────────────────────────┐      ┌──────────────┐
│  TypeScript (Vite)              │      │  Rust Binary  │
│  ┌───────────┐  ┌────────────┐  │      │  (tokio +     │
│  │ WebGPU    │  │ Input /    │  │ WSS  │  tungstenite) │
│  │ Renderer  │  │ UI (DOM)   │  │◄────►│              │
│  └─────▲─────┘  └─────┬──────┘  │      │  Thin relay:  │
│        │              │         │      │  forwards     │
│  ┌─────┴──────────────▼──────┐  │      │  commands     │
│  │   WASM Bridge (JS ↔ Rust) │  │      │  between      │
│  └─────────────▲─────────────┘  │      │  2 clients    │
│                │                │      └──────────────┘
│  ┌─────────────▼─────────────┐  │
│  │   irontide-core (Rust→WASM)│  │
│  │   ECS, simulation, tick() │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Key principle:** Rust owns ALL game state. JS is a dumb renderer + input collector. The WASM boundary is a thin shim passing flat buffers and JSON commands.

### Data Flow Per Frame

1. Player input → JS captures mouse/keyboard events
2. JS translates input to `PlayerCommand` (move, attack, build, train)
3. Commands sent to relay server via WebSocket
4. Server broadcasts both players' commands back to both clients
5. Both clients feed identical commands into `tick()` — deterministic simulation advances identically
6. Rust computes visible units (fog culling), writes render buffer
7. JS reads render buffer from WASM shared memory, uploads to WebGPU
8. WebGPU draws: terrain pass → sprite pass → fog pass
9. DOM overlay renders HUD (resources, minimap, command card)

## Project Structure

```
apps/irontide/
├── engine/                          # Rust workspace
│   ├── Cargo.toml                   # Workspace manifest
│   ├── rust-toolchain.toml
│   ├── crates/
│   │   ├── irontide-core/           # Pure game simulation (no WASM deps)
│   │   │   └── src/
│   │   │       ├── lib.rs
│   │   │       ├── ecs/             # Custom minimal ECS (SoA storage)
│   │   │       │   ├── mod.rs
│   │   │       │   ├── world.rs     # Entity + dense component storage
│   │   │       │   └── query.rs     # Iterator-based queries
│   │   │       ├── components/      # All component types
│   │   │       │   ├── mod.rs
│   │   │       │   ├── transform.rs # Position, Velocity (fixed-point)
│   │   │       │   ├── combat.rs    # Health, Damage, Armor, AttackCooldown
│   │   │       │   ├── unit.rs      # UnitType, Team, SelectionState
│   │   │       │   ├── resource.rs  # ResourceCarry, ResourceNode
│   │   │       │   ├── building.rs  # BuildProgress, ProductionQueue
│   │   │       │   └── movement.rs  # MoveTarget, Speed
│   │   │       ├── systems/         # Simulation systems (run in fixed order)
│   │   │       │   ├── mod.rs
│   │   │       │   ├── movement.rs
│   │   │       │   ├── combat.rs
│   │   │       │   ├── pathfinding.rs
│   │   │       │   ├── resource.rs
│   │   │       │   ├── production.rs
│   │   │       │   └── cleanup.rs
│   │   │       ├── map/
│   │   │       │   ├── mod.rs
│   │   │       │   ├── terrain.rs   # 256x256 hand-crafted map
│   │   │       │   ├── flowfield.rs # A* pathfinding (flowfield is V2)
│   │   │       │   └── fog_map.rs   # Per-team visibility
│   │   │       ├── math/
│   │   │       │   └── fixed.rs     # Q16.16 fixed-point (deterministic)
│   │   │       ├── command.rs       # PlayerCommand enum
│   │   │       ├── game.rs          # GameState + tick()
│   │   │       ├── config.rs        # Unit stats, balance data
│   │   │       └── rng.rs           # Seeded xorshift PRNG
│   │   │
│   │   ├── irontide-wasm/           # WASM bindings (thin shim)
│   │   │   └── src/
│   │   │       ├── lib.rs           # wasm_bindgen exports
│   │   │       └── render_data.rs   # Flat buffers for JS renderer
│   │   │
│   │   └── irontide-server/         # Relay server (native binary)
│   │       └── src/
│   │           ├── main.rs
│   │           ├── lobby.rs
│   │           ├── relay.rs         # WebSocket command relay
│   │           └── protocol.rs
│   │
│   └── tests/
│       ├── determinism.rs           # Same commands → same state hash
│       └── pathfinding.rs
│
├── frontend/                        # TypeScript + Vite
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── public/
│   │   └── assets/
│   │       ├── sprites/             # Unit sprite sheets
│   │       ├── buildings/           # Building sprite sheets
│   │       ├── terrain/             # Tile sprites
│   │       ├── ui/                  # HUD elements
│   │       └── fx/                  # Explosions, muzzle flash, etc.
│   └── src/
│       ├── main.ts                  # Entry: init WASM, start game
│       ├── wasm/
│       │   └── bridge.ts            # WASM init + typed API wrapper
│       ├── renderer/
│       │   ├── index.ts             # WebGPU renderer
│       │   ├── sprite-batch.ts      # Instanced sprite rendering
│       │   ├── terrain.ts           # Terrain pass
│       │   ├── fog.ts               # Fog of war pass
│       │   ├── camera.ts            # Iso camera (pan, zoom)
│       │   ├── atlas.ts             # Sprite atlas loader
│       │   └── shaders/             # WGSL shader files
│       ├── input/
│       │   ├── index.ts
│       │   ├── mouse.ts             # Click, drag, box select
│       │   ├── keyboard.ts          # Hotkeys, control groups
│       │   └── screen-to-world.ts   # Iso coordinate conversion
│       ├── ui/
│       │   ├── hud.ts               # HTML/CSS overlay (resources, minimap)
│       │   ├── minimap.ts
│       │   ├── command-card.ts
│       │   └── lobby.ts             # Pre-game (vanilla DOM, no framework)
│       ├── net/
│       │   ├── client.ts            # WebSocket client
│       │   ├── lockstep.ts          # Lockstep sync logic
│       │   └── protocol.ts          # Message types (mirrors Rust)
│       └── game/
│           ├── loop.ts              # requestAnimationFrame loop
│           ├── state.ts             # Client-side state (selection, camera)
│           └── commands.ts          # Input → game command translation
│
├── art/                             # Source files (Aseprite, PSD, references)
│   ├── units/
│   ├── buildings/
│   └── terrain/
│
├── tools/
│   ├── build-wasm.sh               # wasm-pack build to frontend/src/wasm/pkg/
│   └── pack-sprites.ts             # Pack source sprites into atlas sheets
│
└── specs/
    └── design.md                    # Original spec (superseded by this doc)
```

## Rust Engine

### Workspace Layout

- **irontide-core** — Pure game simulation. No WASM dependencies. Testable natively with `cargo test`.
- **irontide-wasm** — Thin shim exposing `irontide-core` to JS via `wasm_bindgen`.
- **irontide-server** — Relay binary (tokio + tungstenite). Runs natively on Fly.io, not compiled to WASM.

### ECS (Custom, Not hecs/legion)

- Dense struct-of-arrays (SoA) storage with named fields per component type
- ~10 known component types — no need for a generic registry
- Zero overhead, trivially deterministic, cache-friendly iteration
- **Rationale:** hecs/legion add 100-200KB WASM size and use HashMap randomness that breaks determinism

### Determinism Guarantees

- Q16.16 fixed-point math for ALL simulation (no floats in game logic)
- Seeded xorshift64 RNG
- `BTreeMap` instead of `HashMap` everywhere in simulation
- Systems run in fixed order every tick
- Checksum every 30 ticks for desync detection
- `f32`/`f64` only allowed in rendering output conversion

### Simulation Tick (30 ticks/sec)

Systems run in this order every tick:

1. Process commands for this tick
2. Movement system (linear interpolation toward move targets)
3. Combat system (target acquisition, cooldowns, damage application)
4. Resource system (worker gather → carry → deposit → re-gather cycle)
5. Production system (building queues, unit spawning)
6. Fog of war update (per-team visibility from unit/building positions)
7. Cleanup dead entities

### Pathfinding

A* for V1. Flowfield pathfinding (shared destination fields, LRU cache) is a V2 optimization. A* is sufficient for V1 army sizes.

## WebGPU Renderer

WebGPU only — no WebGL2 fallback for V1. Targets Chrome, Edge, Safari 18+.

### Three Render Passes Per Frame

1. **Terrain pass** — Instanced quads, 16x16 tile chunks. Only visible chunks drawn (frustum culling against camera). Tile sprites from terrain atlas.

2. **Sprite pass** — Single instanced draw call per atlas. Rust pre-sorts units by Y-coordinate for depth (units closer to camera drawn on top). Render buffer from WASM: ~14 bytes per unit (sprite_id, screen_x, screen_y, frame, team_color, flags).

3. **Fog pass** — Full-screen quad sampling a 256x256 fog texture. Rust writes fog state (visible/fog/unexplored) per tile per team. GPU blends fog overlay on top of terrain + sprites.

### Isometric Projection

Rust computes screen coordinates from tile positions. The renderer doesn't need to know about game logic — it just draws sprites at the positions Rust provides.

### Camera

Implemented in JS. Pan (WASD/edge scroll), zoom (scroll wheel). Camera transform applied to all sprite positions before upload. Minimap is a separate small canvas rendering a downscaled view of the full map.

### HUD

Plain DOM/CSS overlay on top of the WebGPU canvas. Resource count, minimap container, command card, selection info. No React — vanilla DOM manipulation. Keeps the bundle small.

## Networking & Server

### Deterministic Lockstep Protocol

- 30 ticks/sec simulation, both clients advance in sync
- Each tick, client sends its commands to the relay server
- Server collects commands from both players, broadcasts the pair back
- Both clients feed identical command pairs into `tick()` — states stay in sync
- Input delay of 2-4 ticks (67-133ms) to buffer against network latency

### Command Format

```
TurnCommands {
    tick: u32,
    player_id: u8,
    commands: Vec<PlayerCommand>,
    checksum: u32,  // every 30 ticks
}
```

### Desync Detection

Every 30 ticks (~1 second), both clients include a state checksum. Server compares them. If mismatch → notify both players, game is invalid. No recovery in V1 — detection only.

### Reconnection

Command replay. Server stores the full command log. Reconnecting client replays all commands via `fast_forward()` to catch up. For a 10-min game that's ~18,000 ticks — ~2 seconds in WASM.

### Relay Server (Fly.io)

- Rust binary: tokio + tungstenite
- Lobby: create room (get code), join room (enter code)
- No simulation, no validation, no persistence
- Anonymous sessions: client generates UUID on first visit, stored in localStorage
- One WebSocket connection per player per game
- No anti-cheat for V1 (thin relay trusts clients)

## Loading & "5 Seconds to Play"

**Goal:** URL → interactive lobby as fast as possible.

### Asset Tiers

1. **Inlined** — Lobby HTML/CSS/JS, room code UI. Available at first paint.
2. **Critical** — WASM binary, terrain atlas, unit atlases. Must be loaded before game starts. ~1.5MB total.
3. **Deferred** — Explosion FX, selection indicators, UI polish sprites. Can stream in during gameplay.

### Progressive Rendering

If a sprite atlas isn't ready yet, render units as colored circles (team color). Terrain loads first since it's the biggest visual. Units pop in as their atlas arrives. Game can start before everything is loaded — it just looks rough for a second.

### Performance Budget

- 60fps with 200 units on screen
- WASM binary: < 500KB gzipped
- Sprite atlases: ~500KB each (2-3 atlases total)
- Total initial load: < 2MB
- Lobby visible: < 3 seconds
- No framework tax: no React, no Next.js. Vite builds a minimal bundle.

## Asset Pipeline

```
art/                          → tools/pack-sprites.ts → frontend/public/assets/
(Aseprite, PSD, references)     (packs into atlases)     (production-ready sheets)
```

- `art/` — Source files for editing. Not served to browser.
- `frontend/public/assets/` — Production-ready sprite atlases with metadata (what the browser loads).
- `tools/pack-sprites.ts` — Takes individual sprites, packs into atlas sheets with coordinate metadata.
- Rust engine never touches art — outputs sprite IDs and positions. JS renderer maps sprite IDs to atlas coordinates.

## Debug API

The game exposes `window.__IRONTIDE_DEBUG` in dev builds (stripped in production via Vite env flag). This is the primary interface for agent-based QA.

**Important:** The debug API bypasses fog of war. All methods return data for ALL entities regardless of visibility. This is intentional — the QA agent needs to query enemy state to verify fog, combat, and sync behavior. The renderer still respects fog (enemy units in fog are not drawn).

```typescript
window.__IRONTIDE_DEBUG = {
    // === Game State ===
    getGameState(): 'lobby' | 'loading' | 'playing' | 'ended',
    getGameResult(): { winner: number | null, reason: 'cc_destroyed' | 'disconnect' | null },
    getTickCount(): number,
    getStateChecksum(): string,

    // === Resources & Economy ===
    getResources(playerId: number): number,
    getResourceNodes(): Array<{ id: number, x: number, y: number, remaining: number }>,

    // === Units ===
    getUnitCount(playerId?: number): number,
    getUnitsByType(playerId: number, type: 'worker' | 'rifleman' | 'tank'): Array<number>,
    getUnitPosition(entityId: number): { tileX: number, tileY: number },
    getUnitScreenPosition(entityId: number): { screenX: number, screenY: number },
    getUnitHealth(entityId: number): { current: number, max: number },
    getUnitState(entityId: number): 'idle' | 'moving' | 'attacking' | 'gathering' | 'building' | 'dead',
    getUnitCarrying(entityId: number): number,

    // === Buildings ===
    getBuildingCount(playerId?: number): number,
    getBuildingsByType(playerId: number, type: 'command_center' | 'barracks' | 'turret'): Array<number>,
    getBuildingPosition(entityId: number): { tileX: number, tileY: number },
    getBuildingScreenPosition(entityId: number): { screenX: number, screenY: number },
    getBuildingHealth(entityId: number): { current: number, max: number },
    getBuildingProgress(entityId: number): number,
    getProductionQueue(entityId: number): Array<{ unitType: string, progress: number }>,

    // === Selection ===
    getSelectedEntityIds(): Array<number>,
    getSelectedEntityType(entityId: number): 'worker' | 'rifleman' | 'tank' | 'command_center' | 'barracks' | 'turret',

    // === Camera ===
    getCameraPosition(): { x: number, y: number },
    getCameraZoom(): number,

    // === Fog of War ===
    isTileVisible(playerId: number, tileX: number, tileY: number): boolean,
    getVisibleTileCount(playerId: number): number,

    // === Map ===
    getMapSize(): { width: number, height: number },
    getTileType(tileX: number, tileY: number): 'grass' | 'rock' | 'water' | 'ore' | 'ramp',
    isPathable(tileX: number, tileY: number): boolean,

    // === Commands ===
    issueCommand(json: string): void,

    // === Tick Control ===
    getTickMode(): 'realtime' | 'manual',
    setTickMode(mode: 'realtime' | 'manual'): void,
    stepTick(): void,
    stepTicks(n: number): void,

    // === Performance ===
    getFrameTime(): number,
    getTickTime(): number,
}
```

### Command JSON Format

```json
{ "type": "Move", "entities": [1,2,3], "target": { "x": 100, "y": 50 } }
{ "type": "AttackMove", "entities": [1,2], "target": { "x": 100, "y": 50 } }
{ "type": "Attack", "entities": [1,2], "targetEntity": 5 }
{ "type": "Build", "builder": 1, "building": "barracks", "position": { "x": 30, "y": 30 } }
{ "type": "Train", "building": 5, "unitType": "rifleman" }
{ "type": "Stop", "entities": [1,2,3] }
```

## What V1 Does NOT Include (Technical)

- WebGL2 fallback renderer
- Flowfield pathfinding (A* only)
- Server-side simulation / anti-cheat
- Matchmaking service
- Audio system (Web Audio)
- Replay file export
- Database / persistence layer
- AI opponent logic
- Map editor / procedural generation
