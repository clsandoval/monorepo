'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-sm text-muted uppercase tracking-widest mb-4">
          Something went wrong
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-primary mb-4 leading-tight">
          An unexpected error occurred
        </h1>
        <p className="font-body text-secondary text-base leading-relaxed mb-8">
          {error.message || 'We encountered an error processing your request. Please try again or return home.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150 w-full sm:w-auto"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md border border-border text-primary font-body font-medium text-sm hover:bg-primary/5 transition-colors duration-150 w-full sm:w-auto"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
