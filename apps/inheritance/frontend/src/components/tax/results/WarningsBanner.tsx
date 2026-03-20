/**
 * WarningsBanner — renders engine warnings as a stack of Alert components.
 */

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface WarningsBannerProps {
  warnings: string[];
}

export function WarningsBanner({ warnings }: WarningsBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div data-testid="warnings-banner" className="space-y-2 mb-4">
      {warnings.map((warning, index) => (
        <Alert
          key={index}
          data-testid={`warning-${index}`}
          className="border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600"
        >
          <AlertTriangle className="size-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
