use crate::command::PlayerCommand;
use crate::components::{GatherState, GatherTarget, MoveTarget, UnitType};
use crate::ecs::World;
use crate::map::TerrainMap;
use crate::math::Fixed;
use crate::systems::resource::find_nearest_cc;

/// Process move commands: set move targets for units.
/// In Phase 1, units move directly toward the target (no A* per tick).
/// A* is available for more complex routing if needed.
pub fn apply_move_commands(world: &mut World, _map: &TerrainMap, commands: &[PlayerCommand]) {
    for cmd in commands {
        if let PlayerCommand::Move { unit_ids, target_x, target_y } = cmd {
            for &uid in unit_ids {
                let i = uid as usize;
                if !world.is_alive(uid) {
                    continue;
                }
                if world.position[i].is_none() {
                    continue;
                }
                world.move_target[i] = Some(MoveTarget::new(
                    Fixed::from_int(*target_x) + Fixed::HALF,
                    Fixed::from_int(*target_y) + Fixed::HALF,
                ));
                world.attack_target[i] = None; // Cancel attack on move
                world.gather_target[i] = None; // Cancel gather on move
            }
        }

        if let PlayerCommand::Attack { unit_ids, target } = cmd {
            for &uid in unit_ids {
                let i = uid as usize;
                if !world.is_alive(uid) {
                    continue;
                }
                let target_i = *target as usize;
                if !world.is_alive(*target) {
                    continue;
                }

                // If target is a resource node and attacker is a Worker, start gather cycle
                if world.resource_node[target_i].is_some()
                    && world.unit_type[i] == Some(UnitType::Worker)
                {
                    let team = match world.team[i] {
                        Some(t) => t,
                        None => continue,
                    };
                    let cc = match find_nearest_cc(world, uid, team) {
                        Some(cc) => cc,
                        None => continue, // No CC to deposit at
                    };

                    // Set up gather cycle
                    world.gather_target[i] = Some(GatherTarget {
                        node_entity: *target,
                        deposit_entity: cc,
                        state: GatherState::MovingToNode,
                    });
                    world.attack_target[i] = None;

                    // Move toward the node
                    if let Some(node_pos) = world.position[target_i] {
                        world.move_target[i] = Some(MoveTarget::new(
                            node_pos.x + Fixed::HALF,
                            node_pos.y + Fixed::HALF,
                        ));
                    }
                }
            }
        }

        if let PlayerCommand::Stop { unit_ids } = cmd {
            for &uid in unit_ids {
                let i = uid as usize;
                if world.is_alive(uid) {
                    world.move_target[i] = None;
                    world.attack_target[i] = None;
                    world.gather_target[i] = None;
                }
            }
        }
    }
}
