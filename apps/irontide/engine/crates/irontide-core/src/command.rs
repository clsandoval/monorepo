use crate::components::{BuildingType, UnitType};
use crate::ecs::Entity;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum PlayerCommand {
    Move {
        unit_ids: Vec<Entity>,
        target_x: i32,
        target_y: i32,
    },
    AttackMove {
        unit_ids: Vec<Entity>,
        target_x: i32,
        target_y: i32,
    },
    Attack {
        unit_ids: Vec<Entity>,
        target: Entity,
    },
    Build {
        builder: Entity,
        building_type: BuildingType,
        x: i32,
        y: i32,
    },
    Train {
        building: Entity,
        unit_type: UnitType,
    },
    Stop {
        unit_ids: Vec<Entity>,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TurnCommands {
    pub tick: u32,
    pub player_id: u8,
    pub commands: Vec<PlayerCommand>,
    pub checksum: Option<u64>,
}
