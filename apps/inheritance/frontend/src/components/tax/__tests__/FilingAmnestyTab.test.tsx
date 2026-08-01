/**
 * Subject: `frontend/src/components/tax/tabs/FilingAmnestyTab.tsx` — the
 * assumed-filing-date field added in Phase 20 (PEN-01).
 *
 * The hazard these cases guard is a *silent default*. Until Phase 20 the
 * engine took the filing date from the wall clock, so the same fact set
 * computed differently on a different day and no screen said so. The fix is a
 * field that starts empty and a note explaining why. Case 4 is the load-bearing
 * one: it asserts the rendered value is the empty string when the incoming prop
 * is empty, which is the assertion that goes red the moment anyone reintroduces
 * a today default.
 *
 * Case 3 asserts the update *spreads* rather than replaces, by checking that
 * `userElectsAmnesty` survives the change. A replacing update would silently
 * reset every amnesty flag on the tab.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilingAmnestyTab } from '../tabs/FilingAmnestyTab';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import type { FilingData } from '@/types/estate-tax';

function renderTab(overrides?: Partial<FilingData>) {
  const data: FilingData = { ...createDefaultEstateTaxState().filing, ...overrides };
  const onChange = vi.fn();
  return { ...render(<FilingAmnestyTab data={data} onChange={onChange} />), onChange, data };
}

describe('FilingAmnestyTab — the assumed filing date', () => {
  it('(1) renders the assumed-filing-date input empty on the default state', () => {
    renderTab();
    const input = screen.getByTestId('assumed-filing-date') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.type).toBe('date');
  });

  it('(2) prints a source note explaining why the field starts blank', () => {
    renderTab();
    const note = screen.getByTestId('assumed-filing-date-note');
    expect(note.textContent).toContain('reproducible');
    expect(note.textContent).toContain('undetermined');
  });

  it('(3) spreads the change rather than replacing the filing object', () => {
    const { onChange } = renderTab({ userElectsAmnesty: false });
    fireEvent.change(screen.getByTestId('assumed-filing-date'), {
      target: { value: '2025-06-15' },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0]?.[0] as FilingData;
    expect(next.assumedFilingDate).toBe('2025-06-15');
    expect(next.userElectsAmnesty).toBe(false);
    expect(next.amnestyDeductionMode).toBe('standard');
  });

  it('(4) never renders a non-empty date when the incoming prop is empty', () => {
    renderTab({ assumedFilingDate: '' });
    const input = screen.getByTestId('assumed-filing-date') as HTMLInputElement;
    expect(input.getAttribute('value')).toBe('');
    expect(input.value).toBe('');
  });

  it('(5) renders an entered date back to the lawyer', () => {
    renderTab({ assumedFilingDate: '2025-06-15' });
    const input = screen.getByTestId('assumed-filing-date') as HTMLInputElement;
    expect(input.value).toBe('2025-06-15');
  });
});
