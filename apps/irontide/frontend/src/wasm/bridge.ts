/**
 * Typed TypeScript bridge for the irontide WASM module.
 * Wraps raw WASM exports with proper types and JSON parsing.
 */
import initWasmModule, * as wasm from './pkg/irontide.js';

// ===== Types =====

export interface Position {
  x: number;
  y: number;
}

export interface RenderUnit {
  id: number;
  s: number;   // sprite_id
  x: number;
  y: number;
  t: number;   // team_id
  h: number;   // health_pct
}

export interface UnitHealth {
  current: number;
  max: number;
}

export interface GameResult {
  winner: number | null;
  reason: string;
}

export interface ResourceNode {
  id: number;
  x: number;
  y: number;
  remaining: number;
}

export interface ProductionQueueItem {
  unitType: string;
  progress: number;
}

// ===== Init =====

export async function initWasm(): Promise<void> {
  await initWasmModule();
}

// ===== Core game =====

export function initGame(seed: number, mapSeed: number, playerCount: number): void {
  wasm.init_game(seed, mapSeed, playerCount);
}

export function tick(commandsJson: string = ''): void {
  wasm.tick(commandsJson);
}

export function fastForward(ticks: number): void {
  wasm.fast_forward(ticks);
}

export function getTickCount(): number {
  return wasm.get_tick_count();
}

export function getUnitCount(): number {
  return wasm.get_unit_count();
}

export function getUnitPosition(entity: number): Position | null {
  const result = wasm.get_unit_position(entity);
  return result ?? null;
}

export function getResources(playerId: number): number {
  return wasm.get_resources(playerId);
}

export function getStateChecksum(): string {
  return wasm.get_state_checksum();
}

// ===== Render data =====

export function getRenderData(viewerTeam: number): RenderUnit[] {
  return JSON.parse(wasm.get_render_data(viewerTeam));
}

export function getFogData(team: number): Uint8Array {
  return wasm.get_fog_data(team);
}

export function getTerrainData(): Uint8Array {
  return wasm.get_terrain_data();
}

export function getMapSize(): number {
  return wasm.get_map_size();
}

// ===== Commands =====

export function issueCommand(commandJson: string): void {
  wasm.issue_command(commandJson);
}

// ===== Game state =====

export function getGameState(): string {
  return wasm.get_game_state();
}

export function getGameResult(): GameResult {
  return JSON.parse(wasm.get_game_result());
}

// ===== Units =====

export function getUnitCountForPlayer(playerId: number): number {
  return wasm.get_unit_count_for_player(playerId);
}

export function getUnitsByType(playerId: number, unitType: string): number[] {
  return JSON.parse(wasm.get_units_by_type(playerId, unitType));
}

export function getUnitHealth(entity: number): UnitHealth | null {
  const result = wasm.get_unit_health(entity);
  if (result === 'null') return null;
  return JSON.parse(result);
}

export function getUnitState(entity: number): string {
  return wasm.get_unit_state(entity);
}

export function getUnitCarrying(entity: number): number {
  return wasm.get_unit_carrying(entity);
}

// ===== Buildings =====

export function getBuildingCountForPlayer(playerId: number): number {
  return wasm.get_building_count_for_player(playerId);
}

export function getBuildingsByType(playerId: number, buildingType: string): number[] {
  return JSON.parse(wasm.get_buildings_by_type(playerId, buildingType));
}

export function getBuildingProgress(entity: number): number {
  return wasm.get_building_progress(entity);
}

export function getProductionQueue(entity: number): ProductionQueueItem[] {
  return JSON.parse(wasm.get_production_queue(entity));
}

// ===== Map =====

export function getResourceNodes(): ResourceNode[] {
  return JSON.parse(wasm.get_resource_nodes());
}

export function isTileVisible(playerId: number, x: number, y: number): boolean {
  return wasm.is_tile_visible(playerId, x, y);
}

export function getVisibleTileCount(playerId: number): number {
  return wasm.get_visible_tile_count(playerId);
}

export function getTileType(x: number, y: number): string {
  return wasm.get_tile_type(x, y);
}

export function isPathable(x: number, y: number): boolean {
  return wasm.is_pathable(x, y);
}
