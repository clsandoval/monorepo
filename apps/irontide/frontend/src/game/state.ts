/**
 * Client-side game state — selection, control groups, player identity.
 */

export interface ClientState {
  /** Currently selected entity IDs */
  selectedEntityIds: number[];
  /** Local player ID */
  playerId: number;
  /** Control groups: key 1-9 -> array of entity IDs */
  controlGroups: Map<number, number[]>;
}

export function createClientState(playerId = 0): ClientState {
  return {
    selectedEntityIds: [],
    playerId,
    controlGroups: new Map(),
  };
}
