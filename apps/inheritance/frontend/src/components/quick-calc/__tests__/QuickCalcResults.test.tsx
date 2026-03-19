import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickCalcResults } from '../QuickCalcResults';
import type { EngineOutput, InheritanceShare, Money, EffectiveCategory } from '@/types';

// Mock TanStack Router (QuickCalcResults uses Link)
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

function makeMoney(pesos: number): Money {
  return { centavos: pesos * 100 };
}

function makeShare(name: string, category: EffectiveCategory, total: Money): InheritanceShare {
  return {
    heir_id: `id-${name}`,
    heir_name: name,
    heir_category: category,
    inherits_by: 'OwnRight' as const,
    represents: null,
    from_legitime: makeMoney(0),
    from_free_portion: makeMoney(0),
    from_intestate: total,
    total,
    legitime_fraction: '0/1',
    legal_basis: [],
    donations_imputed: makeMoney(0),
    gross_entitlement: total,
    net_from_estate: total,
  };
}

const mockOutput: EngineOutput = {
  per_heir_shares: [
    makeShare('Spouse', 'SurvivingSpouseGroup', makeMoney(500_000)),
    makeShare('Child 1', 'LegitimateChildGroup', makeMoney(500_000)),
  ],
  narratives: [
    { heir_id: 'id-Spouse', heir_name: 'Spouse', heir_category_label: 'Surviving Spouse', text: 'Spouse gets half.' },
    { heir_id: 'id-Child 1', heir_name: 'Child 1', heir_category_label: 'Legitimate Child', text: 'Child gets half.' },
  ],
  computation_log: { steps: [{ step_number: 1, step_name: 'Init', description: 'test' }], total_restarts: 0, final_scenario: 'I3' },
  warnings: [],
  succession_type: 'Intestate',
  scenario_code: 'I3' as any,
};

describe('QuickCalcResults', () => {
  it('renders heir names and amounts in visible section', () => {
    render(<QuickCalcResults output={mockOutput} estateCentavos={1_000_000_00} />);
    expect(screen.getByText('Spouse')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('renders succession type badge', () => {
    render(<QuickCalcResults output={mockOutput} estateCentavos={1_000_000_00} />);
    expect(screen.getByText(/Intestate/)).toBeInTheDocument();
  });

  it('renders signup CTA in blurred section', () => {
    render(<QuickCalcResults output={mockOutput} estateCentavos={1_000_000_00} />);
    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
  });

  it('renders blurred overlay container', () => {
    render(<QuickCalcResults output={mockOutput} estateCentavos={1_000_000_00} />);
    const blurred = document.querySelector('[data-testid="blur-overlay"]');
    expect(blurred).toBeInTheDocument();
  });
});
