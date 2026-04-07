use crate::ecs::World;
use crate::math::Fixed;

/// Simple combat: units with attack_stats and attack_target deal damage.
/// Also handles target acquisition for units with no target.
pub fn combat_system(world: &mut World) {
    let entities: Vec<u32> = (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i]
                && world.position[i].is_some()
                && world.attack_stats[i].is_some()
                && world.team[i].is_some()
        })
        .collect();

    // Tick cooldowns
    for &e in &entities {
        let i = e as usize;
        if let Some(ref mut stats) = world.attack_stats[i] {
            stats.tick_cooldown();
        }
    }

    // Process attacks: collect damage events first, then apply
    let mut damage_events: Vec<(u32, u16)> = Vec::new();

    for &e in &entities {
        let i = e as usize;
        let stats = world.attack_stats[i].unwrap();
        let pos = world.position[i].unwrap();
        let team = world.team[i].unwrap();

        // Check if current target is valid
        if let Some(at) = world.attack_target[i] {
            if !world.is_alive(at.target) {
                world.attack_target[i] = None;
            } else if let Some(target_pos) = world.position[at.target as usize] {
                let dx = pos.x - target_pos.x;
                let dy = pos.y - target_pos.y;
                let dist_sq = Fixed::distance_squared(dx, dy);
                let range_sq = Fixed::from_int(stats.range_squared as i32);
                if dist_sq > range_sq {
                    world.attack_target[i] = None; // Out of range
                }
            }
        }

        // Auto-acquire target if none
        if world.attack_target[i].is_none() && stats.damage > 0 {
            let mut best_dist = Fixed::MAX;
            let mut best_target: Option<u32> = None;
            let range_sq = Fixed::from_int(stats.range_squared as i32);

            for &other in &entities {
                if other == e {
                    continue;
                }
                let oi = other as usize;
                let other_team = world.team[oi].unwrap();
                if other_team == team {
                    continue; // Same team
                }
                if world.health[oi].is_none() {
                    continue;
                }
                let other_pos = world.position[oi].unwrap();
                let dx = pos.x - other_pos.x;
                let dy = pos.y - other_pos.y;
                let dist_sq = Fixed::distance_squared(dx, dy);
                if dist_sq < range_sq && dist_sq < best_dist {
                    best_dist = dist_sq;
                    best_target = Some(other);
                }
            }

            if let Some(t) = best_target {
                world.attack_target[i] = Some(crate::components::AttackTarget { target: t });
            }
        }

        // Fire if ready and have target
        if let Some(at) = world.attack_target[i] {
            if stats.is_ready() {
                damage_events.push((at.target, stats.damage));
                world.attack_stats[i].as_mut().unwrap().fire();
            }
        }
    }

    // Apply damage
    for (target, damage) in damage_events {
        let ti = target as usize;
        if let Some(ref mut health) = world.health[ti] {
            health.apply_damage(damage);
        }
    }
}
