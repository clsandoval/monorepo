/**
 * Estate Tax Engine — Tax Rate Application (spec §12)
 *
 * Computes Items 41–42 (tax rate and estate tax due).
 *
 * TRAIN: flat 6% on net taxable estate (Item 40).
 * PRE_TRAIN: graduated brackets from constants.ts PRE_TRAIN_BRACKETS.
 * AMNESTY: not computed here — handled in amnesty.ts.
 *
 * All monetary values in centavos (integer). Pure functions; no side effects.
 */

import type { GraduatedBracketResult, Regime } from './types';
import { TRAIN_RATE, PRE_TRAIN_BRACKETS } from './constants';

export interface TaxResult {
  estateTaxDue: number;
  graduatedBracket: GraduatedBracketResult | null;
}

/**
 * Compute estate tax due given net taxable estate and regime.
 *
 * @param netTaxableEstate - Item 40 (centavos)
 * @param regime - 'TRAIN' | 'PRE_TRAIN' (AMNESTY handled separately)
 */
export function computeTax(netTaxableEstate: number, regime: Regime): TaxResult {
  const nte = Math.max(0, netTaxableEstate);

  if (regime === 'TRAIN') {
    return {
      estateTaxDue: Math.floor(nte * TRAIN_RATE),
      graduatedBracket: null,
    };
  }

  if (regime === 'PRE_TRAIN') {
    return computePreTrainTax(nte);
  }

  // AMNESTY: return zero — caller should use amnesty.ts
  return { estateTaxDue: 0, graduatedBracket: null };
}

/**
 * Compute pre-TRAIN graduated tax.
 * Finds the bracket where NTE falls and computes baseTax + (excess × rate).
 */
function computePreTrainTax(nte: number): TaxResult {
  // Find the applicable bracket.
  // Bracket i applies when nte > bracket[i].min (strict, to handle boundary values correctly).
  // Bracket 0 (min=0) always applies as a floor; higher brackets only when nte strictly exceeds their min.
  let bracketIndex = 0;
  for (let i = 1; i < PRE_TRAIN_BRACKETS.length; i++) {
    if (nte > PRE_TRAIN_BRACKETS[i]!.min) {
      bracketIndex = i;
    } else {
      break;
    }
  }

  const bracket = PRE_TRAIN_BRACKETS[bracketIndex]!;
  const excessAmount = nte - bracket.min;
  const taxOnExcess = Math.floor(excessAmount * bracket.rate);
  const totalTax = bracket.baseTax + taxOnExcess;

  const graduatedBracket: GraduatedBracketResult = {
    bracketMin: bracket.min,
    bracketMax: bracket.max,
    bracketRate: bracket.rate,
    baseTax: bracket.baseTax,
    excessAmount,
    taxOnExcess,
    totalTax,
  };

  return {
    estateTaxDue: totalTax,
    graduatedBracket,
  };
}
