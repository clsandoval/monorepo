import type { GameState, Unit, TickState, TickEvent, Action } from './types';
import { UNIT_STATS } from './types';
import { generatePerceptions } from './perception';
import { addEntry, isOverloaded, ageEntries } from './buffer';
import { evaluateRules } from './rules';
import { moveToward, patrol } from './movement';
import { resolveCombat } from './combat';

function executeAction(unit: Unit, action: Action, state: GameState): { unit: Unit; events: TickEvent[] } {
  const events: TickEvent[] = [];
  let updated = { ...unit };
  const stats = UNIT_STATS[unit.type];

  switch (action.type) {
    case 'patrol': {
      const newPos = patrol(unit.position, stats.speed, state.currentTick, state.board);
      events.push({ type: 'move', unitId: unit.id, from: unit.position, to: newPos });
      updated = { ...updated, position: newPos };
      break;
    }
    case 'move_toward': {
      let targets: Unit[] = [];
      if (action.target === 'nearest_threat') {
        targets = state.units.filter(u => u.team !== unit.team && u.alive);
      } else {
        // 'nearest_unknown' — move toward objective tiles
        const objectives: Array<{ x: number; y: number }> = [];
        for (const row of state.board.tiles) {
          for (const tile of row) {
            if (tile.type === 'objective') objectives.push(tile.position);
          }
        }
        if (objectives.length > 0) {
          const nearest = objectives.reduce((a, b) => {
            const da = Math.hypot(a.x - unit.position.x, a.y - unit.position.y);
            const db = Math.hypot(b.x - unit.position.x, b.y - unit.position.y);
            return da < db ? a : b;
          });
          const newPos = moveToward(unit.position, nearest, stats.speed, state.board);
          events.push({ type: 'move', unitId: unit.id, from: unit.position, to: newPos });
          updated = { ...updated, position: newPos };
          break;
        }
      }
      if (targets.length > 0) {
        const nearest = targets.reduce((a, b) => {
          const da = Math.hypot(a.position.x - unit.position.x, a.position.y - unit.position.y);
          const db = Math.hypot(b.position.x - unit.position.x, b.position.y - unit.position.y);
          return da < db ? a : b;
        });
        const newPos = moveToward(unit.position, nearest.position, stats.speed, state.board);
        events.push({ type: 'move', unitId: unit.id, from: unit.position, to: newPos });
        updated = { ...updated, position: newPos };
      }
      break;
    }
    case 'evade': {
      const threats = state.units.filter(u => u.team !== unit.team && u.alive);
      if (threats.length > 0) {
        const nearest = threats[0];
        const awayX = unit.position.x + (unit.position.x - nearest.position.x);
        const awayY = unit.position.y + (unit.position.y - nearest.position.y);
        const newPos = moveToward(unit.position, { x: awayX, y: awayY }, stats.speed, state.board);
        events.push({ type: 'move', unitId: unit.id, from: unit.position, to: newPos });
        updated = { ...updated, position: newPos };
      }
      break;
    }
    case 'idle':
      break;
  }

  events.push({ type: 'act', unitId: unit.id, action, reason: `executed ${action.type}` });
  return { unit: updated, events };
}

export function executeTick(state: GameState): GameState {
  const tick = state.currentTick + 1;
  const events: TickEvent[] = [];
  let units = state.units.map(u => ({ ...u }));

  // 1. Recover stunned units (unstun if buffer no longer full)
  units = units.map(u => {
    if (!u.stunned) return u;
    const isFull = u.buffer.slots.every(s => s !== null);
    return isFull ? u : { ...u, stunned: false };
  });

  // 2. Age buffer entries
  units = units.map(u => u.alive ? { ...u, buffer: ageEntries(u.buffer) } : u);

  // 3. Perceive
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u.alive) continue;
    const stats = UNIT_STATS[u.type];
    const perceptions = generatePerceptions(u, units, stats.perception, tick);
    for (const entry of perceptions) {
      if (isOverloaded(u.buffer, entry)) {
        units[i] = { ...units[i], stunned: true, buffer: addEntry(units[i].buffer, entry) };
        events.push({ type: 'overload', unitId: u.id });
      } else {
        units[i] = { ...units[i], buffer: addEntry(units[i].buffer, entry) };
      }
      events.push({ type: 'perceive', unitId: u.id, entry });
    }
  }

  // 4. Act
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u.alive || u.stunned) continue;
    const result = evaluateRules(u);
    if (result) {
      const { unit: updated, events: actionEvents } = executeAction(u, result.action, { ...state, units, currentTick: tick });
      units[i] = updated;
      events.push(...actionEvents);
    }
  }

  // 5. Combat
  const combatEvents = resolveCombat(units);
  events.push(...combatEvents);
  const killed = new Set(combatEvents.map(e => e.targetId));
  units = units.map(u => killed.has(u.id) ? { ...u, alive: false } : u);

  // 6. Check victory/defeat
  let missionComplete = state.missionComplete;
  let missionResult = state.missionResult;

  const objectiveTiles = new Set<string>();
  for (const row of state.board.tiles) {
    for (const tile of row) {
      if (tile.type === 'objective') objectiveTiles.add(`${tile.position.x},${tile.position.y}`);
    }
  }
  const playerUnits = units.filter(u => u.team === 'player' && u.alive);
  if (objectiveTiles.size > 0 && playerUnits.length > 0) {
    const allOnObjective = playerUnits.every(u => objectiveTiles.has(`${u.position.x},${u.position.y}`));
    if (allOnObjective) {
      missionComplete = true;
      missionResult = 'victory';
    }
  }
  if (playerUnits.length === 0) {
    missionComplete = true;
    missionResult = 'defeat';
  }

  const tickState: TickState = { tick, units: units.map(u => ({ ...u })), events };

  return {
    ...state,
    units,
    currentTick: tick,
    tickHistory: [...state.tickHistory, tickState],
    missionComplete,
    missionResult,
  };
}
