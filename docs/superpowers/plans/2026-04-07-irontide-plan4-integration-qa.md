# Iron Tide — Plan 4: Integration & QA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire everything end-to-end, run the full 135-test QA suite, fix any gaps discovered. Deliverable: V1 complete, all QA tiers pass.

**Architecture:** This plan is integration testing and bug fixing — no new features. Every task runs a tier of QA tests from the spec and fixes any failures.

**Tech Stack:** Playwright MCP tools, Rust `cargo test`, browser dev tools

**Depends on:** Plans 1, 2, and 3 must be done first.

**Reference specs:**
- QA spec: `docs/superpowers/specs/2026-04-07-irontide-qa-spec.md`
- Game design: `docs/superpowers/specs/2026-04-07-irontide-game-design.md`
- Technical architecture: `docs/superpowers/specs/2026-04-07-irontide-technical-architecture.md`

---

### Task 1: Verify Rust engine tests pass

**Files:** None created — this is a test-and-fix task.

- [ ] **Step 1: Run full Rust test suite**

```bash
cd apps/irontide/engine && cargo test 2>&1
```

Expected: All tests pass. If any fail, fix them before proceeding.

- [ ] **Step 2: Run determinism regression**

```bash
cd apps/irontide/engine && cargo test determinism -- --nocapture 2>&1
```

Expected: PASS — both determinism tests (full game and divergence detection).

- [ ] **Step 3: Build WASM and check size**

```bash
cd apps/irontide && ./tools/build-wasm.sh
ls -lh frontend/src/wasm/pkg/irontide_bg.wasm
gzip -k frontend/src/wasm/pkg/irontide_bg.wasm && ls -lh frontend/src/wasm/pkg/irontide_bg.wasm.gz
```

Expected: Gzipped WASM < 500KB.

- [ ] **Step 4: Commit any fixes**

```bash
git add -u && git commit -m "fix(irontide): engine test fixes for integration" || echo "No fixes needed"
```

---

### Task 2: QA Tier 1 — Page Load & Lobby

Run all 7 tests from QA Tier 1 using Playwright MCP tools against the dev server.

- [ ] **Step 1: Start dev server**

```bash
cd apps/irontide/frontend && npx vite --host 0.0.0.0 &
```

- [ ] **Step 2: Run Tier 1 tests (1.1–1.7)**

Using Playwright MCP tools:

1. `browser_navigate` to `http://localhost:5173`
2. `browser_snapshot` — verify "Start Local Game" button visible (1.1)
3. `browser_evaluate` → `performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart` — assert < 3000ms (1.2)
4. `browser_evaluate` → `typeof window.__IRONTIDE_DEBUG?.getGameState` — assert returns `'function'` (1.3)
5. `browser_evaluate` → `window.__IRONTIDE_DEBUG.getGameState()` — assert returns `'lobby'` (1.4)
6. `browser_click` "Start Local Game" button (1.5)
7. `browser_evaluate` → `window.__IRONTIDE_DEBUG.getGameState()` — assert returns `'playing'` (1.6 simplified — local mode)
8. `browser_evaluate` → `window.__IRONTIDE_DEBUG.getTickCount()` — assert returns 0 or 1 (1.7)
9. `browser_take_screenshot` — verify game canvas visible, lobby hidden

- [ ] **Step 3: Fix any failures**

If any test fails, diagnose the root cause and fix. Common issues:
- WASM not loading: check build-wasm.sh output path matches Vite import
- Debug API not defined: check debug.ts is imported and initialized
- Game state not transitioning: check lobby button click handler

- [ ] **Step 4: Commit fixes**

```bash
git add -u && git commit -m "fix(irontide): tier 1 QA fixes — lobby and page load" || echo "No fixes needed"
```

---

### Task 3: QA Tier 2 — Rendering & Camera

Run all 16 tests from QA Tier 2.

- [ ] **Step 1: Start game (use debug API)**

```javascript
// In browser_evaluate:
window.__IRONTIDE_DEBUG.setTickMode('manual');
```

- [ ] **Step 2: Run Tier 2 tests (2.1–2.16)**

Key checks:
- Canvas exists and has non-zero dimensions (2.1, 2.2)
- `getMapSize()` returns `{width: 256, height: 256}` (2.3 — note: current API returns a number, may need fix)
- `getUnitCount(0)` returns expected starting workers (2.4)
- `getBuildingsByType(0, 'command_center')` returns array of length 1 (2.5)
- Camera pan: read position, press key, read again, assert changed (2.8–2.11)
- Camera zoom: dispatch wheel event, verify zoom changed (2.12–2.13)
- `getFrameTime()` < 16.6ms (2.14)
- `getVisibleTileCount(0)` > 0 and < 65536 (2.15)
- Enemy base tile not visible (2.16)
- Take screenshots at each step for visual verification

- [ ] **Step 3: Fix any failures**

Common issues:
- Camera not responding to keys: check KeyboardInput event listeners
- Fog not working: verify update_fog runs in tick and includes buildings
- FPS too slow: check if terrain renderer is doing too many draw calls

- [ ] **Step 4: Commit fixes**

---

### Task 4: QA Tiers 3–8 — Game Mechanics

Run all tests from Tiers 3 (Selection), 4 (Economy), 5 (Building), 6 (Production), 7 (Combat), and 8 (Fog).

- [ ] **Step 1: Set up test state**

```javascript
window.__IRONTIDE_DEBUG.setTickMode('manual');
```

- [ ] **Step 2: Run Tier 3 tests — Selection & Input**

Key checks:
- Click-select a worker using screen position from debug API (3.1)
- Verify `getSelectedEntityIds()` returns the clicked entity (3.1)
- Box select multiple workers (3.4)
- Right-click move, stepTicks(5), verify state is 'moving' (3.5)
- stepTicks(90), verify position near target (3.6)
- Control group assign/recall (3.8–3.9)

- [ ] **Step 3: Run Tier 4 tests — Economy**

Key checks:
- Starting resources match config (4.1)
- Resource nodes exist (4.2)
- Worker gather → deposit → re-gather cycle works (4.3–4.7)
- Issue Attack command on a resource node entity with a worker selected
- stepTicks(600) — resources should have increased (4.6)

- [ ] **Step 4: Run Tier 5 tests — Building Construction**

Key checks:
- Issue Build command, verify building appears (5.1–5.2)
- Progress advances with stepTicks (5.3)
- Building completes (5.4)
- Resources deducted (5.5)
- Can't build without resources (5.9)
- Can't build on blocked tile (5.10)

- [ ] **Step 5: Run Tier 6 tests — Unit Production**

Key checks:
- Queue a worker at CC, verify production queue (6.1)
- stepTicks until unit spawns (6.3)
- Train rifleman and tank from barracks (6.6–6.7)
- Queue multiple, verify sequential drain (6.8–6.9)

- [ ] **Step 6: Run Tier 7 tests — Combat**

Key checks:
- Attack command, verify damage dealt (7.1–7.2)
- Unit dies at 0 HP, gets cleaned up (7.3–7.4)
- Turret auto-attacks (7.7)
- Armor reduces damage (7.9)
- Worker can't attack (7.10)

- [ ] **Step 7: Run Tier 8 tests — Fog of War**

Key checks:
- Base visible, enemy hidden (8.1–8.2)
- Moving unit reveals fog (8.3)
- Fog returns when unit leaves (8.4)
- Building expansion reveals area (8.5)

- [ ] **Step 8: Fix all failures and commit**

```bash
git add -u && git commit -m "fix(irontide): tiers 3-8 QA fixes — mechanics integration"
```

---

### Task 5: QA Tier 9 — Win Condition

- [ ] **Step 1: Test win condition**

Using debug API:
1. Spawn units near enemy CC via `issueCommand`
2. Attack enemy CC
3. `stepTicks` until CC health reaches 0
4. Verify `getGameState()` returns `'ended'`
5. Verify `getGameResult()` returns correct winner

- [ ] **Step 2: Test two-CC scenario**

1. Build a second CC for the enemy (via issueCommand)
2. Destroy one CC
3. Verify game still playing
4. Destroy second CC
5. Verify game ended

- [ ] **Step 3: Fix and commit**

---

### Task 6: QA Tier 10 — Multiplayer Sync (if networking done)

This requires Plan 3 to be complete. If not, skip to Task 7.

- [ ] **Step 1: Start relay server locally**

```bash
cd apps/irontide/engine && cargo run -p irontide-server &
```

- [ ] **Step 2: Open two browser tabs**

Tab 1: Create room, get code.
Tab 2: Join room with code.

- [ ] **Step 3: Run sync tests (10.1–10.7)**

Key checks:
- Both tabs `getGameState() === 'playing'` (10.1)
- Move unit on Tab 1, stepTicks on both, verify positions match (10.2)
- `getStateChecksum()` matches on both tabs after 30 ticks (10.3)
- Full combat sync (10.5)
- Reconnection: close Tab 1, reopen, rejoin — checksums match (10.7)

- [ ] **Step 4: Fix and commit**

---

### Task 7: QA Tier 11 — Performance

- [ ] **Step 1: FPS at idle**

```javascript
window.__IRONTIDE_DEBUG.getFrameTime() // Assert < 16.6ms
```

- [ ] **Step 2: Spawn units progressively and measure FPS**

```javascript
// Spawn 50 workers via issueCommand loop
for (let i = 0; i < 50; i++) {
  window.__IRONTIDE_DEBUG.issueCommand(JSON.stringify({
    type: 'Train', building: ccId, unit_type: 'Worker'
  }));
}
window.__IRONTIDE_DEBUG.stepTicks(5000); // Let them all spawn
window.__IRONTIDE_DEBUG.getFrameTime() // Assert < 16.6ms
```

Repeat at 100 and 200 units.

- [ ] **Step 3: Measure tick time**

```javascript
window.__IRONTIDE_DEBUG.getTickTime() // Assert < 33ms with 200 units
```

- [ ] **Step 4: Check WASM binary size**

```bash
gzip -k apps/irontide/frontend/src/wasm/pkg/irontide_bg.wasm
ls -lh apps/irontide/frontend/src/wasm/pkg/irontide_bg.wasm.gz
# Assert < 500KB
```

- [ ] **Step 5: Fix any performance issues and commit**

---

### Task 8: QA Tier 12 — Full Playthrough (Manual Tick Mode)

This is the integration test. Agent plays a complete game start to finish, verifying every step.

- [ ] **Step 1: Navigate and start game**

```javascript
// Set manual mode
window.__IRONTIDE_DEBUG.setTickMode('manual');
```

Verify: `getGameState() === 'playing'`, starting state correct (1 CC, N workers, starting ore).

- [ ] **Step 2: Send workers to gather**

```javascript
const workers = window.__IRONTIDE_DEBUG.getUnitsByType(0, 'worker');
const nodes = window.__IRONTIDE_DEBUG.getResourceNodes();
// Issue Attack command on nearest node for each worker (triggers gather)
for (const w of workers) {
  window.__IRONTIDE_DEBUG.issueCommand(JSON.stringify({
    type: 'Attack', unit_ids: [w], target: nodes[0].id
  }));
}
window.__IRONTIDE_DEBUG.stepTicks(300);
```

Verify: `getResources(0)` > starting amount. Screenshot: workers at ore nodes.

- [ ] **Step 3: Build barracks**

```javascript
const workers = window.__IRONTIDE_DEBUG.getUnitsByType(0, 'worker');
window.__IRONTIDE_DEBUG.issueCommand(JSON.stringify({
  type: 'Build', builder: workers[0], building_type: 'Barracks', x: 15, y: 15
}));
window.__IRONTIDE_DEBUG.stepTicks(300);
```

Verify: `getBuildingsByType(0, 'barracks')` length === 1. Screenshot: barracks built.

- [ ] **Step 4: Train army**

```javascript
const barracks = window.__IRONTIDE_DEBUG.getBuildingsByType(0, 'barracks')[0];
for (let i = 0; i < 5; i++) {
  window.__IRONTIDE_DEBUG.issueCommand(JSON.stringify({
    type: 'Train', building: barracks, unit_type: 'Rifleman'
  }));
}
for (let i = 0; i < 2; i++) {
  window.__IRONTIDE_DEBUG.issueCommand(JSON.stringify({
    type: 'Train', building: barracks, unit_type: 'Tank'
  }));
}
window.__IRONTIDE_DEBUG.stepTicks(2000); // Wait for all to train
```

Verify: 5 riflemen, 2 tanks exist. Screenshot: army near barracks.

- [ ] **Step 5: Attack-move to enemy base**

```javascript
const riflemen = window.__IRONTIDE_DEBUG.getUnitsByType(0, 'rifleman');
const tanks = window.__IRONTIDE_DEBUG.getUnitsByType(0, 'tank');
const army = [...riflemen, ...tanks];
window.__IRONTIDE_DEBUG.issueCommand(JSON.stringify({
  type: 'AttackMove', unit_ids: army, target_x: 245, target_y: 245
}));
window.__IRONTIDE_DEBUG.stepTicks(1000);
```

Verify: Some units in 'attacking' state. Screenshot: army engaged.

- [ ] **Step 6: Destroy enemy CC**

```javascript
window.__IRONTIDE_DEBUG.stepTicks(3000); // Let combat play out
```

Verify: `getGameState() === 'ended'`, `getGameResult().winner === 0`. Screenshot: victory screen.

- [ ] **Step 7: Verify checksums (if multiplayer)**

If running in two-tab mode, verify all 30-tick checksum pairs matched throughout.

- [ ] **Step 8: Commit any fixes**

```bash
git add -u && git commit -m "fix(irontide): tier 12 full playthrough fixes"
```

---

### Task 9: QA Tier 13 — Full Playthrough (Real-Time Mode)

Same as Task 8 but with `setTickMode('realtime')`. Uses real delays instead of `stepTicks()`.

- [ ] **Step 1: Set realtime mode and play through**

Same build order as Task 8, but using `setTimeout` between actions and verifying:
- Frame time stays < 16.6ms throughout (13.18)
- Input lag < 150ms (13.19)
- Camera pan is smooth (13.20)
- Game completes in 5-15 minutes (13.21)

- [ ] **Step 2: Fix any real-time issues and commit**

---

### Task 10: Final verification and cleanup

- [ ] **Step 1: Run full Rust test suite one more time**

```bash
cd apps/irontide/engine && cargo test 2>&1
```

All tests pass.

- [ ] **Step 2: Run WASM build**

```bash
cd apps/irontide && ./tools/build-wasm.sh
```

Build succeeds.

- [ ] **Step 3: Start dev server and run a quick smoke test**

Navigate to localhost, start local game, move some units, verify rendering.

- [ ] **Step 4: Final commit**

```bash
git add -u && git commit -m "chore(irontide): V1 integration complete — all QA tiers pass"
```

---

## Plan 4 Complete

After all 10 tasks:
- All 135 QA tests pass with dual validation (API + visual)
- Rust engine tests pass
- WASM binary < 500KB gzipped
- 60fps with 200 units
- Full game playable from lobby → army → combat → victory
- Multiplayer sync verified (if Plan 3 complete)
- Real-time mode smooth and responsive

**Iron Tide V1 is ship-ready.**
