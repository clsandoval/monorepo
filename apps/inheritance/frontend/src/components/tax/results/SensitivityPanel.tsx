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
      <div data-testid="sensitivity-panel">
        <p className="text-muted-foreground text-sm">
          No sensitivity results available.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="sensitivity-panel">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Input</TableHead>
            <TableHead>Current</TableHead>
            <TableHead>Alternative</TableHead>
            <TableHead className="text-right">Tax Impact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={result.inputName} data-testid={`sensitivity-row-${index}`}>
              <TableCell className="font-medium">{result.inputName}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{result.currentValue}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {result.alternativeValue}
              </TableCell>
              <TableCell
                className={`text-right font-mono text-sm font-semibold ${result.taxDelta < 0 ? 'text-green-600' : result.taxDelta > 0 ? 'text-red-600' : 'text-muted-foreground'}`}
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
