use crate::components::unit::UnitType;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum BuildingType {
    CommandCenter,
    Barracks,
    Turret,
}

impl BuildingType {
    /// Returns the unit types this building can train.
    pub fn trainable_units(self) -> &'static [UnitType] {
        match self {
            BuildingType::CommandCenter => &[UnitType::Worker],
            BuildingType::Barracks => &[UnitType::Rifleman, UnitType::Tank],
            BuildingType::Turret => &[],
        }
    }

    /// Returns the tile size (width, height) for this building type.
    pub fn tile_size(self) -> (u8, u8) {
        match self {
            BuildingType::CommandCenter => (3, 3),
            BuildingType::Barracks => (3, 3),
            BuildingType::Turret => (1, 1),
        }
    }

    /// Returns the sprite ID for this building type.
    /// Building sprite IDs start at 100 to avoid collision with unit sprite IDs.
    pub fn sprite_id(self) -> u16 {
        match self {
            BuildingType::CommandCenter => 100,
            BuildingType::Barracks => 101,
            BuildingType::Turret => 102,
        }
    }

    /// Returns the vision range for this building type.
    pub fn vision_range(self) -> i32 {
        match self {
            BuildingType::CommandCenter => 10,
            BuildingType::Barracks => 8,
            BuildingType::Turret => 7,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BuildProgress {
    pub building_type: BuildingType,
    pub ticks_remaining: u16,
    pub total_ticks: u16,
}

impl BuildProgress {
    /// Returns the fraction of build progress completed (0.0 to 1.0).
    pub fn progress_fraction(&self) -> f32 {
        if self.total_ticks == 0 {
            return 1.0;
        }
        1.0 - (self.ticks_remaining as f32 / self.total_ticks as f32)
    }

    /// Returns true if construction is complete.
    pub fn is_complete(&self) -> bool {
        self.ticks_remaining == 0
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProductionQueue {
    pub queue: Vec<UnitType>,
    pub ticks_remaining: u16,
}

impl ProductionQueue {
    pub fn new() -> Self {
        ProductionQueue {
            queue: Vec::new(),
            ticks_remaining: 0,
        }
    }
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct BuildTarget {
    pub building_entity: u32,
}
