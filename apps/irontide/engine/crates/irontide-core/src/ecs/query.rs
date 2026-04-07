// Query helpers for iterating entities with specific component combinations.
// These are simple iterator adapters over the SoA storage.

use super::world::{Entity, World};

/// Iterate entities that have both position and velocity.
pub fn with_position_velocity(world: &World) -> Vec<Entity> {
    (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i] && world.position[i].is_some() && world.velocity[i].is_some()
        })
        .collect()
}

/// Iterate entities that have position, move_target, and speed.
pub fn with_move_target(world: &World) -> Vec<Entity> {
    (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i]
                && world.position[i].is_some()
                && world.move_target[i].is_some()
                && world.speed[i].is_some()
        })
        .collect()
}

/// Iterate entities with position and health (for combat targeting).
pub fn with_position_health(world: &World) -> Vec<Entity> {
    (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i] && world.position[i].is_some() && world.health[i].is_some()
        })
        .collect()
}

/// Iterate entities that are alive units (have position, team, unit_type).
pub fn alive_units(world: &World) -> Vec<Entity> {
    (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i]
                && world.position[i].is_some()
                && world.team[i].is_some()
                && world.unit_type[i].is_some()
        })
        .collect()
}
