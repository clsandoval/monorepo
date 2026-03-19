import type { Unit, Position } from './types';

function isAdjacent(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && (a.x !== b.x || a.y !== b.y);
}

export function resolveCombat(units: Unit[]): Array<{ type: 'combat'; attackerId: string; targetId: string }> {
  const events: Array<{ type: 'combat'; attackerId: string; targetId: string }> = [];
  const strikers = units.filter(u => u.type === 'striker' && u.alive && !u.stunned);
  for (const striker of strikers) {
    const targets = units.filter(u =>
      u.alive && u.team !== striker.team && isAdjacent(striker.position, u.position)
    );
    for (const target of targets) {
      events.push({ type: 'combat', attackerId: striker.id, targetId: target.id });
    }
  }
  return events;
}
