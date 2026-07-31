/**
 * In-process error report sink.
 *
 * No error-tracking service is configured anywhere in this repository, and picking
 * a vendor would be an ungrounded decision. So this is deliberately local: a
 * bounded ring buffer plus a read API, and a mirror to `console.error` so that
 * nothing captured here is also silenced.
 *
 * Nothing in this module performs any network call, by any transport. That is a
 * hard constraint — case data in this product is covered by attorney-client
 * privilege, and a captured error can contain it. A gate greps this file for the
 * three browser transport APIs and fails if any of them appears, so do not name
 * them even in a comment.
 *
 * This module intentionally imports nothing from the rest of the project.
 */

export interface ErrorReport {
  /** Monotonic counter starting at 1, incremented for every report. */
  id: number;
  /** ISO-8601 timestamp taken at capture time. */
  at: string;
  /** Which entry point captured the error. */
  source: 'boundary' | 'window' | 'unhandledrejection' | 'manual';
  /** The error's message, or `String(value)` when the thrown value is not an Error. */
  message: string;
  /** The error's stack, or null when the thrown value carries none. */
  stack: string | null;
}

/** Hard cap on retained reports. A render loop must not exhaust memory. */
const MAX_REPORTS = 50;

let reports: ErrorReport[] = [];
let nextId = 1;
let handlersInstalled = false;

/**
 * Record a thrown value. Returns the report that was stored, so a caller can
 * assert on it directly.
 */
export function reportError(
  value: unknown,
  source: ErrorReport['source'] = 'manual',
): ErrorReport {
  const isError = value instanceof Error;
  const report: ErrorReport = {
    id: nextId++,
    at: new Date().toISOString(),
    source,
    message: isError ? value.message : String(value),
    stack: isError ? (value.stack ?? null) : null,
  };

  reports.push(report);
  while (reports.length > MAX_REPORTS) {
    reports.shift();
  }

  console.error('[error-report]', report.source, report.message, value);

  return report;
}

/**
 * Every retained report, oldest first. Returns a shallow copy: a caller must not
 * be able to mutate module state through the returned array.
 */
export function getReportedErrors(): ErrorReport[] {
  return reports.slice();
}

/**
 * Empty the buffer. The id counter is deliberately NOT reset, so ids stay unique
 * across a session even after a clear.
 */
export function clearReportedErrors(): void {
  reports = [];
}

/**
 * Attach `error` and `unhandledrejection` listeners that funnel into this sink.
 * Returns a remover. Calling this twice does not attach duplicate listeners; the
 * second call returns a no-op remover.
 */
export function installGlobalErrorHandlers(target: Window = window): () => void {
  if (handlersInstalled) {
    return () => {};
  }

  const onError = (event: ErrorEvent): void => {
    reportError(event.error ?? event.message, 'window');
  };
  const onRejection = (event: PromiseRejectionEvent): void => {
    reportError(event.reason, 'unhandledrejection');
  };

  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);
  handlersInstalled = true;

  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
    handlersInstalled = false;
  };
}
