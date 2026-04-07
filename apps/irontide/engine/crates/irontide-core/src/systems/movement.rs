use crate::ecs::query;
use crate::ecs::World;
use crate::math::Fixed;
use crate::map::TerrainMap;

/// Move units toward their move targets. Clears move_target when arrived.
pub fn movement_system(world: &mut World, _map: &TerrainMap) {
    let entities = query::with_move_target(world);
    let arrival_threshold = Fixed::from_raw(3277); // ~0.05 tiles

    for e in entities {
        let i = e as usize;
        let pos = world.position[i].unwrap();
        let target = world.move_target[i].unwrap();
        let speed = world.speed[i].unwrap();

        let dx = target.target_x - pos.x;
        let dy = target.target_y - pos.y;
        let dist_sq = Fixed::distance_squared(dx, dy);

        // Check if arrived
        if dist_sq < arrival_threshold.mul(arrival_threshold) {
            world.position[i] = Some(crate::components::Position {
                x: target.target_x,
                y: target.target_y,
            });
            world.velocity[i] = Some(crate::components::Velocity {
                dx: Fixed::ZERO,
                dy: Fixed::ZERO,
            });
            world.move_target[i] = None;
            continue;
        }

        // Normalize direction and apply speed
        let dist = dist_sq.sqrt();
        if dist.raw() == 0 {
            continue;
        }

        let vx = dx.mul(speed.value).div(dist);
        let vy = dy.mul(speed.value).div(dist);

        // Don't overshoot
        let step_dist_sq = Fixed::distance_squared(vx, vy);
        if step_dist_sq > dist_sq {
            world.position[i] = Some(crate::components::Position {
                x: target.target_x,
                y: target.target_y,
            });
            world.velocity[i] = Some(crate::components::Velocity {
                dx: Fixed::ZERO,
                dy: Fixed::ZERO,
            });
            world.move_target[i] = None;
        } else {
            world.position[i] = Some(crate::components::Position {
                x: pos.x + vx,
                y: pos.y + vy,
            });
            world.velocity[i] = Some(crate::components::Velocity { dx: vx, dy: vy });
        }
    }
}
