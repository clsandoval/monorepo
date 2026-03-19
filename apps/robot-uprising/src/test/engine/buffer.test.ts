import { describe, it, expect } from 'vitest';
import { createBuffer, addEntry, isOverloaded } from '../../engine/buffer';
import type { BufferEntry, SignalType } from '../../engine/types';

const makeEntry = (type: SignalType, tick = 0): BufferEntry => ({
  type, value: `${type}-data`, source: 'test', age: 0, tick,
});

describe('buffer', () => {
  it('creates a buffer with given capacity', () => {
    const buf = createBuffer(6);
    expect(buf.capacity).toBe(6);
    expect(buf.slots.filter(s => s !== null)).toHaveLength(0);
  });

  it('adds an entry to the first empty slot', () => {
    const buf = createBuffer(6);
    const result = addEntry(buf, makeEntry('threat'));
    expect(result.slots.filter(s => s !== null)).toHaveLength(1);
    expect(result.slots[0]?.type).toBe('threat');
  });

  it('filters out entries not in listenFilter', () => {
    const buf = createBuffer(6, new Set<SignalType>(['threat']));
    const result = addEntry(buf, makeEntry('noise'));
    expect(result.slots.filter(s => s !== null)).toHaveLength(0);
  });

  it('evicts lowest priority entry when full', () => {
    const buf = createBuffer(2, new Set(['threat', 'noise'] as SignalType[]), ['noise', 'threat']);
    const b1 = addEntry(buf, makeEntry('noise'));
    const b2 = addEntry(b1, makeEntry('threat'));
    const b3 = addEntry(b2, makeEntry('threat', 1));
    expect(b3.slots.every(s => s?.type === 'threat')).toBe(true);
  });

  it('marks overloaded when full and new entry arrives', () => {
    const buf = createBuffer(1);
    const b1 = addEntry(buf, makeEntry('threat'));
    expect(isOverloaded(b1, makeEntry('threat', 1))).toBe(true);
  });

  it('does not mark overloaded when there is space', () => {
    const buf = createBuffer(6);
    expect(isOverloaded(buf, makeEntry('threat'))).toBe(false);
  });
});
