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

    /// Hand-crafted 256x256 map inspired by SC2's Fighting Spirit.
    /// 180-degree rotational symmetry: tile at (x,y) == tile at (255-x, 255-y).
    /// Starting bases in opposite corners with natural chokes, water obstacles,
    /// and multiple resource clusters.
    pub fn fighting_spirit() -> Self {
        let mut map = TerrainMap::new(MAP_SIZE, MAP_SIZE);

        // Helper: place a tile and its 180-degree mirror
        let set_sym = |tiles: &mut Vec<TileType>, x: usize, y: usize, t: TileType| {
            if x < MAP_SIZE && y < MAP_SIZE {
                tiles[y * MAP_SIZE + x] = t;
                let mx = MAP_SIZE - 1 - x;
                let my = MAP_SIZE - 1 - y;
                tiles[my * MAP_SIZE + mx] = t;
            }
        };

        // Helper: place a filled circle symmetrically
        let circle_sym = |tiles: &mut Vec<TileType>, cx: usize, cy: usize, r: usize, t: TileType| {
            for dy in 0..r * 2 + 1 {
                for dx in 0..r * 2 + 1 {
                    let x = cx + dx - r;
                    let y = cy + dy - r;
                    if x < MAP_SIZE && y < MAP_SIZE {
                        let dist_sq = (dx as i32 - r as i32).pow(2) + (dy as i32 - r as i32).pow(2);
                        if dist_sq <= (r as i32 * r as i32) {
                            tiles[y * MAP_SIZE + x] = t;
                            let mx = MAP_SIZE - 1 - x;
                            let my = MAP_SIZE - 1 - y;
                            tiles[my * MAP_SIZE + mx] = t;
                        }
                    }
                }
            }
        };

        // Helper: place a rectangle symmetrically
        let rect_sym = |tiles: &mut Vec<TileType>, x0: usize, y0: usize, w: usize, h: usize, t: TileType| {
            for dy in 0..h {
                for dx in 0..w {
                    let x = x0 + dx;
                    let y = y0 + dy;
                    if x < MAP_SIZE && y < MAP_SIZE {
                        tiles[y * MAP_SIZE + x] = t;
                        let mx = MAP_SIZE - 1 - x;
                        let my = MAP_SIZE - 1 - y;
                        tiles[my * MAP_SIZE + mx] = t;
                    }
                }
            }
        };

        // ===== WATER BODIES =====
        // Large lake left of center (strategic obstacle)
        circle_sym(&mut map.tiles, 90, 100, 12, TileType::Water);
        circle_sym(&mut map.tiles, 85, 110, 8, TileType::Water);

        // Medium lake near top-right (forces pathing around)
        circle_sym(&mut map.tiles, 190, 60, 10, TileType::Water);

        // Small ponds near natural expansions
        circle_sym(&mut map.tiles, 55, 55, 5, TileType::Water);

        // ===== ROCK FORMATIONS (chokes and walls) =====

        // Main base choke: rock wall south of P0 base with a narrow gap
        // Wall runs from x=2 to x=35, at y=28..32, with a gap at x=18..22
        rect_sym(&mut map.tiles, 2, 28, 16, 4, TileType::Rock);   // left section
        rect_sym(&mut map.tiles, 23, 28, 13, 4, TileType::Rock);  // right section

        // Natural expansion choke: rocks forming a passage near (50, 40)
        rect_sym(&mut map.tiles, 38, 36, 5, 8, TileType::Rock);
        rect_sym(&mut map.tiles, 50, 36, 5, 8, TileType::Rock);

        // Ridge along the diagonal (creates interesting center terrain)
        for i in 0..20 {
            let x = 105 + i;
            let y = 105 + i;
            rect_sym(&mut map.tiles, x, y, 3, 2, TileType::Rock);
        }

        // Scattered rock clusters for cover in mid-map
        rect_sym(&mut map.tiles, 70, 75, 4, 4, TileType::Rock);
        rect_sym(&mut map.tiles, 115, 85, 3, 5, TileType::Rock);

        // Rock formations along edges to funnel movement
        rect_sym(&mut map.tiles, 0, 50, 3, 20, TileType::Rock);
        rect_sym(&mut map.tiles, 60, 0, 20, 3, TileType::Rock);

        // Additional choke rocks near third base location
        rect_sym(&mut map.tiles, 68, 25, 4, 6, TileType::Rock);
        rect_sym(&mut map.tiles, 78, 22, 4, 6, TileType::Rock);

        // ===== RESOURCE CLUSTERS =====

        // Safe main base minerals (P0 near (7,7), close by for workers)
        // Cluster of 4 resource tiles near starting CC
        set_sym(&mut map.tiles, 3, 3, TileType::Resource);
        set_sym(&mut map.tiles, 4, 3, TileType::Resource);
        set_sym(&mut map.tiles, 3, 4, TileType::Resource);
        set_sym(&mut map.tiles, 22, 5, TileType::Resource);

        // Natural expansion resources (behind the first choke, semi-exposed)
        set_sym(&mut map.tiles, 44, 40, TileType::Resource);
        set_sym(&mut map.tiles, 45, 40, TileType::Resource);
        set_sym(&mut map.tiles, 44, 41, TileType::Resource);

        // Third base resources (more exposed, near edge)
        set_sym(&mut map.tiles, 73, 15, TileType::Resource);
        set_sym(&mut map.tiles, 74, 15, TileType::Resource);

        // Contested center resources (high risk, high reward)
        // These are placed on the symmetry line so they don't double-count
        // Place them slightly off-center so each side gets one set
        set_sym(&mut map.tiles, 120, 115, TileType::Resource);
        set_sym(&mut map.tiles, 121, 116, TileType::Resource);

        // Far gold base (very exposed, high value position)
        set_sym(&mut map.tiles, 30, 70, TileType::Resource);
        set_sym(&mut map.tiles, 31, 70, TileType::Resource);

        // ===== ENSURE STARTING AREAS ARE CLEAR =====
        // P0: clear 18x18 around the base (covers 2..20)
        // P1: automatically cleared by symmetry
        for y in 2..22 {
            for x in 2..22 {
                let idx = y * MAP_SIZE + x;
                if map.tiles[idx] == TileType::Water || map.tiles[idx] == TileType::Rock {
                    map.tiles[idx] = TileType::Ground;
                }
                // Mirror
                let mx = MAP_SIZE - 1 - x;
                let my = MAP_SIZE - 1 - y;
                let midx = my * MAP_SIZE + mx;
                if map.tiles[midx] == TileType::Water || map.tiles[midx] == TileType::Rock {
                    map.tiles[midx] = TileType::Ground;
                }
            }
        }

        // Re-place resources that may have been cleared (only the ones inside starting area)
        set_sym(&mut map.tiles, 3, 3, TileType::Resource);
        set_sym(&mut map.tiles, 4, 3, TileType::Resource);
        set_sym(&mut map.tiles, 3, 4, TileType::Resource);

        map
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

    #[test]
    fn test_handcrafted_map_symmetric() {
        let map = TerrainMap::fighting_spirit();
        for y in 0..MAP_SIZE {
            for x in 0..MAP_SIZE {
                let tile = map.tiles[y * MAP_SIZE + x];
                let mx = MAP_SIZE - 1 - x;
                let my = MAP_SIZE - 1 - y;
                let mirror_tile = map.tiles[my * MAP_SIZE + mx];
                assert_eq!(
                    tile, mirror_tile,
                    "Symmetry broken at ({},{}) vs ({},{}): {:?} != {:?}",
                    x, y, mx, my, tile, mirror_tile
                );
            }
        }
    }

    #[test]
    fn test_handcrafted_map_starting_areas_clear() {
        let map = TerrainMap::fighting_spirit();
        // P0 starting area around (5..20, 5..20)
        for y in 5..20 {
            for x in 5..20 {
                assert!(
                    map.is_passable(x as i32, y as i32),
                    "P0 starting area tile ({},{}) should be passable", x, y
                );
            }
        }
        // P1 starting area (mirrored)
        for y in (MAP_SIZE - 20)..(MAP_SIZE - 5) {
            for x in (MAP_SIZE - 20)..(MAP_SIZE - 5) {
                assert!(
                    map.is_passable(x as i32, y as i32),
                    "P1 starting area tile ({},{}) should be passable", x, y
                );
            }
        }
    }

    #[test]
    fn test_handcrafted_map_has_resources() {
        let map = TerrainMap::fighting_spirit();
        let resource_count = map.tiles.iter().filter(|t| **t == TileType::Resource).count();
        assert!(
            resource_count >= 12,
            "Expected at least 12 resource tiles, found {}", resource_count
        );
    }

    #[test]
    fn test_handcrafted_map_has_chokepoints() {
        let map = TerrainMap::fighting_spirit();
        let impassable_count = map.tiles.iter().filter(|t| !t.is_passable()).count();
        assert!(
            impassable_count >= 100,
            "Expected at least 100 impassable tiles for chokepoints, found {}", impassable_count
        );
    }
}
