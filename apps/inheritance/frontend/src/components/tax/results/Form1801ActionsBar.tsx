/**
 * Form1801ActionsBar — the two exits from BIR Form 1801.
 *
 * This component ADDS CONTROLS ONLY. It constructs no line, label, amount or
 * authority; both writers read the same engine line model the table renders, so
 * the exported document always matches what is on screen.
 *
 * Neither date is read from a clock here. `dateOfDeath` comes from the shared
 * fact set that gate G34 protects, and `generatedOn` is computed once in the
 * route and passed down, so an exported document is reproducible from its own
 * parameters.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import type { EstateTaxFullOutput } from '@/lib/estate-tax-engine';
import { Button } from '@/components/ui/button';
import { downloadForm1801Pdf } from '@/lib/form1801-pdf';
import { downloadForm1801Csv } from '@/lib/form1801-csv';

export interface Form1801ActionsBarProps {
  output: EstateTaxFullOutput;
  decedentName: string;
  dateOfDeath: string;
  generatedOn: string;
}

export function Form1801ActionsBar({
  output,
  decedentName,
  dateOfDeath,
  generatedOn,
}: Form1801ActionsBarProps) {
  const [generating, setGenerating] = useState(false);

  async function handleExportPdf() {
    setGenerating(true);
    try {
      await downloadForm1801Pdf(output, decedentName, dateOfDeath, generatedOn);
    } catch {
      toast.error('Could not generate the Form 1801 PDF. The return was not exported.');
    } finally {
      // Cleared in `finally` so a rejected export cannot leave the control
      // permanently disabled.
      setGenerating(false);
    }
  }

  function handleExportCsv() {
    try {
      // The CSV filename carries `generatedOn`, matching the PDF, so both
      // artifacts from one export session share a date in their names.
      downloadForm1801Csv(output, decedentName, generatedOn);
    } catch {
      toast.error('Could not generate the Form 1801 CSV. The return was not exported.');
    }
  }

  return (
    <div data-testid="form1801-actions" className="flex items-center gap-2">
      <Button
        data-testid="export-form1801-pdf"
        onClick={handleExportPdf}
        disabled={generating}
        variant="outline"
      >
        {generating ? 'Generating PDF…' : 'Export PDF'}
      </Button>
      <Button data-testid="export-form1801-csv" onClick={handleExportCsv} variant="outline">
        Export CSV
      </Button>
    </div>
  );
}
