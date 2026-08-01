/**
 * Penalties — the single implementation of everything this engine knows about
 * a late estate-tax return, and the single site of its refusal to say more.
 *
 * A Philippine estate that walks into a small firm is usually years late, and
 * the first question asked at the first consultation is what the lateness
 * costs. Until this module existed the engine answered that question with
 * three hardcoded zeros and a total silently equal to the base tax, which is
 * the one failure mode this project ranks as worse than a loud stop: a return
 * that understates what the client owes, on a page a lawyer signs.
 *
 * **What this module computes.** Two things, both transcriptions of a spec
 * sentence rather than statements of law. `specs/estate-tax-engine-spec.md`
 * section 21 states the filing deadline — one year from the date of death for
 * a TRAIN-era death, six months for a pre-TRAIN death — so the deadline and
 * the whole-day count from it to an entered filing date are computed here.
 *
 * **What this module refuses.** The surcharge, the interest and the compromise
 * penalty. The refusal is not a matter of effort; it is a matter of authority.
 * `specs/estate-tax-engine-spec.md` section 1 lists *"Compute surcharges,
 * interest, or penalties for late filing"* under **What the engine does NOT
 * do**, and section 2 lists *"Surcharges, interest, compromise penalties"*
 * under **Out of Scope**. No rate, no base and no accrual window for NIRC
 * Sec. 248 or NIRC Sec. 249 is stated anywhere in this repository.
 * `.planning/NEW-LEGAL-RULE.md` Step 1 makes writing a rule that no spec
 * states a point of Philippine law, and `CLAUDE.md` invariant 6 forbids any
 * agent from deciding one. So each of the three becomes a line that names the
 * section governing it, carries `centavos: null`, and points at the recorded
 * question whose answer would let it be computed.
 *
 * **Why `null` and never `0`.** A zero is a claim that nothing is owed. On a
 * printed return the two are indistinguishable, and only one of them is
 * honest. `centavos` is therefore `number | null`, so `strict` mode forces
 * every reader to handle the absence rather than coerce it.
 *
 * The three questions are recorded in `.planning/LAWYER-AGENDA.md` with
 * matching objects in `.planning/lawyer-decisions.json`, held against each
 * other by gate `G10`:
 *
 * LAWYER-DECISION: LAWYER-10
 * LAWYER-DECISION: LAWYER-11
 * LAWYER-DECISION: LAWYER-12
 *
 * This module is the ONLY site of the deadline rule, the lateness rule, the
 * three declined lines, the sum rule and the refusal text, per `CLAUDE.md`
 * invariant 5. The TRAIN boundary is not restated here — it is read from
 * `getDeductionRules` in `frontend/src/types/estate-tax.ts`. Nothing in this
 * file reads the wall clock, so the same fact set always produces the same
 * lateness. Gate `G36` (`frontend/scripts/check-penalty-refusal.ts`) asserts
 * that the numeric literals in this file stay inside a fixed whitelist, which
 * is what makes an invented rate visible the moment it is introduced.
 */
import { getDeductionRules } from '@/types/estate-tax';

// ── Sections and authorities ────────────────────────────────────────────────

/** The section that imposes the surcharge on a late return. */
export const SURCHARGE_SECTION = 'NIRC Sec. 248';

/** The section that imposes interest on a deficiency. */
export const INTEREST_SECTION = 'NIRC Sec. 249';

/**
 * The compromise penalty has no governing section in this engine, because no
 * schedule for it is stated in either spec. The authority cited on that line
 * is therefore the spec sentence that places it outside the engine.
 */
export const COMPROMISE_PENALTY_AUTHORITY = 'specs/estate-tax-engine-spec.md §2 Out of Scope';

/** The spec section the statutory filing deadline is transcribed from. */
export const FILING_DEADLINE_AUTHORITY = 'specs/estate-tax-engine-spec.md §21 Filing Rules';

// ── Recorded questions ──────────────────────────────────────────────────────

/** Registry id of the surcharge question. */
export const SURCHARGE_LAWYER_DECISION = 'LAWYER-10';

/** Registry id of the interest question. */
export const INTEREST_LAWYER_DECISION = 'LAWYER-11';

/** Registry id of the compromise-penalty question. */
export const COMPROMISE_PENALTY_LAWYER_DECISION = 'LAWYER-12';

// ── Reasons ─────────────────────────────────────────────────────────────────

/** Why the surcharge line carries no amount. */
export const SURCHARGE_DECLINED_REASON =
  'The surcharge that NIRC Sec. 248 imposes on a late return is not computed by this engine. '
  + 'No rate, base or accrual rule for NIRC Sec. 248 is stated in '
  + 'specs/estate-tax-engine-spec.md, which places surcharges out of scope, and no agent may '
  + 'supply one. The question is recorded as LAWYER-10, awaiting-answer.';

/** Why the interest line carries no amount. */
export const INTEREST_DECLINED_REASON =
  'The interest that NIRC Sec. 249 imposes on a deficiency is not computed by this engine. '
  + 'No rate, base or accrual rule for NIRC Sec. 249 is stated in '
  + 'specs/estate-tax-engine-spec.md, which places interest out of scope, and no agent may '
  + 'supply one. The question is recorded as LAWYER-11, awaiting-answer.';

/** Why the compromise-penalty line carries no amount. */
export const COMPROMISE_PENALTY_DECLINED_REASON =
  'A compromise penalty is outside the competence of this engine. No schedule for it, and so '
  + 'no rate, base or accrual rule, is stated in either specs/estate-tax-engine-spec.md or '
  + 'specs/succession-engine-spec.md; the first of those lists compromise penalties out of '
  + 'scope. The question is recorded as LAWYER-12, awaiting-answer.';

// ── Refusal text ────────────────────────────────────────────────────────────

/** The first sentence printed wherever a total amount due would otherwise go. */
export const PENALTY_REFUSAL_HEADLINE = 'This figure is not a total amount due.';

/** Printed when the lateness cannot be determined because no date of death is on file. */
export const LATENESS_UNDETERMINED_NO_DEATH_DATE =
  'How late this return is cannot be determined, because no date of death is on file. '
  + 'Enter it on the Decedent step of the succession wizard.';

/** Printed when the lateness cannot be determined because no filing date was entered. */
export const LATENESS_UNDETERMINED_NO_FILING_DATE =
  'How late this return is cannot be determined, because no assumed filing date was entered. '
  + 'Enter it on the Filing tab of the estate-tax wizard.';

/** Prefix of the manual-review warning this module raises into the engine warnings. */
export const PENALTY_MANUAL_REVIEW_PREFIX = 'MANUAL REVIEW — PENALTIES NOT COMPUTED:';

// ── Deadline periods ────────────────────────────────────────────────────────

/** Months from the date of death to the filing deadline for a TRAIN-era death. */
export const DEADLINE_MONTHS_TRAIN = 12;

/** Months from the date of death to the filing deadline for a pre-TRAIN death. */
export const DEADLINE_MONTHS_PRE_TRAIN = 6;

/** Milliseconds in one whole day, used for the day count. */
export const MILLISECONDS_PER_DAY = 86400000;

/** ISO-8601 `YYYY-MM-DD`, spelled without a quantifier so it holds no digits. */
const ISO_DATE_SHAPE = /^\d\d\d\d-\d\d-\d\d$/;

// ── Types ───────────────────────────────────────────────────────────────────

/** The three lines that sit between the base tax and a total amount due. */
export type PenaltyLineId = 'surcharge' | 'interest' | 'compromise_penalty';

/** One line of the penalty block, whether computed or refused. */
export interface PenaltyLine {
  /** Stable machine id, used to project the line onto the flat output fields. */
  id: PenaltyLineId;
  /** What a lawyer reads on the return. */
  label: string;
  /** The section or spec sentence that governs this line. Never empty. */
  authority: string;
  /**
   * The amount in centavos, or `null` when the engine does not know it.
   * `null` means the engine does not know; `0` would be a claim that nothing
   * is owed, and the two must never be confused on a printed return.
   */
  centavos: number | null;
  /** `declined` means no amount exists yet; `determined` means one does. */
  status: 'determined' | 'declined';
  /** Why the amount is absent, or `null` on a determined line. */
  declinedReason: string | null;
  /** Registry id of the question that would resolve this line, or `null`. */
  lawyerDecision: string | null;
}

/** How late a return is, once both dates are known. */
export interface FilingLateness {
  /** ISO date the return was due. */
  statutoryDeadline: string;
  /** Months added to the date of death to reach that deadline. */
  deadlineMonths: number;
  /** The spec sentence the deadline is transcribed from. */
  deadlineAuthority: string;
  /** ISO date the return is assumed to be filed on. */
  filingDate: string;
  /** Whole days from the deadline to the filing date, floored at zero. */
  daysLate: number;
  /** True when the filing date is after the deadline. */
  isLate: boolean;
}

/**
 * The lateness, or a refusal carrying the reason. A refusal is a variant of
 * the union rather than a `null`, in the shape `lib/fact-set.ts` uses, so a
 * caller cannot read a day count without first handling the absence.
 */
export type LatenessVerdict =
  | { kind: 'determined'; lateness: FilingLateness }
  | { kind: 'undetermined'; reason: string };

/** The whole penalty block, as the engine publishes it. */
export interface PenaltyAssessment {
  /** How late the return is, or why that is unknown. */
  lateness: LatenessVerdict;
  /** Surcharge, interest and compromise penalty, in that fixed order. */
  lines: readonly [PenaltyLine, PenaltyLine, PenaltyLine];
  /** True only when every line carries an amount. */
  complete: boolean;
  /** The total, or `null` while any line is declined. */
  totalAmountDue: number | null;
  /** The sentence printed in place of a total, or `''` when complete. */
  refusal: string;
}

// ── The deadline and the lateness ───────────────────────────────────────────

/**
 * The ISO date on which the return was due, or `null` when the date of death
 * is absent or malformed.
 *
 * The period comes from `getDeductionRules`, so the TRAIN boundary is read
 * rather than restated. A day that does not exist in the target month is
 * clamped to that month's last day, which is why a 2015-03-31 death is due
 * 2015-09-30 rather than rolling into October.
 */
export function statutoryFilingDeadline(dateOfDeath: string): string | null {
  const trimmed = dateOfDeath.trim();
  if (!ISO_DATE_SHAPE.test(trimmed)) return null;

  const months =
    getDeductionRules(trimmed) === 'PRE_TRAIN' ? DEADLINE_MONTHS_PRE_TRAIN : DEADLINE_MONTHS_TRAIN;

  const parts = trimmed.split('-');
  const year = parseInt(parts[0] ?? '', 10);
  const month = parseInt(parts[1] ?? '', 10);
  const day = parseInt(parts[2] ?? '', 10);

  const targetFirst = new Date(Date.UTC(year, month - 1 + months, 1));
  const targetYear = targetFirst.getUTCFullYear();
  const targetMonthIndex = targetFirst.getUTCMonth();
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonthIndex + 1, 0)).getUTCDate();
  const targetDay = day > lastDayOfTargetMonth ? lastDayOfTargetMonth : day;

  const monthText = String(targetMonthIndex + 1).padStart(2, '0');
  const dayText = String(targetDay).padStart(2, '0');
  return `${targetYear}-${monthText}-${dayText}`;
}

/**
 * How late the return is, or a refusal naming which date is missing.
 *
 * An absent date is `undetermined`, never `daysLate: 0`. A zero day count
 * means the return was filed on time; it must never also mean the engine does
 * not know.
 */
export function filingLateness(dateOfDeath: string, filingDate: string): LatenessVerdict {
  const deadline = statutoryFilingDeadline(dateOfDeath);
  if (deadline === null) {
    return { kind: 'undetermined', reason: LATENESS_UNDETERMINED_NO_DEATH_DATE };
  }

  const filed = filingDate.trim();
  if (!ISO_DATE_SHAPE.test(filed)) {
    return { kind: 'undetermined', reason: LATENESS_UNDETERMINED_NO_FILING_DATE };
  }

  const months =
    getDeductionRules(dateOfDeath.trim()) === 'PRE_TRAIN'
      ? DEADLINE_MONTHS_PRE_TRAIN
      : DEADLINE_MONTHS_TRAIN;

  const elapsed = isoToUtcMillis(filed) - isoToUtcMillis(deadline);
  const wholeDays = Math.floor(elapsed / MILLISECONDS_PER_DAY);
  const daysLate = Math.max(0, wholeDays);

  return {
    kind: 'determined',
    lateness: {
      statutoryDeadline: deadline,
      deadlineMonths: months,
      deadlineAuthority: FILING_DEADLINE_AUTHORITY,
      filingDate: filed,
      daysLate,
      isLate: daysLate > 0,
    },
  };
}

/** Midnight UTC of an ISO date already known to match `ISO_DATE_SHAPE`. */
function isoToUtcMillis(iso: string): number {
  const parts = iso.split('-');
  const year = parseInt(parts[0] ?? '', 10);
  const month = parseInt(parts[1] ?? '', 10);
  const day = parseInt(parts[2] ?? '', 10);
  return Date.UTC(year, month - 1, day);
}

// ── The three declined lines, the sum rule and the assessment ───────────────

/**
 * The three lines, in the fixed order surcharge, interest, compromise
 * penalty. Every one is declined, and no line is constructed with a zero
 * amount anywhere in this module.
 */
export function declinedPenaltyLines(): readonly [PenaltyLine, PenaltyLine, PenaltyLine] {
  return [
    {
      id: 'surcharge',
      label: 'Surcharge',
      authority: SURCHARGE_SECTION,
      centavos: null,
      status: 'declined',
      declinedReason: SURCHARGE_DECLINED_REASON,
      lawyerDecision: SURCHARGE_LAWYER_DECISION,
    },
    {
      id: 'interest',
      label: 'Interest',
      authority: INTEREST_SECTION,
      centavos: null,
      status: 'declined',
      declinedReason: INTEREST_DECLINED_REASON,
      lawyerDecision: INTEREST_LAWYER_DECISION,
    },
    {
      id: 'compromise_penalty',
      label: 'Compromise penalty',
      authority: COMPROMISE_PENALTY_AUTHORITY,
      centavos: null,
      status: 'declined',
      declinedReason: COMPROMISE_PENALTY_DECLINED_REASON,
      lawyerDecision: COMPROMISE_PENALTY_LAWYER_DECISION,
    },
  ];
}

/**
 * The base tax plus every line, or `null` when any line is declined or when
 * no line was supplied at all.
 *
 * Exact integer addition over centavos. No rounding, no float, no tolerance.
 * The rule is implemented and tested before any line is determined, so that
 * when a lawyer does answer, the total is a rule that was reviewed rather
 * than one invented under pressure.
 */
export function sumTotalAmountDue(
  estateTaxDue: number,
  lines: readonly PenaltyLine[],
): number | null {
  if (lines.length === 0) return null;
  let total = estateTaxDue;
  for (const line of lines) {
    if (line.centavos === null) return null;
    total = total + line.centavos;
  }
  return total;
}

/** The sentence printed on the face of the return in place of a total. */
export function penaltyRefusalText(lateness: LatenessVerdict): string {
  let latenessSentence: string;
  if (lateness.kind === 'undetermined') {
    latenessSentence = lateness.reason;
  } else if (lateness.lateness.isLate) {
    latenessSentence =
      'This return was due on '
      + lateness.lateness.statutoryDeadline
      + ' ('
      + FILING_DEADLINE_AUTHORITY
      + ') and is '
      + String(lateness.lateness.daysLate)
      + ' days late.';
  } else {
    latenessSentence =
      'This return was due on '
      + lateness.lateness.statutoryDeadline
      + ' ('
      + FILING_DEADLINE_AUTHORITY
      + ') and was not late.';
  }

  return (
    PENALTY_REFUSAL_HEADLINE
    + ' '
    + latenessSentence
    + ' The surcharge under '
    + SURCHARGE_SECTION
    + ' and the interest under '
    + INTEREST_SECTION
    + ' are not computed by this engine, and a compromise penalty is outside its competence. '
    + 'The three questions are recorded as '
    + SURCHARGE_LAWYER_DECISION
    + ', '
    + INTEREST_LAWYER_DECISION
    + ' and '
    + COMPROMISE_PENALTY_LAWYER_DECISION
    + '.'
  );
}

/** The whole penalty block for one fact set. */
export function assessPenalties(
  dateOfDeath: string,
  filingDate: string,
  estateTaxDue: number,
): PenaltyAssessment {
  const lateness = filingLateness(dateOfDeath, filingDate);
  const lines = declinedPenaltyLines();
  const complete = lines.every((line) => line.status === 'determined');
  return {
    lateness,
    lines,
    complete,
    totalAmountDue: complete ? sumTotalAmountDue(estateTaxDue, lines) : null,
    refusal: complete ? '' : penaltyRefusalText(lateness),
  };
}

/**
 * The manual-review warning the pipeline pushes into `warnings`, so the
 * refusal reaches the existing warnings surface rather than only the return.
 */
export function penaltyManualReviewWarning(assessment: PenaltyAssessment): string {
  return PENALTY_MANUAL_REVIEW_PREFIX + ' ' + assessment.refusal;
}
