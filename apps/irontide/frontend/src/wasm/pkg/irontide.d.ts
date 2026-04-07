/* tslint:disable */
/* eslint-disable */

export function fast_forward(ticks: number): void;

export function get_building_count_for_player(player_id: number): number;

export function get_building_progress(entity: number): number;

export function get_buildings_by_type(player_id: number, building_type_str: string): string;

/**
 * Get fog of war data for a team as a base64-encoded 256x256 u8 grid.
 */
export function get_fog_data(team: number): Uint8Array;

export function get_game_result(): string;

export function get_game_state(): string;

export function get_map_size(): number;

export function get_production_queue(entity: number): string;

/**
 * Returns render data as JSON array for the given viewer team.
 */
export function get_render_data(viewer_team: number): string;

export function get_resource_nodes(): string;

export function get_resources(player_id: number): number;

export function get_state_checksum(): string;

/**
 * Get terrain data as a flat array of tile type IDs (256x256).
 */
export function get_terrain_data(): Uint8Array;

export function get_tick_count(): number;

export function get_tile_type(x: number, y: number): string;

export function get_unit_carrying(entity: number): number;

export function get_unit_count(): number;

export function get_unit_count_for_player(player_id: number): number;

export function get_unit_health(entity: number): string;

export function get_unit_position(entity: number): any;

export function get_unit_state(entity: number): string;

export function get_units_by_type(player_id: number, unit_type_str: string): string;

export function get_visible_tile_count(player_id: number): number;

export function init_game(seed: number, map_seed: number, player_count: number): void;

export function is_pathable(x: number, y: number): boolean;

export function is_tile_visible(player_id: number, x: number, y: number): boolean;

/**
 * Issue a command programmatically (for debug API).
 */
export function issue_command(command_json: string): void;

export function tick(commands_json: string): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly init_game: (a: number, b: number, c: number) => void;
    readonly tick: (a: number, b: number) => void;
    readonly get_unit_position: (a: number) => any;
    readonly get_resources: (a: number) => number;
    readonly get_state_checksum: () => [number, number];
    readonly get_render_data: (a: number) => [number, number];
    readonly issue_command: (a: number, b: number) => void;
    readonly get_fog_data: (a: number) => [number, number];
    readonly get_terrain_data: () => [number, number];
    readonly get_map_size: () => number;
    readonly get_game_state: () => [number, number];
    readonly get_game_result: () => [number, number];
    readonly get_unit_count_for_player: (a: number) => number;
    readonly get_units_by_type: (a: number, b: number, c: number) => [number, number];
    readonly get_unit_health: (a: number) => [number, number];
    readonly get_unit_state: (a: number) => [number, number];
    readonly get_unit_carrying: (a: number) => number;
    readonly get_building_count_for_player: (a: number) => number;
    readonly get_buildings_by_type: (a: number, b: number, c: number) => [number, number];
    readonly get_production_queue: (a: number) => [number, number];
    readonly get_resource_nodes: () => [number, number];
    readonly is_tile_visible: (a: number, b: number, c: number) => number;
    readonly get_visible_tile_count: (a: number) => number;
    readonly get_tile_type: (a: number, b: number) => [number, number];
    readonly is_pathable: (a: number, b: number) => number;
    readonly fast_forward: (a: number) => void;
    readonly get_tick_count: () => number;
    readonly get_building_progress: (a: number) => number;
    readonly get_unit_count: () => number;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
