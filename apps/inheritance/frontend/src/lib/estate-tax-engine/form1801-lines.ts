/**
 * Estate Tax Engine — Form 1801 Line Model (spec §17)
 *
 * THIS MODULE IS THE ONLY PLACE A FORM 1801 LINE IS CONSTRUCTED. No item
 * number, no label and no authority string for the return is built anywhere
 * else. The screen, the PDF and the CSV all render the array this module
 * returns and construct no line of their own.
 *
 * Why that matters: three independent mappings from `EstateTaxFullOutput` to
 * rows would be three chances to reproduce the Item-37A defect, where the
 * engine applied a ₱5,000,000 standard deduction that no row on the return
 * displayed. With one line model the three surfaces cannot disagree about
 * which rows exist or what they are called, and the remaining property to
 * verify is rendering fidelity rather than legal mapping.
 *
 * Why the authority strings live in the engine package and not in a renderer:
 * they are engine data. Putting them in `components/` would make a display
 * layer the attribution authority, which is exactly what gate G14 forbids.
 *
 * All monetary values are centavos (integer). This module performs no
 * arithmetic on tax figures: every amount is read from the engine output. The
 * only subtraction it performs is the signed difference reported inside a
 * reconciliation message.
 */

import type { EstateTaxFullOutput } from './types';

// ── The line shape ──────────────────────────────────────────────────────────

/** The render groups a line can belong to. */
export type Form1801LineGroup = 'gross' | 'ordinary' | 'special' | 'net' | 'tax' | 'penalty';

/** One row of BIR Form 1801, as the engine publishes it. */
export interface Form1801Line {
  /**
   * The unique, stable key. Renderers use it for React keys and `data-testid`
   * suffixes, and the parity gate matches rows on it. It is distinct from
   * `item` because two Schedule 5 lines legitimately print the same item cell.
   */
  id: string;
  /** The cell printed in the Item column. */
  item: string;
  /** The cell printed in the Description column. */
  label: string;
  /** The section or spec reference governing this line. Never empty. */
  authority: string;
  /** Centavos, or `null` when the line has no column A amount. */
  exclusive: number | null;
  /** Centavos, or `null` when the line has no column B amount. */
  conjugal: number | null;
  /**
   * The amount in centavos, or `null` when the line is declined.
   *
   * `null` is NEVER to be read as zero. As `penalties.ts` already puts it: a
   * zero is a claim that nothing is owed, and on a printed return the two are
   * indistinguishable.
   */
  total: number | null;
  /** Words printed instead of a figure when `total` is `null`. */
  displayTotal: string | null;
  /** Which block of the return this line belongs to. */
  group: Form1801LineGroup;
  /** True on a subtotal or total row. */
  isSummary: boolean;
}

/** The lines and the manual-review warnings raised while building them. */
export interface Form1801LineModel {
  lines: Form1801Line[];
  warnings: string[];
}

/**
 * Every line id this module can ever produce, in render order.
 *
 * A renderer that drops a row is caught by comparing a built array's id set
 * against this constant, rather than by an "every row I built is correct"
 * check that passes vacuously on an empty array.
 */
export const FORM1801_LINE_IDS: readonly string[] = Object.freeze([
  'gross-real-property',
  'gross-family-home',
  'gross-personal-property',
  'gross-taxable-transfers',
  'gross-business-interest',
  'gross-total',
  'ord-claims-and-judicial',
  'ord-claims-insolvent',
  'ord-unpaid-mortgages',
  'ord-unpaid-taxes',
  'ord-casualty-losses',
  'ord-vanishing-deduction',
  'ord-public-use-transfers',
  'ord-funeral',
  'ord-total',
  'estate-after-ordinary',
  'sp-standard-deduction',
  'sp-family-home',
  'sp-medical',
  'sp-ra4917',
  'sp-funeral',
  'sp-judicial',
  'sp-total',
  'net-estate',
  'spouse-share',
  'net-taxable-estate',
  'tax-due',
  'foreign-tax-credit',
  'net-estate-tax-due',
  'penalty-surcharge',
  'penalty-interest',
  'penalty-compromise',
  'penalty-total',
]);

// ── The authority table ─────────────────────────────────────────────────────

// The rule that produced every literal below, mechanical and free of judgment:
// the authority is the section stated in the HEADING of the spec section that
// defines the rule producing the line; where the heading states none, it is the
// spec section reference itself. Every value is therefore a transcription of a
// heading already committed in specs/estate-tax-engine-spec.md, not a new claim.
//
// Funeral expenses (spec §9.8) and judicial/administrative expenses (spec §9.9)
// have NO statutory section stated anywhere in this repository. That is the
// reason their authority is a spec reference rather than a code section, and it
// is the answer for those two lines, not a gap to be filled. Inventing a section
// for them is PROHIBITED — deciding which section governs is a point of
// Philippine law, which no agent may decide.
//
// The four penalty lines are deliberately absent from this table. Their
// authority is read from output.penalties.lines[n].authority, which
// penalties.ts already owns. Do not add them here: a second authority for the
// same line is precisely the duplication CLAUDE.md invariant 5 prohibits.
const LINE_AUTHORITY: Readonly<Record<string, string>> = Object.freeze({
  'gross-real-property': 'specs/estate-tax-engine-spec.md §8 Gross Estate Computation',
  'gross-family-home': 'specs/estate-tax-engine-spec.md §8 Gross Estate Computation',
  'gross-personal-property': 'specs/estate-tax-engine-spec.md §8 Gross Estate Computation',
  'gross-taxable-transfers': 'NIRC Sec. 85(B)–(G)',
  'gross-business-interest': 'specs/estate-tax-engine-spec.md §8 Gross Estate Computation',
  'gross-total': 'specs/estate-tax-engine-spec.md §8 Gross Estate Computation',
  'ord-claims-and-judicial':
    'NIRC Sec. 86(A)(1)(a); judicial and administrative expenses per specs/estate-tax-engine-spec.md §9.9',
  'ord-claims-insolvent': 'NIRC Sec. 86(A)(1)(b)',
  'ord-unpaid-mortgages': 'NIRC Sec. 86(A)(1)(c)',
  'ord-unpaid-taxes': 'NIRC Sec. 86(A)(1)(c)',
  'ord-casualty-losses': 'NIRC Sec. 86(A)(1)(e)',
  'ord-vanishing-deduction': 'NIRC Sec. 86(A)(2)',
  'ord-public-use-transfers': 'NIRC Sec. 86(A)(3)',
  'ord-funeral': 'specs/estate-tax-engine-spec.md §9.8',
  'ord-total': 'specs/estate-tax-engine-spec.md §9.10',
  'estate-after-ordinary': 'specs/estate-tax-engine-spec.md §17 Form 1801 Output Contract',
  'sp-standard-deduction': 'NIRC Sec. 86(A)(4) / 86(B)(1)',
  'sp-family-home': 'NIRC Sec. 86(A)(5)',
  'sp-medical': 'RA 8424 Sec. 86(A)(6)',
  'sp-ra4917': 'NIRC Sec. 86(A)(7)',
  'sp-funeral': 'specs/estate-tax-engine-spec.md §9.8',
  'sp-judicial': 'specs/estate-tax-engine-spec.md §9.9',
  'sp-total': 'specs/estate-tax-engine-spec.md §10.5',
  'net-estate': 'specs/estate-tax-engine-spec.md §17 Form 1801 Output Contract',
  'spouse-share': 'specs/estate-tax-engine-spec.md §11 Surviving Spouse Share (Schedule 6A)',
  'net-taxable-estate': 'specs/estate-tax-engine-spec.md §17 Form 1801 Output Contract',
  'tax-due': 'specs/estate-tax-engine-spec.md §12 Tax Rate Application',
  'foreign-tax-credit': 'specs/estate-tax-engine-spec.md §13 Foreign Tax Credit',
  'net-estate-tax-due': 'specs/estate-tax-engine-spec.md §17 Form 1801 Output Contract',
});

// ── Declined-line wording, moved from plan 20-05 rather than reinvented ──────

const NOT_COMPUTED = 'NOT COMPUTED';
const OUTSIDE_COMPETENCE = 'OUTSIDE ENGINE COMPETENCE';
const NOT_A_TOTAL = 'NOT A TOTAL — SEE NOTE BELOW';

/** Prefix on every reconciliation failure surfaced to a lawyer. */
export const FORM1801_RECONCILE_PREFIX = 'MANUAL REVIEW — FORM 1801 DOES NOT RECONCILE: ';

// ── Builders ────────────────────────────────────────────────────────────────

function authorityFor(id: string): string {
  const authority = LINE_AUTHORITY[id];
  if (authority === undefined) {
    throw new Error(`form1801-lines: no authority is registered for line id ${id}`);
  }
  return authority;
}

/** A line carrying all three columns. */
function columnLine(
  id: string,
  item: string,
  label: string,
  group: Form1801LineGroup,
  columns: { exclusive: number; conjugal: number; total: number },
  isSummary = false,
): Form1801Line {
  return {
    id,
    item,
    label,
    authority: authorityFor(id),
    exclusive: columns.exclusive,
    conjugal: columns.conjugal,
    total: columns.total,
    displayTotal: null,
    group,
    isSummary,
  };
}

/** A line carrying a single scalar amount, with no column A or B. */
function scalarLine(
  id: string,
  item: string,
  label: string,
  group: Form1801LineGroup,
  total: number,
  isSummary = false,
): Form1801Line {
  return {
    id,
    item,
    label,
    authority: authorityFor(id),
    exclusive: null,
    conjugal: null,
    total,
    displayTotal: null,
    group,
    isSummary,
  };
}

/**
 * Build every line of BIR Form 1801 from an engine output, once.
 *
 * The returned warnings are NOT pushed onto `output.warnings`: this function
 * does not mutate the engine output, so `computeEstateTax` behaviour stays
 * byte-identical and no existing test changes.
 */
export function buildForm1801Lines(output: EstateTaxFullOutput): Form1801LineModel {
  const gross = output.grossEstate;
  const ordinary = output.ordinaryDeductions;
  const special = output.specialDeductions;
  const tax = output.taxComputation;
  const penalties = output.penalties;

  const lines: Form1801Line[] = [
    // Gross estate — Items 29-34.
    columnLine('gross-real-property', '29', 'Real Properties (excl. family home)', 'gross', gross.realProperty),
    columnLine('gross-family-home', '30', 'Family Home', 'gross', gross.familyHome),
    columnLine('gross-personal-property', '31', 'Personal Properties', 'gross', gross.personalProperty),
    columnLine('gross-taxable-transfers', '32', 'Taxable Transfers', 'gross', gross.taxableTransfers),
    columnLine('gross-business-interest', '33', 'Business Interests', 'gross', gross.businessInterest),
    columnLine('gross-total', '34', 'Total Gross Estate', 'gross', gross.total, true),

    // Ordinary deductions — Schedule 5. The item cells are the SPEC's line
    // letters, and each label states what the engine field actually holds
    // rather than what its historical name says.
    columnLine(
      'ord-claims-and-judicial',
      '5A',
      'Claims Against Estate, incl. Judicial and Administrative Expenses',
      'ordinary',
      ordinary.item5b_claims_against_estate,
    ),
    columnLine('ord-claims-insolvent', '5B', 'Claims Against Insolvent Persons', 'ordinary', ordinary.item5c_claims_vs_insolvent),
    columnLine('ord-unpaid-mortgages', '5C', 'Unpaid Mortgages', 'ordinary', ordinary.item5d_unpaid_mortgages),
    columnLine('ord-unpaid-taxes', '5C', 'Unpaid Taxes', 'ordinary', ordinary.item5e_unpaid_taxes),
    columnLine('ord-casualty-losses', '5D', 'Casualty Losses', 'ordinary', ordinary.item5f_casualty_losses),
    columnLine('ord-vanishing-deduction', '5E', 'Vanishing Deduction', 'ordinary', ordinary.item5g_vanishing_deduction),
    columnLine('ord-public-use-transfers', '5F', 'Transfers for Public Use', 'ordinary', ordinary.item5h_transfers_for_public_use),
    // `item5a_standard_deduction` holds FUNERAL EXPENSES, documented at
    // ordinary-deductions.ts:23. The row that called this field the standard
    // deduction is the row the vision audit found printing 0.00 against the
    // ₱5,000,000 the engine had actually applied.
    columnLine('ord-funeral', '5G', 'Funeral Expenses (pre-TRAIN only)', 'ordinary', ordinary.item5a_standard_deduction),
    columnLine('ord-total', '35', 'Total Ordinary Deductions', 'ordinary', ordinary.total, true),

    scalarLine('estate-after-ordinary', '36', 'Estate After Ordinary Deductions', 'ordinary', output.estateAfterOrdinary, true),

    // Special deductions — Schedule 6. Scalar amounts, so no column A or B.
    // 37A..37D follow spec §17's item assignment. 37E and 37F have no Part IV
    // item number in §17 because TRAIN repealed both; they are numbered here so
    // that every value inside `specialDeductions.total` has a visible row and
    // the schedule reconciles.
    scalarLine('sp-standard-deduction', '37A', 'Standard Deduction', 'special', special.standardDeduction),
    scalarLine('sp-family-home', '37B', 'Family Home Deduction', 'special', special.item37a_family_home),
    scalarLine('sp-medical', '37C', 'Medical Expenses (pre-TRAIN only)', 'special', special.item37d_medical_expenses),
    scalarLine('sp-ra4917', '37D', 'RA 4917 Benefits', 'special', special.ra4917),
    scalarLine('sp-funeral', '37E', 'Funeral Expenses (Schedule 6 copy)', 'special', special.item37b_funeral_expenses),
    scalarLine('sp-judicial', '37F', 'Judicial and Administrative Expenses (Schedule 6 copy)', 'special', special.item37c_judicial_admin_expenses),
    scalarLine('sp-total', '37', 'Total Special Deductions', 'special', special.total, true),

    // Net estate through net estate tax due.
    scalarLine('net-estate', '38', 'Net Estate', 'net', output.netEstate, true),
    scalarLine('spouse-share', '39', 'Share of Surviving Spouse', 'net', output.spouseShare.spouseShare),
    scalarLine('net-taxable-estate', '40', 'Net Taxable Estate', 'net', tax.netTaxableEstate, true),
    scalarLine('tax-due', '42', 'Estate Tax Due', 'tax', tax.estateTaxDue, true),
    scalarLine('foreign-tax-credit', '43', 'Foreign Tax Credits', 'tax', tax.foreignTaxCredit),
    scalarLine('net-estate-tax-due', '44', 'Net Estate Tax Due', 'tax', tax.netEstateTaxDue, true),

    // Penalty block. The authority is read from the engine, never constructed.
    penaltyLine('penalty-surcharge', 'S-248', `Surcharge — ${penalties.lines[0].authority}`, penalties.lines[0], NOT_COMPUTED),
    penaltyLine('penalty-interest', 'I-249', `Interest — ${penalties.lines[1].authority}`, penalties.lines[1], NOT_COMPUTED),
    penaltyLine('penalty-compromise', 'CP', 'Compromise Penalty', penalties.lines[2], OUTSIDE_COMPETENCE),
    {
      id: 'penalty-total',
      item: 'Total',
      label: 'Total Amount Due',
      authority: penalties.lines[2].authority,
      exclusive: null,
      conjugal: null,
      total: penalties.totalAmountDue,
      displayTotal: penalties.totalAmountDue === null ? NOT_A_TOTAL : null,
      group: 'penalty',
      isSummary: true,
    },
  ];

  const warnings = reconcileForm1801Lines(lines, output).map((m) => `${FORM1801_RECONCILE_PREFIX}${m}`);

  // The duplicate-schedule condition measured in 21-RESEARCH.md §1a: a pre-TRAIN
  // reproduction measured 5000000 centavos of judicial expense subtracted TWICE,
  // once through Schedule 5 and once through Schedule 6. No requirement in this
  // phase owns the fix, so the condition is made LOUD here and no amount is
  // altered. It cannot be filed in engine/tests/bugs_ledger.rs because that
  // harness deserialises every entry as a Rust succession `EngineInput`.
  const funeralBothSchedules =
    ordinary.item5a_standard_deduction.total !== 0 && special.item37b_funeral_expenses !== 0;
  const judicialBothSchedules =
    special.item37c_judicial_admin_expenses !== 0 && ordinary.item5b_claims_against_estate.total !== 0;

  if (funeralBothSchedules) {
    warnings.push(
      `MANUAL REVIEW — SAME EXPENSE ON TWO SCHEDULES: funeral expenses appear in Schedule 5 ` +
        `(${ordinary.item5a_standard_deduction.total} centavos) and in Schedule 6 ` +
        `(${special.item37b_funeral_expenses} centavos). The same expense appears in Schedule 5 and ` +
        `Schedule 6, and which schedule is correct is not decided by this engine.`,
    );
  }
  if (judicialBothSchedules) {
    warnings.push(
      `MANUAL REVIEW — SAME EXPENSE ON TWO SCHEDULES: judicial and administrative expenses appear in ` +
        `Schedule 5 (${ordinary.item5b_claims_against_estate.total} centavos, combined with claims ` +
        `against the estate) and in Schedule 6 (${special.item37c_judicial_admin_expenses} centavos). ` +
        `The same expense appears in Schedule 5 and Schedule 6, and which schedule is correct is not ` +
        `decided by this engine.`,
    );
  }

  return { lines, warnings };
}

/** One penalty row, whose authority and wording both come from the engine. */
function penaltyLine(
  id: string,
  item: string,
  label: string,
  line: EstateTaxFullOutput['penalties']['lines'][number],
  declinedWords: string,
): Form1801Line {
  const declined = line.status === 'declined';
  return {
    id,
    item,
    label,
    authority: line.authority,
    exclusive: null,
    conjugal: null,
    total: declined ? null : line.centavos,
    displayTotal: declined ? declinedWords : null,
    group: 'penalty',
    isSummary: false,
  };
}

// ── Reconciliation ──────────────────────────────────────────────────────────

/**
 * Check that the printed rows sum to the engine's own totals.
 *
 * Every comparison is an exact integer equality. There is no tolerance term and
 * no approximate comparison anywhere in this function: a figure that is close
 * is a wrong figure on a return a lawyer signs. The subtraction in each message
 * is there to report the signed gap, not to compare.
 *
 * Returns an empty array when everything agrees.
 */
export function reconcileForm1801Lines(lines: Form1801Line[], output: EstateTaxFullOutput): string[] {
  const mismatches: string[] = [];

  const ordinaryRows = lines.filter((l) => l.id.startsWith('ord-') && l.id !== 'ord-total');
  const specialRows = lines.filter((l) => l.id.startsWith('sp-') && l.id !== 'sp-total');

  const sumOf = (rows: Form1801Line[], key: 'exclusive' | 'conjugal' | 'total'): number =>
    rows.reduce((acc, row) => acc + (row[key] ?? 0), 0);

  const engineOrdinary = output.ordinaryDeductions.total;

  const checks: { group: string; summed: number; engine: number }[] = [
    { group: 'ordinary deductions, column A (exclusive)', summed: sumOf(ordinaryRows, 'exclusive'), engine: engineOrdinary.exclusive },
    { group: 'ordinary deductions, column B (conjugal)', summed: sumOf(ordinaryRows, 'conjugal'), engine: engineOrdinary.conjugal },
    { group: 'ordinary deductions, column C (total)', summed: sumOf(ordinaryRows, 'total'), engine: engineOrdinary.total },
    { group: 'special deductions', summed: sumOf(specialRows, 'total'), engine: output.specialDeductions.total },
  ];

  for (const check of checks) {
    if (check.summed !== check.engine) {
      mismatches.push(
        `${check.group}: rows sum to ${check.summed} centavos, engine total is ${check.engine} centavos, ` +
          `difference ${check.summed - check.engine} centavos`,
      );
    }
  }

  return mismatches;
}
