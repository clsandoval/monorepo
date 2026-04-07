use crate::components::*;

pub type Entity = u32;

/// Dense SoA (struct-of-arrays) ECS world. Each component type is a named field.
/// Not generic — this is intentional for determinism and simplicity.
pub struct World {
    pub next_entity: Entity,
    pub free_list: Vec<Entity>,
    pub alive: Vec<bool>,

    // Transform
    pub position: Vec<Option<Position>>,
    pub velocity: Vec<Option<Velocity>>,

    // Combat
    pub health: Vec<Option<Health>>,
    pub attack_stats: Vec<Option<AttackStats>>,
    pub attack_target: Vec<Option<AttackTarget>>,

    // Identity
    pub unit_type: Vec<Option<UnitType>>,
    pub team: Vec<Option<TeamId>>,

    // Movement
    pub move_target: Vec<Option<MoveTarget>>,
    pub speed: Vec<Option<Speed>>,

    // Resources
    pub resource_carry: Vec<Option<ResourceCarry>>,
    pub resource_node: Vec<Option<ResourceNode>>,

    // Buildings
    pub build_progress: Vec<Option<BuildProgress>>,
    pub production_queue: Vec<Option<ProductionQueue>>,
    pub building_type: Vec<Option<BuildingType>>,

    // Gathering
    pub gather_target: Vec<Option<GatherTarget>>,

    // Rendering hint
    pub sprite_id: Vec<Option<u16>>,
}

impl World {
    pub fn new() -> Self {
        World {
            next_entity: 0,
            free_list: Vec::new(),
            alive: Vec::new(),
            position: Vec::new(),
            velocity: Vec::new(),
            health: Vec::new(),
            attack_stats: Vec::new(),
            attack_target: Vec::new(),
            unit_type: Vec::new(),
            team: Vec::new(),
            move_target: Vec::new(),
            speed: Vec::new(),
            resource_carry: Vec::new(),
            resource_node: Vec::new(),
            build_progress: Vec::new(),
            production_queue: Vec::new(),
            building_type: Vec::new(),
            gather_target: Vec::new(),
            sprite_id: Vec::new(),
        }
    }

    pub fn spawn(&mut self) -> Entity {
        if let Some(id) = self.free_list.pop() {
            self.alive[id as usize] = true;
            self.clear_components(id);
            id
        } else {
            let id = self.next_entity;
            self.next_entity += 1;
            self.alive.push(true);
            self.position.push(None);
            self.velocity.push(None);
            self.health.push(None);
            self.attack_stats.push(None);
            self.attack_target.push(None);
            self.unit_type.push(None);
            self.team.push(None);
            self.move_target.push(None);
            self.speed.push(None);
            self.resource_carry.push(None);
            self.resource_node.push(None);
            self.build_progress.push(None);
            self.production_queue.push(None);
            self.building_type.push(None);
            self.gather_target.push(None);
            self.sprite_id.push(None);
            id
        }
    }

    pub fn despawn(&mut self, entity: Entity) {
        let i = entity as usize;
        if i < self.alive.len() && self.alive[i] {
            self.alive[i] = false;
            self.clear_components(entity);
            self.free_list.push(entity);
        }
    }

    pub fn is_alive(&self, entity: Entity) -> bool {
        let i = entity as usize;
        i < self.alive.len() && self.alive[i]
    }

    fn clear_components(&mut self, entity: Entity) {
        let i = entity as usize;
        self.position[i] = None;
        self.velocity[i] = None;
        self.health[i] = None;
        self.attack_stats[i] = None;
        self.attack_target[i] = None;
        self.unit_type[i] = None;
        self.team[i] = None;
        self.move_target[i] = None;
        self.speed[i] = None;
        self.resource_carry[i] = None;
        self.resource_node[i] = None;
        self.build_progress[i] = None;
        self.production_queue[i] = None;
        self.building_type[i] = None;
        self.gather_target[i] = None;
        self.sprite_id[i] = None;
    }

    pub fn entity_count(&self) -> usize {
        self.alive.iter().filter(|&&a| a).count()
    }

    /// Iterate all alive entity IDs.
    pub fn alive_entities(&self) -> Vec<Entity> {
        (0..self.next_entity)
            .filter(|&e| self.is_alive(e))
            .collect()
    }

    /// Compute a deterministic hash of all entity state for desync detection.
    pub fn checksum(&self) -> u64 {
        let mut hash: u64 = 0xcbf29ce484222325; // FNV offset basis
        for e in 0..self.next_entity {
            let i = e as usize;
            if !self.alive[i] {
                continue;
            }
            hash = hash_mix(hash, e as u64);
            if let Some(pos) = &self.position[i] {
                hash = hash_mix(hash, pos.x.raw() as u64);
                hash = hash_mix(hash, pos.y.raw() as u64);
            }
            if let Some(h) = &self.health[i] {
                hash = hash_mix(hash, h.current as u64);
            }
            if let Some(mt) = &self.move_target[i] {
                hash = hash_mix(hash, mt.target_x.raw() as u64);
                hash = hash_mix(hash, mt.target_y.raw() as u64);
            }
        }
        hash
    }
}

fn hash_mix(hash: u64, value: u64) -> u64 {
    let mut h = hash;
    h ^= value;
    h = h.wrapping_mul(0x100000001b3); // FNV prime
    h
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::math::Fixed;

    #[test]
    fn test_spawn_despawn() {
        let mut world = World::new();
        let e0 = world.spawn();
        let e1 = world.spawn();
        assert_eq!(world.entity_count(), 2);
        world.despawn(e0);
        assert_eq!(world.entity_count(), 1);
        assert!(!world.is_alive(e0));
        assert!(world.is_alive(e1));
    }

    #[test]
    fn test_entity_reuse() {
        let mut world = World::new();
        let e0 = world.spawn();
        world.despawn(e0);
        let e2 = world.spawn();
        assert_eq!(e0, e2); // Should reuse the freed ID
    }

    #[test]
    fn test_components() {
        let mut world = World::new();
        let e = world.spawn();
        let i = e as usize;
        world.position[i] = Some(Position::from_ints(10, 20));
        world.team[i] = Some(TeamId::PLAYER_0);
        assert_eq!(world.position[i].unwrap().tile_x(), 10);
        assert_eq!(world.team[i].unwrap(), TeamId::PLAYER_0);
    }

    #[test]
    fn test_checksum_determinism() {
        let mut w1 = World::new();
        let mut w2 = World::new();
        for _ in 0..10 {
            let e1 = w1.spawn();
            let e2 = w2.spawn();
            w1.position[e1 as usize] = Some(Position::from_ints(5, 10));
            w2.position[e2 as usize] = Some(Position::from_ints(5, 10));
        }
        assert_eq!(w1.checksum(), w2.checksum());
    }
}
