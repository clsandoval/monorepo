import type { GameState, Unit, Board, Tile } from './types';
import { createBuffer, addEntry } from './buffer';

function createBoard(width: number, height: number, objectivePos: { x: number; y: number }): Board {
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      const isObjective = x === objectivePos.x && y === objectivePos.y;
      tiles[y][x] = { position: { x, y }, type: isObjective ? 'objective' : 'ground' };
    }
  }
  return { width, height, tiles };
}

const NOISE_TYPES = [
  'floor vibration', 'EM hum', 'dust count',
  'thermal variance', 'acoustic echo', 'power fluctuation',
];

function fillBufferWithNoise(capacity: number) {
  let buf = createBuffer(capacity);
  for (let i = 0; i < capacity; i++) {
    buf = addEntry(buf, {
      type: 'noise',
      value: NOISE_TYPES[i % NOISE_TYPES.length],
      source: 'environment',
      age: 0,
      tick: 0,
    });
  }
  return buf;
}

export function createMission1(): GameState {
  const board = createBoard(6, 6, { x: 4, y: 1 });

  const unit1: Unit = {
    id: 'unit-1', type: 'scout', team: 'player',
    position: { x: 1, y: 4 },
    buffer: fillBufferWithNoise(6),
    rules: [{ condition: { type: 'always' }, action: { type: 'move_toward', target: 'nearest_unknown' }, priority: 0 }],
    alive: true, stunned: true,
  };

  const unit2: Unit = {
    id: 'unit-2', type: 'scout', team: 'player',
    position: { x: 1, y: 2 },
    buffer: fillBufferWithNoise(6),
    rules: [{ condition: { type: 'always' }, action: { type: 'move_toward', target: 'nearest_unknown' }, priority: 0 }],
    alive: true, stunned: true,
  };

  return {
    phase: 'plan', board, units: [unit1, unit2],
    currentTick: 0, tickHistory: [],
    missionComplete: false, missionResult: 'pending',
  };
}
