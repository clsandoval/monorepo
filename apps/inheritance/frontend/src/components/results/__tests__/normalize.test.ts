import { describe, it, expect } from 'vitest';
import { withOutputDefaults } from '../normalize';
import type { EngineOutput } from '../../../types';

describe('withOutputDefaults', () => {
  it('defaults every top-level array a stale output_json can be missing', () => {
    const out = withOutputDefaults({ succession_type: 'Intestate', scenario_code: 'I2' } as unknown as EngineOutput);
    expect(out.per_heir_shares).toEqual([]);
    expect(out.narratives).toEqual([]);
    expect(out.warnings).toEqual([]);
    expect(out.computation_log.steps).toEqual([]);
    // These three missing fields are exactly what crashed the results page in prod
    // ("Cannot read properties of undefined (reading 'length')").
  });

  it('defaults a share missing legal_basis without touching its money fields', () => {
    const out = withOutputDefaults({
      per_heir_shares: [{ heir_name: 'X', net_from_estate: { centavos: 5 } }],
      narratives: [],
      warnings: [],
      computation_log: { steps: [], total_restarts: 0, final_scenario: '' },
    } as unknown as EngineOutput);
    expect(out.per_heir_shares[0]!.legal_basis).toEqual([]);
    expect(out.per_heir_shares[0]!.net_from_estate.centavos).toBe(5);
  });

  it('leaves a complete output unchanged in content', () => {
    const full: EngineOutput = {
      per_heir_shares: [],
      narratives: [],
      warnings: [],
      computation_log: { steps: [], total_restarts: 0, final_scenario: 'I2' },
      succession_type: 'Intestate',
      scenario_code: 'I2',
    } as unknown as EngineOutput;
    expect(withOutputDefaults(full)).toEqual(full);
  });
});
