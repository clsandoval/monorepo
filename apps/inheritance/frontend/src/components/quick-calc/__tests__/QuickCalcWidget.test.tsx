import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickCalcWidget } from '../QuickCalcWidget';

// Mock the WASM compute
vi.mock('@/wasm/bridge', () => ({
  computeWasm: vi.fn().mockResolvedValue({
    per_heir_shares: [{
      heir_id: '0', heir_name: 'Spouse', heir_category: 'SurvivingSpouseGroup',
      inherits_by: 'OwnRight', represents: null,
      from_legitime: { centavos: 0 }, from_free_portion: { centavos: 0 },
      from_intestate: { centavos: 50000000 }, total: { centavos: 50000000 },
      legitime_fraction: '1/2', legal_basis: [],
      donations_imputed: { centavos: 0 }, gross_entitlement: { centavos: 50000000 },
      net_from_estate: { centavos: 50000000 },
    }],
    narratives: [],
    computation_log: { steps: [], total_restarts: 0, final_scenario: 'I1' },
    warnings: [],
    succession_type: 'Intestate',
    scenario_code: 'I1',
  }),
}));

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

beforeEach(() => {
  sessionStorage.clear();
});

describe('QuickCalcWidget', () => {
  it('renders estate input and add heir button', () => {
    render(<QuickCalcWidget />);
    expect(screen.getByPlaceholderText(/estate/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Heir/i)).toBeInTheDocument();
  });

  it('calculate button is disabled with no heirs', () => {
    render(<QuickCalcWidget />);
    const calcBtn = screen.getByRole('button', { name: /Calculate/i });
    expect(calcBtn).toBeDisabled();
  });

  it('can add an heir chip', async () => {
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText(/Surviving Spouse/i));
    // Chip label for singleton spouse is just "Surviving Spouse"
    const chips = screen.getAllByText(/Surviving Spouse/i);
    expect(chips.length).toBeGreaterThanOrEqual(1);
  });

  it('can remove an heir chip', async () => {
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    // Add a legitimate child (non-singleton, so chip text is unique: "Legitimate Child 1")
    await user.click(screen.getByText(/Add Heir/i));
    // Use exact match to avoid matching "Illegitimate Child"
    await user.click(screen.getByText('Legitimate Child'));
    expect(screen.getByText('Legitimate Child 1')).toBeInTheDocument();
    // Click the X button on the chip
    const removeBtn = screen.getByText('Legitimate Child 1').parentElement!.querySelector('button')!;
    await user.click(removeBtn);
    expect(screen.queryByText('Legitimate Child 1')).not.toBeInTheDocument();
  });

  it('disables singleton heir types after adding once', async () => {
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    // Add a non-singleton first to avoid text collision: add Father
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText('Father'));
    // Open dropdown again — Father should be disabled
    await user.click(screen.getByText(/Add Heir/i));
    const dropdownOptions = document.querySelectorAll('[class*="popover"] button, .absolute button');
    const fatherOption = Array.from(dropdownOptions).find(el => el.textContent === 'Father');
    expect(fatherOption).toBeTruthy();
    expect((fatherOption as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows results after successful calculation', async () => {
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    // Enter estate amount
    const input = screen.getByPlaceholderText(/estate/i);
    await user.type(input, '1000000');
    // Add heir
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText(/Surviving Spouse/i));
    // Calculate
    await user.click(screen.getByRole('button', { name: /Calculate/i }));
    await waitFor(() => {
      expect(screen.getByText('Spouse')).toBeInTheDocument();
    });
  });

  it('shows error message when WASM fails to load', async () => {
    const { computeWasm } = await import('@/wasm/bridge');
    vi.mocked(computeWasm).mockRejectedValueOnce(new Error('WASM load failed'));
    const user = userEvent.setup();
    render(<QuickCalcWidget />);
    const input = screen.getByPlaceholderText(/estate/i);
    await user.type(input, '1000000');
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText('Father'));
    await user.click(screen.getByRole('button', { name: /Calculate/i }));
    await waitFor(() => {
      expect(screen.getByText(/Unable to load calculator/i)).toBeInTheDocument();
    });
    // Failed calc should NOT set the session gate
    expect(sessionStorage.getItem('quick-calc-used')).toBeNull();
  });

  it('blocks second calculation with session gate', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('quick-calc-used', 'true');
    render(<QuickCalcWidget />);
    const input = screen.getByPlaceholderText(/estate/i);
    await user.type(input, '1000000');
    await user.click(screen.getByText(/Add Heir/i));
    await user.click(screen.getByText(/Surviving Spouse/i));
    await user.click(screen.getByRole('button', { name: /Calculate/i }));
    await waitFor(() => {
      expect(screen.getByText(/Create an account for unlimited/i)).toBeInTheDocument();
    });
  });
});
