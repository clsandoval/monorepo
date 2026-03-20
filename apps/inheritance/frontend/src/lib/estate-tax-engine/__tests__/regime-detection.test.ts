import { describe, it, expect } from 'vitest';
import { detectRegime, checkAmnestyEligibility } from '../regime-detection';
import type { DecedentInfo, EstateFlags } from '../types';

// ── Fixture builders ──────────────────────────────────────────────────────────

function makeDecedent(dateOfDeath: string, isNRA = false): DecedentInfo {
  return {
    name: 'Test Decedent',
    tin: '000-000-000',
    dateOfDeath,
    isResident: true,
    isFilipino: !isNRA,
    isNRA,
    isMarried: false,
  };
}

function makeFlags(overrides: Partial<EstateFlags> = {}): EstateFlags {
  return {
    hasConjugalAssets: false,
    hasFamilyHome: false,
    hasNRAAssets: false,
    hasForeignAssets: false,
    taxFullyPaidBeforeMay2022: false,
    priorReturnFiled: false,
    previouslyDeclaredNetEstate: null,
    subjectToPCGGJurisdiction: false,
    hasRA3019Violations: false,
    hasRA9160Violations: false,
    hasPendingCourtCasePreAmnestyAct: false,
    hasUnexplainedWealthCases: false,
    hasPendingRPCFelonies: false,
    ...overrides,
  };
}

// ── detectRegime tests ────────────────────────────────────────────────────────

describe('detectRegime', () => {
  describe('TRAIN-era deaths (2018-01-01 and after)', () => {
    it('returns TRAIN regime for post-cutoff death, no amnesty', () => {
      const result = detectRegime(makeDecedent('2023-06-15'), makeFlags(), false);
      expect(result.regime).toBe('TRAIN');
      expect(result.deductionRules).toBe('TRAIN');
      expect(result.track).toBeNull();
      expect(result.displayDualPath).toBe(false);
      expect(result.amnestyEligible).toBe(false);
    });

    it('returns TRAIN with warning when amnesty elected but death is after 2022-05-31', () => {
      const result = detectRegime(makeDecedent('2023-01-01'), makeFlags(), true);
      expect(result.regime).toBe('TRAIN');
      expect(result.ineligibilityReason).toBe('DEATH_AFTER_COVERAGE_CUTOFF');
      expect(result.warnings.some((w) => w.includes('not available'))).toBe(true);
    });

    it('returns TRAIN exactly on TRAIN effective date (2018-01-01)', () => {
      const result = detectRegime(makeDecedent('2018-01-01'), makeFlags(), false);
      expect(result.regime).toBe('TRAIN');
      expect(result.deductionRules).toBe('TRAIN');
    });

    it('returns AMNESTY + TRAIN deduction rules for eligible 2018-2022 death with amnesty election', () => {
      const result = detectRegime(makeDecedent('2020-06-15'), makeFlags(), true);
      expect(result.regime).toBe('AMNESTY');
      expect(result.deductionRules).toBe('TRAIN');
      expect(result.amnestyEligible).toBe(true);
      expect(result.track).toBe('TRACK_A');
      expect(result.displayDualPath).toBe(false);
    });

    it('returns AMNESTY TRACK_B for 2018-2022 death with priorReturnFiled=true', () => {
      const flags = makeFlags({ priorReturnFiled: true, previouslyDeclaredNetEstate: 10_000_000 });
      const result = detectRegime(makeDecedent('2020-06-15'), flags, true);
      expect(result.regime).toBe('AMNESTY');
      expect(result.track).toBe('TRACK_B');
    });

    it('returns TRAIN when 2018-2022 death and amnesty elected but ineligible (PCGG)', () => {
      const flags = makeFlags({ subjectToPCGGJurisdiction: true });
      const result = detectRegime(makeDecedent('2020-06-15'), flags, true);
      expect(result.regime).toBe('TRAIN');
      expect(result.amnestyEligible).toBe(false);
      expect(result.ineligibilityReason).toBe('PCGG_EXCLUSION');
    });

    it('returns TRAIN with no amnesty warning when tax already paid', () => {
      const flags = makeFlags({ taxFullyPaidBeforeMay2022: true });
      const result = detectRegime(makeDecedent('2021-03-01'), flags, false);
      expect(result.regime).toBe('TRAIN');
      // Should NOT warn about amnesty because tax was already paid
      expect(result.warnings.some((w) => w.includes('eligible for estate tax amnesty'))).toBe(false);
    });

    it('returns TRAIN with amnesty hint when 2018-2022 death and amnesty NOT elected', () => {
      const result = detectRegime(makeDecedent('2020-01-01'), makeFlags(), false);
      expect(result.regime).toBe('TRAIN');
      expect(result.warnings.some((w) => w.includes('may have been eligible'))).toBe(true);
    });

    it('returns AMNESTY exactly on 2022-05-31 (boundary)', () => {
      const result = detectRegime(makeDecedent('2022-05-31'), makeFlags(), true);
      expect(result.regime).toBe('AMNESTY');
      expect(result.amnestyEligible).toBe(true);
    });

    it('returns TRAIN for death on 2022-06-01 (one day after cutoff)', () => {
      const result = detectRegime(makeDecedent('2022-06-01'), makeFlags(), true);
      expect(result.regime).toBe('TRAIN');
      expect(result.ineligibilityReason).toBe('DEATH_AFTER_COVERAGE_CUTOFF');
    });
  });

  describe('Pre-TRAIN deaths (before 2018-01-01)', () => {
    it('returns PRE_TRAIN regime for pre-2018 death, no amnesty', () => {
      const result = detectRegime(makeDecedent('2015-08-20'), makeFlags(), false);
      expect(result.regime).toBe('PRE_TRAIN');
      expect(result.deductionRules).toBe('PRE_TRAIN');
      expect(result.track).toBeNull();
      expect(result.displayDualPath).toBe(false);
    });

    it('returns PRE_TRAIN with amnesty hint when no amnesty elected', () => {
      const result = detectRegime(makeDecedent('2015-08-20'), makeFlags(), false);
      expect(result.warnings.some((w) => w.includes('amnesty'))).toBe(true);
    });

    it('returns AMNESTY with displayDualPath=true for eligible pre-TRAIN death with amnesty election', () => {
      const result = detectRegime(makeDecedent('2015-08-20'), makeFlags(), true);
      expect(result.regime).toBe('AMNESTY');
      expect(result.deductionRules).toBe('PRE_TRAIN');
      expect(result.amnestyEligible).toBe(true);
      expect(result.displayDualPath).toBe(true);
      expect(result.track).toBe('TRACK_A');
    });

    it('returns PRE_TRAIN when amnesty elected but ineligible (RA3019)', () => {
      const flags = makeFlags({ hasRA3019Violations: true });
      const result = detectRegime(makeDecedent('2010-01-01'), flags, true);
      expect(result.regime).toBe('PRE_TRAIN');
      expect(result.amnestyEligible).toBe(false);
      expect(result.ineligibilityReason).toBe('RA3019_EXCLUSION');
    });

    it('returns PRE_TRAIN for death just before TRAIN effective date (2017-12-31)', () => {
      const result = detectRegime(makeDecedent('2017-12-31'), makeFlags(), false);
      expect(result.regime).toBe('PRE_TRAIN');
      expect(result.deductionRules).toBe('PRE_TRAIN');
    });
  });
});

// ── checkAmnestyEligibility tests ─────────────────────────────────────────────

describe('checkAmnestyEligibility', () => {
  it('returns eligible=true with TRACK_A for clean pre-2022 estate', () => {
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), makeFlags());
    expect(result.eligible).toBe(true);
    expect(result.track).toBe('TRACK_A');
    expect(result.reason).toBeNull();
  });

  it('returns eligible=true with TRACK_B when priorReturnFiled=true', () => {
    const flags = makeFlags({ priorReturnFiled: true, previouslyDeclaredNetEstate: 5_000_000 });
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), flags);
    expect(result.eligible).toBe(true);
    expect(result.track).toBe('TRACK_B');
  });

  it('returns ineligible when death is after coverage cutoff', () => {
    const result = checkAmnestyEligibility(makeDecedent('2022-06-01'), makeFlags());
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('DEATH_AFTER_COVERAGE_CUTOFF');
    expect(result.track).toBeNull();
  });

  it('returns ineligible when tax already fully paid', () => {
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), makeFlags({ taxFullyPaidBeforeMay2022: true }));
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('TAX_ALREADY_PAID');
  });

  it('returns ineligible PCGG_EXCLUSION', () => {
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), makeFlags({ subjectToPCGGJurisdiction: true }));
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('PCGG_EXCLUSION');
  });

  it('returns ineligible RA3019_EXCLUSION', () => {
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), makeFlags({ hasRA3019Violations: true }));
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('RA3019_EXCLUSION');
  });

  it('returns ineligible RA9160_EXCLUSION', () => {
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), makeFlags({ hasRA9160Violations: true }));
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('RA9160_EXCLUSION');
  });

  it('returns ineligible PENDING_COURT_CASE_EXCLUSION', () => {
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), makeFlags({ hasPendingCourtCasePreAmnestyAct: true }));
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('PENDING_COURT_CASE_EXCLUSION');
  });

  it('returns ineligible UNEXPLAINED_WEALTH_EXCLUSION', () => {
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), makeFlags({ hasUnexplainedWealthCases: true }));
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('UNEXPLAINED_WEALTH_EXCLUSION');
  });

  it('returns ineligible RPC_FELONY_EXCLUSION', () => {
    const result = checkAmnestyEligibility(makeDecedent('2015-01-01'), makeFlags({ hasPendingRPCFelonies: true }));
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('RPC_FELONY_EXCLUSION');
  });

  it('is eligible for death exactly on 2022-05-31 (coverage cutoff boundary)', () => {
    const result = checkAmnestyEligibility(makeDecedent('2022-05-31'), makeFlags());
    expect(result.eligible).toBe(true);
    expect(result.track).toBe('TRACK_A');
  });

  it('is ineligible for death on 2022-06-01 (one day after cutoff)', () => {
    const result = checkAmnestyEligibility(makeDecedent('2022-06-01'), makeFlags());
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('DEATH_AFTER_COVERAGE_CUTOFF');
  });

  it('is eligible for death exactly on 2018-01-01 (TRAIN effective date boundary)', () => {
    const result = checkAmnestyEligibility(makeDecedent('2018-01-01'), makeFlags());
    expect(result.eligible).toBe(true);
  });
});
