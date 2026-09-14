/**
 * Tests for the supabase client module (src/lib/supabase.ts).
 *
 * Source of truth: since 27fcaeba4 ("platform: stage 1 - foundation —
 * supabase graceful config"), missing env vars no longer throw at import
 * time. The module instead exports `supabaseConfigured = false` and a null
 * client, and callers must guard on `supabaseConfigured` before use. These
 * tests prove that missing-env detection still fires (the original intent)
 * under the graceful-guard contract.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/supabase-js before importing the module under test
const mockSupabaseClient = {
  auth: { getUser: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn(), onAuthStateChange: vi.fn() },
  from: vi.fn().mockReturnValue({ select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn() }),
  storage: { from: vi.fn() },
  rpc: vi.fn(),
};

const createClientMock = vi.fn(() => mockSupabaseClient);

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

describe('supabase client', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    createClientMock.mockClear();
  });

  it('reports unconfigured (null client, no createClient call) if VITE_SUPABASE_URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

    // Reset module cache so it re-evaluates
    vi.resetModules();

    const mod = await import('../supabase');
    expect(mod.supabaseConfigured).toBe(false);
    expect(mod.supabase).toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('reports unconfigured (null client, no createClient call) if VITE_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    vi.resetModules();

    const mod = await import('../supabase');
    expect(mod.supabaseConfigured).toBe(false);
    expect(mod.supabase).toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('creates the client and reports configured when both env vars are present', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

    vi.resetModules();

    const mod = await import('../supabase');
    expect(mod.supabaseConfigured).toBe(true);
    expect(mod.supabase).toBe(mockSupabaseClient);
    expect(createClientMock).toHaveBeenCalledWith('http://localhost:54321', 'test-anon-key');
  });
});
