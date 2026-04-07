use crate::map::terrain::MAP_SIZE;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Visibility {
    Unexplored = 0,
    Fog = 1,        // Previously seen but no current vision
    Visible = 2,
}

/// Per-team fog of war map.
pub struct FogMap {
    pub data: Vec<u8>, // MAP_SIZE * MAP_SIZE per team
    pub team_count: u8,
}

impl FogMap {
    pub fn new(team_count: u8) -> Self {
        FogMap {
            data: vec![0; MAP_SIZE * MAP_SIZE * team_count as usize],
            team_count,
        }
    }

    fn offset(&self, team: u8) -> usize {
        team as usize * MAP_SIZE * MAP_SIZE
    }

    pub fn get(&self, team: u8, x: i32, y: i32) -> Visibility {
        if x < 0 || y < 0 || x >= MAP_SIZE as i32 || y >= MAP_SIZE as i32 {
            return Visibility::Unexplored;
        }
        let idx = self.offset(team) + y as usize * MAP_SIZE + x as usize;
        match self.data[idx] {
            2 => Visibility::Visible,
            1 => Visibility::Fog,
            _ => Visibility::Unexplored,
        }
    }

    /// Reset all Visible tiles to Fog before recomputing vision.
    pub fn begin_frame(&mut self, team: u8) {
        let base = self.offset(team);
        for i in base..base + MAP_SIZE * MAP_SIZE {
            if self.data[i] == 2 {
                self.data[i] = 1;
            }
        }
    }

    /// Reveal a circle around a position.
    pub fn reveal(&mut self, team: u8, cx: i32, cy: i32, radius: i32) {
        let base = self.offset(team);
        let r_sq = radius * radius;
        for dy in -radius..=radius {
            for dx in -radius..=radius {
                if dx * dx + dy * dy > r_sq {
                    continue;
                }
                let x = cx + dx;
                let y = cy + dy;
                if x >= 0 && y >= 0 && x < MAP_SIZE as i32 && y < MAP_SIZE as i32 {
                    self.data[base + y as usize * MAP_SIZE + x as usize] = 2;
                }
            }
        }
    }

    /// Get the fog buffer pointer for a specific team (for WASM export).
    pub fn team_buffer(&self, team: u8) -> &[u8] {
        let base = self.offset(team);
        &self.data[base..base + MAP_SIZE * MAP_SIZE]
    }
}
