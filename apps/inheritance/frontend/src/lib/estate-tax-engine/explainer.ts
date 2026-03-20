/**
 * Estate Tax Engine — Explainer Generation (spec §18)
 *
 * Generates plain-English text explaining each computation step.
 * Pure function; no side effects. All monetary values in centavos (integer).
 */

import type {
  RegimeDetectionResult,
  GrossEstateResult,
  OrdinaryDeductionsResult,
  SpecialDeductionsResult,
  SpouseShareResult,
  TaxComputationResult,
  ExplainerOutput,
  ExplainerSection,
} from './types';

// ── Input type ──────────────────────────────────────────────────────────────

export interface ExplainerInput {
  decedentName: string;
  dateOfDeath: string;
  regimeDetection: RegimeDetectionResult;
  grossEstate: GrossEstateResult;
  ordinaryDeductions: OrdinaryDeductionsResult;
  specialDeductions: SpecialDeductionsResult;
  spouseShare: SpouseShareResult;
  taxComputation: TaxComputationResult;
  nraProportionalFactor: number | null;
  isNRA: boolean;
}

// ── formatPeso ──────────────────────────────────────────────────────────────

/**
 * Format centavos as a Philippine peso string: ₱X,XXX.XX
 */
export function formatPeso(centavos: number): string {
  const pesos = centavos / 100;
  const formatted = pesos.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₱${formatted}`;
}

// ── Section generators ──────────────────────────────────────────────────────

function regimeIntroSection(input: ExplainerInput): ExplainerSection {
  const { decedentName, dateOfDeath, regimeDetection, taxComputation } = input;
  const { regime } = regimeDetection;

  let body: string;

  if (regime === 'TRAIN') {
    body =
      `Because ${decedentName} passed away on ${dateOfDeath}, which is on or after January 1, 2018, ` +
      `the estate is subject to the TRAIN Law (Republic Act 10963). Under the TRAIN Law, estate tax ` +
      `is a flat rate of 6% applied to the net taxable estate — the estate's total value after all ` +
      `allowed deductions. There are no tax brackets or exemption thresholds under this system.`;
  } else if (regime === 'PRE_TRAIN') {
    const bracketRate = taxComputation.graduatedBracket?.bracketRate
      ? `${(taxComputation.graduatedBracket.bracketRate * 100).toFixed(0)}%`
      : 'graduated';
    body =
      `Because ${decedentName} passed away on ${dateOfDeath}, which is before January 1, 2018, ` +
      `the estate is subject to the pre-TRAIN estate tax rules. Under the old system, the tax rate ` +
      `is graduated — it starts at 0% for small estates and increases to 20% for very large estates. ` +
      `The net taxable estate of ${formatPeso(taxComputation.netTaxableEstate)} falls in the ${bracketRate} bracket.`;
  } else {
    // AMNESTY
    const deductionRules = regimeDetection.deductionRules;
    if (deductionRules === 'PRE_TRAIN') {
      body =
        `This computation uses the Estate Tax Amnesty under Republic Act 11213 (RA 11213), as amended ` +
        `by RA 11956. The amnesty allowed estates of persons who died before January 1, 2018, with ` +
        `unpaid estate tax, to settle at a flat 6% rate instead of the graduated rates that normally ` +
        `apply. The amnesty filing window closed on June 14, 2025. This computation is for historical ` +
        `reference only.`;
    } else {
      body =
        `For estates of persons who died between January 1, 2018 and May 31, 2022, the amnesty rate ` +
        `(6%) is identical to the regular TRAIN estate tax rate. The base tax amount is the same under ` +
        `both paths. The primary benefit of the amnesty for this estate was the waiver of late-filing ` +
        `surcharges and interest, which this engine does not compute. This computation uses the Estate ` +
        `Tax Amnesty under RA 11213. The amnesty filing window closed on June 14, 2025.`;
    }
  }

  return { title: 'Regime Introduction', body };
}

function grossEstateSection(input: ExplainerInput): ExplainerSection {
  const { grossEstate, decedentName } = input;
  const ge = grossEstate;

  const body =
    `The gross estate is the total value of everything ${decedentName} owned at the time of death.\n\n` +
    `| Category | Exclusive (Col A) | Joint/Communal (Col B) | Total (Col C) |\n` +
    `|---|---|---|---|\n` +
    `| Real properties (excl. family home) | ${formatPeso(ge.realProperty.exclusive)} | ${formatPeso(ge.realProperty.conjugal)} | ${formatPeso(ge.realProperty.total)} |\n` +
    `| Family home | ${formatPeso(ge.familyHome.exclusive)} | ${formatPeso(ge.familyHome.conjugal)} | ${formatPeso(ge.familyHome.total)} |\n` +
    `| Personal properties | ${formatPeso(ge.personalProperty.exclusive)} | ${formatPeso(ge.personalProperty.conjugal)} | ${formatPeso(ge.personalProperty.total)} |\n` +
    `| Taxable transfers | ${formatPeso(ge.taxableTransfers.exclusive)} | ${formatPeso(ge.taxableTransfers.conjugal)} | ${formatPeso(ge.taxableTransfers.total)} |\n` +
    `| Business interests | ${formatPeso(ge.businessInterest.exclusive)} | ${formatPeso(ge.businessInterest.conjugal)} | ${formatPeso(ge.businessInterest.total)} |\n` +
    `| **TOTAL (Item 34)** | **${formatPeso(ge.total.exclusive)}** | **${formatPeso(ge.total.conjugal)}** | **${formatPeso(ge.total.total)}** |`;

  return { title: 'Gross Estate', body };
}

function deductionsSection(input: ExplainerInput): ExplainerSection {
  const { ordinaryDeductions, specialDeductions } = input;
  const o = ordinaryDeductions;

  const lines: string[] = ['Deductions reduce the gross estate by amounts the estate owes or losses it suffered.\n'];

  const deductionItems: Array<[string, number]> = [
    ['Claims against the estate (5A)', o.item5b_claims_against_estate.total],
    ['Claims vs insolvent persons (5B)', o.item5c_claims_vs_insolvent.total],
    ['Unpaid mortgages (5C)', o.item5d_unpaid_mortgages.total],
    ['Unpaid taxes (5C)', o.item5e_unpaid_taxes.total],
    ['Casualty losses (5D)', o.item5f_casualty_losses.total],
    ['Vanishing deduction (5E)', o.item5g_vanishing_deduction.total],
    ['Transfers for public use (5F)', o.item5h_transfers_for_public_use.total],
    ['Funeral expenses (5G)', o.item5a_standard_deduction.total],
  ];

  for (const [label, amount] of deductionItems) {
    if (amount > 0) {
      lines.push(`**${label}**: ${formatPeso(amount)}`);
    }
  }

  lines.push(`\n**Total ordinary deductions (Item 35)**: ${formatPeso(o.total.total)}`);

  // Special deductions
  if (specialDeductions.total > 0) {
    lines.push(`\n**Special deductions (Item 37)**: ${formatPeso(specialDeductions.total)}`);
    if (specialDeductions.item37a_family_home > 0) {
      lines.push(`  Family home deduction: ${formatPeso(specialDeductions.item37a_family_home)}`);
    }
    if (specialDeductions.item37d_medical_expenses > 0) {
      lines.push(`  Medical expenses: ${formatPeso(specialDeductions.item37d_medical_expenses)}`);
    }
  }

  return { title: 'Deductions', body: lines.join('\n') };
}

function taxComputationSection(input: ExplainerInput): ExplainerSection {
  const { regimeDetection, taxComputation } = input;
  const { regime } = regimeDetection;
  const tc = taxComputation;

  const lines: string[] = [];

  lines.push(`**Net taxable estate (Item 40)**: ${formatPeso(tc.netTaxableEstate)}`);

  if (regime === 'TRAIN') {
    lines.push(`**Tax rate**: 6% (flat rate under TRAIN Law)`);
    lines.push(
      `**Estate tax due**: ${formatPeso(tc.netTaxableEstate)} × 6% = **${formatPeso(tc.estateTaxDue)}**`,
    );
  } else if (regime === 'PRE_TRAIN' && tc.graduatedBracket) {
    const gb = tc.graduatedBracket;
    const ratePct = `${(gb.bracketRate * 100).toFixed(0)}%`;
    const bracketMaxStr = gb.bracketMax !== null ? formatPeso(gb.bracketMax) : 'above';
    lines.push(
      `This falls in the ${ratePct} tax bracket (estates over ${formatPeso(gb.bracketMin)} and up to ${bracketMaxStr}).`,
    );
    lines.push(`| Computation | Amount |`);
    lines.push(`|---|---|`);
    lines.push(`| Fixed tax on amounts up to ${formatPeso(gb.bracketMin)} | ${formatPeso(gb.baseTax)} |`);
    lines.push(`| ${ratePct} on the excess of ${formatPeso(gb.excessAmount)} | ${formatPeso(gb.taxOnExcess)} |`);
    lines.push(`| **Estate tax due** | **${formatPeso(gb.totalTax)}** |`);
  } else if (regime === 'AMNESTY') {
    if (tc.amnestyTrack === 'TRACK_A') {
      lines.push(`No prior estate tax return was filed, so the amnesty applies to the full net estate.`);
    } else if (tc.amnestyTrack === 'TRACK_B') {
      const prev = tc.previouslyDeclaredNet ?? 0;
      const base = tc.amnestyTaxBase ?? 0;
      lines.push(
        `A prior return was filed declaring ${formatPeso(prev)}. The amnesty applies only to the ` +
          `difference: ${formatPeso(tc.netTaxableEstate)} − ${formatPeso(prev)} = ${formatPeso(base)}.`,
      );
    }

    const base = tc.amnestyTaxBase ?? tc.netTaxableEstate;
    const computed = tc.computedAmnestyTax ?? tc.estateTaxDue;
    lines.push(`**Amnesty tax**: ${formatPeso(base)} × 6% = ${formatPeso(computed)}`);

    if (tc.minimumApplied) {
      lines.push(
        `The computed tax (${formatPeso(computed)}) is less than the ₱5,000 minimum required by RA 11213. ` +
          `The amnesty tax due is **₱5,000.00**.`,
      );
    } else {
      lines.push(`Amnesty tax due: **${formatPeso(tc.estateTaxDue)}**`);
    }
  }

  if (tc.foreignTaxCredit > 0) {
    lines.push(`\n**Foreign tax credit (Item 43)**: ${formatPeso(tc.foreignTaxCredit)}`);
    lines.push(`**Net estate tax due (Item 44)**: **${formatPeso(tc.netEstateTaxDue)}**`);
  }

  return { title: 'Tax Computation', body: lines.join('\n') };
}

function nraNoteSection(input: ExplainerInput): ExplainerSection | null {
  if (!input.isNRA || input.nraProportionalFactor === null) return null;

  const factor = input.nraProportionalFactor;
  const pct = (factor * 100).toFixed(2);

  const body =
    `As a non-resident alien (NRA), the decedent's deductions are proportional to the ratio of ` +
    `Philippine assets to worldwide assets. The proportional factor is ${pct}%. ` +
    `This means ordinary deductions (ELIT) are scaled to reflect only the Philippine portion of ` +
    `the worldwide estate.`;

  return { title: 'Non-Resident Alien (NRA) Note', body };
}

// ── Main function ───────────────────────────────────────────────────────────

/**
 * Generate a plain-English explainer for the estate tax computation.
 */
export function generateExplainer(input: ExplainerInput): ExplainerOutput {
  const sections: ExplainerSection[] = [];

  sections.push(regimeIntroSection(input));
  sections.push(grossEstateSection(input));
  sections.push(deductionsSection(input));
  sections.push(taxComputationSection(input));

  const nraNote = nraNoteSection(input);
  if (nraNote) {
    sections.push(nraNote);
  }

  return { sections };
}
