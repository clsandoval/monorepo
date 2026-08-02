import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// The parity block below renders the PDF surface alongside the screen, so the
// react-pdf primitives are mocked to plain HTML. WarningsPanel itself does not
// use them.
vi.mock('@react-pdf/renderer', () => ({
  View: ({ children, style, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, style, ...props }: any) => <span {...props}>{children}</span>,
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
  },
}));

import { WarningsPanel } from '../WarningsPanel';
import { WarningsSection } from '../../pdf/WarningsSection';
import type { ManualFlag, InheritanceShare, Money } from '../../../types';

// --------------------------------------------------------------------------
// Test helpers
// --------------------------------------------------------------------------

function zeroMoney(): Money {
  return { centavos: 0 };
}

function createFlag(overrides: Partial<ManualFlag> = {}): ManualFlag {
  return {
    category: 'preterition',
    description: 'Maria Cruz was omitted from will.',
    related_heir_id: null,
    ...overrides,
  };
}

function createShare(overrides: Partial<InheritanceShare> = {}): InheritanceShare {
  return {
    heir_id: 'lc1',
    heir_name: 'Juan Cruz',
    heir_category: 'LegitimateChildGroup',
    inherits_by: 'OwnRight',
    represents: null,
    from_legitime: zeroMoney(),
    from_free_portion: zeroMoney(),
    from_intestate: zeroMoney(),
    total: { centavos: 250000000 },
    legitime_fraction: '',
    legal_basis: [],
    donations_imputed: zeroMoney(),
    gross_entitlement: { centavos: 250000000 },
    net_from_estate: { centavos: 250000000 },
    ...overrides,
  };
}

function renderWarnings(overrides: {
  warnings?: ManualFlag[];
  shares?: InheritanceShare[];
} = {}) {
  return render(
    <WarningsPanel
      warnings={overrides.warnings ?? []}
      shares={overrides.shares ?? []}
    />,
  );
}

// --------------------------------------------------------------------------
// Tests — WarningsPanel (results)
// --------------------------------------------------------------------------

describe('results > WarningsPanel', () => {
  describe('empty state', () => {
    it('renders the warnings panel container', () => {
      renderWarnings();
      expect(screen.getByTestId('warnings-panel')).toBeInTheDocument();
    });

    it('hides content when warnings array is empty', () => {
      renderWarnings({ warnings: [] });
      expect(screen.queryByText(/Manual Review Required/i)).not.toBeInTheDocument();
    });
  });

  describe('with warnings', () => {
    it('shows "Manual Review Required" heading when warnings exist', () => {
      renderWarnings({
        warnings: [createFlag()],
      });
      expect(screen.getByText(/Manual Review Required/i)).toBeInTheDocument();
    });

    it('renders one card per warning', () => {
      renderWarnings({
        warnings: [
          createFlag({ category: 'preterition', description: 'Preterition detected' }),
          createFlag({ category: 'inofficiousness', description: 'Dispositions reduced' }),
        ],
      });
      expect(screen.getByText(/Preterition detected/i)).toBeInTheDocument();
      expect(screen.getByText(/Dispositions reduced/i)).toBeInTheDocument();
    });

    it('shows warning description text', () => {
      renderWarnings({
        warnings: [createFlag({ description: 'Maria Cruz was omitted from will.' })],
      });
      expect(screen.getByText(/Maria Cruz was omitted from will/)).toBeInTheDocument();
    });
  });

  describe('severity styling', () => {
    it('preterition warning has error severity (red)', () => {
      renderWarnings({
        warnings: [createFlag({ category: 'preterition' })],
      });
      const card = screen.getByTestId('warning-card-0');
      expect(card.className).toMatch(/red|error/);
    });

    it('inofficiousness warning has warning severity (amber)', () => {
      renderWarnings({
        warnings: [createFlag({ category: 'inofficiousness', description: 'Reduced' })],
      });
      const card = screen.getByTestId('warning-card-0');
      expect(card.className).toMatch(/amber|warning/);
    });

    it('unknown_donee has info severity (blue)', () => {
      renderWarnings({
        warnings: [createFlag({ category: 'unknown_donee', description: 'Unknown donee' })],
      });
      const card = screen.getByTestId('warning-card-0');
      expect(card.className).toMatch(/blue|info/);
    });

    it('max_restarts has error severity', () => {
      renderWarnings({
        warnings: [createFlag({ category: 'max_restarts', description: 'Pipeline failed' })],
      });
      const card = screen.getByTestId('warning-card-0');
      expect(card.className).toMatch(/red|error/);
    });
  });

  describe('related heir resolution', () => {
    it('shows related heir name when related_heir_id matches a share', () => {
      renderWarnings({
        warnings: [createFlag({ related_heir_id: 'lc1', description: 'Heir issue' })],
        shares: [createShare({ heir_id: 'lc1', heir_name: 'Juan Cruz' })],
      });
      expect(screen.getByText(/Juan Cruz/)).toBeInTheDocument();
    });
  });
  // ------------------------------------------------------------------------
  // PARITY WITH THE EXPORTED DOCUMENT
  //
  // Both surfaces render the array `@/lib/warnings-lines` builds. These cases
  // render BOTH from one input and compare field by field, so a divergence is
  // a test failure rather than a silent drift a lawyer discovers on a filed
  // document.
  // ------------------------------------------------------------------------

  describe('parity with the PDF warnings section', () => {
    const warnings: ManualFlag[] = [
      createFlag({
        category: 'preterition',
        description: 'Art. 854: compulsory heir totally omitted — all institutions annulled',
        related_heir_id: null,
      }),
      createFlag({
        category: 'RA_11642_RETROACTIVITY',
        description: 'A pre-2022 adoption decree raises the retroactivity question.',
        related_heir_id: 'ac1',
      }),
    ];
    const shares = [createShare({ heir_id: 'ac1', heir_name: 'Adopted Child' })];

    function bothSurfaces() {
      const screenText =
        render(<WarningsPanel warnings={warnings} shares={shares} />).container.textContent ?? '';
      const pdfText =
        render(<WarningsSection warnings={warnings} shares={shares} />).container.textContent ?? '';
      return { screenText, pdfText };
    }

    it('prints every warning description on both surfaces', () => {
      const { screenText, pdfText } = bothSurfaces();
      for (const w of warnings) {
        expect(screenText).toContain(w.description);
        expect(pdfText).toContain(w.description);
      }
    });

    it('prints the same severity token on both surfaces', () => {
      const { screenText, pdfText } = bothSurfaces();
      for (const severity of ['error', 'info']) {
        expect(screenText).toContain(severity);
        expect(pdfText).toContain(severity);
      }
    });

    it('names the related heir on both surfaces', () => {
      const { screenText, pdfText } = bothSurfaces();
      expect(screenText).toContain('Related heir: Adopted Child');
      expect(pdfText).toContain('Related heir: Adopted Child');
    });

    it('uses the same heading on both surfaces', () => {
      const { screenText, pdfText } = bothSurfaces();
      expect(screenText).toContain('Manual Review Required');
      expect(pdfText).toContain('Manual Review Required');
    });
  });

  // The journey step selectors must not move: these testids are what the
  // browser gates and ResultsView.test.tsx reach the panel by.
  describe('journey selectors', () => {
    it('keeps warnings-panel and warning-card-0 for a single warning', () => {
      renderWarnings({ warnings: [createFlag()], shares: [] });
      expect(screen.getByTestId('warnings-panel')).toBeInTheDocument();
      expect(screen.getByTestId('warning-card-0')).toBeInTheDocument();
    });

    it('renders an empty warnings-panel for the seeded journey case shape', () => {
      // The seeded Alpha case emits zero warnings, so this is the state the
      // results-view screenshot captures — unchanged by this plan.
      renderWarnings({ warnings: [], shares: [] });
      const panel = screen.getByTestId('warnings-panel');
      expect(panel).toBeInTheDocument();
      expect(panel.textContent).toBe('');
    });
  });
});
