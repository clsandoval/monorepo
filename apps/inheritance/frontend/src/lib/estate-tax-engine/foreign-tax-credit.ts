/**
 * Estate Tax Engine — Foreign Tax Credit (spec §13)
 *
 * Computes Item 43 (foreign tax credits to offset estate tax due).
 *
 * Legal basis: NIRC Sec. 86(D)
 *
 * Rules:
 * - NOT available to NRAs
 * - NOT available under amnesty
 * - Per-country credit = min(foreignTaxPaid, estateTaxDue × foreignFMV / grossEstateTotal)
 * - Overall credit = min(sum of per-country credits, estateTaxDue)
 *
 * NOTE: The ForeignTaxCreditEntry type in types.ts does not include foreignPropertyFMV.
 * This module accepts an extended type that includes foreignPropertyFMV as required by
 * the spec's per-country limit formula (Sec. 86(D)). In practice, the engine input would
 * need to provide this value.
 *
 * All monetary values in centavos (integer). Pure function; no side effects.
 */

import type { DecedentInfo, ForeignTaxCreditEntry, Regime } from './types';

/**
 * Extended foreign tax credit entry including the FMV of foreign property
 * taxed in the foreign jurisdiction (required for per-country limit computation).
 */
export interface ForeignTaxCreditClaim extends ForeignTaxCreditEntry {
  foreignPropertyFMV: number; // centavos
}

/**
 * Compute the total allowable foreign tax credit (Item 43).
 *
 * @param decedent - Decedent info (NRA check)
 * @param regime - 'TRAIN' | 'PRE_TRAIN' | 'AMNESTY'
 * @param claims - Foreign tax credit claims (extended with foreignPropertyFMV)
 * @param grossEstateTotal - Item 34C total gross estate (centavos)
 * @param estateTaxDue - Item 42 estate tax due (centavos)
 * @returns foreign tax credit amount (centavos)
 */
export function computeForeignTaxCredit(
  decedent: DecedentInfo,
  regime: Regime,
  claims: Array<ForeignTaxCreditEntry & { foreignPropertyFMV?: number }>,
  grossEstateTotal: number,
  estateTaxDue: number,
): number {
  // Not available to NRAs
  if (decedent.isNRA) return 0;

  // Not available under amnesty
  if (regime === 'AMNESTY') return 0;

  // No claims or zero gross estate
  if (!claims || claims.length === 0) return 0;
  if (grossEstateTotal <= 0) return 0;

  let totalCredit = 0;

  for (const claim of claims) {
    const foreignFMV = (claim as any).foreignPropertyFMV ?? 0;
    // Per-country credit limit = estateTaxDue × (foreignFMV / grossEstateTotal)
    const perCountryLimit = Math.floor(estateTaxDue * (foreignFMV / grossEstateTotal));
    const countryCredit = Math.min(claim.taxPaid, perCountryLimit);
    totalCredit += countryCredit;
  }

  // Overall credit cannot exceed total estate tax due
  return Math.min(totalCredit, estateTaxDue);
}
