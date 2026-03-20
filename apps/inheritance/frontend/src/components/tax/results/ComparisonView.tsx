/**
 * ComparisonView — side-by-side Regular vs Amnesty comparison.
 * Only rendered when dualPathComparison is non-null.
 */

import type { DualPathComparisonResult } from '@/lib/estate-tax-engine';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export interface ComparisonViewProps {
  dualPathComparison: DualPathComparisonResult;
}

function formatPesos(centavos: number): string {
  return (centavos / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ComparisonView({ dualPathComparison }: ComparisonViewProps) {
  const { amnestyResult, preTRAINResult, recommendedPath, filingWindowClosed } = dualPathComparison;

  const rows = [
    {
      label: 'Net Taxable Estate',
      amnesty: formatPesos(amnestyResult.netTaxableEstate),
      preTrain: formatPesos(preTRAINResult.netTaxableEstate),
    },
    {
      label: 'Tax Rate',
      amnesty: amnestyResult.amnestyTrack === 'TRACK_A' ? '6% flat' : '6% on increment',
      preTrain: 'Graduated (pre-TRAIN)',
    },
    {
      label: 'Estate Tax Due',
      amnesty: `₱${formatPesos(amnestyResult.estateTaxDue)}`,
      preTrain: `₱${formatPesos(preTRAINResult.estateTaxDue)}`,
    },
    {
      label: 'Net Tax Due',
      amnesty: `₱${formatPesos(amnestyResult.netEstateTaxDue)}`,
      preTrain: `₱${formatPesos(preTRAINResult.netEstateTaxDue)}`,
    },
  ];

  return (
    <Card data-testid="comparison-view">
      <CardHeader>
        <CardTitle>Amnesty vs. Regular Tax Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filingWindowClosed && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600">
            <Info className="size-4" />
            <AlertDescription>
              The Estate Tax Amnesty filing window has closed (June 14, 2023). This comparison is for
              informational purposes only.
            </AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Amnesty</TableHead>
              <TableHead>Regular (pre-TRAIN)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label} data-testid={`comparison-row-${row.label}`}>
                <TableCell>{row.label}</TableCell>
                <TableCell className="font-mono text-sm">{row.amnesty}</TableCell>
                <TableCell className="font-mono text-sm">{row.preTrain}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell>Recommended Path</TableCell>
              <TableCell colSpan={2}>
                <Badge
                  variant={recommendedPath === 'AMNESTY' ? 'default' : 'secondary'}
                  data-testid="recommended-path-badge"
                >
                  {recommendedPath === 'AMNESTY'
                    ? 'Amnesty'
                    : recommendedPath === 'PRE_TRAIN'
                      ? 'Regular (pre-TRAIN)'
                      : 'Equal — either path'}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
