// Fixture for gate G13 (scripts/check-assertion-discipline.mjs): the NEGATIVE control.
// Both blocks assert strongly and must produce no violation. The nested describe
// exercises the block-extraction scanner on nesting, where a naive regex misparses.
// Lives OUTSIDE frontend/src on purpose, so Vitest never collects it.
import { describe, it, expect } from 'vitest';

it('strong', () => {
  const v = 3;
  expect(v).toBe(3);
});

describe('nested', () => {
  it('strong inside a describe', () => {
    const rows = [{ id: 'a' }, { id: 'b' }];
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe('a');
  });
});
