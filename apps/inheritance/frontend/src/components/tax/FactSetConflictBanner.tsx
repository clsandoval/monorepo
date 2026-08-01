/**
 * Fact-Set Conflict Banner — the on-screen face of a refusal.
 *
 * This component computes nothing. It compares no date, formats no date and
 * derives no message: every string it shows comes from the `FactSetVerdict`
 * object produced by `@/lib/fact-set`, which is the single implementation of
 * the one-fact-set rule. A second comparison here would be a second
 * implementation of a rule, which is the defect this codebase's invariant 5
 * exists to prevent.
 *
 * On a healthy case it renders nothing at all.
 *
 * The disagreement branch prints **both** dates under their own testids.
 * FACT-04 requires the refusal to say what it found: an alert that announces a
 * conflict without naming the two values leaves the lawyer to go hunting for a
 * discrepancy the product already located.
 */
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { FactSetVerdict } from '@/lib/fact-set';

export function FactSetConflictBanner({ verdict }: { verdict: FactSetVerdict | null }) {
  if (!verdict || verdict.kind === 'ok') return null;

  if (verdict.kind === 'missing-date') {
    return (
      <Alert variant="destructive" data-testid="fact-set-missing-date">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Date of death not entered</AlertTitle>
        <AlertDescription>{verdict.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" data-testid="fact-set-conflict">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>This case holds two dates of death</AlertTitle>
      <AlertDescription>
        <span>{verdict.message}</span>
        <span className="block mt-2">
          Succession fact set:{' '}
          <span data-testid="fact-set-succession-date" className="font-medium">
            {verdict.succession}
          </span>
        </span>
        <span className="block">
          Estate-tax fact set:{' '}
          <span data-testid="fact-set-tax-date" className="font-medium">
            {verdict.tax}
          </span>
        </span>
      </AlertDescription>
    </Alert>
  );
}
