/**
 * WarningsPanel — manual flag cards (forward-compatible).
 * Hidden when there is nothing to show.
 *
 * This panel renders the array `@/lib/warnings-lines` builds, and the exported
 * PDF (`components/pdf/WarningsSection.tsx`) renders the same one, so the screen
 * and the document cannot disagree about a warning's severity, its category, its
 * text or the heir it names. It composes no warning text of its own: it neither
 * classifies severity nor resolves an heir id.
 */
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { ManualFlag, InheritanceShare } from '../../types';
import { buildWarningLines, WARNINGS_HEADING, RELATED_HEIR_LABEL } from '@/lib/warnings-lines';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

export interface WarningsPanelProps {
  warnings: ManualFlag[];
  /** What the line model resolves a flag's `related_heir_id` against. */
  shares: InheritanceShare[];
}

const SEVERITY_ICON: Record<'error' | 'warning' | 'info', React.ReactNode> = {
  error: <AlertCircle className="size-4" />,
  warning: <AlertTriangle className="size-4" />,
  info: <Info className="size-4" />,
};

const SEVERITY_ALERT_CLASSES: Record<'error' | 'warning' | 'info', string> = {
  error: 'border-destructive/30 bg-red-50 text-red-800 [&>svg]:text-red-600',
  warning: 'border-warning/30 bg-amber-50 text-amber-800 [&>svg]:text-amber-600',
  info: 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600',
};

export function WarningsPanel({ warnings, shares }: WarningsPanelProps) {
  const lines = buildWarningLines(warnings, shares);

  if (lines.length === 0) {
    return <div data-testid="warnings-panel" />;
  }

  return (
    <div data-testid="warnings-panel">
      <h2 className="font-serif text-lg font-semibold text-primary mb-4">{WARNINGS_HEADING}</h2>
      <div className="space-y-3">
        {lines.map((line, index) => (
          <Alert
            key={index}
            data-testid={`warning-card-${index}`}
            className={SEVERITY_ALERT_CLASSES[line.severity]}
          >
            {SEVERITY_ICON[line.severity]}
            <AlertTitle className="text-xs font-semibold uppercase tracking-wide">
              {line.severity}
            </AlertTitle>
            <AlertDescription>
              <p>{line.description}</p>
              {line.relatedHeirName !== null && (
                <p className="text-sm mt-1 opacity-80">
                  {RELATED_HEIR_LABEL} {line.relatedHeirName}
                </p>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}
