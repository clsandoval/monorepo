'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <AlertCircle size={48} className="text-red-600" />
      <h1 className="text-2xl font-semibold text-navy text-center">
        Something went wrong
      </h1>
      <p className="text-sm text-gray-500 text-center max-w-md">
        We encountered an unexpected error. Our team has been notified.
      </p>
      <Button onClick={() => (window.location.href = '/dashboard')}>
        Go to dashboard
      </Button>
      <p className="text-xs text-gray-400 text-center">
        If this keeps happening, contact{' '}
        <a href="mailto:support@daimon.ai" className="underline">
          support@daimon.ai
        </a>
      </p>
    </div>
  );
}
