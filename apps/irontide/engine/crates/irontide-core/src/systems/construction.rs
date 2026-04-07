use crate::components::*;
use crate::config;
use crate::ecs::World;
use crate::math::Fixed;

/// Process entities with build_target: advance construction progress when in range.
pub fn construction_system(world: &mut World) {
    for e in 0..world.next_entity {
        let i = e as usize;
        if !world.alive[i] {
            continue;
        }

        let bt = match world.build_target[i] {
            Some(bt) => bt,
            None => continue,
        };

        let building_e = bt.building_entity;
        let bi = building_e as usize;

        // If building entity is dead, cancel
        if !world.is_alive(building_e) {
            world.build_target[i] = None;
            world.move_target[i] = None;
            continue;
        }

        // Check distance between worker and building
        let (worker_pos, building_pos) = match (&world.position[i], &world.position[bi]) {
            (Some(wp), Some(bp)) => (*wp, *bp),
            _ => continue,
        };

        let dist_sq = worker_pos.distance_squared_to(&building_pos);
        let threshold = Fixed::from_int(3) * Fixed::from_int(3); // 3 tiles

        if dist_sq <= threshold {
            // In range: stop moving, advance build progress
            world.move_target[i] = None;
            world.velocity[i] = Some(Velocity { dx: Fixed::ZERO, dy: Fixed::ZERO });

            if let Some(ref mut bp) = world.build_progress[bi] {
                bp.ticks_remaining = bp.ticks_remaining.saturating_sub(1);

                if bp.ticks_remaining == 0 {
                    // Building complete — apply completion effects
                    let btype = bp.building_type;
                    complete_building(world, building_e, btype);

                    // Free the worker
                    world.build_target[i] = None;
                }
            }
        }
        // If not in range, keep moving (move_target already set)
    }
}

/// Apply completion effects to a finished building.
fn complete_building(world: &mut World, building_e: u32, btype: BuildingType) {
    let bi = building_e as usize;

    // Remove build progress
    world.build_progress[bi] = None;

    // Give production buildings their queue
    match btype {
        BuildingType::CommandCenter | BuildingType::Barracks => {
            world.production_queue[bi] = Some(ProductionQueue::new());
        }
        BuildingType::Turret => {
            world.attack_stats[bi] = Some(AttackStats::new(
                config::TURRET_DAMAGE,
                config::TURRET_RANGE,
                config::TURRET_ATTACK_COOLDOWN,
            ));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::*;
    use crate::config;
    use crate::game::GameState;

    #[test]
    fn test_worker_builds_barracks() {
        let mut state = GameState::new(42, 100, 2);
        // Give player enough resources
        state.player_resources[0] = 1000;

        // Find a worker belonging to player 0
        let worker_e = find_player_worker(&state, 0).expect("should have a worker");

        // Issue build command
        let cmds = vec![TurnCommands {
            tick: 0,
            player_id: 0,
            commands: vec![PlayerCommand::Build {
                builder: worker_e,
                building_type: BuildingType::Barracks,
                x: 15,
                y: 15,
            }],
            checksum: None,
        }];

        state.tick(&cmds);

        // Find the barracks entity (under construction)
        let barracks_e = find_building_under_construction(&state, BuildingType::Barracks);
        assert!(barracks_e.is_some(), "Barracks should exist under construction");
        let barracks_e = barracks_e.unwrap();

        // Resources should have been deducted
        let bcfg = config::building_config(BuildingType::Barracks);
        assert_eq!(state.player_resources[0], 1000 - bcfg.build_cost);

        // Tick until construction completes
        let build_ticks = bcfg.build_time_ticks;
        for _ in 0..(build_ticks + 200) {
            state.tick(&[]);
        }

        // Building should be complete (no build_progress)
        let bi = barracks_e as usize;
        assert!(
            state.world.build_progress[bi].is_none(),
            "Barracks should be complete (no build_progress)"
        );
        assert!(
            state.world.production_queue[bi].is_some(),
            "Completed barracks should have a production queue"
        );
    }

    #[test]
    fn test_cannot_build_without_resources() {
        let mut state = GameState::new(42, 100, 2);
        // Set resources to 0
        state.player_resources[0] = 0;

        let worker_e = find_player_worker(&state, 0).expect("should have a worker");

        let cmds = vec![TurnCommands {
            tick: 0,
            player_id: 0,
            commands: vec![PlayerCommand::Build {
                builder: worker_e,
                building_type: BuildingType::Barracks,
                x: 15,
                y: 15,
            }],
            checksum: None,
        }];

        state.tick(&cmds);

        // No barracks should exist
        let barracks_e = find_building_under_construction(&state, BuildingType::Barracks);
        assert!(barracks_e.is_none(), "Should not create building without resources");
        // Resources should still be 0
        assert_eq!(state.player_resources[0], 0);
    }

    #[test]
    fn test_worker_freed_after_build() {
        let mut state = GameState::new(42, 100, 2);
        state.player_resources[0] = 1000;

        let worker_e = find_player_worker(&state, 0).expect("should have a worker");

        let cmds = vec![TurnCommands {
            tick: 0,
            player_id: 0,
            commands: vec![PlayerCommand::Build {
                builder: worker_e,
                building_type: BuildingType::Turret,
                x: 15,
                y: 15,
            }],
            checksum: None,
        }];

        state.tick(&cmds);

        // Worker should have a build_target
        let wi = worker_e as usize;
        assert!(
            state.world.build_target[wi].is_some(),
            "Worker should have build_target during construction"
        );

        // Tick until construction completes
        let bcfg = config::building_config(BuildingType::Turret);
        for _ in 0..(bcfg.build_time_ticks + 200) {
            state.tick(&[]);
        }

        // Worker should be freed
        assert!(
            state.world.build_target[wi].is_none(),
            "Worker should be freed after construction completes"
        );
    }

    // --- helpers ---

    fn find_player_worker(state: &GameState, player_id: u8) -> Option<u32> {
        for e in 0..state.world.next_entity {
            let i = e as usize;
            if !state.world.alive[i] {
                continue;
            }
            if state.world.unit_type[i] == Some(UnitType::Worker)
                && state.world.team[i] == Some(TeamId(player_id))
            {
                return Some(e);
            }
        }
        None
    }

    fn find_building_under_construction(
        state: &GameState,
        btype: BuildingType,
    ) -> Option<u32> {
        for e in 0..state.world.next_entity {
            let i = e as usize;
            if !state.world.alive[i] {
                continue;
            }
            if state.world.building_type[i] == Some(btype)
                && state.world.build_progress[i].is_some()
            {
                return Some(e);
            }
        }
        None
    }
}
