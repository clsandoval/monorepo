import type { Domicile, CorpType, ViolationType, REBracket } from "./types";

// Penalty table rows indexed by REBracket, columns are offense 1-5
type PenaltyRow = [number, number, number, number, number];
type PenaltyTable = Record<REBracket, PenaltyRow>;

// Table 1: Domestic Stock — Non-Filing (GIS/AFS)
const DOMESTIC_STOCK_NON_FILING: PenaltyTable = {
  capital_deficiency: [10000, 12000, 14000, 16000, 18000],
  negative:           [10000, 12000, 14000, 16000, 18000],
  "0_100k":           [10000, 12000, 14000, 16000, 18000],
  "100k_500k":        [15000, 18000, 21000, 24000, 27000],
  "500k_5m":          [20000, 24000, 28000, 32000, 36000],
  "5m_10m":           [30000, 36000, 42000, 48000, 54000],
  above_10m:          [30000, 36000, 42000, 48000, 54000],
};

// Table 2: Domestic Stock — Late Filing
const DOMESTIC_STOCK_LATE_FILING: PenaltyTable = {
  capital_deficiency: [5000, 6000, 7000,  8000,  9000],
  negative:           [5000, 6000, 7000,  8000,  9000],
  "0_100k":           [5000, 6000, 7000,  8000,  9000],
  "100k_500k":        [7500, 9000, 10500, 12000, 13500],
  "500k_5m":          [10000, 12000, 14000, 16000, 18000],
  "5m_10m":           [15000, 18000, 21000, 24000, 27000],
  above_10m:          [15000, 18000, 21000, 24000, 27000],
};

// Table 3: Domestic Non-Stock — Non-Filing
const DOMESTIC_NON_STOCK_NON_FILING: PenaltyTable = {
  capital_deficiency: [5000, 6000, 7000,  8000,  9000],
  negative:           [5000, 6000, 7000,  8000,  9000],
  "0_100k":           [5000, 6000, 7000,  8000,  9000],
  "100k_500k":        [7500, 9000, 10500, 12000, 13500],
  "500k_5m":          [10000, 12000, 14000, 16000, 18000],
  "5m_10m":           [15000, 18000, 21000, 24000, 27000],
  above_10m:          [15000, 18000, 21000, 24000, 27000],
};

// Table 4: Domestic Non-Stock — Late Filing
const DOMESTIC_NON_STOCK_LATE_FILING: PenaltyTable = {
  capital_deficiency: [2500, 3000, 3500, 4000, 4500],
  negative:           [2500, 3000, 3500, 4000, 4500],
  "0_100k":           [2500, 3000, 3500, 4000, 4500],
  "100k_500k":        [3750, 4500, 5250, 6000, 6750],
  "500k_5m":          [5000, 6000, 7000, 8000, 9000],
  "5m_10m":           [7500, 9000, 10500, 12000, 13500],
  above_10m:          [7500, 9000, 10500, 12000, 13500],
};

// Monthly surcharge rates by RE bracket (₱/month)
const MONTHLY_SURCHARGE: Record<REBracket, number> = {
  capital_deficiency: 0,
  negative:           500,
  "0_100k":           500,
  "100k_500k":        1000,
  "500k_5m":          1000,
  "5m_10m":           1000,
  above_10m:          1000,
};

export interface LookupParams {
  domicile: Domicile;
  corpType: CorpType;
  violationType: ViolationType;
  reBracket: REBracket;
  offenseNumber: number;
}

export interface LookupResult {
  penaltyAmount: number;
  monthlySurcharge: number;
  revocationSurcharge?: boolean;
}

function selectTable(corpType: CorpType, violationType: ViolationType): PenaltyTable {
  // OPC uses the same table as stock
  const isStock = corpType === "stock" || corpType === "opc";

  if (isStock && violationType === "non_filing") return DOMESTIC_STOCK_NON_FILING;
  if (isStock && violationType === "late_filing") return DOMESTIC_STOCK_LATE_FILING;
  if (!isStock && violationType === "non_filing") return DOMESTIC_NON_STOCK_NON_FILING;
  return DOMESTIC_NON_STOCK_LATE_FILING;
}

export function lookupPenalty(params: LookupParams): LookupResult {
  const { corpType, violationType, reBracket, offenseNumber } = params;

  const table = selectTable(corpType, violationType);
  const row = table[reBracket];

  // Cap at 5th offense for lookup; 6+ triggers revocation surcharge
  const isRevocation = offenseNumber >= 6;
  const clampedOffense = Math.min(offenseNumber, 5);
  const penaltyAmount = row[clampedOffense - 1];
  const monthlySurcharge = MONTHLY_SURCHARGE[reBracket];

  const result: LookupResult = { penaltyAmount, monthlySurcharge };

  if (isRevocation) {
    result.revocationSurcharge = true;
  }

  return result;
}
