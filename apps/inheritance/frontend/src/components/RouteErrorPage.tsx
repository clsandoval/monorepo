import { Link, useRouter } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

/**
 * Router-wide error fallback. TanStack Router's per-route CatchBoundary catches
 * a render throw before the app-level ErrorBoundary in main.tsx ever sees it, so
 * without this the user lands on the framework's bare "Something went wrong /
 * Show Error" default — no app shell, no way back. This renders a styled,
 * navigable recovery screen: retry, or return to the case list.
 */
export function RouteErrorPage({ error }: { error: unknown }) {
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="py-16">
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong on this page"
        description="This case couldn't be displayed. Your data is safe — nothing was changed."
      />
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          <Button onClick={() => router.invalidate()} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link to="/cases">Back to cases</Link>
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="text-xs text-muted-foreground underline underline-offset-4"
        >
          {showDetail ? 'Hide details' : 'Show details'}
        </button>
        {showDetail && (
          <pre className="max-w-lg overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
            {message}
          </pre>
        )}
      </div>
    </div>
  );
}
