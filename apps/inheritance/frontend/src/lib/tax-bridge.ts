/**
 * Tax Bridge — BIR Form 1801 Integration (spec §4.9)
 *
 * Bridge formula (Art. 908): net_distributable_estate =
 *   max(0, item34c_gross_estate - (debts and charges + spouse's net conjugal
 *   share + estate tax due))
 *
 * Art. 908 sets the base as "the value of the property left at the death of the
 * testator, deducting all debts and charges". Before Phase 8 this bridge passed
 * net taxable estate minus tax, which subtracted the standard deduction, the
 * family-home deduction, the RA 4917 deduction and the vanishing deduction —
 * none of which is a debt or a charge — and understated the heirs' shares.
 *
 * Re-runs inheritance engine with bridged value when tax output changes.
 */
import type { EngineInput, EngineOutput } from '@/types';

// ── Types ───────────────────────────────────────────────────────────────────

/** Minimal estate tax engine output used by the bridge formula. */
export interface EstateTaxEngineOutput {
  item34c_gross_estate: number; // centavos — Item 34 column C, the whole gross estate
  item35_debts_and_charges: number; // centavos — actual debts and charges only
  item39_spouse_net_share: number; // centavos — the spouse's net conjugal share
  item44_net_estate_tax_due: number; // centavos — the estate tax due
  item40_gross_estate: number; // centavos — HISTORICAL name, holds net taxable estate
  item44_total_deductions: number; // centavos — HISTORICAL name, holds net estate tax due
  tax_due: number; // centavos
  surcharges: number; // centavos
  interest: number; // centavos
  compromise_penalty: number; // centavos
  total_amount_due: number; // centavos
  schedules: EstateTaxScheduleSummary;
}

export interface EstateTaxScheduleSummary {
  schedule1_real_properties: number; // centavos
  schedule2_personal_properties: number; // centavos
  schedule3_taxable_transfers: number; // centavos
  schedule4_claims_deductions: number; // centavos
  schedule5_other_deductions: number; // centavos
  schedule6_net_share_spouse: number; // centavos
}

export type TaxBridgeState = 'idle' | 'computing' | 'ready' | 'error';

export interface TaxBridgeResult {
  netDistributableEstate: number; // centavos
  bridgedInput: EngineInput;
  bridgedOutput: EngineOutput;
}

// ── Core functions ──────────────────────────────────────────────────────────

/**
 * Bridge formula: max(0, gross_estate - total_deductions).
 * Returns net distributable estate in centavos.
 */
export function computeNetDistributableEstate(
  item40GrossEstate: number,
  item44TotalDeductions: number,
): number {
  return Math.max(0, item40GrossEstate - item44TotalDeductions);
}

/**
 * Assemble the charges Art. 908 deducts from the property left at death.
 *
 * Art. 908 sets the base as the property left at death "deducting all debts and
 * charges". Three things are deducted here and nothing else:
 *   - `item35_debts_and_charges` — the decedent's actual debts and charges
 *   - `item39_spouse_net_share`  — the spouse's half of the conjugal property,
 *      which never belonged to the estate at all
 *   - `item44_net_estate_tax_due` — the estate tax, a charge on the estate
 *
 * The standard deduction, the family-home deduction, the RA 4917 deduction, the
 * medical deduction and the vanishing deduction are NOT subtracted: none of them
 * is a debt or a charge, they are tax reliefs.
 *
 * Worked example (`.planning/research/LEGAL-CONFORMANCE.md` §6), ₱30,000,000
 * gross estate: charges are 0 + 1500000000 + 24000000 = 1524000000 and the base
 * is 1476000000 centavos, against the 376000000 the pre-fix bridge produced.
 *
 * Throws — never coerces — when a component is missing or not finite. A
 * `cases.tax_output_json` row written before Phase 8 carries none of these
 * fields, and silently reading it as zero would understate every heir's share.
 */
export function computeDistributableCharges(taxOutput: EstateTaxEngineOutput): number {
  const required: [string, number][] = [
    ['item34c_gross_estate', taxOutput.item34c_gross_estate],
    ['item35_debts_and_charges', taxOutput.item35_debts_and_charges],
    ['item39_spouse_net_share', taxOutput.item39_spouse_net_share],
    ['item44_net_estate_tax_due', taxOutput.item44_net_estate_tax_due],
  ];
  for (const [name, value] of required) {
    if (!Number.isFinite(value)) {
      throw new Error(
        `tax-bridge.ts: ${name} is missing or not a finite number. This tax output ` +
          'predates the Art. 908 bridge fix and must be recomputed.',
      );
    }
  }
  return (
    taxOutput.item35_debts_and_charges +
    taxOutput.item39_spouse_net_share +
    taxOutput.item44_net_estate_tax_due
  );
}

/**
 * Build a bridged EngineInput with updated net_distributable_estate from tax output.
 */
export function buildBridgedInput(
  inheritanceInput: EngineInput,
  netDistributableEstateCentavos: number,
): EngineInput {
  return {
    ...inheritanceInput,
    net_distributable_estate: { centavos: netDistributableEstateCentavos },
  };
}

/**
 * Full bridge: extract net estate from tax output, build bridged input, run engine.
 */
export async function runTaxBridge(
  inheritanceInput: EngineInput,
  taxOutput: EstateTaxEngineOutput,
): Promise<{ bridgedInput: EngineInput; bridgedOutput: EngineOutput }> {
  const { compute } = await import('@/wasm/bridge');
  const netEstate = computeNetDistributableEstate(
    taxOutput.item34c_gross_estate,
    computeDistributableCharges(taxOutput),
  );
  const bridgedInput = buildBridgedInput(inheritanceInput, netEstate);
  const bridgedOutput = await compute(bridgedInput);
  return { bridgedInput, bridgedOutput };
}

/**
 * Persist tax output to the case row.
 */
export async function saveTaxOutput(
  caseId: string,
  taxOutput: EstateTaxEngineOutput,
): Promise<void> {
  const { supabase } = await import('./supabase');
  const { error } = await supabase
    .from('cases')
    .update({ tax_output_json: taxOutput })
    .eq('id', caseId);

  if (error) throw error;
}

/**
 * Build the bridge note text for PDF.
 */
export function buildBridgeNoteText(netDistributableEstateCentavos: number): string {
  const pesos = netDistributableEstateCentavos / 100;
  const formatted = pesos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `Estate tax net distributable estate of ₱${formatted} has been applied to the inheritance computation.`;
}
