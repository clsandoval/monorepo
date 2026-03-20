/**
 * AdvisorPanel — renders Suggestion[] as cards sorted by savings.
 */

import type { Suggestion } from '@/lib/estate-tax-engine';
import type { EstateTaxWizardState } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AdvisorPanelProps {
  suggestions: Suggestion[];
  onApply: (patch: Partial<EstateTaxWizardState>) => void;
  onRevert?: () => void;
}

function formatPesos(centavos: number): string {
  return (centavos / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function AdvisorPanel({ suggestions, onApply, onRevert }: AdvisorPanelProps) {
  if (suggestions.length === 0) {
    return (
      <div data-testid="advisor-panel">
        <p className="text-muted-foreground text-sm">
          No optimization suggestions at this time.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="advisor-panel" className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <Card key={suggestion.id} data-testid={`suggestion-${index}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">{suggestion.title}</CardTitle>
              <Badge
                variant="secondary"
                data-testid={`suggestion-savings-${index}`}
                className="text-green-700 bg-green-100"
              >
                Save ₱{formatPesos(suggestion.estimatedSavings)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            <div className="flex gap-2">
              <button
                data-testid={`apply-suggestion-${index}`}
                className="text-sm text-primary underline"
                onClick={() => onApply(suggestion.patch)}
              >
                Apply
              </button>
              {onRevert && (
                <button
                  data-testid={`revert-suggestion-${index}`}
                  className="text-sm text-muted-foreground underline"
                  onClick={onRevert}
                >
                  Revert
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
