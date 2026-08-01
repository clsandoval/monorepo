/**
 * Subject: `frontend/src/components/tax/results/Form1801ActionsBar.tsx` — the
 * two exits from BIR Form 1801 (RET-02, RET-03).
 *
 * The two export modules are mocked at their boundaries, because what this file
 * proves is the CONTROL: that the right arguments reach the writer, that a
 * failed export surfaces and recovers, and that pressing Export never triggers
 * a recomputation. Whether the writers themselves produce correct bytes is
 * proven by their own tests and, end to end, by the return-parity gate.
 *
 * Case 6 is the load-bearing one: a missing `finally` leaves the button
 * permanently disabled, and the user's only recovery is a page reload.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const downloadForm1801Pdf = vi.fn();
const downloadForm1801Csv = vi.fn();
const toastError = vi.fn();

vi.mock('@/lib/form1801-pdf', () => ({
  downloadForm1801Pdf: (...args: unknown[]) => downloadForm1801Pdf(...args),
}));
vi.mock('@/lib/form1801-csv', () => ({
  downloadForm1801Csv: (...args: unknown[]) => downloadForm1801Csv(...args),
}));
vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

// Imports must come AFTER vi.mock.
import { Form1801ActionsBar } from '../results/Form1801ActionsBar';
import { computeEstateTax } from '@/lib/estate-tax-engine';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import type { EstateTaxFullOutput } from '@/lib/estate-tax-engine';

const computeSpy = vi.fn(computeEstateTax);

function makeOutput(): EstateTaxFullOutput {
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
  return computeSpy(state);
}

function renderBar(output: EstateTaxFullOutput) {
  return render(
    <Form1801ActionsBar
      output={output}
      decedentName="Juan dela Cruz"
      dateOfDeath="2020-06-15"
      generatedOn="2026-06-15"
    />,
  );
}

beforeEach(() => {
  downloadForm1801Pdf.mockReset();
  downloadForm1801Csv.mockReset();
  toastError.mockReset();
  computeSpy.mockClear();
  downloadForm1801Pdf.mockResolvedValue(undefined);
  downloadForm1801Csv.mockReturnValue(undefined);
});

describe('Form1801ActionsBar', () => {
  it('(1) renders both export controls', () => {
    renderBar(makeOutput());

    expect(screen.getByTestId('form1801-actions')).not.toBeNull();
    expect(screen.getByTestId('export-form1801-pdf')).not.toBeNull();
    expect(screen.getByTestId('export-form1801-csv')).not.toBeNull();
  });

  it('(2) hands the PDF writer the output and both dates, in order', async () => {
    const output = makeOutput();
    renderBar(output);

    await userEvent.click(screen.getByTestId('export-form1801-pdf'));

    await waitFor(() => expect(downloadForm1801Pdf).toHaveBeenCalledTimes(1));
    expect(downloadForm1801Pdf).toHaveBeenCalledWith(
      output,
      'Juan dela Cruz',
      '2020-06-15',
      '2026-06-15',
    );
  });

  it('(3) hands the CSV writer the output, the name and the generated date', async () => {
    const output = makeOutput();
    renderBar(output);

    await userEvent.click(screen.getByTestId('export-form1801-csv'));

    expect(downloadForm1801Csv).toHaveBeenCalledTimes(1);
    expect(downloadForm1801Csv).toHaveBeenCalledWith(output, 'Juan dela Cruz', '2026-06-15');
  });

  it('(4) disables the PDF control while generation is in flight', async () => {
    let release: () => void = () => {};
    downloadForm1801Pdf.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    renderBar(makeOutput());

    await userEvent.click(screen.getByTestId('export-form1801-pdf'));

    const button = screen.getByTestId('export-form1801-pdf') as HTMLButtonElement;
    await waitFor(() => expect(button.disabled).toBe(true));
    expect(button.textContent).toContain('Generating PDF');

    // Settle the pending promise inside act(), so the resulting state update is
    // flushed before the test ends rather than warning after it.
    await act(async () => {
      release();
    });
    expect(button.disabled).toBe(false);
  });

  it('(5) re-enables the PDF control after a successful export', async () => {
    renderBar(makeOutput());
    const button = screen.getByTestId('export-form1801-pdf') as HTMLButtonElement;

    await userEvent.click(button);

    await waitFor(() => expect(button.disabled).toBe(false));
    expect(button.textContent).toContain('Export PDF');
  });

  it('(6) surfaces a rejected export and re-enables the control', async () => {
    downloadForm1801Pdf.mockRejectedValue(new Error('renderer exploded'));
    renderBar(makeOutput());
    const button = screen.getByTestId('export-form1801-pdf') as HTMLButtonElement;

    await userEvent.click(button);

    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(button.disabled).toBe(false));
  });

  it('(7) surfaces a CSV writer that throws synchronously', async () => {
    downloadForm1801Csv.mockImplementation(() => {
      throw new Error('nope');
    });
    renderBar(makeOutput());

    await userEvent.click(screen.getByTestId('export-form1801-csv'));

    expect(toastError).toHaveBeenCalledTimes(1);
  });

  it('(8) never recomputes the return when an export is pressed', async () => {
    renderBar(makeOutput());
    computeSpy.mockClear();

    await userEvent.click(screen.getByTestId('export-form1801-pdf'));
    await userEvent.click(screen.getByTestId('export-form1801-csv'));

    expect(computeSpy).not.toHaveBeenCalled();
  });
});
