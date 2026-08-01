/**
 * Subject: `frontend/src/components/pdf/Form1801PDF.tsx` — the printable exit
 * from BIR Form 1801 (RET-02, RET-04).
 *
 * `@react-pdf/renderer` is mocked so the primitives render as HTML in jsdom,
 * which proves COMPOSITION only. It cannot prove what the real encoder writes:
 * the mocked renderer would happily show a correct `₱5,000,000` while the real
 * document writes a byte that overprints the `5`. That second property is
 * `21-07`'s job, against real bytes through real poppler. Case 3 here is the
 * cheap half of the same defence — the peso sign must never reach the encoder.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock @react-pdf/renderer — render PDF primitives as HTML elements
// ---------------------------------------------------------------------------
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children, ...props }: any) => (
    <div data-testid="pdf-document" {...props}>{children}</div>
  ),
  Page: ({ children, size, ...props }: any) => (
    <div data-testid="pdf-page" data-size={size} {...props}>{children}</div>
  ),
  View: ({ children, style, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, style, ...props }: any) => <span {...props}>{children}</span>,
  Image: ({ src, ...props }: any) => <img data-testid="pdf-image" src={src} {...props} />,
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
  },
}));

// Imports must come AFTER vi.mock.
import { Form1801PDF } from '../Form1801PDF';
import { buildForm1801PdfFilename } from '../../../lib/form1801-pdf';
import { computeEstateTax, FORM1801_LINE_IDS } from '../../../lib/estate-tax-engine';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import type { EstateTaxFullOutput } from '../../../lib/estate-tax-engine';

function makeOutput(dateOfDeath: string, preTrainExpenses = false): EstateTaxFullOutput {
  const state = createDefaultEstateTaxState();
  state.decedent.name = 'Test Decedent';
  state.decedent.dateOfDeath = dateOfDeath;
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
  if (preTrainExpenses) {
    state.ordinaryDeductions.funeralExpenses = 100_000;
    state.ordinaryDeductions.judicialAdminExpenses = 50_000;
  }
  return computeEstateTax(state);
}

const trainOutput = () => makeOutput('2020-06-15');
const preTrainOutput = () => makeOutput('2015-06-15', true);

function renderDoc(output: EstateTaxFullOutput, generatedOn = '2026-06-15') {
  return render(
    <Form1801PDF
      output={output}
      decedentName="Test Decedent"
      dateOfDeath="2020-06-15"
      generatedOn={generatedOn}
    />,
  );
}

describe('Form1801PDF', () => {
  it('(1) renders one authority line per declared line id', () => {
    renderDoc(trainOutput());
    const text = screen.getByTestId('pdf-document').textContent ?? '';
    const occurrences = text.split('Authority:').length - 1;

    expect(occurrences).toBe(FORM1801_LINE_IDS.length);
  });

  it('(2) prints the standard deduction with the PDF-safe currency token', () => {
    renderDoc(trainOutput());
    expect(screen.getByTestId('pdf-document').textContent).toContain('PHP 5,000,000');
  });

  it('(3) contains no peso sign anywhere in the document', () => {
    renderDoc(trainOutput());
    expect(screen.getByTestId('pdf-document').textContent).not.toContain('₱');
  });

  it('(4) carries the standard deduction authority into the document', () => {
    renderDoc(trainOutput());
    expect(screen.getByTestId('pdf-document').textContent).toContain('NIRC Sec. 86(A)(4)');
  });

  it('(5) prints an Authority label for every row', () => {
    renderDoc(trainOutput());
    const text = screen.getByTestId('pdf-document').textContent ?? '';

    expect(text.split('Authority:').length - 1).toBe(FORM1801_LINE_IDS.length);
  });

  it('(6) prints the declined penalty words and never a formatted zero for them', () => {
    renderDoc(trainOutput());
    const text = screen.getByTestId('pdf-document').textContent ?? '';

    expect(text).toContain('NOT COMPUTED');
    expect(text).toContain('OUTSIDE ENGINE COMPETENCE');
    expect(text).toContain('NOT A TOTAL');
    // The declined rows print words; the only 0.00 that could appear would come
    // from routing a null through the formatter.
    expect(text).not.toContain('PHP 0.00');
  });

  it('(7) prints the generatedOn it was given, and reads no clock', () => {
    const { unmount } = renderDoc(trainOutput(), '2026-06-15');
    const first = screen.getByTestId('pdf-document').textContent ?? '';
    expect(first).toContain('2026-06-15');
    unmount();

    renderDoc(trainOutput(), '2027-01-31');
    const second = screen.getByTestId('pdf-document').textContent ?? '';

    expect(second).toContain('2027-01-31');
    expect(second).not.toBe(first);
  });

  it('(8) prints the manual-review block naming both schedules on pre-TRAIN facts', () => {
    renderDoc(preTrainOutput());
    const text = screen.getByTestId('pdf-document').textContent ?? '';

    expect(text).toContain('MANUAL REVIEW');
    expect(text).toContain('Schedule 5');
    expect(text).toContain('Schedule 6');
  });

  it('(9) builds a slugged, dated filename', () => {
    expect(buildForm1801PdfFilename('Juan dela Cruz', '2026-06-15')).toBe(
      'form1801-juan-dela-cruz-2026-06-15.pdf',
    );
  });
});
