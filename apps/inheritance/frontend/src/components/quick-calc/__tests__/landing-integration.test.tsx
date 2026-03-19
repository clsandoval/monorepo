import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useAuth to return no user
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

// Mock TanStack Router
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    createRoute: vi.fn(() => ({})),
    Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// Mock WASM
vi.mock('@/wasm/bridge', () => ({
  computeWasm: vi.fn(),
}));

describe('Landing page (unauthenticated)', () => {
  it('renders quick calc widget instead of old CTAs', async () => {
    const { DashboardPage } = await import('@/routes/index');
    render(<DashboardPage />);
    expect(screen.getByPlaceholderText(/estate/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Heir/i)).toBeInTheDocument();
    expect(screen.queryByText('try without an account')).not.toBeInTheDocument();
  });

  it('still renders feature cards', async () => {
    const { DashboardPage } = await import('@/routes/index');
    render(<DashboardPage />);
    expect(screen.getByText('All Succession Types')).toBeInTheDocument();
    expect(screen.getByText('Full Family Tree')).toBeInTheDocument();
    expect(screen.getByText('Professional PDF')).toBeInTheDocument();
  });
});
