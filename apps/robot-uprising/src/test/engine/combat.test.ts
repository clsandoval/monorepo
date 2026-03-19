import { describe, it, expect } from 'vitest';
import { resolveCombat } from '../../engine/combat';
import { createBuffer } from '../../engine/buffer';
import type { Unit } from '../../engine/types';

function makeUnit(id: string, x: number, y: number, type: 'scout' | 'striker', team: 'player' | 'enemy'): Unit {
  return {
    id, type, team, position: { x, y },
    buffer: createBuffer(6), rules: [], alive: true, stunned: false,
  };
}

describe('combat', () => {
  it('striker eliminates adjacent enemy', () => {
    const striker = makeUnit('s1', 3, 3, 'striker', 'player');
    const enemy = makeUnit('e1', 3, 4, 'scout', 'enemy');
    const events = resolveCombat([striker, enemy]);
    expect(events).toHaveLength(1);
    expect(events[0].targetId).toBe('e1');
  });

  it('does not attack non-adjacent', () => {
    const striker = makeUnit('s1', 0, 0, 'striker', 'player');
    const enemy = makeUnit('e1', 5, 5, 'scout', 'enemy');
    expect(resolveCombat([striker, enemy])).toHaveLength(0);
  });

  it('does not attack friendlies', () => {
    const s1 = makeUnit('s1', 3, 3, 'striker', 'player');
    const s2 = makeUnit('s2', 3, 4, 'scout', 'player');
    expect(resolveCombat([s1, s2])).toHaveLength(0);
  });

  it('mutual elimination when two opposing strikers adjacent', () => {
    const s1 = makeUnit('s1', 3, 3, 'striker', 'player');
    const s2 = makeUnit('s2', 3, 4, 'striker', 'enemy');
    expect(resolveCombat([s1, s2])).toHaveLength(2);
  });
});
