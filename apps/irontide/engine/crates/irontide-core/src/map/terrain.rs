use crate::rng::DeterministicRng;
use serde::{Deserialize, Serialize};

pub const MAP_SIZE: usize = 256;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum TileType {
    Ground,
    Water,
    Rock,      // Impassable terrain
    Resource,  // Resource node location
}

impl TileType {
    pub fn is_passable(self) -> bool {
        matches!(self, TileType::Ground | TileType::Resource)
    }

    pub fn movement_cost(self) -> u8 {
        match self {
            TileType::Ground => 1,
            TileType::Resource => 1,
            TileType::Water => 255,
            TileType::Rock => 255,
        }
    }
}

#[derive(Clone)]
pub struct TerrainMap {
    pub tiles: Vec<TileType>,
    pub width: usize,
    pub height: usize,
    /// Dynamic cost overlay — buildings mark tiles as impassable (255).
    pub blocked: Vec<bool>,
}

impl TerrainMap {
    pub fn new(width: usize, height: usize) -> Self {
        TerrainMap {
            tiles: vec![TileType::Ground; width * height],
            width,
            height,
            blocked: vec![false; width * height],
        }
    }

    /// Generate a playable map from a seed. Deterministic.
    pub fn generate(seed: u64) -> Self {
        let mut rng = DeterministicRng::new(seed);
        let mut map = TerrainMap::new(MAP_SIZE, MAP_SIZE);

        // Scatter some water bodies
        for _ in 0..8 {
            let cx = rng.next_bounded(MAP_SIZE as u32) as usize;
            let cy = rng.next_bounded(MAP_SIZE as u32) as usize;
            let radius = 3 + rng.next_bounded(6) as usize;
            for dy in 0..radius * 2 {
                for dx in 0..radius * 2 {
                    let x = (cx + dx).wrapping_sub(radius);
                    let y = (cy + dy).wrapping_sub(radius);
                    if x < MAP_SIZE && y < MAP_SIZE {
                        let dist_sq = (dx as i32 - radius as i32).pow(2)
                            + (dy as i32 - radius as i32).pow(2);
                        if dist_sq < (radius as i32 * radius as i32) {
                            map.tiles[y * MAP_SIZE + x] = TileType::Water;
                        }
                    }
                }
            }
        }

        // Scatter rock formations
        for _ in 0..12 {
            let cx = rng.next_bounded(MAP_SIZE as u32) as usize;
            let cy = rng.next_bounded(MAP_SIZE as u32) as usize;
            let size = 2 + rng.next_bounded(3) as usize;
            for dy in 0..size {
                for dx in 0..size {
                    let x = cx + dx;
                    let y = cy + dy;
                    if x < MAP_SIZE && y < MAP_SIZE {
                        map.tiles[y * MAP_SIZE + x] = TileType::Rock;
                    }
                }
            }
        }

        // Place resource nodes (mirrored for fairness)
        for _ in 0..6 {
            let x = rng.next_bounded((MAP_SIZE / 2) as u32) as usize;
            let y = rng.next_bounded(MAP_SIZE as u32) as usize;
            if x < MAP_SIZE && y < MAP_SIZE {
                map.tiles[y * MAP_SIZE + x] = TileType::Resource;
                // Mirror for player 2
                let mx = MAP_SIZE - 1 - x;
                let my = MAP_SIZE - 1 - y;
                map.tiles[my * MAP_SIZE + mx] = TileType::Resource;
            }
        }

        // Ensure starting areas are clear (corners)
        map.clear_area(5, 5, 10);
        map.clear_area(MAP_SIZE - 15, MAP_SIZE - 15, 10);

        map
    }

    fn clear_area(&mut self, sx: usize, sy: usize, size: usize) {
        for dy in 0..size {
            for dx in 0..size {
                let x = sx + dx;
                let y = sy + dy;
                if x < self.width && y < self.height {
                    self.tiles[y * self.width + x] = TileType::Ground;
                    self.blocked[y * self.width + x] = false;
                }
            }
        }
    }

    pub fn get_tile(&self, x: i32, y: i32) -> TileType {
        if x < 0 || y < 0 || x >= self.width as i32 || y >= self.height as i32 {
            return TileType::Rock; // Out of bounds is impassable
        }
        self.tiles[y as usize * self.width + x as usize]
    }

    pub fn is_passable(&self, x: i32, y: i32) -> bool {
        if x < 0 || y < 0 || x >= self.width as i32 || y >= self.height as i32 {
            return false;
        }
        let idx = y as usize * self.width + x as usize;
        self.tiles[idx].is_passable() && !self.blocked[idx]
    }

    pub fn set_blocked(&mut self, x: usize, y: usize, blocked: bool) {
        if x < self.width && y < self.height {
            self.blocked[y * self.width + x] = blocked;
        }
    }

    pub fn movement_cost(&self, x: i32, y: i32) -> u8 {
        if !self.is_passable(x, y) {
            return 255;
        }
        self.get_tile(x, y).movement_cost()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_map_generation_deterministic() {
        let m1 = TerrainMap::generate(42);
        let m2 = TerrainMap::generate(42);
        assert_eq!(m1.tiles, m2.tiles);
    }

    #[test]
    fn test_starting_areas_clear() {
        let map = TerrainMap::generate(42);
        // Top-left starting area should be passable
        for y in 5..15 {
            for x in 5..15 {
                assert!(map.is_passable(x as i32, y as i32),
                    "Starting area tile ({},{}) should be passable", x, y);
            }
        }
    }

    #[test]
    fn test_out_of_bounds() {
        let map = TerrainMap::new(256, 256);
        assert!(!map.is_passable(-1, 0));
        assert!(!map.is_passable(256, 0));
        assert_eq!(map.get_tile(-1, 0), TileType::Rock);
    }
}
