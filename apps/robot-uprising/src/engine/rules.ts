import type { Unit, Rule, Action, Condition } from './types';
import { getOccupied } from './buffer';

function matchesCondition(unit: Unit, condition: Condition): boolean {
  const entries = getOccupied(unit.buffer);
  switch (condition.type) {
    case 'buffer_has':
      return entries.some(e => e.type === condition.signalType);
    case 'buffer_empty':
      return entries.length === 0;
    case 'buffer_full':
      return entries.length >= unit.buffer.capacity;
    case 'always':
      return true;
  }
}

export type RuleResult = { action: Action; rule: Rule; reason: string } | null;

export function evaluateRules(unit: Unit): RuleResult {
  if (unit.stunned) return null;
  const sorted = [...unit.rules].sort((a, b) => a.priority - b.priority);
  for (const rule of sorted) {
    if (matchesCondition(unit, rule.condition)) {
      return {
        action: rule.action,
        rule,
        reason: `Rule ${rule.priority}: ${rule.condition.type} → ${rule.action.type}`,
      };
    }
  }
  return null;
}
