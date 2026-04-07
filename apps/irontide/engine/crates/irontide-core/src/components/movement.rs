use crate::math::Fixed;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct MoveTarget {
    pub target_x: Fixed,
    pub target_y: Fixed,
}

impl MoveTarget {
    pub fn new(x: Fixed, y: Fixed) -> Self {
        MoveTarget { target_x: x, target_y: y }
    }

    pub fn from_ints(x: i32, y: i32) -> Self {
        MoveTarget {
            target_x: Fixed::from_int(x),
            target_y: Fixed::from_int(y),
        }
    }
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct Speed {
    pub value: Fixed,
}

impl Speed {
    pub fn new(value: Fixed) -> Self {
        Speed { value }
    }

    pub fn from_int(v: i32) -> Self {
        Speed { value: Fixed::from_int(v) }
    }
}
