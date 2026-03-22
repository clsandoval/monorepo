import type { ComplianceStatus } from "./types";

export type RiskLevel = "none" | "low" | "medium" | "high";

export interface StatusInput {
  missedFilingYears: number[];
  suspensionDate: Date | null;
  revocationDate: Date | null;
  maxOffenseCount?: number;
}

export interface StatusResult {
  status: ComplianceStatus;
  riskLevel: RiskLevel;
  riskMessage: string;
}

/**
 * Determine the longest run of consecutive years in the array.
 */
function longestConsecutiveRun(years: number[]): number {
  if (years.length === 0) return 0;
  const sorted = [...new Set(years)].sort((a, b) => a - b);
  let maxRun = 1;
  let currentRun = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentRun++;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      currentRun = 1;
    }
  }
  return maxRun;
}

/**
 * Determine compliance status and risk level from missed filing data.
 *
 * Rules (in priority order):
 * 1. revocationDate present → "revoked"
 * 2. suspensionDate present → "suspended"
 * 3. 3+ consecutive missed filing years → "delinquent" (Sec. 177)
 * 4. 5+ total (possibly intermittent) missed filing years → "delinquent"
 * 5. Otherwise → "active"
 *
 * Risk levels:
 * - "none"   — active, no missed filings
 * - "low"    — 1–2 missed filing years
 * - "medium" — delinquent
 * - "high"   — maxOffenseCount >= 4 (near revocation threshold)
 */
export function determineStatus(input: StatusInput): StatusResult {
  const { missedFilingYears, suspensionDate, revocationDate, maxOffenseCount } = input;

  // Priority 1: revoked
  if (revocationDate) {
    return {
      status: "revoked",
      riskLevel: "high",
      riskMessage: `Corporation was revoked on ${revocationDate.toISOString().slice(0, 10)}.`,
    };
  }

  // Priority 2: suspended
  if (suspensionDate) {
    return {
      status: "suspended",
      riskLevel: "high",
      riskMessage: `Corporation was suspended on ${suspensionDate.toISOString().slice(0, 10)}.`,
    };
  }

  const uniqueYears = [...new Set(missedFilingYears)].sort((a, b) => a - b);
  const totalMissed = uniqueYears.length;
  const consecutive = longestConsecutiveRun(uniqueYears);

  // Near-revocation risk check (maxOffenseCount >= 4)
  const nearRevocation = (maxOffenseCount ?? 0) >= 4;

  // Priority 3 & 4: delinquent
  if (consecutive >= 3) {
    const riskLevel: RiskLevel = nearRevocation ? "high" : "medium";
    const riskMessage = nearRevocation
      ? `Corporation has ${consecutive} consecutive years of non-filing and ${maxOffenseCount} offenses — revocation risk is high.`
      : `Corporation has ${consecutive} consecutive years of non-filing (Sec. 177 — delinquent status).`;
    return { status: "delinquent", riskLevel, riskMessage };
  }

  if (totalMissed >= 5) {
    const riskLevel: RiskLevel = nearRevocation ? "high" : "medium";
    const riskMessage = nearRevocation
      ? `Corporation has ${totalMissed} years of missed filings and ${maxOffenseCount} offenses — revocation risk is high.`
      : `Corporation has ${totalMissed} years of missed filings (intermittent) — delinquent status.`;
    return { status: "delinquent", riskLevel, riskMessage };
  }

  // Active — determine risk based on missed count and near-revocation flag
  if (nearRevocation) {
    return {
      status: "active",
      riskLevel: "high",
      riskMessage: `Corporation has ${maxOffenseCount} offenses on record — revocation proceedings may be imminent.`,
    };
  }

  if (totalMissed === 0) {
    return {
      status: "active",
      riskLevel: "none",
      riskMessage: "Corporation is fully compliant with no missed filings.",
    };
  }

  return {
    status: "active",
    riskLevel: "low",
    riskMessage: `Corporation has ${totalMissed} missed filing year${totalMissed > 1 ? "s" : ""} — monitor closely.`,
  };
}
