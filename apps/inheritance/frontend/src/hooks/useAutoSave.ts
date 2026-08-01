/**
 * Debounced autosave of succession-wizard input to `cases.input_json`.
 *
 * This rewrite removes two defects that together made the hook unable to save anything a lawyer
 * typed:
 *
 *   1. **The guard compared references.** The previous body early-returned whenever the incoming
 *      `input` was reference-identical to the one held in `prevInputRef`, so a form library that
 *      mutates an object in place — or any caller that re-passes the same object after changing a
 *      nested field — was invisible to it. Measured in `19-BASELINE.md` section 3:
 *      `INPLACE_EDIT_SAVES=0`. The guard now compares a deterministic serialization of the value
 *      (`stableStringify`). (The old expression is not reproduced here: the plan's own check greps
 *      for it to prove no reference comparison survives, and a quotation would defeat that check.)
 *
 *   2. **The cleanup discarded work.** The previous body cleared the pending timer on every effect
 *      re-run and on unmount, so up to `DEBOUNCE_MS` of typing died when the lawyer navigated away.
 *      Measured: `UNMOUNT_FLUSH_SAVES=0`. The unmount cleanup now **flushes** the pending save.
 *
 * Authorisation for the unmount behaviour change — ROADMAP Phase 19 success criterion 3, quoted
 * verbatim (the roadmap sets the verb in markdown bold; the words are unchanged):
 *
 *   "Unmounting the wizard with a save pending flushes it instead of clearing it, proven by a test
 *    that unmounts inside the debounce window."
 *
 * A third, quieter behaviour is also removed. `prevInputRef` previously initialised to the first
 * render's value, which for the case route is `null`, so opening a case performed exactly one save
 * (`OPEN_ONLY_SAVES=1`) whose payload equalled what had just been read out of the database. The first
 * value observed for a case is now **adopted**, not treated as a change, so opening a case writes
 * nothing and the save indicator stays silent until the lawyer actually edits.
 *
 * The pending save carries its own `caseId`. A flush can therefore only ever write to the case whose
 * edit scheduled it, never to whichever case happens to be open when the flush lands.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { EngineInput, AutoSaveStatus } from '@/types';
import { updateCaseInput } from '@/lib/cases';
import { stableStringify } from '@/lib/stable-stringify';

const DEBOUNCE_MS = 1500;

interface PendingSave {
  caseId: string;
  input: EngineInput;
}

export interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  save: () => void;
}

export function useAutoSave(
  caseId: string | null,
  input: EngineInput,
): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<PendingSave | null>(null);
  const prevSerializedRef = useRef<string | null>(null);
  const lastCaseIdRef = useRef<string | null>(caseId);
  const mountedRef = useRef(true);

  const doSave = useCallback(async (target: PendingSave) => {
    setStatus('saving');
    try {
      await updateCaseInput(target.caseId, target.input);
      if (mountedRef.current) setStatus('saved');
    } catch {
      if (mountedRef.current) setStatus('error');
    }
  }, []);

  // Case-boundary effect: flush the outgoing case's pending work before adopting the new case.
  useEffect(() => {
    if (lastCaseIdRef.current === caseId) return;
    lastCaseIdRef.current = caseId;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    if (pending) {
      pendingRef.current = null;
      // `pending` carries its own caseId, so this writes to the PREVIOUS case.
      void doSave(pending);
    }
    // The next value seen for the new case is adopted, not saved.
    prevSerializedRef.current = null;
  }, [caseId, doSave]);

  // The serialization is computed during render, not inside the effect, and is itself the effect's
  // dependency. This is load-bearing: React's own dependency array compares with Object.is, so an
  // `input` object mutated in place is reference-identical between renders and an effect keyed on
  // `[caseId, input, doSave]` would never re-run — the value guard inside it would never be reached.
  // Keying on the serialized text is what makes an in-place edit observable at all.
  const serialized = caseId ? stableStringify(input) : '';

  // Debounce effect. Returns no cleanup: a pending save must survive a re-render.
  // `input` is deliberately not a dependency; it is read from the closure of whichever render last
  // changed `serialized`, which is by construction the render carrying the current values.
  useEffect(() => {
    if (!caseId) return;

    if (prevSerializedRef.current === null) {
      // First value observed for this case: adopt it, save nothing.
      prevSerializedRef.current = serialized;
      return;
    }
    if (prevSerializedRef.current === serialized) return;

    prevSerializedRef.current = serialized;

    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current = { caseId, input };
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const pending = pendingRef.current;
      if (!pending) return;
      pendingRef.current = null;
      void doSave(pending);
    }, DEBOUNCE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, serialized, doSave]);

  // Unmount effect: flush, never discard.
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const pending = pendingRef.current;
      if (pending) {
        pendingRef.current = null;
        void doSave(pending);
      }
    };
  }, [doSave]);

  const save = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    let target = pendingRef.current;
    if (!target && caseId) target = { caseId, input };
    if (!target) return;
    pendingRef.current = null;
    void doSave(target);
  }, [caseId, input, doSave]);

  return { status, save };
}
