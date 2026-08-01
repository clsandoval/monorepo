/**
 * Subject: `frontend/src/components/tax/results/Form1801View.tsx` — the four
 * penalty rows and the refusal note added in Phase 20 (PEN-04, PEN-05).
 *
 * The `output` prop is built by calling the REAL `computeEstateTax`, never by
 * hand-writing an `EstateTaxFullOutput` literal. A hand-written fixture would
 * let this component keep passing against a shape the engine no longer
 * produces, which is precisely the drift this project's gates exist to catch.
 *
 * Case 7 is the load-bearing one. `formatPesos(0)` in this component returns
 * exactly `0.00`, so routing a declined line through the peso formatter would
 * print the very number Phase 20 removed — on the document a lawyer signs. The
 * case asserts that string is ABSENT from the four penalty rows, rather than
 * only asserting that the words are present.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Form1801View } from '../results/Form1801View';
import { computeEstateTax, buildForm1801Lines, FORM1801_LINE_IDS } from '@/lib/estate-tax-engine';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import type { EstateTaxFullOutput } from '@/lib/estate-tax-engine';

function computeLateOutput(): EstateTaxFullOutput {
  const state = createDefaultEstateTaxState();
  state.decedent.name = 'Test Decedent';
  state.decedent.dateOfDeath = '2020-06-15';
  state.filing.assumedFilingDate = '2025-06-15';
  state.realProperties = [
    {
      id: 'rp1',
      titleNumber: 'T-001',
      taxDecNumber: 'TD-001',
      location: 'Manila',
      lotArea: 100,
      improvementArea: null,
      classification: 'residential',
      fmvTaxDec: 15_000_000,
      fmvBirZonal: 10_000_000,
      ownership: 'exclusive',
      isFamilyHome: false,
      hasBarangayCert: false,
    },
  ];
  return computeEstateTax(state);
}

describe('Form1801View — the penalty block', () => {
  it('(1) prints the surcharge row carrying the section from the engine', () => {
    render(<Form1801View output={computeLateOutput()} />);
    const row = screen.getByTestId('form-line-penalty-surcharge');
    expect(row.textContent).toContain('NIRC Sec. 248');
    expect(row.textContent).toContain('NOT COMPUTED');
  });

  it('(2) prints the interest row carrying the section from the engine', () => {
    render(<Form1801View output={computeLateOutput()} />);
    const row = screen.getByTestId('form-line-penalty-interest');
    expect(row.textContent).toContain('NIRC Sec. 249');
    expect(row.textContent).toContain('NOT COMPUTED');
  });

  it('(3) declares the compromise penalty outside the engine competence', () => {
    render(<Form1801View output={computeLateOutput()} />);
    expect(screen.getByTestId('form-line-penalty-compromise').textContent).toContain('OUTSIDE ENGINE COMPETENCE');
  });

  it('(4) refuses the total in words rather than printing a figure', () => {
    render(<Form1801View output={computeLateOutput()} />);
    expect(screen.getByTestId('form-line-penalty-total').textContent).toContain('NOT A TOTAL');
  });

  it('(5) prints the engine refusal naming all three recorded questions', () => {
    render(<Form1801View output={computeLateOutput()} />);
    const note = screen.getByTestId('penalty-refusal');
    expect(note.textContent).toContain('LAWYER-10');
    expect(note.textContent).toContain('LAWYER-11');
    expect(note.textContent).toContain('LAWYER-12');
  });

  it('(6) prints the statutory deadline computed from the date of death', () => {
    render(<Form1801View output={computeLateOutput()} />);
    const note = screen.getByTestId('penalty-refusal');
    expect(note.textContent).toContain('2021-06-15');
    expect(note.textContent).toContain('1461');
  });

  it('(7) never renders a formatted zero on any of the four penalty rows', () => {
    render(<Form1801View output={computeLateOutput()} />);
    const combined = ['penalty-surcharge', 'penalty-interest', 'penalty-compromise', 'penalty-total']
      .map((id) => screen.getByTestId(`form-line-${id}`).textContent ?? '')
      .join(' ');
    expect(combined).not.toContain('0.00');
  });

  it('(8) renders real figures and no note once every line is determined', () => {
    const base = computeLateOutput();
    const determined: EstateTaxFullOutput = {
      ...base,
      surcharges: 100,
      interest: 200,
      compromise_penalty: 300,
      total_amount_due: base.tax_due + 600,
      penalties: {
        ...base.penalties,
        complete: true,
        totalAmountDue: base.tax_due + 600,
        refusal: '',
        lines: [
          {
            ...base.penalties.lines[0],
            centavos: 100,
            status: 'determined',
            declinedReason: null,
            lawyerDecision: null,
          },
          {
            ...base.penalties.lines[1],
            centavos: 200,
            status: 'determined',
            declinedReason: null,
            lawyerDecision: null,
          },
          {
            ...base.penalties.lines[2],
            centavos: 300,
            status: 'determined',
            declinedReason: null,
            lawyerDecision: null,
          },
        ],
      },
    };

    render(<Form1801View output={determined} />);
    expect(screen.queryByTestId('penalty-refusal')).toBeNull();
    const total = screen.getByTestId('form-line-penalty-total').textContent ?? '';
    expect(total).not.toContain('NOT A TOTAL');
    expect(total).toContain(((base.tax_due + 600) / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }));
    expect(screen.getByTestId('form-line-penalty-surcharge').textContent).toContain('1.00');
  });
});

// ── 21-03: the screen renders the engine's line model ───────────────────────
//
// These cases are the on-screen half of RET-01. The vision audit found Item 35A
// labelled "Standard Deduction" printing 0.00 while the engine had applied
// ₱5,000,000, a row 40 labelled "Gross Estate" printing the net taxable estate
// while row 34 on the same table printed the real gross estate, and a row 44
// labelled "Total Deductions" printing the tax due. All three were consequences
// of the component building its own rows.

function computeTrainOutput(): EstateTaxFullOutput {
  const state = createDefaultEstateTaxState();
  state.decedent.name = 'Test Decedent';
  state.decedent.dateOfDeath = '2020-06-15';
  state.decedent.address = '123 Test St';
  state.executor.name = 'Test Executor';
  state.realProperties = [
    {
      id: 'rp1',
      titleNumber: 'T-123456',
      taxDecNumber: 'TD-1',
      location: 'Quezon City',
      lotArea: 250,
      improvementArea: null,
      classification: 'residential',
      fmvTaxDec: 8_000_000,
      fmvBirZonal: 9_000_000,
      ownership: 'exclusive',
      isFamilyHome: false,
      hasBarangayCert: false,
    },
  ];
  return computeEstateTax(state);
}

function computePreTrainOutput(): EstateTaxFullOutput {
  const state = createDefaultEstateTaxState();
  state.decedent.name = 'Test Decedent';
  state.decedent.dateOfDeath = '2015-06-15';
  state.decedent.address = '123 Test St';
  state.executor.name = 'Test Executor';
  state.realProperties = [
    {
      id: 'rp1',
      titleNumber: 'T-123456',
      taxDecNumber: 'TD-1',
      location: 'Quezon City',
      lotArea: 250,
      improvementArea: null,
      classification: 'residential',
      fmvTaxDec: 8_000_000,
      fmvBirZonal: 9_000_000,
      ownership: 'exclusive',
      isFamilyHome: false,
      hasBarangayCert: false,
    },
  ];
  state.ordinaryDeductions.funeralExpenses = 100_000;
  state.ordinaryDeductions.judicialAdminExpenses = 50_000;
  return computeEstateTax(state);
}

/** The Col C cell of a row, which is the fifth cell. */
function colCText(testId: string): string {
  const cells = screen.getByTestId(testId).querySelectorAll('td');
  return cells[4]?.textContent ?? '';
}

describe('Form1801View — the reconciled return (21-03)', () => {
  it('(9) shows the ₱5,000,000 standard deduction on Item 37A', () => {
    render(<Form1801View output={computeTrainOutput()} />);
    expect(colCText('form-line-sp-standard-deduction')).toBe('5,000,000.00');
  });

  it('(10) prints one gross-estate figure, not two', () => {
    render(<Form1801View output={computeTrainOutput()} />);
    expect(colCText('form-line-gross-total')).toBe('9,000,000.00');
  });

  it('(11) no row is described as Total Deductions', () => {
    render(<Form1801View output={computeTrainOutput()} />);
    for (const row of document.querySelectorAll('tbody tr[data-testid^="form-line-"]')) {
      expect(row.textContent ?? '').not.toContain('Total Deductions');
    }
  });

  it('(12) every rendered row carries an authority cell', () => {
    render(<Form1801View output={computeTrainOutput()} />);
    const rows = document.querySelectorAll('tbody tr[data-testid^="form-line-"]');
    const authorities = document.querySelectorAll('[data-testid^="form-line-authority-"]');

    expect(rows.length).toBeGreaterThan(0);
    expect(authorities.length).toBe(rows.length);
    for (const cell of authorities) {
      expect((cell.textContent ?? '').trim()).not.toBe('');
    }
  });

  it('(13) attributes the standard deduction to its governing section', () => {
    render(<Form1801View output={computeTrainOutput()} />);
    expect(screen.getByTestId('form-line-authority-sp-standard-deduction').textContent).toContain(
      'NIRC Sec. 86(A)(4)',
    );
  });

  it('(14) never prints a formatted zero on a declined line', () => {
    render(<Form1801View output={computeTrainOutput()} />);
    const { lines } = buildForm1801Lines(computeTrainOutput());
    const declined = lines.filter((l) => typeof l.displayTotal === 'string');

    expect(declined.length).toBeGreaterThan(0);
    const combined = declined.map((l) => colCText(`form-line-${l.id}`)).join(' ');
    expect(combined).not.toContain('0.00');
  });

  it('(15) shows no reconciliation warning when the return reconciles', () => {
    render(<Form1801View output={computeTrainOutput()} />);
    expect(screen.queryByTestId('form1801-warnings')).toBeNull();
  });

  it('(16) names both schedules when the same expense appears on two of them', () => {
    render(<Form1801View output={computePreTrainOutput()} />);
    const block = screen.getByTestId('form1801-warnings');
    expect(block.textContent).toContain('Schedule 5');
    expect(block.textContent).toContain('Schedule 6');
  });

  it('(17) renders every declared line id, in order', () => {
    render(<Form1801View output={computeTrainOutput()} />);
    const rendered = Array.from(
      document.querySelectorAll('tbody tr[data-testid^="form-line-"]'),
    ).map((row) => row.getAttribute('data-testid'));

    expect(rendered).toEqual(FORM1801_LINE_IDS.map((id) => `form-line-${id}`));
  });
});
