/**
 * Penalties — unit suite.
 *
 * Source of truth: `specs/estate-tax-engine-spec.md` §21 for the statutory
 * filing deadline (1 year TRAIN / 6 months pre-TRAIN), and the two committed
 * worked examples in `loops/reverse/estate-tax/analysis/filing-rules.md`
 * lines 261 and 263.
 *
 * Source of truth for why the three money lines carry no amount:
 * `.planning/phases/20-nirc-248-249-surcharge-and-interest/20-RESEARCH.md` §0.
 * `specs/estate-tax-engine-spec.md` §1 places "Compute surcharges, interest,
 * or penalties for late filing" under What the engine does NOT do, and §2
 * places "Surcharges, interest, compromise penalties" under Out of Scope.
 *
 * A refusal is trivially easy to fake: a module returning `null` from every
 * function satisfies any test that only asserts `null`. Every negative
 * assertion below is therefore paired with a positive one on the same object —
 * an exact deadline date, a positive day count, a section string, or an exact
 * integer sum over injected determined lines.
 */
import { describe, it, expect } from 'vitest';
import {
  COMPROMISE_PENALTY_AUTHORITY,
  COMPROMISE_PENALTY_LAWYER_DECISION,
  INTEREST_SECTION,
  LATENESS_UNDETERMINED_NO_DEATH_DATE,
  LATENESS_UNDETERMINED_NO_FILING_DATE,
  PENALTY_MANUAL_REVIEW_PREFIX,
  SURCHARGE_SECTION,
  assessPenalties,
  declinedPenaltyLines,
  filingLateness,
  penaltyManualReviewWarning,
  statutoryFilingDeadline,
  sumTotalAmountDue,
} from '../penalties';
import type { PenaltyLine } from '../penalties';

/** A determined line, used only to exercise the sum rule. */
function determinedLine(id: PenaltyLine['id'], centavos: number): PenaltyLine {
  return {
    id,
    label: id,
    authority: 'test fixture',
    centavos,
    status: 'determined',
    declinedReason: null,
    lawyerDecision: null,
  };
}

describe('statutoryFilingDeadline', () => {
  it('gives a TRAIN death one year — the committed 2020-06-15 worked example', () => {
    expect(statutoryFilingDeadline('2020-06-15')).toBe('2021-06-15');
  });

  it('clamps to the month end — the committed 2015-03-31 pre-TRAIN worked example', () => {
    expect(statutoryFilingDeadline('2015-03-31')).toBe('2015-09-30');
  });

  it('treats the TRAIN boundary day itself as TRAIN', () => {
    expect(statutoryFilingDeadline('2018-01-01')).toBe('2019-01-01');
  });

  it('treats the day before the boundary as pre-TRAIN', () => {
    expect(statutoryFilingDeadline('2017-12-31')).toBe('2018-06-30');
  });

  it('carries a leap day through six months without clamping', () => {
    expect(statutoryFilingDeadline('2016-02-29')).toBe('2016-08-29');
  });

  it('returns null for an empty date of death', () => {
    expect(statutoryFilingDeadline('')).toBeNull();
  });

  it('returns null for a non-date string', () => {
    expect(statutoryFilingDeadline('not-a-date')).toBeNull();
  });

  it('returns null for an unpadded ISO-looking date', () => {
    expect(statutoryFilingDeadline('2020-6-15')).toBeNull();
  });
});

describe('filingLateness', () => {
  it('counts the exact whole days a four-year-late TRAIN return is late', () => {
    const verdict = filingLateness('2020-06-15', '2025-06-15');
    expect(verdict.kind).toBe('determined');
    if (verdict.kind !== 'determined') throw new Error('expected determined');
    expect(verdict.lateness.isLate).toBe(true);
    expect(verdict.lateness.daysLate).toBe(1461);
    expect(verdict.lateness.statutoryDeadline).toBe('2021-06-15');
    expect(verdict.lateness.deadlineMonths).toBe(12);
    expect(verdict.lateness.filingDate).toBe('2025-06-15');
  });

  it('reports zero days and not late when filed exactly on the deadline', () => {
    const verdict = filingLateness('2020-06-15', '2021-06-15');
    expect(verdict.kind).toBe('determined');
    if (verdict.kind !== 'determined') throw new Error('expected determined');
    expect(verdict.lateness.isLate).toBe(false);
    expect(verdict.lateness.daysLate).toBe(0);
  });

  it('floors the day count at zero when filed before the deadline', () => {
    const verdict = filingLateness('2020-06-15', '2021-06-01');
    expect(verdict.kind).toBe('determined');
    if (verdict.kind !== 'determined') throw new Error('expected determined');
    expect(verdict.lateness.daysLate).toBe(0);
    expect(verdict.lateness.isLate).toBe(false);
  });

  it('refuses rather than reporting zero days when the date of death is absent', () => {
    const verdict = filingLateness('', '2025-06-15');
    expect(verdict.kind).toBe('undetermined');
    if (verdict.kind !== 'undetermined') throw new Error('expected undetermined');
    expect(verdict.reason).toBe(LATENESS_UNDETERMINED_NO_DEATH_DATE);
  });

  it('refuses rather than reporting zero days when the filing date is absent', () => {
    const verdict = filingLateness('2020-06-15', '');
    expect(verdict.kind).toBe('undetermined');
    if (verdict.kind !== 'undetermined') throw new Error('expected undetermined');
    expect(verdict.reason).toBe(LATENESS_UNDETERMINED_NO_FILING_DATE);
  });
});

describe('declinedPenaltyLines', () => {
  it('returns exactly three lines', () => {
    expect(declinedPenaltyLines()).toHaveLength(3);
  });

  it('returns them in the fixed order surcharge, interest, compromise penalty', () => {
    expect(declinedPenaltyLines().map((line) => line.id)).toEqual([
      'surcharge',
      'interest',
      'compromise_penalty',
    ]);
  });

  it('gives every line a null amount and a declined status, never a zero', () => {
    for (const line of declinedPenaltyLines()) {
      expect(line.centavos).toBeNull();
      expect(line.status).toBe('declined');
    }
  });

  it('names the governing section on every line and points each at a recorded question', () => {
    const [surcharge, interest, compromise] = declinedPenaltyLines();
    expect(surcharge.authority).toBe(SURCHARGE_SECTION);
    expect(interest.authority).toBe(INTEREST_SECTION);
    expect(compromise.authority).toBe(COMPROMISE_PENALTY_AUTHORITY);
    expect(surcharge.lawyerDecision).not.toBeNull();
    expect(interest.lawyerDecision).not.toBeNull();
    expect(compromise.lawyerDecision).toBe(COMPROMISE_PENALTY_LAWYER_DECISION);
    for (const line of declinedPenaltyLines()) {
      expect(line.declinedReason).not.toBeNull();
      expect(line.authority.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('sumTotalAmountDue', () => {
  it('adds the base tax and three determined lines to an exact integer', () => {
    const lines = [
      determinedLine('surcharge', 100),
      determinedLine('interest', 200),
      determinedLine('compromise_penalty', 300),
    ];
    expect(sumTotalAmountDue(1_000_000, lines)).toBe(1_000_600);
  });

  it('returns null when any one of the three lines is declined', () => {
    const [declined] = declinedPenaltyLines();
    expect(
      sumTotalAmountDue(1_000_000, [
        declined,
        determinedLine('interest', 200),
        determinedLine('compromise_penalty', 300),
      ]),
    ).toBeNull();
    expect(
      sumTotalAmountDue(1_000_000, [
        determinedLine('surcharge', 100),
        declined,
        determinedLine('compromise_penalty', 300),
      ]),
    ).toBeNull();
    expect(
      sumTotalAmountDue(1_000_000, [
        determinedLine('surcharge', 100),
        determinedLine('interest', 200),
        declined,
      ]),
    ).toBeNull();
  });

  it('returns null over an empty set of lines', () => {
    expect(sumTotalAmountDue(1_000_000, [])).toBeNull();
  });

  it('sums a determined zero rather than treating it as unknown', () => {
    const lines = [
      determinedLine('surcharge', 1),
      determinedLine('interest', 2),
      determinedLine('compromise_penalty', 0),
    ];
    expect(sumTotalAmountDue(1_000_000, lines)).toBe(1_000_003);
  });
});

describe('assessPenalties', () => {
  it('refuses the total on a late estate while naming both sections', () => {
    const assessment = assessPenalties('2020-06-15', '2025-06-15', 1_000_000);
    expect(assessment.complete).toBe(false);
    expect(assessment.totalAmountDue).toBeNull();
    expect(assessment.refusal).toContain('NIRC Sec. 248');
    expect(assessment.refusal).toContain('NIRC Sec. 249');
    expect(assessment.lateness.kind).toBe('determined');
  });

  it('still refuses the total when the date of death is absent', () => {
    const assessment = assessPenalties('', '2025-06-15', 1_000_000);
    expect(assessment.lateness.kind).toBe('undetermined');
    expect(assessment.totalAmountDue).toBeNull();
  });

  it('names all three recorded questions in the refusal', () => {
    const { refusal } = assessPenalties('2020-06-15', '2025-06-15', 1_000_000);
    expect(refusal).toContain('LAWYER-10');
    expect(refusal).toContain('LAWYER-11');
    expect(refusal).toContain('LAWYER-12');
  });

  it('raises a manual-review warning carrying the refusal verbatim', () => {
    const assessment = assessPenalties('2020-06-15', '2025-06-15', 1_000_000);
    const warning = penaltyManualReviewWarning(assessment);
    expect(warning.startsWith(PENALTY_MANUAL_REVIEW_PREFIX)).toBe(true);
    expect(warning).toContain(assessment.refusal);
  });

  it('prints no currency figure in the refusal and holds a null total, not a falsy one', () => {
    const assessment = assessPenalties('2020-06-15', '2025-06-15', 1_000_000);
    expect(assessment.refusal).not.toContain('0.00');
    expect(assessment.totalAmountDue).toBeNull();
    for (const line of assessment.lines) {
      expect(line.centavos).toBeNull();
    }
  });

  it('moves the deadline with the date of death across the TRAIN boundary', () => {
    const train = assessPenalties('2020-06-15', '2025-06-15', 1_000_000).lateness;
    const preTrain = assessPenalties('2015-03-31', '2025-06-15', 1_000_000).lateness;
    if (train.kind !== 'determined') throw new Error('expected determined');
    if (preTrain.kind !== 'determined') throw new Error('expected determined');
    expect(train.lateness.statutoryDeadline).toBe('2021-06-15');
    expect(preTrain.lateness.statutoryDeadline).toBe('2015-09-30');
    expect(train.lateness.daysLate).not.toBe(preTrain.lateness.daysLate);
    expect(preTrain.lateness.daysLate).toBeGreaterThan(train.lateness.daysLate);
  });
});
