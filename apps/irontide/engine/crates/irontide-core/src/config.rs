use crate::components::UnitType;
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
}

pub fn unit_config(unit_type: UnitType) -> UnitConfig {
    match unit_type {
        UnitType::Harvester => UnitConfig {
            health: 100,
            armor: 0,
            speed: Fixed::from_raw(6554), // ~0.1 tiles/tick = 3 tiles/sec
            damage: 0,
            attack_range: 0,
            attack_cooldown: 0,
            vision_range: 6,
            build_cost: 50,
            build_time_ticks: 60, // 2 seconds
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
        },
        UnitType::Builder => UnitConfig {
            health: 60,
            armor: 0,
            speed: Fixed::from_raw(6554),
            damage: 0,
            attack_range: 0,
            attack_cooldown: 0,
            vision_range: 5,
            build_cost: 100,
            build_time_ticks: 30,
        },
    }
}

pub const STARTING_RESOURCES: u32 = 500;
pub const TICKS_PER_SECOND: u32 = 30;
