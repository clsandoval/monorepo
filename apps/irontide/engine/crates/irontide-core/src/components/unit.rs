use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum UnitType {
    Worker,
    Rifleman,
    Tank,
}

impl UnitType {
    pub fn sprite_id(self) -> u16 {
        match self {
            UnitType::Worker => 0,
            UnitType::Rifleman => 1,
            UnitType::Tank => 2,
        }
    }

    /// Returns true if this unit type can engage in combat.
    pub fn is_combat(self) -> bool {
        match self {
            UnitType::Worker => false,
            UnitType::Rifleman | UnitType::Tank => true,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TeamId(pub u8);

impl TeamId {
    pub const PLAYER_0: Self = TeamId(0);
    pub const PLAYER_1: Self = TeamId(1);
}
