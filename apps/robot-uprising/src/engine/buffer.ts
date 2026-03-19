import type { Buffer, BufferEntry, SignalType } from './types';

export function createBuffer(
  capacity: number,
  listenFilter?: Set<SignalType>,
  evictionPriority?: SignalType[],
): Buffer {
  return {
    slots: new Array(capacity).fill(null),
    capacity,
    listenFilter: listenFilter ?? new Set(['threat', 'position', 'terrain', 'comms', 'noise']),
    evictionPriority: evictionPriority ?? ['noise', 'terrain', 'position', 'comms', 'threat'],
  };
}

export function addEntry(buffer: Buffer, entry: BufferEntry): Buffer {
  if (!buffer.listenFilter.has(entry.type)) return buffer;
  const slots = [...buffer.slots];
  const emptyIdx = slots.findIndex(s => s === null);
  if (emptyIdx !== -1) {
    slots[emptyIdx] = entry;
    return { ...buffer, slots };
  }
  // Buffer full — evict lowest priority
  let evictIdx = -1;
  let lowestPriorityIdx = Infinity;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot) continue;
    const priorityIdx = buffer.evictionPriority.indexOf(slot.type);
    if (priorityIdx !== -1 && priorityIdx < lowestPriorityIdx) {
      lowestPriorityIdx = priorityIdx;
      evictIdx = i;
    }
  }
  if (evictIdx !== -1) {
    slots[evictIdx] = entry;
  }
  return { ...buffer, slots };
}

export function isOverloaded(buffer: Buffer, incoming: BufferEntry): boolean {
  if (!buffer.listenFilter.has(incoming.type)) return false;
  return buffer.slots.every(s => s !== null);
}

export function ageEntries(buffer: Buffer): Buffer {
  const slots = buffer.slots.map(s => s ? { ...s, age: s.age + 1 } : null);
  return { ...buffer, slots };
}

export function getOccupied(buffer: Buffer): BufferEntry[] {
  return buffer.slots.filter((s): s is BufferEntry => s !== null);
}

export function getFillRatio(buffer: Buffer): number {
  return getOccupied(buffer).length / buffer.capacity;
}
