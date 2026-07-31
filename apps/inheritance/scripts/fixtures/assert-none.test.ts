// Fixture for gate G13 (scripts/check-assertion-discipline.mjs), verdict ASSERTION-FREE TEST.
// Lives OUTSIDE frontend/src on purpose, so Vitest never collects it.
import { it } from 'vitest';

it('does nothing', () => {
  const x = 1;
  void x;
});
