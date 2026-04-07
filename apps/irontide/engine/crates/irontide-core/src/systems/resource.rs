use crate::components::*;
use crate::ecs::World;
use crate::map::TerrainMap;
use crate::math::Fixed;

/// Find the nearest CommandCenter for a given team.
pub fn find_nearest_cc(world: &World, unit_entity: u32, team: TeamId) -> Option<u32> {
    let unit_pos = world.position[unit_entity as usize]?;
    let mut best: Option<(u32, Fixed)> = None;

    for e in 0..world.next_entity {
        let i = e as usize;
        if !world.alive[i] {
            continue;
        }
        if world.building_type[i] != Some(BuildingType::CommandCenter) {
            continue;
        }
        if world.team[i] != Some(team) {
            continue;
        }
        let pos = match world.position[i] {
            Some(p) => p,
            None => continue,
        };
        let dist_sq = unit_pos.distance_squared_to(&pos);
        match best {
            None => best = Some((e, dist_sq)),
            Some((_, bd)) if dist_sq < bd => best = Some((e, dist_sq)),
            _ => {}
        }
    }

    best.map(|(e, _)| e)
}

/// Core resource gathering system. Processes all entities with a GatherTarget component.
///
/// States:
/// - MovingToNode: wait for worker to get within 2 tiles of node, then switch to Gathering
/// - Gathering: transfer ore from node to worker carry each tick
/// - ReturningToDeposit: wait for worker to get within 3 tiles of CC, deposit, re-gather
pub fn resource_system(world: &mut World, _map: &TerrainMap, player_resources: &mut [u32]) {
    // Collect entities that have gather targets to avoid borrow issues
    let entities: Vec<u32> = (0..world.next_entity)
        .filter(|&e| {
            let i = e as usize;
            world.alive[i] && world.gather_target[i].is_some()
        })
        .collect();

    for e in entities {
        let i = e as usize;
        let gt = match world.gather_target[i] {
            Some(gt) => gt,
            None => continue,
        };

        let worker_pos = match world.position[i] {
            Some(p) => p,
            None => {
                world.gather_target[i] = None;
                continue;
            }
        };

        match gt.state {
            GatherState::MovingToNode => {
                // Check if node is still alive
                if !world.is_alive(gt.node_entity) {
                    world.gather_target[i] = None;
                    world.move_target[i] = None;
                    continue;
                }

                let node_pos = match world.position[gt.node_entity as usize] {
                    Some(p) => p,
                    None => {
                        world.gather_target[i] = None;
                        world.move_target[i] = None;
                        continue;
                    }
                };

                // Within 2 tiles? (distance_squared <= 4 in tile units)
                let dist_sq = worker_pos.distance_squared_to(&node_pos);
                let threshold = Fixed::from_int(2) * Fixed::from_int(2); // 4
                if dist_sq <= threshold {
                    // Stop moving, start gathering
                    world.move_target[i] = None;
                    world.velocity[i] = Some(Velocity::default());
                    let mut new_gt = gt;
                    new_gt.state = GatherState::Gathering;
                    world.gather_target[i] = Some(new_gt);
                }
            }

            GatherState::Gathering => {
                // Check if node is still alive
                if !world.is_alive(gt.node_entity) {
                    // Node depleted/dead — go deposit whatever we have
                    if let Some(carry) = &world.resource_carry[i] {
                        if carry.amount > 0 {
                            // Head to deposit
                            let mut new_gt = gt;
                            new_gt.state = GatherState::ReturningToDeposit;
                            world.gather_target[i] = Some(new_gt);
                            set_move_toward_entity(world, e, gt.deposit_entity);
                        } else {
                            world.gather_target[i] = None;
                        }
                    } else {
                        world.gather_target[i] = None;
                    }
                    continue;
                }

                let node_i = gt.node_entity as usize;
                let node = match world.resource_node[node_i] {
                    Some(n) => n,
                    None => {
                        world.gather_target[i] = None;
                        continue;
                    }
                };

                let carry = match world.resource_carry[i] {
                    Some(c) => c,
                    None => {
                        world.gather_target[i] = None;
                        continue;
                    }
                };

                // Transfer ore
                let can_carry = carry.capacity - carry.amount;
                let transfer = (node.gather_rate as u32).min(node.remaining).min(can_carry as u32);

                if transfer > 0 {
                    world.resource_node[node_i] = Some(ResourceNode {
                        remaining: node.remaining - transfer,
                        gather_rate: node.gather_rate,
                    });
                    world.resource_carry[i] = Some(ResourceCarry {
                        amount: carry.amount + transfer as u16,
                        capacity: carry.capacity,
                    });
                }

                let updated_carry = world.resource_carry[i].unwrap();
                let updated_node = world.resource_node[node_i].unwrap();

                // Check if full or node depleted
                if updated_carry.is_full() || updated_node.remaining == 0 {
                    // If node is depleted, despawn it
                    if updated_node.remaining == 0 {
                        world.despawn(gt.node_entity);
                    }

                    // Switch to returning
                    let mut new_gt = gt;
                    new_gt.state = GatherState::ReturningToDeposit;
                    world.gather_target[i] = Some(new_gt);
                    set_move_toward_entity(world, e, gt.deposit_entity);
                }
            }

            GatherState::ReturningToDeposit => {
                // Check if CC is still alive
                if !world.is_alive(gt.deposit_entity) {
                    world.gather_target[i] = None;
                    world.move_target[i] = None;
                    continue;
                }

                let cc_pos = match world.position[gt.deposit_entity as usize] {
                    Some(p) => p,
                    None => {
                        world.gather_target[i] = None;
                        world.move_target[i] = None;
                        continue;
                    }
                };

                // Within 3 tiles?
                let dist_sq = worker_pos.distance_squared_to(&cc_pos);
                let threshold = Fixed::from_int(3) * Fixed::from_int(3); // 9
                if dist_sq <= threshold {
                    // Deposit resources
                    if let Some(carry) = &world.resource_carry[i] {
                        let team = world.team[i];
                        if let Some(team_id) = team {
                            if let Some(res) = player_resources.get_mut(team_id.0 as usize) {
                                *res += carry.amount as u32;
                            }
                        }
                        world.resource_carry[i] = Some(ResourceCarry {
                            amount: 0,
                            capacity: carry.capacity,
                        });
                    }

                    // Auto-re-gather: check if the node is still alive
                    if world.is_alive(gt.node_entity) {
                        let mut new_gt = gt;
                        new_gt.state = GatherState::MovingToNode;
                        world.gather_target[i] = Some(new_gt);
                        set_move_toward_entity(world, e, gt.node_entity);
                    } else {
                        world.gather_target[i] = None;
                        world.move_target[i] = None;
                    }
                }
            }
        }
    }
}

/// Set move_target for `mover` toward `target_entity`'s position.
fn set_move_toward_entity(world: &mut World, mover: u32, target_entity: u32) {
    if let Some(pos) = world.position[target_entity as usize] {
        world.move_target[mover as usize] = Some(MoveTarget::new(
            pos.x + Fixed::HALF,
            pos.y + Fixed::HALF,
        ));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config;
    use crate::ecs::World;
    use crate::map::TerrainMap;

    /// Helper: set up a minimal world with a worker, a resource node, and a CC.
    /// Returns (worker_entity, node_entity, cc_entity).
    fn setup_gather_world() -> (World, u32, u32, u32) {
        let mut world = World::new();

        // Spawn CC at (5, 5)
        let cc = world.spawn();
        world.position[cc as usize] = Some(Position::from_ints(5, 5));
        world.team[cc as usize] = Some(TeamId::PLAYER_0);
        world.building_type[cc as usize] = Some(BuildingType::CommandCenter);
        world.health[cc as usize] = Some(Health::new(1500, 2));

        // Spawn resource node at (10, 5)
        let node = world.spawn();
        world.position[node as usize] = Some(Position::from_ints(10, 5));
        world.resource_node[node as usize] = Some(ResourceNode {
            remaining: 100,
            gather_rate: config::GATHER_RATE_PER_TICK as u16,
        });

        // Spawn worker right next to node at (10, 6) — within 2 tiles
        let worker = world.spawn();
        world.position[worker as usize] = Some(Position::from_ints(10, 6));
        world.team[worker as usize] = Some(TeamId::PLAYER_0);
        world.unit_type[worker as usize] = Some(UnitType::Worker);
        world.resource_carry[worker as usize] =
            Some(ResourceCarry::new(config::WORKER_CARRY_CAPACITY));
        world.velocity[worker as usize] = Some(Velocity::default());

        (world, worker, node, cc)
    }

    #[test]
    fn test_worker_gathers_ore_and_deposits() {
        let (mut world, worker, node, cc) = setup_gather_world();
        let map = TerrainMap::new(64, 64);
        let mut player_resources = vec![0u32; 2];

        // Set up gather target: worker is already near node, start in MovingToNode
        world.gather_target[worker as usize] = Some(GatherTarget {
            node_entity: node,
            deposit_entity: cc,
            state: GatherState::MovingToNode,
        });

        // Tick 1: should transition from MovingToNode to Gathering (worker is within 2 tiles)
        resource_system(&mut world, &map, &mut player_resources);
        let gt = world.gather_target[worker as usize].unwrap();
        assert_eq!(gt.state, GatherState::Gathering);

        // Gather for WORKER_CARRY_CAPACITY ticks to fill up
        for _ in 0..config::WORKER_CARRY_CAPACITY {
            resource_system(&mut world, &map, &mut player_resources);
        }

        // Worker should now be ReturningToDeposit
        let gt = world.gather_target[worker as usize].unwrap();
        assert_eq!(gt.state, GatherState::ReturningToDeposit);
        let carry = world.resource_carry[worker as usize].unwrap();
        assert_eq!(carry.amount, config::WORKER_CARRY_CAPACITY);

        // Move worker next to CC
        world.position[worker as usize] = Some(Position::from_ints(5, 6));

        // Tick: should deposit and switch back to MovingToNode
        resource_system(&mut world, &map, &mut player_resources);
        assert_eq!(player_resources[0], config::WORKER_CARRY_CAPACITY as u32);

        let carry = world.resource_carry[worker as usize].unwrap();
        assert_eq!(carry.amount, 0);
    }

    #[test]
    fn test_worker_auto_re_gathers_after_depositing() {
        let (mut world, worker, node, cc) = setup_gather_world();
        let map = TerrainMap::new(64, 64);
        let mut player_resources = vec![0u32; 2];

        // Start worker near the node, gathering
        world.gather_target[worker as usize] = Some(GatherTarget {
            node_entity: node,
            deposit_entity: cc,
            state: GatherState::MovingToNode,
        });

        // Transition to gathering
        resource_system(&mut world, &map, &mut player_resources);
        assert_eq!(
            world.gather_target[worker as usize].unwrap().state,
            GatherState::Gathering
        );

        // Fill worker carry
        for _ in 0..config::WORKER_CARRY_CAPACITY {
            resource_system(&mut world, &map, &mut player_resources);
        }
        assert_eq!(
            world.gather_target[worker as usize].unwrap().state,
            GatherState::ReturningToDeposit
        );

        // Teleport to CC
        world.position[worker as usize] = Some(Position::from_ints(5, 6));
        resource_system(&mut world, &map, &mut player_resources);

        // Should auto-re-gather: state is MovingToNode again
        let gt = world.gather_target[worker as usize].unwrap();
        assert_eq!(gt.state, GatherState::MovingToNode);
        assert!(world.move_target[worker as usize].is_some());

        // Resources deposited
        assert_eq!(player_resources[0], config::WORKER_CARRY_CAPACITY as u32);
    }

    #[test]
    fn test_node_depleted_despawns() {
        let (mut world, worker, node, cc) = setup_gather_world();
        let map = TerrainMap::new(64, 64);
        let mut player_resources = vec![0u32; 2];

        // Set node to only 10 remaining
        world.resource_node[node as usize] = Some(ResourceNode {
            remaining: 10,
            gather_rate: 1,
        });

        world.gather_target[worker as usize] = Some(GatherTarget {
            node_entity: node,
            deposit_entity: cc,
            state: GatherState::MovingToNode,
        });

        // Transition to gathering
        resource_system(&mut world, &map, &mut player_resources);

        // Gather 10 ticks — should deplete
        for _ in 0..10 {
            resource_system(&mut world, &map, &mut player_resources);
        }

        // Node should be despawned
        assert!(!world.is_alive(node));

        // Worker should be heading to deposit
        let gt = world.gather_target[worker as usize].unwrap();
        assert_eq!(gt.state, GatherState::ReturningToDeposit);
        assert_eq!(world.resource_carry[worker as usize].unwrap().amount, 10);
    }

    #[test]
    fn test_find_nearest_cc() {
        let (world, worker, _node, cc) = setup_gather_world();
        let found = find_nearest_cc(&world, worker, TeamId::PLAYER_0);
        assert_eq!(found, Some(cc));

        // No CC for player 1
        let found = find_nearest_cc(&world, worker, TeamId::PLAYER_1);
        assert_eq!(found, None);
    }

    #[test]
    fn test_cancel_on_cc_destroyed() {
        let (mut world, worker, node, cc) = setup_gather_world();
        let map = TerrainMap::new(64, 64);
        let mut player_resources = vec![0u32; 2];

        // Put worker in ReturningToDeposit near CC
        world.position[worker as usize] = Some(Position::from_ints(5, 6));
        world.gather_target[worker as usize] = Some(GatherTarget {
            node_entity: node,
            deposit_entity: cc,
            state: GatherState::ReturningToDeposit,
        });

        // Destroy CC
        world.despawn(cc);

        resource_system(&mut world, &map, &mut player_resources);

        // Should cancel gather
        assert!(world.gather_target[worker as usize].is_none());
    }
}
