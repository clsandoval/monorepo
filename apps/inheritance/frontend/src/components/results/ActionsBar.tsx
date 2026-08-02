/**
 * ActionsBar — Edit Input, Export JSON, Copy Narratives, Share.
 */
import { useState } from 'react';
import { Pencil, Download, Copy, FileText, Loader2 } from 'lucide-react';
import type { EngineInput, EngineOutput } from '../../types';
import { stripMarkdownBold } from './utils';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export interface ActionsBarProps {
  input: EngineInput;
  output: EngineOutput;
  onEditInput: () => void;



}

function downloadJson(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ActionsBar({ input, output, onEditInput, }: ActionsBarProps) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExport = () => {
    const dateOfDeath = input.decedent.date_of_death;
    downloadJson(
      { input, output },
      `inheritance-${dateOfDeath}-both.json`,
    );
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const { downloadPDF } = await import('../../lib/pdf-export');
      // downloadPDF's third parameter is the firm profile, and EstatePDF gates
      // the letterhead on it. This call passed the literal `null`, which made
      // the stored letterhead unrenderable no matter what was configured at
      // /settings — the letterhead the app captures could never appear in any
      // PDF a user could obtain. The import is dynamic for the same reason the
      // one above it is: the PDF path is code-split, and a static import would
      // pull the supabase client into every bundle that renders the results
      // view. A null profile does not abandon the export — the document prints
      // ATTORNEY ATTRIBUTION UNAVAILABLE on its own face instead.
      const { loadCurrentFirmProfile } = await import('../../lib/firm-profile');
      const profile = await loadCurrentFirmProfile();
      await downloadPDF(input, output, profile);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCopyNarratives = () => {
    const header = `Philippine Inheritance Distribution — ${input.decedent.name} (${input.decedent.date_of_death})\n\n`;
    const body = output.narratives
      .map((n) => stripMarkdownBold(n.text))
      .join('\n\n');
    navigator.clipboard.writeText(header + body);
  };

  return (
    <div data-testid="actions-bar">
      <Separator className="mb-4" />
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onEditInput}
        >
          <Pencil className="size-4" />
          Edit Input
        </Button>
        <Button
          type="button"
          variant="outline"
          data-testid="export-pdf"
          onClick={handleExportPDF}
          disabled={pdfLoading}
        >
          {pdfLoading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          Export PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
        >
          <Download className="size-4" />
          Export JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopyNarratives}
        >
          <Copy className="size-4" />
          Copy Narratives
        </Button>
      </div>
    </div>
  );
}
