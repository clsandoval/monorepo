import { describe, it, expect } from 'vitest';
import { moveToward, getNextPatrolPosition } from '../../engine/movement';
import type { Position, Board, Tile } from '../../engine/types';

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

describe('movement', () => {
  it('moves one step toward target', () => {
    const result = moveToward({ x: 0, y: 0 }, { x: 3, y: 0 }, 1, makeBoard());
    expect(result.x).toBe(1);
    expect(result.y).toBe(0);
  });

  it('moves up to speed tiles', () => {
    const result = moveToward({ x: 0, y: 0 }, { x: 5, y: 0 }, 2, makeBoard());
    expect(result.x).toBe(2);
  });

  it('does not move past target', () => {
    const result = moveToward({ x: 0, y: 0 }, { x: 1, y: 0 }, 3, makeBoard());
    expect(result.x).toBe(1);
  });

  it('stays in bounds', () => {
    const result = moveToward({ x: 7, y: 7 }, { x: 10, y: 10 }, 2, makeBoard());
    expect(result.x).toBeLessThanOrEqual(7);
    expect(result.y).toBeLessThanOrEqual(7);
  });

  it('generates a patrol position in bounds', () => {
    const pos = getNextPatrolPosition({ x: 0, y: 0 }, 0, makeBoard());
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThan(8);
  });
});
