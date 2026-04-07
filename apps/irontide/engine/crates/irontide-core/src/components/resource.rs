use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct ResourceCarry {
    pub amount: u16,
    pub capacity: u16,
}

impl ResourceCarry {
    pub fn new(capacity: u16) -> Self {
        ResourceCarry { amount: 0, capacity }
    }

    pub fn is_full(&self) -> bool {
        self.amount >= self.capacity
    }
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct ResourceNode {
    pub remaining: u32,
    pub gather_rate: u16, // Per tick
}
