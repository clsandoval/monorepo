/**
 * Tests for the in-process error report sink.
 *
 * Source of truth: `.planning/phases/05-engine-observability-restored/05-02-PLAN.md`
 * (OBS-08). The module has no external boundary, so nothing is mocked except
 * `console.error`, which is spied on only to keep the suite output readable.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  reportError,
  getReportedErrors,
  clearReportedErrors,
  installGlobalErrorHandlers,
} from '../error-reporting';

describe('error-reporting', () => {
  beforeEach(() => {
    clearReportedErrors();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('reportError', () => {
    it('normalises an Error into a report with its message and stack', () => {
      const report = reportError(new Error('boom'));
      expect(report.message).toBe('boom');
      expect(report.source).toBe('manual');
      expect(typeof report.stack).toBe('string');
      expect(report.stack).not.toBeNull();
    });

    it('normalises a non-Error value with a null stack', () => {
      const report = reportError('plain string', 'window');
      expect(report.message).toBe('plain string');
      expect(report.source).toBe('window');
      expect(report.stack).toBeNull();
    });

    it('mirrors every report to console.error so nothing captured is silenced', () => {
      const spy = vi.spyOn(console, 'error');
      reportError(new Error('mirrored'));
      expect(spy).toHaveBeenCalledWith(
        '[error-report]',
        'manual',
        'mirrored',
        expect.any(Error),
      );
    });
  });

  describe('getReportedErrors', () => {
    it('returns reports in insertion order', () => {
      reportError(new Error('boom'));
      reportError('plain string', 'window');

      const all = getReportedErrors();
      expect(all).toHaveLength(2);
      expect(all[0]!.message).toBe('boom');
      expect(all[1]!.message).toBe('plain string');
    });

    it('returns a copy, so a caller cannot mutate module state', () => {
      reportError(new Error('boom'));

      const first = getReportedErrors();
      first.push({
        id: 999,
        at: 'never',
        source: 'manual',
        message: 'injected',
        stack: null,
      });
      first.length = 0;

      expect(getReportedErrors()).toHaveLength(1);
      expect(getReportedErrors()[0]!.message).toBe('boom');
    });

    it('is bounded at 50 entries, evicting oldest first', () => {
      for (let i = 1; i <= 55; i++) {
        reportError(new Error(`report ${i}`));
      }

      const all = getReportedErrors();
      expect(all).toHaveLength(50);
      // 55 pushed, 50 retained: the first survivor is the sixth one pushed.
      expect(all[0]!.message).toBe('report 6');
      expect(all[49]!.message).toBe('report 55');
    });
  });

  describe('clearReportedErrors', () => {
    it('empties the buffer but keeps ids monotonic', () => {
      const before = reportError(new Error('before clear'));
      clearReportedErrors();
      expect(getReportedErrors()).toHaveLength(0);

      const after = reportError(new Error('after clear'));
      expect(after.id).toBeGreaterThan(before.id);
    });
  });

  describe('installGlobalErrorHandlers', () => {
    it('captures a window error event and stops capturing once removed', () => {
      const remove = installGlobalErrorHandlers();

      window.dispatchEvent(new ErrorEvent('error', { message: 'global boom' }));

      const afterDispatch = getReportedErrors();
      expect(afterDispatch).toHaveLength(1);
      expect(afterDispatch[0]!.source).toBe('window');
      expect(afterDispatch[0]!.message).toBe('global boom');

      remove();
      window.dispatchEvent(new ErrorEvent('error', { message: 'ignored' }));
      expect(getReportedErrors()).toHaveLength(1);
    });

    it('does not attach duplicate listeners when called twice', () => {
      const removeFirst = installGlobalErrorHandlers();
      const removeSecond = installGlobalErrorHandlers();

      window.dispatchEvent(new ErrorEvent('error', { message: 'once only' }));
      expect(getReportedErrors()).toHaveLength(1);

      removeSecond();
      removeFirst();
      window.dispatchEvent(new ErrorEvent('error', { message: 'ignored' }));
      expect(getReportedErrors()).toHaveLength(1);
    });
  });
});
