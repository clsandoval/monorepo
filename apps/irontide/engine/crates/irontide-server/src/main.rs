mod protocol;

use protocol::{ClientMessage, PlayerCommands, ServerMessage};

use futures_util::{SinkExt, StreamExt};
use std::collections::HashMap;
use std::env;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::tungstenite::Message;

type Tx = mpsc::UnboundedSender<String>;
type Rooms = Arc<Mutex<HashMap<String, Room>>>;

#[allow(dead_code)]
struct Room {
    code: String,
    players: Vec<(u8, Tx)>,
    seed: u64,
    map_seed: u64,
    command_log: Vec<(u32, Vec<PlayerCommands>)>,
    current_tick: u32,
    pending_commands: HashMap<u8, (String, Option<String>)>,
}

const ROOM_CODE_CHARS: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DESYNC_CHECK_INTERVAL: u32 = 30;

fn generate_room_code() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .subsec_nanos() as usize;
    (0..5)
        .map(|i| {
            let idx = (nanos.wrapping_mul(31).wrapping_add(i * 7)) % ROOM_CODE_CHARS.len();
            ROOM_CODE_CHARS[idx] as char
        })
        .collect()
}

fn random_seed() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos() as u64
}

fn send_msg(tx: &Tx, msg: &ServerMessage) {
    if let Ok(json) = serde_json::to_string(msg) {
        let _ = tx.send(json);
    }
}

async fn handle_connection(stream: TcpStream, rooms: Rooms) {
    let ws_stream = match tokio_tungstenite::accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("[server] WebSocket accept error: {e}");
            return;
        }
    };

    let (mut ws_sink, mut ws_stream_rx) = ws_stream.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    // Outbound task: forward mpsc messages to the WebSocket
    let outbound = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_sink.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    let mut my_player_id: Option<u8> = None;
    let mut my_room_code: Option<String> = None;

    // Inbound: process client messages
    while let Some(Ok(msg)) = ws_stream_rx.next().await {
        let text = match msg {
            Message::Text(t) => t.to_string(),
            Message::Close(_) => break,
            _ => continue,
        };

        let client_msg: ClientMessage = match serde_json::from_str(&text) {
            Ok(m) => m,
            Err(e) => {
                send_msg(&tx, &ServerMessage::Error {
                    message: format!("Invalid message: {e}"),
                });
                continue;
            }
        };

        match client_msg {
            ClientMessage::CreateRoom => {
                let code = generate_room_code();
                let seed = random_seed();
                let map_seed = random_seed();

                let room = Room {
                    code: code.clone(),
                    players: vec![(0, tx.clone())],
                    seed,
                    map_seed,
                    command_log: Vec::new(),
                    current_tick: 0,
                    pending_commands: HashMap::new(),
                };

                rooms.lock().await.insert(code.clone(), room);
                my_player_id = Some(0);
                my_room_code = Some(code.clone());

                send_msg(&tx, &ServerMessage::RoomCreated {
                    room_code: code,
                    player_id: 0,
                });
            }

            ClientMessage::JoinRoom { room_code } => {
                let mut rooms_guard = rooms.lock().await;
                let room = match rooms_guard.get_mut(&room_code) {
                    Some(r) => r,
                    None => {
                        send_msg(&tx, &ServerMessage::Error {
                            message: "Room not found".into(),
                        });
                        continue;
                    }
                };

                if room.players.len() >= 2 {
                    send_msg(&tx, &ServerMessage::Error {
                        message: "Room is full".into(),
                    });
                    continue;
                }

                let player_id = room.players.len() as u8;
                room.players.push((player_id, tx.clone()));
                my_player_id = Some(player_id);
                my_room_code = Some(room_code.clone());

                send_msg(&tx, &ServerMessage::RoomJoined { player_id });

                // Both players joined — broadcast GameStart
                if room.players.len() == 2 {
                    let start_msg = ServerMessage::GameStart {
                        seed: room.seed,
                        map_seed: room.map_seed,
                        player_count: 2,
                    };
                    for (_, ptx) in &room.players {
                        send_msg(ptx, &start_msg);
                    }
                }
            }

            ClientMessage::GameCommands {
                tick,
                commands_json,
                checksum,
            } => {
                let pid = match my_player_id {
                    Some(id) => id,
                    None => {
                        send_msg(&tx, &ServerMessage::Error {
                            message: "Not in a room".into(),
                        });
                        continue;
                    }
                };
                let code = my_room_code.as_ref().unwrap().clone();

                let mut rooms_guard = rooms.lock().await;
                let room = match rooms_guard.get_mut(&code) {
                    Some(r) => r,
                    None => continue,
                };

                room.pending_commands
                    .insert(pid, (commands_json.clone(), checksum.clone()));

                // Check if all players have submitted for this tick
                let expected = room.players.len();
                if room.pending_commands.len() >= expected {
                    // Desync detection every DESYNC_CHECK_INTERVAL ticks
                    if tick % DESYNC_CHECK_INTERVAL == 0 && tick > 0 {
                        let checksums: Vec<Option<String>> = room
                            .pending_commands
                            .values()
                            .map(|(_, cs)| cs.clone())
                            .collect();

                        if checksums.len() == 2 {
                            if let (Some(a), Some(b)) = (&checksums[0], &checksums[1]) {
                                if a != b {
                                    let desync_msg = ServerMessage::DesyncDetected { tick };
                                    for (_, ptx) in &room.players {
                                        send_msg(ptx, &desync_msg);
                                    }
                                }
                            }
                        }
                    }

                    // Build combined turn commands
                    let mut turn_cmds: Vec<PlayerCommands> = Vec::new();
                    for (&pid, (cj, cs)) in &room.pending_commands {
                        turn_cmds.push(PlayerCommands {
                            player_id: pid,
                            commands_json: cj.clone(),
                            checksum: cs.clone(),
                        });
                    }

                    // Store in command log for reconnection
                    room.command_log.push((tick, turn_cmds.clone()));
                    room.current_tick = tick + 1;

                    // Broadcast
                    let turn_msg = ServerMessage::TurnCommands {
                        tick,
                        commands: turn_cmds,
                    };
                    for (_, ptx) in &room.players {
                        send_msg(ptx, &turn_msg);
                    }

                    room.pending_commands.clear();
                }
            }
        }
    }

    // Player disconnected — cleanup
    if let Some(code) = &my_room_code {
        let mut rooms_guard = rooms.lock().await;
        if let Some(room) = rooms_guard.get_mut(code) {
            if let Some(pid) = my_player_id {
                // Remove the disconnected player
                room.players.retain(|(id, _)| *id != pid);

                // Notify remaining players
                let disc_msg = ServerMessage::PlayerDisconnected { player_id: pid };
                for (_, ptx) in &room.players {
                    send_msg(ptx, &disc_msg);
                }

                // If room is empty, remove it
                if room.players.is_empty() {
                    let code = code.clone();
                    rooms_guard.remove(&code);
                }
            }
        }
    }

    outbound.abort();
}

#[tokio::main]
async fn main() {
    let addr = env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string());
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
    println!("[irontide-server] Listening on {addr}");

    let rooms: Rooms = Arc::new(Mutex::new(HashMap::new()));

    while let Ok((stream, peer)) = listener.accept().await {
        println!("[irontide-server] New connection from {peer}");
        let rooms = rooms.clone();
        tokio::spawn(handle_connection(stream, rooms));
    }
}
