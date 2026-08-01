/**
 * Subject: frontend/src/lib/stable-stringify.ts
 *
 * Source of truth: the three load-bearing properties the succession autosave path depends on —
 * object-key-order independence, array-order significance, and money-compared-as-text. Each has its
 * own case here, so losing any one of them fails a named test rather than silently changing when the
 * wizard saves.
 *
 * Following the local convention, this file builds its own literal fixtures and imports no shared
 * factory.
 */
import { describe, it, expect } from 'vitest';
import { stableStringify } from '../stable-stringify';

describe('stableStringify', () => {
  it('serializes objects with opposite key order identically', () => {
    const a = { alpha: 1, beta: 2, gamma: 3 };
    const b = { gamma: 3, beta: 2, alpha: 1 };
    expect(stableStringify(a)).toBe(stableStringify(b));
    expect(stableStringify(a)).toBe('{"alpha":1,"beta":2,"gamma":3}');
  });

  it('serializes arrays with opposite element order differently', () => {
    const a = ['p1', 'p2', 'p3'];
    const b = ['p3', 'p2', 'p1'];
    expect(stableStringify(a)).not.toBe(stableStringify(b));
    expect(stableStringify(a)).toBe('["p1","p2","p3"]');
    expect(stableStringify(b)).toBe('["p3","p2","p1"]');
  });

  it('serializes null as null, both bare and as a property value', () => {
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify({ will: null })).toBe('{"will":null}');
  });

  it('omits properties whose value is undefined', () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe(stableStringify({ a: 1 }));
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it('distinguishes numeric centavos from string centavos', () => {
    const numeric = stableStringify({ centavos: 1000000 });
    const text = stableStringify({ centavos: '1000000' });
    expect(numeric).toBe('{"centavos":1000000}');
    expect(text).toBe('{"centavos":"1000000"}');
    expect(numeric).not.toBe(text);
  });

  it('treats an EngineInput-shaped literal as equal to a key-reordered copy', () => {
    const original = {
      net_distributable_estate: { centavos: 1000000 },
      decedent: {
        id: 'p1',
        name: 'Juan dela Cruz',
        date_of_death: '2024-03-15',
        is_married: true,
      },
      family_tree: [
        { id: 'c1', name: 'Ana', relationship: 'legitimate_child' },
        { id: 'c2', name: 'Ben', relationship: 'legitimate_child' },
      ],
      will: null,
      donations: [],
      config: { retroactive_ra_11642: false, max_pipeline_restarts: 5 },
    };

    const reordered = {
      config: { max_pipeline_restarts: 5, retroactive_ra_11642: false },
      donations: [],
      will: null,
      family_tree: [
        { relationship: 'legitimate_child', name: 'Ana', id: 'c1' },
        { name: 'Ben', id: 'c2', relationship: 'legitimate_child' },
      ],
      decedent: {
        is_married: true,
        date_of_death: '2024-03-15',
        name: 'Juan dela Cruz',
        id: 'p1',
      },
      net_distributable_estate: { centavos: 1000000 },
    };

    expect(stableStringify(original)).toBe(stableStringify(reordered));
  });

  it('produces a different string when a nested field of the same object reference is mutated', () => {
    const input = {
      net_distributable_estate: { centavos: 1000000 },
      family_tree: [{ id: 'c1', name: 'Ana' }],
    };
    const before = stableStringify(input);

    input.net_distributable_estate.centavos = 9999999;
    const after = stableStringify(input);

    expect(after).not.toBe(before);
  });

  it('throws a named error for a value nested deeper than 32 levels', () => {
    let deep: Record<string, unknown> = { leaf: 1 };
    for (let i = 0; i < 40; i += 1) {
      deep = { nested: deep };
    }
    expect(() => stableStringify(deep)).toThrowError(/nested deeper than 32 levels/);
  });
});
