/**
 * SensitivityPanel — table of SensitivityResult[] ranked by impact.
 */

import type { SensitivityResult } from '@/lib/estate-tax-engine';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart2 } from 'lucide-react';

export interface SensitivityPanelProps {
  results: SensitivityResult[];
}

function formatDelta(centavos: number): string {
  const sign = centavos < 0 ? '−' : '+';
  const abs = Math.abs(centavos) / 100;
  return `${sign}₱${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function SensitivityPanel({ results }: SensitivityPanelProps) {
  if (results.length === 0) {
    return (
      <div data-testid="sensitivity-panel" className="flex flex-col items-center py-12 text-center text-muted-foreground">
        <BarChart2 className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-sm font-medium">No sensitivity results available</p>
        <p className="text-xs mt-1">Results will appear after computing the estate tax.</p>
      </div>
    );
  }

  return (
    <div data-testid="sensitivity-panel" className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Input</TableHead>
            <TableHead className="font-semibold">Current</TableHead>
            <TableHead className="font-semibold">Alternative</TableHead>
            <TableHead className="text-right font-semibold">Tax Impact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow
              key={result.inputName}
              data-testid={`sensitivity-row-${index}`}
              className="hover:bg-muted/20"
            >
              <TableCell className="font-medium text-sm">{result.inputName}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{result.currentValue}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {result.alternativeValue}
              </TableCell>
              <TableCell
                className={`text-right font-mono text-sm font-semibold ${
                  result.taxDelta < 0
                    ? 'text-green-600'
                    : result.taxDelta > 0
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                }`}
              >
                {formatDelta(result.taxDelta)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
