import { describe, it, expect } from 'vitest';
import { createMission1 } from '../../engine/mission1';

describe('mission1', () => {
  it('creates a valid game state with 6x6 grid', () => {
    const state = createMission1();
    expect(state.phase).toBe('plan');
    expect(state.board.width).toBe(6);
    expect(state.board.height).toBe(6);
  });

  it('has two player units', () => {
    const state = createMission1();
    const players = state.units.filter(u => u.team === 'player');
    expect(players).toHaveLength(2);
  });

  it('has NO enemies', () => {
    const state = createMission1();
    expect(state.units.filter(u => u.team === 'enemy')).toHaveLength(0);
  });

  it('units start with buffers full of noise', () => {
    const state = createMission1();
    for (const unit of state.units) {
      const filled = unit.buffer.slots.filter(s => s !== null);
      expect(filled.length).toBe(unit.buffer.capacity);
      expect(filled.every(s => s!.type === 'noise')).toBe(true);
    }
  });

  it('units start stunned', () => {
    const state = createMission1();
    expect(state.units.every(u => u.stunned)).toBe(true);
  });

  it('has an objective tile', () => {
    const state = createMission1();
    const hasObj = state.board.tiles.some(row => row.some(t => t.type === 'objective'));
    expect(hasObj).toBe(true);
  });
});
