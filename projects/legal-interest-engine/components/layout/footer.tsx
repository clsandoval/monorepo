import React from 'react';
import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* Disclaimer */}
          <p className="text-xs font-body text-muted leading-relaxed max-w-xl">
            <strong className="font-semibold text-primary/70">Disclaimer:</strong>{' '}
            Computations provided by Legal Interest Engine are for informational purposes only and
            do not constitute legal advice. Results are based on applicable Philippine Supreme Court
            circulars and jurisprudence. Always verify computations with a licensed attorney before
            use in legal proceedings.
          </p>

          {/* Links + copyright */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <nav className="flex items-center gap-4" aria-label="Footer navigation">
              <Link
                href="/privacy"
                className="text-xs font-body text-muted hover:text-primary transition-colors duration-150"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-xs font-body text-muted hover:text-primary transition-colors duration-150"
              >
                Terms
              </Link>
              <Link
                href="/pricing"
                className="text-xs font-body text-muted hover:text-primary transition-colors duration-150"
              >
                Pricing
              </Link>
            </nav>
            <p className="text-xs font-body text-muted">
              &copy; {year} Legal Interest Engine. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
