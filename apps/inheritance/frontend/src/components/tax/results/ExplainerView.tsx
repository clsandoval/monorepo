/**
 * ExplainerView — renders ExplainerOutput sections as cards.
 */

import type { ExplainerOutput } from '@/lib/estate-tax-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ExplainerViewProps {
  explainer: ExplainerOutput;
}

export function ExplainerView({ explainer }: ExplainerViewProps) {
  if (!explainer.sections || explainer.sections.length === 0) {
    return (
      <div data-testid="explainer-view">
        <p className="text-muted-foreground">No explanation available.</p>
      </div>
    );
  }

  return (
    <div data-testid="explainer-view" className="space-y-4">
      {explainer.sections.map((section, index) => (
        <Card key={index} data-testid={`explainer-section-${index}`}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
