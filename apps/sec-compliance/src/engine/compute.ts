import type { Domicile, CorpType, REBracket, ComplianceStatus } from "./types";
import { computePenalties, type FilingReport, type PenaltyLineItem, type BOPenaltyItem } from "./penalties";
import { determineStatus, type RiskLevel } from "./status";
import { computeReinstatement, type ReinstatementResult } from "./reinstatement";

export interface ComplianceInput {
  domicile: Domicile;
  corpType: CorpType;
  reBracket: REBracket;
  mc28Compliant: boolean;
  incorporationYear: number;
  currentDate: Date;
  suspensionDate: Date | null;
  revocationDate: Date | null;
  filedReports: FilingReport[];
}

export interface ComplianceResult {
  status: ComplianceStatus;
  riskLevel: RiskLevel;
  riskMessage: string;
  lineItems: PenaltyLineItem[];
  boPenalties: BOPenaltyItem[];
  mc28Penalty: number;
  totalPenalty: number;
  reinstatement: ReinstatementResult;
}

/**
 * Full compliance computation orchestrator.
 *
 * 1. Compute penalties (lineItems, boPenalties, mc28Penalty, totalPenalty)
 * 2. Extract missed filing years from lineItems (GIS/AFS non_filing violations)
 * 3. Determine compliance status and risk level
 * 4. Compute reinstatement cost estimate
 * 5. Return combined result
 */
export function computeCompliance(input: ComplianceInput): ComplianceResult {
  const { suspensionDate, revocationDate } = input;

  // Step 1: Compute penalties
  const penaltyResult = computePenalties({
    domicile: input.domicile,
    corpType: input.corpType,
    reBracket: input.reBracket,
    mc28Compliant: input.mc28Compliant,
    filedReports: input.filedReports,
    incorporationYear: input.incorporationYear,
    currentDate: input.currentDate,
  });

  // Step 2: Extract missed filing years from lineItems
  // Each lineItem represents a missed GIS or AFS filing for a given year.
  // Collect unique years across all missed GIS/AFS filings.
  const missedFilingYears = [...new Set(penaltyResult.lineItems.map((item) => item.year))];

  // Determine the maximum offense number seen across all lineItems (for revocation risk)
  const maxOffenseCount = penaltyResult.lineItems.reduce(
    (max, item) => Math.max(max, item.offenseNumber),
    0
  );

  // Step 3: Determine compliance status
  const statusResult = determineStatus({
    missedFilingYears,
    suspensionDate,
    revocationDate,
    maxOffenseCount,
  });

  // Step 4: Compute reinstatement estimate
  const reinstatement = computeReinstatement({
    totalPenalties: penaltyResult.totalPenalty,
  });

  // Step 5: Return combined result
  return {
    status: statusResult.status,
    riskLevel: statusResult.riskLevel,
    riskMessage: statusResult.riskMessage,
    lineItems: penaltyResult.lineItems,
    boPenalties: penaltyResult.boPenalties,
    mc28Penalty: penaltyResult.mc28Penalty,
    totalPenalty: penaltyResult.totalPenalty,
    reinstatement,
  };
}
