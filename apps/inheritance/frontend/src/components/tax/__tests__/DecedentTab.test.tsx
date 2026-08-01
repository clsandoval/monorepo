/**
 * Subject: `frontend/src/components/tax/tabs/DecedentTab.tsx` — the estate-tax
 * Decedent tab after it stopped being a date-of-death writer (FACT-01).
 *
 * The hazard these cases guard is a field that *looks* editable and is not, or
 * the inverse: a lawyer who believes they corrected the date while the value
 * silently reverts on the next load. Either produces a Form 1801 keyed on a
 * date the lawyer did not intend.
 *
 * Case 4 is the load-bearing one. It asserts the `onChange` spy was never
 * called, not merely that the value did not change: a value that fails to
 * update is a symptom, an `onChange` that never fires is the guarantee. Case 6
 * proves the read-only treatment is scoped to the date rather than applied to
 * the whole tab.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DecedentTab } from '../tabs/DecedentTab';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import type { DecedentDetails } from '@/types/estate-tax';

function renderTab(overrides?: Partial<DecedentDetails>) {
  const data: DecedentDetails = { ...createDefaultEstateTaxState().decedent, ...overrides };
  const onChange = vi.fn();
  return { ...render(<DecedentTab data={data} onChange={onChange} />), onChange };
}

describe('DecedentTab — date of death is read, not written', () => {
  it('(1) renders the date of death passed in data.dateOfDeath', () => {
    renderTab({ dateOfDeath: '2019-04-02' });
    const dod = screen.getByTestId('decedent-dod') as HTMLInputElement;
    expect(dod.value).toBe('2019-04-02');
  });

  it('(2) the control carries the readOnly DOM property', () => {
    renderTab({ dateOfDeath: '2019-04-02' });
    const dod = screen.getByTestId('decedent-dod') as HTMLInputElement;
    expect(dod.readOnly).toBe(true);
  });

  it('(3) the control carries aria-readonly="true"', () => {
    renderTab({ dateOfDeath: '2019-04-02' });
    const dod = screen.getByTestId('decedent-dod');
    expect(dod.getAttribute('aria-readonly')).toBe('true');
  });

  it('(4) typing into the control never calls onChange', async () => {
    const user = userEvent.setup();
    const { onChange } = renderTab({ dateOfDeath: '2019-04-02' });
    const dod = screen.getByTestId('decedent-dod');

    await user.type(dod, '2021-01-01');

    expect(onChange).toHaveBeenCalledTimes(0);
  });

  it('(5) a source note names the succession wizard Decedent step', () => {
    renderTab({ dateOfDeath: '2019-04-02' });
    const note = screen.getByTestId('decedent-dod-source');
    expect(note.textContent).toContain('Decedent step of the succession wizard');
  });

  it('(6) the Full Name control is still a writer', async () => {
    const user = userEvent.setup();
    const { onChange } = renderTab({ dateOfDeath: '2019-04-02' });

    await user.type(screen.getByTestId('decedent-name'), 'C');

    expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
