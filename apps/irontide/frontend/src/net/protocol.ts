/**
 * Network protocol types — mirrors the Rust server's ServerMessage/ClientMessage enums.
 */

// Server -> Client messages
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

export type ServerMessage =
  | RoomCreated
  | RoomJoined
  | GameStart
  | TurnCommands
  | DesyncDetected
  | PlayerDisconnected
  | ServerError;

// Client -> Server messages
export interface CreateRoomMsg { type: 'CreateRoom'; }
export interface JoinRoomMsg { type: 'JoinRoom'; room_code: string; }
export interface GameCommandsMsg { type: 'GameCommands'; tick: number; commands_json: string; checksum: string | null; }

export type ClientMessage = CreateRoomMsg | JoinRoomMsg | GameCommandsMsg;
