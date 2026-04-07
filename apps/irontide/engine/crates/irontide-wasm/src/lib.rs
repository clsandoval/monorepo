use wasm_bindgen::prelude::*;
use irontide_core::{GameState, PlayerCommand, TurnCommands};
use irontide_core::components::{UnitType, BuildingType};
use irontide_core::map::fog_map::Visibility;
use std::cell::RefCell;

thread_local! {
    static GAME: RefCell<Option<GameState>> = RefCell::new(None);
}

#[wasm_bindgen]
pub fn init_game(seed: f64, map_seed: f64, player_count: u8) {
    GAME.with(|g| {
        *g.borrow_mut() = Some(GameState::new(seed as u64, map_seed as u64, player_count));
    });
}

#[wasm_bindgen]
pub fn tick(commands_json: &str) {
    GAME.with(|g| {
        let mut game = g.borrow_mut();
        let game = game.as_mut().expect("Game not initialized");
        let commands: Vec<TurnCommands> = if commands_json.is_empty() {
            Vec::new()
        } else {
            serde_json::from_str(commands_json).unwrap_or_default()
        };
        game.tick(&commands);
    });
}

#[wasm_bindgen]
pub fn fast_forward(ticks: u32) {
    GAME.with(|g| {
        let mut game = g.borrow_mut();
        let game = game.as_mut().expect("Game not initialized");
        for _ in 0..ticks {
            game.tick(&[]);
        }
    });
}

#[wasm_bindgen]
pub fn get_tick_count() -> u32 {
    GAME.with(|g| {
        g.borrow().as_ref().map(|game| game.tick).unwrap_or(0)
    })
}

#[wasm_bindgen]
pub fn get_unit_count() -> usize {
    GAME.with(|g| {
        g.borrow().as_ref().map(|game| game.unit_count()).unwrap_or(0)
    })
}

#[wasm_bindgen]
pub fn get_unit_position(entity: u32) -> JsValue {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        match game.get_unit_position(entity) {
            Some((x, y)) => {
                let obj = js_sys::Object::new();
                js_sys::Reflect::set(&obj, &"x".into(), &x.into()).unwrap();
                js_sys::Reflect::set(&obj, &"y".into(), &y.into()).unwrap();
                obj.into()
            }
            None => JsValue::NULL,
        }
    })
}

#[wasm_bindgen]
pub fn get_resources(player_id: u8) -> u32 {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        *game.player_resources.get(player_id as usize).unwrap_or(&0)
    })
}

#[wasm_bindgen]
pub fn get_state_checksum() -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        format!("{:016x}", game.checksum())
    })
}

/// Returns render data as JSON array for the given viewer team.
#[wasm_bindgen]
pub fn get_render_data(viewer_team: u8) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let units = game.render_data(viewer_team);
        // Serialize as JSON array for JS consumption
        let mut json = String::from("[");
        for (i, u) in units.iter().enumerate() {
            if i > 0 {
                json.push(',');
            }
            json.push_str(&format!(
                r#"{{"id":{},"s":{},"x":{:.2},"y":{:.2},"t":{},"h":{:.2}}}"#,
                u.entity_id, u.sprite_id, u.x, u.y, u.team_id, u.health_pct
            ));
        }
        json.push(']');
        json
    })
}

/// Issue a command programmatically (for debug API).
#[wasm_bindgen]
pub fn issue_command(command_json: &str) {
    GAME.with(|g| {
        let mut game = g.borrow_mut();
        let game = game.as_mut().expect("Game not initialized");
        if let Ok(cmd) = serde_json::from_str::<PlayerCommand>(command_json) {
            let turn = TurnCommands {
                tick: game.tick,
                player_id: 0,
                commands: vec![cmd],
                checksum: None,
            };
            game.tick(&[turn]);
        }
    });
}

/// Get fog of war data for a team as a base64-encoded 256x256 u8 grid.
#[wasm_bindgen]
pub fn get_fog_data(team: u8) -> Vec<u8> {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.fog.team_buffer(team).to_vec()
    })
}

/// Get terrain data as a flat array of tile type IDs (256x256).
#[wasm_bindgen]
pub fn get_terrain_data() -> Vec<u8> {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.map.tiles.iter().map(|t| match t {
            irontide_core::map::TileType::Ground => 0,
            irontide_core::map::TileType::Water => 1,
            irontide_core::map::TileType::Rock => 2,
            irontide_core::map::TileType::Resource => 3,
        }).collect()
    })
}

#[wasm_bindgen]
pub fn get_map_size() -> usize {
    irontide_core::map::terrain::MAP_SIZE
}

// ===== Debug API bindings =====

#[wasm_bindgen]
pub fn get_game_state() -> String {
    GAME.with(|g| {
        match g.borrow().as_ref() {
            None => "lobby".to_string(),
            Some(game) => game.get_game_state_str().to_string(),
        }
    })
}

#[wasm_bindgen]
pub fn get_game_result() -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let (winner, reason) = game.get_game_result();
        match winner {
            Some(w) => format!(r#"{{"winner":{},"reason":"{}"}}"#, w, reason),
            None => format!(r#"{{"winner":null,"reason":"{}"}}"#, reason),
        }
    })
}

#[wasm_bindgen]
pub fn get_unit_count_for_player(player_id: u8) -> usize {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.get_unit_count_for_player(player_id)
    })
}

#[wasm_bindgen]
pub fn get_units_by_type(player_id: u8, unit_type_str: &str) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let utype = match unit_type_str {
            "worker" => UnitType::Worker,
            "rifleman" => UnitType::Rifleman,
            "tank" => UnitType::Tank,
            _ => return "[]".to_string(),
        };
        let ids = game.get_units_by_type(player_id, utype);
        format!("[{}]", ids.iter().map(|id| id.to_string()).collect::<Vec<_>>().join(","))
    })
}

#[wasm_bindgen]
pub fn get_unit_health(entity: u32) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        match game.get_unit_health(entity) {
            Some((current, max)) => format!(r#"{{"current":{},"max":{}}}"#, current, max),
            None => "null".to_string(),
        }
    })
}

#[wasm_bindgen]
pub fn get_unit_state(entity: u32) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.get_unit_state(entity).unwrap_or("unknown").to_string()
    })
}

#[wasm_bindgen]
pub fn get_unit_carrying(entity: u32) -> u16 {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.get_unit_carrying(entity)
    })
}

#[wasm_bindgen]
pub fn get_building_count_for_player(player_id: u8) -> usize {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.get_building_count_for_player(player_id)
    })
}

#[wasm_bindgen]
pub fn get_buildings_by_type(player_id: u8, building_type_str: &str) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let btype = match building_type_str {
            "command_center" => BuildingType::CommandCenter,
            "barracks" => BuildingType::Barracks,
            "turret" => BuildingType::Turret,
            _ => return "[]".to_string(),
        };
        let ids = game.get_buildings_by_type(player_id, btype);
        format!("[{}]", ids.iter().map(|id| id.to_string()).collect::<Vec<_>>().join(","))
    })
}

#[wasm_bindgen]
pub fn get_building_progress(entity: u32) -> f32 {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.get_building_progress(entity)
    })
}

#[wasm_bindgen]
pub fn get_production_queue(entity: u32) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let queue = game.get_production_queue(entity);
        let items: Vec<String> = queue.iter().map(|(name, progress)| {
            format!(r#"{{"unitType":"{}","progress":{:.4}}}"#, name, progress)
        }).collect();
        format!("[{}]", items.join(","))
    })
}

#[wasm_bindgen]
pub fn get_resource_nodes() -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        let nodes = game.get_resource_nodes();
        let items: Vec<String> = nodes.iter().map(|(id, x, y, remaining)| {
            format!(r#"{{"id":{},"x":{:.2},"y":{:.2},"remaining":{}}}"#, id, x, y, remaining)
        }).collect();
        format!("[{}]", items.join(","))
    })
}

#[wasm_bindgen]
pub fn is_tile_visible(player_id: u8, x: i32, y: i32) -> bool {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.fog.get(player_id, x, y) == Visibility::Visible
    })
}

#[wasm_bindgen]
pub fn get_visible_tile_count(player_id: u8) -> u32 {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.fog.team_buffer(player_id).iter().filter(|&&b| b == 2).count() as u32
    })
}

#[wasm_bindgen]
pub fn get_tile_type(x: i32, y: i32) -> String {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        match game.map.get_tile(x, y) {
            irontide_core::map::terrain::TileType::Ground => "grass".to_string(),
            irontide_core::map::terrain::TileType::Water => "water".to_string(),
            irontide_core::map::terrain::TileType::Rock => "rock".to_string(),
            irontide_core::map::terrain::TileType::Resource => "ore".to_string(),
        }
    })
}

#[wasm_bindgen]
pub fn is_pathable(x: i32, y: i32) -> bool {
    GAME.with(|g| {
        let game = g.borrow();
        let game = game.as_ref().expect("Game not initialized");
        game.map.is_passable(x, y)
    })
}
