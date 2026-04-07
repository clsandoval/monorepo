# Iron Tide - Browser RTS Game Architecture Plan

## Context

Build a "Krunker for RTS" - an instant-play browser real-time strategy game. The goal is 5 seconds from URL to playing, no downloads, no login. Inspired by StarCraft 2 and Red Alert. The game lives at `apps/irontide/` in the monorepo.

**Key decisions:**
- 2D Isometric (Red Alert style, sprite-based)
- 100-200 units per player (flowfield pathfinding)
- 256x256 tile maps (10-20 min games)
- WebGPU-first renderer (WebGL2 fallback)
- Rust → WebAssembly game engine
- Deterministic lockstep networking
- Custom minimal ECS
- 2 mirror factions at launch
- Working title: **Iron Tide**

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
│   │   │       │   └── movement.rs  # MoveTarget, FlowFieldId, Speed
│   │   │       ├── systems/         # Simulation systems (run in fixed order)
│   │   │       │   ├── mod.rs
│   │   │       │   ├── movement.rs
│   │   │       │   ├── combat.rs
│   │   │       │   ├── pathfinding.rs
│   │   │       │   ├── resource.rs
│   │   │       │   ├── production.rs
│   │   │       │   ├── fog.rs
│   │   │       │   └── cleanup.rs
│   │   │       ├── map/
│   │   │       │   ├── mod.rs
│   │   │       │   ├── terrain.rs   # 256x256 tile grid
│   │   │       │   ├── flowfield.rs # Flowfield pathfinding
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
│   ├── public/assets/               # Sprite atlases, terrain, audio
│   └── src/
│       ├── main.ts                  # Entry: init WASM, start game
│       ├── wasm/
│       │   └── bridge.ts            # WASM init + typed API wrapper
│       ├── renderer/
│       │   ├── index.ts             # Factory: WebGPU or WebGL2
│       │   ├── webgpu/
│       │   │   ├── renderer.ts
│       │   │   ├── sprite-batch.ts  # Instanced sprite rendering
│       │   │   ├── terrain.ts
│       │   │   ├── fog.ts
│       │   │   └── shaders/         # WGSL files
│       │   ├── webgl2/
│       │   │   ├── renderer.ts      # Fallback
│       │   │   ├── sprite-batch.ts
│       │   │   └── terrain.ts
│       │   ├── camera.ts            # Iso camera (pan, zoom)
│       │   └── atlas.ts             # Sprite atlas loader
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
│       ├── audio/
│       │   └── manager.ts           # Web Audio, lazy-loaded
│       ├── net/
│       │   ├── client.ts            # WebSocket client
│       │   ├── lockstep.ts          # Lockstep sync logic
│       │   └── protocol.ts          # Message types (mirrors Rust)
│       └── game/
│           ├── loop.ts              # requestAnimationFrame loop
│           ├── state.ts             # Client-side state (selection, camera)
│           └── commands.ts          # Input → game command translation
│
├── tools/
│   ├── build-wasm.sh
│   └── pack-sprites.ts
└── specs/
    └── design.md
```

## Key Architecture Decisions

### 1. Custom Minimal ECS (not hecs/legion)
- hecs/legion add ~100-200KB WASM size and use `HashMap` randomness that breaks determinism
- Game has ~15-20 known component types - use dense SoA (struct-of-arrays) with named fields
- Zero overhead, trivially deterministic, cache-friendly iteration

### 2. Fixed-Point Math for Determinism
- Q16.16 fixed-point (`i32` internally) for ALL simulation math
- `f32`/`f64` only allowed in rendering output conversion
- Seeded xorshift64 RNG, `BTreeMap` instead of `HashMap` in simulation

### 3. Rust Owns All Game State, JS Renders
- Rust computes isometric projection + fog culling, writes flat render buffer
- JS reads render buffer via shared WASM memory (zero-copy), uploads to GPU
- Render buffer: ~14 bytes per unit (sprite_id, screen_x, screen_y, frame, team_color, flags)

### 4. Flowfield Pathfinding
- One flowfield per unique destination tile, shared by all units moving there
- 256x256 integration field (~128KB) + flow field (~64KB) per destination
- LRU cache of 16-32 flowfields, invalidated on terrain changes
- ~3ms per flowfield in optimized WASM, budget 2-3 per tick

### 5. Deterministic Lockstep Networking
- 30 ticks/sec simulation, commands sent every tick
- Input delay of 2-4 ticks to hide latency
- Server is thin relay (tokio + tungstenite), does NOT simulate
- Checksum every 30 ticks for desync detection
- Reconnection via command replay + fast-forward (~2s for 10-min game)

### 6. WebGPU Renderer (3 passes per frame)
1. **Terrain pass**: Instanced quads, 16x16 tile chunks, only visible chunks drawn
2. **Sprite pass**: Single instanced draw call per atlas, pre-sorted by Y for depth
3. **Fog pass**: Full-screen quad sampling 256x256 fog texture from Rust

Renderer interface abstracted behind `IRenderer` for WebGL2 fallback.

### 7. "5 Seconds to Play" Loading
- WASM ~300-500KB gzipped, sprite atlases ~500KB each
- Lobby UI is vanilla DOM (no framework), inlined in initial bundle
- Matchmaking starts during faction selection
- Progressive rendering: terrain first, units as colored circles until sprites load
- Tiered asset loading: bundled → preloaded → lazy → deferred

## Reference Files
- Existing Rust→WASM pattern: `/home/user/monorepo/apps/inheritance/engine/Cargo.toml`
- Existing game app: `/home/user/monorepo/apps/robot-uprising/` (for Vite + game structure reference)

## Implementation Phases

### Phase 1: Core Engine + Single-Player Rendering
**Goal**: Units moving on an isometric map, rendered in browser

1. Set up Rust workspace (`engine/Cargo.toml`, `irontide-core`, `irontide-wasm`)
2. Implement fixed-point math (`math/fixed.rs`)
3. Implement ECS world with Position, Velocity, UnitType, Team components
4. Implement terrain map (256x256 tile grid with basic terrain types)
5. Implement A* pathfinding (simpler than flowfield, upgrade later)
6. Implement `tick()` function with movement system
7. WASM bindings: `init_game()`, `tick()`, `get_render_buffer_ptr()`
8. Frontend: Vite project, WASM bridge, WebGPU renderer with terrain + sprite passes
9. Input: mouse click → move command → units move to clicked tile
10. Camera: pan with WASD/edge scroll, zoom with scroll wheel

**Deliverable**: Open browser, see isometric map, click to move units around

### Phase 2: Combat + Resources + Buildings
**Goal**: Full single-player gameplay loop

1. Add combat components (Health, Damage, Armor, AttackCooldown)
2. Combat system: target acquisition (nearest enemy), damage application, death
3. Resource system: harvesters gather from nodes, return to base, deposit
4. Building system: construction progress, production queues, unit training
5. Upgrade pathfinding to flowfields
6. Fog of war system
7. Unit types: Harvester, Rifleman, Tank, Builder + base buildings
8. UI: HUD (resources, supply), minimap, command card, box selection

**Deliverable**: Play a full single-player skirmish vs scripted AI

### Phase 3: Multiplayer
**Goal**: 1v1 online play

1. Build `irontide-server` relay (tokio + tungstenite)
2. Implement lockstep protocol (command buffering, turn sequencing)
3. Add checksum-based desync detection
4. Matchmaking (simple queue → room creation)
5. Anonymous sessions (UUID token, no login)
6. Reconnection via command replay
7. Deploy server to Fly.io

**Deliverable**: Two players can play a full 1v1 game in browser

### Phase 4: Polish + Launch
**Goal**: "Krunker energy" - instant play, addictive loop

1. WebGL2 fallback renderer
2. Faction skins (2 mirror factions, different visuals)
3. Sound effects + music (Web Audio, lazy-loaded)
4. Loading optimization (progressive rendering, asset tiers)
5. Basic AI opponent for practice
6. Ranked ladder (ELO, stored in SQLite/Turso)
7. Replay system (already have command logs from lockstep)
8. Map pool (5-10 maps)

## QA Plan — Agent-Playable Testing

The QA strategy is designed so that **Claude (the agent) can play and test the game itself** using Playwright MCP tools at every phase. Each phase has automated Rust-level tests AND browser-based Playwright tests where the agent interacts with the game as a player would.

### Testing Infrastructure

**Playwright test harness** (`frontend/src/test/e2e/`):
- Uses the Playwright MCP tools (`browser_navigate`, `browser_click`, `browser_snapshot`, `browser_evaluate`, etc.)
- Game exposes a `window.__IRONTIDE_DEBUG` API from the WASM bridge for test introspection:
  ```typescript
  window.__IRONTIDE_DEBUG = {
      getUnitCount: () => number,
      getUnitPosition: (id: number) => { x: number, y: number },
      getResources: (playerId: number) => number,
      getTickCount: () => number,
      getBuildingCount: (playerId: number) => number,
      getGameState: () => 'lobby' | 'playing' | 'ended',
      issueCommand: (cmd: string) => void,  // JSON-encoded PlayerCommand
      getStateChecksum: () => string,
      fastForward: (ticks: number) => void, // Skip ticks for faster testing
  };
  ```
- This debug API is compiled into dev builds only (stripped in production via Vite env flag)

### Phase 1 QA: Core Engine + Rendering

**Rust unit tests** (`cargo test`):
- Fixed-point math: arithmetic precision, overflow handling, conversion to/from f32
- ECS: entity creation/destruction, component add/remove/query
- Pathfinding: A* finds valid path on open terrain, avoids obstacles, handles unreachable
- Determinism: run 1000 ticks with same seed + commands, assert identical state checksum
- Map generation: deterministic from seed, all tiles valid

**Playwright agent-plays-the-game tests**:
1. **Smoke test**: Navigate to `localhost:5173`, take screenshot, verify canvas renders (non-blank)
2. **Unit movement test**:
   - `browser_snapshot` to find the game canvas
   - `browser_click` on a unit to select it
   - `browser_click` on a destination tile
   - `browser_evaluate` → `__IRONTIDE_DEBUG.getUnitPosition(0)` to poll position
   - Wait (via `browser_evaluate` with `fastForward(60)`) and verify unit reached destination
   - Assert: unit's final position is within 1 tile of click target
3. **Camera test**:
   - `browser_press_key` WASD to pan camera
   - `browser_evaluate` to read camera offset, verify it changed
   - Mouse wheel zoom, verify zoom level changed
4. **Performance gate**:
   - `browser_evaluate` → measure frame time over 100 frames
   - Assert: average frame time < 16ms (60fps) with 50 units on screen

**Pass criteria**: All Rust tests pass, all Playwright tests pass, WASM binary < 500KB gzipped

### Phase 2 QA: Combat + Resources + Buildings

**Rust unit tests** (`cargo test`):
- Combat: unit A attacks unit B → B takes correct damage, armor reduces damage, unit dies at 0 HP
- Resources: harvester gathers → carries resource → returns to base → deposits → resource count increases
- Production: building queues unit → ticks pass → unit spawned at rally point
- Flowfield: 100 units sharing a destination all receive valid flow directions
- Fog of war: enemy unit outside vision range is not in render buffer

**Playwright agent-plays-the-game tests**:
1. **Combat test**:
   - Select friendly units, right-click enemy units
   - `fastForward(300)` (10 seconds of game time)
   - `getUnitCount()` should have decreased (some units died)
   - Take screenshot to verify visual combat (projectiles, death animations)
2. **Resource gathering test**:
   - Select harvester, click on resource node
   - `fastForward(600)` (20 seconds)
   - `getResources(0)` should be > starting amount
3. **Building test**:
   - Select builder, use hotkey to place a building
   - `fastForward(300)` 
   - `getBuildingCount(0)` should have increased by 1
4. **Full skirmish playthrough** (agent plays a complete game):
   - Start skirmish vs scripted AI
   - Agent follows a build order:
     a. Train 3 harvesters (hotkey → click barracks → click train button)
     b. Build a second resource depot
     c. Build barracks, train 10 riflemen
     d. Attack-move army to enemy base
   - `fastForward` between actions to skip waiting
   - Assert: game reaches 'ended' state OR agent's army reaches enemy base area
   - Take screenshots at key moments for visual verification
5. **Box selection test**:
   - `browser_click` + drag to box-select multiple units
   - `browser_evaluate` to verify selection count matches expected
6. **Minimap test**:
   - Click on minimap area, verify camera jumps to that location

**Pass criteria**: Full skirmish playable end-to-end, all automated tests pass

### Phase 3 QA: Multiplayer

**Rust unit tests**:
- Lockstep protocol: simulate 2 clients sending commands, verify identical state after N ticks
- Reconnection: replay command log, verify state matches live client
- Desync detection: intentionally mutate one client's state, verify checksum mismatch caught

**Playwright agent-plays-the-game tests** (two browser tabs):
1. **Two-player sync test**:
   - Open `localhost:5173` in two tabs (use Playwright MCP `browser_navigate`)
   - Both players join a game
   - Player 1: select unit, move to location
   - `fastForward` on both tabs
   - `getStateChecksum()` on both tabs → assert they match
2. **Full 1v1 test** (agent plays both sides):
   - Tab 1 (Player 1): build harvesters, build army, attack
   - Tab 2 (Player 2): same build order
   - `fastForward` between actions
   - Verify game completes, one player wins
   - Checksums match throughout
3. **Disconnect/reconnect test**:
   - Tab 1 plays for 60 ticks
   - Close Tab 1, reopen, reconnect
   - `getTickCount()` should match Tab 2
   - `getStateChecksum()` should match

**Pass criteria**: Two-tab game completes without desync, reconnection works

### Phase 4 QA: Polish + Launch

**Playwright tests**:
1. **WebGL2 fallback test**:
   - `browser_evaluate` to mock `navigator.gpu = undefined`
   - Reload, verify game still renders (take screenshot)
2. **Load time test**:
   - Navigate to game URL with network throttling
   - Measure time from navigation to first interactive frame
   - Assert: < 5 seconds on simulated fast 3G
3. **Progressive loading test**:
   - Navigate, immediately take screenshot at 500ms, 1s, 2s
   - Verify: terrain visible by 1s, units visible by 2s
4. **Audio test**:
   - Play a game, `browser_evaluate` to check `AudioContext.state === 'running'`
5. **End-to-end "Krunker test"** (the ultimate QA):
   - Cold navigate to game URL
   - Click "Play" (no login)
   - Verify: matched and in-game within 5 seconds
   - Play for 2 minutes (agent issues commands)
   - Verify: no crashes, no visual glitches (screenshot comparison)

### Continuous QA (Run After Every Change)

```bash
# Rust tests (fast, ~5 seconds)
cd apps/irontide/engine && cargo test

# WASM build check
cd apps/irontide && ./tools/build-wasm.sh

# Playwright smoke test (agent navigates, clicks, verifies render)
# Run via: start vite dev server, then use Playwright MCP tools

# Determinism regression (critical - catches any non-determinism bug)
cd apps/irontide/engine && cargo test determinism -- --nocapture
```

### Debug API Reference

The `__IRONTIDE_DEBUG` interface is the bridge between the agent and the game. Every QA test uses it. Key methods:

| Method | Returns | Use in QA |
|--------|---------|-----------|
| `getUnitCount()` | `number` | Verify units spawned/died |
| `getUnitPosition(id)` | `{x, y}` | Verify movement completed |
| `getResources(pid)` | `number` | Verify economy working |
| `getTickCount()` | `number` | Verify simulation advancing |
| `getBuildingCount(pid)` | `number` | Verify construction |
| `getGameState()` | `string` | Verify game phase transitions |
| `issueCommand(json)` | `void` | Agent issues commands programmatically |
| `getStateChecksum()` | `string` | Desync detection |
| `fastForward(n)` | `void` | Skip N ticks (faster testing) |
