use crate::map::terrain::TerrainMap;
use std::collections::BinaryHeap;
use std::cmp::Reverse;

/// A* pathfinding for Phase 1 (upgrade to flowfield in Phase 2).
/// Returns a list of (x, y) tile coordinates from start to goal.
pub fn astar(map: &TerrainMap, sx: i32, sy: i32, gx: i32, gy: i32) -> Option<Vec<(i32, i32)>> {
    if !map.is_passable(gx, gy) {
        return None;
    }

    let w = map.width as i32;
    let h = map.height as i32;
    let size = (w * h) as usize;

    let idx = |x: i32, y: i32| -> usize { (y * w + x) as usize };

    let mut g_score = vec![u32::MAX; size];
    let mut came_from = vec![u32::MAX; size]; // Encoded as y*w+x or MAX
    let mut closed = vec![false; size];

    let start_idx = idx(sx, sy);
    g_score[start_idx] = 0;

    // Priority queue: (f_score, x, y)
    let mut open: BinaryHeap<Reverse<(u32, i32, i32)>> = BinaryHeap::new();
    let heuristic = |x: i32, y: i32| -> u32 {
        ((x - gx).unsigned_abs() + (y - gy).unsigned_abs()) as u32
    };
    open.push(Reverse((heuristic(sx, sy), sx, sy)));

    let neighbors: [(i32, i32); 8] = [
        (-1, 0), (1, 0), (0, -1), (0, 1),
        (-1, -1), (-1, 1), (1, -1), (1, 1),
    ];

    let mut iterations = 0u32;
    let max_iterations = 50_000u32; // Safety limit

    while let Some(Reverse((_f, cx, cy))) = open.pop() {
        iterations += 1;
        if iterations > max_iterations {
            return None; // Path too complex
        }

        if cx == gx && cy == gy {
            // Reconstruct path
            let mut path = Vec::new();
            let mut cur = idx(gx, gy);
            while cur != start_idx {
                let y = (cur / w as usize) as i32;
                let x = (cur % w as usize) as i32;
                path.push((x, y));
                cur = came_from[cur] as usize;
                if cur == u32::MAX as usize {
                    return None; // Broken chain
                }
            }
            path.push((sx, sy));
            path.reverse();
            return Some(path);
        }

        let ci = idx(cx, cy);
        if closed[ci] {
            continue;
        }
        closed[ci] = true;

        for &(dx, dy) in &neighbors {
            let nx = cx + dx;
            let ny = cy + dy;
            if nx < 0 || ny < 0 || nx >= w || ny >= h {
                continue;
            }
            if !map.is_passable(nx, ny) {
                continue;
            }

            // Diagonal movement check: prevent cutting corners
            if dx != 0 && dy != 0 {
                if !map.is_passable(cx + dx, cy) || !map.is_passable(cx, cy + dy) {
                    continue;
                }
            }

            let ni = idx(nx, ny);
            if closed[ni] {
                continue;
            }

            let move_cost = if dx != 0 && dy != 0 { 14 } else { 10 }; // ~sqrt(2)*10, 1*10
            let new_g = g_score[ci] + move_cost;

            if new_g < g_score[ni] {
                g_score[ni] = new_g;
                came_from[ni] = ci as u32;
                let f = new_g + heuristic(nx, ny) * 10;
                open.push(Reverse((f, nx, ny)));
            }
        }
    }

    None // No path found
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::map::terrain::TerrainMap;

    #[test]
    fn test_simple_path() {
        let map = TerrainMap::new(32, 32);
        let path = astar(&map, 0, 0, 5, 5);
        assert!(path.is_some());
        let path = path.unwrap();
        assert_eq!(path[0], (0, 0));
        assert_eq!(*path.last().unwrap(), (5, 5));
    }

    #[test]
    fn test_blocked_goal() {
        let mut map = TerrainMap::new(32, 32);
        map.tiles[5 * 32 + 5] = crate::map::terrain::TileType::Rock;
        let path = astar(&map, 0, 0, 5, 5);
        assert!(path.is_none());
    }

    #[test]
    fn test_path_around_obstacle() {
        let mut map = TerrainMap::new(32, 32);
        // Create a wall from (3,0) to (3,8)
        for y in 0..9 {
            map.tiles[y * 32 + 3] = crate::map::terrain::TileType::Rock;
        }
        let path = astar(&map, 0, 4, 6, 4);
        assert!(path.is_some());
        let path = path.unwrap();
        // Path should go around the wall
        assert_eq!(*path.last().unwrap(), (6, 4));
        // All tiles in path should be passable
        for &(x, y) in &path {
            assert!(map.is_passable(x, y), "Path tile ({},{}) should be passable", x, y);
        }
    }
}
