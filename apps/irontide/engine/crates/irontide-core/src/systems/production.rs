use crate::components::*;
use crate::config;
use crate::ecs::World;

/// Info needed to spawn a unit after production completes.
pub struct SpawnInfo {
    pub team: TeamId,
    pub unit_type: UnitType,
    pub x: i32,
    pub y: i32,
}

/// Process production queues on completed buildings.
/// Returns a list of units to spawn this tick.
pub fn production_system(world: &mut World) -> Vec<SpawnInfo> {
    let mut spawns = Vec::new();

    for e in 0..world.next_entity {
        let i = e as usize;
        if !world.alive[i] {
            continue;
        }

        // Must be a building with a production queue and NOT under construction
        let btype = match world.building_type[i] {
            Some(bt) => bt,
            None => continue,
        };
        if world.build_progress[i].is_some() {
            continue;
        }
        let pq = match world.production_queue[i].as_mut() {
            Some(pq) => pq,
            None => continue,
        };

        if pq.queue.is_empty() {
            continue;
        }

        // If ticks_remaining is 0, start producing the next unit
        if pq.ticks_remaining == 0 {
            let unit_type = pq.queue[0];
            let build_time = config::unit_config(unit_type).build_time_ticks;
            pq.ticks_remaining = build_time;
        }

        // Decrement
        pq.ticks_remaining = pq.ticks_remaining.saturating_sub(1);

        // Check if done
        if pq.ticks_remaining == 0 {
            let unit_type = pq.queue.remove(0);
            let team = match world.team[i] {
                Some(t) => t,
                None => continue,
            };
            let pos = match world.position[i] {
                Some(p) => p,
                None => continue,
            };

            // Spawn position: right side of building
            let (width, height) = btype.tile_size();
            let spawn_x = pos.tile_x() + width as i32 + 1;
            let spawn_y = pos.tile_y() + height as i32 / 2;

            spawns.push(SpawnInfo {
                team,
                unit_type,
                x: spawn_x,
                y: spawn_y,
            });
        }
    }

    spawns
}

#[cfg(test)]
mod tests {
    use crate::command::*;
    use crate::components::*;
    use crate::config;
    use crate::game::GameState;

    /// Helper: find a completed building of a given type for a player.
    fn find_completed_building(state: &GameState, btype: BuildingType, player: u8) -> Option<u32> {
        for e in 0..state.world.next_entity {
            let i = e as usize;
            if !state.world.alive[i] {
                continue;
            }
            if state.world.building_type[i] == Some(btype)
                && state.world.team[i] == Some(TeamId(player))
                && state.world.build_progress[i].is_none()
            {
                return Some(e);
            }
        }
        None
    }

    /// Count units of a given type for a player.
    fn count_units(state: &GameState, utype: UnitType, player: u8) -> usize {
        let mut count = 0;
        for e in 0..state.world.next_entity {
            let i = e as usize;
            if !state.world.alive[i] {
                continue;
            }
            if state.world.unit_type[i] == Some(utype)
                && state.world.team[i] == Some(TeamId(player))
            {
                count += 1;
            }
        }
        count
    }

    #[test]
    fn test_train_worker_from_cc() {
        let mut state = GameState::new(42, 100, 2);
        state.player_resources[0] = 1000;

        let cc = find_completed_building(&state, BuildingType::CommandCenter, 0)
            .expect("should have a CC");

        let initial_workers = count_units(&state, UnitType::Worker, 0);

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

        // Tick through build time
        let build_ticks = config::unit_config(UnitType::Worker).build_time_ticks;
        for _ in 0..build_ticks {
            state.tick(&[]);
        }

        let final_workers = count_units(&state, UnitType::Worker, 0);
        assert_eq!(
            final_workers,
            initial_workers + 1,
            "Should have one more worker after production completes"
        );
    }

    #[test]
    fn test_train_rifleman_from_barracks() {
        let mut state = GameState::new(42, 100, 2);
        state.player_resources[0] = 5000;

        // Build a barracks: find a worker, issue build command, tick until complete
        let worker_e = {
            let mut found = None;
            for e in 0..state.world.next_entity {
                let i = e as usize;
                if state.world.alive[i]
                    && state.world.unit_type[i] == Some(UnitType::Worker)
                    && state.world.team[i] == Some(TeamId(0))
                {
                    found = Some(e);
                    break;
                }
            }
            found.expect("should have a worker")
        };

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

        // Tick until barracks completes
        let barracks_build_time = config::building_config(BuildingType::Barracks).build_time_ticks;
        for _ in 0..(barracks_build_time + 200) {
            state.tick(&[]);
        }

        let barracks = find_completed_building(&state, BuildingType::Barracks, 0)
            .expect("barracks should be complete");

        let initial_riflemen = count_units(&state, UnitType::Rifleman, 0);

        // Train a rifleman
        let train_cmds = vec![TurnCommands {
            tick: 0,
            player_id: 0,
            commands: vec![PlayerCommand::Train {
                building: barracks,
                unit_type: UnitType::Rifleman,
            }],
            checksum: None,
        }];
        state.tick(&train_cmds);

        let rifleman_build_ticks = config::unit_config(UnitType::Rifleman).build_time_ticks;
        for _ in 0..rifleman_build_ticks {
            state.tick(&[]);
        }

        let final_riflemen = count_units(&state, UnitType::Rifleman, 0);
        assert_eq!(
            final_riflemen,
            initial_riflemen + 1,
            "Should have one more rifleman after production completes"
        );
    }

    #[test]
    fn test_cannot_train_without_resources() {
        let mut state = GameState::new(42, 100, 2);

        let cc = find_completed_building(&state, BuildingType::CommandCenter, 0)
            .expect("should have a CC");

        // Set resources to 0
        state.player_resources[0] = 0;

        let initial_workers = count_units(&state, UnitType::Worker, 0);

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

        // Tick a bunch — nothing should be produced
        let build_ticks = config::unit_config(UnitType::Worker).build_time_ticks;
        for _ in 0..(build_ticks + 10) {
            state.tick(&[]);
        }

        let final_workers = count_units(&state, UnitType::Worker, 0);
        assert_eq!(
            final_workers, initial_workers,
            "Should not produce a worker without resources"
        );
    }

    #[test]
    fn test_cannot_train_over_supply_cap() {
        let mut state = GameState::new(42, 100, 2);
        state.player_resources[0] = 100_000;

        // Max out supply: cap is 15, currently using 4 (4 workers)
        // Set supply_used to supply_cap
        state.player_supply_used[0] = state.player_supply_cap[0];

        let cc = find_completed_building(&state, BuildingType::CommandCenter, 0)
            .expect("should have a CC");

        let initial_workers = count_units(&state, UnitType::Worker, 0);

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

        let build_ticks = config::unit_config(UnitType::Worker).build_time_ticks;
        for _ in 0..(build_ticks + 10) {
            state.tick(&[]);
        }

        let final_workers = count_units(&state, UnitType::Worker, 0);
        assert_eq!(
            final_workers, initial_workers,
            "Should not produce a worker when supply is maxed"
        );
    }
}
