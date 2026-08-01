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
import { computeEstateTax } from '@/lib/estate-tax-engine';
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
    const row = screen.getByTestId('form-line-S-248');
    expect(row.textContent).toContain('NIRC Sec. 248');
    expect(row.textContent).toContain('NOT COMPUTED');
  });

  it('(2) prints the interest row carrying the section from the engine', () => {
    render(<Form1801View output={computeLateOutput()} />);
    const row = screen.getByTestId('form-line-I-249');
    expect(row.textContent).toContain('NIRC Sec. 249');
    expect(row.textContent).toContain('NOT COMPUTED');
  });

  it('(3) declares the compromise penalty outside the engine competence', () => {
    render(<Form1801View output={computeLateOutput()} />);
    expect(screen.getByTestId('form-line-CP').textContent).toContain('OUTSIDE ENGINE COMPETENCE');
  });

  it('(4) refuses the total in words rather than printing a figure', () => {
    render(<Form1801View output={computeLateOutput()} />);
    expect(screen.getByTestId('form-line-Total').textContent).toContain('NOT A TOTAL');
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
    const combined = ['S-248', 'I-249', 'CP', 'Total']
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
    const total = screen.getByTestId('form-line-Total').textContent ?? '';
    expect(total).not.toContain('NOT A TOTAL');
    expect(total).toContain(((base.tax_due + 600) / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }));
    expect(screen.getByTestId('form-line-S-248').textContent).toContain('1.00');
  });
});
