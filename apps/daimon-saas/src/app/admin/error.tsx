'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[admin error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4 pt-20">
      <AlertCircle size={48} className="text-destructive" />
      <h1 className="text-2xl font-semibold text-foreground text-center">
        Something went wrong
      </h1>
      <p className="text-sm text-muted-foreground text-center max-w-[400px]">
        We couldn&apos;t load the admin panel. Please try refreshing.
      </p>
      <Button onClick={reset}>
        Refresh page
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Having trouble? Contact{' '}
        <a href="mailto:support@daimon.ai" className="underline text-foreground hover:text-foreground/80">
          support@daimon.ai
        </a>
      </p>
    </div>
  );
}
