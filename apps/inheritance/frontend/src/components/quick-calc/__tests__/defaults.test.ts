import { describe, it, expect } from 'vitest';
import { buildEngineInput, type QuickCalcHeir } from '../defaults';
import { EngineInputSchema } from '@/schemas';

describe('buildEngineInput', () => {
  it('builds valid EngineInput for spouse + 2 legitimate children', () => {
    const heirs: QuickCalcHeir[] = [
      { type: 'SurvivingSpouse' },
      { type: 'LegitimateChild' },
      { type: 'LegitimateChild' },
    ];
    const input = buildEngineInput(1_000_000_00, heirs); // 1M pesos in centavos
    const result = EngineInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('builds valid EngineInput for illegitimate child (sets filiation defaults)', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'IllegitimateChild' }];
    const input = buildEngineInput(500_000_00, heirs);
    const result = EngineInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    expect(input.family_tree[0].filiation_proved).toBe(true);
    expect(input.family_tree[0].filiation_proof_type).toBe('BirthCertificate');
  });

  it('builds valid EngineInput for father + mother (sets line defaults)', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'Father' }, { type: 'Mother' }];
    const input = buildEngineInput(500_000_00, heirs);
    const result = EngineInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    expect(input.family_tree[0].line).toBe('Paternal');
    expect(input.family_tree[1].line).toBe('Maternal');
  });

  it('builds valid EngineInput for siblings (sets blood_type default)', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'Brother' }, { type: 'Sister' }];
    const input = buildEngineInput(500_000_00, heirs);
    const result = EngineInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    expect(input.family_tree[0].blood_type).toBe('Full');
    expect(input.family_tree[1].blood_type).toBe('Full');
  });

  it('sets is_married=true and date_of_marriage when spouse present', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'SurvivingSpouse' }];
    const input = buildEngineInput(500_000_00, heirs);
    expect(input.decedent.is_married).toBe(true);
    expect(input.decedent.date_of_marriage).not.toBeNull();
  });

  it('sets is_married=false when no spouse present', () => {
    const heirs: QuickCalcHeir[] = [{ type: 'LegitimateChild' }];
    const input = buildEngineInput(500_000_00, heirs);
    expect(input.decedent.is_married).toBe(false);
    expect(input.decedent.date_of_marriage).toBeNull();
  });

  it('auto-generates unique heir names', () => {
    const heirs: QuickCalcHeir[] = [
      { type: 'LegitimateChild' },
      { type: 'LegitimateChild' },
      { type: 'LegitimateChild' },
    ];
    const input = buildEngineInput(500_000_00, heirs);
    const names = input.family_tree.map(p => p.name);
    expect(new Set(names).size).toBe(3);
    expect(names[0]).toBe('Child 1');
    expect(names[1]).toBe('Child 2');
    expect(names[2]).toBe('Child 3');
  });
});
