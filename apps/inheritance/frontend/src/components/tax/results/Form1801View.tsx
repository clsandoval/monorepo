/**
 * Form1801View — line-by-line BIR Form 1801 display.
 * Shows Items 29-44 with columns: Item #, Description, Exclusive (Col A), Conjugal (Col B), Total (Col C).
 */

import type { EstateTaxFullOutput } from '@/lib/estate-tax-engine';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Form1801ViewProps {
  output: EstateTaxFullOutput;
}

/**
 * Printed in the exclusive and conjugal columns of a line that carries no
 * amount at all. A declined penalty line has no exclusive/conjugal breakdown,
 * and `formatPesos(0)` would print `0.00` there — the same false claim the
 * total column refuses to make.
 */
const NO_AMOUNT = '—';

function formatPesos(centavos: number): string {
  return (centavos / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface LineItem {
  item: string;
  description: string;
  exclusive: number;
  conjugal: number;
  total: number;
  isSummary?: boolean;
  /**
   * When present, the total column prints this text instead of a formatted
   * peso amount. It exists so a DECLINED line can print words rather than a
   * currency figure: `formatPesos(0)` returns `0.00`, and a printed `0.00` is
   * indistinguishable from a computed zero on a return a lawyer signs.
   */
  displayTotal?: string;
}

export function Form1801View({ output }: Form1801ViewProps) {
  const { grossEstate, ordinaryDeductions, specialDeductions, spouseShare, taxComputation, penalties } =
    output;
  const [surchargeLine, interestLine, compromiseLine] = penalties.lines;

  const lines: LineItem[] = [
    // Gross Estate items 29-34
    {
      item: '29',
      description: 'Real Properties (excl. family home)',
      exclusive: grossEstate.realProperty.exclusive,
      conjugal: grossEstate.realProperty.conjugal,
      total: grossEstate.realProperty.total,
    },
    {
      item: '30',
      description: 'Family Home',
      exclusive: grossEstate.familyHome.exclusive,
      conjugal: grossEstate.familyHome.conjugal,
      total: grossEstate.familyHome.total,
    },
    {
      item: '31',
      description: 'Personal Properties',
      exclusive: grossEstate.personalProperty.exclusive,
      conjugal: grossEstate.personalProperty.conjugal,
      total: grossEstate.personalProperty.total,
    },
    {
      item: '32',
      description: 'Taxable Transfers',
      exclusive: grossEstate.taxableTransfers.exclusive,
      conjugal: grossEstate.taxableTransfers.conjugal,
      total: grossEstate.taxableTransfers.total,
    },
    {
      item: '33',
      description: 'Business Interests',
      exclusive: grossEstate.businessInterest.exclusive,
      conjugal: grossEstate.businessInterest.conjugal,
      total: grossEstate.businessInterest.total,
    },
    {
      item: '34',
      description: 'Total Gross Estate',
      exclusive: grossEstate.total.exclusive,
      conjugal: grossEstate.total.conjugal,
      total: grossEstate.total.total,
      isSummary: true,
    },
    // Ordinary deductions items 35
    {
      item: '35A',
      description: 'Standard Deduction',
      exclusive: ordinaryDeductions.item5a_standard_deduction.exclusive,
      conjugal: ordinaryDeductions.item5a_standard_deduction.conjugal,
      total: ordinaryDeductions.item5a_standard_deduction.total,
    },
    {
      item: '35B',
      description: 'Claims Against Estate',
      exclusive: ordinaryDeductions.item5b_claims_against_estate.exclusive,
      conjugal: ordinaryDeductions.item5b_claims_against_estate.conjugal,
      total: ordinaryDeductions.item5b_claims_against_estate.total,
    },
    {
      item: '35C',
      description: 'Claims vs Insolvent',
      exclusive: ordinaryDeductions.item5c_claims_vs_insolvent.exclusive,
      conjugal: ordinaryDeductions.item5c_claims_vs_insolvent.conjugal,
      total: ordinaryDeductions.item5c_claims_vs_insolvent.total,
    },
    {
      item: '35D',
      description: 'Unpaid Mortgages',
      exclusive: ordinaryDeductions.item5d_unpaid_mortgages.exclusive,
      conjugal: ordinaryDeductions.item5d_unpaid_mortgages.conjugal,
      total: ordinaryDeductions.item5d_unpaid_mortgages.total,
    },
    {
      item: '35E',
      description: 'Unpaid Taxes',
      exclusive: ordinaryDeductions.item5e_unpaid_taxes.exclusive,
      conjugal: ordinaryDeductions.item5e_unpaid_taxes.conjugal,
      total: ordinaryDeductions.item5e_unpaid_taxes.total,
    },
    {
      item: '35F',
      description: 'Casualty Losses',
      exclusive: ordinaryDeductions.item5f_casualty_losses.exclusive,
      conjugal: ordinaryDeductions.item5f_casualty_losses.conjugal,
      total: ordinaryDeductions.item5f_casualty_losses.total,
    },
    {
      item: '35G',
      description: 'Vanishing Deduction',
      exclusive: ordinaryDeductions.item5g_vanishing_deduction.exclusive,
      conjugal: ordinaryDeductions.item5g_vanishing_deduction.conjugal,
      total: ordinaryDeductions.item5g_vanishing_deduction.total,
    },
    {
      item: '35H',
      description: 'Transfers for Public Use',
      exclusive: ordinaryDeductions.item5h_transfers_for_public_use.exclusive,
      conjugal: ordinaryDeductions.item5h_transfers_for_public_use.conjugal,
      total: ordinaryDeductions.item5h_transfers_for_public_use.total,
    },
    // Special deductions items 37
    {
      item: '37A',
      description: 'Family Home Deduction',
      exclusive: specialDeductions.item37a_family_home,
      conjugal: 0,
      total: specialDeductions.item37a_family_home,
    },
    {
      item: '37B',
      description: 'Funeral Expenses',
      exclusive: specialDeductions.item37b_funeral_expenses,
      conjugal: 0,
      total: specialDeductions.item37b_funeral_expenses,
    },
    {
      item: '37C',
      description: 'Judicial/Admin Expenses',
      exclusive: specialDeductions.item37c_judicial_admin_expenses,
      conjugal: 0,
      total: specialDeductions.item37c_judicial_admin_expenses,
    },
    {
      item: '37D',
      description: 'Medical Expenses',
      exclusive: specialDeductions.item37d_medical_expenses,
      conjugal: 0,
      total: specialDeductions.item37d_medical_expenses,
    },
    // Spouse share
    {
      item: '38',
      description: "Surviving Spouse's Net Share",
      exclusive: 0,
      conjugal: spouseShare.spouseShare,
      total: spouseShare.spouseShare,
    },
    // Tax computation
    {
      item: '40',
      description: 'Gross Estate',
      exclusive: 0,
      conjugal: 0,
      total: output.item40_gross_estate,
      isSummary: true,
    },
    {
      item: '44',
      description: 'Total Deductions',
      exclusive: 0,
      conjugal: 0,
      total: output.item44_total_deductions,
      isSummary: true,
    },
    {
      item: 'NTE',
      description: 'Net Taxable Estate',
      exclusive: 0,
      conjugal: 0,
      total: taxComputation.netTaxableEstate,
      isSummary: true,
    },
    {
      item: 'Tax Due',
      description: 'Estate Tax Due',
      exclusive: 0,
      conjugal: 0,
      total: taxComputation.estateTaxDue,
      isSummary: true,
    },
    {
      item: 'FTC',
      description: 'Foreign Tax Credit',
      exclusive: 0,
      conjugal: 0,
      total: taxComputation.foreignTaxCredit,
    },
    {
      item: 'Net Due',
      description: 'Net Estate Tax Due',
      exclusive: 0,
      conjugal: 0,
      total: taxComputation.netEstateTaxDue,
      isSummary: true,
    },
    // ── Penalties ──────────────────────────────────────────────────────────
    //
    // Every string below is either a literal fixed by plan 20-05 or a value
    // read from the engine's `penalties` object. The section text comes from
    // `line.authority`, never from a literal authored here: the engine is the
    // single attribution authority, which is what gate G14 enforces.
    //
    // These four rows render on EVERY computation, including a zero-tax
    // estate. An estate with no tax still has an unknown penalty position, and
    // hiding the rows would restore exactly the silence Phase 20 removed.
    {
      item: 'S-248',
      description: `Surcharge — ${surchargeLine.authority}`,
      exclusive: 0,
      conjugal: 0,
      total: surchargeLine.centavos ?? 0,
      ...(surchargeLine.status === 'declined' ? { displayTotal: 'NOT COMPUTED' } : {}),
    },
    {
      item: 'I-249',
      description: `Interest — ${interestLine.authority}`,
      exclusive: 0,
      conjugal: 0,
      total: interestLine.centavos ?? 0,
      ...(interestLine.status === 'declined' ? { displayTotal: 'NOT COMPUTED' } : {}),
    },
    {
      item: 'CP',
      description: 'Compromise penalty',
      exclusive: 0,
      conjugal: 0,
      total: compromiseLine.centavos ?? 0,
      ...(compromiseLine.status === 'declined'
        ? { displayTotal: 'OUTSIDE ENGINE COMPETENCE' }
        : {}),
    },
    {
      item: 'Total',
      description: 'Total Amount Due',
      exclusive: 0,
      conjugal: 0,
      total: penalties.totalAmountDue ?? 0,
      isSummary: true,
      ...(penalties.totalAmountDue === null
        ? { displayTotal: 'NOT A TOTAL — SEE NOTE BELOW' }
        : {}),
    },
  ];

  return (
    <Card data-testid="form-1801-view">
      <CardHeader>
        <CardTitle>BIR Form 1801 — Estate Tax Return</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Col A — Exclusive</TableHead>
              <TableHead className="text-right">Col B — Conjugal</TableHead>
              <TableHead className="text-right">Col C — Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow
                key={line.item}
                data-testid={`form-line-${line.item}`}
                className={line.isSummary ? 'font-semibold bg-muted/30' : ''}
              >
                <TableCell className="font-mono text-xs">{line.item}</TableCell>
                <TableCell>{line.description}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {line.displayTotal === undefined ? formatPesos(line.exclusive) : NO_AMOUNT}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {line.displayTotal === undefined ? formatPesos(line.conjugal) : NO_AMOUNT}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {line.displayTotal ?? formatPesos(line.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!penalties.complete && (
          <p data-testid="penalty-refusal" className="mt-4 text-sm text-muted-foreground">
            {penalties.refusal}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
