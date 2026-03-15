'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[dashboard error]', error);
  }, [error]);

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4 pt-20">
        <AlertCircle size={48} className="text-red-600" />
        <h1 className="text-2xl font-semibold text-navy text-center">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-[400px]">
          We couldn&apos;t load your workspace data. Please try refreshing.
        </p>
        <Button onClick={reset}>
          Refresh page
        </Button>
        <p className="text-xs text-gray-400 text-center">
          Having trouble? Contact{' '}
          <a href="mailto:support@daimon.ai" className="underline">
            support@daimon.ai
          </a>
        </p>
      </div>
    </DashboardLayout>
  );
}
