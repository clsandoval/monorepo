import { Link } from '@tanstack/react-router';
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

/** Router-wide 404 — before this, a bad URL rendered raw "Not Found" text. */
export function NotFoundPage() {
  return (
    <div className="py-16">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="This page does not exist or has moved."
      />
      <p className="text-center text-sm">
        <Link to="/" className="text-primary underline underline-offset-4">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
