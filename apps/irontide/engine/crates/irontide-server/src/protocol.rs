use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ClientMessage {
    CreateRoom,
    JoinRoom { room_code: String },
    GameCommands { tick: u32, commands_json: String, checksum: Option<String> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ServerMessage {
    RoomCreated { room_code: String, player_id: u8 },
    RoomJoined { player_id: u8 },
    GameStart { seed: u64, map_seed: u64, player_count: u8 },
    TurnCommands { tick: u32, commands: Vec<PlayerCommands> },
    DesyncDetected { tick: u32 },
    PlayerDisconnected { player_id: u8 },
    Error { message: String },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlayerCommands {
    pub player_id: u8,
    pub commands_json: String,
    pub checksum: Option<String>,
}
