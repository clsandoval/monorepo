import { describe, it, expect } from 'vitest';
import { executeTick } from '../../engine/tick';
import { createBuffer } from '../../engine/buffer';
import type { Unit, Board, Tile, GameState } from '../../engine/types';

function makeBoard(w = 8, h = 8): Board {
  const tiles: Tile[][] = [];
  for (let y = 0; y < h; y++) {
    tiles[y] = [];
    for (let x = 0; x < w; x++) {
      tiles[y][x] = { position: { x, y }, type: 'ground' };
    }
  }
  return { width: w, height: h, tiles };
}

function makeScout(id: string, x: number, y: number, team: 'player' | 'enemy' = 'player'): Unit {
  return {
    id, type: 'scout', team, position: { x, y },
    buffer: createBuffer(6),
    rules: [{ condition: { type: 'always' }, action: { type: 'patrol' }, priority: 0 }],
    alive: true, stunned: false,
  };
}

function makeState(units: Unit[], board?: Board): GameState {
  return {
    phase: 'watch', board: board ?? makeBoard(),
    units, currentTick: 0, tickHistory: [],
    missionComplete: false, missionResult: 'pending',
  };
}

describe('tick', () => {
  it('advances tick count', () => {
    const next = executeTick(makeState([makeScout('s1', 4, 4)]));
    expect(next.currentTick).toBe(1);
  });

  it('records tick state in history', () => {
    const next = executeTick(makeState([makeScout('s1', 4, 4)]));
    expect(next.tickHistory).toHaveLength(1);
  });

  it('scout perceives nearby enemy and adds to buffer', () => {
    const next = executeTick(makeState([makeScout('s1', 4, 4), makeScout('e1', 6, 4, 'enemy')]));
    const scout = next.units.find(u => u.id === 's1')!;
    expect(scout.buffer.slots.some(s => s !== null)).toBe(true);
  });

  it('stunned unit with non-full buffer recovers', () => {
    const stunned = { ...makeScout('s1', 4, 4), stunned: true };
    // buffer is empty so it should recover
    const next = executeTick(makeState([stunned]));
    expect(next.units[0].stunned).toBe(false);
  });

  it('detects victory when all players reach objective', () => {
    const board = makeBoard(6, 6);
    board.tiles[1][4] = { position: { x: 4, y: 1 }, type: 'objective' };
    const unit = { ...makeScout('s1', 4, 1), rules: [] };
    const next = executeTick(makeState([unit], board));
    expect(next.missionComplete).toBe(true);
    expect(next.missionResult).toBe('victory');
  });
});
