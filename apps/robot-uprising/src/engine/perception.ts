import type { Unit, BufferEntry, Position } from './types';

export function distance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function getVisibleUnits(observer: Unit, allUnits: Unit[], perceptionRadius: number): Unit[] {
  return allUnits.filter(u =>
    u.id !== observer.id &&
    u.alive &&
    distance(observer.position, u.position) <= perceptionRadius
  );
}

export function generatePerceptions(observer: Unit, allUnits: Unit[], perceptionRadius: number, tick: number): BufferEntry[] {
  const visible = getVisibleUnits(observer, allUnits, perceptionRadius);
  return visible.map(u => ({
    type: u.team !== observer.team ? 'threat' as const : 'position' as const,
    value: `${u.type} at (${u.position.x},${u.position.y})`,
    source: u.id,
    age: 0,
    tick,
  }));
}
