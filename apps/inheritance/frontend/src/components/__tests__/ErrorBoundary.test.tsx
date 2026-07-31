/**
 * Tests for the root error boundary.
 *
 * Source of truth: `.planning/phases/05-engine-observability-restored/05-02-PLAN.md`
 * (OBS-08). React logs every caught boundary error to `console.error`, so the spy
 * here suppresses harness noise only — the production mirroring is asserted by
 * `src/lib/__tests__/error-reporting.test.ts`.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { getReportedErrors, clearReportedErrors } from '@/lib/error-reporting';

function Boom(): React.ReactElement {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    clearReportedErrors();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children untouched when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('all good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders the fallback alert when a child throws during render', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('exposes the real error message under the error-boundary-message testid', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('error-boundary-message')).toHaveTextContent('kaboom');
  });

  it('reports exactly one boundary-sourced error for the caught throw', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    const reported = getReportedErrors();
    expect(reported).toHaveLength(1);
    expect(reported[0]!.source).toBe('boundary');
    expect(reported[0]!.message).toBe('kaboom');
  });

  it('renders a supplied fallback instead of the built-in markup', () => {
    render(
      <ErrorBoundary fallback={<p>custom fallback</p>}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });
});
