/**
 * Root error boundary.
 *
 * Before this existed, an uncaught throw inside any route component unmounted the
 * whole tree to a blank white page with nothing recorded anywhere. React has no
 * hook equivalent for error boundaries, so a class component is the only shape
 * available.
 *
 * The fallback carries `role="alert"` and exposes the real message under
 * `data-testid="error-boundary-message"` on purpose: a later screenshot-plus-vision
 * gate must be able to tell a caught failure apart from a working page, and a
 * fallback that looked intentional would be worse than a blank one.
 */

import React from 'react';
import { reportError } from '@/lib/error-reporting';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  override componentDidCatch(error: unknown): void {
    reportError(error, 'boundary');
  }

  override render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback !== undefined) {
      return this.props.fallback;
    }

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          The page could not be displayed. The error has been recorded.
        </p>
        <p
          data-testid="error-boundary-message"
          className="text-xs text-muted-foreground"
        >
          {this.state.message}
        </p>
        <button
          type="button"
          className="underline text-sm"
          onClick={() => window.location.reload()}
        >
          Reload this page
        </button>
      </div>
    );
  }
}
