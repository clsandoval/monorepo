/**
 * Form1801View — line-by-line BIR Form 1801 display.
 *
 * Shows the return with columns: Item #, Description, Exclusive (Col A),
 * Conjugal (Col B), Total (Col C), Authority.
 *
 * This component BUILDS NO LINE. Its only source of rows is the engine's
 * `buildForm1801Lines` helper, and its only source of reconciliation warnings
 * is the `warnings` array that same call returns. No item number, no label and
 * no section literal is authored here: the engine is the single attribution
 * authority, which is what gate G14 enforces. The PDF and the CSV render the
 * same array, so the three surfaces cannot disagree about which rows exist.
 */

import type { EstateTaxFullOutput } from '@/lib/estate-tax-engine';
import { buildForm1801Lines } from '@/lib/estate-tax-engine';
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

export function Form1801View({ output }: Form1801ViewProps) {
  const { penalties } = output;
  const { lines, warnings } = buildForm1801Lines(output);

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
              <TableHead>Authority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/*
              The testid suffix is the line's stable `id`, NOT its item cell.
              Two Schedule 5 rows legitimately print the same item cell `5C`
              (unpaid mortgages and unpaid taxes), so keying on the item cell
              would collide. Do not revert this to `line.item`.
            */}
            {lines.map((line) => (
              <TableRow
                key={line.id}
                data-testid={`form-line-${line.id}`}
                className={line.isSummary ? 'font-semibold bg-muted/30' : ''}
              >
                <TableCell className="font-mono text-xs">{line.item}</TableCell>
                <TableCell>{line.label}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {line.exclusive === null ? NO_AMOUNT : formatPesos(line.exclusive)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {line.conjugal === null ? NO_AMOUNT : formatPesos(line.conjugal)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {line.displayTotal !== null
                    ? line.displayTotal
                    : line.total === null
                      ? NO_AMOUNT
                      : formatPesos(line.total)}
                </TableCell>
                <TableCell
                  className="text-xs text-muted-foreground"
                  data-testid={`form-line-authority-${line.id}`}
                >
                  {line.authority}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {warnings.length > 0 && (
          <div data-testid="form1801-warnings" className="mt-4 space-y-1">
            {warnings.map((warning, index) => (
              <p
                key={warning}
                data-testid={`form1801-warning-${index}`}
                className="text-sm text-muted-foreground"
              >
                {warning}
              </p>
            ))}
          </div>
        )}
        {!penalties.complete && (
          <p data-testid="penalty-refusal" className="mt-4 text-sm text-muted-foreground">
            {penalties.refusal}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
