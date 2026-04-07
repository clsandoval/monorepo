# Iron Tide — QA Specification

**Status:** Approved
**Date:** 2026-04-07
**Companion docs:** `2026-04-07-irontide-game-design.md`, `2026-04-07-irontide-technical-architecture.md`

## QA Philosophy

Every test has **dual validation**: a debug API assertion (code-level) AND a screenshot assertion (user-level) where applicable. The agent NEVER relies solely on screenshots for pass/fail — the API is authoritative. Screenshots catch rendering bugs the API can't see (sprites not drawn, wrong atlas frame, missing health bars, fog overlay absent).

Tests marked `[API only]` have no meaningful visual component (e.g., checksum comparisons, numeric performance measurements).

## Tick Modes

All tests in Tiers 1-11 run in **manual tick mode** for deterministic, timing-independent assertions. Tier 12 runs in manual mode. Tier 13 runs in **real-time mode** to test the actual player experience.

```typescript
// Manual mode: simulation only advances on explicit calls
__IRONTIDE_DEBUG.setTickMode('manual')
__IRONTIDE_DEBUG.stepTicks(60)  // advance exactly 60 ticks

// Real-time mode: simulation runs at 30 ticks/sec
__IRONTIDE_DEBUG.setTickMode('realtime')
```

## Debug API Reference

Full API defined in the Technical Architecture doc. All assertions below reference `__IRONTIDE_DEBUG.*` methods.

---

## Tier 1 — Page Load & Lobby

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 1.1 | Page loads | `browser_navigate(url)` | `browser_snapshot` contains "Create Room" AND "Join Room" | Screenshot: lobby UI visible with two buttons, no broken layout, no blank page |
| 1.2 | Load time | `browser_evaluate` → `performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart` | < 3000ms | [API only] |
| 1.3 | WASM initialized | `browser_evaluate` → `typeof window.__IRONTIDE_DEBUG?.getGameState` | Returns `'function'` | [API only] |
| 1.4 | Game state is lobby | `getGameState()` | Returns `'lobby'` | [API only] |
| 1.5 | Create room | `browser_click` "Create Room" | `browser_snapshot` contains room code (4-6 char alphanumeric) | Screenshot: room code visible, "waiting for player" state shown |
| 1.6 | Join room | Tab 2: navigate, enter code, click Join | Both tabs: `getGameState()` → `'playing'` | Screenshot both tabs: lobby gone, game canvas visible |
| 1.7 | Initial tick | `getTickCount()` | Returns 0 or 1 | [API only] |

---

## Tier 2 — Rendering & Camera

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 2.1 | Canvas exists | `browser_evaluate` → `querySelector('canvas')` | Not null | Screenshot: canvas element takes up majority of viewport |
| 2.2 | Terrain renders | `getMapSize()` | Returns `{ width: 256, height: 256 }` | Screenshot: isometric terrain grid visible, tiles have distinct textures (grass, rock, water), not a solid color |
| 2.3 | Starting units visible | `getUnitCount(0)` | Returns starting worker count | Screenshot: worker sprites visible on map near starting CC, distinguishable from terrain |
| 2.4 | Starting CC visible | `getBuildingsByType(0, 'command_center')` | Length === 1 | Screenshot: CC building sprite visible, larger than unit sprites, at expected starting position |
| 2.5 | Team colors | `getUnitScreenPosition` for both players' units | Both return valid positions | Screenshot Tab 1 vs Tab 2: units have two distinct team colors |
| 2.6 | Ore nodes visible | `getResourceNodes()` | Length > 0 | Screenshot: ore node sprites visible, visually distinct from terrain |
| 2.7 | Camera default | `getCameraPosition()` | Centered on player's starting base | Screenshot: starting CC and workers near center of screen |
| 2.8 | Camera pan W | Press 'w', wait, read camera | Y decreased | Screenshot before/after: terrain shifted downward, different tiles visible |
| 2.9 | Camera pan A | Press 'a', wait, read camera | X decreased | Screenshot before/after: terrain shifted right |
| 2.10 | Camera pan S | Press 's', wait, read camera | Y increased | Screenshot before/after: terrain shifted upward |
| 2.11 | Camera pan D | Press 'd', wait, read camera | X increased | Screenshot before/after: terrain shifted left |
| 2.12 | Camera zoom in | Dispatch wheel event (deltaY < 0) | Zoom level increased | Screenshot before/after: tiles appear larger, fewer tiles on screen |
| 2.13 | Camera zoom out | Dispatch wheel event (deltaY > 0) | Zoom level decreased | Screenshot before/after: tiles appear smaller, more tiles on screen |
| 2.14 | FPS at idle | `getFrameTime()` | < 16.6ms | [API only] |
| 2.15 | Fog visible | `getVisibleTileCount(0)` | > 0 AND < 65536 | Screenshot: areas near base lit/clear, distant areas dark/obscured, clear boundary |
| 2.16 | Enemy base hidden | `isTileVisible(0, enemyCcX, enemyCcY)` | Returns `false` | Screenshot: area where enemy base is located covered by fog |

---

## Tier 3 — Unit Selection & Input

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 3.1 | Click select | Get worker screen pos, click it | `getSelectedEntityIds()` contains workerId | Screenshot: selected unit has visible selection indicator (circle, highlight, outline) |
| 3.2 | Selection type | Check selected type | `getSelectedEntityType()` === `'worker'` | Screenshot: command card / unit portrait shows worker info |
| 3.3 | Deselect | Click empty terrain | `getSelectedEntityIds()` empty | Screenshot: no selection indicators on any unit |
| 3.4 | Box select | Click-drag across multiple workers | `getSelectedEntityIds()` contains both IDs | Screenshot: multiple units showing selection indicators |
| 3.5 | Move command | Right-click empty terrain | `getUnitState()` → `'moving'` after `stepTicks(5)` | Screenshot after stepTicks(30): unit visibly moved from original position |
| 3.6 | Unit arrives | `stepTicks(90)` | Position within 2 tiles of target | Screenshot: unit sprite at/near clicked destination |
| 3.7 | Idle after arrival | Check state | `getUnitState()` → `'idle'` | Screenshot: unit stationary |
| 3.8 | Control group assign | Select units, Ctrl+1 | No error thrown | [API only] |
| 3.9 | Control group recall | Deselect, press '1' | Same IDs re-selected | Screenshot: same units now showing selection indicators |
| 3.10 | Attack-move | Press 'a', click location | `getUnitState()` → `'moving'` after `stepTicks(5)` | Screenshot: unit moving toward destination |
| 3.11 | Stop command | Press 's' while moving | `getUnitState()` → `'idle'` after `stepTicks(5)` | Screenshot: unit stopped |

---

## Tier 4 — Economy

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 4.1 | Starting resources | `getResources(0)` | Returns config starting amount | Screenshot: HUD resource display shows correct starting number |
| 4.2 | Ore nodes data | `getResourceNodes()` | Length > 0, all have remaining > 0 | [API only — covered by 2.6 visually] |
| 4.3 | Gather command | Right-click ore node | `getUnitState()` → `'gathering'` or `'moving'` after `stepTicks(5)` | Screenshot after stepTicks(60): worker at/near ore node |
| 4.4 | Worker picks up ore | `stepTicks(60)` at node | `getUnitCarrying(workerId)` > 0 | Screenshot: worker may show carry indicator (API authoritative) |
| 4.5 | Worker returns to CC | `stepTicks(120)` | Position near CC | Screenshot: worker moved from ore node back toward CC |
| 4.6 | Ore deposited | Worker at CC | `getResources(0)` > starting amount | Screenshot: HUD resource count increased |
| 4.7 | Auto-re-gather | `stepTicks(30)` after deposit | `getUnitState()` → `'gathering'` or `'moving'` | Screenshot: worker heading back toward ore node |
| 4.8 | Node depletion | `stepTicks(3000)` | Node `remaining` decreased | [API only] |
| 4.9 | Multi-worker efficiency | 3 workers on one node, `stepTicks(300)` | `getResources(0)` increased faster than 1-worker rate | [API only] |

---

## Tier 5 — Building Construction

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 5.1 | Build command | Issue build barracks | `getUnitState()` → `'building'` or `'moving'` after `stepTicks(5)` | Screenshot: worker moving toward build site |
| 5.2 | Building appears | `stepTicks(30)` | `getBuildingsByType(0, 'barracks')` length === 1 | Screenshot: barracks construction sprite visible (under construction appearance) |
| 5.3 | Progress advances | Check progress, `stepTicks(30)`, check again | Progress increased, < 1.0 | Screenshot: building looks more complete or progress bar visible |
| 5.4 | Building completes | `stepTicks(300)` | Progress === 1.0 | Screenshot: barracks fully built, complete sprite |
| 5.5 | Resources deducted | Compare before/after build | Decreased by barracks cost | Screenshot: HUD resource count decreased |
| 5.6 | Worker freed | Check state after completion | `getUnitState()` → `'idle'` | Screenshot: worker idle near completed building |
| 5.7 | Build turret | Same flow for turret | `getBuildingsByType(0, 'turret')` length === 1 | Screenshot: turret sprite visible, looks different from barracks |
| 5.8 | Build expansion CC | Build CC at remote ore | `getBuildingsByType(0, 'command_center')` length === 2 | Screenshot: second CC visible at new location |
| 5.9 | No resources = no build | 0 ore, issue build | No new building after `stepTicks(60)` | Screenshot: no new building appeared |
| 5.10 | Blocked tile = no build | Build on water/rock | No new building after `stepTicks(60)` | Screenshot: no building on impassable terrain |

---

## Tier 6 — Unit Production

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 6.1 | Queue worker | Train worker from CC | `getProductionQueue(ccId)` has worker entry | Screenshot: CC selected, production UI shows worker in queue |
| 6.2 | Production progress | `stepTicks(30)` | Queue progress > 0, < 1.0 | Screenshot: progress bar/indicator visible |
| 6.3 | Unit spawns | `stepTicks(300)` | Worker count increased by 1 | Screenshot: new worker sprite visible near CC |
| 6.4 | Spawn position | `getUnitPosition(newId)` | Near CC | [API only — covered by 6.3 visually] |
| 6.5 | Queue empty | `getProductionQueue(ccId)` | Empty array | Screenshot: production UI shows no units queued |
| 6.6 | Train rifleman | Train from barracks | Rifleman count === 1 after `stepTicks(300)` | Screenshot: rifleman sprite near barracks, visually distinct from worker |
| 6.7 | Train tank | Train from barracks | Tank count === 1 after `stepTicks(600)` | Screenshot: tank sprite visible, larger/different from rifleman |
| 6.8 | Queue multiple | 3 train commands | `getProductionQueue()` length === 3 | Screenshot: production UI shows 3 units queued |
| 6.9 | Queue drains | `stepTicks(1000)` | Rifleman count increased by 3 | Screenshot: 3 rifleman sprites near barracks |
| 6.10 | No ore = no train | 0 ore, train command | Queue stays empty | Screenshot: no change in production UI |

---

## Tier 7 — Combat

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 7.1 | Attack command | Issue attack on enemy | `getUnitState()` → `'attacking'` or `'moving'` after `stepTicks(5)` | Screenshot: unit moving toward enemy |
| 7.2 | Damage dealt | `stepTicks(60)` in range | Enemy health decreased | Screenshot: enemy health bar shows reduced health |
| 7.3 | Unit dies | Damage to 0 HP | `getUnitState()` → `'dead'` | Screenshot: death animation or unit gone |
| 7.4 | Dead unit removed | `stepTicks(30)` after death | Unit count decreased | Screenshot: no unit sprite at death location |
| 7.5 | Attack-move engages | Move through enemy area | `getUnitState()` → `'attacking'` after `stepTicks(120)` | Screenshot: unit stopped, engaged with enemy |
| 7.6 | Auto-attack | Enemy walks into range | `getUnitState()` → `'attacking'` after `stepTicks(30)` | Screenshot: idle unit now engaged with nearby enemy |
| 7.7 | Turret attacks | Enemy near turret | Enemy health decreased after `stepTicks(60)` | Screenshot: turret firing, enemy health bar reduced |
| 7.8 | Tank high damage | Tank attacks rifleman | Rifleman health drops significantly | Screenshot: rifleman health bar shows major damage |
| 7.9 | Armor effect | Rifleman attacks tank | Damage per hit < base rifleman damage | [API only] |
| 7.10 | Worker can't attack | Attack command with worker | State NOT `'attacking'` after `stepTicks(30)` | Screenshot: worker not engaged, no attack animation |

---

## Tier 8 — Fog of War

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 8.1 | Base visible | `isTileVisible(0, ccX, ccY)` | `true` | Screenshot: base area clearly visible, no fog |
| 8.2 | Enemy hidden | `isTileVisible(0, enemyX, enemyY)` | `false` | Screenshot: enemy base covered by dark fog |
| 8.3 | Scout reveals | Move unit to unexplored area, `stepTicks(90)` | `isTileVisible` at new position → `true` | Screenshot before/after: previously fogged area now clear around unit |
| 8.4 | Fog returns | Move unit away, `stepTicks(120)` | `isTileVisible` at old position → `false` | Screenshot: previously revealed area fogged again |
| 8.5 | Expansion reveals | Build CC at new location | `getVisibleTileCount(0)` increased | Screenshot: new permanent vision radius around expansion CC |
| 8.6 | Hidden enemy units | Enemy in fog | Screen position returns null or excluded | Screenshot: no enemy unit sprites visible in fogged area |

---

## Tier 9 — Win Condition

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 9.1 | Game continues | CC alive, combat happening | `getGameState()` → `'playing'` | Screenshot: game still active, HUD visible, units moving |
| 9.2 | CC destroyed → game ends | Destroy enemy CC | `getGameState()` → `'ended'` | Screenshot: victory/defeat screen or overlay appears |
| 9.3 | Winner correct | `getGameResult()` | `{ winner: 0, reason: 'cc_destroyed' }` | Screenshot: victory screen says "You Win" or equivalent |
| 9.4 | Two CCs — one destroyed | Enemy has 2 CCs, destroy one | `getGameState()` → `'playing'` | Screenshot: game still going, no victory screen |
| 9.5 | Last CC destroyed | Destroy remaining CC | `getGameState()` → `'ended'` | Screenshot: victory screen appears |

---

## Tier 10 — Multiplayer Sync

| # | Test | Action | [API] Pass Condition | [VIS] Pass Condition |
|---|------|--------|---------------------|---------------------|
| 10.1 | Synced start | Both tabs in game | `getTickCount()` within 2 ticks | Screenshot both tabs: same starting state, units same positions |
| 10.2 | Command syncs | Tab 1 moves unit, `stepTicks(60)` both | `getUnitPosition()` identical on both | Screenshot both tabs: unit in same position |
| 10.3 | Checksum 30 ticks | `stepTicks(30)` both | `getStateChecksum()` identical | [API only] |
| 10.4 | Checksum after commands | Both issue commands, `stepTicks(300)` | Checksums identical | [API only] |
| 10.5 | Checksum after combat | Units fight for 600 ticks | Checksums identical | Screenshot both tabs: same units alive/dead, health bars match |
| 10.6 | Full game sync | Play to completion | All checksum pairs match | Screenshot at 5 checkpoints: both tabs show same state |
| 10.7 | Reconnection | Close tab 1, reopen, rejoin | Tick count and checksum match tab 2 | Screenshot: reconnected tab matches tab 2 |

---

## Tier 11 — Performance

All [API only].

| # | Test | Action | [API] Pass Condition |
|---|------|--------|---------------------|
| 11.1 | FPS at start | `getFrameTime()` | < 16.6ms |
| 11.2 | FPS 50 units | Spawn 50 | < 16.6ms |
| 11.3 | FPS 100 units | Spawn 100 | < 16.6ms |
| 11.4 | FPS 200 units | Spawn 200 | < 16.6ms |
| 11.5 | Tick time | 200 units, combat active | < 33ms |
| 11.6 | WASM size | Build check | < 500KB gzipped |

---

## Tier 12 — Full Playthrough (Manual Tick Mode)

Agent plays a complete game using `stepTicks()`. Every step has dual validation.

| # | Step | [API] Check | [VIS] Check |
|---|------|------------|-------------|
| 12.1 | Create room | `getGameState()` === `'lobby'` | Lobby UI with room code visible |
| 12.2 | Tab 2 joins | Both: `getGameState()` === `'playing'` | Both tabs: game canvas, terrain, units visible |
| 12.3 | Starting state | P0: 1 CC, N workers, starting ore | HUD shows resource count, workers and CC visible |
| 12.4 | Send workers to gather | All workers: `getUnitState()` === `'gathering'` after stepTicks | Workers at/near ore nodes |
| 12.5 | Ore income | `getResources(0)` > start after stepTicks(300) | HUD resource number increased |
| 12.6 | Build barracks | Barracks exists, progress === 1.0 | Barracks fully built on map |
| 12.7 | Train extra workers | Worker count increased by 2 | New worker sprites near CC |
| 12.8 | Workers gathering | All workers `'gathering'` | Workers at ore nodes |
| 12.9 | Train 5 riflemen | Rifleman count === 5 | 5 rifleman sprites near barracks |
| 12.10 | Train 2 tanks | Tank count === 2 | 2 tank sprites near barracks, larger than riflemen |
| 12.11 | Build turret | Turret exists | Turret sprite near base |
| 12.12 | Attack-move army | All combat units `'moving'` | Army moving across map |
| 12.13 | Engage enemy | At least one unit `'attacking'` | Units fighting visible enemies |
| 12.14 | Combat resolves | Unit count decreased for at least one player | Fewer sprites, health bars reduced |
| 12.15 | Attack enemy CC | Enemy CC health < max | Enemy CC health bar depleted |
| 12.16 | Game ends | `getGameState()` === `'ended'`, winner === 0 | Victory screen displayed |
| 12.17 | Checksums matched | All checksum pairs identical throughout | [API only] |

---

## Tier 13 — Full Playthrough (Real-Time Mode)

Same steps as Tier 12 but with `setTickMode('realtime')`. Uses real delays instead of `stepTicks()`. Tests the actual player experience.

| # | Step | [API] Check | [VIS] Check |
|---|------|------------|-------------|
| 13.1-13.17 | Same as 12.1-12.17 | Same assertions | Same visual checks |

Additional real-time-only checks:

| # | Test | [API] Check | [VIS] Check |
|---|------|------------|-------------|
| 13.18 | Frame time throughout | `getFrameTime()` sampled every 30 seconds | < 16.6ms consistently |
| 13.19 | No input lag | Time from click to `getUnitState()` change | < 150ms |
| 13.20 | Smooth camera pan | Hold 'w' for 2 seconds, sample frame times | No frame > 33ms (no stutter) |
| 13.21 | Game pacing | `getTickCount()` at end / 30 | Game lasted 5-15 minutes |

---

## Total Test Count

| Tier | Tests | Dual Validated |
|------|-------|---------------|
| 1. Lobby | 7 | 4 |
| 2. Rendering | 16 | 14 |
| 3. Selection/Input | 11 | 9 |
| 4. Economy | 9 | 6 |
| 5. Building | 10 | 10 |
| 6. Production | 10 | 9 |
| 7. Combat | 10 | 9 |
| 8. Fog of War | 6 | 6 |
| 9. Win Condition | 5 | 5 |
| 10. Multiplayer | 7 | 4 |
| 11. Performance | 6 | 0 |
| 12. Playthrough (manual) | 17 | 16 |
| 13. Playthrough (real-time) | 21 | 20 |
| **Total** | **135** | **112** |
