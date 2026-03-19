import { describe, it, expect } from 'vitest';
import { getVisibleUnits, generatePerceptions } from '../../engine/perception';
import type { Unit } from '../../engine/types';
import { createBuffer } from '../../engine/buffer';

function makeUnit(id: string, x: number, y: number, team: 'player' | 'enemy' = 'player'): Unit {
  return {
    id, type: 'scout', team, position: { x, y },
    buffer: createBuffer(6), rules: [], alive: true, stunned: false,
  };
}

describe('perception', () => {
  it('detects units within perception radius', () => {
    const scout = makeUnit('s1', 0, 0);
    const enemy = makeUnit('e1', 3, 0, 'enemy');
    const visible = getVisibleUnits(scout, [enemy], 5);
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('e1');
  });

  it('does not detect units outside perception radius', () => {
    const scout = makeUnit('s1', 0, 0);
    const enemy = makeUnit('e1', 7, 7, 'enemy');
    const visible = getVisibleUnits(scout, [enemy], 5);
    expect(visible).toHaveLength(0);
  });

  it('does not detect self', () => {
    const scout = makeUnit('s1', 0, 0);
    const visible = getVisibleUnits(scout, [scout], 5);
    expect(visible).toHaveLength(0);
  });

  it('does not detect dead units', () => {
    const scout = makeUnit('s1', 0, 0);
    const dead = { ...makeUnit('e1', 1, 0, 'enemy'), alive: false };
    const visible = getVisibleUnits(scout, [dead], 5);
    expect(visible).toHaveLength(0);
  });

  it('generates buffer entries from perceived units', () => {
    const scout = makeUnit('s1', 0, 0);
    const enemy = makeUnit('e1', 3, 0, 'enemy');
    const entries = generatePerceptions(scout, [enemy], 5, 1);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].source).toBe('e1');
    expect(entries[0].type).toBe('threat');
  });

  it('generates position entries for friendly units', () => {
    const s1 = makeUnit('s1', 0, 0);
    const s2 = makeUnit('s2', 1, 0);
    const entries = generatePerceptions(s1, [s2], 5, 1);
    expect(entries[0].type).toBe('position');
  });
});
