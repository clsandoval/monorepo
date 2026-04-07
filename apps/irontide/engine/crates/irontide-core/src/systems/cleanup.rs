use crate::ecs::World;

/// Remove dead entities (health == 0).
pub fn cleanup_system(world: &mut World) {
    let dead: Vec<u32> = (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i]
                && world.health[i].is_some()
                && world.health[i].as_ref().unwrap().is_dead()
        })
        .collect();

    for e in dead {
        world.despawn(e);
    }
}
