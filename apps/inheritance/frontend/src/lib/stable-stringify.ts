/**
 * Deterministic value-equality key for `EngineInput`.
 *
 * Why this module exists: `react-hook-form` hands back a *fresh* object on every keystroke, while
 * Postgres JSONB hands back an object whose key order it normalized on write. Neither reference
 * equality nor `JSON.stringify` can decide whether two of those represent the same facts — the first
 * says "different" for every keystroke including no-op ones, the second says "different" purely
 * because the key order moved. This module is the only place in the succession autosave path where
 * two inputs are compared, so the rule lives here and nowhere else.
 *
 * Money is compared as **serialized text, never as a parsed number**. `Money.centavos` is typed
 * `number | string` (`frontend/src/types/index.ts:240`), so the numeric `1000000` and the string
 * `'1000000'` are genuinely different values and must serialize differently. This function never
 * parses, coerces, rounds or normalizes a money value — it emits the JSON form of whatever primitive
 * it was handed.
 *
 * Object keys are sorted; array elements are **not**. `family_tree` indices are form paths, so
 * reordering the array is a real edit that must be observed as one.
 */

/** Recursion ceiling. `EngineInput` is JSON-derived and acyclic; anything deeper is a bug, and
 *  raising a named error beats recursing without bound inside a React effect. */
export const MAX_STABLE_STRINGIFY_DEPTH = 32;

export function stableStringify(value: unknown, depth: number = 0): string {
  if (depth > MAX_STABLE_STRINGIFY_DEPTH) {
    throw new Error('stableStringify: value nested deeper than 32 levels');
  }

  if (value === null) return 'null';
  if (value === undefined) return 'null';

  if (Array.isArray(value)) {
    // Element order is significant and is never sorted.
    const parts = value.map((element) => stableStringify(element, depth + 1));
    return '[' + parts.join(',') + ']';
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const parts: string[] = [];
    for (const key of keys) {
      const entry = record[key];
      if (entry === undefined) continue;
      parts.push(JSON.stringify(key) + ':' + stableStringify(entry, depth + 1));
    }
    return '{' + parts.join(',') + '}';
  }

  const primitive = JSON.stringify(value);
  return primitive === undefined ? 'null' : primitive;
}
