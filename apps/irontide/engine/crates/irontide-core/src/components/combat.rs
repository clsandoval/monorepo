use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct Health {
    pub current: u16,
    pub max: u16,
    pub armor: u8,
}

impl Health {
    pub fn new(max: u16, armor: u8) -> Self {
        Health { current: max, max, armor }
    }

    pub fn is_dead(&self) -> bool {
        self.current == 0
    }

    pub fn apply_damage(&mut self, raw_damage: u16) {
        let reduced = raw_damage.saturating_sub(self.armor as u16);
        let actual = reduced.max(1); // Always deal at least 1 damage
        self.current = self.current.saturating_sub(actual);
    }
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct AttackStats {
    pub damage: u16,
    pub range_squared: u32, // In fixed-point squared units
    pub cooldown_ticks: u16,
    pub current_cooldown: u16,
}

impl AttackStats {
    pub fn new(damage: u16, range: u16, cooldown_ticks: u16) -> Self {
        AttackStats {
            damage,
            range_squared: (range as u32) * (range as u32),
            cooldown_ticks,
            current_cooldown: 0,
        }
    }

    pub fn is_ready(&self) -> bool {
        self.current_cooldown == 0
    }

    pub fn fire(&mut self) {
        self.current_cooldown = self.cooldown_ticks;
    }

    pub fn tick_cooldown(&mut self) {
        self.current_cooldown = self.current_cooldown.saturating_sub(1);
    }
}

pub type Entity = u32;

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct AttackTarget {
    pub target: Entity,
}
