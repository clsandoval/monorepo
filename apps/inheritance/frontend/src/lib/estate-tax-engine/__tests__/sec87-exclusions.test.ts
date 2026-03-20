import { describe, it, expect } from 'vitest';
import { applySec87Exclusions } from '../sec87-exclusions';
import type { Sec87ExemptAsset } from '../types';

function makeAsset(exemptionType: string, fmv = 100_000_00): Sec87ExemptAsset {
  return {
    description: `Test asset (${exemptionType})`,
    exemptionType,
    fmv,
  };
}

describe('applySec87Exclusions', () => {
  it('returns empty log for empty input', () => {
    const { exclusionLog } = applySec87Exclusions([]);
    expect(exclusionLog).toHaveLength(0);
  });

  it('produces correct reason for USUFRUCT_MERGER', () => {
    const { exclusionLog } = applySec87Exclusions([makeAsset('USUFRUCT_MERGER')]);
    expect(exclusionLog).toHaveLength(1);
    expect(exclusionLog[0].exemptionType).toBe('USUFRUCT_MERGER');
    expect(exclusionLog[0].reason).toContain('Sec. 87(a)');
    expect(exclusionLog[0].reason).toContain('usufruct');
  });

  it('produces correct reason for FIDUCIARY', () => {
    const { exclusionLog } = applySec87Exclusions([makeAsset('FIDUCIARY')]);
    expect(exclusionLog).toHaveLength(1);
    expect(exclusionLog[0].exemptionType).toBe('FIDUCIARY');
    expect(exclusionLog[0].reason).toContain('Sec. 87(b)');
    expect(exclusionLog[0].reason).toContain('fiduciary');
  });

  it('produces correct reason for FIDEICOMMISSARY', () => {
    const { exclusionLog } = applySec87Exclusions([makeAsset('FIDEICOMMISSARY')]);
    expect(exclusionLog).toHaveLength(1);
    expect(exclusionLog[0].exemptionType).toBe('FIDEICOMMISSARY');
    expect(exclusionLog[0].reason).toContain('Sec. 87(c)');
    expect(exclusionLog[0].reason).toContain('Fideicommissary');
  });

  it('produces correct reason for CHARITABLE_PRIVATE', () => {
    const { exclusionLog } = applySec87Exclusions([makeAsset('CHARITABLE_PRIVATE')]);
    expect(exclusionLog).toHaveLength(1);
    expect(exclusionLog[0].exemptionType).toBe('CHARITABLE_PRIVATE');
    expect(exclusionLog[0].reason).toContain('Sec. 87(d)');
    expect(exclusionLog[0].reason).toContain('charitable');
  });

  it('logs asset description and FMV for audit trail', () => {
    const asset = makeAsset('USUFRUCT_MERGER', 5_000_000_00);
    const { exclusionLog } = applySec87Exclusions([asset]);
    expect(exclusionLog[0].assetDescription).toBe(asset.description);
    expect(exclusionLog[0].fmv).toBe(5_000_000_00);
  });

  it('processes multiple assets of different types', () => {
    const assets: Sec87ExemptAsset[] = [
      makeAsset('USUFRUCT_MERGER', 100_000_00),
      makeAsset('FIDUCIARY', 200_000_00),
      makeAsset('FIDEICOMMISSARY', 300_000_00),
      makeAsset('CHARITABLE_PRIVATE', 400_000_00),
    ];
    const { exclusionLog } = applySec87Exclusions(assets);
    expect(exclusionLog).toHaveLength(4);
    expect(exclusionLog[0].exemptionType).toBe('USUFRUCT_MERGER');
    expect(exclusionLog[1].exemptionType).toBe('FIDUCIARY');
    expect(exclusionLog[2].exemptionType).toBe('FIDEICOMMISSARY');
    expect(exclusionLog[3].exemptionType).toBe('CHARITABLE_PRIVATE');
  });

  it('handles unknown exemption type gracefully without throwing', () => {
    const asset: Sec87ExemptAsset = {
      description: 'Unknown asset',
      exemptionType: 'UNKNOWN_TYPE',
      fmv: 50_000_00,
    };
    const { exclusionLog } = applySec87Exclusions([asset]);
    expect(exclusionLog).toHaveLength(1);
    expect(exclusionLog[0].reason).toContain('UNKNOWN_TYPE');
  });
});
