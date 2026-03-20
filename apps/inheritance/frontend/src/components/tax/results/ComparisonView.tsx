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
import { Info, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      amnesty: `₱${formatPesos(amnestyResult.netTaxableEstate)}`,
      preTrain: `₱${formatPesos(preTRAINResult.netTaxableEstate)}`,
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

  const isAmnestyRecommended = recommendedPath === 'AMNESTY';
  const isPreTrainRecommended = recommendedPath === 'PRE_TRAIN';

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

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Item</TableHead>
                <TableHead
                  className={cn(
                    'font-semibold',
                    isAmnestyRecommended && 'text-[#1e3a5f]',
                  )}
                >
                  Amnesty
                  {isAmnestyRecommended && (
                    <Trophy className="inline h-3.5 w-3.5 ml-1.5 text-[#c5a44e]" />
                  )}
                </TableHead>
                <TableHead
                  className={cn(
                    'font-semibold',
                    isPreTrainRecommended && 'text-[#1e3a5f]',
                  )}
                >
                  Regular (pre-TRAIN)
                  {isPreTrainRecommended && (
                    <Trophy className="inline h-3.5 w-3.5 ml-1.5 text-[#c5a44e]" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => {
                const isLastRow = idx === rows.length - 1;
                return (
                  <TableRow
                    key={row.label}
                    data-testid={`comparison-row-${row.label}`}
                    className={cn(
                      'hover:bg-muted/20',
                      isLastRow && 'font-semibold bg-muted/10',
                    )}
                  >
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell
                      className={cn(
                        'font-mono text-sm',
                        isAmnestyRecommended && isLastRow && 'text-green-600 font-bold',
                      )}
                    >
                      {row.amnesty}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'font-mono text-sm',
                        isPreTrainRecommended && isLastRow && 'text-green-600 font-bold',
                      )}
                    >
                      {row.preTrain}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-[#1e3a5f]/5">
                <TableCell className="font-semibold text-[#1e3a5f]">Recommended Path</TableCell>
                <TableCell colSpan={2}>
                  <Badge
                    variant={recommendedPath !== 'EQUAL' ? 'default' : 'secondary'}
                    data-testid="recommended-path-badge"
                    className={cn(
                      recommendedPath !== 'EQUAL' && 'bg-[#1e3a5f] hover:bg-[#1e3a5f]/90',
                    )}
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
        </div>
      </CardContent>
    </Card>
  );
}
