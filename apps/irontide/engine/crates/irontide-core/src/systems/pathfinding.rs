use crate::command::PlayerCommand;
use crate::ecs::World;
use crate::map::TerrainMap;
use crate::components::MoveTarget;
use crate::math::Fixed;

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
            }
        }

        if let PlayerCommand::Stop { unit_ids } = cmd {
            for &uid in unit_ids {
                let i = uid as usize;
                if world.is_alive(uid) {
                    world.move_target[i] = None;
                    world.attack_target[i] = None;
                }
            }
        }
    }
}
