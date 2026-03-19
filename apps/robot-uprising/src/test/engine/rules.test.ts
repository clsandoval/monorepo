import { describe, it, expect } from 'vitest';
import { evaluateRules } from '../../engine/rules';
import { createBuffer, addEntry } from '../../engine/buffer';
import type { Rule, Unit } from '../../engine/types';

function makeUnit(rules: Rule[], bufferEntries: Array<{ type: 'threat' | 'noise' }> = []): Unit {
  let buf = createBuffer(6);
  for (const e of bufferEntries) {
    buf = addEntry(buf, { type: e.type, value: 'test', source: 'test', age: 0, tick: 0 });
  }
  return {
    id: 'u1', type: 'scout', team: 'player',
    position: { x: 0, y: 0 }, buffer: buf, rules, alive: true, stunned: false,
  };
}

describe('rules', () => {
  it('returns the highest priority matching rule action', () => {
    const unit = makeUnit([
      { condition: { type: 'buffer_has', signalType: 'threat' }, action: { type: 'evade' }, priority: 0 },
      { condition: { type: 'always' }, action: { type: 'patrol' }, priority: 1 },
    ], [{ type: 'threat' }]);
    const result = evaluateRules(unit);
    expect(result?.action.type).toBe('evade');
  });

  it('skips non-matching conditions', () => {
    const unit = makeUnit([
      { condition: { type: 'buffer_has', signalType: 'threat' }, action: { type: 'evade' }, priority: 0 },
      { condition: { type: 'always' }, action: { type: 'patrol' }, priority: 1 },
    ]);
    const result = evaluateRules(unit);
    expect(result?.action.type).toBe('patrol');
  });

  it('returns null if no rules match', () => {
    const unit = makeUnit([
      { condition: { type: 'buffer_has', signalType: 'threat' }, action: { type: 'evade' }, priority: 0 },
    ]);
    const result = evaluateRules(unit);
    expect(result).toBeNull();
  });

  it('returns null for stunned units', () => {
    const unit = { ...makeUnit([
      { condition: { type: 'always' }, action: { type: 'patrol' }, priority: 0 },
    ]), stunned: true };
    const result = evaluateRules(unit);
    expect(result).toBeNull();
  });
});
