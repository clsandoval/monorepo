use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum UnitType {
    Harvester,
    Rifleman,
    Tank,
    Builder,
}

impl UnitType {
    pub fn sprite_id(self) -> u16 {
        match self {
            UnitType::Harvester => 0,
            UnitType::Rifleman => 1,
            UnitType::Tank => 2,
            UnitType::Builder => 3,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TeamId(pub u8);

impl TeamId {
    pub const PLAYER_0: Self = TeamId(0);
    pub const PLAYER_1: Self = TeamId(1);
}
