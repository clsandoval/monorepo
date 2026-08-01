/**
 * Stage 2 — Router + Layout tests.
 *
 * Tests TanStack Router route tree, AppLayout navigation,
 * and page rendering for each route.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { rootRoute, publicRootRoute } from '../routes/__root';
import { indexRoute } from '../routes/index';
import { authRoute } from '../routes/auth';
import { casesNewRoute } from '../routes/cases/new';
import { caseIdRoute } from '../routes/cases/$caseId';
import { settingsRoute } from '../routes/settings/index';

// Mock supabase — share/$token imports share lib which imports supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      onAuthStateChange: vi.fn((callback: (event: string, session: null) => void) => {
        // Invoke callback immediately with no session (unauthenticated)
        setTimeout(() => callback('INITIAL_SESSION', null), 0);
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
      signInWithOtp: vi.fn(),
    },
  },
}));


// Mock the WASM bridge — /cases/new imports compute()
vi.mock('../wasm/bridge', () => ({
  compute: vi.fn().mockResolvedValue({
    per_heir_shares: [],
    narratives: [],
    computation_log: { steps: [], total_restarts: 0, final_scenario: 'I1' },
    warnings: [],
    succession_type: 'Intestate',
    scenario_code: 'I1',
  }),
}));

// Mock cases lib — /cases/$caseId imports loadCase
vi.mock('../lib/cases', () => ({
  loadCase: vi.fn().mockRejectedValue(new Error('Not found')),
  updateCaseInput: vi.fn(),
  updateCaseOutput: vi.fn(),
  createCase: vi.fn(),
  listCases: vi.fn().mockResolvedValue([]),
  deleteCase: vi.fn(),
  isValidStatusTransition: vi.fn(),
  updateCaseStatus: vi.fn(),
}));

// Mock organizations lib — settings route uses useOrganization
vi.mock('../lib/organizations', () => ({
  getUserOrganization: vi.fn().mockResolvedValue(null),
  listMembers: vi.fn().mockResolvedValue([]),
  inviteMember: vi.fn(),
  removeMember: vi.fn(),
  updateMemberRole: vi.fn(),
  revokeInvitation: vi.fn(),
}));

// Mock firm-profile lib — settings route uses FirmProfileProvider
vi.mock('../lib/firm-profile', () => ({
  defaultFirmProfile: vi.fn(() => ({
    firmName: null,
    firmAddress: null,
    firmPhone: null,
    firmEmail: null,
    counselName: null,
    counselEmail: null,
    counselPhone: null,
    ibpRollNo: null,
    ptrNo: null,
    mcleComplianceNo: null,
    logoUrl: null,
    letterheadColor: '#1E3A5F',
    secondaryColor: '#C9A84C',
  })),
  loadFirmProfile: vi.fn().mockResolvedValue({
    firmName: null,
    firmAddress: null,
    firmPhone: null,
    firmEmail: null,
    counselName: null,
    counselEmail: null,
    counselPhone: null,
    ibpRollNo: null,
    ptrNo: null,
    mcleComplianceNo: null,
    logoUrl: null,
    letterheadColor: '#1E3A5F',
    secondaryColor: '#C9A84C',
  }),
  saveFirmProfile: vi.fn(),
  uploadLogo: vi.fn(),
  deleteLogo: vi.fn(),
  validateLogoFile: vi.fn(),
  ALLOWED_LOGO_TYPES: ['image/png', 'image/jpeg', 'image/svg+xml'],
  MAX_LOGO_SIZE_BYTES: 2 * 1024 * 1024,
  DEFAULT_LETTERHEAD_COLOR: '#1E3A5F',
  DEFAULT_SECONDARY_COLOR: '#C9A84C',
}));

// ---------------------------------------------------------------------------
// Test helper: render a route with memory history
// ---------------------------------------------------------------------------

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicRootRoute.addChildren([authRoute]),
  casesNewRoute,
  caseIdRoute,
  settingsRoute,
]);

async function renderRoute(path: string) {
  const memoryHistory = createMemoryHistory({ initialEntries: [path] });
  const testRouter = createRouter({ routeTree, history: memoryHistory });

  const result = render(<RouterProvider router={testRouter} />);

  // Wait for the router to finish loading (TanStack Router is async)
  await waitFor(() => {
    expect(testRouter.state.status).toBe('idle');
  });

  return result;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('router > root layout', () => {
  it('renders layout with sidebar navigation links', async () => {
    await renderRoute('/');

    // Unauthenticated: sidebar shows only "Sign In"; full nav is hidden
    expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the app branding in sidebar', async () => {
    await renderRoute('/');

    expect(screen.getAllByText('Inheritance').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Philippine Succession Law').length).toBeGreaterThanOrEqual(1);
  });
});

describe('router > index route (/)', () => {
  it('renders the dashboard page at /', async () => {
    await renderRoute('/');

    // Unauthenticated state shows the landing hero
    const main = document.querySelector('main') ?? document.body;
    expect(main.innerHTML.length).toBeGreaterThan(0);
    expect(screen.getByText(/Estate Distribution/i)).toBeInTheDocument();
  });

  it('shows hero content on dashboard when unauthenticated', async () => {
    await renderRoute('/');

    expect(
      screen.getByText(/Compute inheritance shares instantly/i),
    ).toBeInTheDocument();
  });
});

describe('router > /cases/new renders wizard', () => {
  it('redirects /cases/new to sign-in when unauthenticated', async () => {
    await renderRoute('/cases/new');

    // Unauthenticated: beforeLoad throws redirect to /auth
    await waitFor(() => {
      expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('router > /auth renders login page', () => {
  it('renders the sign-in card at /auth', async () => {
    await renderRoute('/auth');

    expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/sign in to save cases and access premium features/i),
    ).toBeInTheDocument();
  });
});

describe('router > /cases/:caseId renders case editor', () => {
  it('redirects /cases/:caseId to sign-in when unauthenticated', async () => {
    await renderRoute('/cases/case-42');

    // Unauthenticated: beforeLoad throws redirect to /auth
    await waitFor(() => {
      expect(screen.getByText(/sign in to save cases and access premium features/i)).toBeInTheDocument();
    });
  });
});

describe('router > authenticated routes show sign-in prompt', () => {
  it('/settings renders sign-in prompt when unauthenticated', async () => {
    await renderRoute('/settings');

    // "Settings" appears in the page heading
    expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/sign in to manage your firm settings/i)).toBeInTheDocument();
  });
});

describe('layout > navigation structure', () => {
  it('sidebar shows sign-in link when unauthenticated', async () => {
    await renderRoute('/');

    const sidebar = document.querySelector('aside nav');
    expect(sidebar).toBeTruthy();
    const links = sidebar!.querySelectorAll('a');
    // Unauthenticated sidebar shows only "Sign In"
    expect(links).toHaveLength(1);
  });

  it('sign-in link points to /auth', async () => {
    await renderRoute('/');

    const sidebar = document.querySelector('aside nav');
    expect(sidebar).toBeTruthy();
    const links = Array.from(sidebar!.querySelectorAll('a'));
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('/auth?mode=signin&redirect=');
  });
});
