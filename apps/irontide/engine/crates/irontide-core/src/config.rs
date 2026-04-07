use crate::components::{BuildingType, UnitType};
use crate::math::Fixed;

/// Static balance data for all unit types.
pub struct UnitConfig {
    pub health: u16,
    pub armor: u8,
    pub speed: Fixed,
    pub damage: u16,
    pub attack_range: u16,
    pub attack_cooldown: u16,
    pub vision_range: i32,
    pub build_cost: u32,
    pub build_time_ticks: u16,
    pub supply_cost: u8,
}

pub fn unit_config(unit_type: UnitType) -> UnitConfig {
    match unit_type {
        UnitType::Worker => UnitConfig {
            health: 80,
            armor: 0,
            speed: Fixed::from_raw(6554), // ~0.1 tiles/tick = 3 tiles/sec
            damage: 0,
            attack_range: 0,
            attack_cooldown: 0,
            vision_range: 6,
            build_cost: 50,
            build_time_ticks: 60, // 2 seconds
            supply_cost: 1,
        },
        UnitType::Rifleman => UnitConfig {
            health: 80,
            armor: 1,
            speed: Fixed::from_raw(8192), // ~0.125 tiles/tick
            damage: 12,
            attack_range: 5,
            attack_cooldown: 15, // 0.5 sec
            vision_range: 8,
            build_cost: 75,
            build_time_ticks: 45,
            supply_cost: 1,
        },
        UnitType::Tank => UnitConfig {
            health: 250,
            armor: 5,
            speed: Fixed::from_raw(4915), // ~0.075 tiles/tick (slow)
            damage: 35,
            attack_range: 6,
            attack_cooldown: 45, // 1.5 sec
            vision_range: 7,
            build_cost: 200,
            build_time_ticks: 120,
            supply_cost: 3,
        },
    }
}

/// Static balance data for all building types.
pub struct BuildingConfig {
    pub health: u16,
    pub armor: u8,
    pub build_cost: u32,
    pub build_time_ticks: u16,
    pub supply_provided: u8,
}

pub fn building_config(building_type: BuildingType) -> BuildingConfig {
    match building_type {
        BuildingType::CommandCenter => BuildingConfig {
            health: 1500,
            armor: 2,
            build_cost: 400,
            build_time_ticks: 300, // 10 seconds
            supply_provided: 15,
        },
        BuildingType::Barracks => BuildingConfig {
            health: 800,
            armor: 1,
            build_cost: 150,
            build_time_ticks: 150, // 5 seconds
            supply_provided: 0,
        },
        BuildingType::Turret => BuildingConfig {
            health: 500,
            armor: 3,
            build_cost: 100,
            build_time_ticks: 90, // 3 seconds
            supply_provided: 0,
        },
    }
}

// Turret combat stats
pub const TURRET_DAMAGE: u16 = 20;
pub const TURRET_RANGE: u16 = 7;
pub const TURRET_ATTACK_COOLDOWN: u16 = 20;

pub const STARTING_RESOURCES: u32 = 500;
pub const TICKS_PER_SECOND: u32 = 30;
pub const STARTING_WORKERS: u8 = 4;
pub const SUPPLY_PER_CC: u8 = 15;
pub const GATHER_RATE_PER_TICK: u32 = 1;
pub const WORKER_CARRY_CAPACITY: u16 = 50;
pub const ORE_NODE_STARTING_AMOUNT: u32 = 1500;
