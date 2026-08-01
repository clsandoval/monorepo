import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { EngineInput } from '@/types';

const mockUpdateCaseInput = vi.fn();

vi.mock('@/lib/cases', () => ({
  updateCaseInput: (...args: unknown[]) => mockUpdateCaseInput(...args),
}));

import { useAutoSave } from '../useAutoSave';

const baseInput: EngineInput = {
  net_distributable_estate: { centavos: 1000000 },
  decedent: {
    id: 'p1',
    name: 'Juan dela Cruz',
    date_of_death: '2024-03-15',
    is_married: true,
    date_of_marriage: '1990-01-01',
    marriage_solemnized_in_articulo_mortis: false,
    was_ill_at_marriage: false,
    illness_caused_death: false,
    years_of_cohabitation: 34,
    has_legal_separation: false,
    is_illegitimate: false,
  },
  family_tree: [],
  will: null,
  donations: [],
  config: { retroactive_ra_11642: false, max_pipeline_restarts: 5 },
};

describe('useAutoSave hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with idle status', () => {
    const { result } = renderHook(() => useAutoSave('case-1', baseInput));
    expect(result.current.status).toBe('idle');
  });

  it('does not save when caseId is null', () => {
    const modifiedInput = { ...baseInput, net_distributable_estate: { centavos: 2000000 } };
    const { result, rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: null as string | null, input: baseInput } },
    );

    rerender({ caseId: null, input: modifiedInput });
    vi.advanceTimersByTime(2000);

    expect(mockUpdateCaseInput).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('debounces save by 1500ms after input change', async () => {
    mockUpdateCaseInput.mockResolvedValue(undefined);

    const modifiedInput = { ...baseInput, net_distributable_estate: { centavos: 2000000 } };
    const { rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1', input: baseInput } },
    );

    // Change input
    rerender({ caseId: 'case-1', input: modifiedInput });

    // Not saved yet at 1400ms
    vi.advanceTimersByTime(1400);
    expect(mockUpdateCaseInput).not.toHaveBeenCalled();

    // Saved at 1500ms
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(mockUpdateCaseInput).toHaveBeenCalledWith('case-1', modifiedInput);
  });

  it('shows saving status during save', async () => {
    let resolveUpdate: () => void;
    mockUpdateCaseInput.mockImplementation(
      () => new Promise<void>((resolve) => { resolveUpdate = resolve; }),
    );

    const modifiedInput = { ...baseInput, net_distributable_estate: { centavos: 3000000 } };
    const { result, rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1', input: baseInput } },
    );

    rerender({ caseId: 'case-1', input: modifiedInput });

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.status).toBe('saving');

    await act(async () => {
      resolveUpdate!();
    });

    expect(result.current.status).toBe('saved');
  });

  it('shows error status when save fails', async () => {
    mockUpdateCaseInput.mockRejectedValue(new Error('Network error'));

    const modifiedInput = { ...baseInput, net_distributable_estate: { centavos: 4000000 } };
    const { result, rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1', input: baseInput } },
    );

    rerender({ caseId: 'case-1', input: modifiedInput });

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.status).toBe('error');
  });

  it('exposes manual save function', () => {
    const { result } = renderHook(() => useAutoSave('case-1', baseInput));
    expect(typeof result.current.save).toBe('function');
  });

  /*
   * AUTHORISATION FOR THE INVERTED ASSERTION BELOW.
   *
   * This case was named `cancels pending save on unmount` and asserted
   * `expect(mockUpdateCaseInput).not.toHaveBeenCalled()`. That assertion pinned a data-loss
   * behaviour, and the owner instructed in writing that the behaviour must change. ROADMAP Phase 19
   * success criterion 3, quoted verbatim (the roadmap sets the verb in markdown bold; the words are
   * unchanged):
   *
   *   "Unmounting the wizard with a save pending flushes it instead of clearing it, proven by a test
   *    that unmounts inside the debounce window."
   *
   * The case is therefore RENAMED and its assertion INVERTED to the stronger `toHaveBeenCalledWith`
   * form. It is not deleted, not skipped and not marked todo. The safety property it protected — that
   * an unmount with nothing pending writes nothing — is preserved by the new case
   * `does not flush on unmount when nothing is pending`.
   */
  it('flushes pending save on unmount', () => {
    const modifiedInput = { ...baseInput, net_distributable_estate: { centavos: 5000000 } };
    const { rerender, unmount } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1', input: baseInput } },
    );

    rerender({ caseId: 'case-1', input: modifiedInput });
    unmount();
    vi.advanceTimersByTime(2000);

    expect(mockUpdateCaseInput).toHaveBeenCalledTimes(1);
    expect(mockUpdateCaseInput).toHaveBeenCalledWith('case-1', modifiedInput);
  });

  it('adopts the first value without saving', () => {
    const { rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1' as string | null, input: baseInput } },
    );

    rerender({ caseId: 'case-1', input: baseInput });
    vi.advanceTimersByTime(2000);

    expect(mockUpdateCaseInput).not.toHaveBeenCalled();
  });

  it('saves when the same object is mutated in place', async () => {
    mockUpdateCaseInput.mockResolvedValue(undefined);

    const mutable: EngineInput = {
      ...baseInput,
      net_distributable_estate: { centavos: 1000000 },
    };
    const { rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1' as string | null, input: mutable } },
    );

    mutable.net_distributable_estate.centavos = 7777777;
    rerender({ caseId: 'case-1', input: mutable });

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockUpdateCaseInput).toHaveBeenCalledTimes(1);
  });

  it('does not save when a rerender changes nothing', () => {
    const identicalValues = JSON.parse(JSON.stringify(baseInput)) as EngineInput;
    const { rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1' as string | null, input: baseInput } },
    );

    // Different object reference, identical values.
    rerender({ caseId: 'case-1', input: identicalValues });
    vi.advanceTimersByTime(2000);

    expect(mockUpdateCaseInput).not.toHaveBeenCalled();
  });

  it('does not flush on unmount when nothing is pending', () => {
    const { unmount } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1' as string | null, input: baseInput } },
    );

    vi.advanceTimersByTime(2000);
    unmount();
    vi.advanceTimersByTime(2000);

    expect(mockUpdateCaseInput).not.toHaveBeenCalled();
  });

  it('flushes the latest value, not the value that started the debounce', () => {
    const valueA = { ...baseInput, net_distributable_estate: { centavos: 1111111 } };
    const valueB = { ...baseInput, net_distributable_estate: { centavos: 2222222 } };

    const { rerender, unmount } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1' as string | null, input: baseInput } },
    );

    rerender({ caseId: 'case-1', input: valueA });
    vi.advanceTimersByTime(500);
    rerender({ caseId: 'case-1', input: valueB });
    vi.advanceTimersByTime(500);
    unmount();

    expect(mockUpdateCaseInput).toHaveBeenCalledTimes(1);
    expect(mockUpdateCaseInput).toHaveBeenCalledWith('case-1', valueB);
  });

  it('flushes against the previous case when caseId changes mid-debounce', () => {
    const caseOneInput = { ...baseInput, net_distributable_estate: { centavos: 3333333 } };
    const caseTwoInput = { ...baseInput, net_distributable_estate: { centavos: 4444444 } };

    const { rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1' as string | null, input: baseInput } },
    );

    rerender({ caseId: 'case-1', input: caseOneInput });
    vi.advanceTimersByTime(500);
    rerender({ caseId: 'case-2', input: caseTwoInput });

    expect(mockUpdateCaseInput.mock.calls[0]).toEqual(['case-1', caseOneInput]);
  });

  it('reports error and never reports saved when the save rejects', async () => {
    mockUpdateCaseInput.mockRejectedValue(new Error('Network error'));

    const edited = { ...baseInput, net_distributable_estate: { centavos: 6666666 } };
    const { result, rerender } = renderHook(
      ({ caseId, input }) => useAutoSave(caseId, input),
      { initialProps: { caseId: 'case-1' as string | null, input: baseInput } },
    );

    rerender({ caseId: 'case-1', input: edited });

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.status).not.toBe('saved');
  });
});
