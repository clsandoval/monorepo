import type { Domicile, CorpType, REBracket, ReportType, ViolationType } from "./types";
import { lookupPenalty } from "./penalty-schedule";
import { generateExpectedFilings } from "./timeline";

// Input types specific to the computePenalties function
// (distinct from ComputationInput in types.ts which uses a different shape)

export interface FilingReport {
  reportType: ReportType;
  year: number;
  status: "not_filed" | "filed_late" | "filed_on_time";
}

export interface PenaltyInput {
  domicile: Domicile;
  corpType: CorpType;
  reBracket: REBracket;
  mc28Compliant: boolean;
  filedReports: FilingReport[];
  incorporationYear: number;
  currentDate: Date;
}

export interface PenaltyLineItem {
  year: number;
  reportType: ReportType;
  violationType: ViolationType;
  offenseNumber: number;
  basePenalty: number;
  surchargeMonths: number;
  surchargeRate: number;
  totalPenalty: number;
  revocationSurcharge?: boolean;
}

export interface BOPenaltyItem {
  year: number;
  daysOverdue: number;
  totalPenalty: number;
}

export interface PenaltyResult {
  lineItems: PenaltyLineItem[];
  boPenalties: BOPenaltyItem[];
  mc28Penalty: number;
  totalPenalty: number;
}

const BO_DAILY_RATE = 1000;
const BO_CAP = 2_000_000;
const MC28_PENALTY = 20_000;

/**
 * Compute the number of full months between two dates.
 * Returns 0 if deadline is in the future relative to currentDate.
 */
function fullMonthsBetween(deadline: Date, currentDate: Date): number {
  if (currentDate <= deadline) return 0;
  const years = currentDate.getFullYear() - deadline.getFullYear();
  const months = currentDate.getMonth() - deadline.getMonth();
  const days = currentDate.getDate() - deadline.getDate();
  let total = years * 12 + months;
  if (days < 0) total -= 1;
  return Math.max(0, total);
}

/**
 * Compute days between deadline and currentDate (inclusive of deadline day).
 */
function daysBetween(deadline: Date, currentDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor((currentDate.getTime() - deadline.getTime()) / msPerDay));
}

export function computePenalties(input: PenaltyInput): PenaltyResult {
  const {
    domicile,
    corpType,
    reBracket,
    mc28Compliant,
    filedReports,
    incorporationYear,
    currentDate,
  } = input;

  const currentYear = currentDate.getFullYear();

  // Generate all expected filings
  const expected = generateExpectedFilings({ incorporationYear, currentYear });

  // Build a set of filings that are NOT missed
  // A filing is "filed" if it appears in filedReports with status != "not_filed"
  const filedSet = new Set<string>();
  for (const r of filedReports) {
    if (r.status !== "not_filed") {
      filedSet.add(`${r.reportType}-${r.year}`);
    }
  }

  // Separate expected filings by type; only include if deadline has passed
  const missedGISAFS = expected.filter(
    (f) =>
      f.reportType !== "BO" &&
      !filedSet.has(`${f.reportType}-${f.year}`) &&
      new Date(f.deadline) <= currentDate
  );
  const missedBO = expected.filter(
    (f) =>
      f.reportType === "BO" &&
      !filedSet.has(`${f.reportType}-${f.year}`) &&
      new Date(f.deadline) <= currentDate
  );

  // Sort missed GIS/AFS by year (chronological) for offense counting
  missedGISAFS.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.reportType.localeCompare(b.reportType);
  });

  // Count offenses per report type separately
  const offenseCounters: Record<string, number> = {};

  const lineItems: PenaltyLineItem[] = [];

  for (const filing of missedGISAFS) {
    const { reportType, year, deadline: deadlineStr } = filing;
    const deadline = new Date(deadlineStr);

    // Determine violation type:
    // If more than 1 year past deadline → non_filing, else → late_filing
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const yearsOverdue = (currentDate.getTime() - deadline.getTime()) / msPerYear;
    const violationType: ViolationType = yearsOverdue > 1 ? "non_filing" : "late_filing";

    // Increment offense counter for this report type
    offenseCounters[reportType] = (offenseCounters[reportType] ?? 0) + 1;
    const offenseNumber = offenseCounters[reportType];

    const { penaltyAmount, monthlySurcharge, revocationSurcharge } = lookupPenalty({
      domicile,
      corpType,
      violationType,
      reBracket,
      offenseNumber,
    });

    const surchargeMonths = fullMonthsBetween(deadline, currentDate);
    const totalPenalty = penaltyAmount + surchargeMonths * monthlySurcharge;

    const item: PenaltyLineItem = {
      year,
      reportType,
      violationType,
      offenseNumber,
      basePenalty: penaltyAmount,
      surchargeMonths,
      surchargeRate: monthlySurcharge,
      totalPenalty,
    };

    if (revocationSurcharge) {
      item.revocationSurcharge = true;
    }

    lineItems.push(item);
  }

  // BO penalties: ₱1,000/day from deadline, capped at ₱2,000,000
  const boPenalties: BOPenaltyItem[] = [];
  for (const filing of missedBO) {
    const deadline = new Date(filing.deadline);
    const days = daysBetween(deadline, currentDate);
    const rawPenalty = days * BO_DAILY_RATE;
    const totalPenalty = Math.min(rawPenalty, BO_CAP);
    boPenalties.push({
      year: filing.year,
      daysOverdue: days,
      totalPenalty,
    });
  }

  // MC28 penalty
  const mc28Penalty = mc28Compliant ? 0 : MC28_PENALTY;

  // Total
  const lineItemsTotal = lineItems.reduce((sum, i) => sum + i.totalPenalty, 0);
  const boTotal = boPenalties.reduce((sum, i) => sum + i.totalPenalty, 0);
  const totalPenalty = lineItemsTotal + boTotal + mc28Penalty;

  return {
    lineItems,
    boPenalties,
    mc28Penalty,
    totalPenalty,
  };
}
