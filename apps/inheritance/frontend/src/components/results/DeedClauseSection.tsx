/**
 * DeedClauseSection — the exit for the succession side.
 *
 * The vision audit's finding was that a lawyer can get an answer on screen and
 * cannot get an instrument off the screen. This section is the door: the
 * schedule-of-shares clause, a copy control and a DOCX download, without
 * leaving the results view.
 *
 * IT COMPOSES NOTHING. It calls `buildDeedSchedule` once, hands the result to
 * `buildDeedClauseText` and `buildDeedClauseDocx`, and renders the string it
 * gets back. It reaches into no engine array, no citation list, no warning and
 * no money field, so the screen cannot state a figure or an article the clause
 * builders did not.
 *
 * THE FOUR `data-testid` VALUES ARE A CONTRACT with gate G38 and must not be
 * renamed: `deed-clause-section`, `deed-clause-text`, `copy-deed-clause`,
 * `download-deed-docx`.
 */

import { useMemo } from 'react';
import { Copy, FileDown } from 'lucide-react';
import type { EngineInput, EngineOutput } from '../../types';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { buildDeedSchedule } from '../../lib/deed/schedule-lines';
import { buildDeedClauseText, deedClauseBaseName } from '../../lib/deed/clause-text';
import { buildDeedClauseDocx, DOCX_MIME_TYPE } from '../../lib/deed/docx';

const DEED_CLAUSE_INTRO =
  'Paste this clause into the schedule section of your Deed of Extrajudicial Settlement. Every stated line carries the article the engine emitted for that heir.';

export interface DeedClauseSectionProps {
  input: EngineInput;
  output: EngineOutput;
}

export function DeedClauseSection({ input, output }: DeedClauseSectionProps) {
  const schedule = useMemo(() => buildDeedSchedule(input, output), [input, output]);
  const clauseText = useMemo(() => buildDeedClauseText(schedule), [schedule]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(clauseText);
    }
  };

  const handleDownloadDocx = () => {
    const bytes = buildDeedClauseDocx(schedule);
    const blob = new Blob([bytes], { type: DOCX_MIME_TYPE });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deedClauseBaseName(schedule)}.docx`;
      a.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <section data-testid="deed-clause-section" className="space-y-3">
      <Separator />
      <h2 className="font-serif text-lg font-semibold text-primary mb-4">
        Schedule of Shares — Deed Clause
      </h2>
      <p className="text-sm text-muted-foreground">{DEED_CLAUSE_INTRO}</p>
      <pre
        data-testid="deed-clause-text"
        className="whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-4 font-mono text-xs leading-relaxed"
      >
        {clauseText}
      </pre>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          data-testid="copy-deed-clause"
          onClick={handleCopy}
        >
          <Copy className="size-4" />
          Copy Clause
        </Button>
        <Button
          type="button"
          variant="outline"
          data-testid="download-deed-docx"
          onClick={handleDownloadDocx}
        >
          <FileDown className="size-4" />
          Download DOCX
        </Button>
      </div>
    </section>
  );
}
