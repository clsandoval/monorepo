/**
 * Subject: `frontend/src/components/tax/FactSetConflictBanner.tsx` — the
 * on-screen refusal when a case does not have one fact set (FACT-04).
 *
 * Cases 6 and 7 are the load-bearing ones. They assert on the literal strings
 * `2019-04-02` and `2021-11-30`, not on the presence of an alert element: a
 * refusal that announces a conflict without naming the two values it found
 * leaves the lawyer hunting for a discrepancy the product already located,
 * which is not what FACT-04 asks for.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FactSetConflictBanner } from '../FactSetConflictBanner';
import { FACT_SET_MISSING_DATE_MESSAGE, factSetConflictMessage } from '@/lib/fact-set';
import type { FactSetVerdict } from '@/lib/fact-set';

const DISAGREEMENT: FactSetVerdict = {
  kind: 'disagreement',
  succession: '2019-04-02',
  tax: '2021-11-30',
  message: factSetConflictMessage('2019-04-02', '2021-11-30'),
};

describe('FactSetConflictBanner', () => {
  it('(1) renders nothing for a null verdict', () => {
    const { container } = render(<FactSetConflictBanner verdict={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('(2) renders nothing for an ok verdict', () => {
    const { container } = render(
      <FactSetConflictBanner
        verdict={{ kind: 'ok', factSet: { decedentName: 'Probe', dateOfDeath: '2020-02-02' } }}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('(3) renders the missing-date alert', () => {
    render(
      <FactSetConflictBanner
        verdict={{ kind: 'missing-date', message: FACT_SET_MISSING_DATE_MESSAGE }}
      />,
    );
    expect(screen.getByTestId('fact-set-missing-date')).toBeInTheDocument();
  });

  it('(4) the missing-date alert names the succession wizard Decedent step', () => {
    render(
      <FactSetConflictBanner
        verdict={{ kind: 'missing-date', message: FACT_SET_MISSING_DATE_MESSAGE }}
      />,
    );
    expect(screen.getByTestId('fact-set-missing-date').textContent).toContain(
      'Decedent step of the succession wizard',
    );
  });

  it('(5) renders the conflict alert for a disagreement verdict', () => {
    render(<FactSetConflictBanner verdict={DISAGREEMENT} />);
    expect(screen.getByTestId('fact-set-conflict')).toBeInTheDocument();
  });

  it('(6) the conflict alert prints both dates under their own testids', () => {
    render(<FactSetConflictBanner verdict={DISAGREEMENT} />);
    expect(screen.getByTestId('fact-set-succession-date').textContent).toBe('2019-04-02');
    expect(screen.getByTestId('fact-set-tax-date').textContent).toBe('2021-11-30');
  });

  it('(7) the conflict alert renders the message, which contains both date literals', () => {
    render(<FactSetConflictBanner verdict={DISAGREEMENT} />);
    const text = screen.getByTestId('fact-set-conflict').textContent ?? '';
    expect(text).toContain(factSetConflictMessage('2019-04-02', '2021-11-30'));
    expect(text).toContain('2019-04-02');
    expect(text).toContain('2021-11-30');
  });
});
