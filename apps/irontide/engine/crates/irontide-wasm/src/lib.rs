use wasm_bindgen::prelude::*;
use irontide_core::{GameState, PlayerCommand, TurnCommands};
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
