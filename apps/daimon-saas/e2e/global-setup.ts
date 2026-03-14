import { execSync } from 'child_process';

/**
 * Global setup: ensure Supabase is running before tests start.
 * Only runs when testing against local dev (USE_LOCAL_SUPABASE=true).
 */
export default async function globalSetup(): Promise<void> {
  try {
    execSync('npx supabase status', { stdio: 'pipe' });
    console.log('[global-setup] Supabase already running');
  } catch {
    console.log('[global-setup] Starting Supabase...');
    execSync('npx supabase start', { stdio: 'inherit', timeout: 120_000 });
  }
}
