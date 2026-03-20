/**
 * AdvisorPanel — renders Suggestion[] as cards sorted by savings.
 */

import type { Suggestion } from '@/lib/estate-tax-engine';
import type { EstateTaxWizardState } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, RotateCcw, TrendingDown } from 'lucide-react';

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
      <div data-testid="advisor-panel" className="flex flex-col items-center py-12 text-center text-muted-foreground">
        <Lightbulb className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-sm font-medium">No suggestions at this time</p>
        <p className="text-xs mt-1">Your estate tax looks well-optimized.</p>
      </div>
    );
  }

  return (
    <div data-testid="advisor-panel" className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <Card
          key={suggestion.id}
          data-testid={`suggestion-${index}`}
          className="border-green-100"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <TrendingDown className="h-4 w-4 text-green-600 shrink-0" />
                <CardTitle className="text-sm font-semibold leading-snug">{suggestion.title}</CardTitle>
              </div>
              <Badge
                variant="secondary"
                data-testid={`suggestion-savings-${index}`}
                className="text-green-700 bg-green-100 border-green-200 shrink-0 text-xs font-semibold"
              >
                Save ₱{formatPesos(suggestion.estimatedSavings)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                data-testid={`apply-suggestion-${index}`}
                onClick={() => onApply(suggestion.patch)}
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 h-7 text-xs"
              >
                Apply
              </Button>
              {onRevert && (
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`revert-suggestion-${index}`}
                  onClick={onRevert}
                  className="h-7 text-xs gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  Revert
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
