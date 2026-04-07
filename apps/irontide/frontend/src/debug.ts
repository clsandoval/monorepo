/**
 * Debug API bridge — exposes window.__IRONTIDE_DEBUG for QA automation.
 */

import { Camera } from './renderer/camera.js';
import { ClientState } from './game/state.js';
import * as bridge from './wasm/bridge.js';

export type TickMode = 'realtime' | 'manual';

export interface DebugAPI {
  // Game state
  getGameState(): string;
  getTickCount(): number;
  getStateChecksum(): string;

  // Resources
  getResources(playerId: number): number;

  // Units
  getUnitCount(): number;
  getUnitCountForPlayer(playerId: number): number;
  getUnitsByType(playerId: number, unitType: string): number[];
  getUnitPosition(id: number): { x: number; y: number } | null;
  getUnitScreenPosition(id: number): { x: number; y: number } | null;
  getUnitHealth(id: number): { current: number; max: number } | null;
  getUnitState(id: number): string;
  getUnitCarrying(id: number): number;

  // Buildings
  getBuildingCountForPlayer(playerId: number): number;
  getBuildingsByType(playerId: number, buildingType: string): number[];
  getBuildingPosition(id: number): { x: number; y: number } | null;
  getBuildingScreenPosition(id: number): { x: number; y: number } | null;
  getBuildingHealth(id: number): { current: number; max: number } | null;
  getBuildingProgress(id: number): number;
  getProductionQueue(id: number): bridge.ProductionQueueItem[];

  // Selection
  getSelectedEntityIds(): number[];

  // Camera
  getCameraPosition(): { offsetX: number; offsetY: number };
  getCameraZoom(): number;

  // Fog
  isTileVisible(playerId: number, x: number, y: number): boolean;
  getVisibleTileCount(playerId: number): number;

  // Map
  getMapSize(): number;
  getTileType(x: number, y: number): string;
  isPathable(x: number, y: number): boolean;

  // Commands
  issueCommand(commandJson: string): void;

  // Tick control
  getTickMode(): TickMode;
  setTickMode(mode: TickMode): void;
  stepTick(commandsJson?: string): void;
  stepTicks(count: number): void;
  fastForward(ticks: number): void;

  // Performance
  getFrameTime(): { avg: number; min: number; max: number };
  getTickTime(): { avg: number; min: number; max: number };
}

declare global {
  interface Window {
    __IRONTIDE_DEBUG?: DebugAPI;
  }
}

/** Rolling buffer for timing samples. */
class TimingBuffer {
  private samples: number[];
  private idx = 0;
  private count = 0;

  constructor(private maxSize: number) {
    this.samples = new Array(maxSize).fill(0);
  }

  push(ms: number): void {
    this.samples[this.idx] = ms;
    this.idx = (this.idx + 1) % this.maxSize;
    if (this.count < this.maxSize) this.count++;
  }

  getStats(): { avg: number; min: number; max: number } {
    if (this.count === 0) return { avg: 0, min: 0, max: 0 };
    let sum = 0, min = Infinity, max = -Infinity;
    for (let i = 0; i < this.count; i++) {
      const v = this.samples[i];
      sum += v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return { avg: sum / this.count, min, max };
  }
}

export class DebugManager {
  tickMode: TickMode = 'realtime';
  readonly frameTimes = new TimingBuffer(60);
  readonly tickTimes = new TimingBuffer(30);

  private camera: Camera;
  private state: ClientState;
  private tickFn: (commandsJson?: string) => void;

  constructor(
    camera: Camera,
    state: ClientState,
    tickFn: (commandsJson?: string) => void,
  ) {
    this.camera = camera;
    this.state = state;
    this.tickFn = tickFn;
  }

  install(): void {
    const self = this;
    const camera = this.camera;
    const state = this.state;

    const api: DebugAPI = {
      // Game state
      getGameState: () => bridge.getGameState(),
      getTickCount: () => bridge.getTickCount(),
      getStateChecksum: () => bridge.getStateChecksum(),

      // Resources
      getResources: (pid) => bridge.getResources(pid),

      // Units
      getUnitCount: () => bridge.getUnitCount(),
      getUnitCountForPlayer: (pid) => bridge.getUnitCountForPlayer(pid),
      getUnitsByType: (pid, t) => bridge.getUnitsByType(pid, t),
      getUnitPosition: (id) => bridge.getUnitPosition(id),
      getUnitScreenPosition: (id) => {
        const pos = bridge.getUnitPosition(id);
        if (!pos) return null;
        return camera.tileToScreen(pos.x, pos.y);
      },
      getUnitHealth: (id) => bridge.getUnitHealth(id),
      getUnitState: (id) => bridge.getUnitState(id),
      getUnitCarrying: (id) => bridge.getUnitCarrying(id),

      // Buildings
      getBuildingCountForPlayer: (pid) => bridge.getBuildingCountForPlayer(pid),
      getBuildingsByType: (pid, t) => bridge.getBuildingsByType(pid, t),
      getBuildingPosition: (id) => bridge.getUnitPosition(id), // buildings use same position API
      getBuildingScreenPosition: (id) => {
        const pos = bridge.getUnitPosition(id);
        if (!pos) return null;
        return camera.tileToScreen(pos.x, pos.y);
      },
      getBuildingHealth: (id) => bridge.getUnitHealth(id), // same health API
      getBuildingProgress: (id) => bridge.getBuildingProgress(id),
      getProductionQueue: (id) => bridge.getProductionQueue(id),

      // Selection
      getSelectedEntityIds: () => [...state.selectedEntityIds],

      // Camera
      getCameraPosition: () => ({ offsetX: camera.offsetX, offsetY: camera.offsetY }),
      getCameraZoom: () => camera.zoom,

      // Fog
      isTileVisible: (pid, x, y) => bridge.isTileVisible(pid, x, y),
      getVisibleTileCount: (pid) => bridge.getVisibleTileCount(pid),

      // Map
      getMapSize: () => bridge.getMapSize(),
      getTileType: (x, y) => bridge.getTileType(x, y),
      isPathable: (x, y) => bridge.isPathable(x, y),

      // Commands
      issueCommand: (json) => bridge.issueCommand(json),

      // Tick control
      getTickMode: () => self.tickMode,
      setTickMode: (mode) => { self.tickMode = mode; },
      stepTick: (json) => {
        self.tickFn(json);
      },
      stepTicks: (count) => {
        for (let i = 0; i < count; i++) self.tickFn();
      },
      fastForward: (ticks) => bridge.fastForward(ticks),

      // Performance
      getFrameTime: () => self.frameTimes.getStats(),
      getTickTime: () => self.tickTimes.getStats(),
    };

    window.__IRONTIDE_DEBUG = api;
  }
}
