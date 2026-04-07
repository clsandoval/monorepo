use crate::math::Fixed;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize)]
pub struct Position {
    pub x: Fixed,
    pub y: Fixed,
}

impl Position {
    pub fn new(x: Fixed, y: Fixed) -> Self {
        Position { x, y }
    }

    pub fn from_ints(x: i32, y: i32) -> Self {
        Position {
            x: Fixed::from_int(x),
            y: Fixed::from_int(y),
        }
    }

    pub fn distance_squared_to(&self, other: &Position) -> Fixed {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        Fixed::distance_squared(dx, dy)
    }

    pub fn tile_x(&self) -> i32 {
        self.x.floor_int()
    }

    pub fn tile_y(&self) -> i32 {
        self.y.floor_int()
    }
}

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize)]
pub struct Velocity {
    pub dx: Fixed,
    pub dy: Fixed,
}
