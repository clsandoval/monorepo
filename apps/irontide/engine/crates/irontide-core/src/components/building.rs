use crate::components::unit::UnitType;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum BuildingType {
    CommandCenter,
    Barracks,
    Refinery,
    Turret,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BuildProgress {
    pub building_type: BuildingType,
    pub ticks_remaining: u16,
    pub total_ticks: u16,
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
