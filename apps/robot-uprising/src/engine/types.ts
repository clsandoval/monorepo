// === Grid ===
export type Position = { x: number; y: number }; // 0-7 for 8x8 (or smaller grids)

// === Buffer (Context Window) ===
export type SignalType = 'threat' | 'position' | 'terrain' | 'comms' | 'noise';

export type BufferEntry = {
  type: SignalType;
  value: string;
  source: string;
  age: number;
  tick: number;
};

export type Buffer = {
  slots: (BufferEntry | null)[];
  capacity: number;
  listenFilter: Set<SignalType>;
  evictionPriority: SignalType[];
};

// === Rules ===
export type Condition =
  | { type: 'buffer_has'; signalType: SignalType }
  | { type: 'buffer_empty' }
  | { type: 'buffer_full' }
  | { type: 'always' };

export type Action =
  | { type: 'move_toward'; target: 'nearest_threat' | 'nearest_unknown' }
  | { type: 'patrol' }
  | { type: 'evade' }
  | { type: 'idle' };

export type Rule = {
  condition: Condition;
  action: Action;
  priority: number;
};

// === Units ===
export type UnitType = 'scout' | 'striker' | 'relay' | 'specialist' | 'command';
export type Team = 'player' | 'enemy';

export type UnitStats = {
  bufferSize: number;
  hookSlots: number;
  perception: number;
  speed: number;
  cost: number;
};

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  scout:      { bufferSize: 6,  hookSlots: 2, perception: 5, speed: 2, cost: 3 },
  striker:    { bufferSize: 8,  hookSlots: 2, perception: 2, speed: 1, cost: 8 },
  relay:      { bufferSize: 12, hookSlots: 4, perception: 0, speed: 0, cost: 5 },
  specialist: { bufferSize: 10, hookSlots: 2, perception: 3, speed: 1, cost: 7 },
  command:    { bufferSize: 14, hookSlots: 6, perception: 0, speed: 0, cost: 10 },
};

export type Unit = {
  id: string;
  type: UnitType;
  team: Team;
  position: Position;
  buffer: Buffer;
  rules: Rule[];
  alive: boolean;
  stunned: boolean;
};

// === Board ===
export type TileType = 'ground' | 'obstacle' | 'objective';

export type Tile = {
  position: Position;
  type: TileType;
};

export type Board = {
  width: number;
  height: number;
  tiles: Tile[][];
};

// === Game State ===
export type GamePhase = 'plan' | 'watch' | 'inspect';

export type TickState = {
  tick: number;
  units: Unit[];
  events: TickEvent[];
};

export type TickEvent =
  | { type: 'perceive'; unitId: string; entry: BufferEntry }
  | { type: 'act'; unitId: string; action: Action; reason: string }
  | { type: 'combat'; attackerId: string; targetId: string }
  | { type: 'buffer_full'; unitId: string }
  | { type: 'overload'; unitId: string }
  | { type: 'move'; unitId: string; from: Position; to: Position }
  | { type: 'objective_reached'; unitId: string }
  | { type: 'noise'; unitId: string; entry: BufferEntry };

export type GameState = {
  phase: GamePhase;
  board: Board;
  units: Unit[];
  currentTick: number;
  tickHistory: TickState[];
  missionComplete: boolean;
  missionResult: 'pending' | 'victory' | 'defeat';
};
