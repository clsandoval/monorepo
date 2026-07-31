// Fixture for gate G13 (scripts/check-assertion-discipline.mjs), verdict UNDECLARED WEAK ASSERTION.
// Lives OUTSIDE frontend/src on purpose, so Vitest never collects it.
import { it, expect } from 'vitest';

it('only weak', () => {
  const v = { a: 1 };
  expect(v).toBeDefined();
});
