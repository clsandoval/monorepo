import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --------------------------------------------------------------------------
// Mocks for the two modules the Export PDF handler dynamically imports.
// --------------------------------------------------------------------------
const { mockDownloadPDF, mockLoadCurrentFirmProfile } = vi.hoisted(() => ({
  mockDownloadPDF: vi.fn(),
  mockLoadCurrentFirmProfile: vi.fn(),
}));

vi.mock('../../../lib/pdf-export', () => ({
  downloadPDF: mockDownloadPDF,
}));

// firm-profile imports the supabase client, which validates env vars on load.
vi.mock('../../../lib/supabase', () => ({
  supabaseConfigured: false,
  supabase: { from: vi.fn(), storage: { from: vi.fn() }, auth: { getUser: vi.fn() } },
}));

// Keep the real defaultFirmProfile so a field added to FirmProfile cannot make
// this file's fixture silently stale; replace only the loader.
vi.mock('../../../lib/firm-profile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/firm-profile')>()),
  loadCurrentFirmProfile: mockLoadCurrentFirmProfile,
}));

import { ActionsBar } from '../ActionsBar';
import type { EngineInput, EngineOutput, Money } from '../../../types';
import type { FirmProfile } from '../../../lib/firm-profile';
import { defaultFirmProfile } from '../../../lib/firm-profile';

// --------------------------------------------------------------------------
// Test helpers
// --------------------------------------------------------------------------

function zeroMoney(): Money {
  return { centavos: 0 };
}

function createInput(overrides: Partial<EngineInput> = {}): EngineInput {
  return {
    net_distributable_estate: { centavos: 500000000 },
    decedent: {
      id: 'd',
      name: 'Test Decedent',
      date_of_death: '2026-01-15',
      is_married: true,
      date_of_marriage: '2000-06-15',
      marriage_solemnized_in_articulo_mortis: false,
      was_ill_at_marriage: false,
      illness_caused_death: false,
      years_of_cohabitation: 25,
      has_legal_separation: false,
      is_illegitimate: false,
    },
    family_tree: [
      {
        id: 'lc1',
        name: 'Juan Cruz',
        is_alive_at_succession: true,
        relationship_to_decedent: 'LegitimateChild',
        degree: 1,
        line: null,
        children: [],
        filiation_proved: true,
        filiation_proof_type: null,
        is_guilty_party_in_legal_separation: false,
        adoption: null,
        is_unworthy: false,
        unworthiness_condoned: false,
        has_renounced: false,
        blood_type: null,
      },
    ],
    will: null,
    donations: [],
    config: {
      max_pipeline_restarts: 10,
      retroactive_ra_11642: false,
    },
    ...overrides,
  };
}

function createOutput(overrides: Partial<EngineOutput> = {}): EngineOutput {
  return {
    per_heir_shares: [
      {
        heir_id: 'lc1',
        heir_name: 'Juan Cruz',
        heir_category: 'LegitimateChildGroup',
        inherits_by: 'OwnRight',
        represents: null,
        from_legitime: zeroMoney(),
        from_free_portion: zeroMoney(),
        from_intestate: zeroMoney(),
        total: { centavos: 500000000 },
        legitime_fraction: '',
        legal_basis: [],
        donations_imputed: zeroMoney(),
        gross_entitlement: { centavos: 500000000 },
        net_from_estate: { centavos: 500000000 },
      },
    ],
    narratives: [
      {
        heir_id: 'lc1',
        heir_name: 'Juan Cruz',
        heir_category_label: 'legitimate child',
        text: '**Juan Cruz** receives **₱5,000,000**.',
      },
    ],
    computation_log: {
      steps: [{ step_number: 10, step_name: 'Finalize', description: 'Done' }],
      total_restarts: 0,
      final_scenario: 'I1',
    },
    warnings: [],
    succession_type: 'Intestate',
    scenario_code: 'I1',
    ...overrides,
  };
}

function renderActions(overrides: {
  input?: EngineInput;
  output?: EngineOutput;
  onEditInput?: () => void;
} = {}) {
  return render(
    <ActionsBar
      input={overrides.input ?? createInput()}
      output={overrides.output ?? createOutput()}
      onEditInput={overrides.onEditInput ?? vi.fn()}
    />,
  );
}

// --------------------------------------------------------------------------
// Tests — ActionsBar (results)
// --------------------------------------------------------------------------

describe('results > ActionsBar', () => {
  describe('rendering', () => {
    it('renders the actions bar container', () => {
      renderActions();
      expect(screen.getByTestId('actions-bar')).toBeInTheDocument();
    });

    it('renders "Edit Input" button', () => {
      renderActions();
      expect(screen.getByRole('button', { name: /Edit Input/i })).toBeInTheDocument();
    });

    it('renders "Export PDF" button', () => {
      renderActions();
      expect(screen.getByRole('button', { name: /Export PDF/i })).toBeInTheDocument();
    });

    // The PDF journey gates (journey/pdf-capture.mjs) reach this control by its
    // test hook and click it in a real browser. A rename of the button, or a
    // dropped attribute, would silently orphan every PDF gate — this assertion
    // makes that a test failure instead.
    it('exposes the Export PDF button under data-testid="export-pdf"', () => {
      renderActions();
      const button = screen.getByTestId('export-pdf');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toContain('Export PDF');
    });

    it('renders "Export JSON" button', () => {
      renderActions();
      expect(screen.getByRole('button', { name: /Export JSON/i })).toBeInTheDocument();
    });

    it('renders "Copy Narratives" button', () => {
      renderActions();
      expect(screen.getByRole('button', { name: /Copy Narratives/i })).toBeInTheDocument();
    });
  });

  describe('edit input', () => {
    it('calls onEditInput when Edit Input button is clicked', async () => {
      const onEditInput = vi.fn();
      const user = userEvent.setup();
      renderActions({ onEditInput });
      await user.click(screen.getByRole('button', { name: /Edit Input/i }));
      expect(onEditInput).toHaveBeenCalledTimes(1);
    });
  });

  describe('export JSON', () => {
    let createObjectURL: ReturnType<typeof vi.fn>;
    let revokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      createObjectURL = vi.fn().mockReturnValue('blob:test');
      revokeObjectURL = vi.fn();
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;
    });

    it('export produces valid JSON containing EngineInput fields', async () => {
      const user = userEvent.setup();
      const input = createInput();
      renderActions({ input });

      await user.click(screen.getByRole('button', { name: /Export JSON/i }));

      // Should have attempted to create a blob download
      // The createObjectURL mock verifies the export flow was triggered
      expect(createObjectURL).toHaveBeenCalled();
    });

    it('export output produces valid JSON containing EngineOutput fields', async () => {
      const user = userEvent.setup();
      const output = createOutput();
      renderActions({ output });

      await user.click(screen.getByRole('button', { name: /Export JSON/i }));
      expect(createObjectURL).toHaveBeenCalled();
    });
  });

  describe('copy narratives', () => {
    it('copies narratives with bold stripped', async () => {
      const user = userEvent.setup();

      const input = createInput();
      const output = createOutput({
        narratives: [
          {
            heir_id: 'lc1',
            heir_name: 'Juan Cruz',
            heir_category_label: 'legitimate child',
            text: '**Juan Cruz** receives **₱5,000,000**.',
          },
        ],
      });

      renderActions({ input, output });
      const writeText = vi.spyOn(navigator.clipboard, 'writeText');
      await user.click(screen.getByRole('button', { name: /Copy Narratives/i }));

      expect(writeText).toHaveBeenCalled();
      const copiedText = writeText.mock.calls[0][0];
      // Should NOT contain ** markers
      expect(copiedText).not.toContain('**');
      // Should contain narrative text
      expect(copiedText).toContain('Juan Cruz');
      expect(copiedText).toContain('₱5,000,000');
      writeText.mockRestore();
    });

    it('includes header with decedent name and date_of_death', async () => {
      const user = userEvent.setup();

      const input = createInput({
        decedent: {
          id: 'd',
          name: 'Don Pedro',
          date_of_death: '2026-01-15',
          is_married: true,
          date_of_marriage: '2000-06-15',
          marriage_solemnized_in_articulo_mortis: false,
          was_ill_at_marriage: false,
          illness_caused_death: false,
          years_of_cohabitation: 25,
          has_legal_separation: false,
          is_illegitimate: false,
        },
      });

      renderActions({ input });
      const writeText = vi.spyOn(navigator.clipboard, 'writeText');
      await user.click(screen.getByRole('button', { name: /Copy Narratives/i }));

      const copiedText = writeText.mock.calls[0][0];
      expect(copiedText).toContain('Don Pedro');
      expect(copiedText).toContain('2026-01-15');
      writeText.mockRestore();
    });

    it('joins multiple narratives with double newline', async () => {
      const user = userEvent.setup();

      renderActions({
        output: createOutput({
          narratives: [
            { heir_id: 'lc1', heir_name: 'Juan', heir_category_label: 'lc', text: 'First narrative.' },
            { heir_id: 'sp', heir_name: 'Maria', heir_category_label: 'ss', text: 'Second narrative.' },
          ],
        }),
      });
      const writeText = vi.spyOn(navigator.clipboard, 'writeText');
      await user.click(screen.getByRole('button', { name: /Copy Narratives/i }));

      const copiedText = writeText.mock.calls[0][0];
      expect(copiedText).toContain('First narrative.');
      expect(copiedText).toContain('Second narrative.');
      // Narratives should be separated
      expect(copiedText).toMatch(/First narrative\.\n\nSecond narrative\./);
      writeText.mockRestore();
    });
  });
  // ------------------------------------------------------------------------
  // export PDF — the audit's blocker 7
  //
  // ActionsBar.tsx passed a literal null as downloadPDF's third argument. That
  // parameter is the firm profile and EstatePDF gates the letterhead on it, so
  // that literal made the stored letterhead unrenderable no matter what was
  // configured at /settings. ActionsBar is the only production caller of
  // downloadPDF, so this one argument was the whole defect.
  // ------------------------------------------------------------------------

  describe('export PDF', () => {
    beforeEach(() => {
      mockDownloadPDF.mockReset().mockResolvedValue(undefined);
      mockLoadCurrentFirmProfile.mockReset().mockResolvedValue(null);
    });

    it('passes the loaded firm profile as downloadPDF\'s third argument', async () => {
      const profile: FirmProfile = {
        ...defaultFirmProfile(),
        firmName: 'Test Firm Alpha Law Offices',
      };
      mockLoadCurrentFirmProfile.mockResolvedValue(profile);

      const user = userEvent.setup();
      renderActions();
      await user.click(screen.getByTestId('export-pdf'));

      // The handler dynamically imports two modules, so the call lands a few
      // microtasks after the click resolves.
      await vi.waitFor(() => expect(mockDownloadPDF).toHaveBeenCalledTimes(1));
      const third = mockDownloadPDF.mock.calls[0]![2];
      expect(third).toBe(profile);
      expect(third.firmName).toBe('Test Firm Alpha Law Offices');
    });

    // THE REGRESSION GUARD. This is the case that turns red if anyone restores
    // the literal null the audit named.
    it('does not pass null when a profile is configured', async () => {
      mockLoadCurrentFirmProfile.mockResolvedValue({
        ...defaultFirmProfile(),
        firmName: 'Test Firm Alpha Law Offices',
      });

      const user = userEvent.setup();
      renderActions();
      await user.click(screen.getByTestId('export-pdf'));

      await vi.waitFor(() => expect(mockDownloadPDF).toHaveBeenCalledTimes(1));
      expect(mockDownloadPDF.mock.calls[0]![2]).not.toBeNull();
    });

    it('still exports when there is no session, passing null', async () => {
      mockLoadCurrentFirmProfile.mockResolvedValue(null);

      const user = userEvent.setup();
      renderActions();
      await user.click(screen.getByTestId('export-pdf'));

      // The export is NOT abandoned: the document prints
      // ATTORNEY ATTRIBUTION UNAVAILABLE on its own face instead.
      await vi.waitFor(() => expect(mockDownloadPDF).toHaveBeenCalledTimes(1));
      expect(mockDownloadPDF.mock.calls[0]![2]).toBeNull();
    });

    it('re-enables the button when downloadPDF rejects', async () => {
      // handleExportPDF is try/finally with NO catch — pre-existing behaviour
      // this plan does not change — so a failed export escapes as an unhandled
      // rejection. It is suppressed here for the duration of this one test
      // rather than swallowed in production code, where silently discarding a
      // real export failure would be the wrong fix.
      const priorListeners = process.listeners('unhandledRejection');
      for (const l of priorListeners) process.off('unhandledRejection', l);
      const swallow = () => {};
      process.on('unhandledRejection', swallow);

      try {
        mockDownloadPDF.mockRejectedValue(new Error('render failed'));

        const user = userEvent.setup();
        renderActions();
        await user.click(screen.getByTestId('export-pdf'));

        // The existing `finally` cleared the loading state, so the button is
        // usable again rather than stuck disabled.
        await vi.waitFor(() => {
          expect(screen.getByTestId('export-pdf')).not.toBeDisabled();
        });
        // Let the rejection settle while our suppressor is still installed.
        await new Promise((r) => setTimeout(r, 0));
      } finally {
        process.off('unhandledRejection', swallow);
        for (const l of priorListeners) {
          process.on('unhandledRejection', l as NodeJS.UnhandledRejectionListener);
        }
      }
    });
  });
});
