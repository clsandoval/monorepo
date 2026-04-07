/**
 * Command constructors — produce JSON strings to send to the WASM tick().
 */

export interface GameCommand {
  type: string;
  player_id: number;
  entity_ids: number[];
  [key: string]: unknown;
}

export function createMoveCommand(playerId: number, entityIds: number[], x: number, y: number): GameCommand {
  return { type: 'Move', player_id: playerId, entity_ids: entityIds, target_x: x, target_y: y };
}

export function createAttackCommand(playerId: number, entityIds: number[], targetId: number): GameCommand {
  return { type: 'Attack', player_id: playerId, entity_ids: entityIds, target_id: targetId };
}

export function createAttackMoveCommand(playerId: number, entityIds: number[], x: number, y: number): GameCommand {
  return { type: 'AttackMove', player_id: playerId, entity_ids: entityIds, target_x: x, target_y: y };
}

export function createBuildCommand(playerId: number, entityIds: number[], buildingType: string, x: number, y: number): GameCommand {
  return { type: 'Build', player_id: playerId, entity_ids: entityIds, building_type: buildingType, target_x: x, target_y: y };
}

export function createTrainCommand(playerId: number, entityIds: number[], unitType: string): GameCommand {
  return { type: 'Train', player_id: playerId, entity_ids: entityIds, unit_type: unitType };
}

export function createStopCommand(playerId: number, entityIds: number[]): GameCommand {
  return { type: 'Stop', player_id: playerId, entity_ids: entityIds };
}
