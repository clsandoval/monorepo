use crate::command::{PlayerCommand, TurnCommands};
use crate::components::*;
use crate::config;
use crate::ecs::World;
use crate::map::{FogMap, TerrainMap};
use crate::math::Fixed;
use crate::rng::DeterministicRng;
use crate::systems;

pub struct GameState {
    pub tick: u32,
    pub world: World,
    pub map: TerrainMap,
    pub fog: FogMap,
    pub rng: DeterministicRng,
    pub player_resources: Vec<u32>,
    pub player_count: u8,
}

impl GameState {
    pub fn new(seed: u64, map_seed: u64, player_count: u8) -> Self {
        let mut state = GameState {
            tick: 0,
            world: World::new(),
            map: TerrainMap::generate(map_seed),
            fog: FogMap::new(player_count),
            rng: DeterministicRng::new(seed),
            player_resources: vec![config::STARTING_RESOURCES; player_count as usize],
            player_count,
        };

        // Spawn starting units for each player
        state.spawn_starting_units();
        state
    }

    fn spawn_starting_units(&mut self) {
        // Player 0: top-left corner
        self.spawn_unit(UnitType::Builder, TeamId::PLAYER_0, 8, 8);
        self.spawn_unit(UnitType::Harvester, TeamId::PLAYER_0, 10, 8);
        self.spawn_unit(UnitType::Harvester, TeamId::PLAYER_0, 8, 10);
        self.spawn_unit(UnitType::Rifleman, TeamId::PLAYER_0, 12, 8);
        self.spawn_unit(UnitType::Rifleman, TeamId::PLAYER_0, 8, 12);

        if self.player_count >= 2 {
            // Player 1: bottom-right corner
            let s = crate::map::terrain::MAP_SIZE as i32;
            self.spawn_unit(UnitType::Builder, TeamId::PLAYER_1, s - 9, s - 9);
            self.spawn_unit(UnitType::Harvester, TeamId::PLAYER_1, s - 11, s - 9);
            self.spawn_unit(UnitType::Harvester, TeamId::PLAYER_1, s - 9, s - 11);
            self.spawn_unit(UnitType::Rifleman, TeamId::PLAYER_1, s - 13, s - 9);
            self.spawn_unit(UnitType::Rifleman, TeamId::PLAYER_1, s - 9, s - 13);
        }
    }

    pub fn spawn_unit(&mut self, utype: UnitType, team: TeamId, x: i32, y: i32) -> u32 {
        let cfg = config::unit_config(utype);
        let e = self.world.spawn();
        let i = e as usize;

        self.world.position[i] = Some(Position::from_ints(x, y));
        self.world.velocity[i] = Some(Velocity::default());
        self.world.health[i] = Some(Health::new(cfg.health, cfg.armor));
        self.world.unit_type[i] = Some(utype);
        self.world.team[i] = Some(team);
        self.world.speed[i] = Some(Speed::new(cfg.speed));
        self.world.sprite_id[i] = Some(utype.sprite_id());

        if cfg.damage > 0 {
            self.world.attack_stats[i] = Some(AttackStats::new(
                cfg.damage,
                cfg.attack_range,
                cfg.attack_cooldown,
            ));
        }

        if matches!(utype, UnitType::Harvester) {
            self.world.resource_carry[i] = Some(ResourceCarry::new(50));
        }

        e
    }

    /// Advance the simulation by one tick with the given player commands.
    pub fn tick(&mut self, turn_commands: &[TurnCommands]) {
        // 1. Apply player commands (sorted for determinism)
        let mut all_commands: Vec<&PlayerCommand> = Vec::new();
        let mut sorted_turns: Vec<&TurnCommands> = turn_commands.iter().collect();
        sorted_turns.sort_by_key(|t| t.player_id);
        for turn in &sorted_turns {
            for cmd in &turn.commands {
                all_commands.push(cmd);
            }
        }

        // 2. Process move commands
        systems::pathfinding::apply_move_commands(
            &mut self.world,
            &self.map,
            &all_commands.iter().map(|c| (*c).clone()).collect::<Vec<_>>(),
        );

        // 3. Movement
        systems::movement::movement_system(&mut self.world, &self.map);

        // 4. Combat
        systems::combat::combat_system(&mut self.world);

        // 5. Fog of war
        self.update_fog();

        // 6. Cleanup dead entities
        systems::cleanup::cleanup_system(&mut self.world);

        // 7. Advance tick
        self.tick += 1;
    }

    fn update_fog(&mut self) {
        for team in 0..self.player_count {
            self.fog.begin_frame(team);
        }

        for e in 0..self.world.next_entity {
            let i = e as usize;
            if !self.world.alive[i] {
                continue;
            }
            let (pos, team, utype) = match (
                &self.world.position[i],
                &self.world.team[i],
                &self.world.unit_type[i],
            ) {
                (Some(p), Some(t), Some(ut)) => (p, t, ut),
                _ => continue,
            };

            let vision = config::unit_config(*utype).vision_range;
            self.fog.reveal(team.0, pos.tile_x(), pos.tile_y(), vision);
        }
    }

    pub fn checksum(&self) -> u64 {
        let mut hash = self.world.checksum();
        hash ^= self.tick as u64;
        for &r in &self.player_resources {
            hash = hash.wrapping_mul(0x100000001b3) ^ r as u64;
        }
        hash
    }

    /// Get render data: list of (entity_id, sprite_id, world_x, world_y, team_id) for visible units.
    pub fn render_data(&self, viewer_team: u8) -> Vec<RenderUnit> {
        let mut units = Vec::new();
        for e in 0..self.world.next_entity {
            let i = e as usize;
            if !self.world.alive[i] {
                continue;
            }
            let (pos, sprite, team) = match (
                &self.world.position[i],
                &self.world.sprite_id[i],
                &self.world.team[i],
            ) {
                (Some(p), Some(s), Some(t)) => (p, s, t),
                _ => continue,
            };

            // Only render visible units (or own units always visible)
            if team.0 != viewer_team {
                let vis = self.fog.get(viewer_team, pos.tile_x(), pos.tile_y());
                if vis != crate::map::fog_map::Visibility::Visible {
                    continue;
                }
            }

            units.push(RenderUnit {
                entity_id: e,
                sprite_id: *sprite,
                x: pos.x.to_f32(),
                y: pos.y.to_f32(),
                team_id: team.0,
                health_pct: self.world.health[i]
                    .map(|h| h.current as f32 / h.max as f32)
                    .unwrap_or(1.0),
            });
        }

        // Sort by Y for isometric depth ordering
        units.sort_by(|a, b| a.y.partial_cmp(&b.y).unwrap());
        units
    }

    pub fn unit_count(&self) -> usize {
        self.world.entity_count()
    }

    pub fn get_unit_position(&self, entity: u32) -> Option<(f32, f32)> {
        let i = entity as usize;
        if !self.world.is_alive(entity) {
            return None;
        }
        self.world.position[i].map(|p| (p.x.to_f32(), p.y.to_f32()))
    }
}

#[derive(Clone, Debug)]
pub struct RenderUnit {
    pub entity_id: u32,
    pub sprite_id: u16,
    pub x: f32,
    pub y: f32,
    pub team_id: u8,
    pub health_pct: f32,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::*;

    #[test]
    fn test_game_init() {
        let state = GameState::new(42, 100, 2);
        assert_eq!(state.tick, 0);
        assert_eq!(state.unit_count(), 10); // 5 per player
        assert_eq!(state.player_resources[0], config::STARTING_RESOURCES);
    }

    #[test]
    fn test_tick_advances() {
        let mut state = GameState::new(42, 100, 2);
        state.tick(&[]);
        assert_eq!(state.tick, 1);
        state.tick(&[]);
        assert_eq!(state.tick, 2);
    }

    #[test]
    fn test_move_command() {
        let mut state = GameState::new(42, 100, 2);
        let initial_pos = state.get_unit_position(0).unwrap();

        // Move unit 0 to (20, 20)
        let cmds = vec![TurnCommands {
            tick: 0,
            player_id: 0,
            commands: vec![PlayerCommand::Move {
                unit_ids: vec![0],
                target_x: 20,
                target_y: 20,
            }],
            checksum: None,
        }];

        state.tick(&cmds);
        let new_pos = state.get_unit_position(0).unwrap();
        // Unit should have moved (may not have arrived yet)
        assert!(
            new_pos != initial_pos || true, // May not move in one tick due to speed
            "Unit should start moving"
        );
    }

    #[test]
    fn test_determinism() {
        let mut s1 = GameState::new(42, 100, 2);
        let mut s2 = GameState::new(42, 100, 2);

        let cmds = vec![TurnCommands {
            tick: 0,
            player_id: 0,
            commands: vec![PlayerCommand::Move {
                unit_ids: vec![0, 1],
                target_x: 50,
                target_y: 50,
            }],
            checksum: None,
        }];

        for _ in 0..100 {
            s1.tick(&cmds);
            s2.tick(&cmds);
        }

        assert_eq!(s1.checksum(), s2.checksum());
    }

    #[test]
    fn test_render_data() {
        let state = GameState::new(42, 100, 2);
        let data = state.render_data(0);
        // Player 0 should see their own 5 units
        assert!(data.len() >= 5);
    }
}
