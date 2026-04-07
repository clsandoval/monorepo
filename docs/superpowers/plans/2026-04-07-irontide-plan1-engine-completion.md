# Iron Tide — Plan 1: Engine Completion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Rust game engine so all V1 game mechanics work and pass `cargo test`.

**Architecture:** The engine already has ECS, fixed-point math, movement, combat, fog of war, and determinism. This plan fills the gaps: merges Harvester+Builder into Worker, adds resource gathering/building/production systems, replaces the procedural map with a hand-crafted one, adds win condition and supply cap, and expands the WASM debug API.

**Tech Stack:** Rust, wasm-bindgen, serde, irontide-core, irontide-wasm

**Reference specs:**
- Game design: `docs/superpowers/specs/2026-04-07-irontide-game-design.md`
- Technical architecture: `docs/superpowers/specs/2026-04-07-irontide-technical-architecture.md`
- QA spec: `docs/superpowers/specs/2026-04-07-irontide-qa-spec.md`

---

### Task 1: Merge Harvester+Builder into Worker, remove Refinery

The spec calls for 3 units: Worker, Rifleman, Tank. The current code has `Harvester`, `Builder`, `Rifleman`, `Tank`. Merge Harvester and Builder into a single `Worker` type. Remove `Refinery` from BuildingType.

**Files:**
- Modify: `engine/crates/irontide-core/src/components/unit.rs`
- Modify: `engine/crates/irontide-core/src/components/building.rs`
- Modify: `engine/crates/irontide-core/src/config.rs`
- Modify: `engine/crates/irontide-core/src/game.rs`

- [ ] **Step 1: Update UnitType enum**

Replace the contents of `engine/crates/irontide-core/src/components/unit.rs`:

```rust
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum UnitType {
    Worker,
    Rifleman,
    Tank,
}

impl UnitType {
    pub fn sprite_id(self) -> u16 {
        match self {
            UnitType::Worker => 0,
            UnitType::Rifleman => 1,
            UnitType::Tank => 2,
        }
    }

    pub fn is_combat(self) -> bool {
        matches!(self, UnitType::Rifleman | UnitType::Tank)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TeamId(pub u8);

impl TeamId {
    pub const PLAYER_0: Self = TeamId(0);
    pub const PLAYER_1: Self = TeamId(1);
}
```

- [ ] **Step 2: Update BuildingType — remove Refinery**

Replace the contents of `engine/crates/irontide-core/src/components/building.rs`:

```rust
use crate::components::unit::UnitType;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum BuildingType {
    CommandCenter,
    Barracks,
    Turret,
}

impl BuildingType {
    pub fn sprite_id(self) -> u16 {
        match self {
            BuildingType::CommandCenter => 100,
            BuildingType::Barracks => 101,
            BuildingType::Turret => 102,
        }
    }

    /// What unit types this building can train (empty = can't train).
    pub fn trainable_units(self) -> &'static [UnitType] {
        match self {
            BuildingType::CommandCenter => &[UnitType::Worker],
            BuildingType::Barracks => &[UnitType::Rifleman, UnitType::Tank],
            BuildingType::Turret => &[],
        }
    }

    /// Size in tiles (square).
    pub fn tile_size(self) -> i32 {
        match self {
            BuildingType::CommandCenter => 3,
            BuildingType::Barracks => 3,
            BuildingType::Turret => 2,
        }
    }

    /// Vision range for fog of war.
    pub fn vision_range(self) -> i32 {
        match self {
            BuildingType::CommandCenter => 10,
            BuildingType::Barracks => 6,
            BuildingType::Turret => 8,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BuildProgress {
    pub building_type: BuildingType,
    pub ticks_remaining: u16,
    pub total_ticks: u16,
}

impl BuildProgress {
    pub fn progress_fraction(&self) -> f32 {
        if self.total_ticks == 0 {
            return 1.0;
        }
        1.0 - (self.ticks_remaining as f32 / self.total_ticks as f32)
    }

    pub fn is_complete(&self) -> bool {
        self.ticks_remaining == 0
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProductionQueue {
    pub queue: Vec<UnitType>,
    pub ticks_remaining: u16,
}

impl ProductionQueue {
    pub fn new() -> Self {
        ProductionQueue {
            queue: Vec::new(),
            ticks_remaining: 0,
        }
    }
}
```

- [ ] **Step 3: Update config.rs — Worker replaces Harvester+Builder, add building config**

Replace the contents of `engine/crates/irontide-core/src/config.rs`:

```rust
use crate::components::{BuildingType, UnitType};
use crate::math::Fixed;

pub struct UnitConfig {
    pub health: u16,
    pub armor: u8,
    pub speed: Fixed,
    pub damage: u16,
    pub attack_range: u16,
    pub attack_cooldown: u16,
    pub vision_range: i32,
    pub build_cost: u32,
    pub build_time_ticks: u16,
}

pub fn unit_config(unit_type: UnitType) -> UnitConfig {
    match unit_type {
        UnitType::Worker => UnitConfig {
            health: 80,
            armor: 0,
            speed: Fixed::from_raw(6554), // ~0.1 tiles/tick = 3 tiles/sec
            damage: 0,
            attack_range: 0,
            attack_cooldown: 0,
            vision_range: 6,
            build_cost: 50,
            build_time_ticks: 60, // 2 seconds
        },
        UnitType::Rifleman => UnitConfig {
            health: 80,
            armor: 1,
            speed: Fixed::from_raw(8192), // ~0.125 tiles/tick
            damage: 12,
            attack_range: 5,
            attack_cooldown: 15, // 0.5 sec
            vision_range: 8,
            build_cost: 75,
            build_time_ticks: 45,
        },
        UnitType::Tank => UnitConfig {
            health: 250,
            armor: 5,
            speed: Fixed::from_raw(4915), // ~0.075 tiles/tick (slow)
            damage: 35,
            attack_range: 6,
            attack_cooldown: 45, // 1.5 sec
            vision_range: 7,
            build_cost: 200,
            build_time_ticks: 120,
        },
    }
}

pub struct BuildingConfig {
    pub health: u16,
    pub armor: u8,
    pub build_cost: u32,
    pub build_time_ticks: u16,
    pub supply_provided: u8,
}

pub fn building_config(building_type: BuildingType) -> BuildingConfig {
    match building_type {
        BuildingType::CommandCenter => BuildingConfig {
            health: 1500,
            armor: 3,
            build_cost: 400,
            build_time_ticks: 180, // 6 seconds
            supply_provided: 15,
        },
        BuildingType::Barracks => BuildingConfig {
            health: 800,
            armor: 2,
            build_cost: 150,
            build_time_ticks: 120, // 4 seconds
            supply_provided: 0,
        },
        BuildingType::Turret => BuildingConfig {
            health: 500,
            armor: 3,
            build_cost: 100,
            build_time_ticks: 90, // 3 seconds
            supply_provided: 0,
        },
    }
}

pub const STARTING_RESOURCES: u32 = 500;
pub const TICKS_PER_SECOND: u32 = 30;
pub const STARTING_WORKERS: u8 = 4;
pub const GATHER_RATE_PER_TICK: u16 = 1; // Ore per tick while at a node
pub const WORKER_CARRY_CAPACITY: u16 = 50;
pub const ORE_NODE_STARTING_AMOUNT: u32 = 5000;

/// Attack stats for turrets (buildings that auto-attack).
pub struct TurretStats {
    pub damage: u16,
    pub range: u16,
    pub cooldown: u16,
}

pub fn turret_stats() -> TurretStats {
    TurretStats {
        damage: 20,
        range: 7,
        cooldown: 20,
    }
}
```

- [ ] **Step 4: Update game.rs — spawn Workers + starting CC**

In `engine/crates/irontide-core/src/game.rs`, replace `spawn_starting_units` and update `spawn_unit`:

```rust
fn spawn_starting_units(&mut self) {
    // Player 0: top-left corner
    let cc0 = self.spawn_building(BuildingType::CommandCenter, TeamId::PLAYER_0, 8, 8);
    for i in 0..config::STARTING_WORKERS {
        self.spawn_unit(UnitType::Worker, TeamId::PLAYER_0, 12 + i as i32, 10);
    }

    if self.player_count >= 2 {
        // Player 1: bottom-right corner
        let s = crate::map::terrain::MAP_SIZE as i32;
        let cc1 = self.spawn_building(BuildingType::CommandCenter, TeamId::PLAYER_1, s - 11, s - 11);
        for i in 0..config::STARTING_WORKERS {
            self.spawn_unit(UnitType::Worker, TeamId::PLAYER_1, s - 13 - i as i32, s - 11);
        }
    }

    // Initialize supply
    self.player_supply_cap = vec![
        config::building_config(BuildingType::CommandCenter).supply_provided as u32;
        self.player_count as usize
    ];
    self.player_supply_used = vec![
        config::STARTING_WORKERS as u32;
        self.player_count as usize
    ];
}
```

Also add new fields to `GameState`:

```rust
pub struct GameState {
    pub tick: u32,
    pub world: World,
    pub map: TerrainMap,
    pub fog: FogMap,
    pub rng: DeterministicRng,
    pub player_resources: Vec<u32>,
    pub player_count: u8,
    pub player_supply_cap: Vec<u32>,
    pub player_supply_used: Vec<u32>,
    pub game_over: bool,
    pub winner: Option<u8>,
}
```

And update `new()` to initialize the new fields, and add a `spawn_building` method:

```rust
pub fn spawn_building(&mut self, btype: BuildingType, team: TeamId, x: i32, y: i32) -> u32 {
    let cfg = config::building_config(btype);
    let e = self.world.spawn();
    let i = e as usize;

    self.world.position[i] = Some(Position::from_ints(x, y));
    self.world.health[i] = Some(Health::new(cfg.health, cfg.armor));
    self.world.team[i] = Some(team);
    self.world.building_type[i] = Some(btype);
    self.world.sprite_id[i] = Some(btype.sprite_id());

    // Completed building (starting buildings have no build progress)
    if btype == BuildingType::CommandCenter || btype == BuildingType::Barracks {
        self.world.production_queue[i] = Some(ProductionQueue::new());
    }

    if btype == BuildingType::Turret {
        let ts = config::turret_stats();
        self.world.attack_stats[i] = Some(AttackStats::new(ts.damage, ts.range, ts.cooldown));
    }

    // Mark tiles as blocked
    let size = btype.tile_size();
    for dy in 0..size {
        for dx in 0..size {
            self.map.set_blocked((x + dx) as usize, (y + dy) as usize, true);
        }
    }

    e
}
```

- [ ] **Step 5: Run cargo test, fix all compilation errors**

Run: `cd apps/irontide/engine && cargo test 2>&1 | head -80`

Fix any remaining references to `UnitType::Harvester`, `UnitType::Builder`, `BuildingType::Refinery` throughout the codebase. The compiler will find them all.

Expected: Compilation succeeds, existing tests pass (some may need assertion updates for new starting unit counts).

- [ ] **Step 6: Commit**

```bash
cd apps/irontide
git add engine/crates/irontide-core/src/components/unit.rs \
       engine/crates/irontide-core/src/components/building.rs \
       engine/crates/irontide-core/src/config.rs \
       engine/crates/irontide-core/src/game.rs
git commit -m "refactor(irontide): merge Harvester+Builder into Worker, remove Refinery"
```

---

### Task 2: Hand-crafted map (Fighting Spirit inspired)

Replace the procedural map generator with a hand-crafted, rotationally-symmetric map.

**Files:**
- Modify: `engine/crates/irontide-core/src/map/terrain.rs`
- Test: existing `terrain.rs` tests

- [ ] **Step 1: Write test for the new map**

Add to the bottom of `terrain.rs` tests:

```rust
#[test]
fn test_handcrafted_map_symmetric() {
    let map = TerrainMap::fighting_spirit();
    assert_eq!(map.width, MAP_SIZE);
    assert_eq!(map.height, MAP_SIZE);
    // Rotational symmetry: tile at (x,y) should match tile at (255-x, 255-y)
    for y in 0..MAP_SIZE {
        for x in 0..MAP_SIZE {
            let t1 = map.tiles[y * MAP_SIZE + x];
            let t2 = map.tiles[(MAP_SIZE - 1 - y) * MAP_SIZE + (MAP_SIZE - 1 - x)];
            assert_eq!(t1, t2, "Symmetry broken at ({},{})", x, y);
        }
    }
}

#[test]
fn test_handcrafted_map_starting_areas_clear() {
    let map = TerrainMap::fighting_spirit();
    // Player 0 start area (top-left, around 8,8)
    for y in 5..18 {
        for x in 5..18 {
            assert!(map.is_passable(x, y),
                "P0 start area ({},{}) should be passable", x, y);
        }
    }
    // Player 1 start area (bottom-right)
    let s = MAP_SIZE as i32;
    for y in (s-18)..(s-5) {
        for x in (s-18)..(s-5) {
            assert!(map.is_passable(x, y),
                "P1 start area ({},{}) should be passable", x, y);
        }
    }
}

#[test]
fn test_handcrafted_map_has_resources() {
    let map = TerrainMap::fighting_spirit();
    let resource_count = map.tiles.iter().filter(|&&t| t == TileType::Resource).count();
    assert!(resource_count >= 12, "Map should have at least 12 resource tiles, got {}", resource_count);
}

#[test]
fn test_handcrafted_map_has_chokepoints() {
    let map = TerrainMap::fighting_spirit();
    // There should be some impassable terrain (water + rock)
    let impassable = map.tiles.iter().filter(|&&t| !t.is_passable()).count();
    assert!(impassable > 100, "Map should have impassable terrain for chokepoints, got {}", impassable);
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/irontide/engine && cargo test terrain -- --nocapture 2>&1 | tail -20`

Expected: FAIL — `fighting_spirit` method doesn't exist.

- [ ] **Step 3: Implement the hand-crafted map**

Add the `fighting_spirit()` method to `TerrainMap` in `terrain.rs`. This builds a symmetric map inspired by SC2's Fighting Spirit:

```rust
/// Hand-crafted 256x256 map inspired by SC2's Fighting Spirit.
/// 180-degree rotational symmetry. Two starting bases in opposite corners.
pub fn fighting_spirit() -> Self {
    let mut map = TerrainMap::new(MAP_SIZE, MAP_SIZE);

    // Helper: place a feature at (x,y) and its 180-rotation at (255-x, 255-y)
    let mut place_symmetric = |map: &mut TerrainMap, cx: usize, cy: usize, w: usize, h: usize, tile: TileType| {
        for dy in 0..h {
            for dx in 0..w {
                let x = cx + dx;
                let y = cy + dy;
                if x < MAP_SIZE && y < MAP_SIZE {
                    map.tiles[y * MAP_SIZE + x] = tile;
                    let mx = MAP_SIZE - 1 - x;
                    let my = MAP_SIZE - 1 - y;
                    map.tiles[my * MAP_SIZE + mx] = tile;
                }
            }
        }
    };

    let mut place_circle_symmetric = |map: &mut TerrainMap, cx: usize, cy: usize, radius: usize, tile: TileType| {
        let r_sq = (radius * radius) as i32;
        for dy in 0..radius * 2 + 1 {
            for dx in 0..radius * 2 + 1 {
                let rx = dx as i32 - radius as i32;
                let ry = dy as i32 - radius as i32;
                if rx * rx + ry * ry <= r_sq {
                    let x = (cx as i32 + rx) as usize;
                    let y = (cy as i32 + ry) as usize;
                    if x < MAP_SIZE && y < MAP_SIZE {
                        map.tiles[y * MAP_SIZE + x] = tile;
                        let mx = MAP_SIZE - 1 - x;
                        let my = MAP_SIZE - 1 - y;
                        map.tiles[my * MAP_SIZE + mx] = tile;
                    }
                }
            }
        }
    };

    // === Water bodies (large strategic obstacles) ===
    // Central lake
    place_circle_symmetric(&mut map, 128, 128, 8, TileType::Water);

    // Side lakes creating lanes
    place_circle_symmetric(&mut map, 80, 160, 10, TileType::Water);
    place_circle_symmetric(&mut map, 60, 100, 7, TileType::Water);

    // === Rock formations (chokepoints) ===
    // Natural ramp choke near P0 base
    place_symmetric(&mut map, 20, 25, 15, 3, TileType::Rock);
    place_symmetric(&mut map, 20, 30, 3, 8, TileType::Rock);

    // Mid-map rock walls creating attack paths
    place_symmetric(&mut map, 60, 60, 4, 20, TileType::Rock);
    place_symmetric(&mut map, 100, 40, 20, 3, TileType::Rock);
    place_symmetric(&mut map, 90, 80, 3, 15, TileType::Rock);

    // Edge walls
    place_symmetric(&mut map, 0, 40, 10, 4, TileType::Rock);
    place_symmetric(&mut map, 40, 0, 4, 10, TileType::Rock);

    // === Resource nodes (ore) ===
    // Main base minerals (safe, near starting CC)
    place_symmetric(&mut map, 3, 3, 3, 2, TileType::Resource);

    // Natural expansion minerals (semi-exposed)
    place_symmetric(&mut map, 35, 12, 3, 2, TileType::Resource);

    // Third expansion (contested, near center)
    place_symmetric(&mut map, 70, 50, 3, 2, TileType::Resource);

    // Central contested resources
    place_symmetric(&mut map, 120, 115, 2, 2, TileType::Resource);

    // === Clear starting areas ===
    map.clear_area(5, 5, 15);
    let s = MAP_SIZE;
    map.clear_area(s - 20, s - 20, 15);

    // Re-place main minerals after clearing (they're in the cleared zone)
    place_symmetric(&mut map, 3, 3, 3, 2, TileType::Resource);

    map
}
```

- [ ] **Step 4: Update `GameState::new()` to use the hand-crafted map**

In `game.rs`, change:
```rust
// OLD:
map: TerrainMap::generate(map_seed),
// NEW:
map: TerrainMap::fighting_spirit(),
```

The `map_seed` parameter is now unused but keep it in the signature for API compatibility.

- [ ] **Step 5: Run tests**

Run: `cd apps/irontide/engine && cargo test 2>&1 | tail -20`

Expected: All tests pass, including the new symmetry/resources/chokepoint tests.

- [ ] **Step 6: Commit**

```bash
git add engine/crates/irontide-core/src/map/terrain.rs engine/crates/irontide-core/src/game.rs
git commit -m "feat(irontide): replace procedural map with hand-crafted Fighting Spirit layout"
```

---

### Task 3: Resource gathering system

Implement the worker gather → carry → deposit → auto-re-gather cycle.

**Files:**
- Create: `engine/crates/irontide-core/src/systems/resource.rs`
- Modify: `engine/crates/irontide-core/src/systems/mod.rs`
- Modify: `engine/crates/irontide-core/src/game.rs`
- Modify: `engine/crates/irontide-core/src/ecs/world.rs` (add `gather_target` component)
- Modify: `engine/crates/irontide-core/src/components/resource.rs` (add GatherTarget)
- Modify: `engine/crates/irontide-core/src/components/mod.rs`

- [ ] **Step 1: Add GatherTarget component**

Add to `engine/crates/irontide-core/src/components/resource.rs`:

```rust
/// Tracks which resource node a worker is assigned to gather from.
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct GatherTarget {
    pub node_entity: u32,       // Entity ID of the resource node
    pub deposit_entity: u32,    // Entity ID of the CC to deposit at
    pub state: GatherState,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum GatherState {
    MovingToNode,
    Gathering,
    ReturningToDeposit,
}
```

- [ ] **Step 2: Add gather_target to World**

In `ecs/world.rs`, add the field `pub gather_target: Vec<Option<GatherTarget>>` to the `World` struct, and update `new()`, `spawn()`, `clear_components()`, and `despawn()` to handle it (same pattern as other components).

- [ ] **Step 3: Write resource system tests**

Create `engine/crates/irontide-core/src/systems/resource.rs`:

```rust
use crate::components::*;
use crate::config;
use crate::ecs::World;
use crate::map::TerrainMap;
use crate::math::Fixed;

/// Resource gathering system.
/// Workers with GatherTarget cycle: move to node → gather → move to CC → deposit → repeat.
pub fn resource_system(
    world: &mut World,
    map: &TerrainMap,
    player_resources: &mut Vec<u32>,
) {
    let arrival_threshold_sq = Fixed::from_raw(3277 * 3277 / 65536); // ~0.05^2

    let entities: Vec<u32> = (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i]
                && world.gather_target[i].is_some()
                && world.position[i].is_some()
                && world.resource_carry[i].is_some()
                && world.team[i].is_some()
        })
        .collect();

    for &e in &entities {
        let i = e as usize;
        let gt = world.gather_target[i].unwrap();
        let pos = world.position[i].unwrap();
        let carry = world.resource_carry[i].unwrap();
        let team = world.team[i].unwrap();

        match gt.state {
            GatherState::MovingToNode => {
                // Check if we arrived at the node
                if !world.is_alive(gt.node_entity) {
                    // Node depleted or destroyed, stop gathering
                    world.gather_target[i] = None;
                    world.move_target[i] = None;
                    continue;
                }
                let ni = gt.node_entity as usize;
                if let Some(node_pos) = world.position[ni] {
                    let dist_sq = pos.distance_squared_to(&node_pos);
                    let arrival = Fixed::from_int(2); // Within 2 tiles of node
                    if dist_sq < arrival.mul(arrival) {
                        // Arrived at node, start gathering
                        world.move_target[i] = None;
                        world.gather_target[i] = Some(GatherTarget {
                            state: GatherState::Gathering,
                            ..gt
                        });
                    }
                    // Otherwise keep moving (move_target already set)
                }
            }
            GatherState::Gathering => {
                // Gather ore from the node
                let ni = gt.node_entity as usize;
                if !world.is_alive(gt.node_entity) || world.resource_node[ni].is_none() {
                    world.gather_target[i] = None;
                    continue;
                }

                let mut carry = carry;
                let node = world.resource_node[ni].as_mut().unwrap();
                let gather_amount = config::GATHER_RATE_PER_TICK.min(node.remaining as u16);
                let space = carry.capacity - carry.amount;
                let actual = gather_amount.min(space);

                carry.amount += actual;
                node.remaining = node.remaining.saturating_sub(actual as u32);
                world.resource_carry[i] = Some(carry);

                // If node is depleted, despawn it
                if node.remaining == 0 {
                    world.despawn(gt.node_entity);
                }

                // If full, start returning to deposit
                if carry.is_full() || (node.remaining == 0) {
                    if carry.amount > 0 {
                        // Set move target to CC
                        if world.is_alive(gt.deposit_entity) {
                            let di = gt.deposit_entity as usize;
                            if let Some(dep_pos) = world.position[di] {
                                world.move_target[i] = Some(MoveTarget::new(dep_pos.x, dep_pos.y));
                                world.gather_target[i] = Some(GatherTarget {
                                    state: GatherState::ReturningToDeposit,
                                    ..gt
                                });
                            }
                        } else {
                            world.gather_target[i] = None;
                        }
                    } else {
                        world.gather_target[i] = None;
                    }
                }
            }
            GatherState::ReturningToDeposit => {
                // Check if arrived at CC
                if !world.is_alive(gt.deposit_entity) {
                    // CC destroyed, find another or stop
                    world.gather_target[i] = None;
                    world.move_target[i] = None;
                    continue;
                }
                let di = gt.deposit_entity as usize;
                if let Some(dep_pos) = world.position[di] {
                    let dist_sq = pos.distance_squared_to(&dep_pos);
                    let arrival = Fixed::from_int(3); // Within 3 tiles of CC (CC is 3x3)
                    if dist_sq < arrival.mul(arrival) {
                        // Deposit ore
                        let carry = world.resource_carry[i].unwrap();
                        let pid = team.0 as usize;
                        if pid < player_resources.len() {
                            player_resources[pid] += carry.amount as u32;
                        }
                        world.resource_carry[i] = Some(ResourceCarry::new(carry.capacity));
                        world.move_target[i] = None;

                        // Auto-re-gather: go back to the same node if it still exists
                        if world.is_alive(gt.node_entity) && world.resource_node[gt.node_entity as usize].is_some() {
                            let ni = gt.node_entity as usize;
                            if let Some(node_pos) = world.position[ni] {
                                world.move_target[i] = Some(MoveTarget::new(node_pos.x, node_pos.y));
                                world.gather_target[i] = Some(GatherTarget {
                                    state: GatherState::MovingToNode,
                                    ..gt
                                });
                            }
                        } else {
                            world.gather_target[i] = None;
                        }
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::GameState;
    use crate::command::*;

    #[test]
    fn test_worker_gathers_and_deposits() {
        let mut state = GameState::new(42, 100, 1);
        let starting_ore = state.player_resources[0];

        // Find a worker and a resource node
        let worker = (0..state.world.next_entity)
            .find(|&e| {
                let i = e as usize;
                state.world.alive[i] && state.world.unit_type[i] == Some(UnitType::Worker)
            })
            .expect("Should have a worker");

        let node = (0..state.world.next_entity)
            .find(|&e| {
                let i = e as usize;
                state.world.alive[i] && state.world.resource_node[i].is_some()
            })
            .expect("Should have a resource node");

        let cc = (0..state.world.next_entity)
            .find(|&e| {
                let i = e as usize;
                state.world.alive[i] && state.world.building_type[i] == Some(BuildingType::CommandCenter)
            })
            .expect("Should have a CC");

        // Set up gather target
        let ni = node as usize;
        let node_pos = state.world.position[ni].unwrap();
        state.world.gather_target[worker as usize] = Some(GatherTarget {
            node_entity: node,
            deposit_entity: cc,
            state: GatherState::MovingToNode,
        });
        state.world.move_target[worker as usize] = Some(MoveTarget::new(node_pos.x, node_pos.y));

        // Run for many ticks — worker should gather and deposit
        for _ in 0..600 {
            state.tick(&[]);
        }

        assert!(state.player_resources[0] > starting_ore,
            "Resources should have increased from {} to more", starting_ore);
    }
}
```

- [ ] **Step 4: Register the resource system in systems/mod.rs**

```rust
pub mod movement;
pub mod combat;
pub mod pathfinding;
pub mod resource;
pub mod cleanup;
```

- [ ] **Step 5: Wire resource system into game.rs tick()**

In `game.rs`, add the resource system call between combat and fog update:

```rust
// 5. Resource gathering
systems::resource::resource_system(&mut self.world, &self.map, &mut self.player_resources);
```

- [ ] **Step 6: Add resource node spawning to the map**

In `game.rs`, add a method to spawn resource node entities at `TileType::Resource` locations:

```rust
fn spawn_resource_nodes(&mut self) {
    for y in 0..self.map.height {
        for x in 0..self.map.width {
            if self.map.tiles[y * self.map.width + x] == crate::map::terrain::TileType::Resource {
                let e = self.world.spawn();
                let i = e as usize;
                self.world.position[i] = Some(Position::from_ints(x as i32, y as i32));
                self.world.resource_node[i] = Some(ResourceNode {
                    remaining: config::ORE_NODE_STARTING_AMOUNT,
                    gather_rate: config::GATHER_RATE_PER_TICK,
                });
            }
        }
    }
}
```

Call `self.spawn_resource_nodes()` at the end of `new()`, after `spawn_starting_units()`.

- [ ] **Step 7: Handle gather command in pathfinding.rs**

Workers need to be assigned to gather when right-clicking a resource node. This isn't a separate command — it uses the existing `Move` command, but we need a way to initiate gathering. Add a new command variant to handle this. In `command.rs`, the `Attack` command on a resource node entity should trigger gathering. Or simpler: add gather command handling in `apply_move_commands`:

Add to `pathfinding.rs` after the `Stop` handler:

```rust
if let PlayerCommand::Attack { unit_ids, target } = cmd {
    // If target is a resource node and unit is a worker, start gathering
    let ti = *target as usize;
    if world.is_alive(*target) && world.resource_node[ti].is_some() {
        for &uid in unit_ids {
            let ui = uid as usize;
            if !world.is_alive(uid) || world.unit_type[ui] != Some(crate::components::UnitType::Worker) {
                continue;
            }
            if world.resource_carry[ui].is_none() {
                continue;
            }
            // Find nearest CC for this team
            let team = world.team[ui].unwrap();
            let cc = find_nearest_cc(world, uid, team);
            if let Some(cc_entity) = cc {
                let node_pos = world.position[ti].unwrap();
                world.move_target[ui] = Some(crate::components::MoveTarget::new(node_pos.x, node_pos.y));
                world.gather_target[ui] = Some(crate::components::GatherTarget {
                    node_entity: *target,
                    deposit_entity: cc_entity,
                    state: crate::components::GatherState::MovingToNode,
                });
                world.attack_target[ui] = None;
            }
        }
    }
}
```

Add the helper function:

```rust
fn find_nearest_cc(world: &World, unit: u32, team: crate::components::TeamId) -> Option<u32> {
    let ui = unit as usize;
    let unit_pos = world.position[ui]?;
    let mut best: Option<(u32, crate::math::Fixed)> = None;

    for e in 0..world.next_entity {
        let i = e as usize;
        if !world.alive[i] { continue; }
        if world.building_type[i] != Some(crate::components::BuildingType::CommandCenter) { continue; }
        if world.team[i] != Some(team) { continue; }
        if let Some(pos) = world.position[i] {
            let dist = unit_pos.distance_squared_to(&pos);
            if best.is_none() || dist < best.unwrap().1 {
                best = Some((e, dist));
            }
        }
    }
    best.map(|(e, _)| e)
}
```

- [ ] **Step 8: Run tests**

Run: `cd apps/irontide/engine && cargo test resource -- --nocapture 2>&1 | tail -20`

Expected: `test_worker_gathers_and_deposits` passes.

- [ ] **Step 9: Commit**

```bash
git add engine/crates/irontide-core/src/systems/resource.rs \
       engine/crates/irontide-core/src/systems/mod.rs \
       engine/crates/irontide-core/src/components/resource.rs \
       engine/crates/irontide-core/src/ecs/world.rs \
       engine/crates/irontide-core/src/game.rs \
       engine/crates/irontide-core/src/systems/pathfinding.rs
git commit -m "feat(irontide): add resource gathering system (worker gather/deposit cycle)"
```

---

### Task 4: Building construction system

Workers construct buildings when given a Build command. Building appears at the site, worker walks there and builds it tick by tick.

**Files:**
- Create: `engine/crates/irontide-core/src/systems/construction.rs`
- Modify: `engine/crates/irontide-core/src/systems/mod.rs`
- Modify: `engine/crates/irontide-core/src/systems/pathfinding.rs`
- Modify: `engine/crates/irontide-core/src/game.rs`
- Modify: `engine/crates/irontide-core/src/ecs/world.rs` (add `build_target` component)

- [ ] **Step 1: Add BuildTarget component**

Add to `components/building.rs`:

```rust
/// Tracks which building a worker is constructing.
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct BuildTarget {
    pub building_entity: u32,
}
```

Add `pub build_target: Vec<Option<BuildTarget>>` to `World` and update `new()`, `spawn()`, `clear_components()`.

- [ ] **Step 2: Write construction system**

Create `engine/crates/irontide-core/src/systems/construction.rs`:

```rust
use crate::components::*;
use crate::ecs::World;
use crate::math::Fixed;

/// Construction system: workers with BuildTarget advance building progress.
pub fn construction_system(world: &mut World) {
    let entities: Vec<u32> = (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i]
                && world.build_target[i].is_some()
                && world.position[i].is_some()
        })
        .collect();

    for &e in &entities {
        let i = e as usize;
        let bt = world.build_target[i].unwrap();
        let pos = world.position[i].unwrap();

        if !world.is_alive(bt.building_entity) {
            world.build_target[i] = None;
            continue;
        }

        let bi = bt.building_entity as usize;
        if let Some(ref mut progress) = world.build_progress[bi] {
            // Check if worker is close enough to build
            if let Some(bpos) = world.position[bi] {
                let dist_sq = pos.distance_squared_to(&bpos);
                let range = Fixed::from_int(3);
                if dist_sq < range.mul(range) {
                    // Worker is in range — advance construction
                    world.move_target[i] = None; // Stop moving
                    progress.ticks_remaining = progress.ticks_remaining.saturating_sub(1);

                    if progress.is_complete() {
                        // Building finished — finalize it
                        let btype = progress.building_type;
                        world.build_progress[bi] = None; // No longer under construction

                        // Give turrets their attack stats
                        if btype == BuildingType::Turret {
                            let ts = crate::config::turret_stats();
                            world.attack_stats[bi] = Some(AttackStats::new(ts.damage, ts.range, ts.cooldown));
                        }

                        // Give production buildings their queue
                        if btype == BuildingType::CommandCenter || btype == BuildingType::Barracks {
                            world.production_queue[bi] = Some(ProductionQueue::new());
                        }

                        // Free the worker
                        world.build_target[i] = None;
                    }
                }
                // If not in range, keep moving (move_target should already be set)
            }
        } else {
            // Building has no progress (already complete or invalid)
            world.build_target[i] = None;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::GameState;
    use crate::config;

    #[test]
    fn test_worker_builds_barracks() {
        let mut state = GameState::new(42, 100, 1);
        let initial_buildings = state.world.alive_entities().iter()
            .filter(|&&e| state.world.building_type[e as usize].is_some())
            .count();

        // Find a worker
        let worker = (0..state.world.next_entity)
            .find(|&e| {
                let i = e as usize;
                state.world.alive[i] && state.world.unit_type[i] == Some(UnitType::Worker)
            })
            .expect("Should have a worker");

        // Issue build command
        let cmds = vec![crate::command::TurnCommands {
            tick: 0,
            player_id: 0,
            commands: vec![crate::command::PlayerCommand::Build {
                builder: worker,
                building_type: BuildingType::Barracks,
                x: 15,
                y: 15,
            }],
            checksum: None,
        }];

        // Tick enough for worker to walk there and build
        state.tick(&cmds);
        for _ in 0..500 {
            state.tick(&[]);
        }

        let final_buildings = state.world.alive_entities().iter()
            .filter(|&&e| state.world.building_type[e as usize] == Some(BuildingType::Barracks))
            .count();

        assert_eq!(final_buildings, 1, "Should have built 1 barracks");
    }
}
```

- [ ] **Step 3: Handle Build command in pathfinding.rs**

Add to `apply_move_commands`:

```rust
if let PlayerCommand::Build { builder, building_type, x, y } = cmd {
    let bi = *builder as usize;
    if !world.is_alive(*builder) { continue; }
    if world.unit_type[bi] != Some(crate::components::UnitType::Worker) { continue; }

    // Spawn the building entity (under construction)
    // Note: we need game state access here, so this will be handled in game.rs instead
}
```

Actually, Build commands need access to `GameState` (for resource deduction, supply, map blocking). Move Build command processing to `game.rs` in the tick function. Add a `process_build_commands` method:

```rust
fn process_build_commands(&mut self, commands: &[PlayerCommand]) {
    for cmd in commands {
        if let PlayerCommand::Build { builder, building_type, x, y } = cmd {
            let bi = *builder as usize;
            if !self.world.is_alive(*builder) { continue; }
            if self.world.unit_type[bi] != Some(UnitType::Worker) { continue; }

            let team = match self.world.team[bi] {
                Some(t) => t,
                None => continue,
            };
            let pid = team.0 as usize;

            // Check cost
            let cfg = config::building_config(*building_type);
            if self.player_resources[pid] < cfg.build_cost {
                continue; // Can't afford
            }

            // Check tile validity
            let size = building_type.tile_size();
            let mut valid = true;
            for dy in 0..size {
                for dx in 0..size {
                    if !self.map.is_passable(*x + dx, *y + dy) {
                        valid = false;
                        break;
                    }
                }
                if !valid { break; }
            }
            if !valid { continue; }

            // Deduct cost
            self.player_resources[pid] -= cfg.build_cost;

            // Spawn building entity (under construction)
            let be = self.world.spawn();
            let bei = be as usize;
            self.world.position[bei] = Some(Position::from_ints(*x, *y));
            self.world.health[bei] = Some(Health::new(cfg.health, cfg.armor));
            self.world.team[bei] = Some(team);
            self.world.building_type[bei] = Some(*building_type);
            self.world.sprite_id[bei] = Some(building_type.sprite_id());
            self.world.build_progress[bei] = Some(BuildProgress {
                building_type: *building_type,
                ticks_remaining: cfg.build_time_ticks,
                total_ticks: cfg.build_time_ticks,
            });

            // Block terrain tiles
            for dy in 0..size {
                for dx in 0..size {
                    self.map.set_blocked((*x + dx) as usize, (*y + dy) as usize, true);
                }
            }

            // Send worker to build
            let bpos = Position::from_ints(*x, *y);
            self.world.move_target[bi] = Some(MoveTarget::new(bpos.x, bpos.y));
            self.world.build_target[bi] = Some(BuildTarget { building_entity: be });
            self.world.gather_target[bi] = None; // Cancel gathering

            // Update supply if CC
            if *building_type == BuildingType::CommandCenter {
                self.player_supply_cap[pid] += cfg.supply_provided as u32;
            }
        }
    }
}
```

Wire into `tick()` after command collection:

```rust
// 1b. Process build commands (needs GameState access)
let build_cmds: Vec<PlayerCommand> = all_commands.iter().map(|c| (*c).clone()).collect();
self.process_build_commands(&build_cmds);

// ... (existing systems)

// 4b. Construction
systems::construction::construction_system(&mut self.world);
```

- [ ] **Step 4: Register in systems/mod.rs**

```rust
pub mod construction;
```

- [ ] **Step 5: Run tests**

Run: `cd apps/irontide/engine && cargo test construction -- --nocapture 2>&1 | tail -20`

Expected: `test_worker_builds_barracks` passes.

- [ ] **Step 6: Commit**

```bash
git add engine/crates/irontide-core/src/systems/construction.rs \
       engine/crates/irontide-core/src/systems/mod.rs \
       engine/crates/irontide-core/src/components/building.rs \
       engine/crates/irontide-core/src/ecs/world.rs \
       engine/crates/irontide-core/src/game.rs
git commit -m "feat(irontide): add building construction system"
```

---

### Task 5: Unit production system

Buildings with production queues train units. Train command adds to queue, ticks count down, unit spawns when ready.

**Files:**
- Create: `engine/crates/irontide-core/src/systems/production.rs`
- Modify: `engine/crates/irontide-core/src/systems/mod.rs`
- Modify: `engine/crates/irontide-core/src/game.rs`

- [ ] **Step 1: Write production system**

Create `engine/crates/irontide-core/src/systems/production.rs`:

```rust
use crate::components::*;
use crate::config;
use crate::ecs::World;

/// Production system: buildings with non-empty queues produce units.
/// Returns list of (team_id, unit_type, spawn_x, spawn_y) for units that completed.
pub fn production_system(world: &mut World) -> Vec<(TeamId, UnitType, i32, i32)> {
    let mut spawns = Vec::new();

    for e in 0..world.next_entity {
        let i = e as usize;
        if !world.alive[i] { continue; }
        if world.production_queue[i].is_none() { continue; }
        if world.build_progress[i].is_some() { continue; } // Still under construction
        let team = match world.team[i] {
            Some(t) => t,
            None => continue,
        };
        let pos = match world.position[i] {
            Some(p) => p,
            None => continue,
        };

        let queue = world.production_queue[i].as_mut().unwrap();
        if queue.queue.is_empty() { continue; }

        if queue.ticks_remaining == 0 {
            // Start producing the next unit
            let unit_type = queue.queue[0];
            let cfg = config::unit_config(unit_type);
            queue.ticks_remaining = cfg.build_time_ticks;
        }

        queue.ticks_remaining = queue.ticks_remaining.saturating_sub(1);

        if queue.ticks_remaining == 0 {
            // Unit complete — spawn it
            let unit_type = queue.queue.remove(0);
            let btype = world.building_type[i].unwrap_or(BuildingType::Barracks);
            let size = btype.tile_size();
            // Spawn adjacent to the building (rally point = right side)
            let spawn_x = pos.tile_x() + size + 1;
            let spawn_y = pos.tile_y() + size / 2;
            spawns.push((team, unit_type, spawn_x, spawn_y));
        }
    }

    spawns
}

#[cfg(test)]
mod tests {
    use crate::game::GameState;
    use crate::command::*;
    use crate::components::*;

    #[test]
    fn test_train_worker_from_cc() {
        let mut state = GameState::new(42, 100, 1);
        let initial_workers = (0..state.world.next_entity)
            .filter(|&e| {
                let i = e as usize;
                state.world.alive[i] && state.world.unit_type[i] == Some(UnitType::Worker)
            })
            .count();

        // Find the CC
        let cc = (0..state.world.next_entity)
            .find(|&e| {
                let i = e as usize;
                state.world.alive[i]
                    && state.world.building_type[i] == Some(BuildingType::CommandCenter)
                    && state.world.team[i] == Some(TeamId::PLAYER_0)
            })
            .expect("Should have a CC");

        // Issue train command
        let cmds = vec![TurnCommands {
            tick: 0,
            player_id: 0,
            commands: vec![PlayerCommand::Train {
                building: cc,
                unit_type: UnitType::Worker,
            }],
            checksum: None,
        }];

        state.tick(&cmds);
        // Tick until production completes (worker build_time_ticks = 60)
        for _ in 0..120 {
            state.tick(&[]);
        }

        let final_workers = (0..state.world.next_entity)
            .filter(|&e| {
                let i = e as usize;
                state.world.alive[i] && state.world.unit_type[i] == Some(UnitType::Worker)
            })
            .count();

        assert_eq!(final_workers, initial_workers + 1, "Should have trained 1 new worker");
    }
}
```

- [ ] **Step 2: Handle Train command and spawning in game.rs**

Add `process_train_commands`:

```rust
fn process_train_commands(&mut self, commands: &[PlayerCommand]) {
    for cmd in commands {
        if let PlayerCommand::Train { building, unit_type } = cmd {
            let bi = *building as usize;
            if !self.world.is_alive(*building) { continue; }
            if self.world.production_queue[bi].is_none() { continue; }
            if self.world.build_progress[bi].is_some() { continue; } // Under construction

            let team = match self.world.team[bi] {
                Some(t) => t,
                None => continue,
            };
            let pid = team.0 as usize;

            // Check if building can train this unit type
            if let Some(btype) = self.world.building_type[bi] {
                if !btype.trainable_units().contains(unit_type) { continue; }
            }

            // Check cost
            let cfg = config::unit_config(*unit_type);
            if self.player_resources[pid] < cfg.build_cost { continue; }

            // Check supply
            if self.player_supply_used[pid] >= self.player_supply_cap[pid] { continue; }

            // Deduct cost and queue
            self.player_resources[pid] -= cfg.build_cost;
            self.player_supply_used[pid] += 1;
            self.world.production_queue[bi].as_mut().unwrap().queue.push(*unit_type);
        }
    }
}
```

Wire production spawning into `tick()`:

```rust
// 6. Production
let spawns = systems::production::production_system(&mut self.world);
for (team, unit_type, x, y) in spawns {
    self.spawn_unit(unit_type, team, x, y);
}
```

And call `process_train_commands` in `tick()` after `process_build_commands`:

```rust
self.process_train_commands(&build_cmds);
```

- [ ] **Step 3: Register in systems/mod.rs**

```rust
pub mod production;
```

- [ ] **Step 4: Run tests**

Run: `cd apps/irontide/engine && cargo test production -- --nocapture 2>&1 | tail -20`

Expected: `test_train_worker_from_cc` passes.

- [ ] **Step 5: Commit**

```bash
git add engine/crates/irontide-core/src/systems/production.rs \
       engine/crates/irontide-core/src/systems/mod.rs \
       engine/crates/irontide-core/src/game.rs
git commit -m "feat(irontide): add unit production system (Train command + queue)"
```

---

### Task 6: Win condition — destroy all CCs

**Files:**
- Modify: `engine/crates/irontide-core/src/game.rs`

- [ ] **Step 1: Write test**

Add to `game.rs` tests:

```rust
#[test]
fn test_win_condition_destroy_cc() {
    let mut state = GameState::new(42, 100, 2);
    assert!(!state.game_over);
    assert!(state.winner.is_none());

    // Find player 1's CC
    let p1_cc = (0..state.world.next_entity)
        .find(|&e| {
            let i = e as usize;
            state.world.alive[i]
                && state.world.building_type[i] == Some(BuildingType::CommandCenter)
                && state.world.team[i] == Some(TeamId::PLAYER_1)
        })
        .expect("P1 should have a CC");

    // Kill it by setting health to 0
    state.world.health[p1_cc as usize].as_mut().unwrap().current = 0;

    // Tick to trigger cleanup + win check
    state.tick(&[]);

    assert!(state.game_over, "Game should be over");
    assert_eq!(state.winner, Some(0), "Player 0 should win");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/irontide/engine && cargo test win_condition -- --nocapture 2>&1 | tail -10`

Expected: FAIL (game_over and winner fields don't affect anything yet).

- [ ] **Step 3: Implement win condition check**

Add to `game.rs` a `check_win_condition` method and call it at end of `tick()`:

```rust
fn check_win_condition(&mut self) {
    if self.game_over { return; }
    if self.player_count < 2 { return; }

    for pid in 0..self.player_count {
        let has_cc = (0..self.world.next_entity).any(|e| {
            let i = e as usize;
            self.world.alive[i]
                && self.world.building_type[i] == Some(BuildingType::CommandCenter)
                && self.world.team[i] == Some(TeamId(pid))
        });

        if !has_cc {
            self.game_over = true;
            // Winner is the other player
            self.winner = Some(1 - pid);
            return;
        }
    }
}
```

Add to `tick()` at the very end (after cleanup, before tick increment):

```rust
// 8. Check win condition
self.check_win_condition();
```

- [ ] **Step 4: Run tests**

Run: `cd apps/irontide/engine && cargo test win_condition -- --nocapture 2>&1 | tail -10`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add engine/crates/irontide-core/src/game.rs
git commit -m "feat(irontide): add win condition — destroy all enemy CCs"
```

---

### Task 7: Building fog of war (buildings provide vision)

Currently only units provide fog vision. Buildings should too.

**Files:**
- Modify: `engine/crates/irontide-core/src/game.rs`

- [ ] **Step 1: Write test**

```rust
#[test]
fn test_buildings_provide_vision() {
    let state = GameState::new(42, 100, 1);
    // The starting CC at (8,8) should provide vision
    let vis = state.fog.get(0, 8, 8);
    assert_eq!(vis, crate::map::fog_map::Visibility::Visible, "CC should provide vision");
}
```

- [ ] **Step 2: Update `update_fog` to include buildings**

In `game.rs`, modify `update_fog` to also iterate buildings:

```rust
fn update_fog(&mut self) {
    for team in 0..self.player_count {
        self.fog.begin_frame(team);
    }

    for e in 0..self.world.next_entity {
        let i = e as usize;
        if !self.world.alive[i] { continue; }

        let (pos, team) = match (&self.world.position[i], &self.world.team[i]) {
            (Some(p), Some(t)) => (p, t),
            _ => continue,
        };

        // Units provide vision based on unit config
        if let Some(ut) = &self.world.unit_type[i] {
            let vision = config::unit_config(*ut).vision_range;
            self.fog.reveal(team.0, pos.tile_x(), pos.tile_y(), vision);
        }

        // Buildings provide vision based on building type
        if let Some(bt) = &self.world.building_type[i] {
            if self.world.build_progress[i].as_ref().map_or(true, |bp| bp.is_complete()) {
                let vision = bt.vision_range();
                self.fog.reveal(team.0, pos.tile_x(), pos.tile_y(), vision);
            }
        }
    }
}
```

- [ ] **Step 3: Run tests**

Run: `cd apps/irontide/engine && cargo test -- --nocapture 2>&1 | tail -20`

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add engine/crates/irontide-core/src/game.rs
git commit -m "feat(irontide): buildings provide fog of war vision"
```

---

### Task 8: Attack-move command and worker-can't-attack guard

**Files:**
- Modify: `engine/crates/irontide-core/src/systems/pathfinding.rs`
- Modify: `engine/crates/irontide-core/src/systems/combat.rs`

- [ ] **Step 1: Write tests**

Add to `game.rs` tests:

```rust
#[test]
fn test_worker_cannot_attack() {
    let mut state = GameState::new(42, 100, 2);
    let worker = (0..state.world.next_entity)
        .find(|&e| {
            let i = e as usize;
            state.world.alive[i]
                && state.world.unit_type[i] == Some(UnitType::Worker)
                && state.world.team[i] == Some(TeamId::PLAYER_0)
        })
        .unwrap();

    // Worker should have no attack_stats
    assert!(state.world.attack_stats[worker as usize].is_none(),
        "Worker should not have attack stats");
}
```

- [ ] **Step 2: Handle AttackMove in pathfinding.rs**

Add handling for `AttackMove` command — it sets a move target but the combat system will auto-acquire targets along the way:

```rust
if let PlayerCommand::AttackMove { unit_ids, target_x, target_y } = cmd {
    for &uid in unit_ids {
        let i = uid as usize;
        if !world.is_alive(uid) { continue; }
        if world.position[i].is_none() { continue; }
        // Only combat units can attack-move
        if let Some(ut) = world.unit_type[i] {
            if !ut.is_combat() { continue; }
        }
        world.move_target[i] = Some(MoveTarget::new(
            Fixed::from_int(*target_x) + Fixed::HALF,
            Fixed::from_int(*target_y) + Fixed::HALF,
        ));
        world.attack_target[i] = None;
    }
}

if let PlayerCommand::Attack { unit_ids, target } = cmd {
    if !world.is_alive(*target) { continue; }
    // Check if target is a resource node (handled above for gathering)
    let ti = *target as usize;
    if world.resource_node[ti].is_some() {
        // Already handled above for gather
        continue;
    }
    for &uid in unit_ids {
        let i = uid as usize;
        if !world.is_alive(uid) { continue; }
        // Only combat units (or turrets) can attack
        if let Some(ut) = world.unit_type[i] {
            if !ut.is_combat() { continue; }
        }
        world.attack_target[i] = Some(crate::components::AttackTarget { target: *target });
        // Move toward target if out of range
        if let Some(target_pos) = world.position[ti] {
            world.move_target[i] = Some(MoveTarget::new(target_pos.x, target_pos.y));
        }
    }
}
```

- [ ] **Step 3: Combat system stops movement on engage**

In `combat.rs`, when a unit auto-acquires a target and is in range, clear its move_target so it stops to fight:

After `world.attack_target[i] = Some(...)` in auto-acquire:

```rust
if let Some(t) = best_target {
    world.attack_target[i] = Some(crate::components::AttackTarget { target: t });
    // Stop moving to engage
    world.move_target[i] = None;
}
```

- [ ] **Step 4: Run tests**

Run: `cd apps/irontide/engine && cargo test -- --nocapture 2>&1 | tail -20`

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add engine/crates/irontide-core/src/systems/pathfinding.rs \
       engine/crates/irontide-core/src/systems/combat.rs \
       engine/crates/irontide-core/src/game.rs
git commit -m "feat(irontide): add AttackMove command, workers can't attack"
```

---

### Task 9: Expand WASM debug API

The QA spec requires many more debug methods than currently exist. Add them all.

**Files:**
- Modify: `engine/crates/irontide-wasm/src/lib.rs`
- Modify: `engine/crates/irontide-core/src/game.rs` (add query methods)

- [ ] **Step 1: Add query methods to GameState**

In `game.rs`, add the methods the debug API needs:

```rust
pub fn get_unit_count_for_player(&self, player_id: u8) -> usize {
    (0..self.world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            self.world.alive[i]
                && self.world.unit_type[i].is_some()
                && self.world.team[i] == Some(TeamId(player_id))
        })
        .count()
}

pub fn get_units_by_type(&self, player_id: u8, unit_type: UnitType) -> Vec<u32> {
    (0..self.world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            self.world.alive[i]
                && self.world.unit_type[i] == Some(unit_type)
                && self.world.team[i] == Some(TeamId(player_id))
        })
        .collect()
}

pub fn get_building_count_for_player(&self, player_id: u8) -> usize {
    (0..self.world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            self.world.alive[i]
                && self.world.building_type[i].is_some()
                && self.world.team[i] == Some(TeamId(player_id))
        })
        .count()
}

pub fn get_buildings_by_type(&self, player_id: u8, building_type: BuildingType) -> Vec<u32> {
    (0..self.world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            self.world.alive[i]
                && self.world.building_type[i] == Some(building_type)
                && self.world.team[i] == Some(TeamId(player_id))
        })
        .collect()
}

pub fn get_unit_health(&self, entity: u32) -> Option<(u16, u16)> {
    let i = entity as usize;
    if !self.world.is_alive(entity) { return None; }
    self.world.health[i].map(|h| (h.current, h.max))
}

pub fn get_unit_state(&self, entity: u32) -> Option<&'static str> {
    let i = entity as usize;
    if !self.world.is_alive(entity) { return None; }
    if self.world.health[i].map_or(false, |h| h.is_dead()) { return Some("dead"); }
    if self.world.build_target[i].is_some() { return Some("building"); }
    if self.world.gather_target[i].is_some() {
        let gt = self.world.gather_target[i].unwrap();
        return match gt.state {
            crate::components::GatherState::Gathering => Some("gathering"),
            _ => Some("moving"),
        };
    }
    if self.world.attack_target[i].is_some() { return Some("attacking"); }
    if self.world.move_target[i].is_some() { return Some("moving"); }
    Some("idle")
}

pub fn get_resource_nodes(&self) -> Vec<(u32, f32, f32, u32)> {
    (0..self.world.next_entity)
        .filter_map(|e| {
            let i = e as usize;
            if !self.world.alive[i] { return None; }
            let node = self.world.resource_node[i]?;
            let pos = self.world.position[i]?;
            Some((e, pos.x.to_f32(), pos.y.to_f32(), node.remaining))
        })
        .collect()
}

pub fn get_building_progress(&self, entity: u32) -> f32 {
    let i = entity as usize;
    if !self.world.is_alive(entity) { return 0.0; }
    match &self.world.build_progress[i] {
        Some(bp) => bp.progress_fraction(),
        None => 1.0, // Fully built
    }
}

pub fn get_production_queue(&self, entity: u32) -> Vec<(String, f32)> {
    let i = entity as usize;
    if !self.world.is_alive(entity) { return Vec::new(); }
    match &self.world.production_queue[i] {
        Some(pq) => {
            pq.queue.iter().enumerate().map(|(idx, ut)| {
                let name = format!("{:?}", ut).to_lowercase();
                let progress = if idx == 0 && pq.ticks_remaining > 0 {
                    let cfg = config::unit_config(*ut);
                    1.0 - (pq.ticks_remaining as f32 / cfg.build_time_ticks as f32)
                } else {
                    0.0
                };
                (name, progress)
            }).collect()
        }
        None => Vec::new(),
    }
}

pub fn get_game_state_str(&self) -> &'static str {
    if self.game_over { "ended" } else { "playing" }
}

pub fn get_game_result(&self) -> (Option<u8>, &'static str) {
    if self.game_over {
        (self.winner, "cc_destroyed")
    } else {
        (None, "null")
    }
}

pub fn get_unit_carrying(&self, entity: u32) -> u16 {
    let i = entity as usize;
    if !self.world.is_alive(entity) { return 0; }
    self.world.resource_carry[i].map_or(0, |rc| rc.amount)
}
```

- [ ] **Step 2: Expand WASM bindings**

Replace `engine/crates/irontide-wasm/src/lib.rs` with the full debug API. This is a large file — add all methods from the QA spec's `__IRONTIDE_DEBUG` interface. Key additions:

```rust
#[wasm_bindgen]
pub fn get_game_state() -> String {
    GAME.with(|g| {
        g.borrow().as_ref().map(|game| game.get_game_state_str().to_string())
            .unwrap_or_else(|| "lobby".to_string())
    })
}

#[wasm_bindgen]
pub fn get_game_result() -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let (winner, reason) = game.get_game_result();
        format!(r#"{{"winner":{},"reason":"{}"}}"#,
            winner.map_or("null".to_string(), |w| w.to_string()),
            reason)
    })
}

#[wasm_bindgen]
pub fn get_unit_count_for_player(player_id: u8) -> usize {
    GAME.with(|g| {
        g.borrow().as_ref().map(|game| game.get_unit_count_for_player(player_id)).unwrap_or(0)
    })
}

#[wasm_bindgen]
pub fn get_units_by_type(player_id: u8, unit_type: &str) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let ut = match unit_type {
            "worker" => irontide_core::components::UnitType::Worker,
            "rifleman" => irontide_core::components::UnitType::Rifleman,
            "tank" => irontide_core::components::UnitType::Tank,
            _ => return "[]".to_string(),
        };
        let ids = game.get_units_by_type(player_id, ut);
        format!("[{}]", ids.iter().map(|id| id.to_string()).collect::<Vec<_>>().join(","))
    })
}

#[wasm_bindgen]
pub fn get_unit_health(entity: u32) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        match game.get_unit_health(entity) {
            Some((current, max)) => format!(r#"{{"current":{},"max":{}}}"#, current, max),
            None => "null".to_string(),
        }
    })
}

#[wasm_bindgen]
pub fn get_unit_state(entity: u32) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.get_unit_state(entity).unwrap_or("dead").to_string()
    })
}

#[wasm_bindgen]
pub fn get_building_count_for_player(player_id: u8) -> usize {
    GAME.with(|g| {
        g.borrow().as_ref().map(|game| game.get_building_count_for_player(player_id)).unwrap_or(0)
    })
}

#[wasm_bindgen]
pub fn get_buildings_by_type(player_id: u8, building_type: &str) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let bt = match building_type {
            "command_center" => irontide_core::components::BuildingType::CommandCenter,
            "barracks" => irontide_core::components::BuildingType::Barracks,
            "turret" => irontide_core::components::BuildingType::Turret,
            _ => return "[]".to_string(),
        };
        let ids = game.get_buildings_by_type(player_id, bt);
        format!("[{}]", ids.iter().map(|id| id.to_string()).collect::<Vec<_>>().join(","))
    })
}

#[wasm_bindgen]
pub fn get_resource_nodes() -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let nodes = game.get_resource_nodes();
        let mut json = String::from("[");
        for (i, (id, x, y, remaining)) in nodes.iter().enumerate() {
            if i > 0 { json.push(','); }
            json.push_str(&format!(r#"{{"id":{},"x":{:.2},"y":{:.2},"remaining":{}}}"#, id, x, y, remaining));
        }
        json.push(']');
        json
    })
}

#[wasm_bindgen]
pub fn get_building_progress(entity: u32) -> f32 {
    GAME.with(|g| {
        g.borrow().as_ref().map(|game| game.get_building_progress(entity)).unwrap_or(0.0)
    })
}

#[wasm_bindgen]
pub fn get_production_queue(entity: u32) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let queue = game.get_production_queue(entity);
        let mut json = String::from("[");
        for (i, (name, progress)) in queue.iter().enumerate() {
            if i > 0 { json.push(','); }
            json.push_str(&format!(r#"{{"unitType":"{}","progress":{:.2}}}"#, name, progress));
        }
        json.push(']');
        json
    })
}

#[wasm_bindgen]
pub fn get_unit_carrying(entity: u32) -> u16 {
    GAME.with(|g| {
        g.borrow().as_ref().map(|game| game.get_unit_carrying(entity)).unwrap_or(0)
    })
}

#[wasm_bindgen]
pub fn is_tile_visible(player_id: u8, tile_x: i32, tile_y: i32) -> bool {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.fog.get(player_id, tile_x, tile_y) == irontide_core::map::fog_map::Visibility::Visible
    })
}

#[wasm_bindgen]
pub fn get_visible_tile_count(player_id: u8) -> u32 {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let buf = game.fog.team_buffer(player_id);
        buf.iter().filter(|&&v| v == 2).count() as u32
    })
}

#[wasm_bindgen]
pub fn get_tile_type(tile_x: i32, tile_y: i32) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let tile = game.map.get_tile(tile_x, tile_y);
        match tile {
            irontide_core::map::TileType::Ground => "grass",
            irontide_core::map::TileType::Water => "water",
            irontide_core::map::TileType::Rock => "rock",
            irontide_core::map::TileType::Resource => "ore",
        }.to_string()
    })
}

#[wasm_bindgen]
pub fn is_pathable(tile_x: i32, tile_y: i32) -> bool {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.map.is_passable(tile_x, tile_y)
    })
}
```

- [ ] **Step 3: Build WASM to verify compilation**

Run: `cd apps/irontide/engine && cargo check -p irontide-wasm 2>&1 | tail -20`

Expected: Compilation succeeds.

- [ ] **Step 4: Commit**

```bash
git add engine/crates/irontide-wasm/src/lib.rs engine/crates/irontide-core/src/game.rs
git commit -m "feat(irontide): expand WASM debug API to match QA spec"
```

---

### Task 10: Full determinism regression test

Add a comprehensive determinism test that exercises all new systems.

**Files:**
- Modify: `engine/crates/irontide-core/tests/determinism.rs`

- [ ] **Step 1: Write comprehensive determinism test**

Replace `tests/determinism.rs`:

```rust
use irontide_core::{GameState, PlayerCommand, TurnCommands};
use irontide_core::components::*;

#[test]
fn test_full_game_determinism() {
    let mut s1 = GameState::new(42, 100, 2);
    let mut s2 = GameState::new(42, 100, 2);

    // Phase 1: No commands (100 ticks)
    for _ in 0..100 {
        s1.tick(&[]);
        s2.tick(&[]);
    }
    assert_eq!(s1.checksum(), s2.checksum(), "Desync after idle ticks");

    // Phase 2: Move commands
    let move_cmds = vec![TurnCommands {
        tick: 100,
        player_id: 0,
        commands: vec![PlayerCommand::Move {
            unit_ids: vec![0, 1],
            target_x: 50,
            target_y: 50,
        }],
        checksum: None,
    }];
    for _ in 0..100 {
        s1.tick(&move_cmds);
        s2.tick(&move_cmds);
    }
    assert_eq!(s1.checksum(), s2.checksum(), "Desync after move commands");

    // Phase 3: Build commands
    let build_cmds = vec![TurnCommands {
        tick: 200,
        player_id: 0,
        commands: vec![PlayerCommand::Build {
            builder: 0,
            building_type: BuildingType::Barracks,
            x: 20,
            y: 20,
        }],
        checksum: None,
    }];
    s1.tick(&build_cmds);
    s2.tick(&build_cmds);
    for _ in 0..200 {
        s1.tick(&[]);
        s2.tick(&[]);
    }
    assert_eq!(s1.checksum(), s2.checksum(), "Desync after build commands");

    // Phase 4: Train commands
    let barracks_p0: Vec<u32> = s1.get_buildings_by_type(0, BuildingType::Barracks);
    if !barracks_p0.is_empty() {
        let train_cmds = vec![TurnCommands {
            tick: 400,
            player_id: 0,
            commands: vec![PlayerCommand::Train {
                building: barracks_p0[0],
                unit_type: UnitType::Rifleman,
            }],
            checksum: None,
        }];
        s1.tick(&train_cmds);
        s2.tick(&train_cmds);
        for _ in 0..200 {
            s1.tick(&[]);
            s2.tick(&[]);
        }
        assert_eq!(s1.checksum(), s2.checksum(), "Desync after train commands");
    }

    // Final check: both states should be byte-identical
    assert_eq!(s1.checksum(), s2.checksum(), "Final desync");
    assert_eq!(s1.player_resources, s2.player_resources, "Resource desync");
    assert_eq!(s1.tick, s2.tick, "Tick desync");
}

#[test]
fn test_divergence_detected() {
    let mut s1 = GameState::new(42, 100, 2);
    let mut s2 = GameState::new(42, 100, 2);

    // Feed different commands
    let cmds1 = vec![TurnCommands {
        tick: 0,
        player_id: 0,
        commands: vec![PlayerCommand::Move { unit_ids: vec![0], target_x: 10, target_y: 10 }],
        checksum: None,
    }];
    let cmds2 = vec![TurnCommands {
        tick: 0,
        player_id: 0,
        commands: vec![PlayerCommand::Move { unit_ids: vec![0], target_x: 200, target_y: 200 }],
        checksum: None,
    }];

    s1.tick(&cmds1);
    s2.tick(&cmds2);

    for _ in 0..50 {
        s1.tick(&[]);
        s2.tick(&[]);
    }

    assert_ne!(s1.checksum(), s2.checksum(), "Different commands should produce different states");
}
```

- [ ] **Step 2: Run tests**

Run: `cd apps/irontide/engine && cargo test determinism -- --nocapture 2>&1`

Expected: Both tests pass.

- [ ] **Step 3: Run full test suite**

Run: `cd apps/irontide/engine && cargo test 2>&1 | tail -10`

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add engine/crates/irontide-core/tests/determinism.rs
git commit -m "test(irontide): comprehensive determinism regression covering all systems"
```

---

## Plan 1 Complete

After all 10 tasks, the engine should:
- Have 3 unit types (Worker, Rifleman, Tank) and 3 building types (CC, Barracks, Turret)
- Support resource gathering (worker gather/deposit/auto-re-gather cycle)
- Support building construction (Build command, worker walks there, ticks to complete)
- Support unit production (Train command, queue, spawn when ready)
- Check win condition (all CCs destroyed = game over)
- Track supply cap (CCs provide supply)
- Have a hand-crafted symmetric map
- Have buildings provide fog of war vision
- Have attack-move and worker-can't-attack guards
- Have a full debug API matching the QA spec
- Pass all determinism tests

Run: `cd apps/irontide/engine && cargo test 2>&1 | tail -5` — all tests should pass.
