/**
 * WarningsSection — the engine's warnings as they reach the exported document.
 *
 * PROVENANCE, from `.planning/phases/23-.../23-RESEARCH.md` §4. The two warning
 * payloads used below were measured by running the committed engine cases
 * `engine/examples/cases/06-testate-charity.json` and
 * `engine/examples/cases/17-adopted-child.json` through the compiled WASM
 * engine. They are the only two warning shapes any committed input reaches.
 *
 * THESE CASES EXIST BECAUSE NO BROWSER GATE CAN REACH THESE SHAPES. The seeded
 * journey case is a verbatim copy of `02-married-3lc.json`, which emits ZERO
 * warnings — a browser gate capturing it would assert warning parity over an
 * empty set and pass vacuously. The unit layer covers both shapes; gate G39
 * supplies its own warning-bearing fact set for the live layer.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ManualFlag, InheritanceShare, Money } from '../../../types';

vi.mock('@react-pdf/renderer', () => ({
  View: ({ children, style, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, style, ...props }: any) => <span {...props}>{children}</span>,
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
  },
}));

import { WarningsSection } from '../WarningsSection';

// ── Local builders ─────────────────────────────────────────────────────

function zeroMoney(): Money {
  return { centavos: 0 };
}

function flag(overrides: Partial<ManualFlag> = {}): ManualFlag {
  return {
    category: 'preterition',
    description: 'a description',
    related_heir_id: null,
    ...overrides,
  };
}

function share(overrides: Partial<InheritanceShare> = {}): InheritanceShare {
  return {
    heir_id: 'h1',
    heir_name: 'Heir One',
    heir_category: 'LegitimateChildGroup',
    inherits_by: 'OwnRight',
    represents: null,
    from_legitime: zeroMoney(),
    from_free_portion: zeroMoney(),
    from_intestate: zeroMoney(),
    total: zeroMoney(),
    legitime_fraction: '',
    legal_basis: [],
    donations_imputed: zeroMoney(),
    gross_entitlement: zeroMoney(),
    net_from_estate: zeroMoney(),
    ...overrides,
  };
}

const RA_11642_DESCRIPTION =
  'A pre-2022 adoption decree under RA 8552 raises the RA 11642 Sec. 41 retroactivity question. See .planning/LAWYER-AGENDA.md entry LAWYER-08.';
const PRETERITION_DESCRIPTION =
  'Art. 854: compulsory heir totally omitted — all institutions annulled';

describe('WarningsSection > the measured 17-adopted-child shape', () => {
  function renderIt() {
    return render(
      <WarningsSection
        warnings={[
          flag({
            category: 'RA_11642_RETROACTIVITY',
            description: RA_11642_DESCRIPTION,
            related_heir_id: 'ac1',
          }),
        ]}
        shares={[share({ heir_id: 'ac1', heir_name: 'Adopted Child' })]}
      />,
    );
  }

  it('prints the heading the results screen uses', () => {
    expect(renderIt().container.textContent).toContain('Manual Review Required');
  });

  it('prints the severity the PDF used to omit', () => {
    expect(renderIt().container.textContent).toContain('[info]');
  });

  it('prints the engine category', () => {
    expect(renderIt().container.textContent).toContain('[RA_11642_RETROACTIVITY]');
  });

  it('prints the description, including its lawyer-agenda reference', () => {
    expect(renderIt().container.textContent).toContain('LAWYER-08');
  });

  it('names the heir the flag points at, which the PDF used to drop', () => {
    expect(renderIt().container.textContent).toContain('Related heir: Adopted Child');
  });
});

describe('WarningsSection > the measured 06-testate-charity shape', () => {
  function renderIt() {
    return render(
      <WarningsSection
        warnings={[
          flag({
            category: 'preterition',
            description: PRETERITION_DESCRIPTION,
            related_heir_id: null,
          }),
        ]}
        shares={[]}
      />,
    );
  }

  it('classifies preterition as an error', () => {
    expect(renderIt().container.textContent).toContain('[error]');
  });

  it('prints the engine category', () => {
    expect(renderIt().container.textContent).toContain('[preterition]');
  });

  it('prints the description', () => {
    expect(renderIt().container.textContent).toContain('compulsory heir totally omitted');
  });

  it('prints no related-heir line when the engine named no heir', () => {
    expect(renderIt().container.textContent).not.toContain('Related heir:');
  });
});

describe('WarningsSection > edge shapes', () => {
  it('renders nothing at all for an empty warning set', () => {
    const { container } = render(<WarningsSection warnings={[]} shares={[share()]} />);
    expect(container.textContent).toBe('');
  });

  it('states loudly when a named heir was not awarded', () => {
    const { container } = render(
      <WarningsSection warnings={[flag({ related_heir_id: 'ghost' })]} shares={[]} />,
    );
    expect(container.textContent).toContain('UNRESOLVED HEIR ghost');
  });

  it('converts the peso sign a future engine warning might carry', () => {
    const { container } = render(
      <WarningsSection
        warnings={[flag({ description: 'Donation of ₱1,000,000 exceeds the estate.' })]}
        shares={[]}
      />,
    );
    expect(container.textContent).toContain('PHP 1,000,000');
    expect(container.textContent).not.toContain('₱');
  });
});
