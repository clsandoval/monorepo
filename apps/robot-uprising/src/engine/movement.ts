import type { Position, Board } from './types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function moveToward(from: Position, target: Position, speed: number, board: Board): Position {
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  if (dx === 0 && dy === 0) return from;
  // Move along the axis with the larger delta first (grid-based, not Euclidean)
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  let stepsX = 0, stepsY = 0;
  let remaining = speed;
  if (absDx >= absDy) {
    stepsX = Math.min(remaining, absDx);
    remaining -= stepsX;
    stepsY = Math.min(remaining, absDy);
  } else {
    stepsY = Math.min(remaining, absDy);
    remaining -= stepsY;
    stepsX = Math.min(remaining, absDx);
  }
  return {
    x: clamp(from.x + Math.sign(dx) * stepsX, 0, board.width - 1),
    y: clamp(from.y + Math.sign(dy) * stepsY, 0, board.height - 1),
  };
}

const PATROL_DIRS: Position[] = [
  { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
];

export function getNextPatrolPosition(from: Position, tick: number, board: Board): Position {
  const dir = PATROL_DIRS[tick % PATROL_DIRS.length];
  return {
    x: clamp(from.x + dir.x, 0, board.width - 1),
    y: clamp(from.y + dir.y, 0, board.height - 1),
  };
}

export function patrol(from: Position, speed: number, tick: number, board: Board): Position {
  const target = getNextPatrolPosition(from, tick, board);
  return moveToward(from, target, speed, board);
}
