// Core domain types for the SEC Compliance Navigator engine

export type Domicile = "domestic"; // foreign: deferred

export type CorpType = "stock" | "non_stock" | "opc";

export type ReportType = "GIS" | "AFS" | "BO";

export type ViolationType = "late_filing" | "non_filing";

export type REBracket =
  | "capital_deficiency"
  | "negative"
  | "0_100k"
  | "100k_500k"
  | "500k_5m"
  | "5m_10m"
  | "above_10m";

export type ComplianceStatus = "active" | "delinquent" | "suspended" | "revoked";

export interface FilingRecord {
  reportType: ReportType;
  year: number;
  status: "not_filed" | "filed_late" | "filed_on_time";
}

export interface ComputationInput {
  domicile: Domicile;
  corpType: CorpType;
  reBracket: REBracket;
  filingRecords: FilingRecord[];
  // Additional wizard inputs
  companyName?: string;
  incorporationYear?: number;
  currentYear?: number;
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
}

export interface ComputationResult {
  status: ComplianceStatus;
  lineItems: PenaltyLineItem[];
  totalPenalty: number;
  riskAssessment: string;
  reinstatementEstimate?: string;
}
