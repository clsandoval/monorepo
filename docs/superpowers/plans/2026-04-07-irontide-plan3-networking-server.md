# Iron Tide — Plan 3: Networking & Server

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the relay server and lockstep networking so two players can play a 1v1 game in the browser via room codes.

**Architecture:** Thin relay server (Rust, tokio + tungstenite) on Fly.io. No simulation on server — just forwards commands between 2 clients. Clients run deterministic lockstep: both feed identical commands into `tick()`. WebSocket transport.

**Tech Stack:** Rust (tokio, tungstenite, serde_json), TypeScript (browser WebSocket API)

**Depends on:** Plan 1 (Engine) and Plan 2 (Frontend) must be done first.

**Reference specs:**
- Technical architecture: `docs/superpowers/specs/2026-04-07-irontide-technical-architecture.md`

---

### Task 1: Server crate scaffold

**Files:**
- Create: `engine/crates/irontide-server/Cargo.toml`
- Create: `engine/crates/irontide-server/src/main.rs`
- Create: `engine/crates/irontide-server/src/protocol.rs`
- Modify: `engine/Cargo.toml` (add to workspace)

- [ ] **Step 1: Add server crate to workspace**

In `engine/Cargo.toml`, add `"crates/irontide-server"` to the members list:

```toml
[workspace]
resolver = "2"
members = [
    "crates/irontide-core",
    "crates/irontide-wasm",
    "crates/irontide-server",
]
```

- [ ] **Step 2: Create server Cargo.toml**

```toml
[package]
name = "irontide-server"
version = "0.1.0"
edition = "2021"
description = "Iron Tide RTS - Relay server"

[[bin]]
name = "irontide-server"
path = "src/main.rs"

[dependencies]
tokio = { version = "1", features = ["full"] }
tokio-tungstenite = "0.24"
futures-util = "0.3"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
```

- [ ] **Step 3: Create protocol.rs — shared message types**

```rust
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
```

- [ ] **Step 4: Create main.rs — minimal server**

```rust
mod protocol;

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::{StreamExt, SinkExt};
use protocol::*;

type Tx = mpsc::UnboundedSender<String>;

struct Room {
    code: String,
    players: Vec<(u8, Tx)>,
    seed: u64,
    map_seed: u64,
    command_log: Vec<(u32, Vec<PlayerCommands>)>,
    current_tick: u32,
    pending_commands: HashMap<u8, (String, Option<String>)>, // player_id -> (commands, checksum)
}

impl Room {
    fn new(code: String) -> Self {
        Room {
            code,
            players: Vec::new(),
            seed: rand_seed(),
            map_seed: rand_seed(),
            command_log: Vec::new(),
            current_tick: 0,
            pending_commands: HashMap::new(),
        }
    }

    fn broadcast(&self, msg: &ServerMessage) {
        let json = serde_json::to_string(msg).unwrap();
        for (_, tx) in &self.players {
            let _ = tx.send(json.clone());
        }
    }

    fn try_advance_tick(&mut self) {
        if self.pending_commands.len() == self.players.len() {
            // All players submitted — broadcast turn
            let mut turn_commands = Vec::new();
            for pid in 0..self.players.len() as u8 {
                if let Some((cmds, checksum)) = self.pending_commands.remove(&pid) {
                    turn_commands.push(PlayerCommands {
                        player_id: pid,
                        commands_json: cmds,
                        checksum,
                    });
                }
            }

            // Check for desync (compare checksums every 30 ticks)
            if self.current_tick % 30 == 0 && self.current_tick > 0 {
                let checksums: Vec<_> = turn_commands.iter()
                    .filter_map(|tc| tc.checksum.as_ref())
                    .collect();
                if checksums.len() == 2 && checksums[0] != checksums[1] {
                    self.broadcast(&ServerMessage::DesyncDetected { tick: self.current_tick });
                }
            }

            let msg = ServerMessage::TurnCommands {
                tick: self.current_tick,
                commands: turn_commands.clone(),
            };
            self.broadcast(&msg);
            self.command_log.push((self.current_tick, turn_commands));
            self.current_tick += 1;
        }
    }
}

type Rooms = Arc<Mutex<HashMap<String, Room>>>;

fn rand_seed() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos() as u64
}

fn generate_room_code() -> String {
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let mut code = String::new();
    let seed = rand_seed();
    for i in 0..5 {
        let idx = ((seed >> (i * 5)) & 0x1F) as usize % chars.len();
        code.push(chars.as_bytes()[idx] as char);
    }
    code
}

#[tokio::main]
async fn main() {
    let addr = std::env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string());
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
    println!("Iron Tide server listening on {}", addr);

    let rooms: Rooms = Arc::new(Mutex::new(HashMap::new()));

    while let Ok((stream, _)) = listener.accept().await {
        let rooms = rooms.clone();
        tokio::spawn(async move {
            let ws_stream = match accept_async(stream).await {
                Ok(ws) => ws,
                Err(e) => { eprintln!("WebSocket error: {}", e); return; }
            };
            let (mut ws_sender, mut ws_receiver) = ws_stream.split();
            let (tx, mut rx) = mpsc::unbounded_channel::<String>();

            // Spawn sender task
            let send_task = tokio::spawn(async move {
                while let Some(msg) = rx.recv().await {
                    if ws_sender.send(tokio_tungstenite::tungstenite::Message::Text(msg.into())).await.is_err() {
                        break;
                    }
                }
            });

            let mut player_room: Option<String> = None;
            let mut player_id: Option<u8> = None;

            while let Some(Ok(msg)) = ws_receiver.next().await {
                let text = match msg {
                    tokio_tungstenite::tungstenite::Message::Text(t) => t.to_string(),
                    _ => continue,
                };

                let client_msg: ClientMessage = match serde_json::from_str(&text) {
                    Ok(m) => m,
                    Err(_) => continue,
                };

                let mut rooms_lock = rooms.lock().await;

                match client_msg {
                    ClientMessage::CreateRoom => {
                        let code = generate_room_code();
                        let mut room = Room::new(code.clone());
                        room.players.push((0, tx.clone()));
                        let seed = room.seed;
                        let map_seed = room.map_seed;
                        rooms_lock.insert(code.clone(), room);
                        player_room = Some(code.clone());
                        player_id = Some(0);

                        let resp = ServerMessage::RoomCreated { room_code: code, player_id: 0 };
                        let _ = tx.send(serde_json::to_string(&resp).unwrap());
                    }
                    ClientMessage::JoinRoom { room_code } => {
                        if let Some(room) = rooms_lock.get_mut(&room_code) {
                            if room.players.len() < 2 {
                                let pid = room.players.len() as u8;
                                room.players.push((pid, tx.clone()));
                                player_room = Some(room_code.clone());
                                player_id = Some(pid);

                                let resp = ServerMessage::RoomJoined { player_id: pid };
                                let _ = tx.send(serde_json::to_string(&resp).unwrap());

                                // Both players joined — start game
                                if room.players.len() == 2 {
                                    let start = ServerMessage::GameStart {
                                        seed: room.seed,
                                        map_seed: room.map_seed,
                                        player_count: 2,
                                    };
                                    room.broadcast(&start);
                                }
                            } else {
                                let resp = ServerMessage::Error { message: "Room is full".to_string() };
                                let _ = tx.send(serde_json::to_string(&resp).unwrap());
                            }
                        } else {
                            let resp = ServerMessage::Error { message: "Room not found".to_string() };
                            let _ = tx.send(serde_json::to_string(&resp).unwrap());
                        }
                    }
                    ClientMessage::GameCommands { tick, commands_json, checksum } => {
                        if let (Some(ref code), Some(pid)) = (&player_room, player_id) {
                            if let Some(room) = rooms_lock.get_mut(code) {
                                room.pending_commands.insert(pid, (commands_json, checksum));
                                room.try_advance_tick();
                            }
                        }
                    }
                }
            }

            // Player disconnected
            if let (Some(ref code), Some(pid)) = (&player_room, player_id) {
                let mut rooms_lock = rooms.lock().await;
                if let Some(room) = rooms_lock.get_mut(code) {
                    room.broadcast(&ServerMessage::PlayerDisconnected { player_id: pid });
                    room.players.retain(|(id, _)| *id != pid);
                    if room.players.is_empty() {
                        rooms_lock.remove(code);
                    }
                }
            }

            send_task.abort();
        });
    }
}
```

- [ ] **Step 5: Verify server compiles**

Run: `cd apps/irontide/engine && cargo build -p irontide-server 2>&1 | tail -10`

Expected: Compiles successfully.

- [ ] **Step 6: Commit**

```bash
git add engine/Cargo.toml engine/crates/irontide-server/
git commit -m "feat(irontide): relay server with room creation, join, and lockstep command relay"
```

---

### Task 2: Client-side networking (WebSocket + lockstep)

**Files:**
- Create: `frontend/src/net/client.ts`
- Create: `frontend/src/net/lockstep.ts`
- Create: `frontend/src/net/protocol.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Create protocol.ts — mirrors server messages**

```typescript
export interface RoomCreated { type: 'RoomCreated'; room_code: string; player_id: number; }
export interface RoomJoined { type: 'RoomJoined'; player_id: number; }
export interface GameStart { type: 'GameStart'; seed: number; map_seed: number; player_count: number; }
export interface TurnCommands { type: 'TurnCommands'; tick: number; commands: PlayerCommands[]; }
export interface DesyncDetected { type: 'DesyncDetected'; tick: number; }
export interface PlayerDisconnected { type: 'PlayerDisconnected'; player_id: number; }
export interface ServerError { type: 'Error'; message: string; }

export interface PlayerCommands {
  player_id: number;
  commands_json: string;
  checksum: string | null;
}

export type ServerMessage = RoomCreated | RoomJoined | GameStart | TurnCommands | DesyncDetected | PlayerDisconnected | ServerError;
```

- [ ] **Step 2: Create client.ts — WebSocket connection**

```typescript
import { ServerMessage } from './protocol.js';

export class NetworkClient {
  private ws: WebSocket | null = null;
  private messageCallback: ((msg: ServerMessage) => void) | null = null;

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (e) => {
        const msg = JSON.parse(e.data) as ServerMessage;
        this.messageCallback?.(msg);
      };
      this.ws.onclose = () => {
        console.log('WebSocket closed');
      };
    });
  }

  onMessage(callback: (msg: ServerMessage) => void) {
    this.messageCallback = callback;
  }

  send(msg: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  createRoom() {
    this.send({ type: 'CreateRoom' });
  }

  joinRoom(code: string) {
    this.send({ type: 'JoinRoom', room_code: code });
  }

  sendCommands(tick: number, commandsJson: string, checksum: string | null) {
    this.send({
      type: 'GameCommands',
      tick,
      commands_json: commandsJson,
      checksum,
    });
  }

  close() {
    this.ws?.close();
  }
}
```

- [ ] **Step 3: Create lockstep.ts — synchronization logic**

```typescript
import { NetworkClient } from './client.js';
import { PlayerCommands } from './protocol.js';
import * as wasm from '../wasm/bridge.js';

const INPUT_DELAY_TICKS = 3;

export class LockstepManager {
  private net: NetworkClient;
  private playerId = 0;
  private localTick = 0;
  private pendingLocalCommands: Map<number, string> = new Map();
  private receivedTurns: Map<number, PlayerCommands[]> = new Map();
  private checksumInterval = 30;

  constructor(net: NetworkClient) {
    this.net = net;
  }

  setPlayerId(id: number) {
    this.playerId = id;
  }

  /** Queue local commands for a future tick (input delay). */
  queueCommands(commands: string[]) {
    const targetTick = this.localTick + INPUT_DELAY_TICKS;
    const existing = this.pendingLocalCommands.get(targetTick) || '[]';
    const combined = JSON.parse(existing) as unknown[];
    for (const cmd of commands) {
      combined.push(JSON.parse(cmd));
    }
    this.pendingLocalCommands.set(targetTick, JSON.stringify(combined));
  }

  /** Send this tick's commands to the server. */
  sendTick() {
    const cmds = this.pendingLocalCommands.get(this.localTick) || '[]';
    const checksum = (this.localTick % this.checksumInterval === 0 && this.localTick > 0)
      ? wasm.getStateChecksum()
      : null;
    this.net.sendCommands(this.localTick, cmds, checksum);
    this.pendingLocalCommands.delete(this.localTick);
  }

  /** Called when server sends TurnCommands. */
  receiveTurn(tick: number, commands: PlayerCommands[]) {
    this.receivedTurns.set(tick, commands);
  }

  /** Try to advance the simulation. Returns true if a tick was processed. */
  tryAdvance(): boolean {
    const turn = this.receivedTurns.get(this.localTick);
    if (!turn) return false;

    // Build TurnCommands array for the engine
    const turnCommands = turn.map(pc => ({
      tick: this.localTick,
      player_id: pc.player_id,
      commands: JSON.parse(pc.commands_json),
      checksum: null,
    }));

    wasm.tick(JSON.stringify(turnCommands));
    this.receivedTurns.delete(this.localTick);
    this.localTick++;
    return true;
  }

  getLocalTick(): number {
    return this.localTick;
  }
}
```

- [ ] **Step 4: Update lobby UI for Create/Join room**

Add room code input and create/join buttons to `lobby.ts`. On create, show room code. On join, enter code. Both trigger network connection.

- [ ] **Step 5: Wire networking into main.ts game loop**

In networked mode:
1. Each frame, send local commands via `lockstep.sendTick()`
2. Receive server turns via `lockstep.receiveTurn()`
3. Advance simulation via `lockstep.tryAdvance()`
4. Render

- [ ] **Step 6: Commit**

```bash
git add apps/irontide/frontend/src/net/
git commit -m "feat(irontide): client networking — WebSocket, lockstep sync, room join/create"
```

---

### Task 3: Server deployment to Fly.io

**Files:**
- Create: `engine/crates/irontide-server/Dockerfile`
- Create: `engine/crates/irontide-server/fly.toml`

- [ ] **Step 1: Create Dockerfile**

```dockerfile
FROM rust:1.80-slim as builder
WORKDIR /app
COPY engine/ engine/
WORKDIR /app/engine
RUN cargo build --release -p irontide-server

FROM debian:bookworm-slim
COPY --from=builder /app/engine/target/release/irontide-server /usr/local/bin/
ENV BIND_ADDR=0.0.0.0:8080
EXPOSE 8080
CMD ["irontide-server"]
```

- [ ] **Step 2: Create fly.toml**

```toml
app = "irontide-relay"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8080
  force_https = true

[[services]]
  protocol = "tcp"
  internal_port = 8080

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
```

- [ ] **Step 3: Test server locally**

```bash
cd apps/irontide/engine && cargo run -p irontide-server &
sleep 2
# Test with wscat or curl
echo "Server running on :8080"
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add engine/crates/irontide-server/Dockerfile engine/crates/irontide-server/fly.toml
git commit -m "feat(irontide): server Dockerfile and Fly.io config"
```

---

### Task 4: Reconnection support

**Files:**
- Modify: `engine/crates/irontide-server/src/main.rs`
- Modify: `frontend/src/net/lockstep.ts`

- [ ] **Step 1: Server stores command log for replay**

Already implemented in Task 1 — `Room.command_log` stores all turns. Add a `Reconnect` message type:

In `protocol.rs`:
```rust
// Add to ClientMessage:
Reconnect { room_code: String, player_id: u8 },

// Add to ServerMessage:
ReconnectData { command_log: Vec<(u32, Vec<PlayerCommands>)>, current_tick: u32 },
```

- [ ] **Step 2: Server handles Reconnect**

In `main.rs`, handle `ClientMessage::Reconnect` — send the full command log so the client can replay.

- [ ] **Step 3: Client handles reconnection**

In `lockstep.ts`, add a `replay` method that feeds all historical turns into the engine via `fastForward()`.

- [ ] **Step 4: Commit**

```bash
git add engine/crates/irontide-server/ apps/irontide/frontend/src/net/
git commit -m "feat(irontide): reconnection via command log replay"
```

---

## Plan 3 Complete

After all 4 tasks:
- Relay server handles room creation, joining, command relay, desync detection
- Client connects via WebSocket, sends commands per tick, receives synchronized turns
- Lockstep protocol with 3-tick input delay
- Reconnection via command log replay
- Server deployable to Fly.io

Two players can open the game in separate browser tabs, create/join a room, and play a full 1v1 game.
